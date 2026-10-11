#!/usr/bin/env node
// Loads db/init/*.sql onto a remote MySQL instance (a shared cloud
// database the whole team points at, e.g. Aiven's free tier) — the
// equivalent of what docker-entrypoint-initdb.d does automatically for
// a local container, which doesn't apply once MySQL isn't local anymore.
//
// Run this ONCE, by whoever provisioned the shared database. Everyone
// else just fills in the same DB_* values in their own .env and runs
// `npm run dev:app-only` — they never run this script.
//
// Safe to re-run (the .sql files use CREATE ... IF NOT EXISTS / DROP
// TABLE IF EXISTS guards) but re-running wipes and reseeds the app
// tables (users/sessions/payments) back to empty — coordinate with the
// team first if the shared DB already has real registrations on it.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import mysql from "mysql2/promise";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnvFile(file) {
  const filePath = path.join(root, file);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env");

const HOST = process.env.DB_HOST;
const PORT = Number(process.env.DB_PORT ?? 3306);
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const NAME = process.env.DB_NAME;
const CA_PATH = process.env.DB_SSL_CA_PATH;

if (!HOST || HOST === "127.0.0.1" || HOST === "localhost") {
  console.error(
    "\n✖ DB_HOST in .env is still local (127.0.0.1/localhost).\n" +
      "  Point .env at your shared MySQL instance's host first (e.g. the one\n" +
      "  Aiven gave you), then re-run this script.\n",
  );
  process.exit(1);
}
if (!CA_PATH) {
  console.warn(
    "⚠ DB_SSL_CA_PATH isn't set in .env — most managed MySQL providers (Aiven included)\n" +
      "  require TLS and will refuse the connection without it. Continuing anyway…\n",
  );
}

async function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

const INIT_FILES = ["01_catalog_schema.sql", "02_catalog_seed.sql", "03_app_schema.sql", "04_app_seed.sql"];

async function main() {
  console.log(`This will load the schema onto ${USER}@${HOST}:${PORT}/${NAME ?? "(default)"}.`);
  const ok = await confirm("If that database already has real registrations, this resets them. Continue? [y/N] ");
  if (!ok) {
    console.log("Cancelled.");
    return;
  }

  const conn = await mysql.createConnection({
    host: HOST,
    port: PORT,
    user: USER,
    password: PASSWORD,
    ssl: CA_PATH ? { ca: readFileSync(CA_PATH, "utf8"), rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  });

  try {
    // No database selected on this connection on purpose — 01_catalog_schema.sql
    // itself runs CREATE DATABASE IF NOT EXISTS campusmobi + USE campusmobi,
    // same as it does for the local Docker container.
    const initDir = path.join(root, "db", "init");
    for (const file of INIT_FILES) {
      console.log(`→ Running db/init/${file}…`);
      await conn.query(readFileSync(path.join(initDir, file), "utf8"));
    }
    console.log(
      `\n✓ Shared database ready. Send teammates the DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME\n` +
        `  values from your .env, plus the CA certificate file, and have them run \`npm run dev:app-only\`.`,
    );
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(`\n✖ Failed: ${e.message}`);
  process.exit(1);
});

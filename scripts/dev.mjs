#!/usr/bin/env node
// `npm run dev` entry point: loads .env into process.env, starts the
// MySQL container via Docker Compose (creating it on first run — which
// auto-loads db/init/*.sql — or just starting it if it already exists),
// waits for it to report healthy, then hands off to the Vite dev server.
// Use `npm run dev:app-only` instead if you're pointing at a MySQL
// server you're managing yourself (skips the Docker step entirely).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skipDocker = process.argv.includes("--app-only");

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

// .env (if the person made one) takes priority; .env.example supplies
// the same defaults docker-compose.yml uses out of the box.
loadEnvFile(".env");
loadEnvFile(".env.example");

process.env.DB_HOST ??= "127.0.0.1";
process.env.DB_PORT ??= "3306";
process.env.DB_USER ??= "campusmobi";
process.env.DB_PASSWORD ??= "campusmobi";
process.env.DB_NAME ??= "campusmobi";

function dockerCompose(args) {
  return spawnSync("docker", ["compose", ...args], { cwd: root, encoding: "utf8" });
}

async function waitForHealthy(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = dockerCompose(["ps", "--format", "json", "db"]);
    if (result.stdout) {
      try {
        const line = result.stdout.trim().split("\n").at(-1);
        const status = JSON.parse(line);
        if (status.Health === "healthy") return true;
      } catch {
        // ignore parse errors while the container is still starting
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  if (skipDocker) {
    console.log(`→ Skipping Docker — checking MySQL is reachable on ${process.env.DB_HOST}:${process.env.DB_PORT} yourself.`);
  } else {
    const check = spawnSync("docker", ["info"], { stdio: "ignore" });
    if (check.status !== 0) {
      console.error(
        "\n✖ Docker doesn't seem to be running.\n" +
          "  Start Docker Desktop, or run `npm run dev:app-only` to skip Docker\n" +
          "  and point the app at a MySQL server you're managing yourself.\n",
      );
      process.exit(1);
    }

    console.log("→ Starting the MySQL container (docker compose up -d db)…");
    const up = dockerCompose(["up", "-d", "db"]);
    if (up.status !== 0) {
      console.error(up.stderr || up.stdout);
      process.exit(1);
    }

    console.log("→ Waiting for MySQL to report healthy (first run also loads db/init/*.sql — can take a minute)…");
    const healthy = await waitForHealthy(90_000);
    if (!healthy) {
      console.error("\n✖ MySQL didn't become healthy in time. Check `docker compose logs db`.\n");
      process.exit(1);
    }
    console.log("✓ MySQL is up.\n");
  }

  const vite = spawn("npx", ["vite", "dev"], { stdio: "inherit", cwd: root, env: process.env, shell: true });
  vite.on("exit", (code) => process.exit(code ?? 0));
  const forward = (signal) => vite.kill(signal);
  process.on("SIGINT", () => forward("SIGINT"));
  process.on("SIGTERM", () => forward("SIGTERM"));
}

main();

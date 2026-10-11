// MySQL database access — a local Docker container (docker-compose.yml)
// for solo dev, or a shared cloud MySQL instance (e.g. Aiven's free
// tier) when DB_SSL_CA_PATH is set, so the whole team hits the same
// database and the same login works on everyone's machine. Schema and
// seed data (the real WSU Faculty of Natural Sciences catalog, roster,
// timetable) live entirely in db/init/*.sql — this file only ever
// *connects*, it never creates or seeds tables. See scripts/db-remote-init.mjs
// for loading that schema onto a shared/remote instance.
//
// A thin `prepare(sql).get/all/run(...)` shim below mirrors the previous
// better-sqlite3 call shape so the rest of the app (auth.server.ts,
// campus.functions.ts) only needed `await` added at each call site,
// not a line-by-line rewrite.
import mysql, { type ResultSetHeader } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

// Local Docker MySQL has no TLS listener, so SSL stays off unless a CA
// certificate is configured — which is exactly the case for a managed
// provider like Aiven, where it's required. Point DB_SSL_CA_PATH at the
// .pem file you downloaded from the provider's console.
const sslCaPath = process.env["DB_SSL_CA_PATH"];
const ssl = sslCaPath ? { ca: readFileSync(sslCaPath, "utf8"), rejectUnauthorized: true } : undefined;

const pool = mysql.createPool({
  host: process.env["DB_HOST"] ?? "127.0.0.1",
  port: Number(process.env["DB_PORT"] ?? 3306),
  user: process.env["DB_USER"] ?? "campusmobi",
  password: process.env["DB_PASSWORD"] ?? "campusmobi",
  database: process.env["DB_NAME"] ?? "campusmobi",
  waitForConnections: true,
  connectionLimit: 10,
  ssl,
  // TIMESTAMP/DATETIME columns come back as plain strings rather than JS
  // Date objects, matching what SQLite's TEXT columns returned before —
  // the type-level `string` contracts elsewhere in the app stay accurate.
  dateStrings: true,
});

// The shim itself: prepare(sql) returns an object with .get/.all/.run,
// each of which actually runs the query via the pool. `params` are always
// passed separately from `sql` to pool.execute() — this is what makes
// every query in the app a parameterised/prepared statement, immune to
// SQL injection, even though the call sites (campus.functions.ts) never
// have to think about it explicitly.
function prepare(sql: string) {
  return {
    // For a query expected to return at most one row (e.g. "find this
    // user by id") — returns the first row, or undefined if there were none.
    async get(...params: unknown[]) {
      const [rows] = await pool.execute(sql, params as never[]);
      return (rows as Record<string, unknown>[])[0];
    },
    // For a query expected to return many rows (e.g. "list all payments
    // for this user") — returns the full array, possibly empty.
    async all(...params: unknown[]) {
      const [rows] = await pool.execute(sql, params as never[]);
      return rows as Record<string, unknown>[];
    },
    // For INSERT/UPDATE/DELETE — mysql2 returns a ResultSetHeader (not
    // rows) for these; `changes` (renamed from affectedRows) is how
    // callers check "did this actually match/update anything" (e.g. the
    // ownership checks in campus.functions.ts's payment handlers).
    async run(...params: unknown[]) {
      const [result] = await pool.execute(sql, params as never[]);
      const header = result as ResultSetHeader;
      return { changes: header.affectedRows, lastInsertRowid: header.insertId };
    },
  };
}

// The public interface every other backend file imports: `db.prepare(sql)`.
export const db = { prepare };
// Re-exported so files that already import from db.server (most handlers
// do, for `db` itself) don't also need a separate node:crypto import just
// for generating a new row's id.
export { randomUUID };

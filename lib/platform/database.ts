import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import type { GameDatabaseConfig, GameManifest } from "@/lib/platform/game-types";

type DatabaseClient = NeonQueryFunction<false, false>;

let databaseClient: DatabaseClient | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to use Neon-backed game data.");
  }

  databaseClient ??= neon(databaseUrl);

  return databaseClient;
}

export function getGameDatabaseConfig(game: GameManifest) {
  return game.database ?? null;
}

export function assertGameDatabaseConfig(game: GameManifest) {
  const config = getGameDatabaseConfig(game);

  if (!config) {
    throw new Error(`${game.id} does not declare a Neon table.`);
  }

  return config;
}

export function getEscapedGameTableName(config: GameDatabaseConfig) {
  if (config.provider !== "neon") {
    throw new Error(`Unsupported database provider: ${config.provider}`);
  }

  assertValidTableName(config.tableName);

  return escapeSqlIdentifier(config.tableName);
}

export async function readGameTableRows<Row extends Record<string, unknown>>(
  config: GameDatabaseConfig,
  options: { limit?: number } = {},
) {
  const sql = getDatabase();
  const tableName = getEscapedGameTableName(config);
  const limit = clampLimit(options.limit ?? 100);

  return sql.query(`select * from ${tableName} limit $1`, [limit]) as Promise<
    Row[]
  >;
}

export async function insertGameTableRow<Row extends Record<string, unknown>>(
  config: GameDatabaseConfig,
  row: Row,
) {
  assertGameCanWrite(config);

  const entries = Object.entries(row);

  if (entries.length === 0) {
    throw new Error("Cannot insert an empty row.");
  }

  const sql = getDatabase();
  const tableName = getEscapedGameTableName(config);
  const columns = entries
    .map(([columnName]) => {
      assertValidColumnName(columnName);
      return escapeSqlIdentifier(columnName);
    })
    .join(", ");
  const placeholders = entries.map((_, index) => `$${index + 1}`).join(", ");
  const values = entries.map(([, value]) => value);

  await sql.query(`insert into ${tableName} (${columns}) values (${placeholders})`, values);
}

export function assertGameCanWrite(config: GameDatabaseConfig) {
  if (config.access !== "read-write") {
    throw new Error(`${config.tableName} is declared as read-only.`);
  }
}

function assertValidTableName(tableName: string) {
  if (!/^[a-z][a-z0-9_]*$/.test(tableName)) {
    throw new Error(
      `Invalid game table name "${tableName}". Use lowercase snake_case names.`,
    );
  }
}

function assertValidColumnName(columnName: string) {
  if (!/^[a-z][a-z0-9_]*$/.test(columnName)) {
    throw new Error(
      `Invalid game column name "${columnName}". Use lowercase snake_case names.`,
    );
  }
}

function escapeSqlIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function clampLimit(limit: number) {
  if (!Number.isFinite(limit)) {
    return 100;
  }

  return Math.max(1, Math.min(Math.floor(limit), 500));
}

-- Optional Neon table for this game.
-- Keep the table name aligned with manifest.database.tableName.

create table if not exists mi_juego (
  id text primary key,
  prompt text not null,
  created_at timestamptz not null default now()
);

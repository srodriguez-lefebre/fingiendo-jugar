create table if not exists impostor (
  id bigint generated always as identity primary key,
  category_id text not null,
  category_name text not null,
  word text not null,
  clue text not null,
  created_at timestamptz not null default now(),
  unique (category_id, word)
);

create index if not exists impostor_category_id_idx on impostor (category_id);

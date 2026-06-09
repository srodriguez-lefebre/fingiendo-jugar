create table if not exists contrarreloj (
  id bigserial primary key,
  phrase text not null,
  created_at timestamptz not null default now()
);

create index if not exists contrarreloj_phrase_idx on contrarreloj (phrase);

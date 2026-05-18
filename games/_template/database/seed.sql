-- Optional seed data for this game's Neon table.

insert into mi_juego (id, prompt)
values
  ('example-1', 'Fila de ejemplo')
on conflict (id) do nothing;

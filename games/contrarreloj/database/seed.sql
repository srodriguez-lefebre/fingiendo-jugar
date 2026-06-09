insert into contrarreloj (phrase)
select phrase
from (
  values
    ('Mate'),
    ('Chivito'),
    ('Punta del Este'),
    ('Luis Suárez'),
    ('Lionel Messi'),
    ('Shrek'),
    ('Hakuna Matata'),
    ('Celular'),
    ('WhatsApp'),
    ('Netflix'),
    ('Torre Eiffel'),
    ('Mundial de fútbol'),
    ('Pizza'),
    ('Pingüino'),
    ('Luna de miel'),
    ('Estornudar'),
    ('Paraguas'),
    ('Shakira'),
    ('Batman'),
    ('Ta')
) as seed(phrase)
where not exists (
  select 1
  from contrarreloj
  where contrarreloj.phrase = seed.phrase
);

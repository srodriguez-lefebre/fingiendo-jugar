insert into contrarreloj (phrase)
values
    ('Mate'),
    ('Chivito'),
    ('Punta del Este'),
    (U&'Luis Su\00E1rez'),
    ('Lionel Messi'),
    ('Shrek'),
    ('Hakuna Matata'),
    ('Celular'),
    ('WhatsApp'),
    ('Netflix'),
    ('Torre Eiffel'),
    (U&'Mundial de f\00FAtbol'),
    ('Pizza'),
    (U&'Ping\00FCino'),
    ('Luna de miel'),
    ('Estornudar'),
    ('Paraguas'),
    ('Shakira'),
    ('Batman'),
    ('Ta')
on conflict (phrase) do nothing;

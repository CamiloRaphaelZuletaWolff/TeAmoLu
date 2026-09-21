-- te amo lu: cartas especiales persistentes, independientes de las cartas normales.
-- Ejecutar una vez en Supabase > SQL Editor. Se puede repetir sin sobrescribir textos.
-- Mantiene el modo de edicion sin login solicitado para esta app.
begin;

create table if not exists public.cartas_especiales (
  id uuid primary key default gen_random_uuid(),
  clave text unique,
  fecha date not null check (fecha between date '0001-01-01' and date '9999-12-31'),
  tema text not null default 'amor' check (tema in ('girasoles','cumpleanos','halloween','navidad','amor')),
  titulo text not null check (char_length(btrim(titulo)) between 1 and 140),
  subtitulo text not null default '' check (char_length(subtitulo) <= 200),
  contenido text not null check (char_length(btrim(contenido)) between 1 and 20000),
  autor text not null default 'Toto' check (char_length(btrim(autor)) between 1 and 100),
  created_at timestamptz not null default now()
);
create index if not exists cartas_especiales_fecha_idx on public.cartas_especiales (fecha desc);
alter table public.cartas_especiales enable row level security;
grant select, insert, update, delete on public.cartas_especiales to anon, authenticated;
drop policy if exists "cartas especiales edicion abierta" on public.cartas_especiales;
create policy "cartas especiales edicion abierta" on public.cartas_especiales
  for all to anon, authenticated using (true) with check (true);

-- La coleccion publica se calcula con el reloj del servidor, no con el dispositivo.
-- Solo hay fecha de inicio: nunca caduca ni se oculta al terminar el dia o el anio.
-- El editor lee la tabla completa para personalizar tambien las fechas futuras.
create or replace function public.leer_cartas_especiales()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $function$
  select jsonb_build_object(
    'ahora', now(),
    'cartas', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.fecha desc, c.id)
      from public.cartas_especiales c
      where c.fecha <= (now() at time zone 'America/La_Paz')::date
    ), '[]'::jsonb)
  );
$function$;
revoke all on function public.leer_cartas_especiales() from public;
grant execute on function public.leer_cartas_especiales() to anon, authenticated;

-- Las cuatro ocasiones de 2026. ON CONFLICT conserva cualquier personalizacion.
insert into public.cartas_especiales (id, clave, fecha, tema, titulo, subtitulo, contenido, autor)
values
('20260921-0000-4000-8000-000000000001', 'girasoles-2026', '2026-09-21', 'girasoles', 'Todos los girasoles para ti', '21 de septiembre · Flores amarillas para mi Lu', 'Lu,

Hoy, 21 de septiembre, quería regalarte un pedacito de sol. Así que llené este lugar de girasoles, uno por cada sonrisa que me regalas.

Dicen que los girasoles buscan la luz. Yo, sin darme cuenta, siempre te busco a ti.

Que nunca te falten flores amarillas, días bonitos y este amor que tengo tantas ganas de seguir cuidando contigo.

Feliz 21 de septiembre, mi amor. Tú haces florecer mis días.', 'Toto'),
('20261014-0000-4000-8000-000000000002', 'cumpleanos-lu-2026', '2026-10-14', 'cumpleanos', 'El día que nació mi persona favorita', '14 de octubre · Feliz cumpleaños, Lu', 'Mi Lu,

Hoy celebro que existes. Tu risa, tus ocurrencias, tu forma tan tuya de hacer más bonito el mundo.

Ojalá este nuevo año te traiga sueños cumplidos, abrazos largos y muchísimas razones para sonreír. Yo quiero estar cerquita para celebrar cada una contigo.

Pide un deseo. El mío es seguir compartiendo la vida contigo.

Feliz cumpleaños, mi amor.', 'Toto'),
('20261031-0000-4000-8000-000000000003', 'halloween-2026', '2026-10-31', 'halloween', 'Contigo, hasta los sustos son bonitos', '31 de octubre · Nuestro pequeño hechizo', 'Lu,

Entre fantasmitas, calabazas y noches de películas, hay algo que tengo clarísimo: mi hechizo favorito fue coincidir contigo.

Si hay sustos, te doy la mano. Si hay dulces, compartimos. Y si hay que elegir compañía para una noche de Halloween, siempre te elijo a ti.

Te quiero de aquí a la luna, con un poquito de magia y muchísimos abrazos.', 'Toto'),
('20261225-0000-4000-8000-000000000004', 'navidad-2026', '2026-12-25', 'navidad', 'Mi regalo favorito eres tú', '25 de diciembre · Una Navidad contigo', 'Mi amor,

Esta Navidad no necesito un regalo enorme. Me basta con tus abrazos, nuestras risas y la ilusión de todo lo que todavía nos espera.

Gracias por hacer que un lugar cualquiera se sienta como casa cuando estás tú.

Que nunca nos falten motivos para celebrar, ganas de cuidarnos y un ratito para estar juntos.

Feliz Navidad, Lu. Mi regalo favorito es tenerte en mi vida.', 'Toto')
on conflict (clave) do nothing;

commit;

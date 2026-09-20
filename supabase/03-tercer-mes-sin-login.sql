-- te amo lu · edición abierta temporal, solicitada por Toto.
-- Ejecutar después de 01-esquema.sql y 02-storage.sql.
-- Lectura y escritura sin login: cualquiera con el enlace puede modificar el álbum.
-- No elimina los recuerdos existentes ni necesita claves secretas en la app.
begin;

create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default 'Toto y Lu',
  descripcion text,
  fecha date not null default ((now() at time zone 'America/La_Paz')::date),
  imagen_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists fotos_fecha_idx on public.fotos (created_at desc);
alter table public.fotos enable row level security;
alter table public.momentos alter column fecha set default ((now() at time zone 'America/La_Paz')::date);

-- Solo estas tablas de la aplicación; se conserva RLS para restaurar Auth después.
do $$
declare nombre text;
begin
  foreach nombre in array array['config','momentos','cartas','fotos'] loop
    execute format('alter table public.%I enable row level security', nombre);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', nombre);
    execute format('drop policy if exists %I on public.%I', nombre || ' edicion sin login', nombre);
    execute format('create policy %I on public.%I for all to anon, authenticated using (true) with check (true)', nombre || ' edicion sin login', nombre);
  end loop;
end $$;

drop policy if exists "album fotos sin login" on storage.objects;
create policy "album fotos sin login" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'momentos')
  with check (bucket_id = 'momentos');

insert into public.config (id,nombre_uno,nombre_dos,fecha_inicio,frase)
values (1,'Toto','Lu','2026-06-20T00:00:00-04:00','Tres meses contigo y ya no sé contar de otra forma.')
on conflict (id) do update set
  nombre_uno = excluded.nombre_uno,
  nombre_dos = excluded.nombre_dos,
  fecha_inicio = excluded.fecha_inicio,
  frase = excluded.frase;

commit;

-- Para reintroducir Auth en el futuro, quitar las cuatro políticas
-- "edicion sin login" y "album fotos sin login", añadir una política privada
-- para fotos y restaurar el flujo de inicio de sesión del frontend.

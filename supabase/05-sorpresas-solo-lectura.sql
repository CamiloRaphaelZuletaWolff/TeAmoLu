-- Ejecutar despues del SQL 04 en Supabase > SQL Editor.
-- Cambia el acceso desde la web y actualiza la dedicatoria de girasoles.
-- Conserva el contenido de las cartas y todos los demas recuerdos.
-- Administrar sorpresas desde Table Editor o SQL Editor con tu cuenta de Supabase.
begin;

update public.cartas_especiales
set subtitulo = '21 de septiembre · Flores amarillas para mi amorcito'
where clave = 'girasoles-2026';

alter table public.cartas_especiales enable row level security;
revoke all on table public.cartas_especiales from public, anon, authenticated;
grant select on table public.cartas_especiales to anon, authenticated;

drop policy if exists "cartas especiales edicion abierta" on public.cartas_especiales;
drop policy if exists "cartas especiales publicadas" on public.cartas_especiales;
create policy "cartas especiales publicadas" on public.cartas_especiales
  for select to anon, authenticated
  using (fecha <= (now() at time zone 'America/La_Paz')::date);

-- La RPC del SQL 04 usa SECURITY INVOKER: tambien respeta esta politica.
commit;

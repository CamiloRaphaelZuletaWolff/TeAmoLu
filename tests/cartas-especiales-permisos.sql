-- Prueba de integracion: ejecutar como administrador despues de SQL 04 y 05.
-- Todas las filas de prueba se revierten al terminar.
\set ON_ERROR_STOP on
begin;
insert into public.cartas_especiales (clave, fecha, titulo, contenido)
values
  ('prueba-permisos-ayer', (now() at time zone 'America/La_Paz')::date - 1, 'Prueba ayer', 'Prueba'),
  ('prueba-permisos-hoy', (now() at time zone 'America/La_Paz')::date, 'Prueba hoy', 'Prueba'),
  ('prueba-permisos-futura', (now() at time zone 'America/La_Paz')::date + 1, 'Prueba futura', 'Prueba');

-- La zona del cliente no debe adelantar ni atrasar la publicacion.
set local timezone = 'Asia/Tokyo';
do $test$
declare
  rol text;
  visibles integer;
begin
  foreach rol in array array['anon', 'authenticated'] loop
    execute format('set local role %I', rol);
    select count(*) into visibles from public.cartas_especiales
      where clave like 'prueba-permisos-%';
    if visibles <> 2 then
      raise exception 'Lectura directa incorrecta para %: %', rol, visibles;
    end if;
    select count(*) into visibles
      from jsonb_array_elements(public.leer_cartas_especiales()->'cartas') c
      where c->>'clave' like 'prueba-permisos-%';
    if visibles <> 2 then
      raise exception 'Lectura RPC incorrecta para %: %', rol, visibles;
    end if;
    if exists (select 1 from public.cartas_especiales where clave = 'prueba-permisos-futura') then
      raise exception 'Una carta futura es visible para %', rol;
    end if;
    begin
      insert into public.cartas_especiales (fecha, titulo, contenido)
        values (current_date, 'No permitido', 'No permitido');
      raise exception 'INSERT permitido para %', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      update public.cartas_especiales set contenido = 'No permitido'
        where clave = 'prueba-permisos-hoy';
      raise exception 'UPDATE permitido para %', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      delete from public.cartas_especiales where clave = 'prueba-permisos-hoy';
      raise exception 'DELETE permitido para %', rol;
    exception when insufficient_privilege then null;
    end;
    execute 'reset role';
  end loop;

  -- El administrador conserva acceso a las cartas futuras y puede editarlas.
  update public.cartas_especiales set contenido = 'Editada desde la base de datos'
    where clave = 'prueba-permisos-futura';
  if not found then raise exception 'El administrador no pudo editar'; end if;
  delete from public.cartas_especiales where clave = 'prueba-permisos-futura';
  if not found then raise exception 'El administrador no pudo eliminar'; end if;
end;
$test$;
rollback;
\echo 'OK: fechas, RPC, bloqueo de escrituras y administracion directa.'

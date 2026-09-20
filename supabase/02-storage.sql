begin;
drop policy if exists "fotos lectura publica" on storage.objects;
create policy "fotos lectura publica" on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'momentos');

drop policy if exists "fotos subida privada" on storage.objects;
create policy "fotos subida privada" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'momentos');

drop policy if exists "fotos actualizacion privada" on storage.objects;
create policy "fotos actualizacion privada" on storage.objects for update
  to authenticated
  using (bucket_id = 'momentos');

drop policy if exists "fotos borrado privado" on storage.objects;
create policy "fotos borrado privado" on storage.objects for delete
  to authenticated
  using (bucket_id = 'momentos');

commit;

begin;
-- ============================================================
--  ESQUEMA: web de aniversario
-- ============================================================

-- 1) Configuración general (una sola fila)
create table if not exists public.config (
  id           int primary key default 1,
  nombre_uno   text not null default 'Él',
  nombre_dos   text not null default 'Ella',
  fecha_inicio timestamptz not null,
  frase        text,
  constraint config_fila_unica check (id = 1)
);

-- 2) Momentos: el timeline y la galería salen de acá
create table if not exists public.momentos (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descripcion  text,
  fecha        date not null default current_date,
  imagen_path  text,
  created_at   timestamptz not null default now()
);

-- 3) Cartas
create table if not exists public.cartas (
  id          uuid primary key default gen_random_uuid(),
  autor       text not null,
  contenido   text not null,
  created_at  timestamptz not null default now()
);

-- 4) Playlist
create table if not exists public.canciones (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  artista     text,
  url         text,
  nota        text,
  created_at  timestamptz not null default now()
);

-- Índices para ordenar rápido
create index if not exists momentos_fecha_idx  on public.momentos (fecha);
create index if not exists cartas_fecha_idx    on public.cartas (created_at desc);

-- ============================================================
--  SEGURIDAD (RLS): lectura pública, escritura solo con sesión
-- ============================================================

alter table public.config    enable row level security;
alter table public.momentos  enable row level security;
alter table public.cartas    enable row level security;
alter table public.canciones enable row level security;

-- config
drop policy if exists "config lectura publica" on public.config;
create policy "config lectura publica" on public.config
  for select to anon, authenticated using (true);
drop policy if exists "config escritura privada" on public.config;
create policy "config escritura privada" on public.config
  for all    to authenticated using (true) with check (true);

-- momentos
drop policy if exists "momentos lectura publica" on public.momentos;
create policy "momentos lectura publica" on public.momentos
  for select to anon, authenticated using (true);
drop policy if exists "momentos escritura privada" on public.momentos;
create policy "momentos escritura privada" on public.momentos
  for all    to authenticated using (true) with check (true);

-- cartas
drop policy if exists "cartas lectura publica" on public.cartas;
create policy "cartas lectura publica" on public.cartas
  for select to anon, authenticated using (true);
drop policy if exists "cartas escritura privada" on public.cartas;
create policy "cartas escritura privada" on public.cartas
  for all    to authenticated using (true) with check (true);

-- canciones
drop policy if exists "canciones lectura publica" on public.canciones;
create policy "canciones lectura publica" on public.canciones
  for select to anon, authenticated using (true);
drop policy if exists "canciones escritura privada" on public.canciones;
create policy "canciones escritura privada" on public.canciones
  for all   to authenticated using (true) with check (true);

-- ============================================================
--  DATOS INICIALES  ← EDITÁ ESTOS VALORES
-- ============================================================

insert into public.config (id, nombre_uno, nombre_dos, fecha_inicio, frase)
values (
  1,
  'Tu nombre',
  'Su nombre',
  '2026-08-19T20:00:00-04:00',   -- fecha y hora exactas en que empezaron
  'Un mes contigo y ya no sé contar de otra forma'
)
on conflict (id) do nothing;

commit;

/*
  # Archivo del Carnaval — Tablas principales

  1. Tablas nuevas
    - `admin_users` — credenciales del admin (un solo usuario)
      - `id` (uuid, pk)
      - `username` (text)
      - `password_hash` (text) — bcrypt hash
      - `created_at` (timestamptz)

    - `fotos` — archivo fotográfico subido desde el panel admin
      - `id` (uuid, pk)
      - `storage_path` (text) — ruta en Supabase Storage
      - `url` (text) — URL pública
      - `agrupacion_id` (text) — ID/slug de la agrupación (viene del CSV)
      - `agrupacion_nombre` (text)
      - `municipio` (text)
      - `año` (int)
      - `descripcion` (text)
      - `created_at` (timestamptz)

    - `videos` — archivo de vídeos
      - `id` (uuid, pk)
      - `url` (text) — URL de YouTube u otro servicio
      - `titulo` (text)
      - `agrupacion_id` (text)
      - `agrupacion_nombre` (text)
      - `municipio` (text)
      - `municipio_slug` (text)
      - `año` (int)
      - `tipo` (text) — comparsa, chirigota, cuarteto, coro, romancero
      - `created_at` (timestamptz)

    - `autores_extra` — datos adicionales de autores (foto, bio) que complementan el CSV
      - `id` (uuid, pk)
      - `slug` (text, unique)
      - `nombre` (text)
      - `foto_url` (text)
      - `bio` (text)
      - `municipio` (text)
      - `created_at` (timestamptz)

    - `componentes_extra` — datos adicionales de componentes: instrumento/voz por agrupación
      - `id` (uuid, pk)
      - `nombre` (text)
      - `slug` (text)
      - `agrupacion_id` (text) — ID del CSV
      - `agrupacion_nombre` (text)
      - `municipio` (text)
      - `año` (int)
      - `rol` (text) — caja, bombo, tenor, barítono, bajo, guitarra, director, ...
      - `created_at` (timestamptz)

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Fotos, vídeos, autores_extra y componentes_extra son de LECTURA pública (para el sitio)
    - Solo el admin autenticado puede INSERT / UPDATE / DELETE
    - admin_users solo accesible con service_role
*/

-- ============================================================
-- FOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS fotos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path  text DEFAULT '',
  url           text NOT NULL,
  agrupacion_id   text DEFAULT '',
  agrupacion_nombre text DEFAULT '',
  municipio     text DEFAULT '',
  año           int DEFAULT NULL,
  descripcion   text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de fotos"
  ON fotos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo admin inserta fotos"
  ON fotos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin actualiza fotos"
  ON fotos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin elimina fotos"
  ON fotos FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url               text NOT NULL,
  titulo            text DEFAULT '',
  agrupacion_id     text DEFAULT '',
  agrupacion_nombre text DEFAULT '',
  municipio         text DEFAULT '',
  municipio_slug    text DEFAULT '',
  año               int DEFAULT NULL,
  tipo              text DEFAULT '',
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de videos"
  ON videos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo admin inserta videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin actualiza videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin elimina videos"
  ON videos FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- AUTORES_EXTRA
-- ============================================================
CREATE TABLE IF NOT EXISTS autores_extra (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  nombre      text NOT NULL,
  foto_url    text DEFAULT '',
  bio         text DEFAULT '',
  municipio   text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE autores_extra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de autores_extra"
  ON autores_extra FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo admin inserta autores_extra"
  ON autores_extra FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin actualiza autores_extra"
  ON autores_extra FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin elimina autores_extra"
  ON autores_extra FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- COMPONENTES_EXTRA
-- ============================================================
CREATE TABLE IF NOT EXISTS componentes_extra (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL,
  slug              text NOT NULL,
  agrupacion_id     text DEFAULT '',
  agrupacion_nombre text DEFAULT '',
  municipio         text DEFAULT '',
  año               int DEFAULT NULL,
  rol               text DEFAULT '',
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS componentes_extra_slug_idx ON componentes_extra (slug);
CREATE INDEX IF NOT EXISTS componentes_extra_agrupacion_idx ON componentes_extra (agrupacion_id);

ALTER TABLE componentes_extra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de componentes_extra"
  ON componentes_extra FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo admin inserta componentes_extra"
  ON componentes_extra FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin actualiza componentes_extra"
  ON componentes_extra FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin elimina componentes_extra"
  ON componentes_extra FOR DELETE
  TO authenticated
  USING (true);

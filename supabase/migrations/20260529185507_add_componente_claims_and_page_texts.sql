/*
  # Add componente_claims and page_texts tables

  1. New Tables
    - `componente_claims` - Self-registration requests from users claiming to be a componente
      - `id` (uuid, primary key)
      - `nombre` (text) - their name
      - `slug` (text) - slugified name
      - `email` (text) - contact email
      - `mensaje` (text) - optional message
      - `foto_url` (text) - profile photo URL
      - `foto_storage_path` (text) - storage path for cleanup
      - `agrupaciones_extra` (text) - JSON array of extra agrupaciones they add
      - `status` (text) - pending / approved / rejected
      - `componente_slug_ref` (text) - links to existing componente in CSV if claiming existing
      - `created_at` (timestamptz)

    - `page_texts` - Admin-editable intro texts for section pages
      - `id` (uuid, primary key)
      - `page_key` (text, unique) - e.g. 'componentes', 'municipios', 'autores'
      - `title` (text)
      - `subtitle` (text)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - componente_claims: anon can INSERT, authenticated can SELECT/UPDATE/DELETE
    - page_texts: anon+authenticated can SELECT, only authenticated can INSERT/UPDATE
*/

-- COMPONENTE CLAIMS
CREATE TABLE IF NOT EXISTS componente_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  mensaje text DEFAULT '',
  foto_url text DEFAULT '',
  foto_storage_path text DEFAULT '',
  agrupaciones_extra text DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  componente_slug_ref text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE componente_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a componente claim"
  ON componente_claims FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read all claims"
  ON componente_claims FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update claims"
  ON componente_claims FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete claims"
  ON componente_claims FOR DELETE
  TO authenticated
  USING (true);

-- PAGE TEXTS
CREATE TABLE IF NOT EXISTS page_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page texts"
  ON page_texts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert page texts"
  ON page_texts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update page texts"
  ON page_texts FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

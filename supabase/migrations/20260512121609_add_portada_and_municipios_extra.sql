/*
  # Add portada flag to fotos + create municipios_extra table

  ## Changes

  ### fotos table
  - Add `is_portada` boolean column (default false)
    - When true, this photo is the portada (cover image) for its agrupacion
    - Only one photo per agrupacion_id should have is_portada = true

  ### New table: municipios_extra
  - Stores admin-editable information for each municipio
  - `slug` (text, unique) - municipio slug key
  - `nombre` (text) - display name
  - `descripcion` (text) - rich description / history
  - `foto_url` (text) - portada/hero image URL for the municipio page
  - `color` (text) - theme color for the municipio
  - `created_at`, `updated_at` timestamps

  ## Security
  - RLS enabled on municipios_extra
  - Public SELECT for all (anon + authenticated)
  - Only authenticated users can INSERT/UPDATE/DELETE
*/

-- Add is_portada column to fotos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fotos' AND column_name = 'is_portada'
  ) THEN
    ALTER TABLE fotos ADD COLUMN is_portada boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create municipios_extra table
CREATE TABLE IF NOT EXISTS municipios_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nombre text NOT NULL DEFAULT '',
  descripcion text NOT NULL DEFAULT '',
  foto_url text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#3986ff',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE municipios_extra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read municipios_extra"
  ON municipios_extra FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert municipios_extra"
  ON municipios_extra FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update municipios_extra"
  ON municipios_extra FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete municipios_extra"
  ON municipios_extra FOR DELETE
  TO authenticated
  USING (true);

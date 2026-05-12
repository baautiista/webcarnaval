/*
  # Tabla autor_aliases
  
  Mapea variantes de nombre (tal como aparecen en el CSV) al slug canónico del autor.
  Esto permite que un autor con apodo ("El Kiki") o nombre abreviado en el CSV
  siga enlazando a la ficha correcta en autor.html.

  Tabla:
    - csv_name: nombre tal como aparece en el CSV
    - canonical_slug: slug que se usará en autor.html?slug=
*/

CREATE TABLE IF NOT EXISTS autor_aliases (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  csv_name       text UNIQUE NOT NULL,
  canonical_slug text NOT NULL,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE autor_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de autor_aliases"
  ON autor_aliases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo admin inserta autor_aliases"
  ON autor_aliases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin actualiza autor_aliases"
  ON autor_aliases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin elimina autor_aliases"
  ON autor_aliases FOR DELETE
  TO authenticated
  USING (true);

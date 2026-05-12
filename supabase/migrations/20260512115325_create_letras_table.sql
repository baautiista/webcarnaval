/*
  # Tabla letras

  Almacena las letras (pasodobles, presentación, popurrí, etc.) de cada agrupación.

  ## Columnas
  - id: UUID
  - agrupacion_id: texto — slug/id de la agrupación
  - tipo: texto — "Pasodoble", "Presentación", "Popurrí", "Cuplé", "Tango", "Otro"
  - titulo: texto — título de la letra
  - contenido: texto — letra completa
  - orden: integer — orden de visualización dentro del tipo
  - created_at / updated_at

  ## Seguridad
  - RLS habilitado
  - Lectura pública anónima (las letras son contenido público del archivo)
  - Escritura solo para usuarios autenticados (admins)
*/

CREATE TABLE IF NOT EXISTS letras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agrupacion_id text NOT NULL,
  tipo text NOT NULL DEFAULT 'Pasodoble',
  titulo text NOT NULL DEFAULT '',
  contenido text NOT NULL DEFAULT '',
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS letras_agrupacion_id_idx ON letras(agrupacion_id);
CREATE INDEX IF NOT EXISTS letras_agrupacion_tipo_idx ON letras(agrupacion_id, tipo);

ALTER TABLE letras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede leer letras"
  ON letras FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Autenticados pueden insertar letras"
  ON letras FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden actualizar letras"
  ON letras FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden borrar letras"
  ON letras FOR DELETE
  TO authenticated
  USING (true);

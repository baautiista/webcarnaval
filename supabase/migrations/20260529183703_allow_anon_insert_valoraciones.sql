/*
  # Allow anonymous users to insert valoraciones

  The rating system on agrupacion pages is public (no login required).
  This migration adds an INSERT policy for anon role.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'valoraciones'
      AND policyname = 'Anyone can insert valoraciones'
  ) THEN
    CREATE POLICY "Anyone can insert valoraciones"
      ON valoraciones FOR INSERT
      TO anon
      WITH CHECK (puntuacion >= 1 AND puntuacion <= 10);
  END IF;
END $$;

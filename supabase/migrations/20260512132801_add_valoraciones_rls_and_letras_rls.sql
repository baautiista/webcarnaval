/*
  # Ensure RLS policies for valoraciones and letras tables

  1. valoraciones - public can read, authenticated can insert/update/delete
  2. letras - public can read, authenticated can insert/update/delete
*/

-- VALORACIONES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='valoraciones' AND policyname='Anyone can read valoraciones') THEN
    CREATE POLICY "Anyone can read valoraciones"
      ON valoraciones FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='valoraciones' AND policyname='Authenticated can insert valoraciones') THEN
    CREATE POLICY "Authenticated can insert valoraciones"
      ON valoraciones FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='valoraciones' AND policyname='Authenticated can update valoraciones') THEN
    CREATE POLICY "Authenticated can update valoraciones"
      ON valoraciones FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='valoraciones' AND policyname='Authenticated can delete valoraciones') THEN
    CREATE POLICY "Authenticated can delete valoraciones"
      ON valoraciones FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- LETRAS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='letras' AND policyname='Anyone can read letras') THEN
    CREATE POLICY "Anyone can read letras"
      ON letras FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='letras' AND policyname='Authenticated can insert letras') THEN
    CREATE POLICY "Authenticated can insert letras"
      ON letras FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='letras' AND policyname='Authenticated can update letras') THEN
    CREATE POLICY "Authenticated can update letras"
      ON letras FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='letras' AND policyname='Authenticated can delete letras') THEN
    CREATE POLICY "Authenticated can delete letras"
      ON letras FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

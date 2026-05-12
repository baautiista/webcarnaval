/*
  # Storage policies for fotos bucket
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Fotos public read' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Fotos public read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'fotos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Fotos authenticated upload' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Fotos authenticated upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'fotos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Fotos authenticated delete' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Fotos authenticated delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'fotos');
  END IF;
END $$;

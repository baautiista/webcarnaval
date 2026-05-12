/*
  # Renombrar columna 'año' a 'ano' en todas las tablas
  Evita problemas con el carácter especial ñ en la API REST de Supabase.
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fotos' AND column_name='año') THEN
    ALTER TABLE fotos RENAME COLUMN "año" TO ano;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='año') THEN
    ALTER TABLE videos RENAME COLUMN "año" TO ano;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='componentes_extra' AND column_name='año') THEN
    ALTER TABLE componentes_extra RENAME COLUMN "año" TO ano;
  END IF;
END $$;

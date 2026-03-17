-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices   ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos   ENABLE ROW LEVEL SECURITY;

-- stations: cualquiera puede leer, solo auth puede insertar
CREATE POLICY "read stations"   ON stations FOR SELECT USING (true);
CREATE POLICY "insert stations" ON stations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- reviews: lectura pública, insertar/borrar solo el dueño
CREATE POLICY "read reviews"    ON reviews  FOR SELECT USING (true);
CREATE POLICY "insert reviews"  ON reviews  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete reviews"  ON reviews  FOR DELETE USING  (auth.uid() = user_id);

-- prices: lectura pública, insertar solo el dueño
CREATE POLICY "read prices"     ON prices   FOR SELECT USING (true);
CREATE POLICY "insert prices"   ON prices   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- photos: lectura pública, insertar solo el dueño
CREATE POLICY "read photos"     ON photos   FOR SELECT USING (true);
CREATE POLICY "insert photos"   ON photos   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Storage: bucket "photos" (crear en el dashboard de Supabase)
-- Política de acceso público para lectura
-- ============================================================
-- Ejecutar en SQL editor de Supabase después de crear el bucket:
--
-- CREATE POLICY "public read photos bucket"
--   ON storage.objects FOR SELECT USING (bucket_id = 'photos');
--
-- CREATE POLICY "auth upload photos bucket"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

-- Crear bucket público para fotos y facturas
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies de storage
CREATE POLICY "public read photos bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "auth upload photos bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "own delete photos bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

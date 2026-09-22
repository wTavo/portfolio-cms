-- ==============================================================================
-- Migración 006: Bucket y Políticas de Supabase Storage
-- ==============================================================================

-- 1. Crear el bucket portfolio-media si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acceso a storage.objects

-- Lectura pública para cualquier imagen del portfolio
CREATE POLICY "Public can view portfolio images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-media');

-- Subida: el owner solo puede subir dentro de la carpeta con su user_id
CREATE POLICY "Owner can upload to own directory"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_user_active()
  );

-- Actualización / reemplazo: solo el owner
CREATE POLICY "Owner can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_user_active()
  );

-- Eliminación: solo el owner
CREATE POLICY "Owner can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_user_active()
  );

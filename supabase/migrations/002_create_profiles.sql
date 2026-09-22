-- ==============================================================================
-- Migración 002: Tabla de perfiles de portfolio
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profession TEXT,
  bio TEXT,
  photo_url TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  theme TEXT NOT NULL DEFAULT 'minimal',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices únicos para resolución rápida de URLs y asociación de cuenta
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_published ON public.profiles(is_published);

COMMENT ON TABLE public.profiles IS 'Perfiles de portfolios públicos y configuraciones SEO';
COMMENT ON COLUMN public.profiles.slug IS 'Identificador único en la URL pública (ej: /[slug])';

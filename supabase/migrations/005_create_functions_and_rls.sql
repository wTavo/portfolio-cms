-- ==============================================================================
-- Migración 005: Funciones auxiliares y Row Level Security (RLS) Multi-Tenant
-- ==============================================================================

-- 1. Funciones auxiliares de seguridad
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN AS $$
  SELECT is_active FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Habilitar RLS en TODAS las tablas sin excepción
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Políticas para 'users'
-- ------------------------------------------------------------------------------
CREATE POLICY "Superadmin can manage users"
  ON public.users FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'superadmin' AND public.is_user_active())
  WITH CHECK (public.get_user_role() = 'superadmin');

CREATE POLICY "Owner can view own user record"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND public.is_user_active());

-- ------------------------------------------------------------------------------
-- Políticas para 'profiles'
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view published profiles"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Owner can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND public.is_user_active());

CREATE POLICY "Owner can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_user_active())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Superadmin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'superadmin' AND public.is_user_active());

CREATE POLICY "Superadmin can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'superadmin' AND public.is_user_active());

-- ------------------------------------------------------------------------------
-- Políticas para tablas de contenido (sections, experiences, projects, education, media, settings)
-- ------------------------------------------------------------------------------

-- Helper policy macro para lectura pública
CREATE POLICY "Public can view published sections"
  ON public.sections FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = sections.profile_id AND profiles.is_published = true
    )
  );

CREATE POLICY "Owner can manage own sections"
  ON public.sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = sections.profile_id AND profiles.user_id = auth.uid()
    )
    AND public.is_user_active()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = sections.profile_id AND profiles.user_id = auth.uid()
    )
  );

-- Experiences
CREATE POLICY "Public can view published experiences"
  ON public.experiences FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = experiences.profile_id AND profiles.is_published = true
    )
  );

CREATE POLICY "Owner can manage own experiences"
  ON public.experiences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = experiences.profile_id AND profiles.user_id = auth.uid()
    )
    AND public.is_user_active()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = experiences.profile_id AND profiles.user_id = auth.uid()
    )
  );

-- Projects
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id AND profiles.is_published = true
    )
  );

CREATE POLICY "Owner can manage own projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id AND profiles.user_id = auth.uid()
    )
    AND public.is_user_active()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id AND profiles.user_id = auth.uid()
    )
  );

-- Education
CREATE POLICY "Public can view published education"
  ON public.education FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = education.profile_id AND profiles.is_published = true
    )
  );

CREATE POLICY "Owner can manage own education"
  ON public.education FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = education.profile_id AND profiles.user_id = auth.uid()
    )
    AND public.is_user_active()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = education.profile_id AND profiles.user_id = auth.uid()
    )
  );

-- Media
CREATE POLICY "Public can view media records of published profiles"
  ON public.media FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = media.profile_id AND profiles.is_published = true
    )
  );

CREATE POLICY "Owner can manage own media records"
  ON public.media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = media.profile_id AND profiles.user_id = auth.uid()
    )
    AND public.is_user_active()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = media.profile_id AND profiles.user_id = auth.uid()
    )
  );

-- Settings
CREATE POLICY "Owner can manage own settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = settings.profile_id AND profiles.user_id = auth.uid()
    )
    AND public.is_user_active()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = settings.profile_id AND profiles.user_id = auth.uid()
    )
  );

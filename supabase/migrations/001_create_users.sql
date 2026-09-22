-- ==============================================================================
-- Migración 001: Tabla de usuarios y roles del sistema
-- ==============================================================================

-- 1. Crear tabla users vinculada a auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'owner')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices para búsquedas rápidas por rol y estado
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- 3. Comentarios de documentación TSDoc/SQL
COMMENT ON TABLE public.users IS 'Registro de usuarios del CMS con roles y estado de cuenta';
COMMENT ON COLUMN public.users.role IS 'Rol del usuario: superadmin (gestiona la plataforma) u owner (dueño de un portfolio)';

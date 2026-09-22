/**
 * @file middleware.ts
 * @description Pipeline de seguridad perimetral: Security Headers, validación de sesiones y guards por rol.
 */

import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase/client';
import { ROLES, type UserRole } from './lib/constants';
import type { GuardUser } from './lib/guards/auth.guard';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;
  const pathname = url.pathname;

  // 1. Inicializar cliente Supabase para resolver sesión
  const supabase = createSupabaseServerClient(cookies);
  locals.supabase = supabase;

  // 2. Resolver sesión si existe token en cookies
  let currentUser: GuardUser | null = null;
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    // Consultar el registro en la tabla users para obtener el rol y estado
    const { data: userProfile } = await (supabase as any)
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', authUser.id)
      .single();

    if (userProfile) {
      currentUser = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role as UserRole,
        isActive: userProfile.is_active,
      };
      locals.user = currentUser;
    }
  }

  // 3. Protección de rutas administrativas (/admin/* -> Solo superadmin)
  if (pathname.startsWith('/admin')) {
    if (!currentUser) {
      return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    if (!currentUser.isActive) {
      return redirect('/login?error=account_suspended');
    }
    if (currentUser.role !== ROLES.SUPERADMIN) {
      return redirect('/403');
    }
  }

  // 4. Protección del panel de usuario (/dashboard/* -> Solo owner)
  if (pathname.startsWith('/dashboard')) {
    if (!currentUser) {
      return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    if (!currentUser.isActive) {
      return redirect('/login?error=account_suspended');
    }
    if (currentUser.role !== ROLES.OWNER) {
      return redirect('/403');
    }
  }

  // 5. Redirección si el usuario ya está autenticado e intenta ir a /login
  if (pathname === '/login' && currentUser && currentUser.isActive) {
    if (currentUser.role === ROLES.SUPERADMIN) {
      return redirect('/admin');
    }
    return redirect('/dashboard');
  }

  // 6. Ejecutar petición siguiente en la cadena
  const response = await next();

  // 7. Aplicar Security Headers obligatorios (DIR-09)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // 8. Control de Cache por zona de ruta (DIR-18)
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }

  return response;
});

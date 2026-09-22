/**
 * @file login.ts
 * @description Endpoint de inicio de sesión con validación de credenciales y roles.
 */

import type { APIRoute } from 'astro';
import { loginSchema } from '../../../lib/validators/user.schema';
import { ROLES } from '../../../lib/constants';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Por favor ingresa un correo y contraseña válidos.',
          },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, password } = result.data;
    const { data: authData, error: authError } =
      await locals.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Las credenciales ingresadas son incorrectas.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Consultar el rol del usuario en la tabla users
    const { data: userProfile, error: profileError } = await (locals.supabase as any)
      .from('users')
      .select('role, is_active, display_name')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'No se encontró el registro del usuario en el sistema.',
          },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userProfile.is_active) {
      await locals.supabase.auth.signOut();
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Esta cuenta ha sido suspendida. Contacta al administrador.',
          },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar fecha de último login
    await (locals.supabase as any)
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    // Determinar destino según el rol
    const redirectUrl =
      userProfile.role === ROLES.SUPERADMIN ? '/admin' : '/dashboard';

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          role: userProfile.role,
          displayName: userProfile.display_name,
          redirectUrl,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ocurrió un error inesperado al iniciar sesión.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

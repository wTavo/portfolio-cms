/**
 * @file profile.ts
 * @description API Endpoint para obtener y actualizar el perfil del Owner.
 */

import type { APIRoute } from 'astro';
import { requireOwner } from '../../../lib/guards/auth.guard';
import { profileSchema } from '../../../lib/validators/profile.schema';
import { getOwnerProfile, updateOwnerProfile } from '../../../lib/services/profile.service';

/** GET /api/dashboard/profile -> Obtener mi perfil */
export const GET: APIRoute = async ({ locals }) => {
  const guard = requireOwner(locals.user);
  if (!guard.ok) return guard.response;

  try {
    const profile = await getOwnerProfile(locals.supabase, guard.user.id);
    return new Response(
      JSON.stringify({ success: true, data: profile }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message || 'Error al obtener perfil.' },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/** PUT /api/dashboard/profile -> Actualizar mi perfil */
export const PUT: APIRoute = async ({ request, locals }) => {
  const guard = requireOwner(locals.user);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.issues[0]?.message || 'Datos de perfil inválidos.',
          },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updated = await updateOwnerProfile(locals.supabase, guard.user.id, result.data);

    return new Response(
      JSON.stringify({
        success: true,
        data: updated,
        message: 'Perfil actualizado con éxito.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'UPDATE_FAILED', message: err.message || 'Error al actualizar perfil.' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * @file users.ts
 * @description API Endpoint para listar y dar de alta usuarios (Solo Superadmin).
 */

import type { APIRoute } from 'astro';
import { requireSuperadmin } from '../../../lib/guards/auth.guard';
import { createUserSchema } from '../../../lib/validators/user.schema';
import { listUsers, createUserWithInvitation, toggleUserStatus } from '../../../lib/services/user.service';

/** GET /api/admin/users -> Listar usuarios */
export const GET: APIRoute = async ({ locals }) => {
  const guard = requireSuperadmin(locals.user);
  if (!guard.ok) return guard.response;

  try {
    const users = await listUsers();
    return new Response(
      JSON.stringify({ success: true, data: users }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message || 'Error al listar usuarios.' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/** POST /api/admin/users -> Crear usuario con invitación */
export const POST: APIRoute = async ({ request, locals }) => {
  const guard = requireSuperadmin(locals.user);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.issues[0]?.message || 'Datos de usuario inválidos.',
          },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = await createUserWithInvitation(result.data, guard.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: { userId, message: 'Invitación enviada y usuario registrado con éxito.' },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'USER_CREATION_FAILED', message: err.message || 'Error al crear usuario.' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/** PUT /api/admin/users -> Cambiar estado activo / suspendido */
export const PUT: APIRoute = async ({ request, locals }) => {
  const guard = requireSuperadmin(locals.user);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId || typeof isActive !== 'boolean') {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Faltan parámetros requeridos (userId, isActive).' },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await toggleUserStatus(userId, isActive);

    return new Response(
      JSON.stringify({
        success: true,
        data: { message: `Estado del usuario actualizado a ${isActive ? 'activo' : 'suspendido'}.` },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'UPDATE_FAILED', message: err.message || 'Error al actualizar usuario.' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

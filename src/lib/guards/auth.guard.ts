/**
 * @file auth.guard.ts
 * @description Funciones de guardia para validación de autenticación, verificación de roles y propiedad de recursos.
 */

import { ROLES, type UserRole } from '../constants';

export interface GuardUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface GuardSuccess {
  ok: true;
  user: GuardUser;
}

export interface GuardFailure {
  ok: false;
  status: 401 | 403;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'ACCOUNT_SUSPENDED';
  message: string;
  response: Response;
}

export type GuardResult = GuardSuccess | GuardFailure;

/**
 * Crea una respuesta estándar de fallo de guardia en formato JSON.
 */
function createErrorResponse(status: 401 | 403, code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'ACCOUNT_SUSPENDED', message: string): GuardFailure {
  return {
    ok: false,
    status,
    code,
    message,
    response: new Response(
      JSON.stringify({
        success: false,
        error: { code, message },
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    ),
  };
}

/**
 * Valida que exista una sesión autenticada activa.
 */
export function requireAuth(user?: GuardUser | null): GuardResult {
  if (!user) {
    return createErrorResponse(401, 'UNAUTHORIZED', 'Debes iniciar sesión para realizar esta acción.');
  }

  if (!user.isActive) {
    return createErrorResponse(403, 'ACCOUNT_SUSPENDED', 'Tu cuenta se encuentra suspendida.');
  }

  return { ok: true, user };
}

/**
 * Valida que el usuario tenga el rol de Superadmin.
 */
export function requireSuperadmin(user?: GuardUser | null): GuardResult {
  const authResult = requireAuth(user);
  if (!authResult.ok) return authResult;

  if (authResult.user.role !== ROLES.SUPERADMIN) {
    return createErrorResponse(403, 'FORBIDDEN', 'Requiere permisos de administrador general.');
  }

  return authResult;
}

/**
 * Valida que el usuario tenga el rol de Owner.
 */
export function requireOwner(user?: GuardUser | null): GuardResult {
  const authResult = requireAuth(user);
  if (!authResult.ok) return authResult;

  if (authResult.user.role !== ROLES.OWNER) {
    return createErrorResponse(403, 'FORBIDDEN', 'Requiere permisos de propietario de portafolio.');
  }

  return authResult;
}

/**
 * Valida que el recurso pertenezca exclusivamente al Owner autenticado.
 */
export function requireOwnership(user?: GuardUser | null, resourceOwnerId?: string): GuardResult {
  const authResult = requireOwner(user);
  if (!authResult.ok) return authResult;

  if (authResult.user.id !== resourceOwnerId) {
    return createErrorResponse(403, 'FORBIDDEN', 'No tienes autorización sobre este recurso.');
  }

  return authResult;
}

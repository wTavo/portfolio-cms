/**
 * @file logout.ts
 * @description Endpoint para cerrar sesión y limpiar cookies de autenticación.
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals }) => {
  try {
    await locals.supabase.auth.signOut();

    return new Response(
      JSON.stringify({
        success: true,
        data: { message: 'Sesión cerrada con éxito' },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'No se pudo cerrar la sesión.' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

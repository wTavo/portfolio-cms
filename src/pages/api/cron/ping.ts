/**
 * @file ping.ts
 * @description Endpoint de mantenimiento programado (Cron Job) para enviar ping periódico a Supabase y evitar la suspensión por inactividad de 7 días (Directiva 28).
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const startTime = Date.now();

  try {
    const supabase = locals.supabase;

    // Consulta ligera a la base de datos para mantener viva la instancia
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_PING_FAILED',
            message: error.message,
          },
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    const durationMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: 'alive',
          target: 'supabase',
          durationMs,
          timestamp: new Date().toISOString(),
          recordCount: count ?? 0,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error inesperado en ping';
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'PING_EXCEPTION',
          message: errorMessage,
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
};

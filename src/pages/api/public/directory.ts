/**
 * @file directory.ts
 * @description Endpoint público para listar portafolios verificados y publicados en el directorio.
 */

import type { APIRoute } from 'astro';
import { getPublishedDirectoryProfiles } from '../../../lib/services/directory.service';

export const GET: APIRoute = async () => {
  try {
    const profiles = await getPublishedDirectoryProfiles();

    return new Response(
      JSON.stringify({
        success: true,
        data: profiles,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener los portafolios del directorio.',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

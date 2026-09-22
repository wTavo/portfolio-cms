/**
 * @file client.ts
 * @description Factory del cliente Supabase para entornos SSR con manejo seguro de cookies HttpOnly.
 */

import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './types';

/**
 * Crea un cliente Supabase en el servidor vinculado a las cookies de la petición.
 * @param cookies Objeto AstroCookies de la petición activa
 * @returns Cliente de Supabase configurado con persistencia de sesión por cookies
 */
export function createSupabaseServerClient(cookies: AstroCookies) {
  const supabaseUrl = import.meta.env.SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(cookies.get('sb-access-token')?.value || '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            ...options,
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
        });
      },
    },
  });
}

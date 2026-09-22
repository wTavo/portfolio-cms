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
  const supabaseUrl =
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) ||
    import.meta.env.SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    (typeof process !== 'undefined' ? (process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY) : undefined) ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
    '';

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // En Astro, cookies.get() devuelve cada cookie registrada
        const allCookies = [];
        for (const [name, cookie] of Object.entries(cookies as any)) {
          if (cookie && typeof cookie === 'object' && 'value' in cookie) {
            allCookies.push({ name, value: (cookie as any).value });
          }
        }
        // Fallback directo a los nombres estándar de sesión de Supabase
        const sbAccess = cookies.get('sb-access-token')?.value;
        const sbRefresh = cookies.get('sb-refresh-token')?.value;
        const authCookie = cookies.get(`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`)?.value;

        if (sbAccess) allCookies.push({ name: 'sb-access-token', value: sbAccess });
        if (sbRefresh) allCookies.push({ name: 'sb-refresh-token', value: sbRefresh });
        if (authCookie) allCookies.push({ name: `sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`, value: authCookie });

        return allCookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            ...options,
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
          });
        });
      },
    },
  });
}

/**
 * @file server.ts
 * @description Cliente Supabase con Service Role Key exclusivo para tareas privilegiadas del servidor.
 * ⚠️ PROHIBIDO importar este cliente en código que se ejecute en el cliente (navegador).
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Obtiene el cliente Supabase con permisos de Service Role (bypassa RLS).
 * Solo para ser usado en endpoints administrativos server-side como invitación de usuarios.
 */
export function getSupabaseAdminClient() {
  const supabaseUrl =
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) ||
    import.meta.env.SUPABASE_URL ||
    '';

  const supabaseServiceRoleKey =
    (typeof process !== 'undefined' ? process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined) ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Las variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas.');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

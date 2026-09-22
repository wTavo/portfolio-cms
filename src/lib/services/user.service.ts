/**
 * @file user.service.ts
 * @description Servicio de negocio para la administración de usuarios e invitaciones (Superadmin).
 */

import { getSupabaseAdminClient } from '../supabase/server';
import { type CreateUserInput } from '../validators/user.schema';
import { ROLES } from '../constants';

export interface UserSummary {
  id: string;
  email: string;
  role: string;
  displayName: string;
  isActive: boolean;
  slug?: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

/**
 * Obtiene la lista completa de usuarios registrados y su slug de portfolio.
 */
export async function listUsers(): Promise<UserSummary[]> {
  const adminClient = getSupabaseAdminClient();

  const { data: users, error: usersError } = await (adminClient as any)
    .from('users')
    .select('id, email, role, display_name, is_active, last_login_at, created_at')
    .order('created_at', { ascending: false });

  if (usersError) {
    throw new Error('No se pudo obtener la lista de usuarios.');
  }

  const { data: profiles } = await (adminClient as any)
    .from('profiles')
    .select('user_id, slug');

  const slugMap = new Map<string, string>();
  if (profiles) {
    for (const p of profiles) {
      slugMap.set(p.user_id, p.slug);
    }
  }

  return (users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    displayName: u.display_name,
    isActive: u.is_active,
    slug: slugMap.get(u.id),
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at,
  }));
}

/**
 * Crea un nuevo usuario en Supabase Auth, envía invitación por correo y crea su perfil inicial.
 */
export async function createUserWithInvitation(input: CreateUserInput, invitedByUserId?: string): Promise<{ userId: string }> {
  const adminClient = getSupabaseAdminClient();

  // 1. Verificar si el slug ya está en uso
  const { data: existingProfile } = await (adminClient as any)
    .from('profiles')
    .select('id')
    .eq('slug', input.slug.toLowerCase())
    .maybeSingle();

  if (existingProfile) {
    throw new Error('El enlace (slug) ya está en uso por otro usuario.');
  }

  // 2. Invitar al usuario en Supabase Auth
  const { data: authData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(input.email);

  if (inviteError || !authData.user) {
    throw new Error(inviteError?.message || 'Error al enviar invitación al usuario.');
  }

  const userId = authData.user.id;

  // 3. Crear registro en la tabla users
  const { error: userError } = await (adminClient as any)
    .from('users')
    .insert({
      id: userId,
      email: input.email,
      role: input.role || ROLES.OWNER,
      display_name: input.displayName,
      is_active: true,
      invited_by: invitedByUserId || null,
    });

  if (userError) {
    throw new Error('Error al registrar usuario en la base de datos.');
  }

  // 4. Crear registro en la tabla profiles
  const { error: profileError } = await (adminClient as any)
    .from('profiles')
    .insert({
      user_id: userId,
      slug: input.slug.toLowerCase(),
      name: input.displayName,
      is_published: false,
    });

  if (profileError) {
    throw new Error('Error al inicializar el perfil del usuario.');
  }

  return { userId };
}

/**
 * Cambia el estado de activación de un usuario (suspender / reactivar).
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  const { error } = await (adminClient as any)
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    throw new Error('No se pudo actualizar el estado del usuario.');
  }
}

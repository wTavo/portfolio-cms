/**
 * @file profile.service.ts
 * @description Servicio de negocio para la gestión del perfil del Owner.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import type { ProfileInput } from '../validators/profile.schema';

/**
 * Obtiene el perfil del usuario autenticado.
 */
export async function getOwnerProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('No se encontró el perfil del usuario.');
  }

  return data;
}

/**
 * Actualiza el perfil del usuario autenticado.
 */
export async function updateOwnerProfile(supabase: SupabaseClient<Database>, userId: string, input: ProfileInput) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update({
      name: input.name,
      profession: input.profession || null,
      bio: input.bio || null,
      photo_url: input.photoUrl || null,
      location: input.location || null,
      email: input.email || null,
      phone: input.phone || null,
      website: input.website || null,
      social_links: input.socialLinks,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      theme: input.theme,
      is_published: input.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error('Error al actualizar el perfil.');
  }

  return data;
}

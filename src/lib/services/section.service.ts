/**
 * @file section.service.ts
 * @description Servicio de negocio para la gestión de secciones dinámicas del portfolio.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import type { SectionInput } from '../validators/profile.schema';

/**
 * Obtiene todas las secciones de un perfil por su profile_id.
 */
export async function getProfileSections(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await (supabase as any)
    .from('sections')
    .select('*')
    .eq('profile_id', profileId)
    .order('position', { ascending: true });

  if (error) {
    throw new Error('Error al obtener las secciones.');
  }

  return data || [];
}

/**
 * Crea una nueva sección vinculada al perfil del usuario.
 */
export async function createSection(supabase: SupabaseClient<Database>, profileId: string, input: SectionInput) {
  const { data, error } = await (supabase as any)
    .from('sections')
    .insert({
      profile_id: profileId,
      type: input.type,
      variant: input.variant,
      title: input.title || null,
      position: input.position,
      visible: input.visible,
      config: input.config,
      data: input.data,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Error al crear la sección.');
  }

  return data;
}

/**
 * Actualiza una sección existente.
 */
export async function updateSection(supabase: SupabaseClient<Database>, sectionId: string, input: Partial<SectionInput>) {
  const { data, error } = await (supabase as any)
    .from('sections')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sectionId)
    .select()
    .single();

  if (error) {
    throw new Error('Error al actualizar la sección.');
  }

  return data;
}

/**
 * Elimina una sección.
 */
export async function deleteSection(supabase: SupabaseClient<Database>, sectionId: string) {
  const { error } = await (supabase as any)
    .from('sections')
    .delete()
    .eq('id', sectionId);

  if (error) {
    throw new Error('Error al eliminar la sección.');
  }
}

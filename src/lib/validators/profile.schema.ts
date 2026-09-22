/**
 * @file profile.schema.ts
 * @description Esquemas de validación Zod para perfil personal y secciones dinámicas.
 */

import { z } from 'zod';
import { SECTION_TYPES, THEMES } from '../constants';

export const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  profession: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000, 'La biografía no puede exceder 1000 caracteres').optional().nullable(),
  photoUrl: z.string().url('Ingresa una URL válida de imagen').optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  email: z.string().email('Ingresa un correo válido').optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url('Ingresa una URL válida').optional().nullable(),
  socialLinks: z.record(z.string(), z.string()).default({}),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  theme: z.enum([
    THEMES.MINIMAL,
    THEMES.PROFESSIONAL,
    THEMES.CREATIVE,
    THEMES.DEVELOPER,
  ]).default(THEMES.MINIMAL),
  isPublished: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const sectionSchema = z.object({
  type: z.enum([
    SECTION_TYPES.HERO,
    SECTION_TYPES.ABOUT,
    SECTION_TYPES.EXPERIENCE,
    SECTION_TYPES.EDUCATION,
    SECTION_TYPES.SKILLS,
    SECTION_TYPES.PROJECTS,
    SECTION_TYPES.GALLERY,
    SECTION_TYPES.CONTACT,
    SECTION_TYPES.CUSTOM,
  ]),
  variant: z.string().min(1).default('default'),
  title: z.string().max(100).optional().nullable(),
  position: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  config: z.record(z.string(), z.unknown()).default({}),
  data: z.record(z.string(), z.unknown()).default({}),
});

export type SectionInput = z.infer<typeof sectionSchema>;

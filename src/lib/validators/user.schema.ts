/**
 * @file user.schema.ts
 * @description Esquemas de validación con Zod para usuarios, roles, logins y slugs.
 */

import { z } from 'zod';
import { RESERVED_SLUGS, ROLES } from '../constants';

/** Validador de slug seguro sin colisiones con rutas del sistema */
export const slugSchema = z
  .string()
  .min(3, 'El slug debe tener al menos 3 caracteres')
  .max(30, 'El slug no puede exceder 30 caracteres')
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    'Solo se permiten letras minúsculas, números y guiones intermedios'
  )
  .refine(
    (slug) => !RESERVED_SLUGS.includes(slug.toLowerCase() as any),
    'Este identificador de enlace está reservado por el sistema'
  );

/** Validador de creación de nuevo usuario (Superadmin) */
export const createUserSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  slug: slugSchema,
  role: z.enum([ROLES.SUPERADMIN, ROLES.OWNER]).default(ROLES.OWNER),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Validador de login */
export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

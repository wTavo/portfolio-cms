/**
 * @file validators.test.ts
 * @description Pruebas unitarias para esquemas de validación Zod de usuario y perfil (Directivas 9 y 11).
 */

import { describe, it, expect } from 'vitest';
import { slugSchema, createUserSchema, loginSchema } from '../../src/lib/validators/user.schema';
import { profileSchema, sectionSchema } from '../../src/lib/validators/profile.schema';
import { ROLES, THEMES, SECTION_TYPES } from '../../src/lib/constants';

describe('user.schema', () => {
  describe('slugSchema', () => {
    it('acepta slugs válidos con letras, números y guiones', () => {
      expect(slugSchema.safeParse('gus-morales-99').success).toBe(true);
      expect(slugSchema.safeParse('portafolio-web').success).toBe(true);
    });

    it('rechaza slugs menores a 3 caracteres', () => {
      const res = slugSchema.safeParse('ab');
      expect(res.success).toBe(false);
    });

    it('rechaza slugs con caracteres especiales no permitidos o mayúsculas', () => {
      expect(slugSchema.safeParse('MiPortafolio').success).toBe(false);
      expect(slugSchema.safeParse('gus_morales').success).toBe(false);
      expect(slugSchema.safeParse('gus.morales').success).toBe(false);
    });

    it('rechaza slugs reservados del sistema', () => {
      expect(slugSchema.safeParse('admin').success).toBe(false);
      expect(slugSchema.safeParse('dashboard').success).toBe(false);
      expect(slugSchema.safeParse('api').success).toBe(false);
      expect(slugSchema.safeParse('health').success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('valida datos completos y asigna rol owner por defecto', () => {
      const result = createUserSchema.safeParse({
        email: 'nuevo@example.com',
        password: 'password123',
        displayName: 'Nuevo Usuario',
        slug: 'nuevo-usuario',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(ROLES.OWNER);
      }
    });

    it('falla con correos inválidos o contraseñas cortas', () => {
      expect(
        createUserSchema.safeParse({
          email: 'correo-no-valido',
          password: '123',
          displayName: 'Test',
          slug: 'test-user',
        }).success
      ).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('valida credenciales con formato correcto', () => {
      expect(
        loginSchema.safeParse({
          email: 'usuario@example.com',
          password: 'secretPassword',
        }).success
      ).toBe(true);
    });

    it('rechaza entradas incompletas', () => {
      expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
    });
  });
});

describe('profile.schema', () => {
  it('valida un perfil válido con valores por defecto', () => {
    const result = profileSchema.safeParse({
      name: 'Gustavo Morales',
      profession: 'Ingeniero de Software',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.theme).toBe(THEMES.MINIMAL);
      expect(result.data.isPublished).toBe(false);
    }
  });

  it('rechaza nombres menores a 2 caracteres', () => {
    expect(profileSchema.safeParse({ name: 'A' }).success).toBe(false);
  });

  it('valida esquemas de sección con tipos admitidos', () => {
    const result = sectionSchema.safeParse({
      type: SECTION_TYPES.PROJECTS,
      title: 'Mis proyectos destacados',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.position).toBe(0);
      expect(result.data.visible).toBe(true);
    }
  });
});

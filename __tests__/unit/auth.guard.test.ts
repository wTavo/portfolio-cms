/**
 * @file auth.guard.test.ts
 * @description Pruebas unitarias para funciones de guardia de autenticación y autorización (Directivas 8, 9 y 11).
 */

import { describe, it, expect } from 'vitest';
import {
  requireAuth,
  requireSuperadmin,
  requireOwner,
  requireOwnership,
  type GuardUser,
} from '../../src/lib/guards/auth.guard';
import { ROLES } from '../../src/lib/constants';

describe('auth.guard', () => {
  const superadminUser: GuardUser = {
    id: 'super-1',
    email: 'admin@example.com',
    role: ROLES.SUPERADMIN,
    isActive: true,
  };

  const ownerUser: GuardUser = {
    id: 'owner-1',
    email: 'owner@example.com',
    role: ROLES.OWNER,
    isActive: true,
  };

  const suspendedUser: GuardUser = {
    id: 'suspended-1',
    email: 'suspended@example.com',
    role: ROLES.OWNER,
    isActive: false,
  };

  describe('requireAuth', () => {
    it('retorna error 401 si no hay usuario autenticado', () => {
      const result = requireAuth(null);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(401);
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it('retorna error 403 si el usuario está suspendido', () => {
      const result = requireAuth(suspendedUser);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
        expect(result.code).toBe('ACCOUNT_SUSPENDED');
      }
    });

    it('permite el acceso si el usuario está autenticado y activo', () => {
      const result = requireAuth(ownerUser);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.id).toBe(ownerUser.id);
      }
    });
  });

  describe('requireSuperadmin', () => {
    it('bloquea a usuarios sin rol de superadmin', () => {
      const result = requireSuperadmin(ownerUser);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
        expect(result.code).toBe('FORBIDDEN');
      }
    });

    it('permite el acceso a superadmin activo', () => {
      const result = requireSuperadmin(superadminUser);
      expect(result.ok).toBe(true);
    });
  });

  describe('requireOwner', () => {
    it('bloquea si el rol no es owner', () => {
      const result = requireOwner(superadminUser);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
        expect(result.code).toBe('FORBIDDEN');
      }
    });

    it('permite acceso al owner activo', () => {
      const result = requireOwner(ownerUser);
      expect(result.ok).toBe(true);
    });
  });

  describe('requireOwnership', () => {
    it('bloquea si el recurso pertenece a otro usuario', () => {
      const result = requireOwnership(ownerUser, 'other-user-99');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it('permite acceso si el ID del recurso coincide con el del owner', () => {
      const result = requireOwnership(ownerUser, 'owner-1');
      expect(result.ok).toBe(true);
    });
  });
});

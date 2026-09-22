/**
 * @file directory.service.test.ts
 * @description Pruebas unitarias para el servicio de directorio y catalogación de portafolios.
 */

import { describe, it, expect } from 'vitest';
import {
  inferCategory,
  DIRECTORY_CATEGORIES,
  SEED_DIRECTORY_PROFILES,
} from '../../src/lib/services/directory.service';

describe('Servicio de Directorio de Portafolios', () => {
  describe('inferCategory', () => {
    it('debe clasificar perfiles de diseño correctamente', () => {
      expect(inferCategory('Diseñadora de producto')).toBe('Diseño UI/UX');
      expect(inferCategory('UI/UX Designer')).toBe('Diseño UI/UX');
      expect(inferCategory('Product Designer')).toBe('Diseño UI/UX');
    });

    it('debe clasificar perfiles móviles correctamente', () => {
      expect(inferCategory('Desarrollador móvil senior')).toBe('Móvil');
      expect(inferCategory('Android & iOS Engineer')).toBe('Móvil');
      expect(inferCategory('Flutter Specialist')).toBe('Móvil');
    });

    it('debe clasificar perfiles de backend y cloud correctamente', () => {
      expect(inferCategory('Arquitecta Cloud & DevOps')).toBe('Backend & Cloud');
      expect(inferCategory('Backend Developer Node.js')).toBe('Backend & Cloud');
      expect(inferCategory('Data Engineer')).toBe('Backend & Cloud');
    });

    it('debe clasificar perfiles generales como desarrollo web', () => {
      expect(inferCategory('Ingeniero de software')).toBe('Desarrollo web');
      expect(inferCategory('Full-stack Developer')).toBe('Desarrollo web');
      expect(inferCategory('')).toBe('Desarrollo web');
    });
  });

  describe('Constantes y Datos Semilla del Directorio', () => {
    it('debe incluir las 5 categorías esenciales en DIRECTORY_CATEGORIES', () => {
      expect(DIRECTORY_CATEGORIES).toContain('Todos');
      expect(DIRECTORY_CATEGORIES).toContain('Desarrollo web');
      expect(DIRECTORY_CATEGORIES).toContain('Diseño UI/UX');
      expect(DIRECTORY_CATEGORIES).toContain('Móvil');
      expect(DIRECTORY_CATEGORIES).toContain('Backend & Cloud');
    });

    it('cada perfil semilla debe tener campos obligatorios válidos', () => {
      expect(SEED_DIRECTORY_PROFILES.length).toBeGreaterThan(0);

      for (const profile of SEED_DIRECTORY_PROFILES) {
        expect(profile.id).toBeDefined();
        expect(profile.name).toBeTruthy();
        expect(profile.slug).toBeTruthy();
        expect(profile.profession).toBeTruthy();
        expect(profile.skills.length).toBeGreaterThan(0);
        expect(DIRECTORY_CATEGORIES).toContain(profile.category);
      }
    });
  });
});

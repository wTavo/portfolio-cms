/**
 * @file showcase.service.test.ts
 * @description Pruebas unitarias para el servicio de Showcase Dual de creadores.
 */

import { describe, it, expect } from 'vitest';
import {
  getShowcaseData,
  SEED_DUAL_CREATORS,
  SHARED_TECH_STACK,
} from '../../src/lib/services/showcase.service';

describe('Servicio de Showcase Dual', () => {
  it('debe contener los 2 perfiles base de creadores en los datos semilla', () => {
    expect(SEED_DUAL_CREATORS.length).toBe(2);

    const [gustavo, partner] = SEED_DUAL_CREATORS;
    expect(gustavo.slug).toBe('gustavo');
    expect(gustavo.name).toBe('Gustavo Morales');
    expect(gustavo.skills.length).toBeGreaterThan(0);
    expect(gustavo.featuredProjects.length).toBeGreaterThan(0);

    expect(partner.slug).toBe('partner');
    expect(partner.skills.length).toBeGreaterThan(0);
  });

  it('debe devolver la pila de tecnologías compartidas válida', () => {
    expect(SHARED_TECH_STACK).toContain('Astro');
    expect(SHARED_TECH_STACK).toContain('React 19');
    expect(SHARED_TECH_STACK).toContain('TypeScript');
    expect(SHARED_TECH_STACK).toContain('Cloudflare Workers');
  });

  it('getShowcaseData debe devolver siempre al menos 2 creadores y la pila tecnológica', async () => {
    const data = await getShowcaseData();
    expect(data.creators.length).toBeGreaterThanOrEqual(2);
    expect(data.sharedTechnologies.length).toBeGreaterThan(0);
  });
});

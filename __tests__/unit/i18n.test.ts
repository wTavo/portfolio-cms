/**
 * @file i18n.test.ts
 * @description Pruebas unitarias para el diccionario centralizado de internacionalización (Directiva 2).
 */

import { describe, it, expect } from 'vitest';
import { i18n } from '../../src/lib/i18n/es';

describe('Diccionario i18n centralizado (es.ts)', () => {
  it('debe contener todas las secciones requeridas', () => {
    expect(i18n.common).toBeDefined();
    expect(i18n.auth).toBeDefined();
    expect(i18n.admin).toBeDefined();
    expect(i18n.dashboard).toBeDefined();
    expect(i18n.showcase).toBeDefined();
    expect(i18n.theme).toBeDefined();
    expect(i18n.contact).toBeDefined();
    expect(i18n.errors).toBeDefined();
  });

  it('debe tener cadenas válidas para el selector de tema', () => {
    expect(i18n.theme.toggle).toBe('Alternar tema');
    expect(i18n.theme.light).toBe('Modo claro');
    expect(i18n.theme.dark).toBe('Modo oscuro');
  });

  it('debe tener cadenas válidas para el modal de contacto', () => {
    expect(i18n.contact.title).toBe('Contacto');
    expect(i18n.contact.closeButton).toBe('Cerrar');
    expect(i18n.contact.sendButton).toBe('Enviar mensaje');
  });

  it('no debe contener la palabra "Cancelar" en botones de descarte (Directiva 2)', () => {
    const jsonStr = JSON.stringify(i18n);
    expect(jsonStr).not.toContain('"Cancelar"');
  });
});

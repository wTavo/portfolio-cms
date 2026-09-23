/**
 * @file glyph.paths.test.ts
 * @description Pruebas unitarias para el diccionario tipográfico de glifos vectoriales y cálculo de moldes.
 */

import { describe, it, expect } from 'vitest';
import { GLYPH_PATHS } from '../../src/lib/typography/glyphPaths';

describe('glyphPaths - Diccionario Tipográfico Vectorial', () => {
  const targetChars = 'PORTAFOLIO PROFESIONAL'.split('');

  it('contiene definiciones de path y ancho para todos los caracteres del título', () => {
    targetChars.forEach((ch) => {
      const data = GLYPH_PATHS[ch];
      expect(data).toBeDefined();
      expect(data.advanceWidth).toBeGreaterThan(0);
      if (ch !== ' ') {
        expect(data.d.length).toBeGreaterThan(10);
        expect(data.d.startsWith('M')).toBe(true);
        expect(data.subpaths.length).toBeGreaterThan(0);
        data.subpaths.forEach((sub) => {
          expect(sub.startsWith('M')).toBe(true);
          expect(sub.endsWith('Z')).toBe(true);
        });
      }
    });
  });

  it('calcula dimensiones válidas para el alfabeto español completo', () => {
    const spanishAlphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ'.split('');
    spanishAlphabet.forEach((letter) => {
      const glyph = GLYPH_PATHS[letter];
      expect(glyph).toBeDefined();
      expect(glyph.advanceWidth).toBeGreaterThan(200);
      expect(glyph.advanceWidth).toBeLessThan(1200);
      expect(glyph.d).toContain('M');
    });
  });

  it('verifica que el espacio tenga ancho de separación sin trazado', () => {
    const space = GLYPH_PATHS[' '];
    expect(space).toBeDefined();
    expect(space.d).toBe('');
    expect(space.advanceWidth).toBeGreaterThan(100);
  });
});

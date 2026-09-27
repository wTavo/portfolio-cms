/**
 * @file keyboard.offset.test.ts
 * @description Pruebas unitarias para el algoritmo de cálculo de teclado virtual (calculateKeyboardOffset).
 */

import { describe, it, expect } from 'vitest';
import {
  calculateKeyboardOffset,
  calculateSafeKeyboardOffset,
} from '../../src/lib/hooks/useKeyboardOffset';

describe('calculateKeyboardOffset', () => {
  it('retorna 0 cuando el viewport no está reducido (sin teclado)', () => {
    const offset = calculateKeyboardOffset(800, 800);
    expect(offset).toBe(0);
  });

  it('retorna 0 para diferencias pequeñas atribuibles a barras de navegación de navegador (< 100px)', () => {
    const offset = calculateKeyboardOffset(800, 740);
    expect(offset).toBe(0);
  });

  it('calcula la elevación correcta cuando el teclado virtual está desplegado (> 100px)', () => {
    const offset = calculateKeyboardOffset(844, 544);
    expect(offset).toBe(135);
  });

  it('maneja teclados grandes (ej. 400px en tablets o pantallas altas)', () => {
    const offset = calculateKeyboardOffset(900, 500);
    expect(offset).toBe(180);
  });

  it('protege contra valores invertidos o negativos de visualHeight', () => {
    const offset = calculateKeyboardOffset(800, 900);
    expect(offset).toBe(0);
  });
});

describe('calculateSafeKeyboardOffset', () => {
  it('retorna 0 si no hay teclado activo', () => {
    const offset = calculateSafeKeyboardOffset(800, 800, 300);
    expect(offset).toBe(0);
  });

  it('eleva con valor negativo cuando el teclado está desplegado y hay espacio superior amplio', () => {
    // Pantalla 800, visible 500 (teclado 300), modal 300, margen 16
    // ideal = -135. Espacio en reposo = (800-300)/2 = 250. maxShift = 250 - 16 = 234.
    // min(135, 234) = -135
    const offset = calculateSafeKeyboardOffset(800, 500, 300, 16);
    expect(offset).toBe(-135);
  });

  it('limita la elevación para nunca cortar el borde superior (clamping)', () => {
    // Pantalla 600, visible 300 (teclado 300), modal 440, margen 16
    // ideal = -135. Espacio en reposo = (600-440)/2 = 80. maxShift = 80 - 16 = 64.
    // min(135, 64) = -64
    const offset = calculateSafeKeyboardOffset(600, 300, 440, 16);
    expect(offset).toBe(-64);
  });
});


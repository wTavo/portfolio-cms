/**
 * @file keyboard.offset.test.ts
 * @description Pruebas unitarias para el algoritmo de cálculo de teclado virtual (calculateKeyboardOffset).
 */

import { describe, it, expect } from 'vitest';
import { calculateKeyboardOffset } from '../../src/lib/hooks/useKeyboardOffset';

describe('calculateKeyboardOffset', () => {
  it('retorna 0 cuando el viewport no está reducido (sin teclado)', () => {
    // Pantalla de 800px y visualViewport de 800px
    const offset = calculateKeyboardOffset(800, 800);
    expect(offset).toBe(0);
  });

  it('retorna 0 para diferencias pequeñas atribuibles a barras de navegación de navegador (< 100px)', () => {
    // Diferencia de 60px (ej. barra de URL encogiéndose)
    const offset = calculateKeyboardOffset(800, 740);
    expect(offset).toBe(0);
  });

  it('calcula la elevación correcta cuando el teclado virtual está desplegado (> 100px)', () => {
    // Pantalla de 844px (iPhone / Android) y teclado de 300px (visualHeight = 544px)
    // keyboardHeight = 300px. Offset = Math.round(300 * 0.45) = 135px
    const offset = calculateKeyboardOffset(844, 544);
    expect(offset).toBe(135);
  });

  it('maneja teclados grandes (ej. 400px en tablets o pantallas altas)', () => {
    // 900px total, 500px visible -> teclado de 400px
    // 400 * 0.45 = 180px
    const offset = calculateKeyboardOffset(900, 500);
    expect(offset).toBe(180);
  });

  it('protege contra valores invertidos o negativos de visualHeight', () => {
    // Si visualHeight es mayor que windowHeight por alguna anomalía de zoom out
    const offset = calculateKeyboardOffset(800, 900);
    expect(offset).toBe(0);
  });
});

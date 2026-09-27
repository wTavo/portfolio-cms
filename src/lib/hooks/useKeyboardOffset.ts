/**
 * @file useKeyboardOffset.ts
 * @description Hook y utilidades reactivas para el cálculo dinámico de la altura del teclado virtual móvil (IME Inset Avoidance),
 * adaptando modales y formularios al área visible sin oclusiones.
 */

import { useState, useEffect } from 'react';

export interface KeyboardOffsetResult {
  /** Desplazamiento vertical en píxeles hacia arriba para recentrar el modal sobre el teclado */
  keyboardOffset: number;
  /** Altura actual del viewport visual interactivo en píxeles (si está disponible) */
  viewportHeight: number | null;
  /** Booleano que indica si el teclado virtual está desplegado */
  isKeyboardOpen: boolean;
}

/**
 * Calcula el offset vertical en píxeles para recentrar el modal según la altura del teclado virtual.
 *
 * @param windowHeight - Altura total de la ventana (window.innerHeight).
 * @param visualHeight - Altura visible disponible reportada por window.visualViewport.
 * @returns {number} Cantidad de píxeles a elevar el modal.
 */
export function calculateKeyboardOffset(windowHeight: number, visualHeight: number): number {
  const keyboardHeight = Math.max(0, windowHeight - visualHeight);
  // Un teclado virtual móvil suele medir entre 180px y 450px (> 100px para evitar barras de navegación)
  if (keyboardHeight > 100) {
    return Math.round(keyboardHeight * 0.45);
  }
  return 0;
}

/**
 * Calcula dinámicamente el espacio del teclado virtual en dispositivos móviles usando la Visual Viewport API.
 *
 * @param isOpen - Estado de visibilidad del modal o diálogo contenedor.
 * @returns {KeyboardOffsetResult} Valores reactivos de desplazamiento y altura visual.
 */
export function useKeyboardOffset(isOpen: boolean): KeyboardOffsetResult {
  const [keyboardOffset, setKeyboardOffset] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) {
      setKeyboardOffset(0);
      setViewportHeight(null);
      setIsKeyboardOpen(false);
      return;
    }

    const vv = window.visualViewport;

    const handleViewportChange = () => {
      if (!vv) return;
      const currentVisualHeight = vv.height;
      const windowHeight = window.innerHeight;
      const offset = calculateKeyboardOffset(windowHeight, currentVisualHeight);

      setViewportHeight(currentVisualHeight);
      setKeyboardOffset(offset);
      setIsKeyboardOpen(offset > 0);
    };

    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);

    // Ejecución inicial al abrir el modal
    handleViewportChange();

    return () => {
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
      setKeyboardOffset(0);
      setViewportHeight(null);
      setIsKeyboardOpen(false);
    };
  }, [isOpen]);

  return { keyboardOffset, viewportHeight, isKeyboardOpen };
}

/**
 * @file useKeyboardOffset.ts
 * @description Hook y utilidades para detección de teclado virtual en móviles (IME Detection),
 * permitiendo una elevación GPU fluida y sin rebotes al alternar entre campos de texto.
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Calcula el offset vertical en píxeles para recentrar el modal según la altura del teclado virtual.
 *
 * @param windowHeight - Altura total de la ventana (window.innerHeight).
 * @param visualHeight - Altura visible disponible reportada por window.visualViewport.
 * @returns {number} Cantidad de píxeles calculados.
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
 * Hook que detecta si el teclado virtual está activo exclusivamente en dispositivos móviles (< 768px).
 * Mantiene el estado activo de forma continua mientras se alternan campos dentro del formulario,
 * evitando que el modal baje y suba al pasar de un input a otro.
 *
 * @param isOpen - Estado de visibilidad del modal contenedor.
 * @returns {boolean} True solo si es móvil y el teclado virtual está activo por foco en inputs.
 */
export function useKeyboardActive(isOpen: boolean): boolean {
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const isInputFocusedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      setIsKeyboardActive(false);
      return;
    }

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Detectar cuando cualquier input o textarea dentro del modal gana foco
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        isInputFocusedRef.current = true;
        setIsKeyboardActive(true);
      }
    };

    // Detectar cuando pierde foco; esperamos 90ms para verificar si el foco pasó a otro campo
    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement;
        const stillInInput =
          active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

        if (!stillInInput) {
          isInputFocusedRef.current = false;
          setIsKeyboardActive(false);
        }
      }, 90);
    };

    // Sincronizar también con la salida del teclado por botón físico/atrás del SO
    const handleViewportResize = () => {
      if (!window.visualViewport) return;
      const isFullHeight = window.visualViewport.height >= window.innerHeight - 80;
      if (isFullHeight && !isInputFocusedRef.current) {
        setIsKeyboardActive(false);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      setIsKeyboardActive(false);
      isInputFocusedRef.current = false;
    };
  }, [isOpen]);

  return isKeyboardActive;
}

// Alias para compatibilidad
export const useKeyboardOffset = useKeyboardActive;

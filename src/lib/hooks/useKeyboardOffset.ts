/**
 * @file useKeyboardOffset.ts
 * @description Hook y utilidades reactivas para el cálculo dinámico del área visual disponible (Visual Viewport API),
 * con estabilización histerética para evitar rebotes o saltos al alternar entre campos de texto.
 */

import { useState, useEffect, useRef } from 'react';

export interface KeyboardOffsetResult {
  /** Altura actual del viewport visual interactivo en píxeles (si está disponible) */
  viewportHeight?: number;
  /** Desplazamiento superior del visual viewport en píxeles */
  offsetTop: number;
  /** Booleano que indica si el teclado virtual está desplegado */
  isKeyboardOpen: boolean;
  /** Desplazamiento vertical residual en píxeles para compatibilidad */
  keyboardOffset: number;
}

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
 * Monitorea el viewport visual interactivo en dispositivos móviles usando la Visual Viewport API.
 * Cuenta con estabilización temporal (debounce/histeresis) para evitar oscilaciones cuando el foco
 * cambia de un campo de texto a otro (blur -> focus).
 *
 * @param isOpen - Estado de visibilidad del modal o diálogo contenedor.
 * @returns {KeyboardOffsetResult} Dimensiones visuales sincronizadas y estabilizadas.
 */
export function useKeyboardOffset(isOpen: boolean): KeyboardOffsetResult {
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);
  const [offsetTop, setOffsetTop] = useState<number>(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [keyboardOffset, setKeyboardOffset] = useState<number>(0);

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      setViewportHeight(undefined);
      setOffsetTop(0);
      setIsKeyboardOpen(false);
      setKeyboardOffset(0);
      return;
    }

    const vv = window.visualViewport;

    const handleViewportChange = () => {
      if (!vv) return;
      const currentVisualHeight = vv.height;
      const windowHeight = window.innerHeight;
      const currentOffsetTop = vv.offsetTop || 0;
      const offset = calculateKeyboardOffset(windowHeight, currentVisualHeight);
      const keyboardIsUp = offset > 0;

      if (keyboardIsUp) {
        // Al abrir o mantener el teclado, aplicar la altura inmediatamente y cancelar cualquier cierre en curso
        if (dismissTimerRef.current) {
          clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = null;
        }
        setViewportHeight(currentVisualHeight);
        setOffsetTop(currentOffsetTop);
        setKeyboardOffset(offset);
        setIsKeyboardOpen(true);
      } else {
        // Cuando el sistema reporta que el teclado baja temporalmente (ej. durante el cambio de un input a otro),
        // esperamos 140ms antes de desarmar la altura. Si en ese lapso otro input recibe el foco, no hay rebote.
        if (dismissTimerRef.current) {
          clearTimeout(dismissTimerRef.current);
        }

        dismissTimerRef.current = setTimeout(() => {
          const activeTag = document.activeElement?.tagName?.toLowerCase();
          const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

          // Solo restaurar la altura completa si realmente ningún campo sigue enfocado
          if (!isInputFocused) {
            setViewportHeight(undefined);
            setOffsetTop(0);
            setIsKeyboardOpen(false);
            setKeyboardOffset(0);
          }
          dismissTimerRef.current = null;
        }, 140);
      }
    };

    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);

    // Sincronización inicial al abrir
    handleViewportChange();

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
      setViewportHeight(undefined);
      setOffsetTop(0);
      setIsKeyboardOpen(false);
      setKeyboardOffset(0);
    };
  }, [isOpen]);

  return { viewportHeight, offsetTop, isKeyboardOpen, keyboardOffset };
}

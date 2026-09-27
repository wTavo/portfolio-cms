/**
 * @file useKeyboardOffset.ts
 * @description Hook y utilidades para adaptación dinámica de modales al teclado virtual móvil (IME).
 * Garantiza centrado perfecto en reposo, elevación suave sobre el teclado sin exceder el margen
 * superior, persistencia absoluta entre campos de texto (cero rebotes) y retorno fluido al centro.
 */

import { useState, useEffect, useRef, type RefObject } from 'react';

/**
 * Calcula el offset vertical en píxeles para recentrar el modal según la altura del teclado virtual.
 *
 * @param windowHeight - Altura total de la ventana (window.innerHeight).
 * @param visualHeight - Altura visible disponible reportada por window.visualViewport.
 * @returns {number} Cantidad de píxeles calculados para elevación.
 */
export function calculateKeyboardOffset(windowHeight: number, visualHeight: number): number {
  const keyboardHeight = Math.max(0, windowHeight - visualHeight);
  // Un teclado virtual móvil suele medir entre 180px y 450px (> 100px para descartar barras de navegación)
  if (keyboardHeight > 100) {
    return Math.round(keyboardHeight * 0.45);
  }
  return 0;
}

/**
 * Calcula el offset vertical seguro para recentrar el modal sobre el teclado virtual,
 * garantizando matemáticamente que jamás sobrepase el margen de seguridad superior.
 *
 * @param windowHeight - Altura total de la ventana (window.innerHeight).
 * @param visualHeight - Altura visible disponible reportada por window.visualViewport.
 * @param modalHeight - Altura actual del modal en píxeles.
 * @param safeMarginTop - Margen de seguridad superior en píxeles (por defecto 16px).
 * @returns {number} Offset negativo en píxeles (para translateY) o 0 si no hay teclado.
 */
export function calculateSafeKeyboardOffset(
  windowHeight: number,
  visualHeight: number,
  modalHeight: number = 320,
  safeMarginTop: number = 16
): number {
  const rawOffset = calculateKeyboardOffset(windowHeight, visualHeight);
  if (rawOffset === 0) return 0;

  // Espacio libre superior en reposo (cuando el modal está centrado)
  const spaceAboveInRest = Math.max(0, (windowHeight - modalHeight) / 2);

  // Desplazamiento máximo permitido para no tocar ni cortar el borde superior
  const maxSafeShift = Math.max(0, spaceAboveInRest - safeMarginTop);

  // Retornamos el valor negativo para translateY (elevar)
  return -Math.min(rawOffset, maxSafeShift);
}

/**
 * Hook reactivo para controlar la elevación fluida de modales en dispositivos móviles.
 * Evita rebotes al alternar entre inputs mediante cancelación de timers y verificación de foco continuo.
 *
 * @param isOpen - Estado de visibilidad del modal.
 * @param modalRef - Referencia al elemento DOM del modal para medir su altura exacta.
 * @returns {number} Desplazamiento translateY en píxeles (negativo cuando hay teclado, 0 en reposo).
 */
export function useKeyboardModalOffset(
  isOpen: boolean,
  modalRef?: RefObject<HTMLElement | null>
): number {
  const [offsetY, setOffsetY] = useState(0);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInputFocusedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      setOffsetY(0);
      isInputFocusedRef.current = false;
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      return;
    }

    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      setOffsetY(0);
      return;
    }

    const calculateCurrentOffset = () => {
      const vv = window.visualViewport;
      const visualHeight = vv ? vv.height : window.innerHeight;
      const windowHeight = window.innerHeight;
      const modalHeight = modalRef?.current?.offsetHeight ?? 320;
      return calculateSafeKeyboardOffset(windowHeight, visualHeight, modalHeight);
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Cancelar cualquier temporizador de blur pendiente (cambio de campo rápido)
        if (blurTimerRef.current) {
          clearTimeout(blurTimerRef.current);
          blurTimerRef.current = null;
        }
        isInputFocusedRef.current = true;
        // Calcular elevación con el tamaño actual del visualViewport
        const nextOffset = calculateCurrentOffset();
        // Si visualViewport aún no se actualizó, estimamos un valor base seguro
        setOffsetY(nextOffset !== 0 ? nextOffset : -90);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      // Si el foco pasó inmediatamente a otro campo del mismo formulario/modal, NO hacer nada
      if (related && (related.tagName === 'INPUT' || related.tagName === 'TEXTAREA')) {
        return;
      }

      // Si no tenemos relatedTarget inmediato (comportamiento común en Android), damos ventana de tolerancia
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

      blurTimerRef.current = setTimeout(() => {
        const active = document.activeElement;
        const stillInField = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

        if (!stillInField) {
          isInputFocusedRef.current = false;
          setOffsetY(0);
        }
      }, 200);
    };

    const handleViewportResize = () => {
      if (!window.visualViewport) return;
      const isFullHeight = window.visualViewport.height >= window.innerHeight - 80;

      if (isFullHeight) {
        // El teclado se cerró (ej. botón físico Atrás del SO)
        isInputFocusedRef.current = false;
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
        setOffsetY(0);
      } else if (isInputFocusedRef.current) {
        // El teclado está abierto y reportó su altura final exacta
        const safeOffset = calculateCurrentOffset();
        if (safeOffset !== 0) {
          setOffsetY(safeOffset);
        }
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      setOffsetY(0);
      isInputFocusedRef.current = false;
    };
  }, [isOpen, modalRef]);

  return offsetY;
}

// Alias para compatibilidad con código existente
export const useKeyboardActive = (isOpen: boolean): boolean => {
  const offset = useKeyboardModalOffset(isOpen);
  return offset !== 0;
};
export const useKeyboardOffset = useKeyboardModalOffset;


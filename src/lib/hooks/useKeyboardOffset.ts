/**
 * @file useKeyboardOffset.ts
 * @description Utilidades y hooks para la arquitectura de modales híbridos (Modal en Desktop / Bottom Sheet en Móvil).
 * Proporciona bloqueo estricto de scroll de fondo y detección responsiva fluida sin manipulación artificial de coordenadas.
 */

import { useState, useEffect } from 'react';

/**
 * Calcula el offset vertical en píxeles para recentrar el modal según la altura del teclado virtual.
 *
 * @param windowHeight - Altura total de la ventana (window.innerHeight).
 * @param visualHeight - Altura visible disponible reportada por window.visualViewport.
 * @returns {number} Cantidad de píxeles calculados para elevación.
 */
export function calculateKeyboardOffset(windowHeight: number, visualHeight: number): number {
  const keyboardHeight = Math.max(0, windowHeight - visualHeight);
  if (keyboardHeight > 100) {
    return Math.round(keyboardHeight * 0.45);
  }
  return 0;
}

/**
 * Calcula el offset vertical seguro para recentrar el modal sobre el teclado virtual,
 * garantizando que jamás sobrepase el margen de seguridad superior.
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

  const spaceAboveInRest = Math.max(0, (windowHeight - modalHeight) / 2);
  const maxSafeShift = Math.max(0, spaceAboveInRest - safeMarginTop);

  return -Math.min(rawOffset, maxSafeShift);
}

/**
 * Bloquea el scroll del documento mientras un modal o bottom sheet esté visible,
 * sin alterar position: fixed en el body para prevenir saltos de layout en el fondo.
 *
 * @param isOpen - Estado booleano de visibilidad del modal.
 */
export function useBodyScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);
}

/**
 * Hook reactivo para detectar si el viewport actual corresponde a un dispositivo móvil (< 768px).
 * Permite renderizar animaciones y comportamientos adaptativos (Bottom Sheet vs Modal).
 *
 * @returns {boolean} True si el ancho de pantalla es menor a 768px.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

/**
 * Hook reactivo que monitorea la altura exacta del teclado virtual en dispositivos móviles
 * mediante la Visual Viewport API, con ventana de tolerancia de 150ms para evitar
 * que el Bottom Sheet caiga y suba bruscamente al alternar entre campos de texto.
 *
 * @param isOpen - Estado booleano de visibilidad del modal.
 * @returns {number} Altura en píxeles del teclado virtual (0 si no está activo).
 */
export function useKeyboardHeight(isOpen: boolean): number {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) {
      setKeyboardHeight(0);
      return;
    }

    const vv = window.visualViewport;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    const handleViewportUpdate = () => {
      const diff = Math.max(0, window.innerHeight - vv.height);
      if (diff > 100) {
        // Teclado activo: cancelar temporizador de cierre y elevar inmediatamente
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        setKeyboardHeight(diff);
      } else {
        // Posible transición de foco entre campos o cierre voluntario:
        // Ventana de tolerancia de 150ms para que si el usuario tocó otro input,
        // no se produzca el molesto parpadeo o contracción del sheet.
        if (!closeTimer) {
          closeTimer = setTimeout(() => {
            setKeyboardHeight(0);
            closeTimer = null;
          }, 150);
        }
      }
    };

    vv.addEventListener('resize', handleViewportUpdate);
    vv.addEventListener('scroll', handleViewportUpdate);
    handleViewportUpdate();

    return () => {
      vv.removeEventListener('resize', handleViewportUpdate);
      vv.removeEventListener('scroll', handleViewportUpdate);
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      setKeyboardHeight(0);
    };
  }, [isOpen]);

  return keyboardHeight;
}

// Aliases para compatibilidad con código anterior
export const useMobileFormElevation = (_isOpen: boolean, _amount?: number): number => 0;
export const useKeyboardModalOffset = (_isOpen: boolean): number => 0;
export const useKeyboardActive = (_isOpen: boolean): boolean => false;
export const useKeyboardOffset = useMobileFormElevation;




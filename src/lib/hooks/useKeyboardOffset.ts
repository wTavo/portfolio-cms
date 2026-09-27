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
 * fijando la posición del viewport para impedir desplazamientos nativos espurios
 * al interactuar con campos de formulario en dispositivos móviles.
 *
 * @param isOpen - Estado booleano de visibilidad del modal.
 */
export function useBodyScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyWidth = document.body.style.width;
    const originalHtmlPosition = document.documentElement.style.position;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';

    // Congelar cualquier contenedor interno de desplazamiento en la página detrás del modal
    const backgroundScrollElements = document.querySelectorAll<HTMLElement>(
      'main, [class*="overflow-y-auto"], .snap-mandatory'
    );
    const originalOverflows = new Map<HTMLElement, string>();

    backgroundScrollElements.forEach((el) => {
      if (!el.closest('[role="dialog"]')) {
        originalOverflows.set(el, el.style.overflow);
        el.style.overflow = 'hidden';
      }
    });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.width = originalBodyWidth;
      document.documentElement.style.position = originalHtmlPosition;
      document.documentElement.style.width = '';
      originalOverflows.forEach((originalVal, el) => {
        el.style.overflow = originalVal;
      });
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

export interface VisualViewportInfo {
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  viewportHeight: number;
}

/**
 * Hook reactivo que monitorea la altura exacta del teclado virtual en dispositivos móviles
 * mediante la Visual Viewport API, con ventana de tolerancia de 150ms para evitar
 * que el modal caiga y suba bruscamente al alternar entre campos de texto.
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
      if (diff > 80) {
        // Teclado activo: cancelar temporizador de cierre y elevar inmediatamente
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        setKeyboardHeight(diff);
      } else {
        // Posible transición de foco entre campos o cierre voluntario
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

/**
 * Hook reactivo que provee la información integral del viewport visual en dispositivos móviles.
 * Retorna la altura del teclado, estado booleano de presencia de teclado y la altura visible disponible.
 *
 * @param isOpen - Estado booleano de visibilidad del modal.
 * @returns {VisualViewportInfo} Métricas reactivas del viewport visual.
 */
export function useVisualViewportInfo(isOpen: boolean): VisualViewportInfo {
  const [info, setInfo] = useState<VisualViewportInfo>(() => ({
    keyboardHeight: 0,
    isKeyboardOpen: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    const handleUpdate = () => {
      const vv = window.visualViewport;
      const currentInnerHeight = window.innerHeight;
      const currentVvHeight = vv ? vv.height : currentInnerHeight;
      const diff = Math.max(0, currentInnerHeight - currentVvHeight);
      const isKeyboard = diff > 80;

      if (isKeyboard) {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        setInfo({
          keyboardHeight: diff,
          isKeyboardOpen: true,
          viewportHeight: Math.round(currentVvHeight),
        });
      } else {
        if (!closeTimer) {
          closeTimer = setTimeout(() => {
            setInfo({
              keyboardHeight: 0,
              isKeyboardOpen: false,
              viewportHeight: currentInnerHeight,
            });
            closeTimer = null;
          }, 150);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleUpdate);
      window.visualViewport.addEventListener('scroll', handleUpdate);
    }
    window.addEventListener('resize', handleUpdate);
    handleUpdate();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleUpdate);
        window.visualViewport.removeEventListener('scroll', handleUpdate);
      }
      window.removeEventListener('resize', handleUpdate);
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    };
  }, [isOpen]);

  return info;
}

// Aliases para compatibilidad con código anterior
export const useMobileFormElevation = (_isOpen: boolean, _amount?: number): number => 0;
export const useKeyboardModalOffset = (_isOpen: boolean): number => 0;
export const useKeyboardActive = (_isOpen: boolean): boolean => false;
export const useKeyboardOffset = useMobileFormElevation;




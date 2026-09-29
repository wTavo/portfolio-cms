/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con adaptación en tiempo real al teclado virtual (Directivas 5, 12, 14, 31, 32).
 * Centra el modal en el espacio disponible sobre el teclado y ajusta la posición de los campos solo cuando el modal no cabe completo.
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOTION_DURATIONS } from '../../lib/motion';
import { i18n } from '../../lib/i18n/es';
import { XIcon } from '../icons/Icons';
import { useBodyScrollLock } from '../../lib/hooks/useKeyboardOffset';

export interface AdaptiveModalProps {
  /** Estado de visibilidad del modal */
  isOpen: boolean;
  /** Callback ejecutado al solicitar el cierre */
  onClose: () => void;
  /** Título principal de la cabecera */
  title: string;
  /** Subtítulo o texto descriptivo secundario opcional */
  subtitle?: string;
  /** Icono decorativo opcional a la izquierda del título */
  icon?: React.ReactNode;
  /** Contenido principal del cuerpo del modal */
  children: React.ReactNode;
  /** Pie de acción inferior opcional (fijo - Directiva 12) */
  footer?: React.ReactNode;
  /** Clase Tailwind para ancho máximo (por defecto 'max-w-md') */
  maxWidthClass?: string;
  /** Habilitar o deshabilitar botón de cierre 'X' (por defecto true) */
  showCloseButton?: boolean;
  /** Habilitar gesto de arrastre vertical (mantenido por compatibilidad de props) */
  enableDragToDismiss?: boolean;
  /** ID accesible para aria-labelledby */
  ariaLabelledBy?: string;
  /** Clase CSS adicional para el contenedor del cuerpo scrolleable */
  contentClassName?: string;
}

export default function AdaptiveModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidthClass = 'max-w-md',
  showCloseButton = true,
  ariaLabelledBy = 'adaptive-modal-title',
  contentClassName = '',
}: AdaptiveModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /** Hook de efecto de layout seguro para SSR */
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  /** Métricas reactivas del viewport visual en tiempo real */
  const [viewportMetrics, setViewportMetrics] = useState(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isKeyboardOpen: false,
  }));

  /** Estado reactivo que indica si la tarjeta modal cabe completa en el espacio visible */
  const [modalFits, setModalFits] = useState<boolean>(true);
  const modalFitsRef = useRef<boolean>(true);
  /** Estado reactivo del campo activo para recentrar únicamente con teclado abierto */
  const [activeInput, setActiveInput] = useState<HTMLElement | null>(null);

  const lastWindowWidth = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  /** Altura base del viewport sin teclado virtual activo */
  const baselineHeightRef = useRef<number>(
    typeof window !== 'undefined'
      ? Math.max(window.innerHeight, window.visualViewport ? Math.round(window.visualViewport.height) : 0)
      : 0
  );
  /** Referencia al último campo interactuado para preservar centrado al redimensionar teclado */
  const activeInputRef = useRef<HTMLElement | null>(null);
  /** Altura mínima estable alcanzada durante el despliegue del teclado para congelar la altura */
  const minStableHeight = useRef<number | null>(null);
  /** Temporizador para registrar cambios deliberados y estables en el tamaño del teclado */
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Temporizador para descartar micro-glitches de blur transitorios al alternar entre campos */
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Indicador de interacción activa con un campo para prevenir cierres involuntarios durante alternancia */
  const isInteractingWithInput = useRef<boolean>(false);
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Posición de scroll previa a la apertura del teclado para restaurar exactamente la intención del usuario */
  const userScrollBeforeKeyboardRef = useRef<number>(0);
  /** Indicador de si el usuario está realizando un desplazamiento táctil o con ratón directo */
  const isUserDraggingScroll = useRef<boolean>(false);

  /**
   * Centra un elemento dentro del contenedor de scroll sin desplazar la ventana del navegador.
   */
  const centerElementInContainer = (container: HTMLElement, target: HTMLElement) => {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const currentCenterOffset =
      targetRect.top + targetRect.height / 2 - (containerRect.top + containerRect.height / 2);
    container.scrollTo({
      top: Math.max(0, container.scrollTop + currentCenterOffset),
      behavior: 'smooth',
    });
  };

  // Bloqueo estricto del scroll del documento de fondo
  useBodyScrollLock(isOpen);

  // 1. Sincronización con el teclado virtual y congelamiento de altura con minStableHeight
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      minStableHeight.current = null;
      activeInputRef.current = null;
      setActiveInput(null);
      isInteractingWithInput.current = false;
      userScrollBeforeKeyboardRef.current = 0;
      isUserDraggingScroll.current = false;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      return;
    }

    // Inicializar o sincronizar altura base del viewport al abrir el modal
    const vvInit = window.visualViewport;
    const currentInitHeight = vvInit ? Math.round(vvInit.height) : window.innerHeight;
    if (baselineHeightRef.current === 0 || currentInitHeight > baselineHeightRef.current) {
      baselineHeightRef.current = currentInitHeight;
    }

    const updateMetrics = () => {
      const vv = window.visualViewport;
      const currentHeight = vv ? Math.round(vv.height) : window.innerHeight;

      // Detección de rotación de pantalla (Directiva 32)
      if (Math.abs(window.innerWidth - lastWindowWidth.current) > 20) {
        lastWindowWidth.current = window.innerWidth;
        baselineHeightRef.current = currentHeight;
        minStableHeight.current = null;
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      } else if (currentHeight > baselineHeightRef.current) {
        // Si el viewport crece más allá de la base conocida (ej. se ocultó barra del navegador o cerró teclado), actualizar base
        baselineHeightRef.current = currentHeight;
      }

      const keyboardHeight = Math.max(0, baselineHeightRef.current - currentHeight);
      const isKeyboard = keyboardHeight > 80;

      // Neutralizar cualquier paneo involuntario de la ventana en navegadores móviles
      if (typeof window !== 'undefined' && (window.scrollX !== 0 || window.scrollY !== 0)) {
        window.scrollTo(0, 0);
      }

      if (isKeyboard) {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }

        if (currentHeight >= 30) {
          if (minStableHeight.current === null) {
            // Primer despliegue del teclado: congelar inmediatamente la altura
            minStableHeight.current = currentHeight;
          } else if (currentHeight < minStableHeight.current) {
            // Teclado agrandado o barra de autofill/sugerencias desplegada: adaptar al tamaño más compacto
            minStableHeight.current = currentHeight;
            if (resizeDebounceRef.current) {
              clearTimeout(resizeDebounceRef.current);
              resizeDebounceRef.current = null;
            }
          } else if (currentHeight > minStableHeight.current) {
            const heightDiff = currentHeight - minStableHeight.current;
            // Ignorar fluctuaciones de autofill/sugerencias (<= 85px) y transiciones de toque entre campos.
            // Si el usuario reduce deliberadamente el tamaño del teclado (> 85px), adaptar tras 200ms de reposo.
            if (!isInteractingWithInput.current && heightDiff > 85) {
              if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
              resizeDebounceRef.current = setTimeout(() => {
                resizeDebounceRef.current = null;
                if (minStableHeight.current !== null && currentHeight > minStableHeight.current) {
                  minStableHeight.current = currentHeight;
                  setViewportMetrics({
                    height: currentHeight,
                    isKeyboardOpen: true,
                  });
                }
              }, 200);
            }
          }
        }

        const effectiveHeight = minStableHeight.current ?? currentHeight;

        setViewportMetrics((prev) => {
          if (
            prev.height === effectiveHeight &&
            prev.isKeyboardOpen === true
          ) {
            return prev;
          }
          return {
            height: effectiveHeight,
            isKeyboardOpen: true,
          };
        });
      } else {
        // Teclado cerrado físicamente: restaurar inmediatamente altura completa y centrado sin retardo ni espacios residuales
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        if (resizeDebounceRef.current) {
          clearTimeout(resizeDebounceRef.current);
          resizeDebounceRef.current = null;
        }
        minStableHeight.current = null;
        activeInputRef.current = null;
        setActiveInput(null);
        setViewportMetrics({
          height: currentHeight,
          isKeyboardOpen: false,
        });

        // Restaurar la posición de scroll exacta en la que el usuario dejó el modal antes del teclado
        if (!modalFitsRef.current && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: userScrollBeforeKeyboardRef.current,
            behavior: 'smooth',
          });
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateMetrics);
    }
    window.addEventListener('resize', updateMetrics);

    updateMetrics();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateMetrics);
      }
      window.removeEventListener('resize', updateMetrics);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, [isOpen]);

  // 2. Comprobación precisa y dinámica de si la tarjeta modal cabe en el espacio disponible (ResizeObserver)
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const checkFit = () => {
      // 16px de margen de seguridad para respiración vertical de padding
      const fits = modal.offsetHeight + 16 <= viewportMetrics.height;
      modalFitsRef.current = fits;
      setModalFits(fits);

      // Si cabe completo, asegurar que el scroll se mantenga en 0
      if (fits && scrollContainerRef.current && scrollContainerRef.current.scrollTop !== 0) {
        scrollContainerRef.current.scrollTop = 0;
      }
    };

    checkFit();

    // Observar cambios dinámicos en el contenido del modal (errores, acordeones, campos dinámicos)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(checkFit) : null;
    observer?.observe(modal);

    return () => {
      observer?.disconnect();
    };
  }, [isOpen, viewportMetrics.height]);

  // 3. Desplazamiento inteligente al input enfocado solo cuando el modal no cabe completo (Directiva 32)
  useIsomorphicLayoutEffect(() => {
    if (!isOpen || modalFits || !viewportMetrics.isKeyboardOpen) return;

    const scrollFocusedIntoView = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const domActiveEl = document.activeElement as HTMLElement | null;
      const activeEl =
        (domActiveEl &&
         container.contains(domActiveEl) &&
         ['INPUT', 'TEXTAREA', 'SELECT'].includes(domActiveEl.tagName)
          ? domActiveEl
          : null) ||
        (activeInputRef.current && container.contains(activeInputRef.current)
          ? activeInputRef.current
          : null) ||
        container.querySelector<HTMLElement>('input:focus, textarea:focus, select:focus');

      if (!activeEl || !container.contains(activeEl)) return;
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) return;

      // Verificar si el campo ya está cómodamente visible dentro del espacio disponible sobre el teclado
      const targetRect = activeEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const isAlreadyVisible =
        targetRect.top >= containerRect.top + 16 &&
        targetRect.bottom <= containerRect.bottom - 16;

      // Si ya está visible en pantalla, no mover el modal
      if (isAlreadyVisible) return;

      centerElementInContainer(container, activeEl);
    };

    scrollFocusedIntoView();
    const frameId = requestAnimationFrame(scrollFocusedIntoView);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, modalFits, viewportMetrics.isKeyboardOpen, viewportMetrics.height, activeInput]);

  // 4. Control de scroll manual cuando el modal excede la altura disponible
  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Solo si cabe completo se fuerza a 0; si no cabe completo, el scroll es 100% libre y natural
    if (modalFits && container.scrollTop !== 0) {
      container.scrollTop = 0;
      return;
    }

    // Registrar la posición voluntaria del usuario cuando el teclado no está abierto
    // o cuando el usuario arrastra intencionalmente con el dedo o ratón
    if (!viewportMetrics.isKeyboardOpen || isUserDraggingScroll.current) {
      userScrollBeforeKeyboardRef.current = container.scrollTop;
    }
  };

  /**
   * Manejador de foco sobre campos interactivos.
   * Registra el campo activo para que el hook de viewport lo centre únicamente
   * si el teclado virtual está desplegado, manteniendo el modal 100% inmóvil al tocar.
   */
  const handleInputFocus = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      activeInputRef.current = target;
      setActiveInput(target);
      isInteractingWithInput.current = true;
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = setTimeout(() => {
        isInteractingWithInput.current = false;
      }, 300);
    }
  };

  // 5. Cierre accesible con tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 touch-none overscroll-none">
          {/* Capa 1: Backdrop Fijo Inmóvil (fondo y desenfoque permanecen 100% estáticos) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATIONS.fast }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto touch-none"
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />

          {/* Capa 2: Contenedor sincronizado exactamente con el viewport visual sobre el teclado */}
          <div
            ref={scrollContainerRef}
            onScroll={handleContainerScroll}
            onTouchStart={() => {
              isUserDraggingScroll.current = true;
            }}
            onTouchEnd={() => {
              isUserDraggingScroll.current = false;
            }}
            onMouseDown={() => {
              isUserDraggingScroll.current = true;
            }}
            onMouseUp={() => {
              isUserDraggingScroll.current = false;
            }}
            onFocusCapture={handleInputFocus}
            className="fixed inset-x-0 top-0 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            style={{
              height: `${viewportMetrics.height}px`,
              transition: 'height var(--motion-duration-normal) var(--motion-easing-standard)',
              overflowY: modalFits ? 'hidden' : 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: modalFits ? 'none' : 'pan-y',
            }}
          >
            {/* Contenedor flexible: centrado absoluto si cabe; alineado arriba con scroll si excede */}
            <div
              className={`w-full flex flex-col items-center text-center p-2 sm:p-4 ${
                modalFits
                  ? 'h-full justify-center'
                  : 'min-h-full justify-start'
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              {/* Tarjeta Modal Flotante */}
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: MOTION_DURATIONS.fast,
                  ease: [0.2, 0, 0, 1],
                }}
                className={`relative w-full ${maxWidthClass} m-0 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left shrink-0`}
              >
                {/* Cabecera Fija de la Tarjeta */}
                <header className="px-4 sm:px-6 py-2 sm:py-3.5 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)] shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {icon && (
                      <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-brand-accent)] flex items-center justify-center shadow-[var(--shadow-card)] shrink-0">
                        {icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2
                        id={ariaLabelledBy}
                        className="text-base font-bold text-[var(--color-text-primary)] tracking-tight truncate"
                      >
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-w-(--size-touch-target) min-h-(--size-touch-target) flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] cursor-pointer shrink-0"
                      aria-label={i18n.common.close}
                    >
                      <XIcon size={18} />
                    </button>
                  )}
                </header>

                {/* Cuerpo del Modal */}
                <div className={`flex-1 ${contentClassName}`}>
                  {children}
                </div>

                {/* Pie con Botones de Acción (Directiva 12) */}
                {footer && (
                  <footer className="px-4 sm:px-6 py-2 sm:py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0">
                    {footer}
                  </footer>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

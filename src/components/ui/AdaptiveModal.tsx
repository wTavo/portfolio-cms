/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con adaptación en tiempo real al teclado virtual (Directivas 5, 12, 14, 31, 32).
 * Centra el modal en el espacio disponible sobre el teclado y ajusta la posición de los campos solo cuando el modal no cabe completo.
 */

import React, { useState, useEffect, useRef } from 'react';
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

  /** Métricas reactivas del viewport visual en tiempo real */
  const [viewportMetrics, setViewportMetrics] = useState(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isKeyboardOpen: false,
  }));

  /** Estado reactivo que indica si la tarjeta modal cabe completa en el espacio visible */
  const [modalFits, setModalFits] = useState<boolean>(true);

  const lastWindowWidth = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  /** Altura mínima estable alcanzada durante el despliegue del teclado para congelar la altura */
  const minStableHeight = useRef<number | null>(null);
  /** Temporizador para descartar micro-glitches de blur transitorios al alternar entre campos */
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Temporizador para registrar cambios deliberados y estables en el tamaño del teclado */
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bloqueo estricto del scroll del documento de fondo
  useBodyScrollLock(isOpen);

  // 1. Sincronización con el teclado virtual y congelamiento de altura con minStableHeight
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      minStableHeight.current = null;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      return;
    }

    // Altura física real de la pantalla según orientación (inmune a la reducción por teclado)
    const getScreenPhysicalHeight = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const screenH = typeof window.screen !== 'undefined' ? window.screen.height : window.innerHeight;
      const screenW = typeof window.screen !== 'undefined' ? window.screen.width : window.innerWidth;
      return isLandscape ? Math.min(screenH, screenW) : Math.max(screenH, screenW);
    };

    const updateMetrics = () => {
      // Detección de rotación de pantalla (Directiva 32)
      if (Math.abs(window.innerWidth - lastWindowWidth.current) > 20) {
        lastWindowWidth.current = window.innerWidth;
        minStableHeight.current = null;
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      }

      const vv = window.visualViewport;
      const currentHeight = vv ? Math.round(vv.height) : window.innerHeight;
      const fullScreenHeight = getScreenPhysicalHeight();
      const keyboardHeight = Math.max(0, fullScreenHeight - currentHeight);
      const isKeyboard = keyboardHeight > 60;

      // Neutralizar cualquier paneo involuntario de la ventana en navegadores móviles
      if (typeof window !== 'undefined' && (window.scrollX !== 0 || window.scrollY !== 0)) {
        window.scrollTo(0, 0);
      }

      if (isKeyboard) {
        // Cancelar temporizador de cierre si el teclado permanece activo
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }

        if (currentHeight >= 80) {
          if (minStableHeight.current === null) {
            // Primer despliegue del teclado: congelar inmediatamente
            minStableHeight.current = currentHeight;
          } else if (currentHeight < minStableHeight.current) {
            // Si la altura se reduce (ej. aparece barra de autofill, sugerencias o se agranda el teclado),
            // adoptar el valor más compacto para garantizar que nada quede cubierto.
            minStableHeight.current = currentHeight;
            if (resizeDebounceRef.current) {
              clearTimeout(resizeDebounceRef.current);
              resizeDebounceRef.current = null;
            }
          } else if (currentHeight > minStableHeight.current) {
            const heightDiff = currentHeight - minStableHeight.current;
            // Fluctuaciones de barras de credenciales, sugerencias o autofill (<= 90px) quedan 100% congeladas.
            // Solo cambios de tamaño deliberados del teclado (> 90px) se adaptan tras 300ms de reposo.
            if (heightDiff > 90) {
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
              }, 300);
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
        // Posible micro-transición de foco (blur entre inputs): esperar 180ms antes de liberar
        if (!closeTimerRef.current) {
          closeTimerRef.current = setTimeout(() => {
            closeTimerRef.current = null;
            minStableHeight.current = null;
            setViewportMetrics({
              height: currentHeight,
              isKeyboardOpen: false,
            });
          }, 180);
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
    };
  }, [isOpen]);

  // 2. Comprobación precisa de si la tarjeta modal cabe en el espacio disponible
  useEffect(() => {
    if (!isOpen) return;

    const checkFit = () => {
      const modal = modalRef.current;
      if (!modal) return;
      // 16px de margen de seguridad para respiración vertical de padding
      const fits = modal.offsetHeight + 16 <= viewportMetrics.height;
      setModalFits(fits);

      // Si cabe completo, asegurar que el scroll se mantenga en 0
      if (fits && scrollContainerRef.current && scrollContainerRef.current.scrollTop !== 0) {
        scrollContainerRef.current.scrollTop = 0;
      }
    };

    checkFit();
    const frameId = requestAnimationFrame(checkFit);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, viewportMetrics.height]);

  // 3. Desplazamiento inteligente al input enfocado solo cuando el modal no cabe completo (Directiva 32)
  useEffect(() => {
    if (!isOpen || modalFits) return;

    const scrollFocusedIntoView = () => {
      const container = scrollContainerRef.current;
      const activeEl = document.activeElement as HTMLElement | null;
      if (!container || !activeEl || !container.contains(activeEl)) return;
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) return;

      activeEl.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    };

    // Al desplegarse el teclado o reducirse el espacio en horizontal, centrar el input activo en pantalla
    const timer = setTimeout(scrollFocusedIntoView, 120);
    return () => clearTimeout(timer);
  }, [isOpen, modalFits, viewportMetrics.height]);

  // 4. Control de scroll manual cuando el modal excede la altura disponible
  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Solo si cabe completo se fuerza a 0; si no cabe completo, el scroll es 100% libre y natural
    if (modalFits && container.scrollTop !== 0) {
      container.scrollTop = 0;
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
            onFocusCapture={(e) => {
              if (modalFits) {
                if (scrollContainerRef.current && scrollContainerRef.current.scrollTop !== 0) {
                  scrollContainerRef.current.scrollTop = 0;
                }
              } else {
                // Si NO cabe completo (ej. horizontal con teclado), centrar el input enfocado para que nunca quede oculto
                const target = e.target as HTMLElement;
                if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                  setTimeout(() => {
                    target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
                  }, 100);
                }
              }
            }}
            className="fixed inset-x-0 top-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            style={{
              height: `${viewportMetrics.height}px`,
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
                {/* Cabecera Fija de la Tarjeta (Directiva 32: compacta en pantallas de altura reducida) */}
                <header className="px-4 sm:px-6 py-2 sm:py-3.5 short-screen:py-1.5 short-screen:px-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)] shrink-0">
                  <div className="flex items-center gap-3 short-screen:gap-2 min-w-0">
                    {icon && (
                      <div className="w-9 h-9 short-screen:w-7 short-screen:h-7 rounded-[var(--radius-lg)] short-screen:rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-brand-accent)] flex items-center justify-center shadow-[var(--shadow-card)] shrink-0">
                        {icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2
                        id={ariaLabelledBy}
                        className="text-base short-screen:text-sm font-bold text-[var(--color-text-primary)] tracking-tight truncate"
                      >
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-xs short-screen:text-[11px] text-[var(--color-text-secondary)] truncate">
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

                {/* Pie con Botones de Acción (Directivas 12 y 32) */}
                {footer && (
                  <footer className="px-4 sm:px-6 py-2 sm:py-3.5 short-screen:py-1.5 short-screen:px-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0">
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

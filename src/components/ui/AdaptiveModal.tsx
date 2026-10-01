/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con adaptación en tiempo real al teclado virtual (Directivas 3, 5, 7, 12, 14, 31, 32).
 * Centra la tarjeta cuando cabe en el viewport visible, alinea al inicio de forma estable ante el teclado virtual
 * y permite desplazarse limpiamente cuando el contenido excede la altura disponible sin alterar el fondo.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';
import { i18n } from '../../lib/i18n/es';
import { XIcon } from '../icons/Icons';
import ModalDialog from './ModalDialog';
import { getNextViewportMetrics, syncVisualViewportBounds } from '../../lib/visualViewportMetrics';
import { getModalFrameLayout, getModalTouchAction } from '../../lib/modalFrameLayout';

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
  /** Pie de acción inferior opcional, desplazable junto con la tarjeta */
  footer?: React.ReactNode;
  /** Clase Tailwind para ancho máximo (por defecto 'max-w-md') */
  maxWidthClass?: string;
  /** Habilitar o deshabilitar botón de cierre 'X' (por defecto true) */
  showCloseButton?: boolean;
  /** Habilitar gesto de arrastre vertical (mantenido por compatibilidad de props) */
  enableDragToDismiss?: boolean;
  /** ID accesible para aria-labelledby */
  ariaLabelledBy?: string;
  /** Clase CSS adicional para el contenedor del cuerpo */
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
  const modalFrameRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /** Métricas reactivas del viewport visual en tiempo real */
  const [viewportMetrics, setViewportMetrics] = useState(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isKeyboardOpen: false,
  }));
  const viewportMetricsRef = useRef(viewportMetrics);

  /** Estado que indica si la tarjeta modal cabe en la altura visible disponible */
  const [modalFits, setModalFits] = useState<boolean>(true);

  const lastWindowWidth = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const keyboardOpenRef = useRef(false);
  const isSwitchingInputRef = useRef(false);
  const activeInputRef = useRef<HTMLElement | null>(null);
  const focusSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Altura base del viewport sin teclado virtual activo */
  const baselineHeightRef = useRef<number>(
    typeof window !== 'undefined'
      ? Math.max(window.innerHeight, Math.round(window.visualViewport?.height ?? 0))
      : 0
  );
  /** Posición de scroll previa a la apertura del teclado para restaurar la intención del usuario */
  const userScrollBeforeKeyboardRef = useRef<number>(0);
  /** Indicador de si el usuario está realizando un desplazamiento táctil o con ratón directo */
  const isUserDraggingScroll = useRef<boolean>(false);

  // Sincroniza el modal con el viewport visual ante aperturas y cierres del teclado virtual
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      userScrollBeforeKeyboardRef.current = 0;
      isUserDraggingScroll.current = false;
      keyboardOpenRef.current = false;
      isSwitchingInputRef.current = false;
      activeInputRef.current = null;
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
      return;
    }

    const vvInit = window.visualViewport;
    const currentInitHeight = vvInit ? Math.round(vvInit.height) : window.innerHeight;
    if (baselineHeightRef.current === 0 || currentInitHeight > baselineHeightRef.current) {
      baselineHeightRef.current = currentInitHeight;
    }

    const updateMetrics = () => {
      const vv = window.visualViewport;
      const currentHeight = Math.round(vv?.height ?? window.innerHeight);
      const currentWidth = Math.round(vv?.width ?? window.innerWidth);
      const currentTop = Math.round(vv?.offsetTop ?? 0);
      const currentLeft = Math.round(vv?.offsetLeft ?? 0);

      // Detección de rotación de pantalla (Directiva 32)
      if (Math.abs(window.innerWidth - lastWindowWidth.current) > 20) {
        lastWindowWidth.current = window.innerWidth;
        baselineHeightRef.current = Math.max(window.innerHeight, currentHeight);
      } else if (!keyboardOpenRef.current && currentHeight > baselineHeightRef.current) {
        baselineHeightRef.current = currentHeight;
      }

      const keyboardHeight = Math.max(0, baselineHeightRef.current - currentHeight);
      const rawKeyboardOpen = keyboardHeight > 80;

      const isKeyboard = rawKeyboardOpen
        ? true
        : (isSwitchingInputRef.current ? keyboardOpenRef.current : false);

      const nextViewportMetrics = getNextViewportMetrics(
        viewportMetricsRef.current,
        { height: currentHeight, width: currentWidth },
        isKeyboard,
        isSwitchingInputRef.current,
      );
      viewportMetricsRef.current = nextViewportMetrics;

      if (rawKeyboardOpen) {
        if (!keyboardOpenRef.current) {
          // Capturar la posición voluntaria de scroll del usuario antes de que el teclado modifique el viewport
          if (scrollContainerRef.current) {
            userScrollBeforeKeyboardRef.current = scrollContainerRef.current.scrollTop;
          }
          keyboardOpenRef.current = true;
          if (modalFrameRef.current) {
            modalFrameRef.current.style.justifyContent = 'flex-start';
          }
        }
        syncVisualViewportBounds(scrollContainerRef.current, {
          top: currentTop,
          left: currentLeft,
          width: nextViewportMetrics.width,
          height: nextViewportMetrics.height,
        });
      } else if (!isSwitchingInputRef.current) {
        if (keyboardOpenRef.current) {
          keyboardOpenRef.current = false;
          baselineHeightRef.current = Math.max(baselineHeightRef.current, currentHeight);
          if (modalFrameRef.current) {
            modalFrameRef.current.style.justifyContent = 'safe center';
          }
        }
        syncVisualViewportBounds(scrollContainerRef.current, {
          top: currentTop,
          left: currentLeft,
          width: nextViewportMetrics.width,
          height: nextViewportMetrics.height,
        });
      }

      setViewportMetrics((previous) => {
        if (
          previous.height === nextViewportMetrics.height &&
          previous.width === nextViewportMetrics.width &&
          previous.isKeyboardOpen === nextViewportMetrics.isKeyboardOpen
        ) {
          return previous;
        }
        return nextViewportMetrics;
      });

      if (!isKeyboard && scrollContainerRef.current) {
        const targetScroll = userScrollBeforeKeyboardRef.current;
        scrollContainerRef.current.scrollTop = targetScroll;
        window.requestAnimationFrame(() => {
          if (scrollContainerRef.current && !keyboardOpenRef.current) {
            scrollContainerRef.current.scrollTop = targetScroll;
          }
        });
      }
    };

    const onVisualViewportChange = () => updateMetrics();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVisualViewportChange);
      window.visualViewport.addEventListener('scroll', onVisualViewportChange);
    }
    window.addEventListener('resize', onVisualViewportChange);
    window.addEventListener('scroll', onVisualViewportChange, { passive: true });

    updateMetrics();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', onVisualViewportChange);
      }
      window.removeEventListener('resize', onVisualViewportChange);
      window.removeEventListener('scroll', onVisualViewportChange);
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
    };
  }, [isOpen]);

  // Determina si la tarjeta modal cabe en la altura visible actual o si requiere scroll
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    const frame = modalFrameRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!modal || !frame || !scrollContainer) return;

    const checkFit = () => {
      const frameStyle = window.getComputedStyle(frame);
      const verticalPadding =
        Number.parseFloat(frameStyle.paddingTop) +
        Number.parseFloat(frameStyle.paddingBottom);
      const availableHeight = Math.max(0, scrollContainer.clientHeight - verticalPadding);
      setModalFits(modal.offsetHeight <= availableHeight);
    };

    checkFit();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(checkFit) : null;
    observer?.observe(modal);
    observer?.observe(frame);
    observer?.observe(scrollContainer);

    return () => {
      observer?.disconnect();
    };
  }, [isOpen, viewportMetrics.height]);

  /** Registra la posición voluntaria de scroll del usuario cuando no hay teclado activo o cuando arrastra intencionalmente */
  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!keyboardOpenRef.current || isUserDraggingScroll.current) {
      userScrollBeforeKeyboardRef.current = container.scrollTop;
    }
  };

  /** Gestiona el cambio rápido de foco entre inputs para evitar parpadeos de viewport */
  const handleInputFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    if (keyboardOpenRef.current && activeInputRef.current !== target) {
      isSwitchingInputRef.current = true;
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
      focusSettleTimerRef.current = setTimeout(() => {
        isSwitchingInputRef.current = false;
        focusSettleTimerRef.current = null;
      }, 250);
    }
    activeInputRef.current = target;
  };

  const frameLayout = getModalFrameLayout(modalFits, viewportMetrics.isKeyboardOpen);
  const isScrollable = !modalFits;

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} labelledBy={ariaLabelledBy}>
      {/* Contenedor sincronizado con el viewport visual sobre el teclado */}
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
        className={`fixed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isScrollable
            ? 'overflow-y-auto overscroll-contain touch-pan-y'
            : 'overflow-y-clip overscroll-none'
        }`}
        data-modal-scroll-container
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: getModalTouchAction(!isScrollable),
          pointerEvents: 'auto',
        }}
      >
        {/* Contenedor flexible: centrado natural cuando cabe, o alineación superior para scroll fluido */}
        <div
          ref={modalFrameRef}
          className={`w-full min-h-full flex flex-col items-center text-center pt-4 [@media(max-height:540px)]:pt-2 pb-2 px-2 sm:p-4 ${
            frameLayout.justifyContent === 'safe center' ? 'justify-center' : 'justify-start'
          }`}
          style={{
            justifyContent: frameLayout.justifyContent,
          }}
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
              duration: prefersReducedMotion ? 0 : MOTION_DURATIONS.normal,
              ease: MOTION_EASINGS.standard,
            }}
            className={`relative w-full ${maxWidthClass} bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left shrink-0`}
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
    </ModalDialog>
  );
}

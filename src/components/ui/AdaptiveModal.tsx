/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con adaptación en tiempo real al teclado virtual (Directivas 5, 12, 14, 31, 32).
 * Centra la tarjeta cuando cabe en el viewport visible y permite desplazarla completa cuando no cabe.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalFrameRef = useRef<HTMLDivElement>(null);

  /** Métricas reactivas del viewport visual en tiempo real */
  const [viewportMetrics, setViewportMetrics] = useState(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    top: 0,
    left: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isKeyboardOpen: false,
  }));

  /** Estado que indica si la tarjeta modal cabe en la altura visible disponible */
  const [modalFits, setModalFits] = useState<boolean>(true);

  const lastWindowWidth = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  /** Conserva la coordenada del viewport al abrir el teclado para no seguir el paneo entre campos. */
  const keyboardPositionRef = useRef<{ top: number; left: number } | null>(null);
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
  /** Posición de scroll previa a la apertura del teclado para restaurar exactamente la intención del usuario */
  const userScrollBeforeKeyboardRef = useRef<number>(0);
  /** Indicador de si el usuario está realizando un desplazamiento táctil o con ratón directo */
  const isUserDraggingScroll = useRef<boolean>(false);

  // Bloqueo estricto del scroll del documento de fondo
  useBodyScrollLock(isOpen);

  // Keep the dialog outside page containers that clip or scroll focused descendants.
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Sincroniza el modal con el viewport visual, que puede cambiar de tamaño y posición con el teclado.
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      userScrollBeforeKeyboardRef.current = 0;
      isUserDraggingScroll.current = false;
      keyboardOpenRef.current = false;
      isSwitchingInputRef.current = false;
      activeInputRef.current = null;
      keyboardPositionRef.current = null;
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
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
      const currentHeight = Math.round(vv?.height ?? window.innerHeight);
      const currentWidth = Math.round(vv?.width ?? window.innerWidth);
      const currentTop = Math.round(vv?.offsetTop ?? 0);
      const currentLeft = Math.round(vv?.offsetLeft ?? 0);

      // Detección de rotación de pantalla (Directiva 32)
      if (Math.abs(window.innerWidth - lastWindowWidth.current) > 20) {
        lastWindowWidth.current = window.innerWidth;
        baselineHeightRef.current = Math.max(window.innerHeight, currentHeight);
      } else if (!keyboardOpenRef.current && currentHeight > baselineHeightRef.current) {
        // Si el viewport crece más allá de la base conocida (ej. se ocultó barra del navegador o cerró teclado), actualizar base
        baselineHeightRef.current = currentHeight;
      }

      const keyboardHeight = Math.max(0, baselineHeightRef.current - currentHeight);
      const rawKeyboardOpen = keyboardHeight > 80;
      if (rawKeyboardOpen) {
        keyboardOpenRef.current = true;
      } else if (!isSwitchingInputRef.current) {
        keyboardOpenRef.current = false;
        baselineHeightRef.current = Math.max(baselineHeightRef.current, currentHeight);
      }
      const isKeyboard = keyboardOpenRef.current;
      if (isKeyboard && keyboardPositionRef.current === null) {
        keyboardPositionRef.current = { top: currentTop, left: currentLeft };
      } else if (!isKeyboard) {
        keyboardPositionRef.current = null;
      }
      const stableTop = keyboardPositionRef.current?.top ?? currentTop;
      const stableLeft = keyboardPositionRef.current?.left ?? currentLeft;

      setViewportMetrics((previous) => {
        const stableHeight = isKeyboard && isSwitchingInputRef.current
          ? previous.height
          : currentHeight;
        if (previous.height === stableHeight && previous.top === stableTop &&
          previous.left === stableLeft && previous.width === currentWidth &&
          previous.isKeyboardOpen === isKeyboard) return previous;
        return { height: stableHeight, top: stableTop, left: stableLeft,
          width: currentWidth, isKeyboardOpen: isKeyboard };
      });

      if (!isKeyboard && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = userScrollBeforeKeyboardRef.current;
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateMetrics);
      window.visualViewport.addEventListener('scroll', updateMetrics);
    }
    window.addEventListener('resize', updateMetrics);

    updateMetrics();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateMetrics);
        window.visualViewport.removeEventListener('scroll', updateMetrics);
      }
      window.removeEventListener('resize', updateMetrics);
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
    };
  }, [isOpen]);

  // Incluye el padding del marco al decidir si centrar o permitir scroll desde arriba.
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    const frame = modalFrameRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!modal || !frame || !scrollContainer) return;

    const checkFit = () => {
      const frameStyle = window.getComputedStyle(frame);
      const verticalPadding = Number.parseFloat(frameStyle.paddingTop) +
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

  /**
   * Registra la posición voluntaria de scroll del usuario cuando no hay teclado activo
   * o cuando el usuario arrastra intencionalmente con el dedo o ratón.
   */
  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!viewportMetrics.isKeyboardOpen || isUserDraggingScroll.current) {
      userScrollBeforeKeyboardRef.current = container.scrollTop;
    }
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    if (keyboardOpenRef.current && activeInputRef.current !== target) {
      isSwitchingInputRef.current = true;
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
      focusSettleTimerRef.current = setTimeout(() => {
        isSwitchingInputRef.current = false;
        focusSettleTimerRef.current = null;
      }, 400);
    }
    activeInputRef.current = target;
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

  if (!portalTarget) return null;

  return createPortal((
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
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

          {/* Capa 2: Contenedor sincronizado con el viewport visual sobre el teclado */}
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
              modalFits
                ? 'overflow-y-clip overscroll-none'
                : 'overflow-y-auto overscroll-contain touch-pan-y'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            style={{
              top: `${viewportMetrics.top}px`,
              left: `${viewportMetrics.left}px`,
              width: `${viewportMetrics.width}px`,
              height: `${viewportMetrics.height}px`,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Contenedor flexible: centrado natural cuando cabe, o alineación superior para scroll fluido */}
            <div
              ref={modalFrameRef}
              className={`w-full min-h-full flex flex-col items-center text-center p-2 sm:p-4 ${
                modalFits ? 'justify-center' : 'justify-start'
              }`}
              style={{ justifyContent: modalFits ? 'safe center' : 'flex-start' }}
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
        </div>
      )}
    </AnimatePresence>
  ), portalTarget);
}

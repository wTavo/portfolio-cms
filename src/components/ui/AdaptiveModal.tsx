/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con capa de desplazamiento manual continuo estilo Figma (Directivas 5, 12, 14, 31, 32).
 * Proporciona scroll táctil vertical libre en su propia capa, sin movimientos automáticos al abrir el teclado virtual.
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
  const [canScroll, setCanScroll] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  /** Altura comprometida al estado para evitar re-renders por micro-variaciones de 1-5px */
  const lastCommittedHeight = useRef<number | null>(null);
  /** Estado previo del teclado para detectar transiciones reales open<->close */
  const keyboardWasActive = useRef(false);
  /** Bandera: la transición CSS de height solo se activa durante apertura/cierre real del teclado */
  const [animateHeight, setAnimateHeight] = useState(false);
  /** Temporizador para desactivar la transición CSS tras completarse la animación */
  const animateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bloqueo estricto del scroll del documento de fondo (el fondo jamás se mueve)
  useBodyScrollLock(isOpen);

  // Activar desplazamiento vertical SOLO cuando el modal desborda la altura visible
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      setCanScroll(false);
      setViewportHeight(null);
      lastCommittedHeight.current = null;
      keyboardWasActive.current = false;
      setAnimateHeight(false);
      return;
    }

    /** Temporizador para debounce del cierre de teclado */
    let closeDebounce: ReturnType<typeof setTimeout> | null = null;

    /**
     * Activa la transición CSS de height por un periodo breve (250ms).
     * Solo se invoca cuando el teclado realmente se abre o se cierra,
     * NUNCA durante cambios de foco entre campos de texto.
     */
    const enableTransition = () => {
      setAnimateHeight(true);
      if (animateTimer.current) clearTimeout(animateTimer.current);
      animateTimer.current = setTimeout(() => {
        setAnimateHeight(false);
        animateTimer.current = null;
      }, 250);
    };

    const checkScrollCondition = () => {
      const modalEl = modalRef.current;
      const modalHeight = modalEl ? modalEl.offsetHeight : 340;
      const vv = window.visualViewport;
      const currentHeight = vv ? vv.height : window.innerHeight;
      const keyboardActive = Math.max(0, window.innerHeight - currentHeight) > 80;
      const isOverflowing = (modalHeight + 32) > currentHeight;

      const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
      const isModalInput = !!(
        activeEl &&
        modalEl?.contains(activeEl) &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      );

      if (keyboardActive && vv) {
        // Teclado detectado como activo: cancelar cualquier cierre pendiente
        if (closeDebounce) {
          clearTimeout(closeDebounce);
          closeDebounce = null;
        }

        const newHeight = Math.round(vv.height);

        // Si el teclado estaba cerrado, esta es la apertura real: activar animación suave
        if (!keyboardWasActive.current || lastCommittedHeight.current === null) {
          enableTransition();
          lastCommittedHeight.current = newHeight;
          setViewportHeight(newHeight);
          keyboardWasActive.current = true;
        } else {
          // El teclado ya estaba activo: congelar la altura para evitar que
          // el cambio de modo de Gboard (ej. pasar a contraseña o mostrar sugerencias)
          // cause saltos o re-renders. Solo actualizar en cambios drásticos como rotación (> 160px).
          const lastHeight = lastCommittedHeight.current;
          if (Math.abs(newHeight - lastHeight) > 160) {
            enableTransition();
            lastCommittedHeight.current = newHeight;
            setViewportHeight(newHeight);
          }
        }
      } else {
        // Si un campo dentro del modal sigue enfocado, el teclado no se ha cerrado realmente
        // (es un parpadeo de reinicio de IME nativo de Android al cambiar a tipo contraseña).
        if (isModalInput) {
          return;
        }

        // Cierre voluntario: esperar 300ms para asegurar que el usuario no está alternando campos
        if (keyboardWasActive.current && !closeDebounce) {
          closeDebounce = setTimeout(() => {
            const currentActive = typeof document !== 'undefined' ? document.activeElement : null;
            const stillInput = !!(
              currentActive &&
              modalRef.current?.contains(currentActive) &&
              (currentActive.tagName === 'INPUT' || currentActive.tagName === 'TEXTAREA')
            );

            if (stillInput) {
              closeDebounce = null;
              return;
            }

            enableTransition();
            lastCommittedHeight.current = null;
            setViewportHeight(null);
            keyboardWasActive.current = false;
            closeDebounce = null;

            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = 0;
            }

            const m = modalRef.current;
            const mh = m ? m.offsetHeight : 340;
            setCanScroll((mh + 32) > window.innerHeight);
          }, 300);
        } else if (!keyboardWasActive.current) {
          if (lastCommittedHeight.current !== null) {
            lastCommittedHeight.current = null;
            setViewportHeight(null);
          }
        }
      }

      setCanScroll(isOverflowing);
    };

    // Al enfocar cualquier input dentro del modal, cancelar inmediatamente cualquier timer de cierre
    const handleFocusIn = () => {
      if (closeDebounce) {
        clearTimeout(closeDebounce);
        closeDebounce = null;
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('focusin', handleFocusIn);
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkScrollCondition);
    }
    window.addEventListener('resize', checkScrollCondition);

    checkScrollCondition();
    const raf = requestAnimationFrame(checkScrollCondition);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkScrollCondition);
      }
      window.removeEventListener('resize', checkScrollCondition);
      cancelAnimationFrame(raf);
      if (closeDebounce) {
        clearTimeout(closeDebounce);
      }
      if (animateTimer.current) {
        clearTimeout(animateTimer.current);
      }
      if (container) {
        container.removeEventListener('focusin', handleFocusIn);
      }
    };
  }, [isOpen]);

  // Cierre accesible con tecla Escape
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
        <div className="fixed inset-0 z-50">
          {/* Capa 1: Backdrop Fijo Inmóvil (El fondo y el desenfoque permanecen 100% estáticos) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATIONS.fast }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />

          {/* Capa 2: Contenedor con scroll habilitado estrictamente bajo demanda */}
          <div
            ref={scrollContainerRef}
            className={`fixed inset-x-0 top-0 overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              canScroll ? 'overflow-y-auto' : 'overflow-hidden'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            style={{
              height: viewportHeight ? `${viewportHeight}px` : '100dvh',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              // La transición SOLO se activa durante apertura/cierre real del teclado.
              // Desactivada por defecto para que micro-ajustes del viewport durante
              // cambios de foco entre campos sean instantáneos e invisibles.
              transition: animateHeight ? 'height 0.15s ease-out' : 'none',
            }}
          >
            {/* Contenedor con centrado nativo estándar (m-auto previene recortes en pantallas bajas) */}
            <div
              className="min-h-full w-full flex p-3.5 sm:p-4 text-center"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              {/* Tarjeta Modal Flotante centrada naturalmente con m-auto */}
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: MOTION_DURATIONS.fast,
                  ease: [0.2, 0, 0, 1],
                }}
                className={`m-auto relative w-full ${maxWidthClass} bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left shrink-0`}
              >
              {/* 1. Cabecera Fija de la Tarjeta */}
              <header className="px-5 sm:px-6 py-3 sm:py-3.5 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)] shrink-0">
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

              {/* 2. Cuerpo del Modal */}
              <div className={`flex-1 ${contentClassName}`}>
                {children}
              </div>

              {/* 3. Pie con Botones de Acción (Directiva 12) */}
              {footer && (
                <footer className="px-5 sm:px-6 py-3 sm:py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0">
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

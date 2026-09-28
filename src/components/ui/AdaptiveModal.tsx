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
  const [keyboardPadding, setKeyboardPadding] = useState<number>(0);
  /** Altura mínima estable alcanzada durante la apertura para congelar fluctuaciones del teclado */
  const minStableHeight = useRef<number | null>(null);
  /** Dimensiones de ventana para detectar rotación de pantalla (Directiva 32) */
  const lastWindowWidth = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const maxWindowHeight = useRef<number>(typeof window !== 'undefined' ? window.innerHeight : 0);
  /** Bandera para registrar interacción activa con un campo de texto (previene falsos cierres al desplegar teclado) */
  const isInteractingWithInput = useRef<boolean>(false);

  // Bloqueo estricto del scroll del documento de fondo (el fondo jamás se mueve)
  useBodyScrollLock(isOpen);

  // Gestión dinámica de elevación según teclado virtual
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      setKeyboardPadding(0);
      minStableHeight.current = null;
      isInteractingWithInput.current = false;
      return;
    }

    /** Temporizador para debounce del cierre físico del teclado */
    let closeDebounce: ReturnType<typeof setTimeout> | null = null;

    const checkKeyboardCondition = () => {
      // Detectar rotación de pantalla (Directiva 32) comparando ancho
      if (Math.abs(window.innerWidth - lastWindowWidth.current) > 80) {
        lastWindowWidth.current = window.innerWidth;
        maxWindowHeight.current = window.innerHeight;
        minStableHeight.current = null;
        setKeyboardPadding(0);
      } else if (window.innerHeight > maxWindowHeight.current) {
        maxWindowHeight.current = window.innerHeight;
      }

      const vv = window.visualViewport;
      const currentVvHeight = vv ? Math.round(vv.height) : window.innerHeight;
      const rawKeyboardHeight = Math.max(0, maxWindowHeight.current - currentVvHeight);
      const isKeyboardOpen = rawKeyboardHeight > 80;

      // Si la ventana recuperó su tamaño completo, el teclado ya no está en pantalla
      if (currentVvHeight >= maxWindowHeight.current - 60) {
        isInteractingWithInput.current = false;
      }

      if (isKeyboardOpen) {
        if (closeDebounce) {
          clearTimeout(closeDebounce);
          closeDebounce = null;
        }

        // Durante el despliegue del teclado, seguir el movimiento hasta registrar
        // la altura mínima real (máxima elevación). Una vez alcanzada, congelar/bloquear
        // contra fluctuaciones menores al alternar campos.
        if (minStableHeight.current === null || currentVvHeight < minStableHeight.current) {
          minStableHeight.current = currentVvHeight;
          const stableKeyboardHeight = Math.max(0, maxWindowHeight.current - currentVvHeight);
          setKeyboardPadding(stableKeyboardHeight);
        }
      } else {
        // Cierre de teclado: confirmar cierre físico tras 150ms solo si no se está tocando o enfocando un campo
        if (!isInteractingWithInput.current && !closeDebounce) {
          closeDebounce = setTimeout(() => {
            const checkVv = window.visualViewport;
            const checkHeight = checkVv ? Math.round(checkVv.height) : window.innerHeight;
            const isPhysicallyClosed = Math.max(0, maxWindowHeight.current - checkHeight) <= 60;

            if (!isPhysicallyClosed) {
              closeDebounce = null;
              return;
            }

            minStableHeight.current = null;
            setKeyboardPadding(0);
            closeDebounce = null;

            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 150);
        }
      }
    };

    // Al interactuar o enfocar cualquier input dentro del modal, asegurar su visibilidad completa
    const handleInputInteraction = (e: Event) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        isInteractingWithInput.current = true;
        if (closeDebounce) {
          clearTimeout(closeDebounce);
          closeDebounce = null;
        }

        // Desplazamiento suave hacia el campo enfocado una vez que el teclado completa su despliegue
        if (e.type === 'focusin') {
          setTimeout(() => {
            target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 200);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('focusin', handleInputInteraction);
      container.addEventListener('pointerdown', handleInputInteraction, { passive: true });
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboardCondition);
      window.visualViewport.addEventListener('scroll', checkKeyboardCondition);
    }
    window.addEventListener('resize', checkKeyboardCondition);

    checkKeyboardCondition();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboardCondition);
        window.visualViewport.removeEventListener('scroll', checkKeyboardCondition);
      }
      window.removeEventListener('resize', checkKeyboardCondition);
      if (closeDebounce) {
        clearTimeout(closeDebounce);
      }
      if (container) {
        container.removeEventListener('focusin', handleInputInteraction);
        container.removeEventListener('pointerdown', handleInputInteraction);
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
        <div className="fixed inset-0 z-50 touch-none overscroll-none">
          {/* Capa 1: Backdrop Fijo Inmóvil (El fondo y el desenfoque permanecen 100% estáticos) */}
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

          {/* Capa 2: Contenedor a pantalla completa con elevación elástica por padding inferior */}
          <div
            ref={scrollContainerRef}
            className="fixed inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            style={{
              paddingBottom: `${keyboardPadding}px`,
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              transition: 'padding-bottom 0.15s ease-out',
            }}
          >
            {/* Contenedor centrado: min-h-full con m-auto centra cuando cabe y permite scroll limpio sin espacios residuales */}
            <div
              className="min-h-full w-full flex items-center justify-center p-3 sm:p-4 short-screen:p-2 text-center"
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
                className={`relative w-full ${maxWidthClass} m-auto bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left shrink-0`}
              >
              {/* 1. Cabecera Fija de la Tarjeta (Directiva 32: compacta en landscape / altura reducida) */}
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

              {/* 2. Cuerpo del Modal */}
              <div className={`flex-1 ${contentClassName}`}>
                {children}
              </div>

              {/* 3. Pie con Botones de Acción (Directivas 12 y 32) */}
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

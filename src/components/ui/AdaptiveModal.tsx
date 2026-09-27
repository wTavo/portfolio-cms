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
import { useBodyScrollLock, useKeyboardHeight } from '../../lib/hooks/useKeyboardOffset';

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

  // Bloqueo estricto del scroll del documento de fondo (el fondo jamás se mueve)
  useBodyScrollLock(isOpen);

  // Detección de presencia y altura del teclado virtual
  const keyboardHeight = useKeyboardHeight(isOpen);
  const isKeyboardOpen = keyboardHeight > 100;

  // Almacena la posición superior original del modal para que al abrir el teclado no salte
  const [modalTop, setModalTop] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setModalTop(null);
      return;
    }

    // Registrar la posición vertical natural centrada antes de que el teclado abra
    if (!isKeyboardOpen && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      if (rect.top > 0) {
        setModalTop(rect.top);
      }
    }
  }, [isOpen, isKeyboardOpen]);

  // Al cerrar el teclado, resetear el desplazamiento del contenedor
  useEffect(() => {
    if (!isKeyboardOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isKeyboardOpen]);

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

  // Cálculo de top de respaldo si aún no se ha medido el elemento en el DOM
  const fallbackTop =
    typeof window !== 'undefined'
      ? Math.max(16, (window.innerHeight - 280) / 2)
      : 120;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={scrollContainerRef}
          className={`fixed inset-0 z-50 overscroll-contain ${
            isKeyboardOpen ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Backdrop con desenfoque suave acelerado por GPU en capa fija detrás del contenido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATIONS.fast }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm -z-10"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Contenedor: centrado en reposo (sin scroll), scrolleable sin saltos únicamente con teclado activo */}
          <div
            className={`w-full min-h-full flex flex-col items-center ${
              isKeyboardOpen ? 'justify-start' : 'justify-center p-3.5 sm:p-4'
            } text-center`}
            style={
              isKeyboardOpen
                ? {
                    paddingTop: `${modalTop ?? fallbackTop}px`,
                    paddingBottom: `${keyboardHeight + 80}px`,
                    paddingLeft: '0.875rem',
                    paddingRight: '0.875rem',
                  }
                : undefined
            }
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
              className={`relative w-full ${maxWidthClass} bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left shrink-0 max-h-[85vh]`}
            >
              {/* 1. Cabecera Fija */}
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

              {/* 2. Cuerpo Scrolleable */}
              <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
                {children}
              </div>

              {/* 3. Pie Fijo con Botones de Acción (Directiva 12) */}
              {footer && (
                <footer className="px-5 sm:px-6 py-3 sm:py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0">
                  {footer}
                </footer>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

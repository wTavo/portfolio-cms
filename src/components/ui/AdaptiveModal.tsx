/**
 * @file AdaptiveModal.tsx
 * @description Modal centrado y accesible según el Enfoque 3 (estándar Vercel/GitHub).
 * Proporciona renderizado unificado, elegante y flotante tanto en móviles como en escritorio (Directivas 5, 12, 14, 31, 32).
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

  // Bloqueo limpio del scroll de la página de fondo sin desalinear layout
  useBodyScrollLock(isOpen);

  // Monitoreo del área libre disponible (Visual Viewport) cuando el teclado virtual está activo
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const updateHeight = () => {
      const keyboardActive = window.innerHeight - vv.height > 100;
      if (keyboardActive) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        setViewportHeight(vv.height);
      } else {
        // Ventana de tolerancia de 150ms al alternar campos para evitar parpadeos
        if (!timer) {
          timer = setTimeout(() => {
            setViewportHeight(null);
            timer = null;
          }, 150);
        }
      }
    };

    vv.addEventListener('resize', updateHeight);
    vv.addEventListener('scroll', updateHeight);
    updateHeight();

    return () => {
      vv.removeEventListener('resize', updateHeight);
      vv.removeEventListener('scroll', updateHeight);
      if (timer) clearTimeout(timer);
      setViewportHeight(null);
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          style={
            viewportHeight
              ? {
                  height: `${viewportHeight}px`,
                  top: `${window.visualViewport?.offsetTop ?? 0}px`,
                }
              : undefined
          }
        >
          {/* Backdrop con desenfoque suave acelerado por GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATIONS.fast }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Tarjeta Modal Centrada Flotante (Enfoque 3 - Estándar Vercel/GitHub) */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            transition={{
              duration: MOTION_DURATIONS.fast,
              ease: [0.2, 0, 0, 1],
            }}
            className={`relative w-full ${maxWidthClass} bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col max-h-[85vh] z-10`}
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
      )}
    </AnimatePresence>
  );
}

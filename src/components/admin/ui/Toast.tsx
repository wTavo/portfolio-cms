/**
 * @file Toast.tsx
 * @description Componente de notificación flotante accesible para retroalimentación transitoria (Directivas 1, 2, 4, 5 y 22).
 */

import { useEffect } from 'react';
import { CheckIcon, AlertCircleIcon, XIcon } from '../../icons/Icons';
import { i18n } from '../../../lib/i18n/es';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({
  type = 'info',
  message,
  onClose,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onClose]);

  const typeStyles = {
    success: {
      container:
        'bg-[var(--color-status-success-bg)] border-[var(--color-status-success)]/30 text-[var(--color-status-success)]',
      icon: <CheckIcon size={18} className="shrink-0" />,
    },
    error: {
      container:
        'bg-[var(--color-status-error-bg)] border-[var(--color-status-error)]/30 text-[var(--color-status-error)]',
      icon: <AlertCircleIcon size={18} className="shrink-0" />,
    },
    info: {
      container:
        'bg-[var(--color-bg-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)]',
      icon: <AlertCircleIcon size={18} className="shrink-0 text-[var(--color-brand-accent)]" />,
    },
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border shadow-[var(--shadow-dropdown)] max-w-sm text-sm font-medium animate-fade-in ${typeStyles.container}`}
    >
      {typeStyles.icon}
      <p className="flex-1 text-xs leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="min-w-(--size-touch-target) min-h-(--size-touch-target) flex items-center justify-center -mr-2 text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
        aria-label={i18n.common.close}
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}

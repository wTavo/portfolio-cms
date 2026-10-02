/**
 * @file ConfirmDialog.tsx
 * @description Diálogo modal accesible para confirmación de acciones críticas o destructivas (Directivas 2, 4, 5, 12 y 20).
 */

import ModalDialog from '../../ui/ModalDialog';
import AdminButton from './AdminButton';
import LoadingButton from './LoadingButton';
import { AlertCircleIcon, XIcon } from '../../icons/Icons';
import { i18n } from '../../../lib/i18n/es';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  discardText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = i18n.common.save,
  discardText = i18n.common.back,
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} labelledBy="confirm-dialog-title">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="document"
          className="relative w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left"
        >
          {/* Cabecera Fija */}
          <header className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
                  variant === 'danger'
                    ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error)]'
                    : 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-accent)]'
                }`}
              >
                <AlertCircleIcon size={18} />
              </div>
              <h2
                id="confirm-dialog-title"
                className="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-w-(--size-touch-target) min-h-(--size-touch-target) flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer disabled:opacity-50"
              aria-label={i18n.common.close}
            >
              <XIcon size={16} />
            </button>
          </header>

          {/* Cuerpo */}
          <div className="p-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <p>{description}</p>
          </div>

          {/* Pie Fijo con Alineación Estricta: Descarte a la izquierda, Acción afirmativa a la derecha (Directiva 12) */}
          <footer className="px-5 py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] flex items-center justify-between gap-3 shrink-0">
            <AdminButton
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              {discardText}
            </AdminButton>

            <LoadingButton
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              type="button"
              loading={loading}
              onClick={onConfirm}
            >
              {confirmText}
            </LoadingButton>
          </footer>
        </div>
      </div>
    </ModalDialog>
  );
}

/**
 * @file ContactModal.tsx
 * @description Modal de contacto que consume el componente unificado AdaptiveModal (Directivas 5, 8, 12, 20).
 */

import React, { useState, useEffect, useRef } from 'react';
import { i18n } from '../../lib/i18n/es';
import { MailIcon, CheckIcon } from '../icons/Icons';
import AdaptiveModal from '../ui/AdaptiveModal';
import { useIsMobile } from '../../lib/hooks/useKeyboardOffset';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Reset al cerrar y foco inicial en escritorio
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setStatus('idle');
        setErrorMessage('');
      }, 300);
      return;
    }

    // Auto-focus únicamente en escritorio. En móviles la apertura del teclado
    // debe ser resultado directo del toque voluntario del usuario para evitar colisiones.
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isMobile) {
      timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(i18n.errors.validationFailed);
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage(i18n.errors.generic);
    }
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={i18n.contact.title}
      subtitle={i18n.contact.description}
      icon={<MailIcon size={18} />}
      maxWidthClass="max-w-lg"
      footer={
        status !== 'success' ? (
          <button
            type="submit"
            form="contact-form"
            disabled={status === 'sending'}
            className="w-full min-h-(--size-button-height) px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] text-sm font-semibold text-white transition-all shadow-[var(--shadow-card)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {status === 'sending' ? (
              <span>{i18n.contact.sending}</span>
            ) : (
              <span>{i18n.contact.sendButton}</span>
            )}
          </button>
        ) : undefined
      }
      ariaLabelledBy="contact-modal-title"
    >
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {status === 'success' ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] flex items-center justify-center border border-[var(--color-status-success)]/20">
              <CheckIcon size={24} />
            </div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {i18n.contact.successTitle}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
              {i18n.contact.successMessage}
            </p>
          </div>
        ) : (
          <form id="contact-form" onSubmit={handleSubmit} className="space-y-3" noValidate>
            {status === 'error' && errorMessage && (
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] text-xs font-medium border border-[var(--color-status-error)]/20">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label
                htmlFor="contact-name"
                className="block text-xs font-semibold text-[var(--color-text-secondary)]"
              >
                {i18n.contact.nameLabel}
              </label>
              <input
                ref={nameInputRef}
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === 'sending'}
                className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                placeholder="Tu nombre o empresa"
              />
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="contact-email"
                className="block text-xs font-semibold text-[var(--color-text-secondary)]"
              >
                {i18n.contact.emailLabel}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending'}
                className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                placeholder="nombre@ejemplo.com"
              />
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="contact-message"
                className="block text-xs font-semibold text-[var(--color-text-secondary)]"
              >
                {i18n.contact.messageLabel}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'sending'}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all resize-none"
                placeholder="¿En qué podemos colaborar o ayudarte?"
              />
            </div>
          </form>
        )}
      </div>
    </AdaptiveModal>
  );
}

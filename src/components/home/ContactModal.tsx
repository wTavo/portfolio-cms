/**
 * @file ContactModal.tsx
 * @description Modal accesible y minimalista para el formulario de contacto público de la plataforma.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { i18n } from '../../lib/i18n/es';
import { XIcon, MailIcon, CheckIcon } from '../icons/Icons';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';

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

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus y manejo de tecla Escape para accesibilidad
  useEffect(() => {
    if (!isOpen) {
      // Resetear estado al cerrar
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setStatus('idle');
        setErrorMessage('');
      }, 300);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(i18n.errors.validationFailed);
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    // Envío simulado o conexión con backend
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage(i18n.errors.generic);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          {/* Backdrop con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATIONS.fast }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Contenedor del Modal (Estructura Tripartita: Header, Body, Footer) */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.decelerate }}
            className="relative w-full max-w-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] z-10"
          >
            {/* 1. Cabecera Fija */}
            <header className="px-4 sm:px-6 py-2.5 sm:py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-[var(--radius-md)] bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]">
                  <MailIcon size={18} />
                </div>
                <div>
                  <h2
                    id="contact-modal-title"
                    className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]"
                  >
                    {i18n.contact.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)]">
                    {i18n.contact.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="min-w-(--size-touch-target) min-h-(--size-touch-target) flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]"
                aria-label={i18n.contact.closeButton}
              >
                <XIcon size={18} />
              </button>
            </header>

            {/* 2. Cuerpo */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
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
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && errorMessage && (
                    <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] text-xs font-medium border border-[var(--color-status-error)]/20">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                    >
                      {i18n.contact.nameLabel}
                    </label>
                    <input
                      ref={nameInputRef}
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={status === 'sending'}
                      className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                      placeholder="Tu nombre o empresa"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                    >
                      {i18n.contact.emailLabel}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'sending'}
                      className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
                      placeholder="nombre@ejemplo.com"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                    >
                      {i18n.contact.messageLabel}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={status === 'sending'}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all resize-none"
                      placeholder="¿En qué podemos colaborar o ayudarte?"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* 3. Pie Fijo */}
            <footer className="px-6 py-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)]">
              <button
                type="button"
                onClick={onClose}
                className="min-h-(--size-touch-target) px-4 py-2 rounded-[var(--radius-md)] bg-transparent hover:bg-[var(--color-bg-subtle)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]"
              >
                {i18n.contact.closeButton}
              </button>

              {status !== 'success' && (
                <button
                  type="submit"
                  form="contact-form"
                  disabled={status === 'sending'}
                  className="min-h-(--size-touch-target) px-5 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] text-xs font-semibold text-white transition-all shadow-[var(--shadow-card)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === 'sending' ? (
                    <span>{i18n.contact.sending}</span>
                  ) : (
                    <span>{i18n.contact.sendButton}</span>
                  )}
                </button>
              )}
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

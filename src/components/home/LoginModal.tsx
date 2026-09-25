/**
 * @file LoginModal.tsx
 * @description Modal interactivo y accesible de inicio de sesión con flujo unificado y animación acelerada por GPU.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { i18n } from '../../lib/i18n/es';
import { XIcon, BrandLogoIcon } from '../icons/Icons';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  initialError?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  redirectUrl = '',
  initialError = '',
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus inicial y manejo de tecla Escape para accesibilidad WCAG 2.2 AA
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setStatus('idle');
        setErrorMessage('');
      }, 250);
      return;
    }

    if (initialError === 'account_suspended') {
      setErrorMessage(i18n.auth.accountSuspended);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 120);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose, initialError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Por favor completa todos los campos.');
      setStatus('error');
      return;
    }

    // Directiva 20: Idempotencia y bloqueo de doble clic
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(result.error?.message || i18n.auth.invalidCredentials);
        setStatus('error');
        return;
      }

      // Redirección inteligente según el rol del usuario devuelto por el servidor
      const target = redirectUrl || result.data.redirectUrl || '/dashboard';
      window.location.href = target;
    } catch {
      setErrorMessage('Error de conexión. Intenta nuevamente.');
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
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

          {/* Contenedor del Modal (Estructura Tripartita: Header, Body, Footer - Directiva 12) */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.decelerate }}
            className="relative w-full max-w-md bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col max-h-[92dvh] z-10"
          >
            {/* 1. Cabecera Fija */}
            <header className="px-5 sm:px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-brand-accent)] flex items-center justify-center shadow-[var(--shadow-card)]">
                  <BrandLogoIcon size={18} />
                </div>
                <div>
                  <h2
                    id="login-modal-title"
                    className="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
                  >
                    {i18n.auth.loginTitle}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {i18n.auth.loginSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="min-w-(--size-touch-target) min-h-(--size-touch-target) flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] cursor-pointer"
                aria-label={i18n.common.close}
              >
                <XIcon size={18} />
              </button>
            </header>

            {/* 2. Cuerpo Scrolleable */}
            <form id="login-modal-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {errorMessage && (
                  <div
                    className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] text-xs font-medium border border-[var(--color-status-error)]/20"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="login-modal-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
                  >
                    {i18n.auth.emailLabel}
                  </label>
                  <input
                    ref={emailInputRef}
                    id="login-modal-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    placeholder="usuario@ejemplo.com"
                    className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="login-modal-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
                  >
                    {i18n.auth.passwordLabel}
                  </label>
                  <input
                    id="login-modal-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status === 'loading'}
                    placeholder="••••••••"
                    className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* 3. Pie Fijo con Alineación Estándar (Descarte izquierda, Acción derecha - Directiva 12) */}
              <footer className="px-5 sm:px-6 py-3.5 border-t border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'loading'}
                  className="min-h-(--size-touch-target) px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] disabled:opacity-50 cursor-pointer"
                >
                  {i18n.common.close}
                </button>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="min-h-(--size-touch-target) px-5 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-[var(--shadow-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  {status === 'loading' && (
                    <span className="w-3.5 h-3.5 border-2 border-[var(--color-brand-on-primary)] border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {status === 'loading' ? 'Verificando...' : i18n.auth.loginButton}
                  </span>
                </button>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * @file LoginModal.tsx
 * @description Modal de inicio de sesión que consume el componente unificado AdaptiveModal (Directivas 5, 8, 12, 20).
 */

import React, { useState, useEffect, useRef } from 'react';
import { i18n } from '../../lib/i18n/es';
import { BrandLogoIcon } from '../icons/Icons';
import AdaptiveModal from '../ui/AdaptiveModal';
import { useIsMobile } from '../../lib/hooks/useKeyboardOffset';

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

  const emailInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Gestión de foco inicial y limpieza de estado
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

    // Auto-focus únicamente en escritorio. En móviles la apertura del teclado
    // debe ser resultado directo del toque voluntario del usuario para evitar colisiones.
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isMobile) {
      timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 150);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, initialError, isMobile]);

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

      // Redirección inteligente según el rol devuelto por el backend
      const target = redirectUrl || result.data?.redirectUrl || '/dashboard';
      window.location.href = target;
    } catch {
      setErrorMessage('Error de conexión. Intenta nuevamente.');
      setStatus('error');
    }
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={i18n.auth.loginTitle}
      subtitle={i18n.auth.loginSubtitle}
      icon={<BrandLogoIcon size={18} />}
      ariaLabelledBy="login-modal-title"
      footer={
        <button
          type="submit"
          form="login-modal-form"
          disabled={status === 'loading'}
          className="w-full min-h-(--size-button-height) px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-[var(--shadow-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
        >
          {status === 'loading' && (
            <span className="w-4 h-4 border-2 border-[var(--color-brand-on-primary)] border-t-transparent rounded-full animate-spin" />
          )}
          <span>
            {status === 'loading' ? 'Verificando...' : i18n.auth.loginButton}
          </span>
        </button>
      }
    >
      <form
        id="login-modal-form"
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-6 space-y-2.5 sm:space-y-4"
        noValidate
      >
        {errorMessage && (
          <div
            className="p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] text-xs font-medium border border-[var(--color-status-error)]/20"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <div className="space-y-1 sm:space-y-1.5 text-left">
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
            className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-1 sm:space-y-1.5 text-left">
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
            className="w-full min-h-(--size-input-height) px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-colors disabled:opacity-50"
          />
        </div>
      </form>
    </AdaptiveModal>
  );
}

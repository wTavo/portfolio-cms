/**
 * @file AdminButton.tsx
 * @description Botón estándar para paneles administrativos con variantes semánticas y tokens de diseño (Directivas 4, 5 y 22).
 */

import React from 'react';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function AdminButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: AdminButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeClasses = {
    sm: 'min-h-[36px] px-3 text-xs gap-1.5',
    md: 'min-h-(--size-button-height) px-4 py-2 text-sm gap-2',
    lg: 'min-h-[48px] px-6 py-2.5 text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] shadow-[var(--shadow-card)]',
    secondary:
      'bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)]',
    danger:
      'bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] border border-[var(--color-status-error)]/30 hover:bg-[var(--color-status-error)] hover:text-white',
    ghost:
      'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

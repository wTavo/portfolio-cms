/**
 * @file FormField.tsx
 * @description Campo de formulario accesible con tokens centralizados, etiquetas y soporte de errores (Directivas 1, 4, 5 y 22).
 */

import React from 'react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  prefix?: string;
}

export default function FormField({
  label,
  id,
  error,
  helperText,
  prefix,
  className = '',
  disabled,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="space-y-1 text-left">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="text-xs text-[var(--color-text-muted)] mr-1.5 select-none shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
          className={`w-full min-h-(--size-input-height) px-3.5 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none transition-colors disabled:opacity-50 ${
            error
              ? 'border-[var(--color-status-error)] focus:ring-1 focus:ring-[var(--color-status-error)]'
              : 'border-[var(--color-border-default)] focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)]'
          } ${className}`}
          {...inputProps}
        />
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-xs text-[var(--color-status-error)] pt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="text-[11px] text-[var(--color-text-muted)] pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

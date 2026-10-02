/**
 * @file LoadingButton.tsx
 * @description Botón idempotente con bloqueo de doble clic y retroalimentación de carga visual (Directivas 5 y 20).
 */

import AdminButton, { type AdminButtonProps } from './AdminButton';

export interface LoadingButtonProps extends AdminButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export default function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <AdminButton disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </AdminButton>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion, useIsPresent } from 'motion/react';
import { useDocumentScrollLock } from '../../lib/hooks/useDocumentScrollLock';

export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

interface ModalDialogLayerProps extends Omit<ModalDialogProps, 'isOpen'> {}

function ModalDialogLayer({
  onClose,
  labelledBy,
  describedBy,
  children,
  className = '',
  closeOnBackdrop = true,
}: ModalDialogLayerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const backdropPointerIdRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const [hasEntered, setHasEntered] = useState(false);

  // Esta capa permanece montada mientras Motion completa su animación de salida.
  useDocumentScrollLock(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const activeElement = document.activeElement;
    openerRef.current = activeElement instanceof HTMLElement && activeElement !== document.body
      ? activeElement
      : null;

    if (!dialog.open) dialog.showModal();

    // Siguiente tick para garantizar que el navegador reconozca el punto de partida blur(0px)
    const rafId = requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (dialog.open) dialog.close();

      const opener = openerRef.current;
      if (opener?.isConnected && !('disabled' in opener && opener.disabled)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  const handleBackdropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    backdropPointerIdRef.current = closeOnBackdrop && event.target === event.currentTarget
      ? event.pointerId
      : null;
  };

  const handleBackdropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const shouldClose = closeOnBackdrop &&
      event.target === event.currentTarget &&
      backdropPointerIdRef.current === event.pointerId;
    backdropPointerIdRef.current = null;
    if (shouldClose) onClose();
  };

  const resetBackdropPointer = () => {
    backdropPointerIdRef.current = null;
  };

  const isBackdropActive = hasEntered && isPresent;

  return (
    <motion.dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={handleCancel}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
      }}
      className={`fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none overflow-visible border-0 bg-transparent p-0 text-inherit [&::backdrop]:bg-transparent ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        maxWidth: 'none',
        maxHeight: 'none',
        margin: 0,
        padding: 0,
        border: 0,
        overflow: 'visible',
        background: 'transparent',
      }}
    >
      {/* Capa de oscurecimiento y desenfoque óptico nativo interpolado por GPU (Directivas 1, 3, 4, 13) */}
      <div
        aria-hidden="true"
        data-modal-backdrop
        onPointerDown={handleBackdropPointerDown}
        onPointerUp={handleBackdropPointerUp}
        onPointerLeave={resetBackdropPointer}
        onPointerCancel={resetBackdropPointer}
        className="fixed inset-0 touch-none will-change-[backdrop-filter,background-color,opacity]"
        style={{
          backdropFilter: isBackdropActive ? 'blur(16px)' : 'blur(0px)',
          WebkitBackdropFilter: isBackdropActive ? 'blur(16px)' : 'blur(0px)',
          backgroundColor: isBackdropActive ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0)',
          opacity: isBackdropActive ? 1 : 0,
          transition: prefersReducedMotion
            ? 'none'
            : 'backdrop-filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), -webkit-backdrop-filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      {/* Resplandor radial de difusión que se expande suavemente desde el centro del modal */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--color-brand-accent)/15_0%,transparent_70%)] will-change-[transform,opacity]"
        style={{
          transform: isBackdropActive ? 'scale(1)' : 'scale(0.5)',
          opacity: isBackdropActive ? 1 : 0,
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div className="relative z-10 h-full w-full pointer-events-none [&>*]:pointer-events-auto">
        {children}
      </div>
    </motion.dialog>
  );
}

export default function ModalDialog(props: ModalDialogProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {props.isOpen && <ModalDialogLayer key="modal-dialog" {...props} />}
    </AnimatePresence>,
    document.body,
  );
}

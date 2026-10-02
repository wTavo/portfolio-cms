import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';
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

    return () => {
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

  return (
    <motion.dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={handleCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : MOTION_DURATIONS.normal,
        ease: MOTION_EASINGS.standard,
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
      <div
        aria-hidden="true"
        data-modal-backdrop
        onPointerDown={handleBackdropPointerDown}
        onPointerUp={handleBackdropPointerUp}
        onPointerLeave={resetBackdropPointer}
        onPointerCancel={resetBackdropPointer}
        className="fixed inset-0 touch-none bg-black/65 backdrop-blur-sm"
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

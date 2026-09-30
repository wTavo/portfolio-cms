// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installDialogStubs } from '../setup/dialog-test-utils';
import ModalDialog from '../../src/components/ui/ModalDialog';

beforeEach(() => {
  installDialogStubs();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function ExampleDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="sample-title"
      describedBy="sample-description"
    >
      <h2 id="sample-title">Acceso</h2>
      <p id="sample-description">Ingresa tus datos.</p>
      <button type="button" onClick={onClose}>Cerrar</button>
      <input aria-label="Correo" type="email" />
    </ModalDialog>
  );
}

describe('ModalDialog', () => {
  it('usa el diálogo nativo etiquetado, mantiene Escape controlado y devuelve el foco al opener', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Abrir';
    document.body.append(opener);
    opener.focus();
    const onClose = vi.fn();
    const view = render(<ExampleDialog isOpen onClose={onClose} />);
    const dialog = screen.getByRole('dialog') as HTMLDialogElement;

    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.getAttribute('aria-labelledby')).toBe('sample-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('sample-description');
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Correo' }));

    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);
    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);

    view.rerender(<ExampleDialog isOpen={false} onClose={onClose} />);
    await waitFor(() => expect(dialog.close).toHaveBeenCalledOnce());
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('cierra por backdrop solo cuando el puntero inicia y termina fuera del contenido', () => {
    const onClose = vi.fn();
    render(<ExampleDialog isOpen onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.querySelector('[data-modal-backdrop]') as HTMLDivElement;
    const content = screen.getByText('Acceso');

    fireEvent.pointerDown(backdrop, { pointerId: 1 });
    fireEvent.pointerUp(content, { pointerId: 1 });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(backdrop, { pointerId: 2 });
    fireEvent.pointerUp(backdrop, { pointerId: 2 });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installDialogStubs } from '../setup/dialog-test-utils';
import Toast from '../../src/components/admin/ui/Toast';
import ConfirmDialog from '../../src/components/admin/ui/ConfirmDialog';

beforeEach(() => {
  installDialogStubs();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Toast component', () => {
  it('renderiza el mensaje con rol accesible y se cierra al hacer clic en descartar', () => {
    const handleClose = vi.fn();
    render(<Toast type="success" message="Operación exitosa" onClose={handleClose} />);

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Operación exitosa')).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog component', () => {
  it('presenta diálogo accesible con descarte a la izquierda y confirmación a la derecha sin usar "Cancelar"', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="¿Suspender usuario?"
        description="Esta acción impedirá el acceso a su portafolio."
        confirmText="Confirmar suspensión"
        discardText="Volver"
      />
    );

    expect(screen.getByText('¿Suspender usuario?')).toBeDefined();
    expect(screen.getByText('Esta acción impedirá el acceso a su portafolio.')).toBeDefined();

    const discardBtn = screen.getByRole('button', { name: 'Volver' });
    fireEvent.click(discardBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar suspensión' });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    // Regla 2: Prohibido "Cancelar"
    expect(screen.queryByText(/cancelar/i)).toBeNull();
  });
});

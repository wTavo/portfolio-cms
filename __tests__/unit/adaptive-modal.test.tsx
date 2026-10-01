// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installDialogStubs } from '../setup/dialog-test-utils';
import AdaptiveModal from '../../src/components/ui/AdaptiveModal';

beforeEach(() => {
  installDialogStubs();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AdaptiveModal', () => {
  it('compone el diálogo nativo etiquetado y conserva un contenedor scrollable de viewport', () => {
    render(
      <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión" ariaLabelledBy="test-title">
        <input aria-label="Correo" />
      </AdaptiveModal>,
    );

    const dialog = document.body.querySelector('dialog');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('test-title');
    expect(document.querySelector('[data-modal-scroll-container]')).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('restaura la posición voluntaria de scroll del usuario al cerrar el teclado virtual', () => {
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: {
        height: 800,
        width: 400,
        offsetTop: 0,
        offsetLeft: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    render(
      <AdaptiveModal isOpen onClose={() => {}} title="Formulario largo" ariaLabelledBy="test-title">
        <div style={{ height: '1200px' }}>
          <input aria-label="Campo de prueba" />
        </div>
      </AdaptiveModal>,
    );

    const scrollContainer = document.querySelector('[data-modal-scroll-container]') as HTMLElement;
    expect(scrollContainer).not.toBeNull();

    // El usuario se desplaza voluntariamente a 180px con el teclado cerrado
    scrollContainer.scrollTop = 180;
    scrollContainer.dispatchEvent(new Event('scroll'));

    // Se simula la apertura del teclado virtual (altura se reduce drásticamente)
    (window.visualViewport as unknown as { height: number }).height = 320;
    window.dispatchEvent(new Event('resize'));

    // Al abrirse el teclado, el scroll no salta a 0 forzadamente, manteniéndose en la posición del usuario
    expect(scrollContainer.scrollTop).toBe(180);

    // Se simula el cierre del teclado virtual (altura vuelve a 800)
    (window.visualViewport as unknown as { height: number }).height = 800;
    window.dispatchEvent(new Event('resize'));

    // Al cerrarse el teclado, se restaura exactamente la posición previa del usuario (180px)
    expect(scrollContainer.scrollTop).toBe(180);
  });
});

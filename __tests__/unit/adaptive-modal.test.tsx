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
});

// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installDialogStubs } from '../setup/dialog-test-utils';
import AdaptiveModal from '../../src/components/ui/AdaptiveModal';

beforeEach(() => {
  installDialogStubs();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
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

  it('keeps a fitting modal centered when the visual viewport pans after the keyboard opens', async () => {
    vi.useFakeTimers();
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    const viewport = Object.assign(new EventTarget(), {
      height: 825,
      width: 390,
      offsetTop: 0,
      offsetLeft: 0,
    });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 825 });

    try {
      render(
        <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión">
          <input aria-label="Correo" />
        </AdaptiveModal>,
      );

      act(() => {
        viewport.height = 496;
        viewport.dispatchEvent(new Event('resize'));
      });
      await act(async () => vi.advanceTimersByTimeAsync(120));

      const frame = document.querySelector<HTMLElement>('[data-modal-scroll-container] > div');
      expect(frame?.style.justifyContent).toBe('safe center');
      expect(frame?.style.paddingTop).toBe('');

      act(() => {
        viewport.offsetTop = 239;
        viewport.dispatchEvent(new Event('scroll'));
        viewport.height = 432;
        viewport.dispatchEvent(new Event('resize'));
      });

      expect(frame?.style.justifyContent).toBe('safe center');
      expect(frame?.style.paddingTop).toBe('');

      await act(async () => vi.advanceTimersByTimeAsync(16));

      const scrollContainer = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
      expect(scrollContainer?.style.top).toBe('239px');
      expect(scrollContainer?.style.height).toBe('432px');
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
      if (originalInnerHeight) Object.defineProperty(window, 'innerHeight', originalInnerHeight);
    }
  });
});

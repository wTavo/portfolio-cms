// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installDialogStubs } from '../setup/dialog-test-utils';
import AdaptiveModal from '../../src/components/ui/AdaptiveModal';

const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock('motion/react', async (importOriginal) => {
  const motionModule = await importOriginal<typeof import('motion/react')>();
  return { ...motionModule, useReducedMotion: () => motionPreference.reduce };
});

interface TestVisualViewport extends EventTarget {
  height: number;
  width: number;
  offsetTop: number;
  offsetLeft: number;
}

function createVisualViewport(height = 825, width = 390): TestVisualViewport {
  return Object.assign(new EventTarget(), { height, width, offsetTop: 0, offsetLeft: 0 });
}

async function flushFrames(count: number): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await act(async () => vi.advanceTimersByTimeAsync(16));
  }
}

function useControlledFrameClock(): void {
  vi.useFakeTimers();
  vi.spyOn(window.performance, 'now').mockImplementation(() => Date.now());
}

function mockTop(top: number): DOMRect {
  return { top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
}

beforeEach(() => {
  installDialogStubs();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  motionPreference.reduce = false;
  vi.restoreAllMocks();
});

describe('AdaptiveModal', () => {
  it('composes a labeled native dialog with a safe-centered, internally scrollable viewport', () => {
    render(
      <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión" ariaLabelledBy="test-title">
        <input aria-label="Correo" />
      </AdaptiveModal>,
    );

    const dialog = document.body.querySelector('dialog');
    const scrollContainer = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
    const frame = scrollContainer?.firstElementChild as HTMLElement | null;

    expect(dialog?.getAttribute('aria-labelledby')).toBe('test-title');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(scrollContainer?.className).toContain('overflow-y-auto');
    expect(scrollContainer?.className).toContain('overscroll-contain');
    expect(scrollContainer?.style.touchAction).toBe('pan-y pinch-zoom');
    expect(frame?.style.justifyContent).toBe('safe center');
  });

  it('applies one final keyboard geometry and starts one fluid reposition after multi-frame opening', async () => {
    useControlledFrameClock();
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = createVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });

    try {
      render(
        <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión">
          <input aria-label="Correo" />
        </AdaptiveModal>,
      );
      const container = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
      const wrapper = container?.querySelector<HTMLElement>('[data-modal-position-wrapper]');
      const email = document.querySelector<HTMLInputElement>('input[aria-label="Correo"]');
      fireEvent.focus(email!);
      expect(container?.style.height).toBe('825px');
      const animation = { cancel: vi.fn() } as unknown as Animation;
      const animate = vi.fn(() => animation);
      if (wrapper) Object.defineProperty(wrapper, 'animate', { configurable: true, value: animate });
      if (wrapper) vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(mockTop(120));

      act(() => {
        viewport.height = 700;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(2);
      expect(container?.style.height).toBe('825px');
      act(() => {
        viewport.height = 500;
        viewport.offsetTop = 48;
        viewport.dispatchEvent(new Event('resize'));
        viewport.dispatchEvent(new Event('scroll'));
      });
      await flushFrames(2);

      expect(container?.style.height).toBe('825px');
      expect(animate).not.toHaveBeenCalled();

      await flushFrames(3);
      await flushFrames(3);

      expect(container?.style.top).toBe('48px');
      expect(container?.style.height).toBe('500px');
      expect(animate).toHaveBeenCalledTimes(1);
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    }
  });

  it('does not apply another layout offset when switching inputs while the keyboard remains open', async () => {
    useControlledFrameClock();
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = createVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });

    try {
      render(
        <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión">
          <input aria-label="Correo" />
          <input aria-label="Contraseña" type="password" />
        </AdaptiveModal>,
      );
      const email = document.querySelector<HTMLInputElement>('input[aria-label="Correo"]');
      const password = document.querySelector<HTMLInputElement>('input[aria-label="Contraseña"]');
      const container = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
      const wrapper = container?.querySelector<HTMLElement>('[data-modal-position-wrapper]');
      const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
      if (wrapper) Object.defineProperty(wrapper, 'animate', { configurable: true, value: animate });
      if (wrapper) vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(mockTop(100));
      fireEvent.focus(email!);

      act(() => {
        viewport.height = 500;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(8);
      expect(container?.style.height).toBe('500px');
      animate.mockClear();

      fireEvent.focus(email!);
      fireEvent.blur(email!);
      fireEvent.focus(password!);
      act(() => {
        viewport.height = 460;
        viewport.offsetTop = 24;
        viewport.dispatchEvent(new Event('resize'));
        viewport.dispatchEvent(new Event('scroll'));
      });
      await flushFrames(5);

      expect(container?.style.top).toBe('0px');
      expect(container?.style.height).toBe('500px');
      expect(animate).not.toHaveBeenCalled();
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    }
  });

  it('waits through native viewport panning before resizing and centering once', async () => {
    useControlledFrameClock();
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = createVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });

    try {
      render(
        <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión">
          <input aria-label="Correo" />
          <input aria-label="Contraseña" type="password" />
        </AdaptiveModal>,
      );
      const password = document.querySelector<HTMLInputElement>('input[aria-label="Contraseña"]');
      const container = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
      const wrapper = container?.querySelector<HTMLElement>('[data-modal-position-wrapper]');
      const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
      if (wrapper) Object.defineProperty(wrapper, 'animate', { configurable: true, value: animate });
      if (wrapper) vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(mockTop(120));

      fireEvent.focus(password!);
      act(() => {
        viewport.height = 500;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(1);

      for (const offsetTop of [24, 120, 244]) {
        act(() => {
          viewport.offsetTop = offsetTop;
          viewport.dispatchEvent(new Event('scroll'));
        });
        await flushFrames(1);
        expect(container?.style.top).toBe('0px');
        expect(container?.style.height).toBe('825px');
        expect(animate).not.toHaveBeenCalled();
      }

      await flushFrames(8);
      expect(container?.style.top).toBe('244px');
      expect(container?.style.height).toBe('500px');
      expect(animate).toHaveBeenCalledTimes(1);
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    }
  });

  it('does not run the positional animation when reduced motion is preferred', async () => {
    useControlledFrameClock();
    motionPreference.reduce = true;
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = createVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });

    try {
      render(
        <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión">
          <input aria-label="Correo" />
        </AdaptiveModal>,
      );
      const container = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
      const wrapper = container?.querySelector<HTMLElement>('[data-modal-position-wrapper]');
      const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
      if (wrapper) Object.defineProperty(wrapper, 'animate', { configurable: true, value: animate });
      if (wrapper) vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(mockTop(120));
      fireEvent.focus(document.querySelector<HTMLInputElement>('input[aria-label="Correo"]')!);

      act(() => {
        viewport.height = 500;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(8);

      expect(container?.style.height).toBe('500px');
      expect(animate).not.toHaveBeenCalled();
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    }
  });

  it('animates each keyboard open/close cycle once and restores the saved modal scroll', async () => {
    useControlledFrameClock();
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = createVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });

    try {
      render(
        <AdaptiveModal isOpen onClose={() => {}} title="Inicio de sesión">
          <input aria-label="Correo" />
        </AdaptiveModal>,
      );
      const container = document.querySelector<HTMLElement>('[data-modal-scroll-container]');
      const wrapper = container?.querySelector<HTMLElement>('[data-modal-position-wrapper]');
      const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
      if (wrapper) Object.defineProperty(wrapper, 'animate', { configurable: true, value: animate });
      if (wrapper) vi.spyOn(wrapper, 'getBoundingClientRect').mockImplementation(() =>
        mockTop(container?.style.height === '825px' ? 240 : 120));
      fireEvent.focus(document.querySelector<HTMLInputElement>('input[aria-label="Correo"]')!);

      container!.scrollTop = 35;
      fireEvent.scroll(container!);
      act(() => {
        viewport.height = 500;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(2);
      expect(container?.style.height).toBe('825px');
      container!.scrollTop = 82;
      fireEvent.scroll(container!);
      await flushFrames(7);
      expect(animate).toHaveBeenCalledTimes(1);

      act(() => {
        viewport.height = 825;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(8);
      expect(container?.scrollTop).toBe(35);
      expect(animate).toHaveBeenCalledTimes(2);

      act(() => {
        viewport.height = 500;
        viewport.dispatchEvent(new Event('resize'));
      });
      await flushFrames(8);
      expect(animate).toHaveBeenCalledTimes(3);
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    }
  });
});

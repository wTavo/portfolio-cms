// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDocumentScrollLock } from '../../src/lib/hooks/useDocumentScrollLock';

function LockConsumer({ active }: { active: boolean }) {
  useDocumentScrollLock(active);
  return null;
}

function LockPair({ first, second }: { first: boolean; second: boolean }) {
  return <>
    <LockConsumer active={first} />
    <LockConsumer active={second} />
  </>;
}

let originalScrollY = 0;

beforeEach(() => {
  originalScrollY = window.scrollY;
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  document.body.style.overflow = 'auto';
  document.body.style.position = 'relative';
  document.body.style.width = '80%';
  document.body.style.top = '3px';
  document.body.style.left = '4px';
  document.body.style.right = '5px';
  document.documentElement.style.overflow = 'scroll';
  document.documentElement.style.scrollBehavior = 'smooth';
});

afterEach(() => {
  cleanup();
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
  Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
  vi.restoreAllMocks();
});

describe('useDocumentScrollLock', () => {
  it('bloquea el documento y restaura estilos y posición previos al liberar el último lock', () => {
    const view = render(<LockConsumer active />);

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-120px');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.documentElement.style.scrollBehavior).toBe('auto');

    view.unmount();

    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.width).toBe('80%');
    expect(document.body.style.top).toBe('3px');
    expect(document.body.style.left).toBe('4px');
    expect(document.body.style.right).toBe('5px');
    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('scroll');
    expect(document.documentElement.style.scrollBehavior).toBe('smooth');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 120);
  });

  it('mantiene el documento bloqueado mientras otro consumidor siga activo', () => {
    const view = render(<LockPair first second />);

    view.rerender(<LockPair first={false} second />);
    expect(document.body.style.position).toBe('fixed');

    act(() => view.rerender(<LockPair first={false} second={false} />));
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.overflow).toBe('auto');
    expect(window.scrollTo).toHaveBeenCalledOnce();
  });
});

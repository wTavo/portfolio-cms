// @vitest-environment jsdom
import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '../../src/lib/hooks/useIsMobile';

describe('useIsMobile', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('detects compact dimensions and coarse pointers and updates on resize', () => {
    let coarsePointer = false;
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({ matches: coarsePointer })));
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current).toBe(false);

    coarsePointer = true;
    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current).toBe(true);
  });

  it('detects a short viewport even when its width is desktop-sized', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});

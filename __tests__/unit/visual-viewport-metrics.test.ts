import { describe, expect, it, vi } from 'vitest';
import { observeViewportBounds } from '../../src/lib/visualViewportMetrics';

interface FakeVisualViewport extends EventTarget {
  height: number;
  width: number;
  offsetTop: number;
  offsetLeft: number;
}

interface FakeViewportWindow extends EventTarget {
  innerHeight: number;
  innerWidth: number;
  visualViewport: FakeVisualViewport | null;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
}

function createViewportSource(withVisualViewport = true) {
  const viewport = Object.assign(new EventTarget(), {
    height: 825,
    width: 390,
    offsetTop: 0,
    offsetLeft: 0,
  }) as FakeVisualViewport;
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextFrameId = 1;
  const source = Object.assign(new EventTarget(), {
    innerHeight: 825,
    innerWidth: 390,
    visualViewport: withVisualViewport ? viewport : null,
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrameId++;
      callbacks.set(id, callback);
      return id;
    }),
    cancelAnimationFrame: vi.fn((id: number) => callbacks.delete(id)),
  }) as FakeViewportWindow;

  return {
    source,
    viewport,
    flushFrame() {
      const pending = [...callbacks.entries()];
      callbacks.clear();
      pending.forEach(([, callback]) => callback(0));
    },
    pendingFrameCount: () => callbacks.size,
  };
}

describe('observeViewportBounds', () => {
  it('applies initial VisualViewport bounds immediately', () => {
    const { source, viewport } = createViewportSource();
    const onBounds = vi.fn();

    observeViewportBounds(source, onBounds);

    expect(onBounds).toHaveBeenCalledExactlyOnceWith(
      { top: 0, left: 0, width: 390, height: 825 },
      ['initial'],
    );
    viewport.offsetTop = 12;
    expect(onBounds).toHaveBeenCalledTimes(1);
  });

  it('coalesces resize and scroll events into one write of the latest complete rectangle', () => {
    const { source, viewport, flushFrame, pendingFrameCount } = createViewportSource();
    const onBounds = vi.fn();
    observeViewportBounds(source, onBounds);
    onBounds.mockClear();

    viewport.height = 496;
    viewport.dispatchEvent(new Event('resize'));
    viewport.offsetTop = 48;
    viewport.offsetLeft = 3;
    viewport.width = 390;
    viewport.dispatchEvent(new Event('scroll'));

    expect(pendingFrameCount()).toBe(1);
    expect(onBounds).not.toHaveBeenCalled();

    flushFrame();

    expect(onBounds).toHaveBeenCalledExactlyOnceWith(
      { top: 48, left: 3, width: 390, height: 496 },
      ['visualviewport-resize', 'visualviewport-scroll'],
    );
    expect(pendingFrameCount()).toBe(0);
  });

  it('reads a new snapshot for each later frame without a timed settling delay', () => {
    const { source, viewport, flushFrame } = createViewportSource();
    const onBounds = vi.fn();
    observeViewportBounds(source, onBounds);
    onBounds.mockClear();

    viewport.height = 432;
    viewport.dispatchEvent(new Event('resize'));
    flushFrame();
    viewport.offsetTop = 60;
    viewport.dispatchEvent(new Event('scroll'));
    flushFrame();

    expect(onBounds.mock.calls).toEqual([
      [{ top: 0, left: 0, width: 390, height: 432 }, ['visualviewport-resize']],
      [{ top: 60, left: 0, width: 390, height: 432 }, ['visualviewport-scroll']],
    ]);
  });

  it('falls back to layout viewport bounds when VisualViewport is unavailable', () => {
    const { source, flushFrame } = createViewportSource(false);
    const onBounds = vi.fn();
    observeViewportBounds(source, onBounds);
    onBounds.mockClear();

    source.innerWidth = 412;
    source.innerHeight = 700;
    source.dispatchEvent(new Event('resize'));
    flushFrame();

    expect(onBounds).toHaveBeenCalledExactlyOnceWith(
      { top: 0, left: 0, width: 412, height: 700 },
      ['window-resize'],
    );
  });

  it('removes listeners and cancels a pending frame on cleanup', () => {
    const { source, viewport, flushFrame, pendingFrameCount } = createViewportSource();
    const onBounds = vi.fn();
    const cleanup = observeViewportBounds(source, onBounds);
    onBounds.mockClear();

    viewport.dispatchEvent(new Event('resize'));
    expect(pendingFrameCount()).toBe(1);
    cleanup();

    expect(pendingFrameCount()).toBe(0);
    expect(source.cancelAnimationFrame).toHaveBeenCalledOnce();

    viewport.height = 400;
    viewport.dispatchEvent(new Event('resize'));
    source.dispatchEvent(new Event('resize'));
    flushFrame();

    expect(onBounds).not.toHaveBeenCalled();
    expect(source.requestAnimationFrame).toHaveBeenCalledOnce();
  });
});

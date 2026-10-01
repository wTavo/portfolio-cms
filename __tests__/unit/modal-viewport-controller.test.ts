import { describe, expect, it, vi } from 'vitest';
import {
  createModalViewportController,
  type ModalViewportControllerOptions,
} from '../../src/lib/modalViewportController';
import type { ViewportBounds, ViewportEventSourceName } from '../../src/lib/visualViewportMetrics';

const closedBounds: ViewportBounds = { top: 0, left: 0, width: 390, height: 825 };
const visualResize: readonly ViewportEventSourceName[] = ['visualviewport-resize'];
const visualScroll: readonly ViewportEventSourceName[] = ['visualviewport-scroll'];
const windowResize: readonly ViewportEventSourceName[] = ['window-resize'];

function createHarness(initialBounds = closedBounds) {
  let time = 0;
  let layoutViewport = { width: 390, height: closedBounds.height };
  let nextFrame = 1;
  const callbacks = new Map<number, FrameRequestCallback>();
  const onStableBounds = vi.fn();
  const options: ModalViewportControllerOptions = {
    initialBounds,
    baselineHeight: closedBounds.height,
    readLayoutViewport: () => layoutViewport,
    scheduleFrame(callback) {
      const id = nextFrame++;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      callbacks.delete(id);
    },
    now: () => time,
    onStableBounds,
  };
  const controller = createModalViewportController(options);

  return {
    controller,
    onStableBounds,
    tick(frames = 1) {
      for (let frame = 0; frame < frames; frame += 1) {
        time += 16;
        const pending = [...callbacks.entries()];
        callbacks.clear();
        pending.forEach(([, callback]) => callback(time));
      }
    },
    advanceTime(milliseconds: number) {
      time += milliseconds;
    },
    setLayoutViewport(bounds: { width: number; height: number }) {
      layoutViewport = bounds;
    },
    pendingFrames: () => callbacks.size,
  };
}

function openKeyboard(harness: ReturnType<typeof createHarness>) {
  harness.controller.observe({ ...closedBounds, height: 500 }, visualResize, { editableInputFocused: true });
  harness.tick(8);
}

describe('createModalViewportController', () => {
  it('does not reposition for the initial closed viewport', () => {
    const { onStableBounds } = createHarness();

    expect(onStableBounds).not.toHaveBeenCalled();
  });

  it('treats a large desktop height resize without editable focus as a viewport resize, not a keyboard', () => {
    const harness = createHarness();
    const resized = { ...closedBounds, height: 700 };

    harness.controller.observe(resized, ['window-resize']);
    harness.tick(8);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(resized, 'viewport-resize');
  });

  it('emits one final keyboard-open snapshot after geometry is stable', () => {
    const harness = createHarness();
    const firstIntermediate = { ...closedBounds, height: 700 };
    const finalBounds = { ...closedBounds, height: 500, top: 40 };

    harness.controller.observe(firstIntermediate, visualResize, { editableInputFocused: true });
    harness.tick(1);
    harness.controller.observe(finalBounds, visualResize);
    expect(harness.onStableBounds).not.toHaveBeenCalled();
    harness.tick(3);
    expect(harness.onStableBounds).not.toHaveBeenCalled();
    harness.tick(1);
    expect(harness.onStableBounds).not.toHaveBeenCalled();
    harness.tick(3);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(finalBounds, 'keyboard-open');
  });

  it('waits for late VisualViewport panning instead of settling in the gap after resize', () => {
    const harness = createHarness();
    const keyboardBounds = { ...closedBounds, height: 500 };
    const finalBounds = { ...keyboardBounds, top: 244 };

    harness.controller.observe(keyboardBounds, visualResize, { editableInputFocused: true });
    harness.tick(4);

    expect(harness.onStableBounds).not.toHaveBeenCalled();

    harness.controller.observe(finalBounds, visualScroll);
    harness.tick(6);
    expect(harness.onStableBounds).not.toHaveBeenCalled();

    harness.tick(2);
    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(finalBounds, 'keyboard-open');
  });

  it('emits one keyboard-close snapshot after the viewport returns to baseline', () => {
    const harness = createHarness();
    openKeyboard(harness);
    harness.onStableBounds.mockClear();
    const closedAgain = { ...closedBounds, top: 0 };

    harness.controller.observe(closedAgain, visualResize);
    harness.tick(8);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(closedAgain, 'keyboard-close');
  });

  it('does not apply a second layout offset when VisualViewport pans while the keyboard is stable', () => {
    const harness = createHarness();
    openKeyboard(harness);
    harness.onStableBounds.mockClear();

    harness.controller.observe({ ...closedBounds, height: 500, top: 56 }, visualScroll);

    expect(harness.pendingFrames()).toBe(0);
    expect(harness.onStableBounds).not.toHaveBeenCalled();
  });

  it('waits for native auto-pan to finish before settling keyboard geometry', () => {
    const harness = createHarness();
    const openingBounds = { ...closedBounds, height: 500 };
    harness.controller.observe(openingBounds, visualResize, { editableInputFocused: true });

    for (const top of [24, 120, 244]) {
      harness.controller.observe({ ...openingBounds, top }, visualScroll);
      expect(harness.onStableBounds).not.toHaveBeenCalled();
    }

    harness.tick(8);
    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(
      { ...openingBounds, top: 244 },
      'keyboard-open',
    );
  });

  it('keeps the card stable when switching inputs changes visual viewport height', () => {
    const harness = createHarness();
    openKeyboard(harness);
    harness.onStableBounds.mockClear();

    harness.controller.observe({ ...closedBounds, height: 500 }, [], {
      editableInputFocused: true,
      changed: true,
    });
    harness.controller.observe({ ...closedBounds, height: 460, top: 24 }, visualResize);
    harness.tick(5);

    expect(harness.onStableBounds).not.toHaveBeenCalled();
    expect(harness.pendingFrames()).toBe(0);
  });

  it('settles a genuine viewport width change while the keyboard remains open', () => {
    const harness = createHarness();
    openKeyboard(harness);
    harness.onStableBounds.mockClear();
    const resized = { top: 0, left: 0, width: 844, height: 260 };
    harness.setLayoutViewport({ width: 844, height: 390 });

    harness.controller.observe(resized, windowResize);
    harness.tick(8);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(resized, 'viewport-resize');

    harness.onStableBounds.mockClear();
    const keyboardClosedInLandscape = { top: 0, left: 0, width: 844, height: 390 };
    harness.controller.observe(keyboardClosedInLandscape, visualResize);
    harness.tick(8);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(keyboardClosedInLandscape, 'keyboard-close');
  });

  it('reclassifies a pending orientation update as keyboard close if the keyboard closes before settling', () => {
    const harness = createHarness();
    openKeyboard(harness);
    harness.onStableBounds.mockClear();
    harness.setLayoutViewport({ width: 844, height: 390 });
    harness.controller.observe({ top: 0, left: 0, width: 844, height: 260 }, windowResize);
    const closedInLandscape = { top: 0, left: 0, width: 844, height: 390 };

    harness.controller.observe(closedInLandscape, visualResize);
    harness.tick(4);
    expect(harness.onStableBounds).not.toHaveBeenCalled();
    harness.tick(4);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(closedInLandscape, 'keyboard-close');
  });

  it('publishes the latest geometry at the maximum settle deadline', () => {
    const harness = createHarness();
    const latest = { ...closedBounds, height: 480, top: 34 };
    harness.controller.observe(latest, visualResize, { editableInputFocused: true });

    harness.advanceTime(500);
    harness.tick(1);

    expect(harness.onStableBounds).toHaveBeenCalledExactlyOnceWith(latest, 'keyboard-open');
  });

  it('cancels pending samples and prevents callbacks after disposal', () => {
    const harness = createHarness();
    harness.controller.observe({ ...closedBounds, height: 500 }, visualResize, { editableInputFocused: true });
    expect(harness.pendingFrames()).toBe(1);

    harness.controller.dispose();
    harness.tick(5);

    expect(harness.onStableBounds).not.toHaveBeenCalled();
    expect(harness.pendingFrames()).toBe(0);
  });
});

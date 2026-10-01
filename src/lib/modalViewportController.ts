import type { ViewportBounds, ViewportEventSourceName } from './visualViewportMetrics';

export const MODAL_KEYBOARD_HEIGHT_THRESHOLD = 80;
const BOUNDS_STABILITY_TOLERANCE = 1;
const STABLE_FRAME_COUNT = 3;
// Android browsers may resize the VisualViewport before their automatic pan begins.
const GEOMETRY_QUIET_DURATION_MS = 100;
const MAX_SETTLE_DURATION_MS = 500;

export type ModalViewportTransition = 'keyboard-open' | 'keyboard-close' | 'viewport-resize';

export interface ModalViewportControllerOptions {
  initialBounds: ViewportBounds;
  baselineHeight: number;
  initialEditableInputFocused?: boolean;
  readLayoutViewport: () => { width: number; height: number };
  scheduleFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
  now: () => number;
  onStableBounds: (bounds: ViewportBounds, transition: ModalViewportTransition) => void;
}

export interface ModalViewportController {
  observe(
    bounds: ViewportBounds,
    sources: readonly ViewportEventSourceName[],
    focusState?: { editableInputFocused: boolean; changed?: boolean },
  ): void;
  dispose(): void;
}

function boundsAreClose(a: ViewportBounds, b: ViewportBounds): boolean {
  return Math.abs(a.top - b.top) <= BOUNDS_STABILITY_TOLERANCE &&
    Math.abs(a.left - b.left) <= BOUNDS_STABILITY_TOLERANCE &&
    Math.abs(a.width - b.width) <= BOUNDS_STABILITY_TOLERANCE &&
    Math.abs(a.height - b.height) <= BOUNDS_STABILITY_TOLERANCE;
}

export function createModalViewportController(
  options: ModalViewportControllerOptions,
): ModalViewportController {
  let bounds = options.initialBounds;
  let baselineHeight = options.baselineHeight;
  let editableInputFocused = options.initialEditableInputFocused ?? false;
  let keyboardOpen = baselineHeight - bounds.height > MODAL_KEYBOARD_HEIGHT_THRESHOLD && editableInputFocused;
  let focusSwitchLock = false;
  let pendingTransition: ModalViewportTransition | null = null;
  let pendingFrame: number | null = null;
  let settleStartedAt = 0;
  let lastGeometryChangeAt = 0;
  let stableFrameCount = 0;
  let previousSample = bounds;
  let disposed = false;

  const clearPendingTransition = () => {
    if (pendingFrame !== null) {
      options.cancelFrame(pendingFrame);
      pendingFrame = null;
    }
    pendingTransition = null;
    stableFrameCount = 0;
  };

  const finishTransition = () => {
    if (disposed || !pendingTransition) return;

    const transition = pendingTransition;
    pendingFrame = null;
    pendingTransition = null;
    stableFrameCount = 0;

    if (transition === 'keyboard-open') {
      keyboardOpen = true;
    } else if (transition === 'keyboard-close') {
      keyboardOpen = false;
      focusSwitchLock = false;
      const layoutViewport = options.readLayoutViewport();
      baselineHeight = Math.max(baselineHeight, layoutViewport.height, bounds.height);
    }

    options.onStableBounds(bounds, transition);
  };

  const sampleUntilStable = () => {
    if (disposed || !pendingTransition) return;

    if (boundsAreClose(bounds, previousSample)) {
      stableFrameCount += 1;
    } else {
      stableFrameCount = 0;
    }
    previousSample = bounds;

    const now = options.now();
    const geometryIsQuiet = now - lastGeometryChangeAt >= GEOMETRY_QUIET_DURATION_MS;
    if ((stableFrameCount >= STABLE_FRAME_COUNT && geometryIsQuiet) ||
      now - settleStartedAt >= MAX_SETTLE_DURATION_MS) {
      finishTransition();
      return;
    }

    pendingFrame = options.scheduleFrame(sampleUntilStable);
  };

  const startTransition = (transition: ModalViewportTransition) => {
    if (disposed) return;
    pendingTransition = transition;
    settleStartedAt = options.now();
    lastGeometryChangeAt = settleStartedAt;
    stableFrameCount = 0;
    previousSample = bounds;
    if (pendingFrame === null) {
      pendingFrame = options.scheduleFrame(sampleUntilStable);
    }
  };

  const observe: ModalViewportController['observe'] = (nextBounds, sources, focusState) => {
    if (disposed) return;

    const previousBounds = bounds;
    bounds = nextBounds;
    if (sources.includes('initial')) return;

    if (pendingTransition && !boundsAreClose(nextBounds, previousBounds)) {
      lastGeometryChangeAt = options.now();
      stableFrameCount = 0;
    }

    if (focusState) {
      editableInputFocused = focusState.editableInputFocused;
      if (focusState.changed && keyboardOpen) focusSwitchLock = true;
    }

    const widthChanged = Math.abs(nextBounds.width - previousBounds.width) > BOUNDS_STABILITY_TOLERANCE;
    const layoutViewport = options.readLayoutViewport();
    if (widthChanged) baselineHeight = layoutViewport.height;

    const geometryIndicatesKeyboard = baselineHeight - nextBounds.height > MODAL_KEYBOARD_HEIGHT_THRESHOLD;
    const keyboardIsPresent = geometryIndicatesKeyboard && (keyboardOpen || editableInputFocused);
    if (pendingTransition) {
      if (pendingTransition === 'keyboard-open' && !keyboardIsPresent && !keyboardOpen) {
        clearPendingTransition();
        return;
      }
      if (pendingTransition === 'keyboard-close' && keyboardIsPresent && keyboardOpen) {
        clearPendingTransition();
        return;
      }
      if (pendingTransition === 'viewport-resize') {
        if (keyboardOpen && !keyboardIsPresent) pendingTransition = 'keyboard-close';
        else if (!keyboardOpen && keyboardIsPresent) pendingTransition = 'keyboard-open';
      }
      if (widthChanged && pendingTransition !== 'keyboard-open' && pendingTransition !== 'keyboard-close') {
        pendingTransition = 'viewport-resize';
      }
      return;
    }

    if (!keyboardOpen && keyboardIsPresent) {
      startTransition('keyboard-open');
      return;
    }

    if (keyboardOpen && !keyboardIsPresent) {
      startTransition('keyboard-close');
      return;
    }

    if (keyboardOpen) {
      if (widthChanged || (sources.includes('window-resize') && !focusSwitchLock)) {
        startTransition('viewport-resize');
      }
      return;
    }

    if (!boundsAreClose(nextBounds, previousBounds)) {
      if (nextBounds.height > baselineHeight) baselineHeight = nextBounds.height;
      startTransition('viewport-resize');
    }
  };

  return {
    observe,
    dispose() {
      if (disposed) return;
      disposed = true;
      clearPendingTransition();
    },
  };
}

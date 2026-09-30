export interface ViewportBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ViewportEventSourceName =
  | 'visualviewport-resize'
  | 'visualviewport-scroll'
  | 'window-resize'
  | 'window-scroll'
  | 'initial';

export interface ViewportEventSource extends EventTarget {
  innerWidth: number;
  innerHeight: number;
  visualViewport: (EventTarget & {
    height: number;
    width: number;
    offsetTop: number;
    offsetLeft: number;
  }) | null;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
}

function readViewportBounds(source: ViewportEventSource): ViewportBounds {
  const viewport = source.visualViewport;

  return viewport
    ? {
        top: viewport.offsetTop,
        left: viewport.offsetLeft,
        width: viewport.width,
        height: viewport.height,
      }
    : {
        top: 0,
        left: 0,
        width: source.innerWidth,
        height: source.innerHeight,
      };
}

/** Keep an element synchronized with the latest visible viewport at most once per frame. */
export function observeViewportBounds(
  source: ViewportEventSource,
  onBounds: (bounds: ViewportBounds, sources: readonly ViewportEventSourceName[]) => void,
): () => void {
  const visualViewport = source.visualViewport;
  let animationFrame: number | null = null;
  let isDisposed = false;
  const pendingSources = new Set<ViewportEventSourceName>();

  const update = (sources: readonly ViewportEventSourceName[]) => {
    if (isDisposed) return;
    onBounds(readViewportBounds(source), sources);
  };

  const scheduleUpdate = () => {
    if (isDisposed || animationFrame !== null) return;

    animationFrame = source.requestAnimationFrame(() => {
      animationFrame = null;
      const sources = [...pendingSources];
      pendingSources.clear();
      update(sources);
    });
  };

  const onVisualViewportResize = () => {
    pendingSources.add('visualviewport-resize');
    scheduleUpdate();
  };
  const onVisualViewportScroll = () => {
    pendingSources.add('visualviewport-scroll');
    scheduleUpdate();
  };
  const onWindowResize = () => {
    pendingSources.add('window-resize');
    scheduleUpdate();
  };
  const onWindowScroll = () => {
    pendingSources.add('window-scroll');
    scheduleUpdate();
  };

  visualViewport?.addEventListener('resize', onVisualViewportResize);
  visualViewport?.addEventListener('scroll', onVisualViewportScroll);
  source.addEventListener('resize', onWindowResize);
  source.addEventListener('scroll', onWindowScroll);

  update(['initial']);

  return () => {
    if (isDisposed) return;
    isDisposed = true;
    visualViewport?.removeEventListener('resize', onVisualViewportResize);
    visualViewport?.removeEventListener('scroll', onVisualViewportScroll);
    source.removeEventListener('resize', onWindowResize);
    source.removeEventListener('scroll', onWindowScroll);
    pendingSources.clear();

    if (animationFrame !== null) {
      source.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };
}

/** Apply a complete visual viewport rectangle in one style update. */
export function syncVisualViewportBounds(
  element: Pick<HTMLElement, 'style'> | null,
  bounds: ViewportBounds,
): void {
  if (!element) return;
  element.style.top = `${bounds.top}px`;
  element.style.left = `${bounds.left}px`;
  element.style.width = `${bounds.width}px`;
  element.style.height = `${bounds.height}px`;
}

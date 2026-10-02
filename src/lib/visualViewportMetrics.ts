export interface ViewportMetrics {
  height: number;
  width: number;
  isKeyboardOpen: boolean;
}

export interface CurrentViewportMetrics {
  height: number;
  width: number;
}

/** Mantiene la altura estable durante cambios rápidos de foco sin renderizados por desplazamientos de viewport. */
export function getNextViewportMetrics(
  previous: ViewportMetrics,
  current: CurrentViewportMetrics,
  isKeyboardOpen: boolean,
  isSwitchingInput: boolean,
): ViewportMetrics {
  return {
    height: isKeyboardOpen && isSwitchingInput ? previous.height : current.height,
    width: current.width,
    isKeyboardOpen,
  };
}

/** Aplica la geometría del viewport visual de forma inmediata, fuera del ciclo asíncrono de renderizado de React. */
export function syncVisualViewportBounds(
  element: Pick<HTMLElement, 'style'> | null,
  bounds: { top: number; left: number; width: number; height: number },
): void {
  if (!element) return;
  element.style.top = `${bounds.top}px`;
  element.style.left = `${bounds.left}px`;
  element.style.width = `${bounds.width}px`;
  element.style.height = `${bounds.height}px`;
}

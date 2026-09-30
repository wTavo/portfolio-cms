interface VerticalPositionAnimationOptions {
  duration: number;
  easing: string;
  prefersReducedMotion?: boolean;
}

/** Smoothly bridges a viewport-driven layout change without delaying the layout itself. */
export function animateVerticalPosition(
  element: HTMLElement | null,
  previousTop: number | null,
  { duration, easing, prefersReducedMotion = false }: VerticalPositionAnimationOptions,
): void {
  if (!element || previousTop === null || prefersReducedMotion || typeof element.animate !== 'function') return;

  const offset = previousTop - element.getBoundingClientRect().top;
  if (Math.abs(offset) < 1) return;

  element.animate(
    [{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }],
    { duration, easing },
  );
}

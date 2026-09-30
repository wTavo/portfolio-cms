export interface VerticalPositionAnimationOptions {
  duration: number;
  easing: string;
  prefersReducedMotion: boolean;
}

const MINIMUM_POSITION_DELTA = 0.5;
const activeAnimations = new WeakMap<Element, Animation>();

export function animateVerticalPosition(
  element: HTMLElement,
  previousTop: number,
  options: VerticalPositionAnimationOptions,
): () => void {
  const previousAnimation = activeAnimations.get(element);
  if (previousAnimation) {
    previousAnimation.cancel();
    activeAnimations.delete(element);
  }

  if (options.prefersReducedMotion || options.duration <= 0 || typeof element.animate !== 'function') {
    return () => {};
  }

  const finalTop = element.getBoundingClientRect().top;
  const delta = previousTop - finalTop;
  if (Math.abs(delta) < MINIMUM_POSITION_DELTA) return () => {};

  const animation = element.animate(
    [
      { transform: `translateY(${delta}px)` },
      { transform: 'translateY(0)' },
    ],
    {
      duration: options.duration * 1000,
      easing: options.easing,
      fill: 'both',
    },
  );
  activeAnimations.set(element, animation);
  animation.onfinish = () => {
    if (activeAnimations.get(element) !== animation) return;
    activeAnimations.delete(element);
    animation.cancel();
  };

  return () => {
    if (activeAnimations.get(element) === animation) {
      activeAnimations.delete(element);
      animation.cancel();
    }
  };
}

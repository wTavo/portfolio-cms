// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { animateVerticalPosition } from '../../src/lib/modalPositionAnimation';

describe('animateVerticalPosition', () => {
  afterEach(() => vi.restoreAllMocks());

  it('animates from the previous card top to its newly measured top', () => {
    const element = document.createElement('div');
    const animation = { cancel: vi.fn() } as unknown as Animation;
    const animate = vi.fn(() => animation);
    Object.defineProperty(element, 'animate', { configurable: true, value: animate });
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 240 } as DOMRect);

    const cancel = animateVerticalPosition(element, 200, {
      duration: 0.25,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      prefersReducedMotion: false,
    });

    expect(animate).toHaveBeenCalledExactlyOnceWith(
      [{ transform: 'translateY(-40px)' }, { transform: 'translateY(0)' }],
      { duration: 250, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'both' },
    );
    cancel();
    expect(animation.cancel).toHaveBeenCalledOnce();
  });

  it('does not start an animation for a negligible position delta', () => {
    const element = document.createElement('div');
    const animate = vi.fn();
    Object.defineProperty(element, 'animate', { configurable: true, value: animate });
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 200.2 } as DOMRect);

    animateVerticalPosition(element, 200, {
      duration: 0.25,
      easing: 'linear',
      prefersReducedMotion: false,
    });

    expect(animate).not.toHaveBeenCalled();
  });

  it('releases a completed animation effect without changing the final position', () => {
    const element = document.createElement('div');
    const animation = { cancel: vi.fn(), onfinish: null } as unknown as Animation;
    Object.defineProperty(element, 'animate', { configurable: true, value: vi.fn(() => animation) });
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 240 } as DOMRect);

    const cancel = animateVerticalPosition(element, 200, {
      duration: 0.25,
      easing: 'linear',
      prefersReducedMotion: false,
    });
    animation.onfinish?.(new Event('finish') as AnimationPlaybackEvent);

    expect(animation.cancel).toHaveBeenCalledOnce();
    cancel();
    expect(animation.cancel).toHaveBeenCalledOnce();
  });

  it('respects reduced motion and browsers without the Web Animations API', () => {
    const reducedMotionElement = document.createElement('div');
    const reducedMotionAnimate = vi.fn();
    Object.defineProperty(reducedMotionElement, 'animate', { configurable: true, value: reducedMotionAnimate });
    vi.spyOn(reducedMotionElement, 'getBoundingClientRect').mockReturnValue({ top: 240 } as DOMRect);

    animateVerticalPosition(reducedMotionElement, 200, {
      duration: 0.25,
      easing: 'linear',
      prefersReducedMotion: true,
    });

    const unsupportedElement = document.createElement('div');
    vi.spyOn(unsupportedElement, 'getBoundingClientRect').mockReturnValue({ top: 240 } as DOMRect);
    expect(() => animateVerticalPosition(unsupportedElement, 200, {
      duration: 0.25,
      easing: 'linear',
      prefersReducedMotion: false,
    })).not.toThrow();
    expect(reducedMotionAnimate).not.toHaveBeenCalled();
  });

  it('cancels a previous position animation on the same element before starting another', () => {
    const element = document.createElement('div');
    const firstAnimation = { cancel: vi.fn() } as unknown as Animation;
    const secondAnimation = { cancel: vi.fn() } as unknown as Animation;
    const animate = vi.fn()
      .mockReturnValueOnce(firstAnimation)
      .mockReturnValueOnce(secondAnimation);
    Object.defineProperty(element, 'animate', { configurable: true, value: animate });
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 240 } as DOMRect);
    const options = { duration: 0.25, easing: 'linear', prefersReducedMotion: false };

    const cancelFirst = animateVerticalPosition(element, 200, options);
    const cancelSecond = animateVerticalPosition(element, 220, options);

    expect(firstAnimation.cancel).toHaveBeenCalledOnce();
    cancelFirst();
    expect(secondAnimation.cancel).not.toHaveBeenCalled();
    cancelSecond();
    expect(secondAnimation.cancel).toHaveBeenCalledOnce();
  });
});

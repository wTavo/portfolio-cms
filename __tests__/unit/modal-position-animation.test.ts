import { describe, expect, it, vi } from 'vitest';
import { animateVerticalPosition } from '../../src/lib/modalPositionAnimation';

describe('animateVerticalPosition', () => {
  it('animates the measured positional difference without changing the target layout', () => {
    const animate = vi.fn();
    const element = {
      getBoundingClientRect: () => ({ top: 310 }),
      animate,
    } as unknown as HTMLElement;

    animateVerticalPosition(element, 370, {
      duration: 250,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    });

    expect(animate).toHaveBeenCalledWith(
      [{ transform: 'translateY(60px)' }, { transform: 'translateY(0px)' }],
      { duration: 250, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
  });

  it('does not animate when the user prefers reduced motion', () => {
    const animate = vi.fn();
    const element = {
      getBoundingClientRect: () => ({ top: 310 }),
      animate,
    } as unknown as HTMLElement;

    animateVerticalPosition(element, 370, {
      duration: 250,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      prefersReducedMotion: true,
    });

    expect(animate).not.toHaveBeenCalled();
  });
});

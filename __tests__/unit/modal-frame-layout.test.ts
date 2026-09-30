import { describe, expect, it } from 'vitest';
import { getModalFrameLayout, getModalTouchAction } from '../../src/lib/modalFrameLayout';

describe('getModalTouchAction', () => {
  it('blocks one-finger browser panning while the modal fits and preserves pinch zoom', () => {
    expect(getModalTouchAction(true)).toBe('pinch-zoom');
  });

  it('allows vertical panning and pinch zoom when the modal needs scrolling', () => {
    expect(getModalTouchAction(false)).toBe('pan-y pinch-zoom');
  });
});

describe('getModalFrameLayout', () => {
  it('keeps a fitting modal centered in the current visual viewport', () => {
    expect(getModalFrameLayout(true)).toEqual({
      justifyContent: 'safe center',
      paddingTop: null,
    });
  });

  it('keeps an oversized modal scrollable from the top', () => {
    expect(getModalFrameLayout(false)).toEqual({
      justifyContent: 'flex-start',
      paddingTop: null,
    });
  });
});

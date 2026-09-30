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
  it('keeps the captured keyboard-open position instead of recentering on viewport height changes', () => {
    expect(getModalFrameLayout(true, 39)).toEqual({
      justifyContent: 'flex-start',
      paddingTop: '39px',
    });
  });

  it('centers a fitting modal before the keyboard position has been captured', () => {
    expect(getModalFrameLayout(true, null)).toEqual({
      justifyContent: 'safe center',
      paddingTop: null,
    });
  });

  it('ignores a stale keyboard anchor as soon as the keyboard is closed', () => {
    expect(getModalFrameLayout(true, 39, false)).toEqual({
      justifyContent: 'safe center',
      paddingTop: null,
    });
  });

  it('keeps an oversized modal scrollable from the top', () => {
    expect(getModalFrameLayout(false, 39)).toEqual({
      justifyContent: 'flex-start',
      paddingTop: null,
    });
  });
});

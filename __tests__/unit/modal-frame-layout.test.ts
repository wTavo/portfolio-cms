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
  it('aligns to flex-start at top when the virtual keyboard is open', () => {
    expect(getModalFrameLayout(true, true)).toEqual({
      justifyContent: 'flex-start',
    });
  });

  it('keeps alignment at flex-start without layout shift when autocomplete opens and modal needs scrolling', () => {
    expect(getModalFrameLayout(false, true)).toEqual({
      justifyContent: 'flex-start',
    });
  });

  it('centers a fitting modal when the keyboard is closed', () => {
    expect(getModalFrameLayout(true, false)).toEqual({
      justifyContent: 'safe center',
    });
  });

  it('keeps an oversized modal scrollable from the top when the keyboard is closed', () => {
    expect(getModalFrameLayout(false, false)).toEqual({
      justifyContent: 'flex-start',
    });
  });
});

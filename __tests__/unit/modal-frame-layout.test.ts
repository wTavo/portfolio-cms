import { describe, expect, it } from 'vitest';
import {
  MODAL_FRAME_JUSTIFY_CONTENT,
  MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT,
  MODAL_SCROLL_TOUCH_ACTION,
} from '../../src/lib/modalFrameLayout';

describe('modal frame layout', () => {
  it('uses safe centering as the default layout policy', () => {
    expect(MODAL_FRAME_JUSTIFY_CONTENT).toBe('safe center');
  });

  it('uses top alignment when keyboard is active to ensure a single target position', () => {
    expect(MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT).toBe('flex-start');
  });

  it('allows vertical scrolling and pinch zoom in the modal viewport', () => {
    expect(MODAL_SCROLL_TOUCH_ACTION).toBe('pan-y pinch-zoom');
  });
});

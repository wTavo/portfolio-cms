import { describe, expect, it } from 'vitest';
import { getNextViewportMetrics, syncVisualViewportBounds } from '../../src/lib/visualViewportMetrics';

describe('getNextViewportMetrics', () => {
  it('tracks the current visual viewport offset while preserving the temporary height during an input switch', () => {
    const previous = {
      height: 373,
      width: 411,
      isKeyboardOpen: true,
    };
    const current = { height: 437, width: 411 };

    expect(getNextViewportMetrics(previous, current, true, true)).toEqual({
      height: 373,
      width: 411,
      isKeyboardOpen: true,
    });
  });
});

describe('syncVisualViewportBounds', () => {
  it('writes the current visual viewport bounds directly to the fixed element immediately', () => {
    const element = { style: { top: '', left: '', width: '', height: '' } } as Pick<HTMLElement, 'style'>;

    syncVisualViewportBounds(element, { top: 161, left: 12, width: 411, height: 373 });

    expect(element.style.top).toBe('161px');
    expect(element.style.left).toBe('12px');
    expect(element.style.width).toBe('411px');
    expect(element.style.height).toBe('373px');
  });
});

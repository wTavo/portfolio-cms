import { describe, expect, it } from 'vitest';
import {
  createDiagnosticBuffer,
  createModalDiagnosticGeometry,
  createModalScrollDiagnostic,
} from '../../src/lib/modalDiagnostics';

describe('createDiagnosticBuffer', () => {
  it('retains only the newest events up to its configured capacity', () => {
    const buffer = createDiagnosticBuffer(2, 0);

    buffer.record('focus', { inputType: 'email' }, 10);
    buffer.record('viewport-resize', { height: 500 }, 20);
    buffer.record('modal-position', { top: 40 }, 30);

    expect(buffer.getEvents()).toEqual([
      { at: 20, event: 'viewport-resize', details: { height: 500 } },
      { at: 30, event: 'modal-position', details: { top: 40 } },
    ]);
  });

  it('never records details that were not explicitly included in a diagnostic event', () => {
    const buffer = createDiagnosticBuffer();
    buffer.record('focus', { inputType: 'password' });

    expect(JSON.stringify(buffer.getEvents())).not.toContain('value');
    expect(JSON.stringify(buffer.getEvents())).not.toContain('secret');
  });
});

describe('createModalDiagnosticGeometry', () => {
  it('records viewport-relative bounds and layout/animation state at subpixel precision', () => {
    expect(createModalDiagnosticGeometry({
      modalTop: 50.126,
      modalHeight: 301.234,
      frameTop: 10,
      frameHeight: 373,
      containerTop: 0,
      containerHeight: 373,
      containerScrollTop: 0,
      visualHeight: 373,
      visualTop: 6,
      paddingTop: 8,
      paddingBottom: 8,
      modalFits: true,
      keyboardAnchorTop: 50,
      transform: 'matrix(1, 0, 0, 1, 0, -32)',
      animationName: 'none',
      transitionProperty: 'transform',
      opacity: '1',
    })).toMatchObject({
      modalTop: 50.13,
      modalVisibleTop: 44.13,
      modalVisibleBottom: 345.36,
      keyboardAnchorTop: 50,
      transform: 'matrix(1, 0, 0, 1, 0, -32)',
      transitionProperty: 'transform',
    });
  });
});

describe('createModalScrollDiagnostic', () => {
  it('captures scroll ownership and modal fit state without field contents', () => {
    expect(createModalScrollDiagnostic({
      scrollTop: 12.345,
      scrollHeight: 510,
      clientHeight: 373,
      overflowY: 'auto',
      modalFits: false,
      keyboardOpen: true,
      visualHeight: 372.57,
      visualTop: 44.444,
    })).toEqual({
      scrollTop: 12.35,
      scrollHeight: 510,
      clientHeight: 373,
      overflowY: 'auto',
      modalFits: false,
      keyboardOpen: true,
      visualHeight: 372.57,
      visualTop: 44.44,
    });
  });
});

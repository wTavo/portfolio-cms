import { describe, expect, it } from 'vitest';
import {
  createDiagnosticBuffer,
  createDiagnosticEventIdGenerator,
  createModalInputDiagnostic,
  createModalDiagnosticGeometry,
  createModalScrollDiagnostic,
} from '../../src/lib/modalDiagnostics';

describe('createDiagnosticBuffer', () => {
  it('preserves input events ahead of frame samples and reports any dropped samples', () => {
    const buffer = createDiagnosticBuffer(3, 0);

    buffer.record('input-pointerdown', { inputId: 'login-modal-email' }, 10);
    buffer.record('animation-frame-sample', { modalTop: 10 }, 20);
    buffer.record('animation-frame-sample', { modalTop: 20 }, 30);
    buffer.record('input-focus', { inputId: 'login-modal-password' }, 40);

    expect(buffer.getEvents()).toEqual([
      { sequence: 1, at: 10, event: 'input-pointerdown', details: { inputId: 'login-modal-email' } },
      { sequence: 3, at: 30, event: 'animation-frame-sample', details: { modalTop: 20 } },
      { sequence: 4, at: 40, event: 'input-focus', details: { inputId: 'login-modal-password' } },
    ]);
    expect(buffer.getStats()).toEqual({
      totalEvents: 4,
      retainedEvents: 3,
      droppedEvents: 1,
      droppedFrameSamples: 1,
      droppedCriticalEvents: 0,
      complete: false,
    });
  });

  it('reports when critical events exceed capacity instead of silently implying a complete capture', () => {
    const buffer = createDiagnosticBuffer(2, 0);
    buffer.record('input-focus', { inputId: 'email' }, 10);
    buffer.record('input-blur', { inputId: 'email' }, 20);
    buffer.record('input-focus', { inputId: 'password' }, 30);

    expect(buffer.getStats()).toMatchObject({
      totalEvents: 3,
      droppedEvents: 1,
      droppedFrameSamples: 0,
      droppedCriticalEvents: 1,
      complete: false,
    });
    expect(buffer.getEvents().map((event) => event.sequence)).toEqual([2, 3]);
  });

  it('resets sequence and loss statistics when a new capture starts', () => {
    const buffer = createDiagnosticBuffer(1, 0);
    buffer.record('input-focus', {}, 10);
    buffer.record('input-blur', {}, 20);

    buffer.clear(50);
    buffer.record('modal-open', {}, 55);

    expect(buffer.getEvents()).toEqual([
      { sequence: 1, at: 5, event: 'modal-open', details: {} },
    ]);
    expect(buffer.getStats().complete).toBe(true);
  });

  it('never records details that were not explicitly included in a diagnostic event', () => {
    const buffer = createDiagnosticBuffer();
    buffer.record('focus', { inputType: 'password' });

    expect(JSON.stringify(buffer.getEvents())).not.toContain('value');
    expect(JSON.stringify(buffer.getEvents())).not.toContain('secret');
  });
});

describe('createModalInputDiagnostic', () => {
  it('identifies a field and its visible geometry without recording its value', () => {
    const details = createModalInputDiagnostic({
      tagName: 'INPUT',
      id: 'login-modal-password',
      name: 'password',
      type: 'password',
      ordinal: 2,
      rectTop: 500,
      rectBottom: 548,
      visualTop: 200,
      visualHeight: 300,
    });

    expect(details).toEqual({
      inputId: 'login-modal-password',
      inputName: 'password',
      inputType: 'password',
      inputOrdinal: 2,
      inputTop: 500,
      inputBottom: 548,
      inputVisibleTop: 300,
      inputVisibleBottom: 348,
      inputFullyVisible: false,
      visualHeight: 300,
      visualTop: 200,
    });
    expect(JSON.stringify(details)).not.toContain('value');
  });
});

describe('createDiagnosticEventIdGenerator', () => {
  it('creates ordered identifiers that correlate events from the same capture', () => {
    const nextId = createDiagnosticEventIdGenerator();

    expect(nextId('viewport')).toBe('viewport-1');
    expect(nextId('layout')).toBe('layout-2');
    expect(nextId('viewport')).toBe('viewport-3');
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

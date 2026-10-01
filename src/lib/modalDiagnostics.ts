export type ModalDiagnosticDetails = Record<string, string | number | boolean | null>;

export interface ModalDiagnosticEvent {
  sequence: number;
  at: number;
  event: string;
  details: ModalDiagnosticDetails;
}

export function createDiagnosticEventIdGenerator(): (source: string) => string {
  let sequence = 0;
  return (source) => `${source}-${++sequence}`;
}

export interface ModalDiagnosticGeometry {
  modalTop: number;
  modalHeight: number;
  frameTop: number;
  frameHeight: number;
  containerTop: number;
  containerHeight: number;
  containerScrollTop: number;
  visualHeight: number;
  visualTop: number;
  paddingTop: number;
  paddingBottom: number;
  modalFits: boolean;
  keyboardAnchorTop: number | null;
  transform: string;
  animationName: string;
  transitionProperty: string;
  opacity: string;
}

export function createModalDiagnosticGeometry(input: ModalDiagnosticGeometry): ModalDiagnosticDetails {
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    modalTop: round(input.modalTop),
    modalHeight: round(input.modalHeight),
    modalVisibleTop: round(input.modalTop - input.visualTop),
    modalVisibleBottom: round(input.modalTop - input.visualTop + input.modalHeight),
    frameTop: round(input.frameTop),
    frameHeight: round(input.frameHeight),
    containerTop: round(input.containerTop),
    containerHeight: input.containerHeight,
    containerScrollTop: round(input.containerScrollTop),
    visualHeight: round(input.visualHeight),
    visualTop: round(input.visualTop),
    paddingTop: round(input.paddingTop),
    paddingBottom: round(input.paddingBottom),
    modalFits: input.modalFits,
    keyboardAnchorTop: input.keyboardAnchorTop === null ? null : round(input.keyboardAnchorTop),
    transform: input.transform,
    animationName: input.animationName,
    transitionProperty: input.transitionProperty,
    opacity: input.opacity,
  };
}

export interface ModalScrollDiagnostic {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  overflowY: string;
  modalFits: boolean;
  keyboardOpen: boolean;
  visualHeight: number;
  visualTop: number;
}

export function createModalScrollDiagnostic(input: ModalScrollDiagnostic): ModalDiagnosticDetails {
  return {
    scrollTop: Math.round(input.scrollTop * 100) / 100,
    scrollHeight: input.scrollHeight,
    clientHeight: input.clientHeight,
    overflowY: input.overflowY,
    modalFits: input.modalFits,
    keyboardOpen: input.keyboardOpen,
    visualHeight: Math.round(input.visualHeight * 100) / 100,
    visualTop: Math.round(input.visualTop * 100) / 100,
  };
}

export interface ModalInputDiagnosticInput {
  tagName: string;
  id?: string | null;
  name?: string | null;
  type?: string | null;
  ordinal?: number | null;
  rectTop: number;
  rectBottom: number;
  visualTop: number;
  visualHeight: number;
}

export function createModalInputDiagnostic(input: ModalInputDiagnosticInput): ModalDiagnosticDetails {
  const round = (value: number) => Math.round(value * 100) / 100;
  const inputVisibleTop = round(input.rectTop - input.visualTop);
  const inputVisibleBottom = round(input.rectBottom - input.visualTop);
  const inputFullyVisible = inputVisibleTop >= 0 && inputVisibleBottom <= input.visualHeight;

  return {
    inputId: input.id ?? null,
    inputName: input.name ?? null,
    inputType: input.type ?? null,
    inputOrdinal: input.ordinal ?? null,
    inputTop: round(input.rectTop),
    inputBottom: round(input.rectBottom),
    inputVisibleTop,
    inputVisibleBottom,
    inputFullyVisible,
    visualHeight: round(input.visualHeight),
    visualTop: round(input.visualTop),
  };
}

export interface DiagnosticBufferStats {
  totalEvents: number;
  retainedEvents: number;
  droppedEvents: number;
  droppedFrameSamples: number;
  droppedCriticalEvents: number;
  complete: boolean;
}

export function createDiagnosticBuffer(capacity = 500, initialStartedAt = performance.now()) {
  const events: ModalDiagnosticEvent[] = [];
  const safeCapacity = Math.max(1, Math.floor(capacity));
  let startedAt = initialStartedAt;
  let nextSequence = 1;
  let totalEvents = 0;
  let droppedFrameSamples = 0;
  let droppedCriticalEvents = 0;

  return {
    record(event: string, details: ModalDiagnosticDetails = {}, now = performance.now()) {
      totalEvents += 1;
      const newEvent: ModalDiagnosticEvent = {
        sequence: nextSequence++,
        at: Math.round((now - startedAt) * 100) / 100,
        event,
        details: { ...details },
      };

      if (events.length < safeCapacity) {
        events.push(newEvent);
        return;
      }

      // If at capacity, try to drop the oldest frame sample first before critical events
      const frameSampleIndex = events.findIndex((e) => e.event === 'animation-frame-sample');
      if (frameSampleIndex !== -1 && event !== 'animation-frame-sample') {
        events.splice(frameSampleIndex, 1);
        events.push(newEvent);
        droppedFrameSamples += 1;
      } else if (frameSampleIndex !== -1 && event === 'animation-frame-sample') {
        events.splice(frameSampleIndex, 1);
        events.push(newEvent);
        droppedFrameSamples += 1;
      } else {
        const dropped = events.shift();
        if (dropped?.event === 'animation-frame-sample') {
          droppedFrameSamples += 1;
        } else {
          droppedCriticalEvents += 1;
        }
        events.push(newEvent);
      }
    },
    getEvents() {
      return events.map((entry) => ({ ...entry, details: { ...entry.details } }));
    },
    getStats(): DiagnosticBufferStats {
      const droppedEvents = totalEvents - events.length;
      return {
        totalEvents,
        retainedEvents: events.length,
        droppedEvents,
        droppedFrameSamples,
        droppedCriticalEvents,
        complete: droppedEvents === 0,
      };
    },
    clear(newStartedAt = performance.now()) {
      events.length = 0;
      startedAt = newStartedAt;
      nextSequence = 1;
      totalEvents = 0;
      droppedFrameSamples = 0;
      droppedCriticalEvents = 0;
    },
  };
}

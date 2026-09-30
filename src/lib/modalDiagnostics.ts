export type ModalDiagnosticDetails = Record<string, string | number | boolean | null>;

export interface ModalDiagnosticEvent {
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



export function createDiagnosticBuffer(capacity = 500, startedAt = performance.now()) {
  const events: ModalDiagnosticEvent[] = [];
  const safeCapacity = Math.max(1, Math.floor(capacity));

  return {
    record(event: string, details: ModalDiagnosticDetails = {}, now = performance.now()) {
      events.push({
        at: Math.round((now - startedAt) * 100) / 100,
        event,
        details: { ...details },
      });
      if (events.length > safeCapacity) events.shift();
    },
    getEvents() {
      return events.map((entry) => ({ ...entry, details: { ...entry.details } }));
    },
    clear() {
      events.length = 0;
    },
  };
}

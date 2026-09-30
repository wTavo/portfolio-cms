export interface ModalFrameLayout {
  justifyContent: 'safe center' | 'flex-start';
  paddingTop: string | null;
}

export function getModalTouchAction(modalFits: boolean): 'pinch-zoom' | 'pan-y pinch-zoom' {
  return modalFits ? 'pinch-zoom' : 'pan-y pinch-zoom';
}

export function getModalFrameLayout(modalFits: boolean): ModalFrameLayout {
  if (!modalFits) return { justifyContent: 'flex-start', paddingTop: null };
  return { justifyContent: 'safe center', paddingTop: null };
}

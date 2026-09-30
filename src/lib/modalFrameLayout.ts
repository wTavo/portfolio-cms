export interface ModalFrameLayout {
  justifyContent: 'safe center' | 'flex-start';
  paddingTop: string | null;
}

export function getModalTouchAction(modalFits: boolean): 'pinch-zoom' | 'pan-y pinch-zoom' {
  return modalFits ? 'pinch-zoom' : 'pan-y pinch-zoom';
}

export function getModalFrameLayout(
  modalFits: boolean,
  keyboardAnchorTop: number | null,
  keyboardOpen = true,
): ModalFrameLayout {
  if (!modalFits) return { justifyContent: 'flex-start', paddingTop: null };
  if (keyboardOpen && keyboardAnchorTop !== null) {
    return { justifyContent: 'flex-start', paddingTop: `${keyboardAnchorTop}px` };
  }
  return { justifyContent: 'safe center', paddingTop: null };
}

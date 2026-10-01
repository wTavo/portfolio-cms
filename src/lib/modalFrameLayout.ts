/**
 * @file modalFrameLayout.ts
 * @description Cálculo y configuración del diseño de alineación y gestos táctiles del modal (Directivas 3, 7, 12, 32).
 */

export interface ModalFrameLayout {
  justifyContent: 'safe center' | 'flex-start';
  paddingTop: string | null;
}

/**
 * Determina el touch-action óptimo para el contenedor según si la tarjeta cabe en la pantalla o requiere scroll.
 *
 * @param modalFits - Indica si la tarjeta modal cabe en la altura disponible.
 * @returns Cadena de touch-action para CSS.
 */
export function getModalTouchAction(modalFits: boolean): 'pinch-zoom' | 'pan-y pinch-zoom' {
  return modalFits ? 'pinch-zoom' : 'pan-y pinch-zoom';
}

/**
 * Calcula la alineación vertical del modal.
 * Con teclado abierto o cuando el contenido excede el espacio visible, alinea al inicio ('flex-start')
 * para aprovechar el espacio superior y permitir scroll fluido sin recentrados bruscos ni colisiones con el autocomplete.
 *
 * @param modalFits - Si la tarjeta cabe en la altura visible disponible.
 * @param keyboardOpen - Si el teclado virtual se encuentra activo.
 * @returns Configuración de alineación del marco del modal.
 */
export function getModalFrameLayout(
  modalFits: boolean,
  keyboardOpen = false,
): ModalFrameLayout {
  if (keyboardOpen || !modalFits) {
    return { justifyContent: 'flex-start', paddingTop: null };
  }
  return { justifyContent: 'safe center', paddingTop: null };
}


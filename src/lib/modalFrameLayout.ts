/**
 * @file modalFrameLayout.ts
 * @description Constantes para la disposición del marco del modal adaptable.
 */

/** Alineación predeterminada con centrado seguro que pasa a inicio si el contenido desborda. */
export const MODAL_FRAME_JUSTIFY_CONTENT = 'safe center' as const;

/** Alineación fija al inicio superior cuando el teclado está activo para garantizar una única posición de destino. */
export const MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT = 'flex-start' as const;

/** Permite desplazamiento vertical y zoom táctil dentro de la superficie del modal. */
export const MODAL_SCROLL_TOUCH_ACTION = 'pan-y pinch-zoom' as const;

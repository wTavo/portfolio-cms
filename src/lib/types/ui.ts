/**
 * @file ui.ts
 * @description Tipos e interfaces estándar para el modelado de estados de interfaz (Directivas 15 y 17).
 */

/**
 * Modelo estándar de estado de UI basado en unión discriminada.
 * Elimina múltiples booleanos dispersos y garantiza transiciones predecibles de estado.
 */
export type UiState<T = void> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; message?: string }
  | { status: 'empty' }
  | { status: 'error'; message: string };

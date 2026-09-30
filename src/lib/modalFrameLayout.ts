/** Stable frame alignment that safely falls back to the start when content overflows. */
export const MODAL_FRAME_JUSTIFY_CONTENT = 'safe center' as const;

/** Keep vertical gestures and pinch zoom inside the modal's own scroll surface. */
export const MODAL_SCROLL_TOUCH_ACTION = 'pan-y pinch-zoom' as const;

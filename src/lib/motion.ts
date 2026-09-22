/**
 * @file motion.ts
 * @description Presets y variantes de animación centralizados para interfaces fluidas (Directiva 3).
 */

/** Duraciones estándar en segundos para librerías de animación (Motion / Framer) */
export const MOTION_DURATIONS = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  deliberate: 0.6,
} as const;

/** Curvas de aceleración estándar basadas en física (AppOPT standards) */
export const MOTION_EASINGS = {
  standard: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
};

/** Variantes para contenedores con animación escalonada */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Variantes para desvanecimiento y desplazamiento vertical suave */
export const fadeSlideUpVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.slow,
      ease: MOTION_EASINGS.decelerate,
    },
  },
};

/** Variantes para desvanecimiento simple */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.standard,
    },
  },
};

/** Variantes para microinteracciones de tarjetas en hover */
export const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.standard,
    },
  },
  hover: {
    scale: 1.015,
    y: -4,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.decelerate,
    },
  },
};

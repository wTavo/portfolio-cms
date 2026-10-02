/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cierre de Circuito Vectorial y Encendido de Foco con Parpadeo Eléctrico".
 * Las siluetas se trazan iluminadas simulando cables/filamentos. Al conectarse y cerrar el circuito,
 * la corriente eléctrica fluye y el color interior se enciende con un parpadeo de foco antes de quedar fijo.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { GLYPH_PATHS } from '../../lib/typography/glyphPaths';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface LetterLayout {
  char: string;
  x: number;
  d: string;
  subpaths: string[];
  advanceWidth: number;
  globalIndex: number;
  wordIndex: number;
  charIndex: number;
}

/** Variable en tiempo de ejecución para recordar que la animación introductoria ya se ejecutó y no repetirla al scrollear */
let hasCompletedKineticIntro = false;

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light') return false;
      if (current === 'dark') return true;
    }
    return true;
  });
  const alreadyPlayed = hasCompletedKineticIntro;

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  useEffect(() => {
    const updateTheme = () => {
      const dataTheme = document.documentElement.getAttribute('data-theme');
      if (dataTheme) {
        setIsDarkTheme(dataTheme === 'dark');
      } else {
        setIsDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const mediaListener = () => updateTheme();
    mediaQuery.addEventListener('change', mediaListener);

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionMediaQuery.addEventListener('change', motionListener);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', mediaListener);
      motionMediaQuery.removeEventListener('change', motionListener);
    };
  }, []);

  // Calcular la disposición geométrica precisa de cada palabra y letra con índice global secuencial
  const { wordsLayout } = useMemo(() => {
    let globalCounter = 0;
    const layouts = words.map((word, wordIndex) => {
      // Espaciado entre letras equilibrado
      const letterSpacing = wordIndex === 0 ? 34 : 56;
      let currentX = 0;
      const letters: LetterLayout[] = [];

      for (let charIndex = 0; charIndex < word.length; charIndex++) {
        const char = word[charIndex];
        const glyph = GLYPH_PATHS[char] || { d: '', subpaths: [], advanceWidth: 400 };

        letters.push({
          char,
          x: currentX,
          d: glyph.d,
          subpaths: glyph.subpaths && glyph.subpaths.length > 0 ? glyph.subpaths : (glyph.d ? [glyph.d] : []),
          advanceWidth: glyph.advanceWidth,
          globalIndex: globalCounter++,
          wordIndex,
          charIndex,
        });

        currentX += glyph.advanceWidth + letterSpacing;
      }

      return {
        word,
        letters,
        totalWidth: Math.max(currentX - letterSpacing, 100),
      };
    });

    return { wordsLayout: layouts };
  }, [words]);

  // Constantes de coreografía simultánea:
  // 1. Fase de Dibujo: TODAS las letras se trazan simultáneamente como cables/filamentos iluminados
  const initialDelay = 0.25;
  const strokeDuration = 2.4; // Ritmo constante y visible de inicio a fin
  const totalStrokeEndTime = initialDelay + strokeDuration; // 2.65s (Momento en que los cables completan la silueta)

  // 2. Iluminación Progresiva: Al conectarse las líneas, el interior y resplandor se van iluminando suavemente poco a poco
  const fillStartDelay = totalStrokeEndTime; // Inicia justo al completarse el trazado de las líneas
  const fillDuration = 1.6; // Duración gradual y continua de la iluminación suave de 0% a 100%

  const [isIntroComplete, setIsIntroComplete] = useState(alreadyPlayed);
  const [isFloatingActive, setIsFloatingActive] = useState(alreadyPlayed);

  useEffect(() => {
    if (alreadyPlayed) {
      setIsIntroComplete(true);
      setIsFloatingActive(true);
      return;
    }

    // El movimiento y la finalización de la intro ocurren ESTRICTAMENTE después de que las letras se iluminaron por completo
    const totalTimeMs = (fillStartDelay + fillDuration) * 1000;
    const timer = setTimeout(() => {
      hasCompletedKineticIntro = true;
      setIsIntroComplete(true);
      // Breve pausa con el texto completamente iluminado antes de iniciar la sutil flotación orgánica
      setTimeout(() => {
        setIsFloatingActive(true);
      }, 300);
    }, totalTimeMs);

    return () => {
      clearTimeout(timer);
    };
  }, [alreadyPlayed, fillStartDelay, fillDuration]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-1.5 sm:gap-y-3 md:gap-y-6 [@media(max-height:540px)]:gap-y-1 text-center select-none ${className}`}>
        {words.map((word, idx) => (
          <span
            key={`reduced-word-${idx}`}
            className={`font-black tracking-wider text-[var(--color-text-primary)] uppercase leading-none ${
              idx === 0
                ? 'text-4xl sm:text-6xl md:text-8xl lg:text-9xl [@media(max-height:540px)]:text-2xl'
                : 'text-xl sm:text-3xl md:text-5xl lg:text-6xl tracking-[0.25em] [@media(max-height:540px)]:text-base'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  // Configuración de paleta visual adaptativa (Modo Oscuro / Modo Claro)
  const colors = isDarkTheme
    ? {
        primary: '#fafafa',
        stroke: '#ffffff',
        glowColor: 'rgba(186, 230, 253, 0.85)',
        glowStroke: 'rgba(186, 230, 253, 0.65)',
      }
    : {
        primary: '#09090b',
        stroke: '#18181b',
        glowColor: 'rgba(37, 99, 235, 0.65)',
        glowStroke: 'rgba(59, 130, 246, 0.55)',
      };

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center select-none overflow-visible ${className}`}
    >
      {/* Contenedor central: la flotación orgánica solo inicia ESTRICTAMENTE después de que las letras están iluminadas (Directivas 3 y 13) */}
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-5xl px-3 sm:px-6 gap-y-1 sm:gap-y-2 md:gap-y-4 [@media(max-height:540px)]:gap-y-1 z-10 overflow-visible transform-gpu ${
          isFloatingActive ? 'animate-float-subtle' : ''
        }`}
      >
        {wordsLayout.map((wordLayout, wordIdx) => {
          const isFirstLine = wordIdx === 0;
          const containerClasses = isFirstLine
            ? 'w-full max-w-5xl max-h-[min(15dvh,160px)] [@media(max-height:540px)]:max-h-[46px] h-auto object-contain'
            : 'w-[90%] max-w-4xl max-h-[min(13dvh,140px)] [@media(max-height:540px)]:max-h-[38px] h-auto object-contain';

          return (
            <svg
              key={`word-svg-${wordLayout.word}-${wordIdx}`}
              viewBox={`0 75 ${wordLayout.totalWidth} 750`}
              preserveAspectRatio="xMidYMid meet"
              className={`overflow-visible select-none ${containerClasses}`}
              aria-label={wordLayout.word}
            >
              {/* Filtro SVG compilado por hardware en GPU una sola vez en <defs> */}
              <defs>
                <filter id={`bulb-glow-${wordIdx}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {wordLayout.letters.map((letter) => {
                // Tiempos coordinados de trazado y posterior iluminación suave
                const strokeDelay = alreadyPlayed ? 0 : initialDelay;
                const fillDelay = alreadyPlayed ? 0 : fillStartDelay;
                const activeStrokeDuration = alreadyPlayed ? 0 : strokeDuration;
                const activeFillDuration = alreadyPlayed ? 0 : fillDuration;

                return (
                  <g
                    key={`letter-group-${wordIdx}-${letter.charIndex}-${letter.char}`}
                    transform={`translate(${letter.x}, 0)`}
                    className="overflow-visible"
                  >
                    {/* 1. RESPLANDOR (Se ilumina suavemente poco a poco) */}
                    <motion.path
                      d={letter.d}
                      fillRule="nonzero"
                      fill={colors.glowColor}
                      initial={alreadyPlayed ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: activeFillDuration,
                        delay: fillDelay,
                        ease: [0.2, 0, 0, 1],
                      }}
                      filter={`url(#bulb-glow-${wordIdx})`}
                      className="pointer-events-none"
                    />

                    {/* 2. SILUETA DEL MOLDE (Trazado de cables y filamentos iluminados con técnica Multi-Stroke a 120 FPS sin filtros lentos) */}
                    {letter.subpaths.map((subD, subIdx) => (
                      <g key={`mold-strokes-${subIdx}`}>
                        {/* Resplandor exterior difuso */}
                        <motion.path
                          d={subD}
                          initial={alreadyPlayed ? false : { pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.45 }}
                          transition={{
                            pathLength: { duration: activeStrokeDuration, delay: strokeDelay, ease: 'linear' },
                            opacity: { duration: alreadyPlayed ? 0 : 0.05, delay: strokeDelay },
                          }}
                          stroke={colors.glowStroke}
                          strokeWidth={7}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="transparent"
                        />
                        {/* Resplandor medio */}
                        <motion.path
                          d={subD}
                          initial={alreadyPlayed ? false : { pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.75 }}
                          transition={{
                            pathLength: { duration: activeStrokeDuration, delay: strokeDelay, ease: 'linear' },
                            opacity: { duration: alreadyPlayed ? 0 : 0.05, delay: strokeDelay },
                          }}
                          stroke={colors.glowStroke}
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="transparent"
                        />
                        {/* Núcleo del filamento nítido */}
                        <motion.path
                          d={subD}
                          initial={alreadyPlayed ? false : { pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            pathLength: { duration: activeStrokeDuration, delay: strokeDelay, ease: 'linear' },
                            opacity: { duration: alreadyPlayed ? 0 : 0.05, delay: strokeDelay },
                          }}
                          stroke={colors.stroke}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="transparent"
                        />
                      </g>
                    ))}

                    {/* 3. RELLENO SÓLIDO (Se ilumina suavemente poco a poco hasta el 100% de brillo) */}
                    <motion.path
                      d={letter.d}
                      fillRule="nonzero"
                      initial={alreadyPlayed ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: activeFillDuration,
                        delay: fillDelay,
                        ease: [0.2, 0, 0, 1],
                      }}
                      fill={colors.primary}
                      stroke={colors.primary}
                      strokeWidth={1}
                    />
                  </g>
                );
              })}
            </svg>
          );
        })}
      </div>
    </div>
  );
}

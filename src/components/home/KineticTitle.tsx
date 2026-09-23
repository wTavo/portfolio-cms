/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cierre de Circuito Vectorial y Encendido de Foco con Parpadeo Eléctrico".
 * Las siluetas se trazan iluminadas simulando cables/filamentos. Al conectarse y cerrar el circuito,
 * la corriente eléctrica fluye y el color interior se enciende con un parpadeo de foco antes de quedar fijo.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

interface WordLayout {
  word: string;
  letters: LetterLayout[];
  totalWidth: number;
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Calcular la disposición geométrica precisa de cada palabra y letra con índice global secuencial
  const { wordsLayout, totalLetterCount } = useMemo(() => {
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

    return { wordsLayout: layouts, totalLetterCount: globalCounter };
  }, [words]);

  // Reiniciar animación al hacer clic en el título
  const handleReplay = useCallback(() => {
    setIsCompleted(false);
    setAnimationKey((prev) => prev + 1);
  }, []);

  // Constantes de coreografía simultánea:
  // 1. Fase de Dibujo: TODAS las letras se trazan simultáneamente como cables/filamentos iluminados
  const initialDelay = 0.25;
  const strokeDuration = 2.4; // Ritmo lento, constante y visible de inicio a fin
  const totalStrokeEndTime = initialDelay + strokeDuration; // 2.65s (Momento exacto en que los cables se conectan y cierran el circuito)

  // 2. Encendido del foco: parpadeo rápido inicial de corriente seguido de una subida lenta de menor a mayor brillo
  const fillStartDelay = totalStrokeEndTime + 0.10; // La corriente llega de inmediato al completarse la conexión del circuito
  const fillIgnitionDuration = 1.65; // Duración equilibrada: parpadeo inicial rápido + subida gradual y visible de menor a mayor brillo

  // 3. Elevación y flotación sutil tras completarse el encendido total
  const elevationDelay = fillStartDelay + fillIgnitionDuration + 0.15; // 4.55s

  useEffect(() => {
    setIsCompleted(false);
    const timer = setTimeout(() => {
      setIsCompleted(true);
    }, elevationDelay * 1000);
    return () => clearTimeout(timer);
  }, [animationKey, elevationDelay]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-3 sm:gap-y-4 md:gap-y-6 text-center select-none ${className}`}>
        {words.map((word, idx) => (
          <span
            key={`reduced-word-${idx}`}
            className={`font-black tracking-wider text-white uppercase leading-none ${
              idx === 0
                ? 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem]'
                : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.25em]'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      key={`kinetic-anim-${animationKey}`}
      onClick={handleReplay}
      className={`relative w-full flex flex-col items-center justify-center min-h-[440px] sm:min-h-[500px] md:min-h-[580px] py-12 sm:py-16 select-none overflow-visible cursor-pointer ${className}`}
      title="Clic para reproducir animación"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleReplay();
        }
      }}
    >
      {/* Resplandor ambiental de estudio ultra suave */}
      <div
        className="absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none opacity-20"
        aria-hidden="true"
      />

      {/* Contenedor con elevación cinemática tras completar toda la animación */}
      <motion.div
        animate={{ y: isCompleted ? -14 : 0 }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative flex flex-col items-center justify-center w-full max-w-5xl px-3 sm:px-6 gap-y-2 sm:gap-y-4 md:gap-y-6 z-10 overflow-visible"
      >
        {/* Movimiento sutil de flotación continua tras elevarse */}
        <motion.div
          animate={
            isCompleted
              ? {
                  y: [-3, 3],
                }
              : { y: 0 }
          }
          transition={
            isCompleted
              ? {
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: 1.4,
                }
              : { duration: 0 }
          }
          className="w-full flex flex-col items-center justify-center gap-y-2 sm:gap-y-4 md:gap-y-6 overflow-visible"
        >
          {wordsLayout.map((wordLayout, wordIdx) => {
          const isFirstLine = wordIdx === 0;
          const containerClasses = isFirstLine
            ? 'w-full max-w-5xl h-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
            : 'w-[90%] max-w-4xl h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]';

          return (
            <svg
              key={`word-svg-${wordLayout.word}-${wordIdx}`}
              viewBox={`0 75 ${wordLayout.totalWidth} 750`}
              className={`overflow-visible select-none ${containerClasses}`}
              aria-label={wordLayout.word}
            >
              {wordLayout.letters.map((letter) => {
                // Todas las letras inician y terminan el trazado exactamente al mismo tiempo
                const strokeDelay = initialDelay;
                const fillDelay = fillStartDelay;

                return (
                  <g
                    key={`letter-group-${wordIdx}-${letter.charIndex}-${letter.char}`}
                    transform={`translate(${letter.x}, 0)`}
                    className="overflow-visible"
                  >
                    {/* 1. SILUETA DEL MOLDE (SIEMPRE ILUMINADA: CON RESPLANDOR DESDE EL INICIO DEL TRAZADO) */}
                    {letter.subpaths.map((subD, subIdx) => (
                      <motion.path
                        key={`mold-stroke-${subIdx}`}
                        d={subD}
                        initial={{
                          pathLength: 0,
                          opacity: 0,
                          stroke: '#ffffff',
                          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 20px rgba(186, 230, 253, 0.55))',
                        }}
                        animate={{
                          pathLength: 1,
                          opacity: 1,
                          stroke: '#ffffff',
                          filter: [
                            'drop-shadow(0 0 8px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 20px rgba(186, 230, 253, 0.55))',
                            'drop-shadow(0 0 8px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 20px rgba(186, 230, 253, 0.55))',
                            'drop-shadow(0 0 18px rgba(255, 255, 255, 1)) drop-shadow(0 0 35px rgba(186, 230, 253, 0.9))',
                            'drop-shadow(0 0 12px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 24px rgba(186, 230, 253, 0.55))',
                          ],
                        }}
                        transition={{
                          pathLength: {
                            duration: strokeDuration,
                            delay: strokeDelay,
                            ease: 'linear',
                          },
                          opacity: {
                            duration: 0.05,
                            delay: strokeDelay,
                          },
                          filter: {
                            duration: strokeDuration + 0.35,
                            delay: strokeDelay,
                            times: [0, 0.94, 0.98, 1],
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="transparent"
                      />
                    ))}

                    {/* 2. ENCENDIDO DEL FOCO: PARPADEO RÁPIDO DE CORRIENTE Y SUBIDA LENTA DE MENOR A MAYOR BRILLO */}
                    <motion.path
                      d={letter.d}
                      fillRule="nonzero"
                      initial={{
                        opacity: 0,
                        filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                      }}
                      animate={{
                        opacity: [0, 0.85, 0.08, 0.90, 0.16, 0.35, 0.58, 0.82, 1],
                        filter: [
                          'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                          'drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(186, 230, 253, 0.7))',
                          'drop-shadow(0 0 2px rgba(255, 255, 255, 0.1))',
                          'drop-shadow(0 0 24px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 45px rgba(186, 230, 253, 0.8))',
                          'drop-shadow(0 0 3px rgba(255, 255, 255, 0.2)) drop-shadow(0 0 8px rgba(186, 230, 253, 0.1))',
                          'drop-shadow(0 0 7px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 16px rgba(186, 230, 253, 0.2))',
                          'drop-shadow(0 0 11px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 24px rgba(186, 230, 253, 0.3))',
                          'drop-shadow(0 0 14px rgba(255, 255, 255, 0.72)) drop-shadow(0 0 30px rgba(186, 230, 253, 0.35))',
                          'drop-shadow(0 0 16px rgba(255, 255, 255, 0.75)) drop-shadow(0 0 35px rgba(186, 230, 253, 0.35))',
                        ],
                      }}
                      transition={{
                        duration: fillIgnitionDuration,
                        delay: fillDelay,
                        times: [0, 0.05, 0.09, 0.15, 0.22, 0.39, 0.58, 0.79, 1],
                        ease: 'easeInOut',
                      }}
                      fill="#ffffff"
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  </g>
                );
              })}
            </svg>
          );
        })}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Dibujo Secuencial Trazo por Trazo de Moldes y Posterior Relleno Blanco".
 * Todas las letras del título completan primero su dibujo de contorno vectorial trazo por trazo,
 * estableciendo la totalidad de los moldes antes de dar paso al llenado progresivo con color blanco incandescente.
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
    setAnimationKey((prev) => prev + 1);
  }, []);

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

  // Constantes de coreografía simultánea:
  // 1. Fase de Dibujo: TODAS las letras se trazan simultáneamente con trazo nítido y visible (no tan apagado) pero sin destellos
  const initialDelay = 0.25;
  const strokeDuration = 2.4; // Ritmo lento, constante y visible de inicio a fin
  const totalStrokeEndTime = initialDelay + strokeDuration; // 2.65s

  // 2. Tiempo de contemplación de siluetas encendidas y posterior llenado gradual (NO instantáneo)
  const fillStartDelay = totalStrokeEndTime + 0.85; // Pausa apreciable con las siluetas encendidas brillando solas
  const fillDuration = 1.6; // Llenado lento, suave y no instantáneo del color blanco

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

      <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-3 sm:px-6 gap-y-2 sm:gap-y-4 md:gap-y-6 z-10 overflow-visible">
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
                    {/* 1. SILUETA DEL MOLDE (NÍTIDA Y VISIBLE DURANTE EL DIBUJO, SE ENCIENDE AL COMPLETARSE) */}
                    {letter.subpaths.map((subD, subIdx) => (
                      <motion.path
                        key={`mold-stroke-${subIdx}`}
                        d={subD}
                        initial={{
                          pathLength: 0,
                          opacity: 0,
                          stroke: 'rgba(255, 255, 255, 0.52)', // Visible y nítido pero no deslumbrante
                          filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                        }}
                        animate={{
                          pathLength: 1,
                          opacity: 1,
                          stroke: [
                            'rgba(255, 255, 255, 0.52)', // visible y claro durante el dibujo
                            'rgba(255, 255, 255, 0.52)', // permanece nítido hasta terminar el trazado
                            '#ffffff',                   // ¡SE ENCIENDE EN EL MOMENTO DE CERRARSE!
                            'rgba(255, 255, 255, 0.95)', // permanece encendido
                          ],
                          filter: [
                            'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                            'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                            'drop-shadow(0 0 16px rgba(255, 255, 255, 1)) drop-shadow(0 0 32px rgba(186, 230, 253, 0.85))',
                            'drop-shadow(0 0 10px rgba(255, 255, 255, 0.75)) drop-shadow(0 0 22px rgba(186, 230, 253, 0.45))',
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
                          stroke: {
                            duration: strokeDuration + 0.35,
                            delay: strokeDelay,
                            times: [0, 0.94, 0.98, 1],
                            ease: [0.16, 1, 0.3, 1],
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

                    {/* 2. RELLENO DE COLOR POSTERIOR (NO INSTANTÁNEO: PAUSA DE APRECIACIÓN + LLENADO GRADUAL) */}
                    <motion.path
                      d={letter.d}
                      fillRule="nonzero"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: fillDuration,
                        delay: fillDelay,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      fill="#ffffff"
                      stroke="#ffffff"
                      strokeWidth={1}
                      style={{
                        filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.75)) drop-shadow(0 0 35px rgba(186, 230, 253, 0.35))',
                      }}
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

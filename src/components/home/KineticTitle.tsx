/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Dibujo de Contorno de Moldes Vectoriales y Relleno de Color Progresivo".
 * Los moldes de las letras se trazan primero de forma vectorial mediante dibujo de contorno luminoso
 * y posteriormente se van rellenando con color blanco incandescente y resplandor celestial.
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

  // Calcular la disposición geométrica de cada palabra y letra
  const wordsLayout = useMemo<WordLayout[]>(() => {
    let globalCounter = 0;
    return words.map((word, wordIndex) => {
      // Espaciado entre letras optimizado para cada línea
      const letterSpacing = wordIndex === 0 ? 32 : 55;
      let currentX = 0;
      const letters: LetterLayout[] = [];

      for (let charIndex = 0; charIndex < word.length; charIndex++) {
        const char = word[charIndex];
        const glyph = GLYPH_PATHS[char] || { d: '', advanceWidth: 400 };

        letters.push({
          char,
          x: currentX,
          d: glyph.d,
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
  }, [words]);

  // Permite reiniciar la animación al hacer clic en el título
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

          // Base temporal para secuenciar el dibujo y posterior llenado
          const baseDelay = isFirstLine ? 0.15 : 0.75;
          const strokeStagger = 0.08;
          const strokeDuration = 0.85;

          return (
            <svg
              key={`word-svg-${wordLayout.word}-${wordIdx}`}
              viewBox={`0 75 ${wordLayout.totalWidth} 750`}
              className={`overflow-visible select-none ${containerClasses}`}
              aria-label={wordLayout.word}
            >
              {wordLayout.letters.map((letter) => {
                const charDelay = baseDelay + letter.charIndex * strokeStagger;
                // El llenado se inicia progresivamente cuando el contorno del molde está trazado
                const fillDelay = charDelay + strokeDuration * 0.7;

                return (
                  <g
                    key={`letter-group-${wordIdx}-${letter.charIndex}-${letter.char}`}
                    transform={`translate(${letter.x}, 0)`}
                    className="overflow-visible"
                  >
                    {/* 1. SILUETA BASE DEL MOLDE (BAJORRELIEVE QUE SE DIBUJA PRIMERO) */}
                    <motion.path
                      d={letter.d}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: {
                          duration: strokeDuration,
                          delay: charDelay,
                          ease: [0.16, 1, 0.3, 1],
                        },
                        opacity: {
                          duration: 0.15,
                          delay: charDelay,
                        },
                      }}
                      stroke="rgba(255, 255, 255, 0.32)"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                    />

                    {/* 2. TRAZO LUMINOSO INCANDESCENTE (EFECTO LÁSER DE DIBUJADO DE CONTORNO) */}
                    <motion.path
                      d={letter.d}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: [0, 1],
                        opacity: [0, 1, 0.8, 0],
                      }}
                      transition={{
                        pathLength: {
                          duration: strokeDuration,
                          delay: charDelay,
                          ease: [0.16, 1, 0.3, 1],
                        },
                        opacity: {
                          duration: strokeDuration + 0.35,
                          delay: charDelay,
                          times: [0, 0.15, 0.8, 1],
                        },
                      }}
                      stroke="#ffffff"
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 22px rgba(186, 230, 253, 0.6))',
                      }}
                    />

                    {/* 3. RELLENO DE COLOR POSTERIOR (COLOR BLANCO INCANDESCENTE Y RESPLANDOR CELESTIAL) */}
                    <motion.path
                      d={letter.d}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.65,
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

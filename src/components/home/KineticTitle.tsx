/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: moldes en forma de escalera en el centro con letras que se van acoplando una a una en sus moldes hasta nivelarse horizontalmente y activar el ciclo continuo de iluminación.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Título interactivo en 2 líneas.
 * - Centro: Moldes en bajo relieve en forma de escalera ascendente.
 * - Cinemática: Las letras se van acoplando una a una en sus moldes correspondientes.
 * - Cierre: Toda la escalera se nivela horizontalmente y activa el ciclo continuo de iluminación.
 */
export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [placedCount, setPlacedCount] = useState(0);
  const [isStaircase, setIsStaircase] = useState(true);
  const [isHorizontalAligned, setIsHorizontalAligned] = useState(false);
  const [isFinalGlow, setIsFinalGlow] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  const allLetters = useMemo(() => {
    let globalIndex = 0;
    return words.flatMap((word, wordIdx) =>
      word.split('').map((char, charIdx) => ({
        char,
        globalIndex: globalIndex++,
        wordIdx,
        charIdx,
      }))
    );
  }, [words, uppercaseText]);

  const totalLetters = allLetters.length;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Secuencia de Animación: Moldes en Escalera -> Acople Secuencial -> Nivelación Horizontal -> Ciclo de Brillo
  useEffect(() => {
    if (prefersReducedMotion) {
      setPlacedCount(totalLetters);
      setIsStaircase(false);
      setIsHorizontalAligned(true);
      return;
    }

    let current = 0;
    let glowInterval: ReturnType<typeof setInterval>;

    // 1. Pausa inicial para apreciar los moldes en bajo relieve en escalera
    const initialTimer = setTimeout(() => {
      // 2. Acople secuencial de cada letra en su molde
      const placeInterval = setInterval(() => {
        current++;
        setPlacedCount(current);

        if (current >= totalLetters) {
          clearInterval(placeInterval);

          // 3. Pausa para contemplar la escalera armada completa
          setTimeout(() => {
            // 4. Deslizamiento y nivelación hacia el eje horizontal definitivo
            setIsStaircase(false);

            // 5. Consolidación horizontal definitiva en 2 líneas
            setTimeout(() => {
              setIsHorizontalAligned(true);
              setIsFinalGlow(true);

              // 6. Ciclo continuo entre Imagen 1 (Iluminada) e Imagen 2 (Atenuada)
              setTimeout(() => {
                setIsFinalGlow(false);
                glowInterval = setInterval(() => {
                  setIsFinalGlow((prev) => !prev);
                }, 1800);
              }, 1100);
            }, 900);
          }, 600);
        }
      }, 95);

      return () => clearInterval(placeInterval);
    }, 450);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(glowInterval);
    };
  }, [totalLetters, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-3 sm:gap-y-5 text-center select-none ${className}`}>
        {words.map((word, wIdx) => (
          <span
            key={`word-reduced-${wIdx}`}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase"
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[500px] sm:min-h-[580px] py-12 sm:py-16 overflow-visible">
      {/* Resplandor ambiental que alterna suavemente */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Título Central en 2 Líneas con Moldes en Escalera */}
      <h1
        className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider leading-[1.0] flex flex-col items-center justify-center gap-y-3 sm:gap-y-5 md:gap-y-6 lg:gap-y-7 select-none relative z-10 ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;

          return (
            <div
              key={`word-row-${wordIdx}`}
              className="inline-flex items-center justify-center gap-x-2 sm:gap-x-3.5 md:gap-x-5 relative"
            >
              {word.split('').map((char, charIdx) => {
                let globalIdx = 0;
                for (let w = 0; w < wordIdx; w++) {
                  globalIdx += words[w].length;
                }
                globalIdx += charIdx;

                const isPlaced = globalIdx < placedCount;
                const isCurrentlyEntering = globalIdx === placedCount - 1 && isStaircase;

                // Posición del Molde en Escalera Ascendente
                const stepHeight = 14;
                const targetStepY = isStaircase ? (wordCenter - charIdx) * stepHeight : 0;

                return (
                  <span
                    key={`slot-${globalIdx}-${char}`}
                    className="inline-flex items-center justify-center relative"
                    style={{
                      minWidth: '0.74em',
                      height: '1.15em',
                      transform: `translate3d(0, ${targetStepY.toFixed(1)}px, 0)`,
                      transition: isStaircase
                        ? 'none'
                        : 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* MOLDE: Silueta tallada en bajo relieve */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 transition-opacity duration-400 ${
                        isPlaced
                          ? 'opacity-80'
                          : 'opacity-40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                      } [text-shadow:_0_3px_8px_rgba(0,0,0,1),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)] text-[#141824]`}
                      aria-hidden="true"
                    >
                      {char}
                    </span>

                    {/* LETRA ACTIVA: Se acopla en su molde */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white z-10 transition-all duration-300 ${
                        isPlaced ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      }`}
                    >
                      <span
                        className={`transition-all duration-1000 ease-in-out ${
                          isHorizontalAligned
                            ? isFinalGlow
                              ? 'drop-shadow-[0_0_24px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]'
                              : 'drop-shadow-[0_2px_14px_rgba(255,255,255,0.35)]'
                            : isCurrentlyEntering
                            ? 'drop-shadow-[0_0_28px_rgba(56,189,248,0.95)] drop-shadow-[0_4px_16px_rgba(255,255,255,0.85)]'
                            : 'drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]'
                        }`}
                      >
                        {char}
                      </span>
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </h1>
    </div>
  );
}

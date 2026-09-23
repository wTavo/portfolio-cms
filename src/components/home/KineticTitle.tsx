/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: moldes en forma de escalera en el centro con letras acostadas en una base inferior que se levantan y levitan una por una hacia su molde antes de nivelarse horizontalmente.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Título interactivo en 2 líneas.
 * - Centro: Moldes en bajo relieve en forma de escalera ascendente.
 * - Base inferior: Todas las letras inician acostadas/tiradas en el suelo en perspectiva 3D.
 * - Cinemática: Cada letra se levanta del suelo, levita hacia el centro y encaja en su molde.
 * - Cierre: Toda la escalera se nivela horizontalmente y activa el ciclo continuo de iluminación.
 */
export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [liftedCount, setLiftedCount] = useState(0);
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

  // Secuencia de Animación: Letras en el Suelo -> Levitación hacia Moldes -> Nivelación Horizontal
  useEffect(() => {
    if (prefersReducedMotion) {
      setLiftedCount(totalLetters);
      setIsStaircase(false);
      setIsHorizontalAligned(true);
      return;
    }

    let current = 0;
    let glowInterval: ReturnType<typeof setInterval>;

    // 1. Pausa inicial para apreciar las letras acostadas en la base y los moldes arriba
    const initialTimer = setTimeout(() => {
      // 2. Levantamiento y levitación secuencial una a una hacia sus moldes
      const liftInterval = setInterval(() => {
        current++;
        setLiftedCount(current);

        if (current >= totalLetters) {
          clearInterval(liftInterval);

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
      }, 85);

      return () => clearInterval(liftInterval);
    }, 500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(glowInterval);
    };
  }, [totalLetters, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-8 sm:gap-y-12 text-center select-none ${className}`}>
        {words.map((word, wIdx) => (
          <span
            key={`word-reduced-${wIdx}`}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.05] uppercase"
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[540px] sm:min-h-[640px] py-16 sm:py-24 overflow-visible [perspective:1000px]">
      {/* Resplandor ambiental que alterna suavemente entre encendido pleno y atenuado */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Título Central con Moldes en Escalera y Letras Levitantes */}
      <h1
        className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider leading-[1.08] flex flex-col items-center justify-center gap-y-12 sm:gap-y-16 md:gap-y-20 lg:gap-y-24 select-none relative z-10 ${className}`}
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

                const isLifted = globalIdx < liftedCount;
                const isCurrentlyFloating = globalIdx === liftedCount - 1 && isStaircase;

                // 1. Posición del Molde en Escalera Ascendente
                const stepHeight = 16;
                const targetStepY = isStaircase ? (wordCenter - charIdx) * stepHeight : 0;

                // 2. Coordenadas de la Base / Suelo (letras acostadas abajo en perspectiva)
                const baseFloorY = (wordIdx === 0 ? 300 : 150) + ((globalIdx % 3) * 6);
                const fallenRotX = 74; // Acostada horizontalmente en perspectiva 3D
                const fallenRotZ = ((globalIdx * 17) % 24) - 12; // Leve variación natural en el suelo (-12° a +12°)

                return (
                  <span
                    key={`slot-${globalIdx}-${char}`}
                    className="inline-flex items-center justify-center relative [transform-style:preserve-3d]"
                    style={{
                      minWidth: '0.74em',
                      height: '1.25em',
                      transform: `translate3d(0, ${targetStepY.toFixed(1)}px, 0)`,
                      transition: isStaircase
                        ? 'none'
                        : 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* MOLDE FIJO EN EL CENTRO: Silueta en Escalera esperando recibir su letra */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 transition-opacity duration-400 ${
                        isLifted
                          ? 'opacity-80'
                          : 'opacity-40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                      }`}
                      aria-hidden="true"
                    >
                      <span className="text-[#141824] select-none [text-shadow:_0_3px_8px_rgba(0,0,0,1),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)]">
                        {char}
                      </span>
                    </span>

                    {/* LETRA ACTIVA: Inicia acostada en la base inferior y levita hacia su molde */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none ${
                        isLifted
                          ? 'text-white opacity-100 z-20'
                          : 'text-neutral-400 opacity-40 z-10'
                      }`}
                      style={{
                        transform: isLifted
                          ? 'translate3d(0, 0, 0) rotateX(0deg) rotateZ(0deg) scale(1)'
                          : `translate3d(0, ${(baseFloorY - targetStepY).toFixed(1)}px, 0) rotateX(${fallenRotX}deg) rotateZ(${fallenRotZ}deg) scale(0.8)`,
                        transition: isLifted
                          ? isStaircase
                            ? 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease, color 300ms ease'
                            : 'none'
                          : 'none',
                        willChange: 'transform, opacity',
                      }}
                    >
                      <span
                        className={`transition-all duration-1000 ease-in-out ${
                          isHorizontalAligned
                            ? isFinalGlow
                              ? 'drop-shadow-[0_0_24px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]'
                              : 'drop-shadow-[0_2px_14px_rgba(255,255,255,0.35)]'
                            : isCurrentlyFloating
                            ? 'drop-shadow-[0_0_28px_rgba(56,189,248,0.9)] drop-shadow-[0_4px_16px_rgba(255,255,255,0.8)]'
                            : isLifted
                            ? 'drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]'
                            : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)]'
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

      {/* Base / Repisa Inferior donde reposan las letras antes de levitar */}
      <div
        className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-4xl flex items-center justify-center pointer-events-none transition-all duration-1000 ${
          liftedCount >= totalLetters ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        aria-hidden="true"
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-brand-accent)]/25 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.3)]" />
      </div>
    </div>
  );
}

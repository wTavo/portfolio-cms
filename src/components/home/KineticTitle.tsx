/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: moldes en bajo relieve en escalera (capa de fondo) y pila física visible de letras en el centro inferior (capa superior). Las letras se levantan de la cima de la pila y levitan suavemente hacia sus moldes antes de nivelarse horizontalmente.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

// Configuración de dispersión física para la pila en la base inferior
const PILE_OFFSETS = [
  { jX: -50, jY: 6, rotX: 52, rotZ: -28 },
  { jX: 35, jY: -4, rotX: 55, rotZ: 20 },
  { jX: -18, jY: 10, rotX: 50, rotZ: -10 },
  { jX: 55, jY: -2, rotX: 54, rotZ: 32 },
  { jX: -65, jY: 4, rotX: 53, rotZ: -35 },
  { jX: 12, jY: 14, rotX: 56, rotZ: 14 },
  { jX: -32, jY: -8, rotX: 51, rotZ: -16 },
  { jX: 45, jY: 8, rotX: 54, rotZ: 25 },
  { jX: -70, jY: -2, rotX: 52, rotZ: -38 },
  { jX: 25, jY: 12, rotX: 55, rotZ: 16 },
  // Fila 2 (PROFESIONAL)
  { jX: -48, jY: 2, rotX: 53, rotZ: -24 },
  { jX: 38, jY: -6, rotX: 51, rotZ: 22 },
  { jX: -22, jY: 8, rotX: 55, rotZ: -12 },
  { jX: 58, jY: 0, rotX: 50, rotZ: 34 },
  { jX: 4, jY: -10, rotX: 54, rotZ: 6 },
  { jX: -58, jY: 8, rotX: 52, rotZ: -30 },
  { jX: 28, jY: 12, rotX: 56, rotZ: 18 },
  { jX: -12, jY: -4, rotX: 51, rotZ: -8 },
  { jX: 68, jY: -8, rotX: 53, rotZ: 36 },
  { jX: -38, jY: 14, rotX: 55, rotZ: -22 },
  { jX: 16, jY: -2, rotX: 52, rotZ: 8 },
];

/**
 * Título cinético:
 * - Capa 1 (Fondo z-10): Moldes en bajo relieve en escalera ascendente limpia.
 * - Capa 2 (Frente z-30): Pila amontonada de letras visibles en el centro inferior con despegue desde la cima.
 * - Cierre: Nivelación horizontal en 2 líneas y ciclo de iluminación continua.
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

  // Secuencia de Animación: Pila Visible -> Levitación Secuencial -> Moldes -> Nivelación
  useEffect(() => {
    if (prefersReducedMotion) {
      setLiftedCount(totalLetters);
      setIsStaircase(false);
      setIsHorizontalAligned(true);
      return;
    }

    let current = 0;
    let glowInterval: ReturnType<typeof setInterval>;

    // 1. Pausa inicial para apreciar la pila de letras y los moldes
    const initialTimer = setTimeout(() => {
      // 2. Despegue secuencial: la letra en la cima levita hacia su molde
      const liftInterval = setInterval(() => {
        current++;
        setLiftedCount(current);

        if (current >= totalLetters) {
          clearInterval(liftInterval);

          // 3. Pausa para contemplar la escalera completa
          setTimeout(() => {
            // 4. Deslizamiento y nivelación hacia el eje horizontal
            setIsStaircase(false);

            // 5. Consolidación horizontal definitiva
            setTimeout(() => {
              setIsHorizontalAligned(true);
              setIsFinalGlow(true);

              // 6. Ciclo continuo de resplandor suave
              setTimeout(() => {
                setIsFinalGlow(false);
                glowInterval = setInterval(() => {
                  setIsFinalGlow((prev) => !prev);
                }, 1800);
              }, 1100);
            }, 900);
          }, 600);
        }
      }, 125);

      return () => clearInterval(liftInterval);
    }, 600);

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
    <div className="relative w-full flex flex-col items-center justify-center min-h-[580px] sm:min-h-[660px] py-16 sm:py-24 overflow-visible [perspective:1000px]">
      {/* Resplandor ambiental que alterna suavemente */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Sombra / Plataforma de la Pila Inferior */}
      <div
        className={`absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-12 bg-radial from-cyan-500/15 via-black/40 to-transparent blur-xl pointer-events-none transition-all duration-1000 ${
          liftedCount >= totalLetters ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
        }`}
        aria-hidden="true"
      />

      {/* CAPA 1: MOLDES EN EL FONDO (z-10, NUNCA cubren a ninguna letra) */}
      <div
        className={`flex flex-col items-center justify-center gap-y-14 sm:gap-y-18 md:gap-y-22 lg:gap-y-28 select-none relative z-10 pointer-events-none ${className}`}
        aria-hidden="true"
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;

          return (
            <div
              key={`molds-row-${wordIdx}`}
              className="inline-flex items-center justify-center gap-x-2 sm:gap-x-3.5 md:gap-x-5 relative"
            >
              {word.split('').map((char, charIdx) => {
                let globalIdx = 0;
                for (let w = 0; w < wordIdx; w++) {
                  globalIdx += words[w].length;
                }
                globalIdx += charIdx;

                const isLifted = globalIdx < liftedCount;
                const stepHeight = 16;
                const targetStepY = isStaircase ? (wordCenter - charIdx) * stepHeight : 0;

                return (
                  <span
                    key={`mold-slot-${globalIdx}-${char}`}
                    className="inline-flex items-center justify-center relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider leading-[1.08]"
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
                    <span
                      className={`select-none text-[#141824] transition-opacity duration-400 ${
                        isLifted
                          ? 'opacity-80'
                          : 'opacity-40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                      } [text-shadow:_0_3px_8px_rgba(0,0,0,1),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)]`}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* CAPA 2: LETRAS ACTIVAS Y PILA INFERIOR (z-30, SIEMPRE por encima de los moldes) */}
      <h1
        className={`absolute inset-0 flex flex-col items-center justify-center gap-y-14 sm:gap-y-18 md:gap-y-22 lg:gap-y-28 select-none z-30 pointer-events-none [transform-style:preserve-3d] ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;

          return (
            <div
              key={`letters-row-${wordIdx}`}
              className="inline-flex items-center justify-center gap-x-2 sm:gap-x-3.5 md:gap-x-5 relative [transform-style:preserve-3d]"
            >
              {word.split('').map((char, charIdx) => {
                let globalIdx = 0;
                for (let w = 0; w < wordIdx; w++) {
                  globalIdx += words[w].length;
                }
                globalIdx += charIdx;

                const isLifted = globalIdx < liftedCount;
                const isCurrentlyFloating = globalIdx === liftedCount - 1 && isStaircase;

                // 1. Posición en Escalera
                const stepHeight = 16;
                const targetStepY = isStaircase ? (wordCenter - charIdx) * stepHeight : 0;

                // 2. Parámetros de la Pila en la Base Inferior (Visible y Centrada)
                const pileConfig = PILE_OFFSETS[globalIdx % PILE_OFFSETS.length];
                const pileJitterX = pileConfig.jX;
                const pileJitterY = pileConfig.jY;
                const pileRotX = pileConfig.rotX;
                const pileRotZ = pileConfig.rotZ;

                // Profundidad de apilado: la letra 0 está arriba y sale primero
                const pileZIndex = isLifted ? 50 : totalLetters - globalIdx;

                // Desplazamiento desde este slot hacia el centro de la pila visible
                const relativePileXCalc = `calc(${(- (charIdx - wordCenter) * 0.88).toFixed(2)}em + ${pileJitterX}px)`;
                const verticalFloorBase = wordIdx === 0 ? '2.4em + 80px' : '1.2em + 40px';
                const relativePileYCalc = `calc(${verticalFloorBase} + ${pileJitterY}px - ${targetStepY.toFixed(1)}px)`;

                return (
                  <span
                    key={`letter-slot-${globalIdx}-${char}`}
                    className="inline-flex items-center justify-center relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider leading-[1.08] [transform-style:preserve-3d]"
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
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none ${
                        isLifted
                          ? 'text-white opacity-100'
                          : 'text-neutral-100 opacity-90'
                      }`}
                      style={{
                        zIndex: pileZIndex,
                        transform: isLifted
                          ? 'translate3d(0, 0, 0) rotateX(0deg) rotateZ(0deg) scale(1)'
                          : `translate3d(${relativePileXCalc}, ${relativePileYCalc}, 0) rotateX(${pileRotX}deg) rotateZ(${pileRotZ}deg) scale(0.8)`,
                        transition: isLifted
                          ? isStaircase
                            ? 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease, color 300ms ease'
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
                            ? 'drop-shadow-[0_0_28px_rgba(56,189,248,0.95)] drop-shadow-[0_4px_16px_rgba(255,255,255,0.85)]'
                            : isLifted
                            ? 'drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]'
                            : 'drop-shadow-[0_6px_10px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.9)]'
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

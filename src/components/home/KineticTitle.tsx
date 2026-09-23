/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: letras amontonadas aleatoriamente en la base inferior. La letra superior de la pila se levanta y levita suavemente hacia su molde correspondiente en la escalera central antes de nivelarse horizontalmente.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

// Configuración de dispersión física para la pila aleatoria en la base
const PILE_OFFSETS = [
  { jX: -55, jY: 8, rotX: 74, rotZ: -32 },
  { jX: 40, jY: -6, rotX: 70, rotZ: 22 },
  { jX: -20, jY: 14, rotX: 76, rotZ: -12 },
  { jX: 65, jY: -4, rotX: 72, rotZ: 36 },
  { jX: -75, jY: 6, rotX: 75, rotZ: -40 },
  { jX: 15, jY: 18, rotX: 68, rotZ: 16 },
  { jX: -40, jY: -10, rotX: 73, rotZ: -18 },
  { jX: 55, jY: 12, rotX: 71, rotZ: 28 },
  { jX: -85, jY: -2, rotX: 77, rotZ: -45 },
  { jX: 30, jY: 16, rotX: 69, rotZ: 18 },
  // Fila 2 (PROFESIONAL)
  { jX: -60, jY: 4, rotX: 73, rotZ: -26 },
  { jX: 45, jY: -8, rotX: 71, rotZ: 25 },
  { jX: -25, jY: 12, rotX: 76, rotZ: -15 },
  { jX: 70, jY: 0, rotX: 69, rotZ: 38 },
  { jX: 5, jY: -14, rotX: 74, rotZ: 8 },
  { jX: -70, jY: 10, rotX: 72, rotZ: -34 },
  { jX: 35, jY: 15, rotX: 70, rotZ: 20 },
  { jX: -15, jY: -6, rotX: 75, rotZ: -10 },
  { jX: 80, jY: -12, rotX: 73, rotZ: 42 },
  { jX: -45, jY: 18, rotX: 77, rotZ: -28 },
  { jX: 20, jY: -2, rotX: 71, rotZ: 10 },
];

/**
 * Título cinético:
 * - Centro: Moldes en bajo relieve esperando en formación de escalera ascendente.
 * - Base inferior: Todas las letras amontonadas aleatoriamente en una pila física 3D.
 * - Cinemática: La letra en la cima de la pila se yergue y levita suavemente hacia su molde.
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

  // Secuencia de Animación: Pila en el Suelo -> Levitación desde la Cima de la Pila -> Moldes -> Nivelación
  useEffect(() => {
    if (prefersReducedMotion) {
      setLiftedCount(totalLetters);
      setIsStaircase(false);
      setIsHorizontalAligned(true);
      return;
    }

    let current = 0;
    let glowInterval: ReturnType<typeof setInterval>;

    // 1. Pausa inicial para apreciar la pila amontonada abajo y los moldes en escalera arriba
    const initialTimer = setTimeout(() => {
      // 2. Levantamiento secuencial: la letra en la cima de la pila levita hacia su molde
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
      }, 120);

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
    <div className="relative w-full flex flex-col items-center justify-center min-h-[580px] sm:min-h-[680px] py-16 sm:py-24 overflow-visible [perspective:1000px]">
      {/* Resplandor ambiental que alterna suavemente entre encendido pleno y atenuado */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Título Central con Moldes en Escalera y Letras Levitantes */}
      <h1
        className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider leading-[1.08] flex flex-col items-center justify-center gap-y-14 sm:gap-y-18 md:gap-y-22 lg:gap-y-28 select-none relative z-10 ${className}`}
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

                // 2. Parámetros de la Pila Amontonada en la Base
                const pileConfig = PILE_OFFSETS[globalIdx % PILE_OFFSETS.length];
                const pileJitterX = pileConfig.jX;
                const pileJitterY = pileConfig.jY;
                const pileRotX = pileConfig.rotX;
                const pileRotZ = pileConfig.rotZ;

                // Profundidad de apilado: la letra 0 está en la cima y levita primero
                const pileZIndex = isLifted ? 30 : totalLetters - globalIdx;

                // Distancia horizontal y vertical desde este molde particular hacia el centro de la pila
                const relativePileXCalc = `calc(${(- (charIdx - wordCenter) * 0.88).toFixed(2)}em + ${pileJitterX}px)`;
                const verticalFloorBase = wordIdx === 0 ? '3.8em + 130px' : '1.8em + 65px';
                const relativePileYCalc = `calc(${verticalFloorBase} + ${pileJitterY}px - ${targetStepY.toFixed(1)}px)`;

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

                    {/* LETRA: Inicia en la pila amontonada abajo y la de arriba levita hacia el molde */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none ${
                        isLifted
                          ? 'text-white opacity-100'
                          : 'text-neutral-400 opacity-55'
                      }`}
                      style={{
                        zIndex: pileZIndex,
                        transform: isLifted
                          ? 'translate3d(0, 0, 0) rotateX(0deg) rotateZ(0deg) scale(1)'
                          : `translate3d(${relativePileXCalc}, ${relativePileYCalc}, 0) rotateX(${pileRotX}deg) rotateZ(${pileRotZ}deg) scale(0.78)`,
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

      {/* Base / Suelo Inferior donde reposa la pila de letras */}
      <div
        className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[70%] max-w-2xl flex items-center justify-center pointer-events-none transition-all duration-1000 ${
          liftedCount >= totalLetters ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        aria-hidden="true"
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-brand-accent)]/25 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.3)]" />
      </div>
    </div>
  );
}

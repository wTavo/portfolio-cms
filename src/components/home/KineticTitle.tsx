/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: moldes y letras perfectamente acoplados en ranuras unificadas. Pila física de letras en el centro inferior con despegue desde la cima hacia sus moldes en escalera y nivelación horizontal con espaciado compacto.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

// Configuración de dispersión física para la pila en la base inferior
const PILE_OFFSETS = [
  { jX: -48, jY: 6, rotX: 52, rotZ: -28 },
  { jX: 34, jY: -4, rotX: 55, rotZ: 20 },
  { jX: -16, jY: 10, rotX: 50, rotZ: -10 },
  { jX: 52, jY: -2, rotX: 54, rotZ: 32 },
  { jX: -62, jY: 4, rotX: 53, rotZ: -35 },
  { jX: 12, jY: 14, rotX: 56, rotZ: 14 },
  { jX: -30, jY: -8, rotX: 51, rotZ: -16 },
  { jX: 44, jY: 8, rotX: 54, rotZ: 25 },
  { jX: -68, jY: -2, rotX: 52, rotZ: -38 },
  { jX: 24, jY: 12, rotX: 55, rotZ: 16 },
  // Fila 2 (PROFESIONAL)
  { jX: -46, jY: 2, rotX: 53, rotZ: -24 },
  { jX: 36, jY: -6, rotX: 51, rotZ: 22 },
  { jX: -20, jY: 8, rotX: 55, rotZ: -12 },
  { jX: 56, jY: 0, rotX: 50, rotZ: 34 },
  { jX: 4, jY: -10, rotX: 54, rotZ: 6 },
  { jX: -56, jY: 8, rotX: 52, rotZ: -30 },
  { jX: 26, jY: 12, rotX: 56, rotZ: 18 },
  { jX: -12, jY: -4, rotX: 51, rotZ: -8 },
  { jX: 66, jY: -8, rotX: 53, rotZ: 36 },
  { jX: -36, jY: 14, rotX: 55, rotZ: -22 },
  { jX: 16, jY: -2, rotX: 52, rotZ: 8 },
];

/**
 * Título cinético con ranuras unificadas:
 * - Ranura unificada: El molde y la letra habitan el mismo contenedor, garantizando alineación subpixel idéntica.
 * - Pila física 3D en la base inferior con despegue desde la cima.
 * - Espaciado vertical compacto y armonioso entre "PORTAFOLIO" y "PROFESIONAL".
 * - Nivelación horizontal fluida y ciclo continuo de iluminación.
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

    // 1. Pausa inicial para apreciar la pila y los moldes en escalera
    const initialTimer = setTimeout(() => {
      // 2. Despegue secuencial: la letra en la cima de la pila levita hacia su molde
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
      <div className={`flex flex-col items-center justify-center gap-y-1 sm:gap-y-2 md:gap-y-3 text-center select-none ${className}`}>
        {words.map((word, wIdx) => (
          <span
            key={`word-reduced-${wIdx}`}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[0.95] uppercase"
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] py-10 sm:py-14 overflow-visible [perspective:1000px] [transform-style:preserve-3d]">
      {/* Resplandor ambiental que alterna suavemente */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Sombra de la Pila Inferior */}
      <div
        className={`absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-72 sm:w-88 h-10 bg-radial from-cyan-500/15 via-black/40 to-transparent blur-xl pointer-events-none transition-all duration-1000 ${
          liftedCount >= totalLetters ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
        }`}
        aria-hidden="true"
      />

      {/* Título Principal en 2 Líneas Compactas */}
      <h1
        className={`flex flex-col items-center justify-center gap-y-0.5 sm:gap-y-1.5 md:gap-y-2 lg:gap-y-2.5 select-none relative z-20 pointer-events-none [transform-style:preserve-3d] ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;

          return (
            <div
              key={`row-${wordIdx}`}
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

                // 1. Posición en Escalera con Escalones Marcados
                const stepHeight = 16;
                const targetStepY = isStaircase ? (wordCenter - charIdx) * stepHeight : 0;

                // 2. Parámetros de la Pila en la Base Inferior
                const pileConfig = PILE_OFFSETS[globalIdx % PILE_OFFSETS.length];
                const pileJitterX = pileConfig.jX;
                const pileJitterY = pileConfig.jY;
                const pileRotX = pileConfig.rotX;
                const pileRotZ = pileConfig.rotZ;

                // Desplazamiento desde esta casilla hacia el centro de la pila visible
                const relativePileXCalc = `calc(${(- (charIdx - wordCenter) * 0.88).toFixed(2)}em + ${pileJitterX}px)`;
                const verticalFloorBase = wordIdx === 0 ? '1.8em + 55px' : '0.9em + 25px';
                const relativePileYCalc = `calc(${verticalFloorBase} + ${pileJitterY}px - ${targetStepY.toFixed(1)}px)`;

                return (
                  <span
                    key={`slot-${globalIdx}-${char}`}
                    className="inline-flex items-center justify-center relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider leading-[0.95] [transform-style:preserve-3d]"
                    style={{
                      minWidth: '0.74em',
                      height: '1.05em',
                      transform: `translate3d(0, ${targetStepY.toFixed(1)}px, 0)`,
                      transition: isStaircase
                        ? 'none'
                        : 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* HUELLA HORIZONTAL DEL ESCALÓN (Base/Peldaño de la Escalera) */}
                    <div
                      className={`absolute -bottom-1 sm:-bottom-1.5 left-0 right-0 h-[2px] sm:h-[3px] bg-gradient-to-r from-cyan-400/20 via-cyan-400/70 to-cyan-400/20 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.7)] pointer-events-none transition-all duration-700 ${
                        isStaircase ? 'opacity-85 scale-100' : 'opacity-0 scale-75'
                      }`}
                      aria-hidden="true"
                    />

                    {/* CONTRAHUELLA VERTICAL DEL ESCALÓN (Unión entre peldaños) */}
                    {charIdx < wordLen - 1 && (
                      <div
                        className={`absolute -right-1.5 sm:-right-2.5 md:-right-3.5 -bottom-1 sm:-bottom-1.5 w-[2px] h-3.5 sm:h-4.5 bg-gradient-to-b from-cyan-400/70 to-cyan-400/10 shadow-[0_0_6px_rgba(56,189,248,0.4)] pointer-events-none transition-all duration-700 ${
                          isStaircase ? 'opacity-70 scale-100' : 'opacity-0 scale-75'
                        }`}
                        aria-hidden="true"
                      />
                    )}

                    {/* MOLDE: Silueta tallada fija en el centro de esta misma casilla */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none transition-opacity duration-400 ${
                        isLifted
                          ? 'opacity-80'
                          : 'opacity-40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                      } [text-shadow:_0_3px_8px_rgba(0,0,0,1),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)] text-[#141824]`}
                      aria-hidden="true"
                    >
                      {char}
                    </span>

                    {/* LETRA: 100% Opaca con masa física 3D y elevación Z sin clipping */}
                    <span
                      className="absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white opacity-100"
                      style={{
                        zIndex: isCurrentlyFloating ? 60 : isLifted ? 30 : totalLetters - globalIdx,
                        transform: isLifted
                          ? isCurrentlyFloating
                            ? 'translate3d(0, 0, 90px) rotateX(0deg) rotateZ(0deg) scale(1)'
                            : 'translate3d(0, 0, 2px) rotateX(0deg) rotateZ(0deg) scale(1)'
                          : `translate3d(${relativePileXCalc}, ${relativePileYCalc}, 70px) rotateX(${pileRotX}deg) rotateZ(${pileRotZ}deg) scale(0.8)`,
                        transition: isLifted
                          ? isStaircase
                            ? 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease, text-shadow 400ms ease'
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
                            : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]'
                        }`}
                        style={{
                          textShadow: isLifted
                            ? 'none'
                            : '0 1px 0 #cbd5e1, 0 2px 0 #94a3b8, 0 4px 6px rgba(0,0,0,0.85), 0 8px 16px rgba(0,0,0,0.95)',
                        }}
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

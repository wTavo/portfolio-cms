/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: moldes en forma de V invertida (/\) en el centro con acople simultáneo de letras desde ambas puntas exteriores hacia el vértice central, antes de nivelarse horizontalmente y activar el ciclo continuo de iluminación.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Título interactivo en 2 líneas.
 * - Centro: Moldes en bajo relieve en forma de V invertida (/\).
 * - Cinemática: Las letras se van colocando simultáneamente desde ambas puntas exteriores hacia el centro.
 * - Cierre: Toda la estructura se nivela horizontalmente y activa el ciclo continuo de iluminación.
 */
export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStaircase, setIsStaircase] = useState(true);
  const [isHorizontalAligned, setIsHorizontalAligned] = useState(false);
  const [isFinalGlow, setIsFinalGlow] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  // Número máximo de pasos desde los extremos hasta el centro
  const maxSteps = useMemo(() => {
    return Math.max(...words.map((w) => Math.ceil(w.length / 2)));
  }, [words]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Secuencia de Animación: Moldes en V Invertida -> Acople desde Ambas Puntas -> Nivelación Horizontal -> Ciclo de Brillo
  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentStep(maxSteps + 1);
      setIsStaircase(false);
      setIsHorizontalAligned(true);
      return;
    }

    let step = 0;
    let glowInterval: ReturnType<typeof setInterval>;

    // 1. Pausa inicial para apreciar los moldes en V invertida
    const initialTimer = setTimeout(() => {
      // 2. Acople simultáneo desde ambas puntas hacia el centro
      const placeInterval = setInterval(() => {
        step++;
        setCurrentStep(step);

        if (step >= maxSteps) {
          clearInterval(placeInterval);

          // 3. Pausa para contemplar la V invertida completa
          setTimeout(() => {
            // 4. Deslizamiento y nivelación hacia el eje horizontal
            setIsStaircase(false);

            // 5. Consolidación horizontal definitiva
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
      }, 140);

      return () => clearInterval(placeInterval);
    }, 450);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(glowInterval);
    };
  }, [maxSteps, prefersReducedMotion]);

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

      {/* Título Central en 2 Líneas con Moldes en V Invertida (/\) */}
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
                // Distancia desde el extremo más cercano (0 = punta exterior, mayor = hacia el centro)
                const tipDistance = Math.min(charIdx, wordLen - 1 - charIdx);
                const isPlaced = tipDistance < currentStep;
                const isCurrentlyEntering = tipDistance === currentStep - 1 && isStaircase;

                // Forma de V Invertida (/\): el centro está arriba y las puntas abajo
                const distFromCenter = Math.abs(charIdx - wordCenter);
                const stepHeight = 14;
                const targetStepY = isStaircase ? distFromCenter * stepHeight : 0;

                return (
                  <span
                    key={`slot-${wordIdx}-${charIdx}-${char}`}
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
                    {/* MOLDE: Silueta tallada en bajo relieve en V invertida */}
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

                    {/* LETRA ACTIVA: Se acopla desde ambas puntas hacia el centro */}
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

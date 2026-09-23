/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo con Monograma de Diamante/Prisma en la 'A' y despliegue cinemático en abanico (Fan-Out) desde el vértice hacia los extremos, con posterior nivelación horizontal y ciclo continuo de iluminación.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Monograma geométrico de Diamante / Prisma de Cristal tallado que forma una 'A' incandescente.
 */
function DiamondMonogramA({
  isPlaced,
  isEntering,
  isFinalGlow,
  isHorizontalAligned,
}: {
  isPlaced: boolean;
  isEntering: boolean;
  isFinalGlow: boolean;
  isHorizontalAligned: boolean;
}) {
  return (
    <span className="inline-flex items-center justify-center relative w-[0.88em] h-[1.05em] select-none">
      <svg
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-all duration-1000 ease-in-out ${
          isPlaced
            ? isHorizontalAligned
              ? isFinalGlow
                ? 'drop-shadow-[0_0_24px_rgba(255,255,255,0.95)] drop-shadow-[0_0_40px_rgba(56,189,248,0.85)] scale-105'
                : 'drop-shadow-[0_0_14px_rgba(56,189,248,0.6)] scale-100'
              : isEntering
              ? 'scale-115 drop-shadow-[0_0_28px_rgba(56,189,248,1)] drop-shadow-[0_0_45px_rgba(255,255,255,1)]'
              : 'scale-100 drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]'
            : 'opacity-0 scale-75'
        }`}
        aria-label="A"
      >
        <defs>
          <linearGradient id="diamond-facet-body" x1="27" y1="4" x2="27" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="diamond-facet-inner" x1="18" y1="16" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Silueta Base de la 'A' de Diamante */}
        <path
          d="M27 4 L48 46 H38 L33 34 H21 L16 46 H6 L27 4 Z"
          fill="url(#diamond-facet-body)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* Facetas de Cristal del Vértice y Travesaño */}
        <polygon points="27,12 33,26 21,26" fill="#080c18" stroke="#38BDF8" strokeWidth="1" />
        <polygon points="27,4 35,18 27,26 19,18" fill="url(#diamond-facet-inner)" opacity="0.85" />
        <line x1="27" y1="4" x2="27" y2="26" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.95" />
        <line x1="16" y1="46" x2="21" y2="34" stroke="#E0F2FE" strokeWidth="1" opacity="0.75" />
        <line x1="38" y1="46" x2="33" y2="34" stroke="#E0F2FE" strokeWidth="1" opacity="0.75" />

        {/* Núcleo de Destello Central */}
        <circle cx="27" cy="18" r="2.5" fill="#FFFFFF" />
      </svg>
    </span>
  );
}

/**
 * Molde en bajo relieve para la 'A' de diamante.
 */
function DiamondMoldA() {
  return (
    <span className="inline-flex items-center justify-center relative w-[0.88em] h-[1.05em] select-none pointer-events-none opacity-40">
      <svg
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        aria-hidden="true"
      >
        <path
          d="M27 4 L48 46 H38 L33 34 H21 L16 46 H6 L27 4 Z"
          fill="#141824"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <polygon points="27,12 33,26 21,26" fill="#080b12" />
      </svg>
    </span>
  );
}

/**
 * Título cinético con Monograma Diamante y Despliegue en Abanico:
 * - Vértice: Monograma de Diamante/Prisma en la 'A'.
 * - Cinemática: Despliegue en abanico (Fan-Out) naciendo del vértice hacia las puntas exteriores.
 * - Nivelación: Deslizamiento suave hacia la alineación horizontal definitiva.
 * - Cierre: Ciclo continuo de resplandor.
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

  // Número máximo de pasos desde el vértice hacia los extremos
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

  // Secuencia de Animación: Despertar del Monograma -> Despliegue en Abanico (Fan-Out) -> Nivelación -> Resplandor
  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentStep(maxSteps + 1);
      setIsStaircase(false);
      setIsHorizontalAligned(true);
      return;
    }

    let step = 0;
    let glowInterval: ReturnType<typeof setInterval>;

    // 1. Pausa inicial: el monograma de diamante en el vértice despierta
    const initialTimer = setTimeout(() => {
      // 2. Despliegue en abanico (Fan-Out) desde el vértice hacia las puntas
      const placeInterval = setInterval(() => {
        step++;
        setCurrentStep(step);

        if (step >= maxSteps) {
          clearInterval(placeInterval);

          // 3. Pausa para contemplar la V invertida desplegada
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
      }, 135);

      return () => clearInterval(placeInterval);
    }, 450);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(glowInterval);
    };
  }, [maxSteps, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase inline-flex items-center justify-center">
          {words[0].split('').map((char, i) =>
            i === 4 ? (
              <DiamondMonogramA
                key="diamond-reduced"
                isPlaced={true}
                isEntering={false}
                isFinalGlow={false}
                isHorizontalAligned={true}
              />
            ) : (
              <span key={`char-red-0-${i}`}>{char}</span>
            )
          )}
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[var(--color-text-primary)] leading-[1.0] uppercase">
          {words[1]}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[560px] py-12 sm:py-16 overflow-visible">
      {/* Resplandor ambiental que alterna suavemente */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Título Central en 2 Líneas Jerarquizadas con Monograma de Diamante */}
      <h1
        className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 lg:gap-y-5 select-none relative z-10 ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;
          const isFirstWord = wordIdx === 0;

          // Jerarquía visual: PORTAFOLIO grande e imponente, PROFESIONAL compacto con tracking
          const fontClasses = isFirstWord
            ? 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider'
            : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] sm:tracking-[0.25em]';

          const slotMinWidth = isFirstWord ? '0.74em' : '0.85em';
          const slotHeight = isFirstWord ? '1.1em' : '1.2em';
          const stepHeight = isFirstWord ? 26 : 20;

          return (
            <div
              key={`word-row-${wordIdx}`}
              className={`inline-flex items-center justify-center relative ${fontClasses} ${
                isFirstWord ? 'gap-x-2 sm:gap-x-3.5 md:gap-x-5' : 'gap-x-1.5 sm:gap-x-2.5 md:gap-x-3.5'
              }`}
            >
              {word.split('').map((char, charIdx) => {
                const isDiamondLetter = isFirstWord && charIdx === 4; // Letra 'A' en PORTAFOLIO

                // Distancia desde el vértice central (0 = vértice central, mayor = hacia los extremos)
                const distFromCenter = Math.abs(charIdx - wordCenter);
                const fanOutStep = Math.floor(distFromCenter);

                const isPlaced = fanOutStep < currentStep;
                const isCurrentlyEntering = fanOutStep === currentStep - 1 && isStaircase;

                // Desplazamiento vertical en V invertida (/\)
                const peakOffset = isFirstWord ? 0.5 : 0;
                const targetStepY = isStaircase ? (distFromCenter - peakOffset) * stepHeight : 0;

                return (
                  <span
                    key={`slot-${wordIdx}-${charIdx}-${char}`}
                    className="inline-flex items-center justify-center relative leading-[1.0]"
                    style={{
                      minWidth: isDiamondLetter ? '0.88em' : slotMinWidth,
                      height: slotHeight,
                      transform: `translate3d(0, ${targetStepY.toFixed(1)}px, 0)`,
                      transition: isStaircase
                        ? 'none'
                        : 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* MOLDE: Silueta tallada fija en bajo relieve */}
                    {isDiamondLetter ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <DiamondMoldA />
                      </span>
                    ) : (
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
                    )}

                    {/* LETRA ACTIVA / MONOGRAMA DIAMANTE: Se despliega en abanico desde el vértice */}
                    {isDiamondLetter ? (
                      <span className="absolute inset-0 flex items-center justify-center z-20">
                        <DiamondMonogramA
                          isPlaced={isPlaced}
                          isEntering={isCurrentlyEntering}
                          isFinalGlow={isFinalGlow}
                          isHorizontalAligned={isHorizontalAligned}
                        />
                      </span>
                    ) : (
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
                    )}
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

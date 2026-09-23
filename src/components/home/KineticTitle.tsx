/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: La experiencia nace con un icono de Diamante/Prisma solitario en el centro. Al cargar, el prisma se abre como un compás geométrico y despliega en cascada las letras hacia ambos lados en un abanico cinemático (/\) que luego se posa en la línea horizontal definitiva.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'prism_solo' | 'compass_opening' | 'fanning_out' | 'leveling' | 'settled';

/**
 * Monograma geométrico de Diamante / Prisma de Cristal tallado.
 */
function DiamondPrismIcon({
  phase,
  isFinalGlow,
  onClick,
}: {
  phase: AnimationPhase;
  isFinalGlow: boolean;
  onClick?: () => void;
}) {
  const isSolo = phase === 'prism_solo';
  const isOpening = phase === 'compass_opening' || phase === 'fanning_out';
  const isSettled = phase === 'leveling' || phase === 'settled';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center relative cursor-pointer select-none transition-all duration-700 ${
        isSolo
          ? 'scale-135 drop-shadow-[0_0_35px_rgba(56,189,248,1)] drop-shadow-[0_0_60px_rgba(255,255,255,0.9)] animate-pulse'
          : isOpening
          ? 'scale-115 drop-shadow-[0_0_28px_rgba(56,189,248,0.95)]'
          : isFinalGlow
          ? 'scale-105 drop-shadow-[0_0_24px_rgba(255,255,255,0.95)] drop-shadow-[0_0_35px_rgba(56,189,248,0.8)]'
          : 'scale-100 drop-shadow-[0_0_14px_rgba(56,189,248,0.6)]'
      }`}
      style={{ width: '0.88em', height: '1.05em' }}
    >
      <svg
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="A"
      >
        <defs>
          <linearGradient id="prism-grad-body" x1="27" y1="4" x2="27" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="prism-grad-inner" x1="18" y1="16" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Silueta Base Facetada en 'A' */}
        <path
          d="M27 4 L48 46 H38 L33 34 H21 L16 46 H6 L27 4 Z"
          fill="url(#prism-grad-body)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* Facetas de Cristal Internas */}
        <polygon points="27,12 33,26 21,26" fill="#080c18" stroke="#38BDF8" strokeWidth="1" />
        <polygon points="27,4 35,18 27,26 19,18" fill="url(#prism-grad-inner)" opacity="0.85" />
        <line x1="27" y1="4" x2="27" y2="26" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.95" />
        <line x1="16" y1="46" x2="21" y2="34" stroke="#E0F2FE" strokeWidth="1" opacity="0.75" />
        <line x1="38" y1="46" x2="33" y2="34" stroke="#E0F2FE" strokeWidth="1" opacity="0.75" />

        {/* Núcleo Incandescente */}
        <circle cx="27" cy="18" r="2.8" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('prism_solo');
  const [fannedStep, setFannedStep] = useState(0);
  const [isFinalGlow, setIsFinalGlow] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

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

  const runAnimationSequence = () => {
    setPhase('prism_solo');
    setFannedStep(0);
    setIsFinalGlow(false);

    // 1. El Prisma de Diamante nace en solitario en el centro
    const t1 = setTimeout(() => {
      // 2. El prisma se abre como compás geométrico
      setPhase('compass_opening');

      const t2 = setTimeout(() => {
        // 3. Despliegue en abanico (Fan-Out) en cascada hacia ambos lados
        setPhase('fanning_out');

        let step = 0;
        const interval = setInterval(() => {
          step++;
          setFannedStep(step);

          if (step >= maxSteps) {
            clearInterval(interval);

            // 4. Pausa para contemplar la V invertida desplegada
            const t3 = setTimeout(() => {
              // 5. La estructura se posa y nivela suavemente sobre la línea horizontal
              setPhase('leveling');

              const t4 = setTimeout(() => {
                setPhase('settled');
                setIsFinalGlow(true);

                // 6. Ciclo continuo de resplandor
                setTimeout(() => {
                  setIsFinalGlow(false);
                  const glowInt = setInterval(() => {
                    setIsFinalGlow((prev) => !prev);
                  }, 1800);
                  return () => clearInterval(glowInt);
                }, 1100);
              }, 900);
            }, 600);
          }
        }, 110);

        return () => clearInterval(interval);
      }, 350);

      return () => clearTimeout(t2);
    }, 700);

    return () => clearTimeout(t1);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('settled');
      setFannedStep(maxSteps + 1);
      return;
    }

    const cleanup = runAnimationSequence();
    return cleanup;
  }, [maxSteps, prefersReducedMotion]);

  const isStaircase = phase === 'compass_opening' || phase === 'fanning_out';
  const isSettled = phase === 'leveling' || phase === 'settled';

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase inline-flex items-center justify-center">
          {words[0].split('').map((char, i) =>
            i === 4 ? (
              <DiamondPrismIcon key="diamond-red" phase="settled" isFinalGlow={false} />
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
    <div className="relative w-full flex flex-col items-center justify-center min-h-[500px] sm:min-h-[580px] py-12 sm:py-16 overflow-visible">
      {/* Resplandor ambiental de fondo */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-[var(--color-brand-accent)]/20 via-[var(--color-brand-primary)]/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isFinalGlow || phase === 'prism_solo' ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* BRAZOS DEL COMPÁS GEOMÉTRICO (Rayos de Luz que se abren desde el Diamante) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-1 pointer-events-none transition-all duration-700 ${
          phase === 'compass_opening' || phase === 'fanning_out'
            ? 'opacity-80 scale-100'
            : 'opacity-0 scale-50'
        }`}
        aria-hidden="true"
      >
        {/* Brazo Izquierdo del Compás */}
        <div
          className="absolute right-1/2 top-0 h-0.5 bg-gradient-to-l from-cyan-400 via-cyan-300 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)] origin-right transition-transform duration-700"
          style={{
            width: '280px',
            transform: phase === 'prism_solo' ? 'rotate(0deg)' : 'rotate(24deg)',
          }}
        />
        {/* Brazo Derecho del Compás */}
        <div
          className="absolute left-1/2 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)] origin-left transition-transform duration-700"
          style={{
            width: '280px',
            transform: phase === 'prism_solo' ? 'rotate(0deg)' : 'rotate(-24deg)',
          }}
        />
      </div>

      {/* Título Principal en 2 Líneas Jerarquizadas */}
      <h1
        className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 lg:gap-y-5 select-none relative z-10 ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;
          const isFirstWord = wordIdx === 0;

          // Jerarquía visual
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
                const isDiamondLetter = isFirstWord && charIdx === 4; // 'A' en PORTAFOLIO

                // Distancia desde el vértice central
                const distFromCenter = Math.abs(charIdx - wordCenter);
                const fanOutStep = Math.floor(distFromCenter);

                // Estado de visibilidad y despliegue
                const isPlaced = isDiamondLetter ? true : isSettled || (phase === 'fanning_out' && fanOutStep < fannedStep);
                const isCurrentlyEmerging = phase === 'fanning_out' && fanOutStep === fannedStep - 1;

                // Desplazamiento en V invertida (/\) o nivelado en 0
                const peakOffset = isFirstWord ? 0.5 : 0;
                const targetStepY = isStaircase ? (distFromCenter - peakOffset) * stepHeight : 0;

                // Vector de nacimiento desde el vértice (X relativo hacia el centro)
                const relativeSpawnX = `calc(${(- (charIdx - wordCenter) * 0.88).toFixed(2)}em)`;
                const relativeSpawnY = `calc(-${targetStepY}px)`;

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
                    {isDiamondLetter ? (
                      /* EL DIAMANTE / PRISMA CENTRAL */
                      <DiamondPrismIcon
                        phase={phase}
                        isFinalGlow={isFinalGlow}
                        onClick={() => runAnimationSequence()}
                      />
                    ) : (
                      /* LETRAS QUE SE DESPLIEGAN EN ABANICO DESDE EL DIAMANTE */
                      <span
                        className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white ${
                          isPlaced ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}
                        style={{
                          transform: isPlaced
                            ? 'translate3d(0, 0, 0) scale(1)'
                            : `translate3d(${relativeSpawnX}, ${relativeSpawnY}, 0) scale(0.2)`,
                          transition: isPlaced
                            ? 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease'
                            : 'none',
                          willChange: 'transform, opacity',
                        }}
                      >
                        <span
                          className={`transition-all duration-1000 ease-in-out ${
                            isSettled
                              ? isFinalGlow
                                ? 'drop-shadow-[0_0_24px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]'
                                : 'drop-shadow-[0_2px_14px_rgba(255,255,255,0.35)]'
                              : isCurrentlyEmerging
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

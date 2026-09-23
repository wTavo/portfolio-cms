/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: La experiencia nace con un icono de Portafolio/Maletín Tech en solitario. Al abrirse, despliega en cascada las letras hacia ambos lados como documentos de luz en un abanico cinemático (/\) que luego se posa en la línea horizontal definitiva, integrando el maletín como la 'A' icónica.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'briefcase_solo' | 'briefcase_opening' | 'fanning_out' | 'leveling' | 'settled';

/**
 * Icono de Portafolio / Maletín Ejecutivo Tech con diseño estilizado en 'A'.
 */
function PortfolioBriefcaseIcon({
  phase,
  isFinalGlow,
  onClick,
}: {
  phase: AnimationPhase;
  isFinalGlow: boolean;
  onClick?: () => void;
}) {
  const isSolo = phase === 'briefcase_solo';
  const isOpening = phase === 'briefcase_opening' || phase === 'fanning_out';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center relative cursor-pointer select-none transition-all duration-700 ${
        isSolo
          ? 'scale-140 drop-shadow-[0_0_35px_rgba(56,189,248,1)] drop-shadow-[0_0_60px_rgba(255,255,255,0.95)] animate-pulse'
          : isOpening
          ? 'scale-120 drop-shadow-[0_0_28px_rgba(56,189,248,0.95)]'
          : isFinalGlow
          ? 'scale-105 drop-shadow-[0_0_24px_rgba(255,255,255,0.95)] drop-shadow-[0_0_35px_rgba(56,189,248,0.8)]'
          : 'scale-100 drop-shadow-[0_0_14px_rgba(56,189,248,0.6)]'
      }`}
      style={{ width: '0.92em', height: '1.15em' }}
    >
      <svg
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="A"
      >
        <defs>
          <linearGradient id="briefcase-body-grad" x1="27" y1="6" x2="27" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="briefcase-flap-grad" x1="27" y1="16" x2="27" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Asa Superior Metálica del Portafolio (Cúspide de la 'A') */}
        <path
          d="M21 16 V9 C21 6.5 33 6.5 33 9 V16"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cuerpo Principal del Portafolio (Trapezoidal / Silueta de 'A') */}
        <path
          d="M16 16 H38 L46 46 H8 L16 16 Z"
          fill="url(#briefcase-body-grad)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* Solapa Superior Plegable del Portafolio */}
        <path
          d="M16 16 H38 L41 28 L27 34 L13 28 L16 16 Z"
          fill="url(#briefcase-flap-grad)"
          opacity="0.9"
          stroke="#38BDF8"
          strokeWidth="1"
        />

        {/* Barra Transversal y Broche Central de Titanio (Travesaño de la 'A') */}
        <line x1="14" y1="34" x2="40" y2="34" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.9" />
        
        {/* Broche / Cerradura de Seguridad Iluminada */}
        <rect
          x="24"
          y="30"
          width="6"
          height="7"
          rx="1.5"
          fill="#0c1222"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />
        <circle cx="27" cy="33.5" r="1.2" fill="#FFFFFF" />

        {/* Costuras y Biseles Reforzados en Esquinas */}
        <line x1="10" y1="44" x2="16" y2="18" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
        <line x1="44" y1="44" x2="38" y2="18" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * Molde en bajo relieve para el Portafolio.
 */
function PortfolioBriefcaseMold() {
  return (
    <span className="inline-flex items-center justify-center relative w-[0.92em] h-[1.15em] select-none pointer-events-none opacity-40">
      <svg
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        aria-hidden="true"
      >
        <path
          d="M21 16 V9 C21 6.5 33 6.5 33 9 V16"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M16 16 H38 L46 46 H8 L16 16 Z"
          fill="#141824"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <line x1="14" y1="34" x2="40" y2="34" stroke="#080c18" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('briefcase_solo');
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
    setPhase('briefcase_solo');
    setFannedStep(0);
    setIsFinalGlow(false);

    // 1. El Portafolio nace en solitario en el centro con pulso de luz
    const t1 = setTimeout(() => {
      // 2. El portafolio se abre y proyecta los rayos de luz
      setPhase('briefcase_opening');

      const t2 = setTimeout(() => {
        // 3. Despliegue en abanico (Fan-Out) expulsando las letras en cascada
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

                // 6. Ciclo continuo de resplandor suave
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

  const isStaircase = phase === 'briefcase_opening' || phase === 'fanning_out';
  const isSettled = phase === 'leveling' || phase === 'settled';

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase inline-flex items-center justify-center">
          {words[0].split('').map((char, i) =>
            i === 4 ? (
              <PortfolioBriefcaseIcon key="briefcase-red" phase="settled" isFinalGlow={false} />
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
          isFinalGlow || phase === 'briefcase_solo' ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* BRAZOS DEL COMPÁS / HACES DE LUZ QUE ABREN EL PORTAFOLIO */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-1 pointer-events-none transition-all duration-700 ${
          phase === 'briefcase_opening' || phase === 'fanning_out'
            ? 'opacity-80 scale-100'
            : 'opacity-0 scale-50'
        }`}
        aria-hidden="true"
      >
        {/* Haz de Luz Izquierdo */}
        <div
          className="absolute right-1/2 top-0 h-0.5 bg-gradient-to-l from-cyan-400 via-cyan-300 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)] origin-right transition-transform duration-700"
          style={{
            width: '280px',
            transform: phase === 'briefcase_solo' ? 'rotate(0deg)' : 'rotate(24deg)',
          }}
        />
        {/* Haz de Luz Derecho */}
        <div
          className="absolute left-1/2 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)] origin-left transition-transform duration-700"
          style={{
            width: '280px',
            transform: phase === 'briefcase_solo' ? 'rotate(0deg)' : 'rotate(-24deg)',
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

          // Jerarquía visual: PORTAFOLIO grande, PROFESIONAL más pequeña con tracking
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
                const isBriefcaseLetter = isFirstWord && charIdx === 4; // Letra 'A' en PORTAFOLIO

                // Distancia desde el vértice central
                const distFromCenter = Math.abs(charIdx - wordCenter);
                const fanOutStep = Math.floor(distFromCenter);

                // Estado de visibilidad y despliegue
                const isPlaced = isBriefcaseLetter ? true : isSettled || (phase === 'fanning_out' && fanOutStep < fannedStep);
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
                      minWidth: isBriefcaseLetter ? '0.92em' : slotMinWidth,
                      height: slotHeight,
                      transform: `translate3d(0, ${targetStepY.toFixed(1)}px, 0)`,
                      transition: isStaircase
                        ? 'none'
                        : 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {isBriefcaseLetter ? (
                      /* EL PORTAFOLIO / MALETÍN CENTRAL */
                      <PortfolioBriefcaseIcon
                        phase={phase}
                        isFinalGlow={isFinalGlow}
                        onClick={() => runAnimationSequence()}
                      />
                    ) : (
                      /* LETRAS QUE BROTAN DESDE EL PORTAFOLIO */
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

/**
 * @file KineticTitle.tsx
 * @description Título cinético interactivo: Un Portafolio Tech en el centro se abre y libera el título completo ('PORTAFOLIO PROFESIONAL' con todas sus letras normales). Las letras se despliegan en abanico (/\) y luego se posan y nivelan sobre la línea horizontal definitiva.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'briefcase_solo' | 'briefcase_opening' | 'fanning_out' | 'leveling' | 'settled';

/**
 * Gráfico vectorial de Portafolio Tech independiente con tapa que se abre en 3D.
 */
function PortfolioBriefcaseGraphic({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center [perspective:800px] select-none">
      {/* Halo de luz que emana del interior del portafolio cuando se abre */}
      <div
        className={`absolute inset-0 bg-radial from-cyan-400/40 via-cyan-500/15 to-transparent blur-2xl transition-all duration-700 ${
          isOpen ? 'opacity-100 scale-130' : 'opacity-40 scale-90'
        }`}
      />

      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
      >
        <defs>
          <linearGradient id="case-body-grad" x1="32" y1="16" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="case-interior-grad" x1="32" y1="20" x2="32" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>

        {/* Asa Superior Metálica */}
        <path
          d="M24 18 V10 C24 7.5 40 7.5 40 10 V18"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Interior Iluminado (Visible cuando la tapa se abre) */}
        <path
          d="M14 18 H50 L54 52 H10 L14 18 Z"
          fill="url(#case-interior-grad)"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />

        {/* Cuerpo Principal del Portafolio */}
        <path
          d="M12 28 H52 L54 52 H10 L12 28 Z"
          fill="url(#case-body-grad)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* Tapa / Solapa que se abre hacia arriba */}
        <g
          style={{
            transformOrigin: '32px 18px',
            transform: isOpen ? 'rotateX(-75deg) translateY(-3px)' : 'rotateX(0deg)',
            transition: 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <path
            d="M14 18 H50 L52 34 L32 40 L12 34 L14 18 Z"
            fill="#0f172a"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          {/* Broche de Seguridad Central */}
          <rect
            x="28"
            y="35"
            width="8"
            height="9"
            rx="2"
            fill="#FFFFFF"
            className={isOpen ? 'drop-shadow-[0_0_12px_rgba(255,255,255,1)]' : ''}
          />
          <circle cx="32" cy="39.5" r="1.5" fill="#0284C7" />
        </g>
      </svg>
    </div>
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

    // 1. El Portafolio aparece solitario en el centro con pulso de luz
    const t1 = setTimeout(() => {
      // 2. El portafolio se abre
      setPhase('briefcase_opening');

      const t2 = setTimeout(() => {
        // 3. Despliegue en abanico (Fan-Out): el título completo brota del portafolio
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
      }, 400);

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
        <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase">
          {words[0]}
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

      {/* PORTAFOLIO CENTRAL INDEPENDIENTE QUE SE ABRE Y EXPULSA EL TÍTULO */}
      <div
        onClick={() => runAnimationSequence()}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 ${
          phase === 'briefcase_solo'
            ? 'opacity-100 scale-125 drop-shadow-[0_0_40px_rgba(56,189,248,1)]'
            : phase === 'briefcase_opening' || phase === 'fanning_out'
            ? 'opacity-85 scale-105 drop-shadow-[0_0_30px_rgba(56,189,248,0.8)]'
            : 'opacity-0 scale-75 pointer-events-none'
        }`}
        title="Haz clic para volver a abrir el portafolio"
        aria-hidden={phase === 'settled'}
      >
        <PortfolioBriefcaseGraphic isOpen={phase !== 'briefcase_solo'} />
      </div>

      {/* BRAZOS DEL COMPÁS / HACES DE LUZ QUE SE ABREN DESDE EL PORTAFOLIO */}
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
            width: '300px',
            transform: phase === 'briefcase_solo' ? 'rotate(0deg)' : 'rotate(24deg)',
          }}
        />
        {/* Haz de Luz Derecho */}
        <div
          className="absolute left-1/2 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)] origin-left transition-transform duration-700"
          style={{
            width: '300px',
            transform: phase === 'briefcase_solo' ? 'rotate(0deg)' : 'rotate(-24deg)',
          }}
        />
      </div>

      {/* Título Principal Completo (Todas las Letras Normales, Incluyendo la 'A') */}
      <h1
        className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 lg:gap-y-5 select-none relative z-10 ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          const wordLen = word.length;
          const wordCenter = (wordLen - 1) / 2;
          const isFirstWord = wordIdx === 0;

          // Jerarquía visual: PORTAFOLIO grande, PROFESIONAL compacto con tracking
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
                // Distancia desde el vértice central
                const distFromCenter = Math.abs(charIdx - wordCenter);
                const fanOutStep = Math.floor(distFromCenter);

                // Estado de visibilidad y despliegue
                const isPlaced = isSettled || (phase === 'fanning_out' && fanOutStep < fannedStep);
                const isCurrentlyEmerging = phase === 'fanning_out' && fanOutStep === fannedStep - 1;

                // Desplazamiento en V invertida (/\) o nivelado en 0
                const peakOffset = isFirstWord ? 0.5 : 0;
                const targetStepY = isStaircase ? (distFromCenter - peakOffset) * stepHeight : 0;

                // Vector de nacimiento desde el centro del portafolio
                const relativeSpawnX = `calc(${(- (charIdx - wordCenter) * 0.88).toFixed(2)}em)`;
                const relativeSpawnY = `calc(-${targetStepY}px)`;

                return (
                  <span
                    key={`slot-${wordIdx}-${charIdx}-${char}`}
                    className="inline-flex items-center justify-center relative leading-[1.0]"
                    style={{
                      minWidth: slotMinWidth,
                      height: slotHeight,
                      transform: `translate3d(0, ${targetStepY.toFixed(1)}px, 0)`,
                      transition: isStaircase
                        ? 'none'
                        : 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* LETRA NORMAL: Nace desde el portafolio y se despliega en abanico */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white ${
                        isPlaced ? 'opacity-100 scale-100' : 'opacity-0 scale-40'
                      }`}
                      style={{
                        transform: isPlaced
                          ? 'translate3d(0, 0, 0) scale(1)'
                          : `translate3d(${relativeSpawnX}, ${relativeSpawnY}, 0) scale(0.15)`,
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

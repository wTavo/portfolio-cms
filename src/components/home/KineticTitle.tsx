/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Firma Caligráfica de Alta Gama en Cursiva Fluida".
 * Trazo caligráfico de tinta líquida y luz que escribe 'Portafolio Profesional'
 * con legibilidad cristalina, sin lápiz, con floritura de firma y resplandor continuo.
 */

import React, { useState, useEffect, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

export default function KineticTitle({
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [progressLine1, setProgressLine1] = useState(0);
  const [progressLine2, setProgressLine2] = useState(0);
  const [progressFlourish, setProgressFlourish] = useState(0);
  const [isFinalGlow, setIsFinalGlow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const pathFlourishRef = useRef<SVGPathElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const runSignatureAnimation = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setIsAnimating(true);
    setIsFinalGlow(false);
    setProgressLine1(0);
    setProgressLine2(0);
    setProgressFlourish(0);

    const startTime = performance.now();
    const dur1 = 900;    // Línea 1: 'Portafolio'
    const pause1 = 120;  // Pausa entre palabras
    const dur2 = 1000;   // Línea 2: 'Profesional'
    const pause2 = 80;   // Pausa antes de floritura
    const durF = 650;    // Floritura / Subrayado de firma
    const totalDuration = dur1 + pause1 + dur2 + pause2 + durF;

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed < dur1) {
        // Escribiendo 'Portafolio'
        const p = Math.min(elapsed / dur1, 1);
        const eased = p * (2 - p);
        setProgressLine1(eased);
        setProgressLine2(0);
        setProgressFlourish(0);
      } else if (elapsed < dur1 + pause1) {
        setProgressLine1(1);
        setProgressLine2(0);
        setProgressFlourish(0);
      } else if (elapsed < dur1 + pause1 + dur2) {
        // Escribiendo 'Profesional'
        setProgressLine1(1);
        const p = Math.min((elapsed - (dur1 + pause1)) / dur2, 1);
        const eased = p * (2 - p);
        setProgressLine2(eased);
        setProgressFlourish(0);
      } else if (elapsed < dur1 + pause1 + dur2 + pause2) {
        setProgressLine1(1);
        setProgressLine2(1);
        setProgressFlourish(0);
      } else if (elapsed < totalDuration) {
        // Trazando la floritura final
        setProgressLine1(1);
        setProgressLine2(1);
        const p = Math.min((elapsed - (dur1 + pause1 + dur2 + pause2)) / durF, 1);
        const eased = p * (2 - p);
        setProgressFlourish(eased);
      } else {
        // Asentamiento de la firma
        setProgressLine1(1);
        setProgressLine2(1);
        setProgressFlourish(1);
        setIsAnimating(false);
        setIsFinalGlow(true);

        setTimeout(() => {
          setIsFinalGlow(false);
          const glowInt = setInterval(() => {
            setIsFinalGlow((prev) => !prev);
          }, 1800);
          return () => clearInterval(glowInt);
        }, 1100);

        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgressLine1(1);
      setProgressLine2(1);
      setProgressFlourish(1);
      return;
    }

    const t = setTimeout(() => {
      runSignatureAnimation();
    }, 400);

    return () => {
      clearTimeout(t);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 text-center select-none ${className}`}>
        <span
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white font-normal leading-[1.1] tracking-wide"
          style={{ fontFamily: "'Great Vibes', 'Caveat', cursive" }}
        >
          Portafolio
        </span>
        <span
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white/95 font-normal leading-[1.1] tracking-wider"
          style={{ fontFamily: "'Great Vibes', 'Caveat', cursive" }}
        >
          Profesional
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (!isAnimating) runSignatureAnimation();
      }}
      className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[600px] py-12 sm:py-16 select-none cursor-pointer overflow-visible"
      title="Haz clic para volver a trazar la firma"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Caveat:wght@600;700&display=swap');
      `}</style>

      {/* Resplandor ambiental de estudio */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/14 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow || isAnimating ? 'opacity-100 scale-105' : 'opacity-30 scale-95'
        }`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl px-4">
        {/* ✍️ LÍNEA 1: "Portafolio" (Escritura en Cursiva Fluida con Máscara de Trazo Progresivo) */}
        <div className="relative inline-block overflow-visible py-1 sm:py-2">
          {/* Texto que se va revelando progresivamente */}
          <div
            style={{
              clipPath: `inset(0 ${(1 - progressLine1) * 100}% 0 0)`,
            }}
            className="transition-none"
          >
            <span
              className={`inline-block text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white font-normal leading-[1.15] tracking-wide transition-all duration-1000 ${
                isFinalGlow
                  ? 'drop-shadow-[0_0_35px_rgba(255,255,255,0.95)] drop-shadow-[0_4px_20px_rgba(255,255,255,0.7)]'
                  : 'drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]'
              }`}
              style={{ fontFamily: "'Great Vibes', 'Caveat', cursive" }}
            >
              Portafolio
            </span>
          </div>

          {/* Chispa de luz en la punta del trazo mientras escribe */}
          {progressLine1 > 0 && progressLine1 < 1 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white blur-[1px] shadow-[0_0_14px_4px_rgba(255,255,255,1)] pointer-events-none transition-none"
              style={{
                left: `calc(${progressLine1 * 100}% - 4px)`,
              }}
            />
          )}
        </div>

        {/* ✍️ LÍNEA 2: "Profesional" */}
        <div className="relative inline-block overflow-visible -mt-2 sm:-mt-4 md:-mt-6 py-1 sm:py-2">
          <div
            style={{
              clipPath: `inset(0 ${(1 - progressLine2) * 100}% 0 0)`,
            }}
            className="transition-none"
          >
            <span
              className={`inline-block text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white/95 font-normal leading-[1.15] tracking-wider transition-all duration-1000 ${
                !isFinalGlow && progressLine2 === 1
                  ? 'drop-shadow-[0_0_30px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_16px_rgba(255,255,255,0.5)] text-white'
                  : 'drop-shadow-[0_2px_18px_rgba(255,255,255,0.35)] text-white/95'
              }`}
              style={{ fontFamily: "'Great Vibes', 'Caveat', cursive" }}
            >
              Profesional
            </span>
          </div>

          {/* Chispa de luz en la punta de la línea 2 */}
          {progressLine2 > 0 && progressLine2 < 1 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white blur-[1px] shadow-[0_0_14px_4px_rgba(255,255,255,1)] pointer-events-none transition-none"
              style={{
                left: `calc(${progressLine2 * 100}% - 4px)`,
              }}
            />
          )}
        </div>

        {/* 〰️ FLORITURA / RÚBRICA CALIGRÁFICA DE FIRMA EN LA BASE */}
        <div className="relative w-full max-w-xl sm:max-w-2xl h-10 sm:h-14 -mt-2 sm:-mt-4 pointer-events-none overflow-visible">
          <svg
            viewBox="0 0 600 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="flourish-grad" x1="0" y1="30" x2="600" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="20%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              ref={pathFlourishRef}
              d="M 50,20 C 150,45 320,52 480,38 C 550,32 580,18 545,15 C 500,12 380,28 220,38 C 120,44 40,40 20,32 C 10,28 25,24 55,26"
              stroke="url(#flourish-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 900,
                strokeDashoffset: (1 - progressFlourish) * 900,
                filter: isFinalGlow ? 'drop-shadow(0 0 10px rgba(255,255,255,0.9))' : 'drop-shadow(0 0 4px rgba(255,255,255,0.4))',
                transition: isAnimating ? 'none' : 'filter 1000ms ease',
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

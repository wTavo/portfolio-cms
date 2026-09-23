/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Firma de Autor Moderna y de Gran Escala".
 * Tipografía de firma moderna, fluida, en cursiva de trazo rotundo y alta legibilidad ('Satisfy' / 'Mr Dafoe'),
 * a gran escala visual y con animación de escritura continua de luz y tinta.
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
    const dur1 = 950;    // Línea 1: 'Portafolio'
    const pause1 = 140;  // Pausa fluida
    const dur2 = 1050;   // Línea 2: 'Profesional'
    const pause2 = 90;   // Pausa antes de floritura
    const durF = 600;    // Floritura final
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
        // Trazando la floritura
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
      <div className={`flex flex-col items-center justify-center gap-y-1 text-center select-none ${className}`}>
        <span
          className="text-6xl sm:text-8xl md:text-9xl lg:text-[7.5rem] xl:text-[9.5rem] text-white font-normal leading-[1.05] tracking-wide"
          style={{ fontFamily: "'Satisfy', 'Mr Dafoe', cursive" }}
        >
          Portafolio
        </span>
        <span
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[8rem] text-white/95 font-normal leading-[1.05] tracking-wider"
          style={{ fontFamily: "'Satisfy', 'Mr Dafoe', cursive" }}
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
      className="relative w-full flex flex-col items-center justify-center min-h-[520px] sm:min-h-[600px] md:min-h-[680px] py-10 sm:py-14 select-none cursor-pointer overflow-visible"
      title="Haz clic para volver a trazar la firma"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Satisfy&family=Mr+Dafoe&family=Caveat:wght@700&display=swap');
      `}</style>

      {/* Resplandor ambiental de estudio cinemático */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/15 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow || isAnimating ? 'opacity-100 scale-105' : 'opacity-30 scale-95'
        }`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4">
        {/* ✍️ LÍNEA 1: "Portafolio" (Escala Grande, Cursiva Moderna de Alta Legibilidad) */}
        <div className="relative inline-block overflow-visible py-1 sm:py-2">
          <div
            style={{
              clipPath: `inset(0 ${(1 - progressLine1) * 100}% 0 0)`,
            }}
            className="transition-none"
          >
            <span
              className={`inline-block text-6xl sm:text-8xl md:text-9xl lg:text-[7.5rem] xl:text-[9.5rem] text-white font-normal leading-[1.08] tracking-wide transition-all duration-1000 ${
                isFinalGlow
                  ? 'drop-shadow-[0_0_35px_rgba(255,255,255,0.95)] drop-shadow-[0_4px_20px_rgba(255,255,255,0.7)]'
                  : 'drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]'
              }`}
              style={{ fontFamily: "'Satisfy', 'Mr Dafoe', cursive" }}
            >
              Portafolio
            </span>
          </div>

          {/* Chispa de luz trazadora en la línea 1 */}
          {progressLine1 > 0 && progressLine1 < 1 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-[1px] shadow-[0_0_18px_6px_rgba(255,255,255,1)] pointer-events-none transition-none"
              style={{
                left: `calc(${progressLine1 * 100}% - 6px)`,
              }}
            />
          )}
        </div>

        {/* ✍️ LÍNEA 2: "Profesional" */}
        <div className="relative inline-block overflow-visible -mt-4 sm:-mt-8 md:-mt-12 py-1 sm:py-2">
          <div
            style={{
              clipPath: `inset(0 ${(1 - progressLine2) * 100}% 0 0)`,
            }}
            className="transition-none"
          >
            <span
              className={`inline-block text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[8rem] text-white/95 font-normal leading-[1.08] tracking-wider transition-all duration-1000 ${
                !isFinalGlow && progressLine2 === 1
                  ? 'drop-shadow-[0_0_30px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_16px_rgba(255,255,255,0.5)] text-white'
                  : 'drop-shadow-[0_2px_18px_rgba(255,255,255,0.35)] text-white/95'
              }`}
              style={{ fontFamily: "'Satisfy', 'Mr Dafoe', cursive" }}
            >
              Profesional
            </span>
          </div>

          {/* Chispa de luz trazadora en la línea 2 */}
          {progressLine2 > 0 && progressLine2 < 1 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-[1px] shadow-[0_0_18px_6px_rgba(255,255,255,1)] pointer-events-none transition-none"
              style={{
                left: `calc(${progressLine2 * 100}% - 6px)`,
              }}
            />
          )}
        </div>

        {/* 〰️ FLORITURA / RÚBRICA CALIGRÁFICA DE FIRMA EN LA BASE */}
        <div className="relative w-full max-w-2xl sm:max-w-3xl h-12 sm:h-16 -mt-3 sm:-mt-6 pointer-events-none overflow-visible">
          <svg
            viewBox="0 0 700 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="flourish-grad-large" x1="0" y1="35" x2="700" y2="35" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="15%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="85%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              ref={pathFlourishRef}
              d="M 60,25 C 180,55 380,62 560,45 C 640,38 670,22 630,18 C 580,14 440,32 260,45 C 140,52 50,48 30,38 C 18,32 35,28 70,30"
              stroke="url(#flourish-grad-large)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 1100,
                strokeDashoffset: (1 - progressFlourish) * 1100,
                filter: isFinalGlow ? 'drop-shadow(0 0 12px rgba(255,255,255,0.95))' : 'drop-shadow(0 0 6px rgba(255,255,255,0.4))',
                transition: isAnimating ? 'none' : 'filter 1000ms ease',
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

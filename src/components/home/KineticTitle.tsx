/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cromo Líquido y Refracción Cáustica" (Liquid Chrome & Specular Glare).
 * Tipografía monumental tallada en cromo líquido y titanio pulido con destellos de bisel,
 * barrido de luz cáustica y reflejo especular interactivo en tiempo real con el mouse.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'mercury_flow' | 'caustic_flare' | 'settled';

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('mercury_flow');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isWaveActive, setIsWaveActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const runLiquidChromeSequence = () => {
    setPhase('mercury_flow');
    setIsWaveActive(true);

    // 1. Flujo de mercurio líquido e ignición cáustica (600ms)
    const t1 = setTimeout(() => {
      setPhase('caustic_flare');

      // 2. Asentamiento en cromo interactivo permanente (800ms)
      const t2 = setTimeout(() => {
        setPhase('settled');
        setIsWaveActive(false);
      }, 800);

      return () => clearTimeout(t2);
    }, 600);

    return () => clearTimeout(t1);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('settled');
      return;
    }

    const cleanup = runLiquidChromeSequence();
    return cleanup;
  }, [prefersReducedMotion]);

  // Manejador del mouse para el reflejo especular en tiempo real
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const isFlowing = phase === 'mercury_flow';
  const isFlaring = phase === 'caustic_flare';
  const isSettled = phase === 'settled';

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-wider text-white leading-[1.0] uppercase">
          {words[0]}
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.25em] sm:tracking-[0.32em] text-white/90 leading-[1.0] uppercase">
          {words[1]}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (isSettled) runLiquidChromeSequence();
      }}
      className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[620px] py-12 sm:py-16 select-none cursor-pointer overflow-visible"
      title="Haz clic para disparar una onda de cromo líquido"
    >
      <style>{`
        @keyframes liquidSheenSweep {
          0% { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateX(250%) skewX(-20deg); opacity: 0; }
        }
        @keyframes liquidPulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.4)) drop-shadow(0 4px 12px rgba(0,0,0,0.9)); }
          50% { filter: drop-shadow(0 0 35px rgba(255,255,255,0.85)) drop-shadow(0 6px 20px rgba(255,255,255,0.5)); }
        }
      `}</style>

      {/* Resplandor ambiental de estudio líquido */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/16 via-slate-500/6 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFlaring ? 'opacity-100 scale-110' : isSettled ? 'opacity-35 scale-100' : 'opacity-10 scale-95'
        }`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4">
        {/* 🪞 FILA 1: PORTAFOLIO (Cromo Líquido Monumental) */}
        <div className="relative inline-block overflow-visible group">
          {/* Capa de Sombra y Relieve Base */}
          <h1
            className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-wider text-transparent leading-[1.0] uppercase text-center transition-all duration-700 select-none ${
              isFlowing
                ? 'opacity-0 scale-95 blur-sm'
                : 'opacity-100 scale-100'
            }`}
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #ffffff 0%, #e2e8f0 25%, #94a3b8 55%, #1e293b 85%, #0f172a 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              filter: isFlaring
                ? 'drop-shadow(0 0 35px rgba(255,255,255,0.95)) drop-shadow(0 4px 16px rgba(255,255,255,0.7))'
                : 'drop-shadow(0 8px 30px rgba(0,0,0,0.95)) drop-shadow(0 1px 2px rgba(255,255,255,0.4))',
            }}
          >
            {words[0]}
          </h1>

          {/* Destello de Refracción Cáustica en Barra de Barrido */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
            }}
          >
            <div
              className={`absolute top-0 bottom-0 w-36 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none blur-[2px] ${
                isWaveActive || isFlowing || isFlaring ? 'animate-[liquidSheenSweep_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards]' : 'opacity-0'
              }`}
            />
          </div>

          {/* Línea de Bisel Especular Superior */}
          <div
            className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-opacity duration-1000 pointer-events-none ${
              isSettled ? 'opacity-40' : 'opacity-0'
            }`}
            style={{
              transform: `translateX(${(mousePos.x - 50) * 0.3}px)`,
            }}
          />
        </div>

        {/* 〰️ SEPARADOR DE HORIZONTE LÍQUIDO */}
        <div className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl h-5 sm:h-7 flex items-center justify-center my-1 sm:my-2 overflow-visible pointer-events-none">
          <div
            className={`h-[1px] transition-all duration-800 ease-out ${
              isFlowing
                ? 'w-0 opacity-0'
                : isFlaring
                ? 'w-full opacity-90 shadow-[0_0_16px_rgba(255,255,255,0.9)] bg-gradient-to-r from-transparent via-white to-transparent'
                : 'w-3/4 opacity-40 bg-gradient-to-r from-transparent via-slate-300 to-transparent'
            }`}
          />
        </div>

        {/* 🪞 FILA 2: PROFESIONAL (Cromo Satinado con Tracking Extendido) */}
        <div className="relative inline-block overflow-visible">
          <p
            className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.25em] sm:tracking-[0.32em] text-transparent leading-[1.0] uppercase text-center transition-all duration-700 delay-100 select-none ${
              isFlowing
                ? 'opacity-0 scale-95 blur-sm'
                : 'opacity-100 scale-100'
            }`}
            style={{
              backgroundImage: `radial-gradient(circle at ${100 - mousePos.x}% ${mousePos.y}%, #ffffff 0%, #cbd5e1 30%, #64748b 65%, #1e293b 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              filter: isFlaring
                ? 'drop-shadow(0 0 25px rgba(255,255,255,0.85)) drop-shadow(0 2px 14px rgba(255,255,255,0.6))'
                : 'drop-shadow(0 6px 20px rgba(0,0,0,0.9)) drop-shadow(0 1px 1px rgba(255,255,255,0.3))',
            }}
          >
            {words[1]}
          </p>

          {/* Destello de Refracción Línea 2 */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
            }}
          >
            <div
              className={`absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none blur-[2px] ${
                isWaveActive || isFlowing || isFlaring ? 'animate-[liquidSheenSweep_1.4s_cubic-bezier(0.16,1,0.3,1)_150ms_forwards]' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

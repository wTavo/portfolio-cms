/**
 * @file KineticTitle.tsx
 * @description Título Cinético: Monolito de Cristal Holográfico 3D (Estilo Apple Pro / Linear).
 * Una tarjeta de cristal oscuro esmerilado en 3D emite un pulso refractivo y proyecta
 * el título 'PORTAFOLIO PROFESIONAL' en capas holográficas con inclinación y profundidad de campo.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'monolith_entry' | 'holographic_pulse' | 'projecting_text' | 'settled';

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('monolith_entry');
  const [isFinalGlow, setIsFinalGlow] = useState(false);
  
  // Parallax interactivo del ratón
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  const runAnimationSequence = () => {
    setPhase('monolith_entry');
    setIsFinalGlow(false);

    // 1. Entrada del monolito de cristal (600ms)
    const t1 = setTimeout(() => {
      // 2. Pulso holográfico y activación del prisma (500ms)
      setPhase('holographic_pulse');

      const t2 = setTimeout(() => {
        // 3. Proyección cinemática del título hacia el frente en 3D (850ms)
        setPhase('projecting_text');

        const t3 = setTimeout(() => {
          // 4. Asentamiento en reposo con interacción de parallax y resplandor
          setPhase('settled');
          setIsFinalGlow(true);

          setTimeout(() => {
            setIsFinalGlow(false);
            const glowInt = setInterval(() => {
              setIsFinalGlow((prev) => !prev);
            }, 1800);
            return () => clearInterval(glowInt);
          }, 1000);
        }, 850);

        return () => clearTimeout(t3);
      }, 500);

      return () => clearTimeout(t2);
    }, 600);

    return () => clearTimeout(t1);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('settled');
      return;
    }

    const cleanup = runAnimationSequence();
    return cleanup;
  }, [prefersReducedMotion]);

  // Manejador del movimiento del mouse para la inclinación 3D del cristal
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 a 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const isSettled = phase === 'settled';
  const isProjectingOrSettled = phase === 'projecting_text' || phase === 'settled';
  const isPulsing = phase === 'holographic_pulse';

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

  // Ángulos de rotación 3D basados en el ratón
  const rotateY = mousePos.x * 16;
  const rotateX = -mousePos.y * 14;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (isSettled) runAnimationSequence();
      }}
      className="relative w-full flex flex-col items-center justify-center min-h-[520px] sm:min-h-[580px] md:min-h-[640px] py-12 sm:py-16 select-none cursor-pointer [perspective:1400px] overflow-visible"
      title="Haz clic para volver a proyectar el holograma"
    >
      {/* Resplandor ambiental de estudio cinemático */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/12 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow || isPulsing ? 'opacity-100 scale-110' : 'opacity-30 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* CONTENEDOR 3D CON INCLINACIÓN PARALLAX */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* 🪟 MONOLITO DE CRISTAL OSCURO ESMERILADO (FROSTED GLASS CARD) */}
        <div
          className={`relative flex items-center justify-center rounded-3xl md:rounded-[32px] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === 'monolith_entry'
              ? 'w-72 h-44 sm:w-96 sm:h-56 opacity-85 scale-90 [transform:translateZ(0px)]'
              : phase === 'holographic_pulse'
              ? 'w-80 h-48 sm:w-[440px] sm:h-64 opacity-100 scale-105 [transform:translateZ(15px)] shadow-[0_0_80px_rgba(255,255,255,0.25)]'
              : 'w-[90vw] max-w-4xl h-56 sm:h-72 md:h-80 opacity-90 scale-100 [transform:translateZ(0px)]'
          }`}
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(15,23,42,0.65) 40%, rgba(2,6,23,0.85) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow:
              '0 30px 80px -15px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 1px rgba(0,0,0,0.5)',
          }}
        >
          {/* Reflejo especular / Glare interactivo que sigue al mouse */}
          <div
            className="absolute inset-0 rounded-3xl md:rounded-[32px] pointer-events-none transition-opacity duration-500 overflow-hidden"
            style={{
              background: `radial-gradient(circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
            }}
          />

          {/* Micro-malla de circuito / matriz holográfica */}
          <div
            className="absolute inset-0 rounded-3xl md:rounded-[32px] opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
            aria-hidden="true"
          />

          {/* Prisma Óptico Central / Emisor Holográfico */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out pointer-events-none ${
              isPulsing
                ? 'w-36 h-36 opacity-100 scale-125'
                : phase === 'monolith_entry'
                ? 'w-24 h-24 opacity-80 scale-95'
                : 'w-48 h-48 opacity-25 scale-150'
            }`}
          >
            {/* Ondas refractivas de luz que emanan del prisma */}
            <div
              className={`absolute inset-0 rounded-full border border-white/40 transition-all duration-1000 ${
                isPulsing ? 'scale-150 opacity-100' : 'scale-75 opacity-0'
              }`}
            />
            <div
              className={`absolute inset-4 rounded-full border border-white/60 bg-radial from-white/30 via-white/5 to-transparent blur-md transition-all duration-700 ${
                isPulsing ? 'scale-120 opacity-100' : 'scale-50 opacity-20'
              }`}
            />
          </div>

          {/* Esquinas biseladas con marcadores de titanio/plata */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40 rounded-tl pointer-events-none" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40 rounded-tr pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40 rounded-bl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40 rounded-br pointer-events-none" />
        </div>

        {/* 🌟 TÍTULO HOLOGRÁFICO PROYECTADO HACIA EL FRENTE EN 3D */}
        <h1
          className={`absolute inset-0 flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 lg:gap-y-5 text-center select-none pointer-events-none [transform-style:preserve-3d] ${className}`}
          aria-label={uppercaseText}
        >
          {/* FILA 1: PORTAFOLIO (Proyectada más al frente con profundidad translateZ) */}
          <div
            className={`transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isProjectingOrSettled
                ? 'opacity-100 [transform:translateZ(50px)_scale(1)]'
                : 'opacity-0 [transform:translateZ(-40px)_scale(0.85)] blur-sm'
            }`}
          >
            <span
              className={`inline-block text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-white leading-[1.0] uppercase transition-all duration-1000 ${
                isSettled
                  ? isFinalGlow
                    ? 'drop-shadow-[0_0_35px_rgba(255,255,255,0.9)] drop-shadow-[0_4px_16px_rgba(255,255,255,0.6)]'
                    : 'drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]'
                  : 'drop-shadow-[0_0_40px_rgba(255,255,255,1)]'
              }`}
            >
              {words[0]}
            </span>
          </div>

          {/* FILA 2: PROFESIONAL (Proyectada con tracking extendido elegante) */}
          <div
            className={`transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 ${
              isProjectingOrSettled
                ? 'opacity-100 [transform:translateZ(35px)_scale(1)]'
                : 'opacity-0 [transform:translateZ(-30px)_scale(0.85)] blur-sm'
            }`}
          >
            <span
              className={`inline-block text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.22em] sm:tracking-[0.28em] text-white/95 leading-[1.0] uppercase transition-all duration-1000 ${
                isSettled
                  ? !isFinalGlow
                    ? 'drop-shadow-[0_0_30px_rgba(255,255,255,0.85)] drop-shadow-[0_2px_14px_rgba(255,255,255,0.5)] text-white'
                    : 'drop-shadow-[0_2px_16px_rgba(255,255,255,0.3)] text-white/90'
                  : 'drop-shadow-[0_0_35px_rgba(255,255,255,0.9)]'
              }`}
            >
              {words[1]}
            </span>
          </div>
        </h1>
      </div>
    </div>
  );
}

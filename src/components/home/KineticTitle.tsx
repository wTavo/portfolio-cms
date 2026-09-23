/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "La Galería Curada / Exposición de Obras" (The Exhibition).
 * Concepto universal para cualquier profesión: Marcos de exhibición abstractos
 * (Arquitectura, Fotografía/Artes, Casos de Estudio, Logros/Certificaciones)
 * convergen con fluidez en una galería 3D y coronan el título 'PORTAFOLIO PROFESIONAL'.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

type AnimationPhase = 'gallery_dispersed' | 'gallery_curating' | 'title_reveal' | 'settled';

interface ExhibitionFrame {
  id: string;
  category: string;
  iconType: 'geometry' | 'visual' | 'editorial' | 'achievement';
  initialOffset: { x: number; y: number; rotate: number; z: number };
  dockedOffset: { x: number; y: number; rotate: number; z: number };
}

const EXHIBITION_FRAMES: ExhibitionFrame[] = [
  {
    id: 'frame-architecture',
    category: 'Proyectos & Estructuras',
    iconType: 'geometry',
    initialOffset: { x: -280, y: -120, rotate: -12, z: -80 },
    dockedOffset: { x: -220, y: -40, rotate: -4, z: -20 },
  },
  {
    id: 'frame-visual',
    category: 'Artes & Multimedia',
    iconType: 'visual',
    initialOffset: { x: 280, y: -110, rotate: 14, z: -70 },
    dockedOffset: { x: 220, y: -45, rotate: 5, z: -15 },
  },
  {
    id: 'frame-editorial',
    category: 'Casos de Estudio & Artículos',
    iconType: 'editorial',
    initialOffset: { x: -240, y: 130, rotate: 10, z: -60 },
    dockedOffset: { x: -180, y: 55, rotate: 3, z: -25 },
  },
  {
    id: 'frame-achievement',
    category: 'Logros & Certificaciones',
    iconType: 'achievement',
    initialOffset: { x: 240, y: 140, rotate: -9, z: -90 },
    dockedOffset: { x: 180, y: 50, rotate: -3, z: -30 },
  },
];

/**
 * Gráficos vectoriales abstractos que representan las diferentes disciplinas profesionales.
 */
function FrameArtwork({ type }: { type: ExhibitionFrame['iconType'] }) {
  switch (type) {
    case 'geometry':
      // Arquitectura / Ingeniería / Diseño Estructural
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full stroke-slate-400 opacity-70">
          <rect x="8" y="8" width="32" height="32" rx="2" strokeWidth="1.2" strokeDasharray="3 2" />
          <polygon points="24,12 36,36 12,36" strokeWidth="1.2" />
          <circle cx="24" cy="24" r="5" strokeWidth="1" />
          <line x1="8" y1="24" x2="40" y2="24" strokeWidth="0.8" opacity="0.4" />
        </svg>
      );
    case 'visual':
      // Fotografía / Cine / Artes Visuales
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full stroke-slate-400 opacity-70">
          <circle cx="24" cy="24" r="16" strokeWidth="1.2" />
          <polygon points="24,12 34,24 24,36 14,24" strokeWidth="1" />
          <circle cx="24" cy="24" r="4" fill="#ffffff" fillOpacity="0.2" strokeWidth="1" />
          <path d="M16 12 L32 36" strokeWidth="0.8" opacity="0.4" />
        </svg>
      );
    case 'editorial':
      // Investigación / Redacción / Derecho / Consultoría
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full stroke-slate-400 opacity-70">
          <rect x="10" y="8" width="28" height="32" rx="2" strokeWidth="1.2" />
          <line x1="16" y1="16" x2="32" y2="16" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="22" x2="28" y2="22" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="28" x2="30" y2="28" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="34" x2="24" y2="34" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'achievement':
      // Certificaciones / Medicina / Finanzas / Liderazgo
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full stroke-slate-400 opacity-70">
          <circle cx="24" cy="20" r="12" strokeWidth="1.2" />
          <polygon points="24,12 26.5,17.5 32.5,18 28,22 29.5,28 24,25 18.5,28 20,22 15.5,18 21.5,17.5" fill="#ffffff" fillOpacity="0.2" strokeWidth="0.8" />
          <path d="M19 30 L16 42 L24 38 L32 42 L29 30" strokeWidth="1.2" />
        </svg>
      );
  }
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('gallery_dispersed');
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
    setPhase('gallery_dispersed');
    setIsFinalGlow(false);

    // 1. Los marcos de exhibición entran flotando en el espacio (500ms)
    const t1 = setTimeout(() => {
      // 2. Curaduría y ensamblado: los marcos convergen al centro y forman la galería (750ms)
      setPhase('gallery_curating');

      const t2 = setTimeout(() => {
        // 3. Revelación de título en el foco principal de la exposición (800ms)
        setPhase('title_reveal');

        const t3 = setTimeout(() => {
          // 4. Asentamiento en reposo con interacción de parallax y resplandor continuo
          setPhase('settled');
          setIsFinalGlow(true);

          setTimeout(() => {
            setIsFinalGlow(false);
            const glowInt = setInterval(() => {
              setIsFinalGlow((prev) => !prev);
            }, 1800);
            return () => clearInterval(glowInt);
          }, 1100);
        }, 800);

        return () => clearTimeout(t3);
      }, 750);

      return () => clearTimeout(t2);
    }, 500);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const isSettled = phase === 'settled';
  const isTitleVisible = phase === 'title_reveal' || phase === 'settled';
  const isCuratingOrSettled = phase === 'gallery_curating' || phase === 'title_reveal' || phase === 'settled';

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

  // Rotación del escenario según el cursor
  const stageRotateY = mousePos.x * 14;
  const stageRotateX = -mousePos.y * 12;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (isSettled) runAnimationSequence();
      }}
      className="relative w-full flex flex-col items-center justify-center min-h-[520px] sm:min-h-[580px] md:min-h-[640px] py-12 sm:py-16 select-none cursor-pointer [perspective:1400px] overflow-visible"
      title="Haz clic para volver a curar la galería"
    >
      {/* Luz ambiental de galería / Spotlight central */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/12 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow || phase === 'title_reveal' ? 'opacity-100 scale-110' : 'opacity-35 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* ESCENARIO DE GALERÍA 3D CON PARALLAX */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `rotateX(${stageRotateX}deg) rotateY(${stageRotateY}deg)`,
        }}
      >
        {/* 🏛️ MARCOS DE EXHIBICIÓN DE DISCIPLINAS (THE EXHIBITION CANVASES) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none [transform-style:preserve-3d]">
          {EXHIBITION_FRAMES.map((frame, idx) => {
            const currentOffset = isCuratingOrSettled ? frame.dockedOffset : frame.initialOffset;
            const opacity = isCuratingOrSettled
              ? isSettled
                ? 'opacity-40 sm:opacity-55'
                : 'opacity-85'
              : 'opacity-0';

            return (
              <div
                key={frame.id}
                className={`absolute w-32 h-36 sm:w-40 sm:h-44 md:w-48 md:h-52 rounded-2xl transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${opacity}`}
                style={{
                  transform: `translate3d(${currentOffset.x}px, ${currentOffset.y}px, ${currentOffset.z}px) rotate(${currentOffset.rotate}deg)`,
                  transitionDelay: `${idx * 60}ms`,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(15,23,42,0.7) 50%, rgba(2,6,23,0.9) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              >
                {/* Cabecera del Marco */}
                <div className="p-3 sm:p-3.5 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-400 uppercase truncate">
                    {frame.category}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>

                {/* Contenido Visual del Marco */}
                <div className="p-3 sm:p-4 flex items-center justify-center h-[calc(100%-42px)]">
                  <FrameArtwork type={frame.iconType} />
                </div>

                {/* Pie del marco con código de obra */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>EXHIBIT 0{idx + 1}</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🌟 TÍTULO PRINCIPAL: LA CORONACIÓN DE LA EXPOSICIÓN */}
        <h1
          className={`relative z-20 flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 lg:gap-y-5 text-center select-none [transform-style:preserve-3d] ${className}`}
          aria-label={uppercaseText}
        >
          {/* FILA 1: PORTAFOLIO (Emerge con impacto y nitidez en primer plano) */}
          <div
            className={`transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isTitleVisible
                ? 'opacity-100 [transform:translateZ(40px)_scale(1)]'
                : 'opacity-0 [transform:translateZ(-50px)_scale(0.85)] blur-md'
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

          {/* FILA 2: PROFESIONAL (Emerge con tracking extendido de alta gama) */}
          <div
            className={`transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 ${
              isTitleVisible
                ? 'opacity-100 [transform:translateZ(30px)_scale(1)]'
                : 'opacity-0 [transform:translateZ(-40px)_scale(0.85)] blur-md'
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

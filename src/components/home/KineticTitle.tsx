/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Firma Caligráfica en Cursiva Escrita a Mano con Lápiz".
 * Un lápiz estilizado escribe en tiempo real el título 'Portafolio Profesional'
 * en trazos continuos de firma en cursiva con florituras y tinta luminosa.
 */

import React, { useState, useEffect, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Gráfico vectorial del Lápiz de Dibujo / Caligrafía.
 * La punta exacta del grafito/metal está calibrada en la coordenada (0, 0).
 */
function DrawingPencilGraphic() {
  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
      <svg
        viewBox="-6 -6 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g transform="rotate(25, 0, 0)">
          {/* Cuerpo hexagonal del lápiz en titanio / madera oscura */}
          <path
            d="M 0 0 L 7 -14 L 28 -35 L 34 -29 L 13 -8 L 0 0 Z"
            fill="url(#pencil-body-grad)"
            stroke="#475569"
            strokeWidth="0.8"
          />
          {/* Faceta lateral para volumen 3D */}
          <path
            d="M 3.5 -4 L 10.5 -11 L 31 -32 L 28 -35 L 7 -14 L 0 0 Z"
            fill="#334155"
            opacity="0.6"
          />
          {/* Punta de madera afilada */}
          <path
            d="M 0 0 L 4.5 -9 L 9 -4.5 L 0 0 Z"
            fill="#d97706"
            opacity="0.8"
          />
          {/* Mina de grafito / Punta de titanio en el origen (0,0) */}
          <polygon
            points="0,0 2,-4 4,-2"
            fill="#ffffff"
            className="drop-shadow-[0_0_6px_rgba(255,255,255,1)]"
          />
          {/* Casquillo metálico en la parte superior */}
          <path
            d="M 26 -33 L 29 -36 L 35 -30 L 32 -27 Z"
            fill="url(#pencil-metal-grad)"
            stroke="#cbd5e1"
            strokeWidth="0.6"
          />
          {/* Goma de borrar en el extremo */}
          <path
            d="M 29 -36 L 32 -39 C 34 -41, 38 -37, 36 -35 L 33 -32 Z"
            fill="#e11d48"
            opacity="0.85"
          />
        </g>
        <defs>
          <linearGradient id="pencil-body-grad" x1="0" y1="0" x2="35" y2="-35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="pencil-metal-grad" x1="26" y1="-33" x2="35" y2="-30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function KineticTitle({
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pencilPos, setPencilPos] = useState({ x: 40, y: 55, visible: false });
  const [progressWord1, setProgressWord1] = useState(0);
  const [progressWord2, setProgressWord2] = useState(0);
  const [progressFlourish, setProgressFlourish] = useState(0);
  const [isFinalGlow, setIsFinalGlow] = useState(false);

  const pathWord1Ref = useRef<SVGPathElement>(null);
  const pathWord2Ref = useRef<SVGPathElement>(null);
  const pathFlourishRef = useRef<SVGPathElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const runWritingAnimation = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setIsAnimating(true);
    setIsFinalGlow(false);
    setProgressWord1(0);
    setProgressWord2(0);
    setProgressFlourish(0);

    const path1 = pathWord1Ref.current;
    const path2 = pathWord2Ref.current;
    const pathF = pathFlourishRef.current;

    if (!path1 || !path2 || !pathF) return;

    const len1 = path1.getTotalLength();
    const len2 = path2.getTotalLength();
    const lenF = pathF.getTotalLength();

    const startPt = path1.getPointAtLength(0);
    setPencilPos({ x: startPt.x, y: startPt.y, visible: true });

    const startTime = performance.now();
    // Duraciones en milisegundos para una escritura natural y fluida
    const dur1 = 1250;
    const pause1 = 180;
    const dur2 = 1350;
    const pause2 = 120;
    const durF = 650;

    const totalDuration = dur1 + pause1 + dur2 + pause2 + durF;

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed < dur1) {
        // Escribiendo palabra 1: 'Portafolio'
        const p = Math.min(elapsed / dur1, 1);
        // Easing suave caligráfico
        const easedP = p * (2 - p);
        setProgressWord1(easedP);
        const pt = path1.getPointAtLength(easedP * len1);
        setPencilPos({ x: pt.x, y: pt.y, visible: true });
      } else if (elapsed < dur1 + pause1) {
        // Pausa y traslado del lápiz hacia la palabra 2
        setProgressWord1(1);
        const transP = (elapsed - dur1) / pause1;
        const ptEnd1 = path1.getPointAtLength(len1);
        const ptStart2 = path2.getPointAtLength(0);
        // Movimiento aéreo del lápiz levantado
        const curX = ptEnd1.x + (ptStart2.x - ptEnd1.x) * transP;
        const curY = ptEnd1.y + (ptStart2.y - ptEnd1.y) * transP - Math.sin(transP * Math.PI) * 15;
        setPencilPos({ x: curX, y: curY, visible: true });
      } else if (elapsed < dur1 + pause1 + dur2) {
        // Escribiendo palabra 2: 'Profesional'
        setProgressWord1(1);
        const p = Math.min((elapsed - (dur1 + pause1)) / dur2, 1);
        const easedP = p * (2 - p);
        setProgressWord2(easedP);
        const pt = path2.getPointAtLength(easedP * len2);
        setPencilPos({ x: pt.x, y: pt.y, visible: true });
      } else if (elapsed < dur1 + pause1 + dur2 + pause2) {
        // Pausa y traslado hacia la floritura / rúbrica final
        setProgressWord2(1);
        const transP = (elapsed - (dur1 + pause1 + dur2)) / pause2;
        const ptEnd2 = path2.getPointAtLength(len2);
        const ptStartF = pathF.getPointAtLength(0);
        const curX = ptEnd2.x + (ptStartF.x - ptEnd2.x) * transP;
        const curY = ptEnd2.y + (ptStartF.y - ptEnd2.y) * transP - Math.sin(transP * Math.PI) * 12;
        setPencilPos({ x: curX, y: curY, visible: true });
      } else if (elapsed < totalDuration) {
        // Trazando la floritura / subrayado de firma
        setProgressWord1(1);
        setProgressWord2(1);
        const p = Math.min((elapsed - (dur1 + pause1 + dur2 + pause2)) / durF, 1);
        const easedP = p * (2 - p);
        setProgressFlourish(easedP);
        const pt = pathF.getPointAtLength(easedP * lenF);
        setPencilPos({ x: pt.x, y: pt.y, visible: true });
      } else {
        // Firma terminada: el lápiz se retira
        setProgressWord1(1);
        setProgressWord2(1);
        setProgressFlourish(1);
        setPencilPos((prev) => ({ ...prev, visible: false }));
        setIsAnimating(false);
        setIsFinalGlow(true);

        setTimeout(() => {
          setIsFinalGlow(false);
          const glowInt = setInterval(() => {
            setIsFinalGlow((prev) => !prev);
          }, 1800);
          return () => clearInterval(glowInt);
        }, 1200);

        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgressWord1(1);
      setProgressWord2(1);
      setProgressFlourish(1);
      setPencilPos({ x: 0, y: 0, visible: false });
      return;
    }

    const t = setTimeout(() => {
      runWritingAnimation();
    }, 450);

    return () => {
      clearTimeout(t);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wider text-[var(--color-text-primary)] leading-[1.0] uppercase font-serif italic">
          Portafolio
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] text-[var(--color-text-primary)] leading-[1.0] font-serif italic">
          Profesional
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (!isAnimating) runWritingAnimation();
      }}
      className="relative w-full flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px] md:min-h-[620px] py-12 sm:py-16 select-none cursor-pointer overflow-visible"
      title="Haz clic para volver a escribir la firma"
    >
      {/* Resplandor ambiental de estudio */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/12 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow || isAnimating ? 'opacity-100 scale-105' : 'opacity-30 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* LIENZO SVG DE FIRMA EN CURSIVA REAL */}
      <div className="relative w-full max-w-4xl aspect-[800/400] flex items-center justify-center">
        <svg
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          <defs>
            {/* Gradiente de tinta plateada/blanca luminosa */}
            <linearGradient id="ink-gradient" x1="0" y1="0" x2="800" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Sombra sutil de la tinta sobre el lienzo */}
            <filter id="ink-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* PALABRA 1: "Portafolio" (Trazado Cursivo Caligráfico Continuo) */}
          <path
            ref={pathWord1Ref}
            d="
              M 80,140 C 75,70 125,50 145,95 C 160,130 110,185 85,210 M 115,85 C 105,120 100,165 95,210
              C 95,200 115,160 145,150 C 175,140 185,170 165,190 C 145,210 120,185 135,160 C 150,135 180,140 195,160
              C 205,175 200,195 215,195 C 230,195 235,170 240,150 C 245,130 255,145 260,165 C 265,185 270,195 285,195
              M 270,135 L 265,200 M 255,155 L 285,150
              C 285,175 300,195 320,195 C 340,195 350,170 335,150 C 320,130 295,155 310,185 C 325,205 345,195 355,160
              C 365,125 380,60 385,45 C 390,30 380,45 375,90 C 370,140 365,210 360,250 C 358,265 370,260 378,235 C 385,210 385,175 395,170
              C 410,165 425,150 445,150 C 465,150 475,175 455,195 C 435,215 415,190 430,165 C 445,140 475,155 490,140
              C 500,125 515,65 520,50 C 525,35 515,50 510,95 C 505,145 500,180 515,195
              C 525,195 535,170 540,155 C 545,175 550,195 565,195 M 542,130 A 2,2 0 1,1 542,131
              C 565,195 580,165 600,150 C 625,135 645,165 630,190 C 610,215 585,190 605,160 C 625,135 655,145 680,140
            "
            stroke="url(#ink-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 2400,
              strokeDashoffset: (1 - progressWord1) * 2400,
              filter: isFinalGlow ? 'drop-shadow(0 0 16px rgba(255,255,255,0.9))' : 'none',
              transition: isAnimating ? 'none' : 'filter 1000ms ease',
            }}
          />

          {/* PALABRA 2: "Profesional" (Trazado Cursivo Caligráfico Continuo) */}
          <path
            ref={pathWord2Ref}
            d="
              M 160,285 C 155,225 200,205 215,245 C 230,280 185,325 165,345 M 190,240 C 180,270 175,305 170,345
              C 170,335 185,300 210,290 C 230,280 240,305 225,325 C 210,345 190,325 205,305 C 220,285 245,290 255,305
              C 265,318 260,335 272,335 C 285,335 290,315 295,295 C 300,275 308,290 312,305 C 316,322 320,335 332,335
              C 340,305 352,245 356,230 C 360,218 352,230 348,265 C 344,305 340,355 336,385 C 334,395 344,392 350,372 C 356,352 356,325 364,320
              C 376,315 390,300 405,300 C 420,300 415,325 400,335 C 385,345 375,325 390,310 C 405,295 425,310 435,325
              C 445,340 455,335 465,310 C 475,285 460,280 452,295 C 445,310 452,335 470,335
              C 480,335 488,315 492,300 C 496,318 500,335 512,335 M 494,275 A 2,2 0 1,1 494,276
              C 512,335 525,310 540,300 C 560,288 575,312 562,332 C 545,350 528,332 542,308 C 556,285 580,295 598,290
              C 605,280 615,295 618,310 C 622,325 632,335 642,335 C 652,310 658,295 662,310 C 666,325 670,335 682,335
              C 682,320 692,300 705,300 C 720,300 725,318 715,332 C 700,345 685,330 695,312 C 705,295 720,302 730,290
              C 736,278 748,230 752,215 C 756,200 748,215 744,250 C 740,290 736,320 748,335
            "
            stroke="url(#ink-gradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 2800,
              strokeDashoffset: (1 - progressWord2) * 2800,
              filter: isFinalGlow ? 'drop-shadow(0 0 14px rgba(255,255,255,0.85))' : 'none',
              transition: isAnimating ? 'none' : 'filter 1000ms ease',
            }}
          />

          {/* FLORITURA / RÚBRICA FINAL ELEGANTE DE FIRMA */}
          <path
            ref={pathFlourishRef}
            d="
              M 748,335 C 710,375 560,390 400,385 C 240,380 90,360 40,340 C 20,330 30,310 65,315 C 110,320 200,350 350,365 C 500,380 680,360 760,330
            "
            stroke="url(#ink-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1200,
              strokeDashoffset: (1 - progressFlourish) * 1200,
              filter: isFinalGlow ? 'drop-shadow(0 0 12px rgba(255,255,255,0.75))' : 'none',
              transition: isAnimating ? 'none' : 'filter 1000ms ease',
            }}
          />
        </svg>

        {/* ✏️ LÁPIZ DINÁMICO QUE ESCRIBE EN TIEMPO REAL SIGUIENDO EL TRAZO */}
        <div
          className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none"
          style={{
            transform: `translate3d(${pencilPos.x}px, ${pencilPos.y}px, 0)`,
            opacity: pencilPos.visible ? 1 : 0,
            transition: 'opacity 250ms ease',
            // El origen de la punta del lápiz en (0,0) de su contenedor
            marginTop: '-48px',
            marginLeft: '-1px',
          }}
        >
          <DrawingPencilGraphic />
        </div>
      </div>
    </div>
  );
}

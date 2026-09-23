/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Firma Caligráfica de Autor con Trazado Vectorial en Tiempo Real".
 * Cada letra, curva y bucle de 'Portafolio Profesional' se dibuja progresivamente a velocidad
 * pausada y elegante, con un punto de luz viva en la punta del trazo y floritura de firma final.
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
  const [progressWord1, setProgressWord1] = useState(0);
  const [progressWord2, setProgressWord2] = useState(0);
  const [progressFlourish, setProgressFlourish] = useState(0);
  const [tracerPoint, setTracerPoint] = useState<{ x: number; y: number; visible: boolean }>({
    x: 75,
    y: 130,
    visible: false,
  });
  const [isFinalGlow, setIsFinalGlow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  const runSignatureDrawing = () => {
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
    setTracerPoint({ x: startPt.x, y: startPt.y, visible: true });

    const startTime = performance.now();
    // Tiempos más pausados para apreciar el dibujo de cada bucle y letra
    const dur1 = 2200;    // 'Portafolio'
    const pause1 = 300;   // Traslado aéreo suave
    const dur2 = 2400;    // 'Profesional'
    const pause2 = 200;   // Pausa antes de la rúbrica
    const durF = 1100;    // Floritura / Subrayado
    const totalDuration = dur1 + pause1 + dur2 + pause2 + durF;

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed < dur1) {
        // Trazando 'Portafolio'
        const p = Math.min(elapsed / dur1, 1);
        const eased = p * (2 - p);
        setProgressWord1(eased);
        const pt = path1.getPointAtLength(eased * len1);
        setTracerPoint({ x: pt.x, y: pt.y, visible: true });
      } else if (elapsed < dur1 + pause1) {
        // Traslado del trazo hacia la línea 2
        setProgressWord1(1);
        const transP = (elapsed - dur1) / pause1;
        const ptEnd1 = path1.getPointAtLength(len1);
        const ptStart2 = path2.getPointAtLength(0);
        const curX = ptEnd1.x + (ptStart2.x - ptEnd1.x) * transP;
        const curY = ptEnd1.y + (ptStart2.y - ptEnd1.y) * transP - Math.sin(transP * Math.PI) * 18;
        setTracerPoint({ x: curX, y: curY, visible: true });
      } else if (elapsed < dur1 + pause1 + dur2) {
        // Trazando 'Profesional'
        setProgressWord1(1);
        const p = Math.min((elapsed - (dur1 + pause1)) / dur2, 1);
        const eased = p * (2 - p);
        setProgressWord2(eased);
        const pt = path2.getPointAtLength(eased * len2);
        setTracerPoint({ x: pt.x, y: pt.y, visible: true });
      } else if (elapsed < dur1 + pause1 + dur2 + pause2) {
        // Traslado hacia la floritura
        setProgressWord2(1);
        const transP = (elapsed - (dur1 + pause1 + dur2)) / pause2;
        const ptEnd2 = path2.getPointAtLength(len2);
        const ptStartF = pathF.getPointAtLength(0);
        const curX = ptEnd2.x + (ptStartF.x - ptEnd2.x) * transP;
        const curY = ptEnd2.y + (ptStartF.y - ptEnd2.y) * transP - Math.sin(transP * Math.PI) * 14;
        setTracerPoint({ x: curX, y: curY, visible: true });
      } else if (elapsed < totalDuration) {
        // Trazando la floritura
        setProgressWord1(1);
        setProgressWord2(1);
        const p = Math.min((elapsed - (dur1 + pause1 + dur2 + pause2)) / durF, 1);
        const eased = p * (2 - p);
        setProgressFlourish(eased);
        const pt = pathF.getPointAtLength(eased * lenF);
        setTracerPoint({ x: pt.x, y: pt.y, visible: true });
      } else {
        // Asentamiento completo
        setProgressWord1(1);
        setProgressWord2(1);
        setProgressFlourish(1);
        setTracerPoint((prev) => ({ ...prev, visible: false }));
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
      setTracerPoint({ x: 0, y: 0, visible: false });
      return;
    }

    const t = setTimeout(() => {
      runSignatureDrawing();
    }, 450);

    return () => {
      clearTimeout(t);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 text-center select-none ${className}`}>
        <span className="text-6xl sm:text-8xl md:text-9xl text-white font-serif italic tracking-wide">
          Portafolio
        </span>
        <span className="text-5xl sm:text-7xl md:text-8xl text-white/95 font-serif italic tracking-wider">
          Profesional
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (!isAnimating) runSignatureDrawing();
      }}
      className="relative w-full flex flex-col items-center justify-center min-h-[520px] sm:min-h-[600px] md:min-h-[680px] py-10 sm:py-14 select-none cursor-pointer overflow-visible"
      title="Haz clic para volver a trazar la firma"
    >
      {/* Resplandor ambiental de estudio cinemático */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/15 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow || isAnimating ? 'opacity-100 scale-105' : 'opacity-30 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* LIENZO DE FIRMA VECTORIAL CALIGRÁFICA A GRAN ESCALA */}
      <div className="relative w-full max-w-5xl aspect-[900/440] flex items-center justify-center">
        <svg
          viewBox="0 0 900 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_6px_28px_rgba(0,0,0,0.95)]"
        >
          <defs>
            <linearGradient id="signature-ink" x1="0" y1="0" x2="900" y2="440" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f8fafc" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* PALABRA 1: "Portafolio" (Trazos Vectoriales de Caligrafía Fluida y Legible) */}
          <path
            ref={pathWord1Ref}
            d="
              M 85,155 C 75,95 125,75 145,115 C 158,145 115,190 92,210 M 118,105 C 108,140 102,175 98,210
              C 100,195 120,165 148,155 C 172,145 182,170 165,188 C 148,206 128,185 142,164 C 155,142 180,146 195,164
              C 205,178 202,192 215,192 C 228,192 232,172 238,154 C 242,136 250,148 255,166 C 260,184 266,192 278,192
              M 268,138 L 264,196 M 254,158 L 282,154
              C 282,174 296,192 315,192 C 332,192 342,172 328,154 C 314,136 292,156 306,182 C 318,200 336,192 346,164
              C 356,132 370,75 375,60 C 380,45 372,58 368,98 C 364,142 360,205 356,242 C 354,256 364,252 372,230 C 378,208 378,176 388,172
              C 400,168 414,154 432,154 C 450,154 458,175 442,192 C 425,208 408,188 420,166 C 434,144 460,156 474,144
              C 482,130 496,76 500,62 C 504,48 496,62 492,102 C 488,144 484,178 496,192
              C 505,192 514,170 518,156 C 522,174 526,192 538,192 M 520,134 A 2.5,2.5 0 1,1 520,135
              C 538,192 552,166 570,154 C 592,140 610,166 596,188 C 578,210 556,188 574,162 C 592,140 618,148 642,144
            "
            stroke="url(#signature-ink)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 2600,
              strokeDashoffset: (1 - progressWord1) * 2600,
              filter: isFinalGlow ? 'drop-shadow(0 0 18px rgba(255,255,255,0.95))' : 'none',
              transition: isAnimating ? 'none' : 'filter 1000ms ease',
            }}
          />

          {/* PALABRA 2: "Profesional" (Trazos Vectoriales de Caligrafía Fluida y Legible) */}
          <path
            ref={pathWord2Ref}
            d="
              M 165,275 C 158,218 200,200 215,236 C 228,268 188,308 170,326 M 192,230 C 182,258 178,290 174,326
              C 174,316 188,284 210,275 C 228,266 238,288 224,306 C 210,324 192,306 205,288 C 218,270 240,275 250,288
              C 258,300 254,316 265,316 C 276,316 280,298 285,280 C 290,262 296,275 300,288 C 304,304 308,316 318,316
              C 325,288 335,234 338,220 C 342,208 335,220 332,252 C 328,288 325,334 322,360 C 320,370 328,366 334,348 C 340,330 340,305 348,300
              C 358,296 370,282 384,282 C 398,282 392,306 378,315 C 365,324 356,306 370,292 C 384,278 402,292 410,305
              C 418,318 428,314 436,292 C 445,268 432,264 425,278 C 418,292 425,316 440,316
              C 450,316 456,298 460,284 C 464,300 468,316 478,316 M 462,260 A 2.5,2.5 0 1,1 462,261
              C 478,316 490,292 504,282 C 522,272 535,294 524,310 C 508,326 494,310 506,290 C 518,270 540,278 556,274
              C 562,265 570,278 573,292 C 576,306 585,316 594,316 C 602,294 608,280 612,294 C 615,306 618,316 628,316
              C 628,302 636,284 648,284 C 662,284 666,300 658,312 C 644,324 630,310 640,294 C 650,278 662,285 672,274
              C 676,262 686,218 690,204 C 694,190 686,204 682,236 C 678,272 675,300 686,314
            "
            stroke="url(#signature-ink)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: (1 - progressWord2) * 3000,
              filter: isFinalGlow ? 'drop-shadow(0 0 16px rgba(255,255,255,0.9))' : 'none',
              transition: isAnimating ? 'none' : 'filter 1000ms ease',
            }}
          />

          {/* FLORITURA / RÚBRICA FINAL ELEGANTE DE FIRMA */}
          <path
            ref={pathFlourishRef}
            d="
              M 686,314 C 640,360 480,380 320,375 C 170,370 50,350 20,332 C 8,322 24,308 60,314 C 110,320 220,350 380,364 C 540,378 720,356 800,324
            "
            stroke="url(#signature-ink)"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1400,
              strokeDashoffset: (1 - progressFlourish) * 1400,
              filter: isFinalGlow ? 'drop-shadow(0 0 14px rgba(255,255,255,0.85))' : 'none',
              transition: isAnimating ? 'none' : 'filter 1000ms ease',
            }}
          />

          {/* CHISPA TRAZADORA DE LUZ QUE GUÍA LA ESCRITURA EN TIEMPO REAL */}
          {tracerPoint.visible && (
            <g transform={`translate(${tracerPoint.x}, ${tracerPoint.y})`}>
              {/* Halo de luz exterior */}
              <circle r="9" fill="#ffffff" opacity="0.4" className="blur-[2px]" />
              {/* Núcleo de luz blanca */}
              <circle r="4.5" fill="#ffffff" className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
              {/* Partícula diminuta de brillo */}
              <circle r="1.5" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

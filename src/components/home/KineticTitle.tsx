/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Llenado Líquido Hidrodinámico de Moldes Tipográficos".
 * Cada letra actúa como un molde hermético con límites físicos infranqueables.
 * El metal líquido blanco fluye con física de ondas orgánicas, tensión superficial,
 * menisco brillante y lóbulos fluidos confinados 100% dentro del trazo tipográfico.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Renderizador de fluido con física de ondas y menisco para cada letra individual.
 */
function FluidLetterCanvas({
  char,
  progress,
}: {
  char: string;
  progress: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.hypot(cx, cy) * 1.25;
    const baseRadius = progress * maxRadius;
    const time = performance.now() * 0.0035;

    ctx.clearRect(0, 0, w, h);

    // 1. DIBUJAR LA SILUETA DE LA LETRA COMO MÁSCARA RÍGIDA
    ctx.save();
    const computed = window.getComputedStyle(parent);
    ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, cx, cy);

    // 2. CONFINAR EL LÍQUIDO 100% AL INTERIOR DE LA TIPOGRAFÍA (CERO DERRAMES)
    ctx.globalCompositeOperation = 'source-in';

    // 3. CUERPO DE FLUIDO CON LÓBULOS ONDULANTES Y DINÁMICA DE TENSIÓN SUPERFICIAL
    const numPoints = 36;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // Ondulación fluida de múltiples armónicos (sensación de masa líquida viscosa)
      const wobble = 0.14 * Math.sin(angle * 3 + time * 4.2)
                   + 0.09 * Math.cos(angle * 5 - time * 3.1)
                   + 0.05 * Math.sin(angle * 7 + time * 5.0);
      const r = Math.max(0, baseRadius * (1 + wobble));
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Gradiente metálico líquido profundo con reflejos
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, baseRadius * 1.15));
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.70, '#ffffff');
    grad.addColorStop(0.88, 'rgba(248, 250, 252, 0.98)');
    grad.addColorStop(0.96, 'rgba(226, 232, 240, 0.92)');
    grad.addColorStop(1, 'rgba(203, 213, 225, 0.6)');
    ctx.fillStyle = grad;
    ctx.fill();

    // 4. CRESTA DE ONDA / MENISCO LÍQUIDO BRILLANTE (SURFACE TENSION WAVE)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.stroke();

    // 5. ONDA CONCÉNTRICA SECUNDARIA (RIPPLE DE PROPAGACIÓN INTERNA)
    if (baseRadius > 14) {
      const rippleRadius = baseRadius * 0.58;
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const wobble = 0.11 * Math.sin(angle * 4 + time * 4.5);
        const r = Math.max(0, rippleRadius * (1 + wobble));
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
    }

    ctx.restore();
  }, [char, progress]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fillProgress, setFillProgress] = useState<{ [key: string]: number }>({});
  const [filledLetters, setFilledLetters] = useState<{ [key: string]: boolean }>({});
  const [isAllSettled, setIsAllSettled] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  // Lista de todas las letras con identificadores únicos
  const letterItems = useMemo(() => {
    const list: { wordIdx: number; charIdx: number; char: string; key: string; globalIdx: number }[] = [];
    let count = 0;
    words.forEach((word, wordIdx) => {
      word.split('').forEach((char, charIdx) => {
        list.push({
          wordIdx,
          charIdx,
          char,
          key: `${wordIdx}-${charIdx}-${char}`,
          globalIdx: count++,
        });
      });
    });
    return list;
  }, [words]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const runFluidMoldFillingSequence = () => {
    setFillProgress({});
    setFilledLetters({});
    setIsAllSettled(false);

    // Orden aleatorio para el llenado de moldes (Fisher-Yates)
    const indices = letterItems.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const initialDelay = 500; // Pausa inicial para contemplar los moldes vacíos
    const letterFillDuration = 3200; // Llenado pausado, gradual y fluido (3.2s)
    const staggerDelay = 160; // Desfase rítmico pausado entre letras

    let completedCount = 0;

    letterItems.forEach((item, itemIdx) => {
      const orderPosition = indices.indexOf(itemIdx);
      const startAt = initialDelay + orderPosition * staggerDelay;

      setTimeout(() => {
        const startTime = performance.now();

        const updateFluidBloom = (now: number) => {
          const elapsed = now - startTime;
          const rawProgress = Math.min(elapsed / letterFillDuration, 1);
          
          // Easing viscoso: llenado fluido constante que desacelera al colmar los extremos
          const easedProgress = 1 - Math.pow(1 - rawProgress, 2.2);
          
          setFillProgress((prev) => ({ ...prev, [item.key]: easedProgress }));

          if (rawProgress < 1) {
            requestAnimationFrame(updateFluidBloom);
          } else {
            // Molde 100% colmado
            setFilledLetters((prev) => ({ ...prev, [item.key]: true }));
            completedCount++;

            if (completedCount === letterItems.length) {
              // Cierre definitivo de animación (0% CPU / GPU en reposo)
              setIsAllSettled(true);
            }
          }
        };

        requestAnimationFrame(updateFluidBloom);
      }, startAt);
    });
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      const fullProgress: { [key: string]: number } = {};
      const fullFilled: { [key: string]: boolean } = {};
      letterItems.forEach((item) => {
        fullProgress[item.key] = 1;
        fullFilled[item.key] = true;
      });
      setFillProgress(fullProgress);
      setFilledLetters(fullFilled);
      setIsAllSettled(true);
      return;
    }

    const timer = setTimeout(() => {
      runFluidMoldFillingSequence();
    }, 300);

    return () => clearTimeout(timer);
  }, [letterItems, prefersReducedMotion]);

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
    <div className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[620px] py-12 sm:py-16 select-none overflow-visible cursor-default">
      {/* Resplandor ambiental de estudio ultra suave */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-opacity duration-1000 ease-out ${
          isAllSettled ? 'opacity-40' : 'opacity-15'
        }`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4 gap-y-2 sm:gap-y-3 md:gap-y-4">
        {words.map((word, wordIdx) => {
          const isFirstWord = wordIdx === 0;

          // Jerarquía tipográfica monumental
          const fontClasses = isFirstWord
            ? 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-wider'
            : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] sm:tracking-[0.28em] md:tracking-[0.32em]';

          const slotMinWidth = isFirstWord ? '0.74em' : '0.82em';

          return (
            <div
              key={`word-row-${wordIdx}`}
              className={`inline-flex items-center justify-center relative ${fontClasses} ${
                isFirstWord ? 'gap-x-1 sm:gap-x-2 md:gap-x-3' : 'gap-x-1 sm:gap-x-1.5 md:gap-x-2.5'
              }`}
            >
              {word.split('').map((char, charIdx) => {
                const key = `${wordIdx}-${charIdx}-${char}`;
                const currentFill = fillProgress[key] ?? 0;
                const isComplete = filledLetters[key] || currentFill >= 1;
                const isActivelyFilling = currentFill > 0 && currentFill < 1;

                return (
                  <div
                    key={`slot-${key}`}
                    className="relative inline-flex items-center justify-center"
                    style={{ minWidth: slotMinWidth }}
                  >
                    {/* 🔲 CAPA 1: PAREDES Y SILUETA DEL MOLDE (LÍMITES FÍSICOS ESTRICTOS) */}
                    <span
                      className="select-none pointer-events-none uppercase leading-[1.0] transition-colors duration-500"
                      style={{
                        WebkitTextStroke: isComplete
                          ? '1px rgba(255, 255, 255, 0.35)'
                          : isActivelyFilling
                          ? '1.2px rgba(255, 255, 255, 0.7)'
                          : '1.2px rgba(255, 255, 255, 0.22)',
                        color: 'transparent',
                      }}
                      aria-hidden="true"
                    >
                      {char}
                    </span>

                    {/* 🌊 CAPA 2: SIMULADOR HIDRODINÁMICO DE FLUIDO / LETRA SÓLIDA */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                      {isComplete ? (
                        <span className="inline-block uppercase leading-[1.0] text-white">
                          {char}
                        </span>
                      ) : isActivelyFilling ? (
                        <FluidLetterCanvas
                          char={char}
                          progress={currentFill}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Llenado de Agua Líquida en Moldes Tipográficos".
 * La silueta de cada letra actúa como un molde contenedor hermético transparente.
 * El agua blanca entra y sube de nivel con oleaje físico, menisco y tensión superficial,
 * llenando progresivamente cada cavidad desde la base hasta el tope del molde.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/**
 * Renderizador de agua líquida con física de nivel ascendente, oleaje y menisco.
 */
function WaterLetterCanvas({
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

    const time = performance.now() * 0.005;

    ctx.clearRect(0, 0, w, h);

    // 1. MÁSCARA: DIBUJAR LA SILUETA DEL MOLDE DE LA LETRA
    ctx.save();
    const computed = window.getComputedStyle(parent);
    ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, w / 2, h / 2);

    // 2. CONFINAR EL AGUA ESTRICTAMENTE DENTRO DE LAS PAREDES DEL MOLDE
    ctx.globalCompositeOperation = 'source-in';

    // 3. FÍSICA DE NIVEL DE AGUA Y OLEAJE
    // El nivel sube desde h (fondo) hasta 0 (tope) a medida que progress va de 0 a 1
    const waterLevelY = h - progress * h;
    
    // Amplitud de las olas: activa durante el llenado, se apacigua suavemente al llegar al 100%
    const waveAmp = Math.sin(Math.min(progress, 1) * Math.PI) * (h * 0.045) * Math.max(0, 1 - Math.pow(progress, 3));

    // A) CAPA DE AGUA DE FONDO (PROFUNDIDAD / TRANSLUCIDEZ DEL OLEAJE)
    if (progress > 0 && progress < 1) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const waveY = waterLevelY + waveAmp * 0.8 * Math.sin(x * 0.15 + time * 4.5 + Math.PI / 3);
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
    }

    // B) CUERPO PRINCIPAL DE AGUA BLANCA (VOLUMEN SÓLIDO CON ONDULACIÓN PRINCIPAL)
    ctx.beginPath();
    ctx.moveTo(0, h);
    const wavePoints: { x: number; y: number }[] = [];
    for (let x = 0; x <= w; x += 2) {
      const primaryWave = Math.sin(x * 0.12 + time * 6.0) * 0.7;
      const secondaryWave = Math.cos(x * 0.22 - time * 3.8) * 0.3;
      const waveY = waterLevelY + waveAmp * (primaryWave + secondaryWave);
      wavePoints.push({ x, y: waveY });
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();

    // Relleno de agua blanca pura
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // C) CRESTA / MENISCO LÍQUIDO SUPERFICIAL (SURFACE TENSION GLEAM)
    if (wavePoints.length > 0 && progress < 0.98) {
      ctx.beginPath();
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      for (let i = 1; i < wavePoints.length; i++) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
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

    const initialDelay = 450; // Pausa inicial para contemplar los moldes vacíos
    const letterFillDuration = 2400; // Duración de subida del agua por molde (2.4s)
    const staggerDelay = 140; // Desfase rítmico entre letras

    let completedCount = 0;

    letterItems.forEach((item, itemIdx) => {
      const orderPosition = indices.indexOf(itemIdx);
      const startAt = initialDelay + orderPosition * staggerDelay;

      setTimeout(() => {
        const startTime = performance.now();

        const updateWaterLevel = (now: number) => {
          const elapsed = now - startTime;
          const rawProgress = Math.min(elapsed / letterFillDuration, 1);
          
          // Easing suave y constante de llenado con desaceleración final
          const easedProgress = rawProgress < 0.8
            ? (rawProgress / 0.8) * 0.85
            : 0.85 + (1 - Math.pow(1 - (rawProgress - 0.8) / 0.2, 2)) * 0.15;
          
          setFillProgress((prev) => ({ ...prev, [item.key]: Math.min(easedProgress, 1) }));

          if (rawProgress < 1) {
            requestAnimationFrame(updateWaterLevel);
          } else {
            // Molde 100% lleno hasta el tope
            setFilledLetters((prev) => ({ ...prev, [item.key]: true }));
            completedCount++;

            if (completedCount === letterItems.length) {
              // Cierre definitivo de animación (0% CPU / GPU en reposo)
              setIsAllSettled(true);
            }
          }
        };

        requestAnimationFrame(updateWaterLevel);
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

                    {/* 🌊 CAPA 2: AGUA LÍQUIDA SUBIENDO CON OLEAJE / LETRA SÓLIDA AL COMPLETAR */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                      {isComplete ? (
                        <span className="inline-block uppercase leading-[1.0] text-white">
                          {char}
                        </span>
                      ) : isActivelyFilling ? (
                        <WaterLetterCanvas
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

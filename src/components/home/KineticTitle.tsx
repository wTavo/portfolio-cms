/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Estelas de Cometas Reveladoras".
 * Cometas de luz blanca brillante cruzan el espacio sobre el fondo existente.
 * Conforme la estela de cada cometa barre las letras, el molde hueco se disuelve
 * y el título se revela en blanco sólido monumental y permanente.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface Comet {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
  headRadius: number;
  tailLength: number;
  color: string;
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<{ [key: string]: number }>({});
  const [isAllSettled, setIsAllSettled] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  // Identificadores de letras con metadatos
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

  useEffect(() => {
    if (prefersReducedMotion) {
      const allDone: { [key: string]: number } = {};
      letterItems.forEach((item) => {
        allDone[item.key] = 1;
      });
      setRevealedLetters(allDone);
      setIsAllSettled(true);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isCancelled = false;

    const updateSizeAndRun = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);

      // Calcular posiciones de cada letra en coordenadas del contenedor
      const letterPositions: { [key: string]: { x: number; y: number; w: number; h: number } } = {};
      letterItems.forEach((item) => {
        const el = document.getElementById(`kinetic-char-${item.key}`);
        if (el) {
          const lRect = el.getBoundingClientRect();
          letterPositions[item.key] = {
            x: lRect.left - rect.left + lRect.width / 2,
            y: lRect.top - rect.top + lRect.height / 2,
            w: lRect.width,
            h: lRect.height,
          };
        }
      });

      // Configuración de los cometas cósmicos
      const comets: Comet[] = [
        // Cometa 1: Cruza la palabra superior PORTAFOLIO de izquierda a derecha
        {
          startX: -150,
          startY: h * 0.15,
          endX: w + 200,
          endY: h * 0.45,
          startTime: 300,
          duration: 1800,
          headRadius: 7,
          tailLength: 380,
          color: '#ffffff',
        },
        // Cometa 2: Cruza la palabra inferior PROFESIONAL de izquierda-abajo a derecha
        {
          startX: -180,
          startY: h * 0.85,
          endX: w + 220,
          endY: h * 0.65,
          startTime: 750,
          duration: 1900,
          headRadius: 6,
          tailLength: 350,
          color: '#ffffff',
        },
        // Cometa 3: Cometa rápido de aceleración central que barre los centros
        {
          startX: -100,
          startY: h * 0.48,
          endX: w + 250,
          endY: h * 0.52,
          startTime: 1200,
          duration: 1600,
          headRadius: 5,
          tailLength: 420,
          color: '#ffffff',
        },
      ];

      const startTimestamp = performance.now();
      const currentRevealed: { [key: string]: number } = {};
      letterItems.forEach((item) => {
        currentRevealed[item.key] = 0;
      });

      const loop = (now: number) => {
        if (isCancelled) return;
        const elapsed = now - startTimestamp;

        ctx.clearRect(0, 0, w, h);

        let anyCometActive = false;

        comets.forEach((comet) => {
          if (elapsed >= comet.startTime) {
            const cometElapsed = elapsed - comet.startTime;
            const progress = Math.min(cometElapsed / comet.duration, 1);

            if (progress < 1) {
              anyCometActive = true;
            }

            // Interpolación con aceleración elíptica suave
            const easedProgress = Math.pow(progress, 1.2);
            const currentHeadX = comet.startX + (comet.endX - comet.startX) * easedProgress;
            const currentHeadY = comet.startY + (comet.endY - comet.startY) * easedProgress;

            // Dirección del vector de movimiento
            const dx = comet.endX - comet.startX;
            const dy = comet.endY - comet.startY;
            const angle = Math.atan2(dy, dx);

            // Cola del cometa
            const tailX = currentHeadX - Math.cos(angle) * comet.tailLength;
            const tailY = currentHeadY - Math.sin(angle) * comet.tailLength;

            // DIBUJAR ESTELA DEL COMETA
            if (progress > 0 && progress < 1) {
              ctx.save();
              const grad = ctx.createLinearGradient(currentHeadX, currentHeadY, tailX, tailY);
              grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
              grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.85)');
              grad.addColorStop(0.5, 'rgba(226, 232, 240, 0.4)');
              grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.beginPath();
              // Cabeza ensanchada que se afina hacia la cola
              const normalAngle = angle + Math.PI / 2;
              const headSpread = comet.headRadius * 1.6;
              ctx.moveTo(currentHeadX + Math.cos(normalAngle) * headSpread, currentHeadY + Math.sin(normalAngle) * headSpread);
              ctx.lineTo(tailX, tailY);
              ctx.lineTo(currentHeadX - Math.cos(normalAngle) * headSpread, currentHeadY - Math.sin(normalAngle) * headSpread);
              ctx.closePath();
              ctx.fillStyle = grad;
              ctx.fill();

              // NÚCLEO BRILLANTE DE LA CABEZA DEL COMETA
              ctx.beginPath();
              ctx.arc(currentHeadX, currentHeadY, comet.headRadius, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = 'rgba(255, 255, 255, 1)';
              ctx.shadowBlur = 18;
              ctx.fill();

              // Resplandor externo suave
              ctx.beginPath();
              ctx.arc(currentHeadX, currentHeadY, comet.headRadius * 2.5, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.fill();

              ctx.restore();
            }

            // REVELADO DE LETRAS: Conforme la estela o cabeza pasa sobre cada letra
            letterItems.forEach((item) => {
              const pos = letterPositions[item.key];
              if (!pos) return;

              // Si la cabeza del cometa ya pasó por delante de la posición X de la letra
              if (currentHeadX >= pos.x - 30) {
                // Cálculo de revelado progresivo basado en la estela
                const distPast = currentHeadX - pos.x;
                const revealAmt = Math.min(1, Math.max(0, distPast / 90));
                if (revealAmt > (currentRevealed[item.key] ?? 0)) {
                  currentRevealed[item.key] = revealAmt;
                }
              }
            });
          }
        });

        setRevealedLetters({ ...currentRevealed });

        // Si todos los cometas terminaron y todas las letras están reveladas
        const allLettersDone = letterItems.every((item) => (currentRevealed[item.key] ?? 0) >= 1);

        if (!anyCometActive && allLettersDone && elapsed > 2800) {
          ctx.clearRect(0, 0, w, h);
          setIsAllSettled(true);
        } else {
          animId = requestAnimationFrame(loop);
        }
      };

      animId = requestAnimationFrame(loop);
    };

    const timer = setTimeout(updateSizeAndRun, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (animId) cancelAnimationFrame(animId);
    };
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
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[620px] py-12 sm:py-16 select-none overflow-visible cursor-default"
    >
      {/* Resplandor ambiental de estudio ultra suave */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-opacity duration-1000 ease-out ${
          isAllSettled ? 'opacity-40' : 'opacity-15'
        }`}
        aria-hidden="true"
      />

      {/* Capa de renderizado de los cometas y sus estelas luminosas */}
      {!isAllSettled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />
      )}

      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4 gap-y-2 sm:gap-y-3 md:gap-y-4 z-10">
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
                const reveal = revealedLetters[key] ?? 0;
                const isSolid = isAllSettled || reveal >= 1;

                return (
                  <div
                    id={`kinetic-char-${key}`}
                    key={`slot-${key}`}
                    className="relative inline-flex items-center justify-center"
                    style={{ minWidth: slotMinWidth }}
                  >
                    {/* 🔲 CAPA 1: MOLDE HUECO (SE DESVANECE CONFORME PASA LA ESTELA) */}
                    {!isSolid && (
                      <span
                        className="select-none pointer-events-none uppercase leading-[1.0] transition-opacity duration-300"
                        style={{
                          opacity: Math.max(0, 1 - reveal * 1.2),
                          WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.24)',
                          color: 'transparent',
                        }}
                        aria-hidden="true"
                      >
                        {char}
                      </span>
                    )}

                    {/* ✨ CAPA 2: LETRA BLANCA REVELADA (SE ENCIENDE Y QUEDA SÓLIDA TRAS LA ESTELA) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-300"
                      style={{
                        opacity: isSolid ? 1 : reveal,
                      }}
                    >
                      <span
                        className={`inline-block uppercase leading-[1.0] text-white transition-all ${
                          !isSolid && reveal > 0 && reveal < 1
                            ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                            : ''
                        }`}
                      >
                        {char}
                      </span>
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

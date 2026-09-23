/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cometas Cósmicos con Iluminación Fosforescente de Moldes".
 * Cometas brillantes con estela de polvo estelar cruzan la pantalla desde los bordes.
 * Al pasar sobre cada molde tipográfico, la energía del cometa enciende la letra en blanco brillante,
 * desvaneciéndose suavemente tras el paso de la estela en ciclos continuos y elegantes.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
}

interface ActiveComet {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  progress: number;
  headRadius: number;
  tailLength: number;
  particles: Particle[];
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [letterBrightness, setLetterBrightness] = useState<{ [key: string]: number }>({});

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
      const allBright: { [key: string]: number } = {};
      letterItems.forEach((item) => {
        allBright[item.key] = 1;
      });
      setLetterBrightness(allBright);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    let cometCounter = 0;

    let width = 0;
    let height = 0;

    const activeComets: ActiveComet[] = [];
    const currentBrightness: { [key: string]: number } = {};
    letterItems.forEach((item) => {
      currentBrightness[item.key] = 0;
    });

    const letterPositions: { [key: string]: { x: number; y: number } } = {};

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.scale(dpr, dpr);

      // Calcular posiciones de cada letra
      letterItems.forEach((item) => {
        const el = document.getElementById(`kinetic-char-${item.key}`);
        if (el) {
          const lRect = el.getBoundingClientRect();
          letterPositions[item.key] = {
            x: lRect.left - rect.left + lRect.width / 2,
            y: lRect.top - rect.top + lRect.height / 2,
          };
        }
      });
    };

    resize();
    window.addEventListener('resize', resize);

    // Generador de cometas desde los bordes de la pantalla
    const spawnComet = (type: number) => {
      if (width === 0 || height === 0) return;

      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;
      let speed = 0.007;

      if (type === 0) {
        // Diagonal superior: Cruza PORTAFOLIO de izquierda a derecha
        startX = -180;
        startY = height * 0.12 + (Math.random() * 40 - 20);
        endX = width + 220;
        endY = height * 0.45 + (Math.random() * 50 - 25);
        speed = 0.0075 + Math.random() * 0.002;
      } else if (type === 1) {
        // Diagonal inferior: Cruza PROFESIONAL
        startX = -200;
        startY = height * 0.85 + (Math.random() * 40 - 20);
        endX = width + 240;
        endY = height * 0.58 + (Math.random() * 40 - 20);
        speed = 0.0065 + Math.random() * 0.002;
      } else {
        // Diagonal rápida central en ángulo pronunciado
        startX = width * 0.15 + (Math.random() * 100 - 50);
        startY = -150;
        endX = width * 0.85 + (Math.random() * 100 - 50);
        endY = height + 180;
        speed = 0.009 + Math.random() * 0.0025;
      }

      activeComets.push({
        id: cometCounter++,
        x: startX,
        y: startY,
        startX,
        startY,
        endX,
        endY,
        speed,
        progress: 0,
        headRadius: 7 + Math.random() * 3,
        tailLength: 360 + Math.random() * 120,
        particles: [],
      });
    };

    // Spawn inicial de cometas
    spawnComet(0);
    setTimeout(() => spawnComet(1), 700);
    setTimeout(() => spawnComet(2), 1600);

    // Ciclo recurrente de cometas cósmicos
    const interval = setInterval(() => {
      if (activeComets.length < 3) {
        spawnComet(Math.floor(Math.random() * 3));
      }
    }, 2400);

    // Bucle de animación (60/120fps)
    const renderLoop = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      // Decaimiento fosforescente suave de todas las letras (fade out gradual)
      letterItems.forEach((item) => {
        currentBrightness[item.key] = Math.max(0, (currentBrightness[item.key] ?? 0) * 0.94);
      });

      // Actualizar y renderizar cada cometa
      for (let c = activeComets.length - 1; c >= 0; c--) {
        const comet = activeComets[c];
        comet.progress += comet.speed;

        // Posición actual de la cabeza del cometa
        const dx = comet.endX - comet.startX;
        const dy = comet.endY - comet.startY;
        comet.x = comet.startX + dx * comet.progress;
        comet.y = comet.startY + dy * comet.progress;

        const angle = Math.atan2(dy, dx);
        const tailX = comet.x - Math.cos(angle) * comet.tailLength;
        const tailY = comet.y - Math.sin(angle) * comet.tailLength;

        // Emitir partículas de polvo estelar
        if (Math.random() < 0.65) {
          const spread = (Math.random() - 0.5) * 14;
          const pAngle = angle + Math.PI + (Math.random() - 0.5) * 0.4;
          const pSpeed = 1.2 + Math.random() * 2.5;
          comet.particles.push({
            x: comet.x + Math.sin(angle) * spread,
            y: comet.y - Math.cos(angle) * spread,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            alpha: 1,
            size: 1.5 + Math.random() * 2.2,
            life: 0,
            maxLife: 20 + Math.random() * 25,
          });
        }

        // DIBUJAR ESTELA LUMINOSA DEL COMETA
        ctx.save();
        const grad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.12, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.45, 'rgba(226, 232, 240, 0.45)');
        grad.addColorStop(0.8, 'rgba(148, 163, 184, 0.15)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        const normal = angle + Math.PI / 2;
        const spreadHead = comet.headRadius * 1.8;
        ctx.moveTo(comet.x + Math.cos(normal) * spreadHead, comet.y + Math.sin(normal) * spreadHead);
        ctx.lineTo(tailX, tailY);
        ctx.lineTo(comet.x - Math.cos(normal) * spreadHead, comet.y - Math.sin(normal) * spreadHead);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // RENDERIZAR POLVO ESTELAR / CHISPAS
        for (let p = comet.particles.length - 1; p >= 0; p--) {
          const pt = comet.particles[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * pt.alpha, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha * 0.9})`;
          ctx.fill();

          if (pt.life >= pt.maxLife) {
            comet.particles.splice(p, 1);
          }
        }

        // NÚCLEO INCANDESCENTE BRILLANTE DE LA CABEZA DEL COMETA
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 22;
        ctx.fill();

        // HALO EXTERIOR DE LUZ CÓSMICA
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.headRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.fill();

        ctx.restore();

        // FÍSICA DE ILUMINACIÓN DE MOLDES: Encendido al paso de la cabeza/estela
        const beamRadius = 140;
        letterItems.forEach((item) => {
          const pos = letterPositions[item.key];
          if (!pos) return;

          // Distancia de la letra al núcleo del cometa
          const distHead = Math.hypot(comet.x - pos.x, comet.y - pos.y);

          // Distancia de la letra al segmento de la estela [tail -> head]
          const segDx = comet.x - tailX;
          const segDy = comet.y - tailY;
          const segLenSq = segDx * segDx + segDy * segDy;
          let t = 0;
          if (segLenSq > 0) {
            t = Math.max(0, Math.min(1, ((pos.x - tailX) * segDx + (pos.y - tailY) * segDy) / segLenSq));
          }
          const projX = tailX + t * segDx;
          const projY = tailY + t * segDy;
          const distTail = Math.hypot(pos.x - projX, pos.y - projY);

          const effectiveDist = Math.min(distHead * 0.8, distTail);

          if (effectiveDist < beamRadius) {
            const intensity = Math.pow(1 - effectiveDist / beamRadius, 1.8);
            if (intensity > (currentBrightness[item.key] ?? 0)) {
              currentBrightness[item.key] = intensity;
            }
          }
        });

        // Eliminar cometa una vez completado el recorrido fuera de la pantalla
        if (comet.progress >= 1.2 && comet.particles.length === 0) {
          activeComets.splice(c, 1);
        }
      }

      setLetterBrightness({ ...currentBrightness });

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      clearInterval(interval);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [letterItems, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-6 sm:gap-y-8 md:gap-y-10 text-center select-none ${className}`}>
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
      className="relative w-full flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px] md:min-h-[640px] py-16 sm:py-20 select-none overflow-visible cursor-default"
    >
      {/* Resplandor ambiental de estudio ultra suave */}
      <div
        className="absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none opacity-25"
        aria-hidden="true"
      />

      {/* Capa de renderizado de los cometas cósmicos, núcleos y partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4 gap-y-2 sm:gap-y-3.5 md:gap-y-4 z-10 overflow-visible">
        {words.map((word, wordIdx) => {
          const isFirstWord = wordIdx === 0;

          // Jerarquía tipográfica monumental con espaciado equilibrado
          const fontClasses = isFirstWord
            ? 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-wider'
            : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.2em] sm:tracking-[0.28em] md:tracking-[0.32em]';

          const slotMinWidth = isFirstWord ? '0.74em' : '0.82em';

          return (
            <div
              key={`word-row-${wordIdx}`}
              className={`inline-flex items-center justify-center relative leading-[1.08] overflow-visible ${fontClasses} ${
                isFirstWord ? 'gap-x-1 sm:gap-x-2 md:gap-x-3' : 'gap-x-1 sm:gap-x-1.5 md:gap-x-2.5'
              }`}
            >
              {word.split('').map((char, charIdx) => {
                const key = `${wordIdx}-${charIdx}-${char}`;
                const brightness = letterBrightness[key] ?? 0;

                return (
                  <div
                    id={`kinetic-char-${key}`}
                    key={`slot-${key}`}
                    className="relative inline-flex items-center justify-center overflow-visible"
                    style={{ minWidth: slotMinWidth }}
                  >
                    {/* 🔲 CAPA 1: PAREDES Y SILUETA DEL MOLDE BASE */}
                    <span
                      className="select-none pointer-events-none uppercase leading-[1.08] transition-colors duration-200"
                      style={{
                        WebkitTextStroke: brightness > 0.05
                          ? `1.5px rgba(255, 255, 255, ${0.3 + brightness * 0.7})`
                          : '1.2px rgba(255, 255, 255, 0.24)',
                        color: 'transparent',
                        textShadow: brightness > 0.1
                          ? `0 0 16px rgba(255, 255, 255, ${brightness * 0.8})`
                          : 'none',
                      }}
                      aria-hidden="true"
                    >
                      {char}
                    </span>

                    {/* ✨ CAPA 2: LUZ BLANCA QUE SE ENCIENDE AL PASO DEL COMETA Y SE APAGA SUAVEMENTE */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible transition-none"
                      style={{
                        opacity: brightness,
                      }}
                    >
                      <span
                        className="inline-block uppercase leading-[1.08] text-white transition-all"
                        style={{
                          textShadow: brightness > 0.3
                            ? `0 0 24px rgba(255, 255, 255, ${brightness * 0.95}), 0 0 45px rgba(255, 255, 255, ${brightness * 0.6})`
                            : 'none',
                        }}
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

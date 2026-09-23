/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cometa Cósmico Astronómico con Estela Etérea e Iluminación de Moldes".
 * Un cometa astronómico fotorrealista (con doble cola de iones y polvo curvado) cruza la pantalla completa
 * en ciclos continuos. Al pasar, ilumina los moldes de "PORTAFOLIO" y "PROFESIONAL",
 * apagándose suavemente con fosforescencia natural.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  createCelestialTrajectory,
  initCometState,
  updateCometPhysics,
  renderAstronomicalComet,
  calculateLetterIllumination,
  type CometState,
} from '../../lib/canvas/cometRenderer';

interface KineticTitleProps {
  text?: string;
  className?: string;
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

  // Metadatos y claves únicas para cada carácter del título
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    let trajectoryCounter = 0;

    let winW = window.innerWidth;
    let winH = window.innerHeight;

    let activeComet: CometState | null = null;
    let cometCooldownTimer: NodeJS.Timeout | null = null;

    const currentBrightness: { [key: string]: number } = {};
    letterItems.forEach((item) => {
      currentBrightness[item.key] = 0;
    });

    const letterPositions: { [key: string]: { x: number; y: number } } = {};

    const resize = () => {
      winW = window.innerWidth;
      winH = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(winW * dpr);
      canvas.height = Math.round(winH * dpr);
      ctx.scale(dpr, dpr);

      // Calcular posiciones de cada carácter en pantalla
      letterItems.forEach((item) => {
        const el = document.getElementById(`kinetic-char-${item.key}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          letterPositions[item.key] = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      });
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', resize);

    // Lanzador de cometa con trayectoria orbital celestial
    const launchComet = () => {
      if (!isRunning) return;

      resize();

      let minY = winH;
      let maxY = 0;
      letterItems.forEach((item) => {
        const pos = letterPositions[item.key];
        if (pos) {
          minY = Math.min(minY, pos.y);
          maxY = Math.max(maxY, pos.y);
        }
      });

      const titleCenterY = (minY + maxY) / 2 || winH / 2;
      const titleHeight = maxY - minY || 180;

      const trajectory = createCelestialTrajectory(
        trajectoryCounter,
        winW,
        winH,
        titleCenterY,
        titleHeight
      );
      trajectoryCounter++;

      activeComet = initCometState(trajectory);
    };

    cometCooldownTimer = setTimeout(launchComet, 350);

    // Bucle de animación cinemática
    const renderLoop = (timestamp: number) => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, winW, winH);

      // Decaimiento fosforescente gradual
      letterItems.forEach((item) => {
        currentBrightness[item.key] = Math.max(0, (currentBrightness[item.key] ?? 0) * 0.94);
      });

      if (activeComet) {
        updateCometPhysics(activeComet, timestamp);
        renderAstronomicalComet(ctx, activeComet);

        // Calcular iluminación en cada letra
        letterItems.forEach((item) => {
          const pos = letterPositions[item.key];
          if (!pos || !activeComet) return;

          const illumination = calculateLetterIllumination(
            activeComet.headX,
            activeComet.headY,
            activeComet.spine,
            pos.x,
            pos.y,
            240
          );

          if (illumination > (currentBrightness[item.key] ?? 0)) {
            currentBrightness[item.key] = illumination;
          }
        });

        // Al finalizar el vuelo fuera del viewport, programar el siguiente paso
        if (activeComet.progress >= 1.25) {
          activeComet = null;
          if (cometCooldownTimer) clearTimeout(cometCooldownTimer);
          cometCooldownTimer = setTimeout(() => {
            cometCooldownTimer = null;
            launchComet();
          }, 2400);
        }
      }

      setLetterBrightness({ ...currentBrightness });

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', resize);
      if (cometCooldownTimer) clearTimeout(cometCooldownTimer);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [letterItems, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-wider text-white leading-[1.08] uppercase">
          {words[0]}
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.25em] sm:tracking-[0.32em] text-white/90 leading-[1.08] uppercase">
          {words[1]}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[620px] py-16 sm:py-20 select-none overflow-visible cursor-default"
    >
      {/* Resplandor ambiental de estudio ultra suave */}
      <div
        className="absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none opacity-25"
        aria-hidden="true"
      />

      {/* Canvas fijado a pantalla completa para el vuelo libre y cósmico del cometa */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4 gap-y-2 sm:gap-y-3.5 md:gap-y-4 z-10 overflow-visible">
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
                    {/* Silueta y contorno del molde en bajorrelieve */}
                    <span
                      className="select-none pointer-events-none uppercase leading-[1.08] transition-colors duration-200"
                      style={{
                        WebkitTextStroke: brightness > 0.05
                          ? `1.5px rgba(255, 255, 255, ${0.28 + brightness * 0.72})`
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

                    {/* Luz blanca que enciende la letra al paso del cometa y se apaga suavemente */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible transition-none"
                      style={{
                        opacity: brightness,
                      }}
                    >
                      <span
                        className="inline-block uppercase leading-[1.08] text-white transition-all"
                        style={{
                          textShadow: brightness > 0.25
                            ? `0 0 24px rgba(255, 255, 255, ${brightness * 0.95}), 0 0 45px rgba(186, 230, 253, ${brightness * 0.6})`
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

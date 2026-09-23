/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cometa Cósmico de Pantalla Completa con Iluminación de Moldes".
 * Un cometa majestuoso cruza de borde a borde de toda la pantalla con estela etérea y partículas de polvo estelar.
 * Al atravesar el título, ilumina tanto "PORTAFOLIO" como "PROFESIONAL", desvaneciéndose en ciclos periódicos.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

interface FullscreenComet {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  progress: number;
  headRadius: number;
  comaRadius: number;
  tailLength: number;
  particles: Stardust[];
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    let trajectoryCounter = 0;

    let winW = window.innerWidth;
    let winH = window.innerHeight;

    let activeComet: FullscreenComet | null = null;
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

      // Calcular posiciones globales de cada letra en la pantalla
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

    // Lanzador de cometa a pantalla completa cruzando ambas líneas de texto
    const launchComet = () => {
      if (!isRunning) return;

      resize(); // Actualizar posiciones antes de trazar la trayectoria

      // Encontrar el centro geométrico del título completo
      let minX = winW, maxX = 0, minY = winH, maxY = 0;
      letterItems.forEach((item) => {
        const pos = letterPositions[item.key];
        if (pos) {
          minX = Math.min(minX, pos.x);
          maxX = Math.max(maxX, pos.x);
          minY = Math.min(minY, pos.y);
          maxY = Math.max(maxY, pos.y);
        }
      });

      const titleCenterX = (minX + maxX) / 2 || winW / 2;
      const titleCenterY = (minY + maxY) / 2 || winH / 2;
      const titleHeight = maxY - minY || 180;

      let startX = -450;
      let startY = 0;
      let endX = winW + 550;
      let endY = 0;
      const speed = 0.0030; // Velocidad pausada, majestuosa y cinematográfica

      const mode = trajectoryCounter % 3;
      trajectoryCounter++;

      if (mode === 0) {
        // Trayectoria 1: Gran diagonal descendente que cruza PORTAFOLIO y PROFESIONAL
        startX = -450;
        startY = titleCenterY - titleHeight * 1.3;
        endX = winW + 550;
        endY = titleCenterY + titleHeight * 1.3;
      } else if (mode === 1) {
        // Trayectoria 2: Diagonal suave ascendente que atraviesa PROFESIONAL y luego PORTAFOLIO
        startX = -450;
        startY = titleCenterY + titleHeight * 1.2;
        endX = winW + 550;
        endY = titleCenterY - titleHeight * 1.1;
      } else {
        // Trayectoria 3: Cruce central amplio y rasante que baña todo el bloque tipográfico
        startX = -450;
        startY = titleCenterY - 25;
        endX = winW + 550;
        endY = titleCenterY + 35;
      }

      activeComet = {
        startX,
        startY,
        endX,
        endY,
        speed,
        progress: 0,
        headRadius: 11, // Núcleo incandescente
        comaRadius: 65, // Atmósfera de gas brillante
        tailLength: 950, // Estela ultra larga
        particles: [],
      };
    };

    // Lanzar el primer cometa
    cometCooldownTimer = setTimeout(launchComet, 400);

    // Bucle de animación (60/120fps)
    const renderLoop = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, winW, winH);

      // Decaimiento fosforescente suave de todas las letras (fade out gradual)
      letterItems.forEach((item) => {
        currentBrightness[item.key] = Math.max(0, (currentBrightness[item.key] ?? 0) * 0.95);
      });

      if (activeComet) {
        const comet = activeComet;
        comet.progress += comet.speed;

        const dx = comet.endX - comet.startX;
        const dy = comet.endY - comet.startY;
        const currentHeadX = comet.startX + dx * comet.progress;
        const currentHeadY = comet.startY + dy * comet.progress;

        const angle = Math.atan2(dy, dx);
        const tailX = currentHeadX - Math.cos(angle) * comet.tailLength;
        const tailY = currentHeadY - Math.sin(angle) * comet.tailLength;

        // Generar partículas de polvo estelar cósmico mientras esté en pantalla
        if (comet.progress < 1.05 && Math.random() < 0.75) {
          const spread = (Math.random() - 0.5) * 28;
          const pAngle = angle + Math.PI + (Math.random() - 0.5) * 0.3;
          const pSpeed = 0.8 + Math.random() * 2.5;
          comet.particles.push({
            x: currentHeadX + Math.sin(angle) * spread,
            y: currentHeadY - Math.cos(angle) * spread,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            alpha: 1,
            size: 1.5 + Math.random() * 3.0,
            life: 0,
            maxLife: 30 + Math.random() * 35,
            color: Math.random() > 0.35 ? 'rgba(255, 255, 255,' : 'rgba(186, 230, 253,',
          });
        }

        ctx.save();

        // 1. ESTELA DE GAS CÓSMICO TRANSLÚCIDA (ION TAIL SUAVE SIN BORDES PLANOS)
        const normalAngle = angle + Math.PI / 2;
        const headW = comet.headRadius * 2.5;
        const midW = 65;
        const endW = 135;

        const midX = currentHeadX - Math.cos(angle) * (comet.tailLength * 0.4);
        const midY = currentHeadY - Math.sin(angle) * (comet.tailLength * 0.4);

        const tailGradient = ctx.createLinearGradient(currentHeadX, currentHeadY, tailX, tailY);
        tailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        tailGradient.addColorStop(0.15, 'rgba(224, 242, 254, 0.6)');
        tailGradient.addColorStop(0.40, 'rgba(186, 230, 253, 0.25)');
        tailGradient.addColorStop(0.75, 'rgba(147, 197, 253, 0.08)');
        tailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(currentHeadX + Math.cos(normalAngle) * headW, currentHeadY + Math.sin(normalAngle) * headW);
        ctx.quadraticCurveTo(midX + Math.cos(normalAngle) * midW, midY + Math.sin(normalAngle) * midW, tailX + Math.cos(normalAngle) * endW, tailY + Math.sin(normalAngle) * endW);
        ctx.lineTo(tailX - Math.cos(normalAngle) * endW, tailY - Math.sin(normalAngle) * endW);
        ctx.quadraticCurveTo(midX - Math.cos(normalAngle) * midW, midY - Math.sin(normalAngle) * midW, currentHeadX - Math.cos(normalAngle) * headW, currentHeadY - Math.sin(normalAngle) * headW);
        ctx.closePath();
        ctx.fillStyle = tailGradient;
        ctx.fill();

        // 2. HAZ CENTRAL INTENSO DE PLASMA
        const plasmaGrad = ctx.createLinearGradient(currentHeadX, currentHeadY, tailX, tailY);
        plasmaGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        plasmaGrad.addColorStop(0.2, 'rgba(240, 249, 255, 0.85)');
        plasmaGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.35)');
        plasmaGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(currentHeadX, currentHeadY);
        ctx.lineTo(tailX, tailY);
        ctx.lineWidth = 5;
        ctx.strokeStyle = plasmaGrad;
        ctx.stroke();

        // 3. POLVO ESTELAR VIVO
        for (let p = comet.particles.length - 1; p >= 0; p--) {
          const pt = comet.particles[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * pt.alpha, 0, Math.PI * 2);
          ctx.fillStyle = `${pt.color} ${pt.alpha * 0.95})`;
          ctx.fill();

          if (pt.life >= pt.maxLife) {
            comet.particles.splice(p, 1);
          }
        }

        // 4. COMA DEL COMETA (ATMÓSFERA DE GAS RADIAL)
        const comaGrad = ctx.createRadialGradient(
          currentHeadX,
          currentHeadY,
          comet.headRadius * 0.2,
          currentHeadX,
          currentHeadY,
          comet.comaRadius
        );
        comaGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        comaGrad.addColorStop(0.2, 'rgba(224, 242, 254, 0.95)');
        comaGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.4)');
        comaGrad.addColorStop(0.8, 'rgba(147, 197, 253, 0.12)');
        comaGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.beginPath();
        ctx.arc(currentHeadX, currentHeadY, comet.comaRadius, 0, Math.PI * 2);
        ctx.fillStyle = comaGrad;
        ctx.fill();

        // 5. NÚCLEO BRILLANTE Y DESTELLO DE LENTE (LENS FLARE)
        ctx.beginPath();
        ctx.arc(currentHeadX, currentHeadY, comet.headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 28;
        ctx.fill();

        // Destello en cruz
        ctx.beginPath();
        ctx.moveTo(currentHeadX - 28, currentHeadY);
        ctx.lineTo(currentHeadX + 28, currentHeadY);
        ctx.moveTo(currentHeadX, currentHeadY - 28);
        ctx.lineTo(currentHeadX, currentHeadY + 28);
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.stroke();

        ctx.restore();

        // FÍSICA DE ILUMINACIÓN DE MOLDES (AMPLIO ALCANCE PARA BAÑAR AMBAS PALABRAS)
        const beamRadius = 210;
        letterItems.forEach((item) => {
          const pos = letterPositions[item.key];
          if (!pos) return;

          const distHead = Math.hypot(currentHeadX - pos.x, currentHeadY - pos.y);

          const segDx = currentHeadX - tailX;
          const segDy = currentHeadY - tailY;
          const segLenSq = segDx * segDx + segDy * segDy;
          let t = 0;
          if (segLenSq > 0) {
            t = Math.max(0, Math.min(1, ((pos.x - tailX) * segDx + (pos.y - tailY) * segDy) / segLenSq));
          }
          const projX = tailX + t * segDx;
          const projY = tailY + t * segDy;
          const distTail = Math.hypot(pos.x - projX, pos.y - projY);

          const effectiveDist = Math.min(distHead * 0.7, distTail);

          if (effectiveDist < beamRadius) {
            const intensity = Math.pow(1 - effectiveDist / beamRadius, 1.4);
            if (intensity > (currentBrightness[item.key] ?? 0)) {
              currentBrightness[item.key] = intensity;
            }
          }
        });

        // Al salir de la pantalla completa: reiniciar y programar el siguiente cometa
        if (comet.progress >= 1.25) {
          activeComet = null;
          if (cometCooldownTimer) clearTimeout(cometCooldownTimer);
          cometCooldownTimer = setTimeout(() => {
            cometCooldownTimer = null;
            launchComet();
          }, 2600);
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

      {/* Canvas fijado a pantalla completa para que el cometa vuele libremente por toda la ventana */}
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
                    {/* 🔲 CAPA 1: PAREDES Y SILUETA DEL MOLDE BASE */}
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

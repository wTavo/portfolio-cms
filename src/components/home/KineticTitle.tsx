/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cometa Cósmico Solitario con Estela Translúcida e Iluminación de Moldes".
 * Un solo cometa majestuoso y grande cruza la pantalla a la vez en intervalos periódicos.
 * Su estela etérea y translúcida ilumina los moldes tipográficos a su paso, desvaneciéndose
 * con fosforescencia suave hasta el siguiente ciclo cósmico.
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

interface CometInstance {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  progress: number;
  headRadius: number;
  comaRadius: number;
  tailLength: number;
  tailWidthEnd: number;
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

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    let trajectoryIndex = 0;

    let width = 0;
    let height = 0;

    let activeComet: CometInstance | null = null;
    let cometCooldownTimer: NodeJS.Timeout | null = null;

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

      // Calcular posiciones de cada letra relativas al contenedor
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

    // Lanzador de un único cometa majestuoso con trayectorias alternadas
    const launchSingleComet = () => {
      if (!isRunning || width === 0 || height === 0) return;

      let startX = -300;
      let startY = 0;
      let endX = width + 350;
      let endY = 0;
      const speed = 0.0052; // Velocidad pausada y majestuosa

      const mode = trajectoryIndex % 3;
      trajectoryIndex++;

      if (mode === 0) {
        // Trayectoria 1: Diagonal suave a través de PORTAFOLIO
        startY = height * 0.18 + (Math.random() * 30 - 15);
        endY = height * 0.42 + (Math.random() * 30 - 15);
      } else if (mode === 1) {
        // Trayectoria 2: Diagonal cruzando PROFESIONAL
        startY = height * 0.82 + (Math.random() * 30 - 15);
        endY = height * 0.62 + (Math.random() * 30 - 15);
      } else {
        // Trayectoria 3: Cruce central amplio barriendo ambas palabras
        startY = height * 0.08 + (Math.random() * 30 - 15);
        endY = height * 0.88 + (Math.random() * 30 - 15);
      }

      activeComet = {
        startX,
        startY,
        endX,
        endY,
        speed,
        progress: 0,
        headRadius: 10, // Núcleo imponente
        comaRadius: 55, // Atmósfera de gas brillante
        tailLength: 780, // Estela muy larga y majestuosa
        tailWidthEnd: 110, // Ensanchamiento de la estela en el espacio
        particles: [],
      };
    };

    // Lanzar el primer cometa a los 450ms
    cometCooldownTimer = setTimeout(launchSingleComet, 450);

    // Bucle de renderizado (60/120fps)
    const renderLoop = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      // Decaimiento fosforescente suave de las letras (fade out)
      letterItems.forEach((item) => {
        currentBrightness[item.key] = Math.max(0, (currentBrightness[item.key] ?? 0) * 0.95);
      });

      if (activeComet) {
        const comet = activeComet;
        comet.progress += comet.speed;

        // Posición actual de la cabeza del cometa
        const dx = comet.endX - comet.startX;
        const dy = comet.endY - comet.startY;
        const currentHeadX = comet.startX + dx * comet.progress;
        const currentHeadY = comet.startY + dy * comet.progress;

        const angle = Math.atan2(dy, dx);
        const tailX = currentHeadX - Math.cos(angle) * comet.tailLength;
        const tailY = currentHeadY - Math.sin(angle) * comet.tailLength;

        // Emitir polvo estelar / partículas brillantes en la estela
        if (Math.random() < 0.75) {
          const spread = (Math.random() - 0.5) * 22;
          const pAngle = angle + Math.PI + (Math.random() - 0.5) * 0.35;
          const pSpeed = 1.0 + Math.random() * 2.8;
          comet.particles.push({
            x: currentHeadX + Math.sin(angle) * spread,
            y: currentHeadY - Math.cos(angle) * spread,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            alpha: 1,
            size: 1.5 + Math.random() * 2.8,
            life: 0,
            maxLife: 28 + Math.random() * 32,
            color: Math.random() > 0.4 ? 'rgba(255, 255, 255,' : 'rgba(186, 230, 253,',
          });
        }

        ctx.save();

        // 1. ESTELA TRANSLÚCIDA EXTERIOR (VELO DE GAS IONIZADO / DUST TAIL)
        const normalAngle = angle + Math.PI / 2;
        const headWidth = comet.headRadius * 2.2;
        const endWidth = comet.tailWidthEnd;

        const p1X = currentHeadX + Math.cos(normalAngle) * headWidth;
        const p1Y = currentHeadY + Math.sin(normalAngle) * headWidth;
        const p2X = tailX + Math.cos(normalAngle) * endWidth;
        const p2Y = tailY + Math.sin(normalAngle) * endWidth;
        const p3X = tailX - Math.cos(normalAngle) * endWidth;
        const p3Y = tailY - Math.sin(normalAngle) * endWidth;
        const p4X = currentHeadX - Math.cos(normalAngle) * headWidth;
        const p4Y = currentHeadY - Math.sin(normalAngle) * headWidth;

        const tailGrad = ctx.createLinearGradient(currentHeadX, currentHeadY, tailX, tailY);
        tailGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        tailGrad.addColorStop(0.12, 'rgba(224, 242, 254, 0.65)');
        tailGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.30)');
        tailGrad.addColorStop(0.65, 'rgba(147, 197, 253, 0.12)');
        tailGrad.addColorStop(0.90, 'rgba(59, 130, 246, 0.03)');
        tailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(p1X, p1Y);
        ctx.quadraticCurveTo((p1X + p2X) / 2, (p1Y + p2Y) / 2, p2X, p2Y);
        ctx.lineTo(p3X, p3Y);
        ctx.quadraticCurveTo((p3X + p4X) / 2, (p3Y + p4Y) / 2, p4X, p4Y);
        ctx.closePath();
        ctx.fillStyle = tailGrad;
        ctx.fill();

        // 2. RAYO CENTRAL DE PLASMA (NÚCLEO INTENSO DE LA ESTELA)
        const coreTailGrad = ctx.createLinearGradient(currentHeadX, currentHeadY, tailX, tailY);
        coreTailGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreTailGrad.addColorStop(0.25, 'rgba(240, 249, 255, 0.8)');
        coreTailGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.25)');
        coreTailGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(currentHeadX, currentHeadY);
        ctx.lineTo(tailX, tailY);
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = coreTailGrad;
        ctx.stroke();

        // 3. POLVO ESTELAR Y CHISPAS VIVAS
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

        // 4. COMA DEL COMETA (ATMÓSFERA DE GAS CIAN/BLANCO)
        const comaGrad = ctx.createRadialGradient(
          currentHeadX,
          currentHeadY,
          comet.headRadius * 0.3,
          currentHeadX,
          currentHeadY,
          comet.comaRadius
        );
        comaGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        comaGrad.addColorStop(0.2, 'rgba(224, 242, 254, 0.9)');
        comaGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.35)');
        comaGrad.addColorStop(0.8, 'rgba(147, 197, 253, 0.1)');
        comaGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.beginPath();
        ctx.arc(currentHeadX, currentHeadY, comet.comaRadius, 0, Math.PI * 2);
        ctx.fillStyle = comaGrad;
        ctx.fill();

        // 5. NÚCLEO INCANDESCENTE CON DESTELLO DE LENTE
        ctx.beginPath();
        ctx.arc(currentHeadX, currentHeadY, comet.headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 25;
        ctx.fill();

        // Destello de cruz de difracción (Lens flare)
        ctx.beginPath();
        ctx.moveTo(currentHeadX - 24, currentHeadY);
        ctx.lineTo(currentHeadX + 24, currentHeadY);
        ctx.moveTo(currentHeadX, currentHeadY - 24);
        ctx.lineTo(currentHeadX, currentHeadY + 24);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.stroke();

        ctx.restore();

        // FÍSICA DE ILUMINACIÓN DE MOLDES TIPOGRÁFICOS
        const beamRadius = 155;
        letterItems.forEach((item) => {
          const pos = letterPositions[item.key];
          if (!pos) return;

          // Distancia al núcleo
          const distHead = Math.hypot(currentHeadX - pos.x, currentHeadY - pos.y);

          // Distancia a la estela
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

          const effectiveDist = Math.min(distHead * 0.75, distTail);

          if (effectiveDist < beamRadius) {
            const intensity = Math.pow(1 - effectiveDist / beamRadius, 1.6);
            if (intensity > (currentBrightness[item.key] ?? 0)) {
              currentBrightness[item.key] = intensity;
            }
          }
        });

        // Cuando el cometa sale completamente de la pantalla
        if (comet.progress >= 1.25 && comet.particles.length === 0) {
          activeComet = null;
          // Pausa elegante de 3.2 segundos antes del siguiente cometa
          cometCooldownTimer = setTimeout(launchSingleComet, 3200);
        }
      }

      setLetterBrightness({ ...currentBrightness });

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
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

      {/* Capa de renderizado del cometa cósmico con estela translúcida y partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
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

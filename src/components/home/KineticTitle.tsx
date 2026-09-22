/**
 * @file KineticTitle.tsx
 * @description Título con estrella SVG que atraviesa el centro cortando las letras, dispersión física progresiva y rebote DVD con encaje natural sin saltos de coordenadas.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface LetterPhysics {
  char: string;
  index: number;
  wordIdx: number;
  charIdx: number;
  // Desplazamiento relativo respecto a su propio molde (dx=0, dy=0 es la posición perfecta)
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  isHit: boolean;
  isLocked: boolean;
  lockAllowedTime: number;
}

export default function KineticTitle({
  text = 'PORTAFOLIO BUILDER',
  className = '',
}: KineticTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());

  // Estado de la estrella SVG
  const [starVisible, setStarVisible] = useState(false);
  const starRef = useRef<HTMLDivElement>(null);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  const allLetters = useMemo(() => {
    let globalIndex = 0;
    return words.flatMap((word, wordIdx) =>
      word.split('').map((char, charIdx) => ({
        char,
        globalIndex: globalIndex++,
        wordIdx,
        charIdx,
      }))
    );
  }, [words, uppercaseText]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isRunning = true;

    const totalLetters = allLetters.length;
    const particles: LetterPhysics[] = allLetters.map((item) => ({
      char: item.char,
      index: item.globalIndex,
      wordIdx: item.wordIdx,
      charIdx: item.charIdx,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      vRot: 0,
      isHit: false,
      isLocked: true,
      lockAllowedTime: 0,
    }));

    // Variables de la estrella fugaz atravesando la pantalla
    let starX = -120;
    let starY = 0;
    let starSpeed = 22; // Velocidad de corte de la estrella
    let starActive = false;

    // Iniciar el paso de la estrella tras 1.0s
    const startTimeout = setTimeout(() => {
      if (!isRunning) return;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        starY = rect.top + rect.height / 2;
      } else {
        starY = window.innerHeight / 2;
      }

      starX = -150;
      starActive = true;
      setStarVisible(true);
      setLockedIndices(new Set());
    }, 1000);

    // Bucle principal de física
    const loop = (currentTime: number) => {
      if (!isRunning) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const pad = 24;

      // 1. Mover la estrella SVG atravesando el centro
      if (starActive) {
        starX += starSpeed;

        if (starRef.current) {
          starRef.current.style.transform = `translate3d(${starX}px, ${starY}px, 0)`;
        }

        // Detectar corte con cada letra a medida que la estrella pasa por su posición X
        particles.forEach((p) => {
          if (!p.isHit) {
            const el = letterRefs.current.get(p.index);
            if (el) {
              const rect = el.getBoundingClientRect();
              const letterCenterX = rect.left + rect.width / 2;

              // Si la estrella cruza la letra
              if (starX >= letterCenterX) {
                p.isHit = true;
                p.isLocked = false;
                p.lockAllowedTime = currentTime + 3500 + (p.index % 5) * 450;

                // Impulso cinético transmitido por el corte de la estrella
                const angle = (p.index % 2 === 0 ? -1 : 1) * (0.4 + Math.random() * 0.9) + (p.vy > 0 ? 0.2 : -0.2);
                const speed = 1.35 + (p.index % 4) * 0.12;

                p.vx = (Math.random() > 0.4 ? 1 : -1) * (1.1 + Math.random() * 0.6);
                p.vy = (p.index % 2 === 0 ? -1 : 1) * (speed * Math.sin(angle));
                p.vRot = (Math.random() - 0.5) * 0.8;
              }
            }
          }
        });

        // La estrella sale de la pantalla
        if (starX > screenW + 200) {
          starActive = false;
          setStarVisible(false);
        }
      }

      // 2. Física DVD y Rebotes de las letras impactadas
      let activeCount = 0;
      const currentLocked = new Set<number>();

      particles.forEach((p) => {
        const el = letterRefs.current.get(p.index);
        if (!el) return;

        if (p.isLocked) {
          currentLocked.add(p.index);
          p.dx = 0;
          p.dy = 0;
          p.rotation = 0;
        } else if (p.isHit) {
          activeCount++;

          // Medir la posición absoluta del molde para calcular rebotes en los bordes de la pantalla
          const parentRect = el.parentElement?.getBoundingClientRect();
          const baseLeft = parentRect ? parentRect.left : screenW / 2;
          const baseTop = parentRect ? parentRect.top : screenH / 2;
          const letterW = parentRect ? parentRect.width : 40;
          const letterH = parentRect ? parentRect.height : 50;

          const currentScreenX = baseLeft + p.dx;
          const currentScreenY = baseTop + p.dy;

          // Mover según su vector DVD
          p.dx += p.vx;
          p.dy += p.vy;
          p.rotation += p.vRot;

          // Rebotes con los bordes de la ventana
          if (currentScreenX <= pad) {
            p.dx = pad - baseLeft;
            p.vx = Math.abs(p.vx);
          } else if (currentScreenX >= screenW - pad - letterW) {
            p.dx = (screenW - pad - letterW) - baseLeft;
            p.vx = -Math.abs(p.vx);
          }

          if (currentScreenY <= pad + 30) {
            p.dy = (pad + 30) - baseTop;
            p.vy = Math.abs(p.vy);
          } else if (currentScreenY >= screenH - pad - letterH) {
            p.dy = (screenH - pad - letterH) - baseTop;
            p.vy = -Math.abs(p.vy);
          }

          // Detección natural de cruce por su molde original (dx ≈ 0, dy ≈ 0)
          if (currentTime >= p.lockAllowedTime) {
            const dist = Math.hypot(p.dx, p.dy);

            // Si pasa directamente por encima de su molde
            if (dist < 26) {
              p.isLocked = true;
              p.dx = 0;
              p.dy = 0;
              p.rotation = 0;
              currentLocked.add(p.index);
            } else if (dist < 75) {
              // Suave asistencia cuando está a punto de cruzar su molde
              p.vx -= p.dx * 0.012;
              p.vy -= p.dy * 0.012;
            }
          }
        }

        // Aplicar transformación relativa por GPU (cero saltos, 100% fluido)
        el.style.transform = `translate3d(${p.dx}px, ${p.dy}px, 0) rotate(${p.rotation}deg)`;
      });

      setLockedIndices(new Set(currentLocked));

      // Finalizar cuando todas las letras hayan encajado
      if (particles.every((p) => p.isHit) && activeCount === 0 && currentLocked.size === totalLetters) {
        particles.forEach((p) => {
          const el = letterRefs.current.get(p.index);
          if (el) el.style.transform = `none`;
        });
        return; // Fin permanente de la animación
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [allLetters, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[var(--color-text-primary)] leading-[1.05] uppercase select-none ${className}`}>
        {uppercaseText}
      </h1>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Estrella Fugaz SVG Vectorial que Atraviesa el Título */}
      <div
        ref={starRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          display: starVisible ? 'block' : 'none',
          pointerEvents: 'none',
          zIndex: 50,
          willChange: 'transform',
        }}
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative flex items-center">
          {/* Cola de Cometa Luminosa */}
          <div className="w-56 h-2 bg-gradient-to-l from-[var(--color-brand-accent)] via-blue-400 to-transparent blur-[1px] -mr-3" />
          
          {/* Estrella SVG de 4 Puntas con Resplandor */}
          <svg
            viewBox="0 0 48 48"
            className="w-10 h-10 drop-shadow-[0_0_16px_rgba(255,255,255,1)] drop-shadow-[0_0_24px_var(--color-brand-accent)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Núcleo de la estrella de 4 puntas */}
            <path
              d="M24 2 C24 14 14 24 2 24 C14 24 24 34 24 46 C24 34 34 24 46 24 C34 24 24 14 24 2 Z"
              fill="#FFFFFF"
            />
            {/* Destello secundario diagonal */}
            <path
              d="M24 10 C24 18 18 24 10 24 C18 24 24 30 24 38 C24 30 30 24 38 24 C30 24 24 18 24 10 Z"
              fill="var(--color-brand-accent)"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      {/* Título Principal con Silueta Pura y Letras */}
      <h1
        ref={containerRef}
        className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider leading-[1.1] flex flex-wrap justify-center gap-x-6 sm:gap-x-10 select-none relative ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          return (
            <span key={`word-${wordIdx}`} className="inline-flex gap-x-1.5 sm:gap-x-2.5">
              {word.split('').map((char, charIdx) => {
                let globalIdx = 0;
                for (let w = 0; w < wordIdx; w++) {
                  globalIdx += words[w].length;
                }
                globalIdx += charIdx;

                const isLocked = lockedIndices.has(globalIdx);

                return (
                  <span
                    key={`slot-${globalIdx}-${char}`}
                    className="relative inline-flex items-center justify-center"
                    style={{ minWidth: '0.68em', height: '1.2em' }}
                  >
                    {/* Molde: Silueta Pura en Bajo Relieve (SIN RECTÁNGULOS) */}
                    <span
                      className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      <span className="text-[#151924] select-none [text-shadow:_0_3px_6px_rgba(0,0,0,0.95),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)]">
                        {char}
                      </span>
                    </span>

                    {/* Letra Cinética Activa (Posicionamiento Relativo Puro a su Molde) */}
                    <span
                      ref={(el) => {
                        if (el) letterRefs.current.set(globalIdx, el);
                      }}
                      className={`relative inline-block font-black text-white select-none pointer-events-none transition-shadow duration-300 ${
                        isLocked
                          ? 'drop-shadow-[0_2px_14px_rgba(255,255,255,0.4)]'
                          : 'drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]'
                      }`}
                      style={{
                        willChange: 'transform',
                      }}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </h1>
    </div>
  );
}

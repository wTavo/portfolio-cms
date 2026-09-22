/**
 * @file KineticTitle.tsx
 * @description Título cinético con estrella SVG, dispersión por teoría del caos (ángulos y velocidades únicas), física de rebote DVD real en bordes y encaje natural en el molde.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface LetterParticle {
  char: string;
  index: number;
  wordIdx: number;
  charIdx: number;
  // Posiciones absolutas de pantalla
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  isHit: boolean;
  isLocked: boolean;
  canLockTime: number;
}

export default function KineticTitle({
  text = 'PORTAFOLIO BUILDER',
  className = '',
}: KineticTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());

  // Estrella SVG
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
    const particles: LetterParticle[] = allLetters.map((item) => ({
      char: item.char,
      index: item.globalIndex,
      wordIdx: item.wordIdx,
      charIdx: item.charIdx,
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      vRot: 0,
      isHit: false,
      isLocked: true,
      canLockTime: 0,
    }));

    // Medir y fijar coordenadas absolutas de destino una sola vez
    const measureTargets = () => {
      particles.forEach((p) => {
        const el = letterRefs.current.get(p.index);
        if (el) {
          const rect = el.getBoundingClientRect();
          p.targetX = rect.left;
          p.targetY = rect.top;
          p.x = rect.left;
          p.y = rect.top;
        }
      });
    };

    // Medición tras montaje
    const measureTimer = setTimeout(() => {
      measureTargets();
    }, 150);

    // Variables del cometa / estrella SVG
    let starX = -180;
    let starY = window.innerHeight / 2;
    let starSpeed = 24;
    let starActive = false;

    // Iniciar estrella tras 1.0s
    const starTimer = setTimeout(() => {
      if (!isRunning) return;
      measureTargets();

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        starY = rect.top + rect.height / 2;
      }

      starX = -180;
      starActive = true;
      setStarVisible(true);
      setLockedIndices(new Set());
    }, 1000);

    // Bucle principal de física
    const loop = (currentTime: number) => {
      if (!isRunning) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const letterW = 44;
      const letterH = 55;
      const minX = 16;
      const maxX = screenW - letterW - 16;
      const minY = 65; // Margen superior para no solapar el navbar
      const maxY = screenH - letterH - 16;

      // 1. Desplazar estrella SVG atravesando el centro
      if (starActive) {
        starX += starSpeed;

        if (starRef.current) {
          starRef.current.style.transform = `translate3d(${starX}px, ${starY}px, 0)`;
        }

        // Impacto caótico en cada letra a medida que la estrella cruza su X
        particles.forEach((p) => {
          if (!p.isHit) {
            const letterCenterX = p.targetX + letterW / 2;

            if (starX >= letterCenterX) {
              p.isHit = true;
              p.isLocked = false;
              // Permitir encaje natural tras unos segundos de vuelo libre
              p.canLockTime = currentTime + 3000 + (p.index * 320);

              // Teoría del Caos: Dispersión omnidireccional en 360 grados con turbulencia
              // Generamos un ángulo único aleatorio repartido en todo el círculo
              const baseAngle = (p.index / totalLetters) * Math.PI * 2;
              const chaosJitter = (Math.random() - 0.5) * 1.2;
              const angle = baseAngle + chaosJitter;

              // Velocidades dispares y variadas (no sincronizadas)
              const speed = 1.4 + Math.random() * 1.3; // entre 1.4 y 2.7 px/frame

              p.vx = Math.cos(angle) * speed;
              p.vy = Math.sin(angle) * speed;

              // Evitar ejes estáticos
              if (Math.abs(p.vx) < 0.6) p.vx = p.vx >= 0 ? 1.0 : -1.0;
              if (Math.abs(p.vy) < 0.6) p.vy = p.vy >= 0 ? 1.0 : -1.0;

              // Rotación caótica
              p.vRot = (Math.random() - 0.5) * 2.2;
            }
          }
        });

        // La estrella concluye su vuelo al salir de la pantalla
        if (starX > screenW + 250) {
          starActive = false;
          setStarVisible(false);
        }
      }

      // 2. Física DVD pura y Rebotes en los 4 bordes de la pantalla
      let activeCount = 0;
      const currentLocked = new Set<number>();

      particles.forEach((p) => {
        const el = letterRefs.current.get(p.index);
        if (!el) return;

        if (p.isLocked) {
          currentLocked.add(p.index);
          p.x = p.targetX;
          p.y = p.targetY;
          p.rot = 0;
        } else if (p.isHit) {
          activeCount++;

          // Integrar velocidad
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;

          // Rebote horizontal garantizado (DVD puro)
          if (p.x <= minX) {
            p.x = minX;
            p.vx = Math.abs(p.vx); // Rebota hacia la derecha
          } else if (p.x >= maxX) {
            p.x = maxX;
            p.vx = -Math.abs(p.vx); // Rebota hacia la izquierda
          }

          // Rebote vertical garantizado (DVD puro)
          if (p.y <= minY) {
            p.y = minY;
            p.vy = Math.abs(p.vy); // Rebota hacia abajo
          } else if (p.y >= maxY) {
            p.y = maxY;
            p.vy = -Math.abs(p.vy); // Rebota hacia arriba
          }

          // Detección de colisión / encaje natural con su propio molde
          if (currentTime >= p.canLockTime) {
            const distX = Math.abs(p.x - p.targetX);
            const distY = Math.abs(p.y - p.targetY);
            const distance = Math.hypot(p.x - p.targetX, p.y - p.targetY);

            // Si pasa directamente por encima de su molde
            if (distX < 26 && distY < 26) {
              p.isLocked = true;
              p.x = p.targetX;
              p.y = p.targetY;
              p.rot = 0;
              currentLocked.add(p.index);
            } else if (distance < 95) {
              // Cono de atracción natural suave si está cruzando cerca
              p.vx += (p.targetX - p.x) * 0.012;
              p.vy += (p.targetY - p.y) * 0.012;
            }
          }
        }

        // Renderizar con GPU Transform relativo a su targetX, targetY
        const renderDx = p.x - p.targetX;
        const renderDy = p.y - p.targetY;
        el.style.transform = `translate3d(${renderDx}px, ${renderDy}px, 0) rotate(${p.rot}deg)`;
      });

      setLockedIndices(new Set(currentLocked));

      // Finalizar de forma definitiva cuando todas hayan encajado
      if (particles.every((p) => p.isHit) && activeCount === 0 && currentLocked.size === totalLetters) {
        particles.forEach((p) => {
          const el = letterRefs.current.get(p.index);
          if (el) el.style.transform = `none`;
        });
        return; // Fin permanente
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      clearTimeout(measureTimer);
      clearTimeout(starTimer);
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
      {/* Estrella Fugaz SVG Vectorial */}
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
          {/* Estela de cometa brillante */}
          <div className="w-56 h-2 bg-gradient-to-l from-[var(--color-brand-accent)] via-sky-300 to-transparent blur-[1px] -mr-3" />

          {/* Estrella de 4 puntas con vector SVG */}
          <svg
            viewBox="0 0 48 48"
            className="w-10 h-10 drop-shadow-[0_0_16px_rgba(255,255,255,1)] drop-shadow-[0_0_24px_var(--color-brand-accent)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 2 C24 14 14 24 2 24 C14 24 24 34 24 46 C24 34 34 24 46 24 C34 24 24 14 24 2 Z"
              fill="#FFFFFF"
            />
            <path
              d="M24 10 C24 18 18 24 10 24 C18 24 24 30 24 38 C24 30 30 24 38 24 C30 24 24 18 24 10 Z"
              fill="var(--color-brand-accent)"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>

      {/* Título Principal con Silueta Pura de Molde y Letras */}
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
                    {/* Molde: Silueta Pura Tallada en Bajo Relieve */}
                    <span
                      className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      <span className="text-[#141824] select-none [text-shadow:_0_3px_6px_rgba(0,0,0,0.95),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)]">
                        {char}
                      </span>
                    </span>

                    {/* Letra Activa */}
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

/**
 * @file KineticTitle.tsx
 * @description Título cinético con estrella SVG galáctica, física DVD con desaceleración orgánica, molde siempre en capa de fondo (z-index inferior) y acoplamiento suave.
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
  // Coordenadas absolutas
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  isHit: boolean;
  // Estados de acoplamiento suave
  isDocking: boolean;
  dockStartX: number;
  dockStartY: number;
  dockStartRot: number;
  dockProgress: number;
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
  const lockedIndicesCountRef = useRef(0);

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
      isDocking: false,
      dockStartX: 0,
      dockStartY: 0,
      dockStartRot: 0,
      dockProgress: 0,
      isLocked: true,
      canLockTime: 0,
    }));

    // Medición exacta de coordenadas iniciales
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

    const measureTimer = setTimeout(() => {
      measureTargets();
    }, 150);

    // Variables de la estrella SVG
    let starX = -200;
    let starY = window.innerHeight / 2;
    let starSpeed = 26;
    let starActive = false;

    // Iniciar estrella tras 1.0s
    const starTimer = setTimeout(() => {
      if (!isRunning) return;
      measureTargets();

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        starY = rect.top + rect.height / 2;
      }

      starX = -200;
      starActive = true;
      setStarVisible(true);
      lockedIndicesCountRef.current = 0;
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
      const minY = 65;
      const maxY = screenH - letterH - 16;

      // 1. Trayectoria de la Estrella SVG
      if (starActive) {
        starX += starSpeed;

        if (starRef.current) {
          starRef.current.style.transform = `translate3d(${starX}px, ${starY}px, 0)`;
        }

        // Detección de corte con cada letra
        particles.forEach((p) => {
          if (!p.isHit) {
            const letterCenterX = p.targetX + letterW / 2;

            if (starX >= letterCenterX) {
              p.isHit = true;
              p.isLocked = false;
              p.canLockTime = currentTime + 3200 + (p.index * 280);

              // Dispersión angular caótica suave
              const baseAngle = (p.index / totalLetters) * Math.PI * 2;
              const jitter = (Math.random() - 0.5) * 1.4;
              const angle = baseAngle + jitter;

              const speed = 1.35 + Math.random() * 1.4;

              p.vx = Math.cos(angle) * speed;
              p.vy = Math.sin(angle) * speed;

              if (Math.abs(p.vx) < 0.6) p.vx = p.vx >= 0 ? 0.9 : -0.9;
              if (Math.abs(p.vy) < 0.6) p.vy = p.vy >= 0 ? 0.9 : -0.9;

              p.vRot = (Math.random() - 0.5) * 1.8;
            }
          }
        });

        // La estrella sale del viewport
        if (starX > screenW + 300) {
          starActive = false;
          setStarVisible(false);
        }
      }

      // 2. Física de Rebote DVD y Acoplamiento Sedoso
      let activeCount = 0;
      let newlyLockedCount = 0;
      const currentLocked = new Set<number>();

      particles.forEach((p) => {
        const el = letterRefs.current.get(p.index);
        if (!el) return;

        if (p.isLocked) {
          currentLocked.add(p.index);
          newlyLockedCount++;
          p.x = p.targetX;
          p.y = p.targetY;
          p.rot = 0;
          el.style.zIndex = '10';
        } else if (p.isDocking) {
          activeCount++;
          el.style.zIndex = '35'; // Capa intermedia durante acoplamiento

          // Deslizamiento sedoso con deceleración cuártica
          p.dockProgress += 0.028;

          if (p.dockProgress >= 1) {
            p.isDocking = false;
            p.isLocked = true;
            p.x = p.targetX;
            p.y = p.targetY;
            p.rot = 0;
            currentLocked.add(p.index);
            newlyLockedCount++;
            el.style.zIndex = '10';
          } else {
            const ease = 1 - Math.pow(1 - p.dockProgress, 4);
            p.x = p.dockStartX + (p.targetX - p.dockStartX) * ease;
            p.y = p.dockStartY + (p.targetY - p.dockStartY) * ease;
            p.rot = p.dockStartRot * (1 - ease);
          }
        } else if (p.isHit) {
          activeCount++;
          el.style.zIndex = '40'; // Siempre en capa superior absoluta mientras vuela

          // Integrar velocidad
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;

          // Rebote horizontal elástico garantizado
          if (p.x <= minX) {
            p.x = minX;
            p.vx = Math.abs(p.vx);
          } else if (p.x >= maxX) {
            p.x = maxX;
            p.vx = -Math.abs(p.vx);
          }

          // Rebote vertical elástico garantizado
          if (p.y <= minY) {
            p.y = minY;
            p.vy = Math.abs(p.vy);
          } else if (p.y >= maxY) {
            p.y = maxY;
            p.vy = -Math.abs(p.vy);
          }

          // Detección de cruce natural con su molde
          if (currentTime >= p.canLockTime) {
            const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);

            // Si cruza a menos de 45px de su molde, inicia acoplamiento sedoso
            if (dist < 45) {
              p.isDocking = true;
              p.dockStartX = p.x;
              p.dockStartY = p.y;

              // Normalizar rotación a [-180, 180]
              let normalizedRot = p.rot % 360;
              if (normalizedRot > 180) normalizedRot -= 360;
              if (normalizedRot < -180) normalizedRot += 360;

              p.dockStartRot = normalizedRot;
              p.dockProgress = 0;
            }
          }
        }

        // Renderizar con aceleración pura por GPU
        let renderDx = p.x - p.targetX;
        let renderDy = p.y - p.targetY;

        if (p.isLocked || Math.abs(renderDx) < 0.05) renderDx = 0;
        if (p.isLocked || Math.abs(renderDy) < 0.05) renderDy = 0;

        el.style.transform = `translate3d(${renderDx.toFixed(2)}px, ${renderDy.toFixed(2)}px, 0) rotate(${p.rot.toFixed(2)}deg)`;
      });

      // Solo actualizar estado de React cuando cambie el número de letras bloqueadas
      if (newlyLockedCount !== lockedIndicesCountRef.current) {
        lockedIndicesCountRef.current = newlyLockedCount;
        setLockedIndices(new Set(currentLocked));
      }

      // Concluir de forma definitiva
      if (particles.every((p) => p.isHit) && activeCount === 0 && currentLocked.size === totalLetters) {
        particles.forEach((p) => {
          const el = letterRefs.current.get(p.index);
          if (el) {
            el.style.transform = `none`;
            el.style.zIndex = '10';
          }
        });
        return;
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
      {/* Estrella Fugaz Galáctica SVG de Alto Impacto Visual */}
      <div
        ref={starRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          display: starVisible ? 'block' : 'none',
          pointerEvents: 'none',
          zIndex: 60,
          willChange: 'transform',
        }}
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative flex items-center">
          {/* Estela de Plasma con Doble Capa y Gradientes */}
          <div className="w-72 h-3.5 bg-gradient-to-l from-cyan-400 via-[var(--color-brand-primary)] to-transparent blur-[2px] -mr-4 opacity-90" />
          <div className="absolute right-4 w-44 h-1 bg-gradient-to-l from-white via-cyan-200 to-transparent blur-[0.5px]" />

          {/* Estrella Cósmica de 8 Puntas Vectorial */}
          <svg
            viewBox="0 0 64 64"
            className="w-14 h-14 drop-shadow-[0_0_20px_rgba(255,255,255,1)] drop-shadow-[0_0_35px_rgba(56,189,248,0.9)] animate-pulse"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Halo de Resplandor Circular */}
            <circle cx="32" cy="32" r="14" fill="url(#star-glow)" opacity="0.4" />

            {/* Rayos Diagonales Menores */}
            <path
              d="M32 16 L35 29 L48 32 L35 35 L32 48 L29 35 L16 32 L29 29 Z"
              fill="url(#star-diagonal-grad)"
              opacity="0.9"
            />

            {/* Puntas Principales de la Estrella de 4 Puntas */}
            <path
              d="M32 2 C32 18 20 32 2 32 C20 32 32 46 32 62 C32 46 44 32 62 32 C44 32 32 18 32 2 Z"
              fill="url(#star-core-grad)"
            />

            {/* Núcleo de Cristal Brillante */}
            <circle cx="32" cy="32" r="4" fill="#FFFFFF" />

            <defs>
              <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="star-core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
              <linearGradient id="star-diagonal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Capa 1 (Fondo): Moldes en Silueta Pura Tallada (z-index 0 fijo) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none"
        aria-hidden="true"
      >
        <div className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider leading-[1.1] flex flex-wrap justify-center gap-x-6 sm:gap-x-10 ${className}`}>
          {words.map((word, wordIdx) => (
            <span key={`mold-word-${wordIdx}`} className="inline-flex gap-x-1.5 sm:gap-x-2.5">
              {word.split('').map((char, charIdx) => (
                <span
                  key={`mold-slot-${wordIdx}-${charIdx}`}
                  className="inline-flex items-center justify-center"
                  style={{ minWidth: '0.68em', height: '1.2em' }}
                >
                  <span className="text-[#141824] select-none [text-shadow:_0_3px_6px_rgba(0,0,0,0.95),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)]">
                    {char}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Capa 2 (Frente): Letras Cinéticas Activas (z-index superior siempre por encima del molde) */}
      <h1
        ref={containerRef}
        className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider leading-[1.1] flex flex-wrap justify-center gap-x-6 sm:gap-x-10 select-none relative z-10 ${className}`}
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
                    className="inline-flex items-center justify-center relative"
                    style={{ minWidth: '0.68em', height: '1.2em' }}
                  >
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
                        zIndex: isLocked ? 10 : 40,
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

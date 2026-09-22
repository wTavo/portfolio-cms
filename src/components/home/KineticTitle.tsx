/**
 * @file KineticTitle.tsx
 * @description Título en mayúsculas grandes, molde gris con profundidad tridimensional (bajo relieve), física calmada de DVD y encaje natural por colisión directa sin repetición ni temporizadores forzados.
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
  // Posición actual en el viewport
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Estado de encaje natural
  isLocked: boolean;
  canLock: boolean;
  lockTimeAllowed: number; // Tiempo mínimo antes de permitir encaje (tras salir del molde)
  rotation: number;
  vRot: number;
}

export default function KineticTitle({
  text = 'PORTAFOLIO BUILDER',
  className = '',
}: KineticTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const moldRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());

  // Convertir texto a mayúsculas
  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);

  // Verificar accesibilidad
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

  // Motor de física DVD pura y encaje por colisión natural
  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isRunning = true;

    const particles: LetterParticle[] = [];
    const totalLetters = allLetters.length;
    let isLaunched = false;
    let launchTime = 0;

    // Inicializar partículas en la posición exacta de cada molde
    const initParticles = () => {
      particles.length = 0;
      allLetters.forEach((item) => {
        const moldEl = moldRefs.current.get(item.globalIndex);
        let origX = 0;
        let origY = 0;

        if (moldEl) {
          const rect = moldEl.getBoundingClientRect();
          origX = rect.left;
          origY = rect.top;
        }

        // Velocidad pausada y suave estilo DVD screensaver clásico (1.1 a 1.6 px/frame)
        const angle = (Math.random() * Math.PI * 2);
        const speed = 1.15 + (item.globalIndex % 4) * 0.12;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        // Asegurar que no quede en ejes completamente rectos
        if (Math.abs(vx) < 0.6) vx = vx > 0 ? 0.9 : -0.9;
        if (Math.abs(vy) < 0.6) vy = vy > 0 ? 0.9 : -0.9;

        particles.push({
          char: item.char,
          index: item.globalIndex,
          wordIdx: item.wordIdx,
          charIdx: item.charIdx,
          x: origX,
          y: origY,
          vx,
          vy,
          isLocked: true,
          canLock: false,
          lockTimeAllowed: 0,
          rotation: 0,
          vRot: (Math.random() - 0.5) * 0.8, // Rotación muy suave
        });
      });
    };

    // Medir tras montar en el DOM
    const initTimer = setTimeout(() => {
      initParticles();
    }, 120);

    // Lanzamiento de las letras tras 1.2 segundos
    const launchTimer = setTimeout(() => {
      isLaunched = true;
      launchTime = performance.now();
      setLockedIndices(new Set());

      particles.forEach((p, idx) => {
        p.isLocked = false;
        // Permitir que cada letra pueda encajar solo después de haber viajado al menos 3 a 5 segundos
        p.lockTimeAllowed = launchTime + 3000 + (idx % 5) * 600;
      });
    }, 1200);

    // Bucle de animación y física a 60 FPS
    const loop = (currentTime: number) => {
      if (!isRunning) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const padX = 24;
      const padY = 32;

      if (isLaunched) {
        let activeCount = 0;
        const currentLocked = new Set<number>();

        particles.forEach((p) => {
          const moldEl = moldRefs.current.get(p.index);
          let targetX = p.x;
          let targetY = p.y;
          let moldWidth = 40;
          let moldHeight = 50;

          if (moldEl) {
            const rect = moldEl.getBoundingClientRect();
            targetX = rect.left;
            targetY = rect.top;
            moldWidth = rect.width;
            moldHeight = rect.height;
          }

          if (p.isLocked) {
            currentLocked.add(p.index);
            p.x = targetX;
            p.y = targetY;
            p.rotation = 0;
          } else {
            activeCount++;

            // Mover según velocidad DVD
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.vRot;

            // Rebote en los 4 bordes del navegador (DVD Screensaver puro)
            if (p.x <= padX) {
              p.x = padX;
              p.vx = Math.abs(p.vx);
            } else if (p.x >= screenW - padX - moldWidth) {
              p.x = screenW - padX - moldWidth;
              p.vx = -Math.abs(p.vx);
            }

            if (p.y <= padY + 40) {
              p.y = padY + 40;
              p.vy = Math.abs(p.vy);
            } else if (p.y >= screenH - padY - moldHeight) {
              p.y = screenH - padY - moldHeight;
              p.vy = -Math.abs(p.vy);
            }

            // Detección de colisión natural con su molde
            if (currentTime >= p.lockTimeAllowed) {
              const distX = Math.abs(p.x - targetX);
              const distY = Math.abs(p.y - targetY);
              const distance = Math.hypot(p.x - targetX, p.y - targetY);

              // Si la letra pasa directamente por encima de su molde o muy cerca
              if (distX < moldWidth * 0.75 && distY < moldHeight * 0.75) {
                // Encaje natural instantáneo
                p.isLocked = true;
                p.x = targetX;
                p.y = targetY;
                p.rotation = 0;
                currentLocked.add(p.index);
              } else if (distance < 90) {
                // Suave atracción natural solo si ya está a punto de cruzar su molde
                p.vx += (targetX - p.x) * 0.012;
                p.vy += (targetY - p.y) * 0.012;
              }
            }
          }

          // Aplicar posición con aceleración por GPU
          const el = letterRefs.current.get(p.index);
          if (el) {
            el.style.position = `fixed`;
            el.style.left = `0px`;
            el.style.top = `0px`;
            el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
          }
        });

        setLockedIndices(new Set(currentLocked));

        // Cuando todas las piezas se hayan colocado naturalmente, concluye la animación
        if (activeCount === 0 && currentLocked.size === totalLetters) {
          // Permanecen en su lugar de forma definitiva
          particles.forEach((p) => {
            const el = letterRefs.current.get(p.index);
            if (el) {
              el.style.position = `static`;
              el.style.transform = `none`;
            }
          });
          return; // Termina la animación y no se repite
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      clearTimeout(initTimer);
      clearTimeout(launchTimer);
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
                  style={{ minWidth: '0.72em', height: '1.25em' }}
                >
                  {/* Molde Gris en Bajo Relieve con Profundidad Tridimensional */}
                  <span
                    ref={(el) => {
                      if (el) moldRefs.current.set(globalIdx, el);
                    }}
                    className="absolute inset-0 rounded-[var(--radius-md)] bg-[#1a1f2c] border border-white/10 shadow-[inset_0_4px_8px_rgba(0,0,0,0.85),inset_0_1px_3px_rgba(0,0,0,0.95),inset_0_-1px_2px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none"
                    aria-hidden="true"
                  >
                    {/* Silueta interior sumida de la letra en tono gris profundo */}
                    <span className="text-[#252c3d] font-black select-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.9)]">
                      {char}
                    </span>
                    {/* Borde biselado interior para máxima profundidad */}
                    <span className="absolute inset-x-1 bottom-1 h-[2px] bg-black/50 rounded-full" />
                  </span>

                  {/* Letra Cinética Activa con Física DVD */}
                  <span
                    ref={(el) => {
                      if (el) letterRefs.current.set(globalIdx, el);
                    }}
                    className={`inline-block font-black text-white z-20 pointer-events-none select-none transition-all duration-200 ${
                      isLocked
                        ? 'drop-shadow-[0_2px_14px_rgba(255,255,255,0.4)]'
                        : 'drop-shadow-[0_6px_20px_rgba(0,0,0,0.8)]'
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
  );
}

/**
 * @file KineticTitle.tsx
 * @description Título con molde en bajo relieve (hundido), física de rebote estilo DVD Screensaver y retorno aleatorio uno por uno en bucle continuo.
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
  // Posiciones actuales en pantalla
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Estado de encaje
  isLocked: boolean;
  lockTargetTime: number; // Momento en que esta letra emprende el retorno a su molde
  lockProgress: number;   // Interpolación 0 -> 1 hacia el molde
  startLockX: number;
  startLockY: number;
  rotation: number;
  vRot: number;
}

export default function KineticTitle({
  text = 'Portafolio Builder',
  className = '',
}: KineticTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const moldRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());

  // Verificar accesibilidad
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const words = useMemo(() => text.split(' '), [text]);

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
  }, [words, text]);

  // Motor de física DVD y ciclo de animación continuo
  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isRunning = true;

    // Inicializar partículas
    const particles: LetterParticle[] = [];
    const totalLetters = allLetters.length;

    // Generar orden aleatorio para el retorno de las letras
    const generateLockTimes = (startTime: number) => {
      // Barajar índices aleatoriamente (Fisher-Yates)
      const shuffledIndices = Array.from({ length: totalLetters }, (_, i) => i);
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }

      // Asignar tiempos de retorno espaciados aleatoriamente entre 4.5s y 11.5s
      const times = new Map<number, number>();
      shuffledIndices.forEach((letterIdx, order) => {
        const lockDelay = 4000 + order * 480 + (Math.random() * 250);
        times.set(letterIdx, startTime + lockDelay);
      });
      return times;
    };

    let cycleStartTime = performance.now();
    let lockTimes = generateLockTimes(cycleStartTime);
    let cycleState: 'initial_pause' | 'bouncing' | 'all_locked_pause' = 'initial_pause';
    let allLockedTime = 0;

    // Inicializar posiciones y velocidades tipo DVD
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

        // Velocidad tipo DVD con ángulo diagonal
        const speed = 2.2 + Math.random() * 1.6;
        const angle = (Math.random() * Math.PI * 2);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        particles.push({
          char: item.char,
          index: item.globalIndex,
          wordIdx: item.wordIdx,
          charIdx: item.charIdx,
          x: origX,
          y: origY,
          vx: Math.abs(vx) < 1 ? (vx > 0 ? 1.5 : -1.5) : vx,
          vy: Math.abs(vy) < 1 ? (vy > 0 ? 1.5 : -1.5) : vy,
          isLocked: true,
          lockTargetTime: lockTimes.get(item.globalIndex) || 0,
          lockProgress: 0,
          startLockX: origX,
          startLockY: origY,
          rotation: 0,
          vRot: (Math.random() - 0.5) * 2.5,
        });
      });
    };

    // Esperar primer render para medir moldes
    setTimeout(() => {
      initParticles();
    }, 100);

    // Loop de renderizado y física de rebote
    const loop = (currentTime: number) => {
      if (!isRunning) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const pad = 30; // Margen de rebote con los bordes

      const elapsed = currentTime - cycleStartTime;

      // Fase 1: Pausa inicial de 1.4s antes de liberar las letras
      if (cycleState === 'initial_pause') {
        if (elapsed > 1400) {
          cycleState = 'bouncing';
          setLockedIndices(new Set());
          particles.forEach((p) => {
            p.isLocked = false;
            p.lockProgress = 0;
          });
        }
      }

      // Fase 2: Rebote activo en pantalla estilo DVD y retorno gradual
      if (cycleState === 'bouncing') {
        let activeCount = 0;
        const currentLocked = new Set<number>();

        particles.forEach((p) => {
          const moldEl = moldRefs.current.get(p.index);
          let targetX = p.x;
          let targetY = p.y;

          if (moldEl) {
            const rect = moldEl.getBoundingClientRect();
            targetX = rect.left;
            targetY = rect.top;
          }

          if (p.isLocked) {
            currentLocked.add(p.index);
            // Ya está en el molde
            p.x = targetX;
            p.y = targetY;
            p.rotation = 0;
          } else {
            activeCount++;

            // Verificar si es momento de regresar a su molde
            if (currentTime >= p.lockTargetTime) {
              if (p.lockProgress === 0) {
                p.startLockX = p.x;
                p.startLockY = p.y;
              }

              p.lockProgress += 0.035; // Suavidad de aproximación

              if (p.lockProgress >= 1) {
                p.isLocked = true;
                p.lockProgress = 1;
                p.x = targetX;
                p.y = targetY;
                p.rotation = 0;
                currentLocked.add(p.index);
              } else {
                // Interpolación desacelerada hacia el molde
                const ease = 1 - Math.pow(1 - p.lockProgress, 3);
                p.x = p.startLockX + (targetX - p.startLockX) * ease;
                p.y = p.startLockY + (targetY - p.startLockY) * ease;
                p.rotation = p.rotation * (1 - ease);
              }
            } else {
              // Física DVD estándar (velocidad constante y rebote puro en bordes)
              p.x += p.vx;
              p.y += p.vy;
              p.rotation += p.vRot;

              // Rebote horizontal
              if (p.x <= pad) {
                p.x = pad;
                p.vx = Math.abs(p.vx);
              } else if (p.x >= screenW - pad - 40) {
                p.x = screenW - pad - 40;
                p.vx = -Math.abs(p.vx);
              }

              // Rebote vertical
              if (p.y <= pad + 60) {
                p.y = pad + 60;
                p.vy = Math.abs(p.vy);
              } else if (p.y >= screenH - pad - 60) {
                p.y = screenH - pad - 60;
                p.vy = -Math.abs(p.vy);
              }
            }
          }

          // Aplicar posición directamente en GPU para máximo rendimiento
          const el = letterRefs.current.get(p.index);
          if (el) {
            if (p.isLocked && cycleState === 'all_locked_pause') {
              el.style.transform = `none`;
              el.style.position = `static`;
            } else {
              el.style.position = `fixed`;
              el.style.left = `0px`;
              el.style.top = `0px`;
              el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
            }
          }
        });

        setLockedIndices(new Set(currentLocked));

        // Si todas las letras han regresado al molde
        if (activeCount === 0 && currentLocked.size === totalLetters) {
          cycleState = 'all_locked_pause';
          allLockedTime = currentTime;
        }
      }

      // Fase 3: Pausa con el título completo en reposo y reinicio del bucle
      if (cycleState === 'all_locked_pause') {
        if (currentTime - allLockedTime > 3500) {
          // Reiniciar ciclo
          cycleStartTime = performance.now();
          lockTimes = generateLockTimes(cycleStartTime);
          initParticles();
          cycleState = 'initial_pause';
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [allLetters, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.08] ${className}`}>
        {text}
      </h1>
    );
  }

  return (
    <h1
      ref={containerRef}
      className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] flex flex-wrap justify-center gap-x-4 sm:gap-x-6 select-none relative ${className}`}
      aria-label={text}
    >
      {words.map((word, wordIdx) => {
        return (
          <span key={`word-${wordIdx}`} className="inline-flex gap-x-1 sm:gap-x-1.5">
            {word.split('').map((char, charIdx) => {
              // Calcular índice global
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
                  style={{ minWidth: '0.65em', height: '1.2em' }}
                >
                  {/* Molde Hundido (Efecto grabado en bajo relieve / Inset Debossed) */}
                  <span
                    ref={(el) => {
                      if (el) moldRefs.current.set(globalIdx, el);
                    }}
                    className="absolute inset-0 rounded-[var(--radius-md)] bg-[#04060a] border border-white/[0.04] shadow-[inset_0_4px_8px_rgba(0,0,0,0.95),inset_0_-1px_1px_rgba(255,255,255,0.05),0_1px_0_rgba(255,255,255,0.03)] flex items-center justify-center pointer-events-none transition-all duration-300"
                    aria-hidden="true"
                  >
                    {/* Silueta sumida con profundidad */}
                    <span className="text-[#0e131f] font-extrabold select-none drop-shadow-[0_-1px_1px_rgba(0,0,0,0.9)]">
                      {char}
                    </span>
                    {/* Borde inferior interno tenue para efecto de profundidad de ranura */}
                    <span className="absolute inset-x-1 bottom-0.5 h-[1.5px] bg-black/80 rounded-full" />
                  </span>

                  {/* Letra Cinética Activa con Física DVD */}
                  <span
                    ref={(el) => {
                      if (el) letterRefs.current.set(globalIdx, el);
                    }}
                    className={`inline-block font-extrabold text-[var(--color-text-primary)] z-20 pointer-events-none select-none transition-shadow duration-300 ${
                      isLocked
                        ? 'drop-shadow-[0_2px_12px_rgba(59,130,246,0.25)] text-white'
                        : 'drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]'
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

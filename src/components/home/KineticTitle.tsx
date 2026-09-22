/**
 * @file KineticTitle.tsx
 * @description Título en mayúsculas grandes, silueta de molde pura (sin rectángulos), impacto de estrella fugaz que dispersa las letras y física de rebote DVD con encaje natural.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface LetterParticle {
  char: string;
  index: number;
  wordIdx: number;
  charIdx: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isLocked: boolean;
  canLock: boolean;
  lockTimeAllowed: number;
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
  const [starState, setStarState] = useState<'idle' | 'flying' | 'impact' | 'done'>('idle');
  const [impactCoord, setImpactCoord] = useState<{ x: number; y: number } | null>(null);

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

    const particles: LetterParticle[] = [];
    const totalLetters = allLetters.length;
    let isScattered = false;

    // 1. Inicializar letras exactamente sobre sus moldes
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

        particles.push({
          char: item.char,
          index: item.globalIndex,
          wordIdx: item.wordIdx,
          charIdx: item.charIdx,
          x: origX,
          y: origY,
          vx: 0,
          vy: 0,
          isLocked: true,
          canLock: false,
          lockTimeAllowed: 0,
          rotation: 0,
          vRot: 0,
        });
      });
    };

    // Medición inicial de coordenadas
    const initTimer = setTimeout(() => {
      initParticles();
    }, 100);

    // 2. Iniciar vuelo de la estrella fugaz a los 1.0s
    const starTimer = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setImpactCoord({ x: centerX, y: centerY });
      }
      setStarState('flying');
    }, 1000);

    // 3. Impacto de la estrella y dispersión radial a los 1.6s
    const impactTimer = setTimeout(() => {
      setStarState('impact');
      isScattered = true;
      const now = performance.now();
      setLockedIndices(new Set());

      // Calcular centro de impacto
      let centerX = window.innerWidth / 2;
      let centerY = window.innerHeight / 2;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }

      particles.forEach((p, idx) => {
        const moldEl = moldRefs.current.get(p.index);
        let letterX = p.x;
        let letterY = p.y;
        if (moldEl) {
          const rect = moldEl.getBoundingClientRect();
          letterX = rect.left;
          letterY = rect.top;
        }
        p.x = letterX;
        p.y = letterY;
        p.isLocked = false;
        p.lockTimeAllowed = now + 3200 + (idx % 5) * 500;

        // Impulso radial alejándose del punto de impacto de la estrella
        const dx = letterX - centerX;
        const dy = letterY - centerY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 1.35 + (idx % 4) * 0.15; // Velocidad DVD calmada
        
        // Vector de velocidad desde el impacto con ligera variación angular
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        if (Math.abs(vx) < 0.6) vx = vx > 0 ? 0.9 : -0.9;
        if (Math.abs(vy) < 0.6) vy = vy > 0 ? 0.9 : -0.9;

        p.vx = vx;
        p.vy = vy;
        p.vRot = (Math.random() - 0.5) * 0.8;
      });

      // Ocultar destello de impacto tras 400ms
      setTimeout(() => {
        setStarState('done');
      }, 400);
    }, 1600);

    // 4. Bucle continuo de física de rebote DVD
    const loop = (currentTime: number) => {
      if (!isRunning) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const padX = 24;
      const padY = 32;

      if (isScattered) {
        let activeCount = 0;
        const currentLocked = new Set<number>();

        particles.forEach((p) => {
          const moldEl = moldRefs.current.get(p.index);
          let targetX = p.x;
          let targetY = p.y;
          let letterW = 40;
          let letterH = 50;

          if (moldEl) {
            const rect = moldEl.getBoundingClientRect();
            targetX = rect.left;
            targetY = rect.top;
            letterW = rect.width;
            letterH = rect.height;
          }

          if (p.isLocked) {
            currentLocked.add(p.index);
            p.x = targetX;
            p.y = targetY;
            p.rotation = 0;
          } else {
            activeCount++;

            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.vRot;

            // Rebote puro contra los 4 bordes del navegador
            if (p.x <= padX) {
              p.x = padX;
              p.vx = Math.abs(p.vx);
            } else if (p.x >= screenW - padX - letterW) {
              p.x = screenW - padX - letterW;
              p.vx = -Math.abs(p.vx);
            }

            if (p.y <= padY + 40) {
              p.y = padY + 40;
              p.vy = Math.abs(p.vy);
            } else if (p.y >= screenH - padY - letterH) {
              p.y = screenH - padY - letterH;
              p.vy = -Math.abs(p.vy);
            }

            // Detección natural de cruce por su propio molde
            if (currentTime >= p.lockTimeAllowed) {
              const distX = Math.abs(p.x - targetX);
              const distY = Math.abs(p.y - targetY);

              // Si la letra pasa directamente por su molde
              if (distX < letterW * 0.75 && distY < letterH * 0.75) {
                p.isLocked = true;
                p.x = targetX;
                p.y = targetY;
                p.rotation = 0;
                currentLocked.add(p.index);
              } else {
                // Suave atracción natural si está en trayectoria cercana
                const dist = Math.hypot(p.x - targetX, p.y - targetY);
                if (dist < 80) {
                  p.vx += (targetX - p.x) * 0.01;
                  p.vy += (targetY - p.y) * 0.01;
                }
              }
            }
          }

          // Renderizar en GPU
          const el = letterRefs.current.get(p.index);
          if (el) {
            if (p.isLocked && isScattered) {
              el.style.position = `fixed`;
              el.style.left = `0px`;
              el.style.top = `0px`;
              el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
            } else if (isScattered) {
              el.style.position = `fixed`;
              el.style.left = `0px`;
              el.style.top = `0px`;
              el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
            }
          }
        });

        setLockedIndices(new Set(currentLocked));

        // Cuando todas las letras han regresado naturalmente
        if (activeCount === 0 && currentLocked.size === totalLetters) {
          particles.forEach((p) => {
            const el = letterRefs.current.get(p.index);
            if (el) {
              el.style.position = `static`;
              el.style.transform = `none`;
            }
          });
          return; // Concluye la animación
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      clearTimeout(initTimer);
      clearTimeout(starTimer);
      clearTimeout(impactTimer);
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
      {/* Animación Vectorial de la Estrella Fugaz / Cometa */}
      <AnimatePresence>
        {starState === 'flying' && impactCoord && (
          <motion.div
            initial={{
              x: impactCoord.x + 380,
              y: impactCoord.y - 280,
              opacity: 0,
              scale: 0.4,
            }}
            animate={{
              x: impactCoord.x,
              y: impactCoord.y,
              opacity: [0, 1, 1],
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.1, 0.7, 0.3, 1],
            }}
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          >
            {/* Núcleo brillante y cola de la estrella fugaz */}
            <div className="relative flex items-center">
              {/* Cola luminosa */}
              <div className="w-48 h-1.5 bg-gradient-to-l from-[var(--color-brand-accent)] via-[var(--color-brand-primary)] to-transparent blur-[1px] rotate-[-35deg] origin-right" />
              {/* Núcleo de la estrella */}
              <div className="w-5 h-5 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,1),0_0_12px_var(--color-brand-accent)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destello de Onda Expansiva del Impacto */}
      <AnimatePresence>
        {starState === 'impact' && impactCoord && (
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              left: impactCoord.x,
              top: impactCoord.y,
            }}
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-radial from-white via-[var(--color-brand-accent)]/50 to-transparent blur-md"
          />
        )}
      </AnimatePresence>

      {/* Título Principal y Silueta de Molde */}
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
                      ref={(el) => {
                        if (el) moldRefs.current.set(globalIdx, el);
                      }}
                      className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      {/* Letra grabada directamente en el fondo con profundidad tridimensional */}
                      <span className="text-[#131722] select-none [text-shadow:_0_3px_6px_rgba(0,0,0,0.95),_0_1px_2px_rgba(0,0,0,1),_0_-1px_1px_rgba(255,255,255,0.08)]">
                        {char}
                      </span>
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
    </div>
  );
}

/**
 * @file KineticTitle.tsx
 * @description Título cinético de gran escala tipográfica con cometa cósmico galáctico (núcleo incandescente, arco de choque frontal, cola dual de plasma y polvo estelar) e iluminación ambiental volumétrica profunda.
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
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  isHit: boolean;
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

  // Estados de tipeo tipográfico
  const [typedCount, setTypedCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [titleConfirmed, setTitleConfirmed] = useState(false);

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

  const totalLetters = allLetters.length;

  // 1. Fase de Escritura Tipográfica Limpia
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedCount(totalLetters);
      setCursorVisible(false);
      return;
    }

    let current = 0;
    const typeInterval = setInterval(() => {
      current++;
      setTypedCount(current);
      if (current >= totalLetters) {
        clearInterval(typeInterval);

        setTimeout(() => {
          setTitleConfirmed(true);
          setTimeout(() => {
            setCursorVisible(false);
          }, 350);
        }, 300);
      }
    }, 55);

    return () => clearInterval(typeInterval);
  }, [totalLetters, prefersReducedMotion]);

  // 2. Motor de Física y Corte por Estrella Iluminadora
  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isRunning = true;

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

    let starX = -580;
    let starY = window.innerHeight / 2;
    let starSpeed = 28;
    let starActive = false;

    // Lanzar cometa cósmico tras el tipeo (~1.9s)
    const starTimer = setTimeout(() => {
      if (!isRunning) return;
      measureTargets();

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        starY = rect.top + rect.height / 2;
      }

      starX = -580;
      starActive = true;
      setStarVisible(true);
      lockedIndicesCountRef.current = 0;
      setLockedIndices(new Set());
    }, 1900);

    const loop = (currentTime: number) => {
      if (!isRunning) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const letterW = 56;
      const letterH = 70;
      const minX = 16;
      const maxX = screenW - letterW - 16;
      const minY = 65;
      const maxY = screenH - letterH - 16;

      // Movimiento del Cometa Cósmico
      if (starActive) {
        starX += starSpeed;

        if (starRef.current) {
          starRef.current.style.transform = `translate3d(${starX}px, ${starY}px, 0)`;
        }

        // El núcleo incandescente del cometa se ubica 208px por delante del centro del SVG
        const cometHeadX = starX + 208;

        particles.forEach((p) => {
          if (!p.isHit) {
            const letterCenterX = p.targetX + letterW / 2;

            if (cometHeadX >= letterCenterX) {
              p.isHit = true;
              p.isLocked = false;
              p.canLockTime = currentTime + 3200 + (p.index * 280);

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

        if (starX > screenW + 500) {
          starActive = false;
          setStarVisible(false);
        }
      }

      // Física DVD y Acoplamiento Sedoso
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
          el.style.zIndex = '35';

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
          el.style.zIndex = '40';

          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;

          if (p.x <= minX) {
            p.x = minX;
            p.vx = Math.abs(p.vx);
          } else if (p.x >= maxX) {
            p.x = maxX;
            p.vx = -Math.abs(p.vx);
          }

          if (p.y <= minY) {
            p.y = minY;
            p.vy = Math.abs(p.vy);
          } else if (p.y >= maxY) {
            p.y = maxY;
            p.vy = -Math.abs(p.vy);
          }

          if (currentTime >= p.canLockTime) {
            const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);

            if (dist < 45) {
              p.isDocking = true;
              p.dockStartX = p.x;
              p.dockStartY = p.y;

              let normalizedRot = p.rot % 360;
              if (normalizedRot > 180) normalizedRot -= 360;
              if (normalizedRot < -180) normalizedRot += 360;

              p.dockStartRot = normalizedRot;
              p.dockProgress = 0;
            }
          }
        }

        let renderDx = p.x - p.targetX;
        let renderDy = p.y - p.targetY;

        if (p.isLocked || Math.abs(renderDx) < 0.05) renderDx = 0;
        if (p.isLocked || Math.abs(renderDy) < 0.05) renderDy = 0;

        el.style.transform = `translate3d(${renderDx.toFixed(2)}px, ${renderDy.toFixed(2)}px, 0) rotate(${p.rot.toFixed(2)}deg)`;
      });

      if (newlyLockedCount !== lockedIndicesCountRef.current) {
        lockedIndicesCountRef.current = newlyLockedCount;
        setLockedIndices(new Set(currentLocked));
      }

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
      clearTimeout(starTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [allLetters, totalLetters, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <h1 className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[var(--color-text-primary)] leading-[1.05] uppercase select-none ${className}`}>
        {uppercaseText}
      </h1>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Cometa Cósmico Galáctico con Núcleo Incandescente, Cola Dual e Iluminación Ambiental Profunda */}
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
          {/* 1. Aura Gigante de Iluminación Ambiental Volumétrica que Baña el Fondo Oscuro */}
          <div
            className="absolute -top-48 -left-64 w-[950px] h-[500px] bg-radial from-cyan-400/45 via-sky-500/25 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10"
            aria-hidden="true"
          />
          {/* 2. Resplandor Concentrado de Alta Intensidad en el Núcleo */}
          <div
            className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-radial from-white/70 via-cyan-300/50 via-sky-500/20 to-transparent blur-2xl pointer-events-none -z-10"
            aria-hidden="true"
          />
          {/* 3. Iluminación Longitudinal de la Estela de Polvo */}
          <div
            className="absolute -top-16 -left-80 w-[650px] h-[200px] bg-radial from-cyan-300/35 via-blue-500/15 to-transparent blur-xl pointer-events-none -z-10"
            aria-hidden="true"
          />

          {/* Gráfico Vectorial Completo del Cometa Cósmico */}
          <svg
            viewBox="0 0 520 120"
            className="w-[520px] h-[120px] overflow-visible drop-shadow-[0_0_35px_rgba(56,189,248,0.95)] drop-shadow-[0_0_70px_rgba(14,165,233,0.7)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* DEFS: Gradientes y Filtros de Resplandor */}
            <defs>
              {/* Gradiente Cono de Polvo Cósmico */}
              <linearGradient id="comet-dust-tail" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#0EA5E9" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
              </linearGradient>

              {/* Gradiente Cola de Plasma / Iones */}
              <linearGradient id="comet-ion-tail" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="25%" stopColor="#E0F2FE" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
              </linearGradient>

              {/* Gradiente Núcleo Blanco-Caliente */}
              <radialGradient id="comet-core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E0F2FE" />
                <stop offset="75%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
              </radialGradient>

              {/* Gradiente Arco de Choque Frontal */}
              <linearGradient id="bow-shock-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                <stop offset="60%" stopColor="#E0F2FE" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>

              {/* Gradiente Destello Horizontal Flare */}
              <linearGradient id="lens-flare-h" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* A. COLA 1: Cono de Polvo Cósmico Difuso y Envolvente (Curvada y en Expansión) */}
            <path
              d="M 460 60 Q 300 45 40 15 L 40 105 Q 300 75 460 60 Z"
              fill="url(#comet-dust-tail)"
              filter="blur(4px)"
            />

            {/* B. COLA 2: Haz de Plasma Ionizado Hiper-Brillante Rectilíneo */}
            <path
              d="M 465 60 L 120 48 L 80 60 L 120 72 Z"
              fill="url(#comet-ion-tail)"
              filter="blur(1px)"
            />
            {/* Núcleo interno rectilíneo de plasma ultra-fino */}
            <line
              x1="468"
              y1="60"
              x2="160"
              y2="60"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 4px #E0F2FE)"
            />

            {/* C. CHISPAS Y FRAGMENTOS CÓSMICOS (Stardust Embers) */}
            {/* Chispa 1 */}
            <circle cx="390" cy="46" r="2.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="390" cy="46" r="4.5" fill="#38BDF8" opacity="0.5" filter="blur(1px)" />

            {/* Chispa 2 */}
            <circle cx="340" cy="74" r="1.8" fill="#E0F2FE" opacity="0.85" />
            <circle cx="340" cy="74" r="3.5" fill="#38BDF8" opacity="0.4" filter="blur(1px)" />

            {/* Chispa 3 */}
            <circle cx="280" cy="52" r="2.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="280" cy="52" r="5" fill="#0EA5E9" opacity="0.45" filter="blur(1px)" />

            {/* Chispa 4 */}
            <circle cx="230" cy="68" r="1.5" fill="#E0F2FE" opacity="0.75" />

            {/* Chispa 5 */}
            <circle cx="170" cy="42" r="2" fill="#FFFFFF" opacity="0.65" />
            <circle cx="170" cy="42" r="4" fill="#6366F1" opacity="0.35" filter="blur(1px)" />

            {/* Chispa 6 */}
            <circle cx="110" cy="78" r="1.4" fill="#E0F2FE" opacity="0.5" />

            {/* D. CABEZA DEL COMETA: Corona de Gas (Coma) y Arco de Choque */}
            {/* Corona radial exterior */}
            <circle cx="468" cy="60" r="36" fill="url(#comet-core-glow)" opacity="0.85" />

            {/* Arco de Choque Frontal (Bow Shock Wave) */}
            <path
              d="M 460 30 C 495 42 495 78 460 90"
              stroke="url(#bow-shock-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              filter="drop-shadow(0 0 8px #38BDF8)"
            />
            {/* Arco de choque secundario sutil */}
            <path
              d="M 454 38 C 484 48 484 72 454 82"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />

            {/* Destello Óptico Horizontal (Lens Flare Spike) */}
            <line
              x1="390"
              y1="60"
              x2="520"
              y2="60"
              stroke="url(#lens-flare-h)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Destello Óptico Vertical sutil */}
            <line
              x1="468"
              y1="32"
              x2="468"
              y2="88"
              stroke="url(#lens-flare-h)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Núcleo Incandescente (Core Head) */}
            <circle
              cx="468"
              cy="60"
              r="8"
              fill="#FFFFFF"
              className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
            />
          </svg>
        </div>
      </div>

      {/* Título Principal de Mayor Escala con Moldes Integrados en la Misma Ranura */}
      <h1
        ref={containerRef}
        className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider leading-[1.08] flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 select-none relative z-10 ${className}`}
        aria-label={uppercaseText}
      >
        {words.map((word, wordIdx) => {
          return (
            <span key={`word-${wordIdx}`} className="inline-flex gap-x-2 sm:gap-x-3.5">
              {word.split('').map((char, charIdx) => {
                let globalIdx = 0;
                for (let w = 0; w < wordIdx; w++) {
                  globalIdx += words[w].length;
                }
                globalIdx += charIdx;

                const isVisible = globalIdx < typedCount;
                const isCurrentCursor = globalIdx === typedCount - 1 && cursorVisible;
                const isLocked = lockedIndices.has(globalIdx);

                return (
                  <span
                    key={`slot-${globalIdx}-${char}`}
                    className="inline-flex items-center justify-center relative"
                    style={{ minWidth: '0.74em', height: '1.25em' }}
                  >
                    {/* Molde: Silueta Pura Tallada en Bajo Relieve */}
                    <span
                      className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none z-0"
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
                        isVisible ? 'opacity-100' : 'opacity-0'
                      } ${
                        isLocked
                          ? 'drop-shadow-[0_2px_16px_rgba(255,255,255,0.45)]'
                          : 'drop-shadow-[0_6px_22px_rgba(0,0,0,0.9)]'
                      }`}
                      style={{
                        willChange: 'transform',
                        zIndex: isLocked ? 10 : 40,
                      }}
                    >
                      {char}
                    </span>

                    {/* Cursor de Escritura */}
                    {isCurrentCursor && (
                      <span
                        className={`absolute -right-1 sm:-right-2 top-1 bottom-1 w-[3px] bg-[var(--color-brand-accent)] rounded-full ${
                          titleConfirmed
                            ? 'scale-y-125 shadow-[0_0_16px_var(--color-brand-accent)] bg-white'
                            : 'animate-pulse shadow-[0_0_8px_var(--color-brand-accent)]'
                        } transition-all duration-200 pointer-events-none z-50`}
                      />
                    )}
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

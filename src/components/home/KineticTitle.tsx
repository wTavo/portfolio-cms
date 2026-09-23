/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Llenado Líquido Radial desde el Centro del Molde" (Radial Liquid Bloom).
 * En cada letra, el metal líquido/luz brota desde el centro geométrico del molde
 * y se expande radialmente en una onda fluida hacia los extremos hasta colmar la silueta.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

export default function KineticTitle({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fillProgress, setFillProgress] = useState<{ [key: string]: number }>({});
  const [filledLetters, setFilledLetters] = useState<{ [key: string]: boolean }>({});
  const [isAllSettled, setIsAllSettled] = useState(false);
  const [isFinalGlow, setIsFinalGlow] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  // Lista de todas las letras con claves únicas
  const letterItems = useMemo(() => {
    const list: { wordIdx: number; charIdx: number; char: string; key: string }[] = [];
    words.forEach((word, wordIdx) => {
      word.split('').forEach((char, charIdx) => {
        list.push({
          wordIdx,
          charIdx,
          char,
          key: `${wordIdx}-${charIdx}-${char}`,
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

  const runRadialLiquidFillingSequence = () => {
    setFillProgress({});
    setFilledLetters({});
    setIsAllSettled(false);
    setIsFinalGlow(false);

    // 1. Pausa inicial para apreciar los moldes vacíos esperando
    const initialDelay = 400;
    const letterFillDuration = 850; // Duración de la expansión radial por letra
    const staggerDelay = 65; // Desfase rítmico entre moldes

    letterItems.forEach((item, index) => {
      const startAt = initialDelay + index * staggerDelay;

      setTimeout(() => {
        const startTime = performance.now();

        const updateRadialBloom = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / letterFillDuration, 1);
          // Easing elástico-fluido de expansión
          const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          
          setFillProgress((prev) => ({ ...prev, [item.key]: eased }));

          if (progress < 1) {
            requestAnimationFrame(updateRadialBloom);
          } else {
            // Molde 100% colmado desde el centro hasta las esquinas
            setFilledLetters((prev) => ({ ...prev, [item.key]: true }));

            // Si es la última letra
            if (index === letterItems.length - 1) {
              setTimeout(() => {
                setIsAllSettled(true);
                setIsFinalGlow(true);

                // Apagar cálculos de animación (0% CPU en reposo)
                setTimeout(() => {
                  setIsFinalGlow(false);
                }, 1200);
              }, 300);
            }
          }
        };

        requestAnimationFrame(updateRadialBloom);
      }, startAt);
    });
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      const fullProgress: { [key: string]: number } = {};
      const fullFilled: { [key: string]: boolean } = {};
      letterItems.forEach((item) => {
        fullProgress[item.key] = 1;
        fullFilled[item.key] = true;
      });
      setFillProgress(fullProgress);
      setFilledLetters(fullFilled);
      setIsAllSettled(true);
      return;
    }

    const t = setTimeout(() => {
      runRadialLiquidFillingSequence();
    }, 350);

    return () => clearTimeout(t);
  }, [letterItems, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-2 sm:gap-y-3.5 md:gap-y-4 text-center select-none ${className}`}>
        <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-wider text-white leading-[1.0] uppercase">
          {words[0]}
        </span>
        <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.25em] sm:tracking-[0.32em] text-white/90 leading-[1.0] uppercase">
          {words[1]}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[620px] py-12 sm:py-16 select-none overflow-visible">
      {/* Resplandor ambiental de estudio */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/14 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isFinalGlow ? 'opacity-100 scale-105' : isAllSettled ? 'opacity-35 scale-100' : 'opacity-15 scale-95'
        }`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4 gap-y-2 sm:gap-y-3 md:gap-y-4">
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
              className={`inline-flex items-center justify-center relative ${fontClasses} ${
                isFirstWord ? 'gap-x-1 sm:gap-x-2 md:gap-x-3' : 'gap-x-1 sm:gap-x-1.5 md:gap-x-2.5'
              }`}
            >
              {word.split('').map((char, charIdx) => {
                const key = `${wordIdx}-${charIdx}-${char}`;
                const currentFill = fillProgress[key] ?? 0;
                const isComplete = filledLetters[key] || currentFill >= 1;
                const isActivelyFilling = currentFill > 0 && currentFill < 1;

                // Radio de expansión radial desde el centro (0% a 160% para cubrir todas las esquinas)
                const radialRadiusPercent = currentFill * 160;

                return (
                  <div
                    key={`slot-${key}`}
                    className="relative inline-flex items-center justify-center overflow-visible"
                    style={{ minWidth: slotMinWidth }}
                  >
                    {/* 🔲 CAPA 1: EL MOLDE HUECO BISELADO (SILUETA BASE) */}
                    <span
                      className="select-none pointer-events-none uppercase leading-[1.0] transition-opacity duration-700"
                      style={{
                        WebkitTextStroke: isComplete
                          ? '1.2px rgba(255, 255, 255, 0.4)'
                          : isActivelyFilling
                          ? '1.5px rgba(255, 255, 255, 0.8)'
                          : '1.2px rgba(255, 255, 255, 0.24)',
                        color: 'rgba(255, 255, 255, 0.03)',
                        textShadow: isActivelyFilling
                          ? '0 0 16px rgba(255, 255, 255, 0.35), inset 0 2px 4px rgba(0,0,0,0.9)'
                          : '0 0 8px rgba(255, 255, 255, 0.05), inset 0 2px 4px rgba(0,0,0,0.9)',
                      }}
                      aria-hidden="true"
                    >
                      {char}
                    </span>

                    {/* 🌊 CAPA 2: LÍQUIDO LUMINOSO EXPANDIÉNDOSE RADIALMENTE DESDE EL CENTRO */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible"
                      style={{
                        clipPath: isComplete ? 'none' : `circle(${radialRadiusPercent}% at 50% 50%)`,
                        willChange: isActivelyFilling ? 'clip-path' : 'auto',
                      }}
                    >
                      <span
                        className={`inline-block text-white leading-[1.0] uppercase transition-all duration-700 ${
                          isAllSettled
                            ? isFinalGlow
                              ? 'drop-shadow-[0_0_35px_rgba(255,255,255,0.95)] drop-shadow-[0_4px_16px_rgba(255,255,255,0.6)]'
                              : 'drop-shadow-[0_4px_20px_rgba(255,255,255,0.35)]'
                            : isComplete
                            ? 'drop-shadow-[0_0_30px_rgba(255,255,255,1)] text-white'
                            : 'drop-shadow-[0_0_18px_rgba(255,255,255,0.9)]'
                        }`}
                        style={{
                          background: 'radial-gradient(circle at center, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {char}
                      </span>
                    </div>

                    {/* 💫 CAPA 3: ONDA DE CHOQUE / FRENTE DE ONDA RADIAL BRILLANTE DESDE EL CENTRO */}
                    {isActivelyFilling && (
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 blur-[0.8px] shadow-[0_0_16px_4px_rgba(255,255,255,0.95)] pointer-events-none transition-none"
                        style={{
                          width: `${currentFill * 200}%`,
                          height: `${currentFill * 200}%`,
                          opacity: Math.max(0, 1 - currentFill * 0.3),
                        }}
                      />
                    )}
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

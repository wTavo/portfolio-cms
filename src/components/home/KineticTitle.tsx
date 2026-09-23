/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Llenado de Agua Líquida en Moldes Tipográficos con Oleaje Físico".
 * Cada letra actúa como un molde contenedor transparente.
 * El agua blanca entra desde la base y sube de nivel con olas físicas ondulantes en su superficie,
 * llenando progresivamente cada cavidad hasta colmar el molde al 100%.
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
  const [waveTime, setWaveTime] = useState(0);
  const [isAllSettled, setIsAllSettled] = useState(false);

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  // Lista de todas las letras con identificadores únicos
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

  const runWaterMoldFillingSequence = () => {
    setFillProgress({});
    setFilledLetters({});
    setIsAllSettled(false);

    // Orden aleatorio para el llenado de moldes (Fisher-Yates)
    const indices = letterItems.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const initialDelay = 400; // Pausa para contemplar los moldes vacíos
    const letterFillDuration = 2200; // Duración de subida del agua por molde (2.2s)
    const staggerDelay = 120; // Desfase rítmico aleatorio entre letras

    let completedCount = 0;

    // Bucle de animación global para el oleaje y nivel de agua
    let animFrameId: number;
    const startTimeGlobal = performance.now();

    const animateFrame = (now: number) => {
      const elapsedTotal = now - startTimeGlobal;
      setWaveTime(now * 0.004);

      const newProgress: { [key: string]: number } = {};

      letterItems.forEach((item, itemIdx) => {
        const orderPosition = indices.indexOf(itemIdx);
        const letterStart = initialDelay + orderPosition * staggerDelay;

        if (elapsedTotal >= letterStart) {
          const letterElapsed = elapsedTotal - letterStart;
          const rawProgress = Math.min(letterElapsed / letterFillDuration, 1);

          // Easing suave con inercia de subida de agua
          const eased = rawProgress < 0.85
            ? (rawProgress / 0.85) * 0.88
            : 0.88 + (1 - Math.pow(1 - (rawProgress - 0.85) / 0.15, 2)) * 0.12;

          newProgress[item.key] = eased;

          if (rawProgress >= 1 && !filledLetters[item.key]) {
            setFilledLetters((prev) => ({ ...prev, [item.key]: true }));
          }
        }
      });

      setFillProgress((prev) => ({ ...prev, ...newProgress }));

      // Verificar si todas las letras terminaron
      completedCount = Object.keys(newProgress).filter((k) => (newProgress[k] ?? 0) >= 1).length;

      if (completedCount < letterItems.length) {
        animFrameId = requestAnimationFrame(animateFrame);
      } else {
        // Todas las letras están 100% colmadas: apagar bucles (0% CPU/GPU en reposo)
        setIsAllSettled(true);
      }
    };

    animFrameId = requestAnimationFrame(animateFrame);
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

    const timer = setTimeout(() => {
      runWaterMoldFillingSequence();
    }, 250);

    return () => clearTimeout(timer);
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
    <div className="relative w-full flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] md:min-h-[620px] py-12 sm:py-16 select-none overflow-visible cursor-default">
      {/* Resplandor ambiental de estudio ultra suave */}
      <div
        className={`absolute inset-0 w-full h-full bg-radial from-white/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none transition-opacity duration-1000 ease-out ${
          isAllSettled ? 'opacity-40' : 'opacity-15'
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

                // Expansión fluida desde el centro hacia todos los extremos del molde (50% 50%)
                const fluidRadius = currentFill * 145; // 0% a 145% para cubrir esquinas
                const waveAmp = Math.sin(Math.min(currentFill, 1) * Math.PI) * 4.0;
                const waveOffset = Math.sin(waveTime * 5.0 + charIdx * 1.6) * waveAmp;

                const effRadius = Math.max(0, fluidRadius + waveOffset);
                const coreSolid = Math.max(0, effRadius - 18);

                const fluidGradient = `radial-gradient(ellipse 130% 130% at 50% 50%,
                  #ffffff 0%,
                  #ffffff ${coreSolid}%,
                  rgba(255, 255, 255, 0.95) ${effRadius * 0.94}%,
                  transparent ${effRadius}%
                )`;

                return (
                  <div
                    key={`slot-${key}`}
                    className="relative inline-flex items-center justify-center"
                    style={{ minWidth: slotMinWidth }}
                  >
                    {/* 🔲 CAPA 1: PAREDES Y SILUETA DEL MOLDE (LÍMITES FÍSICOS ESTRICTOS) */}
                    <span
                      className="select-none pointer-events-none uppercase leading-[1.0] transition-colors duration-500"
                      style={{
                        WebkitTextStroke: isComplete
                          ? '1px rgba(255, 255, 255, 0.35)'
                          : isActivelyFilling
                          ? '1.2px rgba(255, 255, 255, 0.7)'
                          : '1.2px rgba(255, 255, 255, 0.22)',
                        color: 'transparent',
                      }}
                      aria-hidden="true"
                    >
                      {char}
                    </span>

                    {/* 🌊 CAPA 2: AGUA LÍQUIDA BLANCA SUBIENDO CON OLEAJE Y MENISCO */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      {isComplete ? (
                        <span className="inline-block uppercase leading-[1.0] text-white">
                          {char}
                        </span>
                      ) : isActivelyFilling ? (
                        <span
                          className="inline-block uppercase leading-[1.0]"
                          style={{
                            backgroundImage: fluidGradient,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                          }}
                        >
                          {char}
                        </span>
                      ) : null}
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

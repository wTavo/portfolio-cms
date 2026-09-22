/**
 * @file KineticTitle.tsx
 * @description Título cinético con molde de encaje y física de rebote de letras acelerada por GPU (Directiva 3 y 13).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MOTION_EASINGS } from '../../lib/motion';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

interface LetterData {
  char: string;
  id: string;
  wordIndex: number;
  // Trayectoria de rebote generada
  bounceKeyframes: {
    x: number[];
    y: number[];
    rotate: number[];
  };
  duration: number;
  delay: number;
}

/**
 * Genera trayectorias de rebote pseudoaleatorias pero deterministas para cada letra
 */
function generateLetterTrajectory(index: number, total: number): LetterData['bounceKeyframes'] {
  const angle = (index / total) * Math.PI * 2 + (index % 2 === 0 ? 0.4 : -0.4);
  const distance1 = 120 + (index % 5) * 45;
  const distance2 = 180 + (index % 4) * 55;
  const distance3 = 100 + (index % 3) * 35;

  const x1 = Math.cos(angle) * distance1;
  const y1 = Math.sin(angle) * distance1;

  // Rebote en dirección opuesta
  const x2 = -Math.cos(angle + 0.8) * distance2;
  const y2 = -Math.sin(angle + 0.8) * distance2;

  // Tercer rebote de retorno
  const x3 = Math.sin(angle * 1.5) * distance3;
  const y3 = Math.cos(angle * 1.5) * distance3;

  const rot1 = (index % 2 === 0 ? 1 : -1) * (20 + (index % 4) * 15);
  const rot2 = -rot1 * 1.2;
  const rot3 = rot1 * 0.5;

  return {
    x: [0, x1, x2, x3, 0],
    y: [0, y1, y2, y3, 0],
    rotate: [0, rot1, rot2, rot3, 0],
  };
}

export default function KineticTitle({
  text = 'Portafolio Builder',
  className = '',
}: KineticTitleProps) {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'bouncing' | 'settled'>('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Desencadenar la animación tras el montaje inicial
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimationPhase('settled');
      return;
    }

    // Inicia el desprendimiento tras 1.2s de presencia inicial
    const startTimer = setTimeout(() => {
      setAnimationPhase('bouncing');
    }, 1200);

    // Concluye y asienta las letras en el molde tras 5.2s
    const endTimer = setTimeout(() => {
      setAnimationPhase('settled');
    }, 5200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [prefersReducedMotion]);

  const words = useMemo(() => text.split(' '), [text]);

  // Generación de datos de cada letra con su molde y trayectoria
  const letterItems = useMemo(() => {
    let globalIndex = 0;
    const totalLetters = text.replace(/\s/g, '').length;

    return words.map((word, wordIndex) => {
      return word.split('').map((char) => {
        const index = globalIndex++;
        return {
          char,
          id: `letter-${wordIndex}-${index}-${char}`,
          wordIndex,
          bounceKeyframes: generateLetterTrajectory(index, totalLetters),
          duration: 3.4 + (index % 3) * 0.25,
          delay: (index % 4) * 0.08,
        };
      });
    });
  }, [text, words]);

  if (prefersReducedMotion) {
    return (
      <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.08] ${className}`}>
        {text}
      </h1>
    );
  }

  const isBouncing = animationPhase === 'bouncing';
  const isSettled = animationPhase === 'settled';

  return (
    <h1
      className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] flex flex-wrap justify-center gap-x-4 sm:gap-x-6 select-none ${className}`}
      aria-label={text}
    >
      {letterItems.map((wordLetters, wordIdx) => (
        <span key={`word-${wordIdx}`} className="inline-flex">
          {wordLetters.map((item) => (
            <span
              key={item.id}
              className="relative inline-block"
              style={{ minWidth: '0.55em', textAlign: 'center' }}
            >
              {/* Molde / Silueta de encaje en la base */}
              <span
                className={`absolute inset-0 flex items-center justify-center font-extrabold transition-opacity duration-500 pointer-events-none ${
                  isBouncing ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              >
                {/* Ranura o molde estilizado */}
                <span className="text-[var(--color-text-muted)]/20 drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                  {item.char}
                </span>
                <span className="absolute inset-x-0.5 bottom-1 h-[2px] bg-[var(--color-brand-accent)]/30 rounded-full animate-pulse" />
              </span>

              {/* Letra Cinética Activa con Física Acelerada por GPU */}
              <motion.span
                animate={
                  isBouncing
                    ? {
                        x: item.bounceKeyframes.x,
                        y: item.bounceKeyframes.y,
                        rotate: item.bounceKeyframes.rotate,
                        scale: [1, 1.15, 0.95, 1.05, 1],
                      }
                    : {
                        x: 0,
                        y: 0,
                        rotate: 0,
                        scale: 1,
                      }
                }
                transition={
                  isBouncing
                    ? {
                        duration: item.duration,
                        delay: item.delay,
                        ease: 'easeInOut',
                        times: [0, 0.25, 0.55, 0.85, 1],
                      }
                    : {
                        duration: 0.5,
                        ease: MOTION_EASINGS.decelerate,
                      }
                }
                className={`inline-block text-[var(--color-text-primary)] transition-colors duration-300 ${
                  isSettled ? 'drop-shadow-[0_0_12px_rgba(59,130,246,0.15)]' : ''
                }`}
                style={{ willChange: 'transform' }}
              >
                {item.char}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

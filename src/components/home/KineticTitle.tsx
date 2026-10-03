/**
 * @file KineticTitle.tsx
 * @description Título Cinético: "Cierre de Circuito Vectorial y Encendido de Foco con Parpadeo Eléctrico".
 * Las siluetas se trazan iluminadas simulando cables/filamentos. Al conectarse y cerrar el circuito,
 * la corriente eléctrica fluye y el color interior se enciende con un parpadeo de foco antes de quedar fijo.
 * Integra el monograma oficial de la marca (BrandLogoIcon) como «P» inicial de «PORTAFOLIO».
 */

import { useState, useEffect, useMemo, memo } from 'react';
import { GLYPH_PATHS, BRAND_P_GLYPH } from '../../lib/typography/glyphPaths';
import {
  KineticWordSvg,
  type LetterLayout,
  type WordLayoutData,
  type ThemeColorsPalette,
} from './KineticWordSvg';

interface KineticTitleProps {
  text?: string;
  className?: string;
}

/** Paleta visual adaptativa inmutable (Modo Oscuro / Modo Claro) sin recreación en cada render */
const THEME_COLORS: { dark: ThemeColorsPalette; light: ThemeColorsPalette } = {
  dark: {
    primary: '#fafafa',
    stroke: '#ffffff',
    glowColor: 'rgba(186, 230, 253, 0.85)',
    glowStroke: 'rgba(186, 230, 253, 0.65)',
    brandAccent: '#38bdf8',
    brandStroke: '#38bdf8',
    brandGlowColor: 'rgba(56, 189, 248, 0.85)',
    brandGlowStroke: 'rgba(56, 189, 248, 0.65)',
  },
  light: {
    primary: '#09090b',
    stroke: '#18181b',
    glowColor: 'rgba(37, 99, 235, 0.65)',
    glowStroke: 'rgba(59, 130, 246, 0.55)',
    brandAccent: '#0284c7',
    brandStroke: '#0284c7',
    brandGlowColor: 'rgba(2, 132, 199, 0.65)',
    brandGlowStroke: 'rgba(2, 132, 199, 0.55)',
  },
};

/** Variable en tiempo de ejecución para recordar que la animación introductoria ya se ejecutó y no repetirla al scrollear */
let hasCompletedKineticIntro = false;

function KineticTitleComponent({
  text = 'PORTAFOLIO PROFESIONAL',
  className = '',
}: KineticTitleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light') return false;
      if (current === 'dark') return true;
    }
    return true;
  });
  const alreadyPlayed = hasCompletedKineticIntro;

  const uppercaseText = useMemo(() => text.toUpperCase(), [text]);
  const words = useMemo(() => uppercaseText.split(' '), [uppercaseText]);

  useEffect(() => {
    const updateTheme = () => {
      const dataTheme = document.documentElement.getAttribute('data-theme');
      if (dataTheme) {
        setIsDarkTheme(dataTheme === 'dark');
      } else {
        setIsDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const mediaListener = () => updateTheme();
    mediaQuery.addEventListener('change', mediaListener);

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionMediaQuery.addEventListener('change', motionListener);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', mediaListener);
      motionMediaQuery.removeEventListener('change', motionListener);
    };
  }, []);

  // Calcular la disposición geométrica precisa de cada palabra y letra con índice global secuencial
  const { wordsLayout } = useMemo(() => {
    let globalCounter = 0;
    const layouts: WordLayoutData[] = words.map((word, wordIndex) => {
      // Espaciado entre letras equilibrado
      const letterSpacing = wordIndex === 0 ? 34 : 56;
      let currentX = 0;
      const letters: LetterLayout[] = [];

      for (let charIndex = 0; charIndex < word.length; charIndex++) {
        const char = word[charIndex];
        // Opción 1: Únicamente la P inicial de la primera palabra (PORTAFOLIO) usa el monograma BrandLogo
        const isBrandP = wordIndex === 0 && charIndex === 0 && char === 'P';
        const glyph = isBrandP ? BRAND_P_GLYPH : (GLYPH_PATHS[char] || { d: '', subpaths: [], advanceWidth: 400 });

        letters.push({
          char,
          x: currentX,
          d: glyph.d,
          subpaths: glyph.subpaths && glyph.subpaths.length > 0 ? glyph.subpaths : (glyph.d ? [glyph.d] : []),
          advanceWidth: glyph.advanceWidth,
          globalIndex: globalCounter++,
          wordIndex,
          charIndex,
          isBrandP,
        });

        currentX += glyph.advanceWidth + letterSpacing;
      }

      return {
        word,
        letters,
        totalWidth: Math.max(currentX - letterSpacing, 100),
      };
    });

    return { wordsLayout: layouts };
  }, [words]);

  // Constantes de coreografía simultánea:
  // 1. Fase de Dibujo: TODAS las letras se trazan simultáneamente como cables/filamentos iluminados
  const initialDelay = 0.25;
  const strokeDuration = 2.4; // Ritmo constante y visible de inicio a fin
  const totalStrokeEndTime = initialDelay + strokeDuration; // 2.65s (Momento en que los cables completan la silueta)

  // 2. Iluminación Progresiva: Al conectarse las líneas, el interior y resplandor se van iluminando suavemente poco a poco
  const fillStartDelay = totalStrokeEndTime; // Inicia justo al completarse el trazado de las líneas
  const fillDuration = 1.6; // Duración gradual y continua de la iluminación suave de 0% a 100%

  const [isFloatingActive, setIsFloatingActive] = useState(alreadyPlayed);

  useEffect(() => {
    if (alreadyPlayed) {
      setIsFloatingActive(true);
      return;
    }

    // El movimiento y la finalización de la intro ocurren ESTRICTAMENTE después de que las letras se iluminaron por completo
    const totalTimeMs = (fillStartDelay + fillDuration) * 1000;
    const timer = setTimeout(() => {
      hasCompletedKineticIntro = true;
      // Breve pausa con el texto completamente iluminado antes de iniciar la sutil flotación orgánica
      setTimeout(() => {
        setIsFloatingActive(true);
      }, 300);
    }, totalTimeMs);

    return () => {
      clearTimeout(timer);
      hasCompletedKineticIntro = true;
    };
  }, [alreadyPlayed, fillStartDelay, fillDuration]);

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center justify-center gap-y-1.5 sm:gap-y-3 md:gap-y-6 [@media(max-height:540px)]:gap-y-1 text-center select-none ${className}`}>
        {words.map((word, idx) => (
          <span
            key={`reduced-word-${idx}`}
            className={`font-black tracking-wider text-[var(--color-text-primary)] uppercase leading-none ${
              idx === 0
                ? 'text-4xl sm:text-6xl md:text-8xl lg:text-9xl [@media(max-height:540px)]:text-2xl'
                : 'text-xl sm:text-3xl md:text-5xl lg:text-6xl tracking-[0.25em] [@media(max-height:540px)]:text-base'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  // Consumir paleta visual inmutable adaptativa
  const colors = isDarkTheme ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center select-none overflow-visible ${className}`}
    >
      {/* Contenedor central: la flotación orgánica solo inicia ESTRICTAMENTE después de que las letras están iluminadas (Directivas 3 y 13) */}
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-5xl px-3 sm:px-6 gap-y-1 sm:gap-y-2 md:gap-y-4 [@media(max-height:540px)]:gap-y-1 z-10 overflow-visible transform-gpu ${
          isFloatingActive ? 'animate-float-subtle' : ''
        }`}
      >
        {wordsLayout.map((wordLayout, wordIdx) => (
          <KineticWordSvg
            key={`kinetic-word-${wordLayout.word}-${wordIdx}`}
            wordLayout={wordLayout}
            wordIdx={wordIdx}
            alreadyPlayed={alreadyPlayed}
            colors={colors}
            strokeDelay={initialDelay}
            fillDelay={fillStartDelay}
            strokeDuration={strokeDuration}
            fillDuration={fillDuration}
          />
        ))}
      </div>
    </div>
  );
}

const KineticTitle = memo(KineticTitleComponent);
export default KineticTitle;

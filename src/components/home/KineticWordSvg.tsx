/**
 * @file KineticWordSvg.tsx
 * @description Renderizador SVG modular para cada palabra del Título Cinético.
 * Descompone el dibujo de cables multi-stroke a 120 FPS y la posterior iluminación de relleno con soporte para monograma de marca.
 */

import { memo } from 'react';
import { motion } from 'motion/react';
import { BRAND_P_GLYPH } from '../../lib/typography/glyphPaths';

export interface LetterLayout {
  char: string;
  x: number;
  d: string;
  subpaths: string[];
  advanceWidth: number;
  globalIndex: number;
  wordIndex: number;
  charIndex: number;
  isBrandP?: boolean;
}

export interface WordLayoutData {
  word: string;
  letters: LetterLayout[];
  totalWidth: number;
}

export interface ThemeColorsPalette {
  primary: string;
  stroke: string;
  glowColor: string;
  glowStroke: string;
  brandAccent: string;
  brandStroke: string;
  brandGlowColor: string;
  brandGlowStroke: string;
}

interface KineticWordSvgProps {
  wordLayout: WordLayoutData;
  wordIdx: number;
  alreadyPlayed: boolean;
  colors: ThemeColorsPalette;
  strokeDelay: number;
  fillDelay: number;
  strokeDuration: number;
  fillDuration: number;
}

/** Renderiza la geometría del resplandor difuso de una letra o del monograma de marca */
function LetterGlow({ letter, colors, wordIdx }: { letter: LetterLayout; colors: ThemeColorsPalette; wordIdx: number }) {
  if (letter.isBrandP) {
    return (
      <g key={`glow-letter-${wordIdx}-${letter.charIndex}`} transform={`translate(${letter.x}, 0)`}>
        <path d={BRAND_P_GLYPH.pillarPath} fillRule="nonzero" fill={colors.glowColor} />
        <path d={BRAND_P_GLYPH.loopPath} fillRule="evenodd" fill={colors.brandGlowColor} />
      </g>
    );
  }
  return (
    <path
      key={`glow-letter-${wordIdx}-${letter.charIndex}`}
      d={letter.d}
      transform={`translate(${letter.x}, 0)`}
      fillRule="nonzero"
      fill={colors.glowColor}
    />
  );
}

/** Renderiza la geometría del relleno sólido iluminado de una letra o del monograma de marca */
function LetterFill({ letter, colors, wordIdx }: { letter: LetterLayout; colors: ThemeColorsPalette; wordIdx: number }) {
  if (letter.isBrandP) {
    return (
      <g key={`fill-letter-${wordIdx}-${letter.charIndex}`} transform={`translate(${letter.x}, 0)`}>
        <path
          d={BRAND_P_GLYPH.pillarPath}
          fillRule="nonzero"
          fill={colors.primary}
          stroke={colors.primary}
          strokeWidth={1}
        />
        <path
          d={BRAND_P_GLYPH.loopPath}
          fillRule="evenodd"
          fill={colors.brandAccent}
          stroke={colors.brandAccent}
          strokeWidth={1}
        />
      </g>
    );
  }
  return (
    <path
      key={`fill-letter-${wordIdx}-${letter.charIndex}`}
      d={letter.d}
      transform={`translate(${letter.x}, 0)`}
      fillRule="nonzero"
      fill={colors.primary}
      stroke={colors.primary}
      strokeWidth={1}
    />
  );
}

/**
 * Componente que renderiza el contenedor SVG y las capas de animación para una palabra completa.
 */
function KineticWordSvgComponent({
  wordLayout,
  wordIdx,
  alreadyPlayed,
  colors,
  strokeDelay,
  fillDelay,
  strokeDuration,
  fillDuration,
}: KineticWordSvgProps) {
  const isFirstLine = wordIdx === 0;
  const containerClasses = isFirstLine
    ? 'w-full max-w-5xl max-h-[min(15dvh,160px)] [@media(max-height:540px)]:max-h-[46px] h-auto object-contain'
    : 'w-[90%] max-w-4xl max-h-[min(13dvh,140px)] [@media(max-height:540px)]:max-h-[38px] h-auto object-contain';

  return (
    <svg
      key={`word-svg-${wordLayout.word}-${wordIdx}`}
      viewBox={`0 75 ${wordLayout.totalWidth} 750`}
      preserveAspectRatio="xMidYMid meet"
      className={`overflow-visible select-none ${containerClasses}`}
      aria-label={wordLayout.word}
    >
      <defs>
        <filter id={`bulb-glow-${wordIdx}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {alreadyPlayed ? (
        <>
          {/* 1. Capa de resplandor fija */}
          <g filter={`url(#bulb-glow-${wordIdx})`} className="pointer-events-none opacity-100">
            {wordLayout.letters.map((letter) => (
              <LetterGlow key={`static-glow-${letter.globalIndex}`} letter={letter} colors={colors} wordIdx={wordIdx} />
            ))}
          </g>

          {/* 2. Silueta del molde con trazos estáticos */}
          {wordLayout.letters.map((letter) => (
            <g
              key={`letter-mold-${wordIdx}-${letter.charIndex}-${letter.char}`}
              transform={`translate(${letter.x}, 0)`}
              className="overflow-visible"
            >
              {letter.subpaths.map((subD, subIdx) => {
                const isBrandLoop = letter.isBrandP && subIdx > 0;
                const glowStrokeColor = isBrandLoop ? colors.brandGlowStroke : colors.glowStroke;
                const coreStrokeColor = isBrandLoop ? colors.brandStroke : colors.stroke;

                return (
                  <g key={`mold-strokes-${subIdx}`}>
                    <path
                      d={subD}
                      stroke={glowStrokeColor}
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      opacity={0.45}
                    />
                    <path
                      d={subD}
                      stroke={glowStrokeColor}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      opacity={0.75}
                    />
                    <path
                      d={subD}
                      stroke={coreStrokeColor}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      opacity={1}
                    />
                  </g>
                );
              })}
            </g>
          ))}

          {/* 3. Capa de relleno sólido estática */}
          <g opacity={1}>
            {wordLayout.letters.map((letter) => (
              <LetterFill key={`static-fill-${letter.globalIndex}`} letter={letter} colors={colors} wordIdx={wordIdx} />
            ))}
          </g>
        </>
      ) : (
        <>
          {/* 1. CAPA DE RESPLANDOR AGRUPADA POR PALABRA (1 único pase de filtro GPU) */}
          <motion.g
            filter={`url(#bulb-glow-${wordIdx})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: fillDuration,
              delay: fillDelay,
              ease: [0.2, 0, 0, 1],
            }}
            className="pointer-events-none"
          >
            {wordLayout.letters.map((letter) => (
              <LetterGlow key={`motion-glow-${letter.globalIndex}`} letter={letter} colors={colors} wordIdx={wordIdx} />
            ))}
          </motion.g>

          {/* 2. SILUETA DEL MOLDE (Trazado simultáneo de filamentos con técnica Multi-Stroke a 120 FPS) */}
          {wordLayout.letters.map((letter) => (
            <g
              key={`letter-mold-${wordIdx}-${letter.charIndex}-${letter.char}`}
              transform={`translate(${letter.x}, 0)`}
              className="overflow-visible"
            >
              {letter.subpaths.map((subD, subIdx) => {
                const isBrandLoop = letter.isBrandP && subIdx > 0;
                const glowStrokeColor = isBrandLoop ? colors.brandGlowStroke : colors.glowStroke;
                const coreStrokeColor = isBrandLoop ? colors.brandStroke : colors.stroke;

                return (
                  <g key={`mold-strokes-${subIdx}`}>
                    {/* Resplandor exterior difuso */}
                    <motion.path
                      d={subD}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.45 }}
                      transition={{
                        pathLength: { duration: strokeDuration, delay: strokeDelay, ease: 'linear' },
                        opacity: { duration: 0.05, delay: strokeDelay },
                      }}
                      stroke={glowStrokeColor}
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                    />
                    {/* Resplandor medio */}
                    <motion.path
                      d={subD}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.75 }}
                      transition={{
                        pathLength: { duration: strokeDuration, delay: strokeDelay, ease: 'linear' },
                        opacity: { duration: 0.05, delay: strokeDelay },
                      }}
                      stroke={glowStrokeColor}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                    />
                    {/* Núcleo del filamento nítido */}
                    <motion.path
                      d={subD}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: strokeDuration, delay: strokeDelay, ease: 'linear' },
                        opacity: { duration: 0.05, delay: strokeDelay },
                      }}
                      stroke={coreStrokeColor}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </g>
          ))}

          {/* 3. CAPA DE RELLENO SÓLIDO AGRUPADA POR PALABRA (Iluminación simultánea suave) */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: fillDuration,
              delay: fillDelay,
              ease: [0.2, 0, 0, 1],
            }}
          >
            {wordLayout.letters.map((letter) => (
              <LetterFill key={`motion-fill-${letter.globalIndex}`} letter={letter} colors={colors} wordIdx={wordIdx} />
            ))}
          </motion.g>
        </>
      )}
    </svg>
  );
}

export const KineticWordSvg = memo(KineticWordSvgComponent);

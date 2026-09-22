/**
 * @file DualShowcase.tsx
 * @description Portal interactivo profesional para el dúo de creadores con navegación fija unificada, animación suave de título por scroll y tarjetas minimalistas.
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import type { CreatorProfile, ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import { ArrowRightIcon, RocketIcon } from '../icons/Icons';
import { staggerContainerVariants, fadeSlideUpVariants } from '../../lib/motion';

interface DualShowcaseProps {
  data: ShowcaseData;
}

/** Obtiene las iniciales o monograma a partir del nombre */
function getMonogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function DualShowcase({ data }: DualShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  // Animaciones de escala, opacidad y elevación del Hero basadas en el scroll
  const heroScale = useTransform(scrollY, [0, 180], [1, 0.9]);
  const heroOpacity = useTransform(scrollY, [0, 220], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [0, 220], [0, -30]);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const { creators } = data;

  return (
    <div className="w-full relative selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)]">
      {/* Barra de Navegación Superior Única (Sticky / Fixed) */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--color-bg-base)]/85 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-3 shadow-[var(--shadow-card)]'
            : 'bg-transparent border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Título en la barra superior que entra con animación al scrollear */}
          <div className="min-w-[180px] flex items-center">
            <AnimatePresence>
              {isScrolled && (
                <motion.a
                  href="/"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  className="flex items-center gap-2.5 font-bold text-sm sm:text-base tracking-tight text-[var(--color-text-primary)] hover:opacity-90 transition-opacity"
                >
                  <div className="p-1.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
                    <RocketIcon size={14} className="text-[var(--color-brand-accent)]" />
                  </div>
                  <span>{i18n.showcase.title}</span>
                </motion.a>
              )}
            </AnimatePresence>
          </div>

          {/* Botón único de Acceso */}
          <a
            href="/login"
            className="min-h-(--size-touch-target) px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xs border border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-brand-accent)] transition-all inline-flex items-center shadow-[var(--shadow-card)]"
          >
            <span>{i18n.showcase.login}</span>
          </a>
        </div>
      </header>

      {/* Hero Central (Limpio, sin badges ni elementos encima del título) */}
      <motion.section
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroTranslateY,
        }}
        className="min-h-[42vh] sm:min-h-[48vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-6 max-w-3xl mx-auto space-y-3"
      >
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.1]">
          {i18n.showcase.title}
        </h1>

        <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed pt-1">
          {i18n.showcase.subtitle}
        </p>
      </motion.section>

      {/* Sección de Tarjetas Duales Minimalistas (Gateways) */}
      <motion.section
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {creators.map((creator) => {
            const monogram = getMonogram(creator.name);

            return (
              <motion.a
                key={creator.id}
                href={`/${creator.slug}`}
                variants={fadeSlideUpVariants}
                onHoverStart={() => setHoveredId(creator.id)}
                onHoverEnd={() => setHoveredId(null)}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25, ease: [0, 0, 0, 1] }}
                className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] hover:border-[var(--color-brand-accent)] transition-all overflow-hidden cursor-pointer block"
              >
                {/* Resplandor ambiental suave reactivo al cursor */}
                <div
                  className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[var(--radius-xl)] bg-radial from-[var(--color-brand-accent)]/15 via-transparent to-transparent"
                  aria-hidden="true"
                />

                {/* Contenido Principal de la Tarjeta */}
                <div className="relative z-10 space-y-6">
                  {/* Monograma / Glifo de Identidad */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center font-mono font-bold text-sm text-[var(--color-brand-accent)] group-hover:border-[var(--color-brand-accent)] group-hover:bg-[var(--color-bg-surface)] transition-colors">
                      {monogram}
                    </div>

                    <span className="text-xs font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                      /{creator.slug}
                    </span>
                  </div>

                  {/* Nombre y Especialidad */}
                  <div className="space-y-1.5 pt-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                      {creator.name}
                    </h2>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                      {creator.role}
                    </p>
                  </div>
                </div>

                {/* Pie con Acción Interactiva */}
                <div className="relative z-10 pt-8 mt-8 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                    {i18n.showcase.explorePortfolio}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)] group-hover:translate-x-1 transition-all">
                    <ArrowRightIcon size={14} />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}

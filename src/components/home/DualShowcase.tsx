/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con transición fluida bidireccional por scroll entre la pantalla de bienvenida y los portafolios.
 */

import React, { useState, useEffect, useCallback } from 'react';
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

  // El título central se desvanece por completo antes de los 140px
  const heroScale = useTransform(scrollY, [0, 140], [1, 0.92]);
  const heroOpacity = useTransform(scrollY, [0, 120], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [0, 140], [0, -30]);
  const indicatorOpacity = useTransform(scrollY, [0, 60], [1, 0]);

  // La barra de navegación y su título solo aparecen cuando el central ya desapareció por completo
  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 180);
    });
  }, [scrollY]);

  // Desplazamiento suave hacia arriba (pantalla de bienvenida / título)
  const scrollToHero = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Desplazamiento suave hacia abajo (sección de portafolios)
  const scrollToPortfolios = useCallback(() => {
    const target = document.getElementById('portfolios');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Transición suave bidireccional mediante rueda del ratón
  useEffect(() => {
    let isTransitioning = false;

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;

      const currentScroll = window.scrollY;
      const vh = window.innerHeight;

      // 1. Scroll hacia abajo desde el hero de bienvenida
      if (currentScroll < vh * 0.4 && e.deltaY > 18) {
        isTransitioning = true;
        scrollToPortfolios();
        setTimeout(() => {
          isTransitioning = false;
        }, 850);
      }
      // 2. Scroll hacia arriba regresando desde la sección de portafolios al título
      else if (currentScroll > 120 && currentScroll <= vh * 1.15 && e.deltaY < -18) {
        isTransitioning = true;
        scrollToHero();
        setTimeout(() => {
          isTransitioning = false;
        }, 850);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [scrollToHero, scrollToPortfolios]);

  const { creators } = data;

  return (
    <div className="w-full relative selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)]">
      {/* Barra de Navegación Superior Fija */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--color-bg-base)]/85 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-3 shadow-[var(--shadow-card)]'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Título en la barra superior: Permite volver suavemente a la pantalla de bienvenida */}
          <div className="min-w-[180px] flex items-center">
            <AnimatePresence>
              {isScrolled && (
                <motion.button
                  type="button"
                  onClick={scrollToHero}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                  className="flex items-center gap-2.5 font-bold text-sm sm:text-base tracking-tight text-[var(--color-text-primary)] hover:opacity-90 transition-opacity cursor-pointer text-left"
                  aria-label="Volver al inicio"
                >
                  <div className="p-1.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
                    <RocketIcon size={14} className="text-[var(--color-brand-accent)]" />
                  </div>
                  <span>{i18n.showcase.title}</span>
                </motion.button>
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

      {/* Pantalla 1: Hero de Bienvenida (100vh exclusivo para el título) */}
      <section
        id="hero"
        className="h-screen min-h-[600px] flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto relative select-none"
      >
        <motion.div
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            y: heroTranslateY,
          }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.08]">
            {i18n.showcase.title}
          </h1>

          <p className="text-base sm:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
            {i18n.showcase.subtitle}
          </p>
        </motion.div>

        {/* Indicador interactivo de scroll hacia abajo */}
        <motion.button
          type="button"
          onClick={scrollToPortfolios}
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-[var(--radius-md)] p-1"
          aria-label="Desplazarse a los portafolios"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-accent)] transition-colors">
            Scroll
          </span>
          <div className="w-5 h-8 rounded-full border border-[var(--color-border-default)] group-hover:border-[var(--color-brand-accent)] flex items-start justify-center p-1 transition-colors">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1 h-2 rounded-full bg-[var(--color-brand-accent)]"
            />
          </div>
        </motion.button>
      </section>

      {/* Pantalla 2: Sección de Portafolios (Aparece fluidamente al scrollear) */}
      <section
        id="portfolios"
        className="min-h-screen flex flex-col justify-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32"
      >
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full"
        >
          {creators.map((creator) => {
            const monogram = getMonogram(creator.name);

            return (
              <motion.a
                key={creator.id}
                href={`/${creator.slug}`}
                variants={fadeSlideUpVariants}
                onHoverStart={() => setHoveredId(creator.id)}
                onHoverEnd={() => setHoveredId(null)}
                whileHover={{ y: -6, scale: 1.015 }}
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
        </motion.div>
      </section>
    </div>
  );
}

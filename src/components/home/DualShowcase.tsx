/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con transición fluida bidireccional por scroll (1 solo gesto) entre la pantalla de bienvenida y los portafolios.
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

  // El título central se desvanece por completo antes de los 120px
  const heroScale = useTransform(scrollY, [0, 140], [1, 0.92]);
  const heroOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [0, 140], [0, -30]);
  const indicatorOpacity = useTransform(scrollY, [0, 60], [1, 0]);

  // Desplazamiento preciso entre secciones
  const goToSection = useCallback((sectionIndex: number) => {
    if (sectionIndex === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('portfolios');
      if (el) {
        window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      }
    }
  }, []);

  // La barra de navegación y su título solo aparecen cuando el central ya desapareció por completo
  useEffect(() => {
    return scrollY.on('change', (latest) => {
      const vh = window.innerHeight || 800;
      setIsScrolled(latest > vh * 0.4);
    });
  }, [scrollY]);

  // Transición suave instantánea en un solo gesto de scroll (rueda, teclado y táctil)
  useEffect(() => {
    let isTransitioning = false;
    let touchStartY = 0;

    const lockTransition = () => {
      isTransitioning = true;
      setTimeout(() => {
        isTransitioning = false;
      }, 750);
    };

    // 1. Manejo de rueda del ratón (Mouse wheel)
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;

      const currentScroll = window.scrollY;
      const vh = window.innerHeight;
      const midPoint = vh * 0.45;

      // Scroll hacia abajo desde la pantalla 1 -> ir a pantalla 2
      if (currentScroll < midPoint && e.deltaY > 10) {
        lockTransition();
        goToSection(1);
      }
      // Scroll hacia arriba desde la pantalla 2 -> regresar a pantalla 1
      else if (currentScroll >= midPoint && e.deltaY < -10) {
        lockTransition();
        goToSection(0);
      }
    };

    // 2. Manejo de teclado (Flechas y Espacio)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      const currentScroll = window.scrollY;
      const vh = window.innerHeight;
      const midPoint = vh * 0.45;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key) && currentScroll < midPoint) {
        e.preventDefault();
        lockTransition();
        goToSection(1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && currentScroll >= midPoint) {
        e.preventDefault();
        lockTransition();
        goToSection(0);
      }
    };

    // 3. Manejo táctil (Swipe)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      const currentScroll = window.scrollY;
      const vh = window.innerHeight;
      const midPoint = vh * 0.45;

      // Deslizar hacia arriba (scroll down)
      if (diffY > 40 && currentScroll < midPoint) {
        lockTransition();
        goToSection(1);
      }
      // Deslizar hacia abajo (scroll up)
      else if (diffY < -40 && currentScroll >= midPoint) {
        lockTransition();
        goToSection(0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToSection]);

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
                  onClick={() => goToSection(0)}
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

      {/* Pantalla 1: Hero de Bienvenida (100vh exacto) */}
      <section
        id="hero"
        className="h-screen min-h-[580px] snap-start snap-always flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto relative select-none"
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
          onClick={() => goToSection(1)}
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-[var(--radius-md)] p-1"
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

      {/* Pantalla 2: Sección de Portafolios (100vh exacto con tarjetas y pie de página integrado) */}
      <section
        id="portfolios"
        className="h-screen min-h-[580px] snap-start snap-always flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6"
      >
        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mx-auto"
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
                  className="group relative flex flex-col justify-between p-7 sm:p-9 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] hover:border-[var(--color-brand-accent)] transition-all overflow-hidden cursor-pointer block"
                >
                  {/* Resplandor ambiental suave reactivo al cursor */}
                  <div
                    className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[var(--radius-xl)] bg-radial from-[var(--color-brand-accent)]/15 via-transparent to-transparent"
                    aria-hidden="true"
                  />

                  {/* Contenido Principal de la Tarjeta */}
                  <div className="relative z-10 space-y-5">
                    {/* Monograma / Glifo de Identidad */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center font-mono font-bold text-sm text-[var(--color-brand-accent)] group-hover:border-[var(--color-brand-accent)] group-hover:bg-[var(--color-bg-surface)] transition-colors">
                        {monogram}
                      </div>

                      <span className="text-xs font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                        /{creator.slug}
                      </span>
                    </div>

                    {/* Nombre y Especialidad */}
                    <div className="space-y-1 pt-1">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                        {creator.name}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                        {creator.role}
                      </p>
                    </div>
                  </div>

                  {/* Pie con Acción Interactiva */}
                  <div className="relative z-10 pt-6 mt-6 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                      {i18n.showcase.explorePortfolio}
                    </span>

                    <div className="w-7 h-7 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)] group-hover:translate-x-1 transition-all">
                      <ArrowRightIcon size={13} />
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>

        {/* Pie de Página Integrado en la 2da Pantalla */}
        <footer className="pt-4 text-center text-[11px] text-[var(--color-text-muted)] opacity-70">
          <p>© {new Date().getFullYear()} Portafolio Builder • Crafted with Astro, React & Cloudflare</p>
        </footer>
      </section>
    </div>
  );
}

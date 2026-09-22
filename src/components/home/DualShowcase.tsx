/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con animación cinemática fluida basada en estados y título con física cinética.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CreatorProfile, ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import { ArrowRightIcon, RocketIcon } from '../icons/Icons';
import KineticTitle from './KineticTitle';
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  staggerContainerVariants,
  fadeSlideUpVariants,
} from '../../lib/motion';

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
  const [currentView, setCurrentView] = useState<'hero' | 'portfolios'>('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isTransitioningRef = useRef(false);

  const { creators } = data;

  const changeView = useCallback((nextView: 'hero' | 'portfolios') => {
    if (isTransitioningRef.current || currentView === nextView) return;
    isTransitioningRef.current = true;
    setCurrentView(nextView);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [currentView]);

  // Manejo de eventos de rueda de ratón, gestos táctiles y teclado sin conflicto de scrollbar
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;

      if (e.deltaY > 0 && currentView === 'hero') {
        changeView('portfolios');
      } else if (e.deltaY < 0 && currentView === 'portfolios') {
        changeView('hero');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key) && currentView === 'hero') {
        e.preventDefault();
        changeView('portfolios');
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && currentView === 'portfolios') {
        e.preventDefault();
        changeView('hero');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      if (diffY > 35 && currentView === 'hero') {
        changeView('portfolios');
      } else if (diffY < -35 && currentView === 'portfolios') {
        changeView('hero');
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
  }, [currentView, changeView]);

  const isPortfolios = currentView === 'portfolios';

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-between selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)]">
      {/* Barra de Navegación Superior Fija */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isPortfolios
            ? 'bg-[var(--color-bg-base)]/85 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-3 shadow-[var(--shadow-card)]'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Título en la barra superior: Solo visible y animado en la vista de portafolios */}
          <div className="min-w-[180px] flex items-center">
            <AnimatePresence mode="wait">
              {isPortfolios && (
                <motion.button
                  key="header-brand"
                  type="button"
                  onClick={() => changeView('hero')}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.decelerate }}
                  className="flex items-center gap-2.5 font-bold text-sm sm:text-base tracking-tight text-[var(--color-text-primary)] hover:opacity-90 transition-opacity cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-[var(--radius-sm)] p-0.5"
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

      {/* Escenario de Contenido Principal con Transiciones Cinemáticas */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentView === 'hero' ? (
            /* Vista 1: Pantalla de Bienvenida (Título Cinético) */
            <motion.section
              key="hero-view"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.decelerate }}
              className="w-full h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto relative select-none"
            >
              <KineticTitle text={i18n.showcase.title} />

              {/* Indicador interactivo de scroll */}
              <button
                type="button"
                onClick={() => changeView('portfolios')}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-[var(--radius-md)] p-1"
                aria-label="Ver portafolios"
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
              </button>
            </motion.section>
          ) : (
            /* Vista 2: Portafolios Gateway */
            <motion.section
              key="portfolios-view"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.decelerate }}
              className="w-full h-full flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6"
            >
              <div className="flex-1 flex flex-col justify-center">
                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
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
                        transition={{ duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.decelerate }}
                        className="group relative flex flex-col justify-between p-7 sm:p-9 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] hover:border-[var(--color-brand-accent)] transition-all overflow-hidden cursor-pointer block"
                      >
                        {/* Resplandor ambiental reactivo al cursor */}
                        <div
                          className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[var(--radius-xl)] bg-radial from-[var(--color-brand-accent)]/15 via-transparent to-transparent"
                          aria-hidden="true"
                        />

                        {/* Contenido de la Tarjeta */}
                        <div className="relative z-10 space-y-5">
                          {/* Monograma / Identificador */}
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

                        {/* Pie Interactivo */}
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

              {/* Pie de Página */}
              <footer className="pt-4 text-center text-[11px] text-[var(--color-text-muted)] opacity-70">
                <p>© {new Date().getFullYear()} Portafolio Builder • Crafted with Astro, React & Cloudflare</p>
              </footer>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

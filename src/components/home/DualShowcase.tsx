/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con animación cinemática fluida basada en estados y título con física cinética.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimate } from 'motion/react';
import type { CreatorProfile, ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import { ArrowRightIcon, RocketIcon, ChevronDownIcon, MailIcon, CodeIcon, PaletteIcon, UserIcon } from '../icons/Icons';
import KineticTitle from './KineticTitle';
import TopographicBackground from './TopographicBackground';
import ThemeToggle from '../ui/ThemeToggle';
import ContactModal from './ContactModal';
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  staggerContainerVariants,
  fadeSlideUpVariants,
} from '../../lib/motion';

interface DualShowcaseProps {
  data: ShowcaseData;
}

/** Retorna el icono SVG vectorial según la especialidad del creador */
function getCreatorIcon(slug: string, role: string) {
  const normalized = `${slug} ${role}`.toLowerCase();
  if (
    normalized.includes('design') ||
    normalized.includes('diseñador') ||
    normalized.includes('creative') ||
    normalized.includes('partner') ||
    normalized.includes('producto')
  ) {
    return <PaletteIcon size={22} className="text-[var(--color-text-primary)]" />;
  }
  if (
    normalized.includes('gustavo') ||
    normalized.includes('software') ||
    normalized.includes('architect') ||
    normalized.includes('dev') ||
    normalized.includes('ingeniero')
  ) {
    return <CodeIcon size={22} className="text-[var(--color-text-primary)]" />;
  }
  return <UserIcon size={22} className="text-[var(--color-text-primary)]" />;
}

export default function DualShowcase({ data }: DualShowcaseProps) {
  const [currentView, setCurrentView] = useState<'hero' | 'portfolios'>('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [arrowScope, animateArrow] = useAnimate();
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

  // Animación continua y reactiva de la flecha con cadencia armónica idéntica al rebote
  useEffect(() => {
    if (!arrowScope.current || currentView !== 'hero') return;

    if (isButtonHovered) {
      // Al entrar en hover: se traslada suavemente hacia abajo (y: 6) y se mantiene fija
      animateArrow(
        arrowScope.current,
        { y: 6 },
        { duration: 0.35, ease: 'easeOut' }
      );
    } else {
      // Al salir de hover: regresa hacia arriba (y: 0) con la misma velocidad y curva del rebote (0.8s) y continúa el ciclo
      let isCancelled = false;
      animateArrow(
        arrowScope.current,
        { y: 0 },
        { duration: 0.8, ease: 'easeInOut' }
      ).then(() => {
        if (!isCancelled && arrowScope.current) {
          animateArrow(
            arrowScope.current,
            { y: [0, 6, 0] },
            { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
          );
        }
      });

      return () => {
        isCancelled = true;
      };
    }
  }, [isButtonHovered, currentView, animateArrow, arrowScope]);

  // Manejo de eventos de rueda de ratón, gestos táctiles y teclado sin conflicto de scrollbar ni de zoom
  useEffect(() => {
    let touchStartY = 0;
    let isMultiTouch = false;

    const handleWheel = (e: WheelEvent) => {
      // Ignorar eventos cuando el usuario hace zoom (Ctrl + rueda, Cmd + rueda o pellizco en trackpad)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (Math.abs(e.deltaY) < 15) return;

      if (e.deltaY > 0 && currentView === 'hero') {
        changeView('portfolios');
      } else if (e.deltaY < 0 && currentView === 'portfolios') {
        changeView('hero');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar atajos con teclas modificadoras (ej. Ctrl + +, Ctrl + -, Ctrl + 0 para zoom)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key) && currentView === 'hero') {
        e.preventDefault();
        changeView('portfolios');
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && currentView === 'portfolios') {
        e.preventDefault();
        changeView('hero');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        isMultiTouch = true;
        return;
      }
      isMultiTouch = false;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isMultiTouch || e.touches.length > 0) return;
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
      {/* Fondo Topográfico de Curvas de Trayectoria y Relieve Profesional */}
      <TopographicBackground />

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

          {/* Acciones de la barra superior: Selector de tema, Contacto y Acceso */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="min-h-(--size-touch-target) px-3 sm:px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xs border border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-brand-accent)] transition-all inline-flex items-center gap-1.5 shadow-[var(--shadow-card)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
              aria-label={i18n.showcase.contact}
            >
              <MailIcon size={14} className="text-[var(--color-brand-accent)]" />
              <span className="hidden xs:inline sm:inline">{i18n.showcase.contact}</span>
            </button>

            <a
              href="/login"
              className="min-h-(--size-touch-target) px-3.5 sm:px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] text-xs font-semibold transition-all inline-flex items-center shadow-[var(--shadow-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
            >
              <span>{i18n.showcase.login}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Escenario de Contenido Principal con Transiciones Cinemáticas */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentView === 'hero' ? (
            /* Vista 1: Pantalla de Bienvenida (Título Cinético Grande) */
            <motion.section
              key="hero-view"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.decelerate }}
              className="w-full h-full flex flex-col items-center justify-center text-center px-2 sm:px-6 max-w-7xl mx-auto relative select-none"
            >
              <KineticTitle text={i18n.showcase.title} />

              {/* Botón de acceso a portafolios */}
              <button
                type="button"
                onClick={() => changeView('portfolios')}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="absolute bottom-10 sm:bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 min-h-[66px] px-8 py-3 bg-transparent text-base sm:text-lg font-bold tracking-wide text-[var(--color-text-primary)] hover:opacity-90 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-xl group active:scale-[0.98]"
                aria-label={i18n.showcase.goToPortfolios}
              >
                <span>{i18n.showcase.goToPortfolios}</span>
                <div
                  ref={arrowScope}
                  className="text-[var(--color-brand-accent)] flex items-center justify-center -mt-1"
                >
                  <ChevronDownIcon size={30} className="w-7 h-7 sm:w-8 sm:h-8" />
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
                    return (
                      <motion.a
                        key={creator.id}
                        href={`/${creator.slug}`}
                        variants={fadeSlideUpVariants}
                        onHoverStart={() => setHoveredId(creator.id)}
                        onHoverEnd={() => setHoveredId(null)}
                        whileHover={{ y: -6, scale: 1.012 }}
                        transition={{ duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.decelerate }}
                        className="group relative flex flex-col justify-between p-7 sm:p-8 rounded-[var(--radius-2xl)] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[0_28px_60px_-12px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_30px_70px_-12px_rgba(0,0,0,0.95)] hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden cursor-pointer block"
                      >
                        {/* Contenido de la Tarjeta */}
                        <div className="relative z-10 space-y-4">
                          {/* Cabecera con Icono SVG vectorial y Slug */}
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center group-hover:scale-105 group-hover:bg-slate-200/70 dark:group-hover:bg-zinc-700/70 transition-all">
                              {getCreatorIcon(creator.slug, creator.role)}
                            </div>

                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/50 text-xs font-mono text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                              <span className="opacity-50">/</span>
                              <span>{creator.slug}</span>
                            </div>
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

                          {/* Etiquetas de tecnologías y habilidades */}
                          {creator.skills && creator.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {creator.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-medium bg-slate-100/90 dark:bg-zinc-800/70 text-[var(--color-text-secondary)] border border-slate-200/60 dark:border-zinc-700/40"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pie Interactivo */}
                        <div className="relative z-10 pt-5 mt-5 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-accent)] transition-colors">
                            {i18n.showcase.explorePortfolio}
                          </span>

                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-[var(--color-text-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)] group-hover:translate-x-1 transition-all">
                            <ArrowRightIcon size={14} />
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

      {/* Modal de Contacto Accesible */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

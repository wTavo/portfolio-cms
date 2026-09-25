/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con animación cinemática fluida basada en scroll-snap nativo por hardware (120 FPS) y título con física cinética.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimate } from 'motion/react';
import type { ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import { ArrowRightIcon, BrandLogoIcon, ChevronDownIcon, MailIcon, CodeIcon, PaletteIcon, UserIcon } from '../icons/Icons';
import KineticTitle from './KineticTitle';
import TopographicBackground from './TopographicBackground';
import ThemeToggle from '../ui/ThemeToggle';
import ContactModal from './ContactModal';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';

interface DualShowcaseProps {
  data: ShowcaseData;
}

/** Retorna el icono SVG vectorial con su paleta de color e interactividad según la especialidad */
function getCreatorBadge(slug: string, role: string) {
  const normalized = `${slug} ${role}`.toLowerCase();
  if (
    normalized.includes('design') ||
    normalized.includes('diseñador') ||
    normalized.includes('creative') ||
    normalized.includes('partner') ||
    normalized.includes('producto')
  ) {
    return {
      icon: <PaletteIcon size={24} className="text-violet-600 dark:text-violet-400" />,
      containerClass: 'bg-violet-50/90 dark:bg-violet-950/50 border-violet-200/80 dark:border-violet-800/60 shadow-xs',
      hoverBorder: 'hover:border-violet-300/80 dark:hover:border-violet-700/80',
      hoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
      hoverButton: 'group-hover:bg-violet-600 dark:group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-600 dark:group-hover:border-violet-500',
      hoverShadow: 'hover:shadow-xl dark:hover:shadow-violet-950/40',
    };
  }
  if (
    normalized.includes('gustavo') ||
    normalized.includes('software') ||
    normalized.includes('architect') ||
    normalized.includes('dev') ||
    normalized.includes('ingeniero')
  ) {
    return {
      icon: <CodeIcon size={24} className="text-blue-600 dark:text-blue-400" />,
      containerClass: 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/80 dark:border-blue-800/60 shadow-xs',
      hoverBorder: 'hover:border-blue-300/80 dark:hover:border-blue-700/80',
      hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      hoverButton: 'group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-600 dark:group-hover:border-blue-500',
      hoverShadow: 'hover:shadow-xl dark:hover:shadow-blue-950/40',
    };
  }
  return {
    icon: <UserIcon size={24} className="text-[var(--color-brand-accent)]" />,
    containerClass: 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-xs',
    hoverBorder: 'hover:border-slate-300 dark:hover:border-zinc-700',
    hoverText: 'group-hover:text-[var(--color-brand-accent)]',
    hoverButton: 'group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)]',
    hoverShadow: 'hover:shadow-xl dark:hover:shadow-zinc-950/40',
  };
}

export default function DualShowcase({ data }: DualShowcaseProps) {
  const [currentView, setCurrentView] = useState<'hero' | 'portfolios'>('hero');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [arrowScope, animateArrow] = useAnimate();

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const portfoliosRef = useRef<HTMLElement>(null);

  const { creators } = data;

  const scrollToHero = useCallback(() => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToPortfolios = useCallback(() => {
    portfoliosRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Animación continua y reactiva de la flecha con cadencia armónica idéntica al rebote
  useEffect(() => {
    if (!arrowScope.current || currentView !== 'hero') return;

    if (isButtonHovered) {
      animateArrow(
        arrowScope.current,
        { y: 6 },
        { duration: 0.35, ease: 'easeOut' }
      );
    } else {
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

  // Detección bidireccional por IntersectionObserver de alto rendimiento en GPU compositor
  useEffect(() => {
    const portfolioElem = portfoliosRef.current;
    const heroElem = heroRef.current;
    const scrollContainer = containerRef.current;
    if (!portfolioElem || !heroElem) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === portfolioElem && entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setCurrentView('portfolios');
          } else if (entry.target === heroElem && entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setCurrentView('hero');
          }
        }
      },
      {
        root: scrollContainer,
        threshold: [0.2, 0.4, 0.7],
      }
    );

    observer.observe(heroElem);
    observer.observe(portfolioElem);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Navegación por teclado accesible sin interferir con modificadores
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key) && currentView === 'hero') {
        e.preventDefault();
        scrollToPortfolios();
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && currentView === 'portfolios') {
        const container = containerRef.current;
        if (container && container.scrollTop <= 20) {
          e.preventDefault();
          scrollToHero();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, scrollToHero, scrollToPortfolios]);

  const isPortfolios = currentView === 'portfolios';

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)]">
      {/* Fondo Topográfico Fijo de Curvas de Trayectoria y Relieve Profesional */}
      <TopographicBackground />

      {/* Barra de Navegación Superior Fija */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-[background-color,border-color,padding,box-shadow] duration-300 ${
          isPortfolios
            ? 'bg-[var(--color-bg-base)]/95 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-2 sm:py-3 shadow-[var(--shadow-card)]'
            : 'bg-transparent border-b border-transparent py-2 sm:py-3.5 md:py-5'
        }`}
      >
        <div className="max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Título en la barra superior: Solo visible y animado en la vista de portafolios */}
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {isPortfolios && (
                <motion.button
                  key="header-brand"
                  type="button"
                  onClick={scrollToHero}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.decelerate }}
                  className="group flex items-center gap-3 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-[var(--radius-md)] p-1 -ml-1 transition-opacity"
                  aria-label="Volver al inicio"
                >
                  {/* Caja de Logotipo con Resplandor Sutil */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] group-hover:border-[var(--color-brand-accent)]/60 shadow-[var(--shadow-card)] flex items-center justify-center transition-[border-color,box-shadow,transform] duration-150 group-hover:scale-105">
                    <BrandLogoIcon size={20} className="w-5 h-5 text-[var(--color-text-primary)]" />
                  </div>

                  {/* Jerarquía Tipográfica de la Marca */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
                        Portafolio
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/25 leading-none">
                        Studio
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-[var(--color-text-muted)] tracking-wide uppercase leading-tight hidden xs:block">
                      Dúo Profesional • Dev & Design
                    </span>
                  </div>
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
              className="min-h-(--size-touch-target) px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-brand-accent)] transition-[background-color,border-color] duration-150 inline-flex items-center gap-1.5 shadow-[var(--shadow-card)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
              aria-label={i18n.showcase.contact}
            >
              <MailIcon size={14} className="text-[var(--color-brand-accent)]" />
              <span className="hidden xs:inline sm:inline">{i18n.showcase.contact}</span>
            </button>

            <a
              href="/login"
              className="min-h-(--size-touch-target) px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] text-xs font-semibold transition-[background-color] duration-150 inline-flex items-center shadow-[var(--shadow-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
            >
              <span>{i18n.showcase.login}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenedor de Scroll-Snap Nativo Fluido a 120 FPS */}
      <div
        ref={containerRef}
        className="w-full h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth relative z-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Sección 1: Portada Cinemática con Título Cinético */}
        <section
          id="hero"
          ref={heroRef}
          aria-hidden={isPortfolios}
          className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always relative flex flex-col items-center justify-center text-center px-3 sm:px-6 max-w-7xl mx-auto select-none"
        >
          <KineticTitle text={i18n.showcase.title} />

          {/* Botón de acceso a portafolios adaptable para móvil vertical, horizontal y escritorio */}
          <button
            type="button"
            onClick={scrollToPortfolios}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className="absolute bottom-2 sm:bottom-4 md:bottom-12 [@media(max-height:540px)]:bottom-1.5 left-1/2 -translate-x-1/2 min-h-[40px] sm:min-h-[50px] md:min-h-[64px] [@media(max-height:540px)]:min-h-[34px] px-4 sm:px-7 py-1 sm:py-2 [@media(max-height:540px)]:py-0.5 bg-transparent text-xs sm:text-sm md:text-base [@media(max-height:540px)]:text-[11px] font-bold tracking-wide text-[var(--color-text-primary)] hover:opacity-90 transition-opacity duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-xl group active:scale-[0.98] pb-[max(0.25rem,env(safe-area-inset-bottom))]"
            aria-label={i18n.showcase.goToPortfolios}
          >
            <span>{i18n.showcase.goToPortfolios}</span>
            <div
              ref={arrowScope}
              className="text-[var(--color-brand-accent)] flex items-center justify-center -mt-0.5"
            >
              <ChevronDownIcon size={20} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 [@media(max-height:540px)]:w-3.5 [@media(max-height:540px)]:h-3.5" />
            </div>
          </button>
        </section>

        {/* Sección 2: Portafolios Gateway con Scroll Snap y Soporte Responsive Universal */}
        <section
          id="portafolios"
          ref={portfoliosRef}
          aria-hidden={!isPortfolios}
          className="w-full min-h-[100dvh] snap-start snap-always relative flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-6 [@media(max-height:540px)]:pt-14 [@media(max-height:540px)]:pb-4"
        >
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mx-auto">
              {creators.map((creator) => {
                const badge = getCreatorBadge(creator.slug, creator.role);

                return (
                  <a
                    key={creator.id}
                    href={`/${creator.slug}`}
                    className={`group relative flex flex-col justify-between p-6 sm:p-7 md:p-8 [@media(max-height:540px)]:p-4 rounded-[var(--radius-2xl)] bg-gradient-to-b from-white via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl dark:shadow-zinc-950/50 ${badge.hoverShadow} ${badge.hoverBorder} transition-all duration-200 hover:-translate-y-1.5 overflow-hidden cursor-pointer block`}
                  >
                    {/* Contenido Superior de la Tarjeta */}
                    <div className="relative z-10 space-y-3 sm:space-y-4 [@media(max-height:540px)]:space-y-2">
                      {/* Cabecera con Icono SVG vectorial con color y Slug */}
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-xl)] border flex items-center justify-center group-hover:scale-105 transition-transform duration-150 ${badge.containerClass}`}>
                          {badge.icon}
                        </div>

                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-300/80 dark:border-zinc-700 text-xs font-mono font-semibold text-slate-700 dark:text-zinc-200 shadow-xs ${badge.hoverText} transition-colors duration-150`}>
                          <span className="opacity-50">/</span>
                          <span>{creator.slug}</span>
                        </div>
                      </div>

                      {/* Nombre y Especialidad */}
                      <div className="space-y-1 pt-1">
                        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] ${badge.hoverText} transition-colors duration-150`}>
                          {creator.name}
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                          {creator.role}
                        </p>
                      </div>

                      {/* Etiquetas de tecnologías y habilidades */}
                      {creator.skills && creator.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {creator.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-300/80 dark:border-zinc-700 shadow-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Zócalo de Acción Integrado */}
                    <div className="relative z-10 py-3 sm:py-3.5 md:py-4 px-6 sm:px-7 md:px-8 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 md:-mx-8 md:-mb-8 mt-5 sm:mt-6 [@media(max-height:540px)]:mt-3 bg-slate-100/80 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3 rounded-b-[var(--radius-2xl)]">
                      <span className={`text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] ${badge.hoverText} transition-colors duration-150`}>
                        {i18n.showcase.explorePortfolio}
                      </span>

                      <div className={`w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-300/80 dark:border-zinc-700 shadow-xs flex items-center justify-center text-[var(--color-text-primary)] ${badge.hoverButton} group-hover:translate-x-1 transition-all duration-150`}>
                        <ArrowRightIcon size={14} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Pie de Página */}
          <footer className="pt-4 text-center text-[11px] text-[var(--color-text-muted)] opacity-70">
            <p>© {new Date().getFullYear()} Portafolio Builder • Crafted with Astro, React & Cloudflare</p>
          </footer>
        </section>
      </div>

      {/* Modal de Contacto Accesible */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con transición cinemática fluida por estados (Apple/Linear style).
 * Cero rebotes de scroll, presentación impecable de título y tarjetas sin desplazamientos residuales.
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import {
  ArrowRightIcon,
  BrandLogoIcon,
  ChevronDownIcon,
  MailIcon,
  CodeIcon,
  PaletteIcon,
  UserIcon,
} from '../icons/Icons';
import KineticTitle from './KineticTitle';
import TopographicBackground from './TopographicBackground';
import ThemeToggle from '../ui/ThemeToggle';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';

// Carga diferida (code-splitting) de modales para acelerar el primer render en móviles y PC
const ContactModal = lazy(() => import('./ContactModal'));
const LoginModal = lazy(() => import('./LoginModal'));

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
      icon: <PaletteIcon size={24} className="text-[var(--color-brand-accent)]" />,
      containerClass: 'bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] shadow-xs',
      hoverBorder: 'hover:border-[var(--color-brand-accent)]',
      hoverText: 'group-hover:text-[var(--color-brand-accent)]',
      hoverButton:
        'group-hover:bg-[var(--color-brand-accent)] group-hover:text-white group-hover:border-[var(--color-brand-accent)]',
      hoverShadow: 'hover:shadow-xl',
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
      icon: <CodeIcon size={24} className="text-[var(--color-brand-primary)]" />,
      containerClass: 'bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] shadow-xs',
      hoverBorder: 'hover:border-[var(--color-brand-primary)]',
      hoverText: 'group-hover:text-[var(--color-brand-primary)]',
      hoverButton:
        'group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)]',
      hoverShadow: 'hover:shadow-xl',
    };
  }
  return {
    icon: <UserIcon size={24} className="text-[var(--color-brand-accent)]" />,
    containerClass: 'bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] shadow-xs',
    hoverBorder: 'hover:border-[var(--color-border-default)]',
    hoverText: 'group-hover:text-[var(--color-brand-accent)]',
    hoverButton:
      'group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)]',
    hoverShadow: 'hover:shadow-xl',
  };
}

export default function DualShowcase({ data }: DualShowcaseProps) {
  const [currentView, setCurrentView] = useState<'hero' | 'portfolios'>('hero');
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState('');
  const [loginInitialError, setLoginInitialError] = useState('');

  const isTransitioningRef = useRef(false);
  const portfoliosContainerRef = useRef<HTMLElement>(null);
  const { creators } = data;

  const changeView = useCallback(
    (nextView: 'hero' | 'portfolios') => {
      if (isTransitioningRef.current || currentView === nextView) return;
      isTransitioningRef.current = true;
      setNavigationDirection(nextView === 'portfolios' ? 'forward' : 'backward');
      setCurrentView(nextView);
      if (nextView === 'portfolios' && portfoliosContainerRef.current) {
        portfoliosContainerRef.current.scrollTop = 0;
      }
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 500);
    },
    [currentView]
  );

  // Detección de apertura de modal por URL (?login=true o ?error=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true' || params.has('error')) {
        setIsLoginOpen(true);
        if (params.get('redirect')) {
          setLoginRedirect(params.get('redirect') || '');
        }
        if (params.get('error')) {
          setLoginInitialError(params.get('error') || '');
        }
      }
    }
  }, []);

  // Transición cinemática por rueda de ratón en PC
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isContactOpen || isLoginOpen) return;
      if (isTransitioningRef.current) return;
      if (Math.abs(e.deltaY) < 10) return;

      const container = portfoliosContainerRef.current;

      if (currentView === 'hero') {
        // En portada: rueda hacia abajo avanza a portafolios
        if (e.deltaY > 0) {
          changeView('portfolios');
        }
      } else if (currentView === 'portfolios') {
        // En portafolios: rueda hacia arriba en el tope regresa a la portada
        if (e.deltaY < -10) {
          if (!container || container.scrollTop <= 5) {
            changeView('hero');
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentView, changeView, isContactOpen, isLoginOpen]);

  // Transición cinemática por gestos táctiles en móvil (swipe hacia abajo regresa al título sin activar pull-to-refresh)
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let hasTriggered = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      hasTriggered = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isContactOpen || isLoginOpen || isTransitioningRef.current || hasTriggered) return;
      if (e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = touchStartY - currentY;
      const diffX = touchStartX - currentX;

      // Descartar si el gesto no es predominantemente vertical
      if (Math.abs(diffY) < Math.abs(diffX) * 1.1) return;

      const container = portfoliosContainerRef.current;

      if (currentView === 'hero') {
        // En portada: swipe hacia arriba (diffY > 30) avanza a portafolios
        if (diffY > 30) {
          hasTriggered = true;
          changeView('portfolios');
        }
        // En portada si diffY < 0 (hacia abajo), no interceptar para que funcione el pull-to-refresh nativo
      } else if (currentView === 'portfolios') {
        // En portafolios: swipe hacia abajo (diffY < -20) para regresar al título
        if (diffY < -20) {
          const isAtTop = !container || container.scrollTop <= 5;
          if (isAtTop) {
            // Cancelar el pull-to-refresh del navegador para que no interfiera con el regreso al título
            if (e.cancelable) {
              e.preventDefault();
            }
            hasTriggered = true;
            changeView('hero');
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isContactOpen || isLoginOpen || isTransitioningRef.current || hasTriggered) return;
      if (e.changedTouches.length !== 1) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;

      if (Math.abs(diffY) < Math.abs(diffX) * 1.1) return;

      const container = portfoliosContainerRef.current;

      if (currentView === 'hero') {
        if (diffY > 25) {
          changeView('portfolios');
        }
      } else if (currentView === 'portfolios') {
        if (diffY < -20) {
          if (!container || container.scrollTop <= 5) {
            changeView('hero');
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [currentView, changeView, isContactOpen, isLoginOpen]);

  // Navegación por teclado accesible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isContactOpen || isLoginOpen) return;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key) && currentView === 'hero') {
        e.preventDefault();
        changeView('portfolios');
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && currentView === 'portfolios') {
        e.preventDefault();
        changeView('hero');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, changeView, isContactOpen, isLoginOpen]);

  const isPortfolios = currentView === 'portfolios';

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden flex flex-col justify-between selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)]">
      {/* Fondo Topográfico Fijo con curvas dinámicas a 120 FPS */}
      <TopographicBackground isPaused={isContactOpen || isLoginOpen} />

      {/* Barra de Navegación Superior Fija */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 py-2 sm:py-3 transition-[background-color,border-color,box-shadow] duration-300 ${
          isPortfolios
            ? 'bg-[var(--color-bg-base)]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Título en la barra superior: Visible exclusivamente en la vista de portafolios */}
          <div className="flex items-center min-h-[40px]">
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
                  className="group flex items-center gap-3 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-[var(--radius-md)] p-1 -ml-1"
                  aria-label="Volver al inicio"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] group-hover:border-[var(--color-brand-accent)]/60 shadow-[var(--shadow-card)] flex items-center justify-center transition-[border-color,transform] duration-150 group-hover:scale-105">
                    <BrandLogoIcon size={20} className="w-5 h-5 text-[var(--color-text-primary)]" />
                  </div>

                  <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-none select-none">
                    {i18n.showcase.title}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Acciones de la barra superior: Tema, Contacto y Acceso */}
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

            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="min-h-(--size-touch-target) px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] text-xs font-semibold transition-[background-color] duration-150 inline-flex items-center shadow-[var(--shadow-card)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
              aria-label={i18n.showcase.login}
            >
              <span>{i18n.showcase.login}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Escenario de Contenido Principal con Transiciones Cinemáticas por Estado */}
      <div className="relative z-10 flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={navigationDirection}>
          {currentView === 'hero' ? (
            /* Vista 1: Portada Cinemática con Título Cinético */
            <motion.section
              key="hero-view"
              custom={navigationDirection}
              initial={{
                opacity: 0,
                y: navigationDirection === 'backward' ? -25 : 20,
              }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -25,
              }}
              transition={{
                duration: MOTION_DURATIONS.normal,
                ease: MOTION_EASINGS.decelerate,
              }}
              className="w-full h-full flex flex-col items-center justify-center text-center px-3 sm:px-6 max-w-7xl mx-auto select-none relative"
            >
              <KineticTitle text={i18n.showcase.title} />

              {/* Botón de acceso a portafolios */}
              <button
                type="button"
                onClick={() => changeView('portfolios')}
                className="group absolute bottom-6 sm:bottom-8 md:bottom-12 [@media(max-height:540px)]:bottom-1.5 left-1/2 -translate-x-1/2 min-h-(--size-touch-target) sm:min-h-[50px] md:min-h-[64px] [@media(max-height:540px)]:min-h-[34px] px-4 sm:px-7 py-1.5 sm:py-2 [@media(max-height:540px)]:py-0.5 bg-transparent text-xs sm:text-sm md:text-base [@media(max-height:540px)]:text-[11px] font-bold tracking-wide text-[var(--color-text-primary)] hover:opacity-90 transition-opacity duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-xl active:scale-[0.98] pb-[max(0.25rem,env(safe-area-inset-bottom))]"
                aria-label={i18n.showcase.goToPortfolios}
              >
                <span>{i18n.showcase.goToPortfolios}</span>
                <div className="text-[var(--color-brand-accent)] flex items-center justify-center -mt-0.5 animate-bounce-indicator group-hover:translate-y-1 group-hover:animate-none transition-transform duration-150">
                  <ChevronDownIcon
                    size={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 [@media(max-height:540px)]:w-3.5 [@media(max-height:540px)]:h-3.5"
                  />
                </div>
              </button>
            </motion.section>
          ) : (
            /* Vista 2: Portafolios Gateway */
            <motion.section
              key="portfolios-view"
              ref={portfoliosContainerRef}
              custom={navigationDirection}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: navigationDirection === 'backward' ? 30 : -25,
              }}
              transition={{
                duration: MOTION_DURATIONS.slow,
                ease: MOTION_EASINGS.decelerate,
              }}
              className="w-full h-full flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.5rem))] [@media(max-height:540px)]:pt-12 [@media(max-height:540px)]:pb-2 overflow-y-auto overscroll-y-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex-1 flex flex-col justify-center py-2 sm:py-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl mx-auto">
                  {creators.map((creator, idx) => {
                    const badge = getCreatorBadge(creator.slug, creator.role);

                    return (
                      <motion.a
                        key={creator.id}
                        href={`/${creator.slug}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: MOTION_DURATIONS.slow,
                          delay: idx * 0.1 + 0.05,
                          ease: MOTION_EASINGS.decelerate,
                        }}
                        className={`group relative flex flex-col justify-between p-4.5 sm:p-6 md:p-8 [@media(max-height:540px)]:p-3.5 rounded-[var(--radius-2xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md hover:shadow-xl ${badge.hoverShadow} ${badge.hoverBorder} transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1.5 overflow-hidden cursor-pointer block`}
                      >
                        {/* Contenido Superior de la Tarjeta */}
                        <div className="relative z-10 space-y-2.5 sm:space-y-4 [@media(max-height:540px)]:space-y-1.5">
                          {/* Cabecera con Icono SVG vectorial con color y Slug */}
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-9 h-9 sm:w-12 sm:h-12 rounded-[var(--radius-xl)] border flex items-center justify-center group-hover:scale-105 transition-transform duration-150 ${badge.containerClass}`}
                            >
                              {badge.icon}
                            </div>

                            <div
                              className={`flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-[11px] sm:text-xs font-mono font-semibold text-[var(--color-text-secondary)] shadow-xs ${badge.hoverText} transition-colors duration-150`}
                            >
                              <span className="opacity-50">/</span>
                              <span>{creator.slug}</span>
                            </div>
                          </div>

                          {/* Nombre y Especialidad */}
                          <div className="space-y-0.5 sm:space-y-1 pt-0.5">
                            <h2
                              className={`text-lg sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] ${badge.hoverText} transition-colors duration-150`}
                            >
                              {creator.name}
                            </h2>
                            <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                              {creator.role}
                            </p>
                          </div>

                          {/* Etiquetas de tecnologías y habilidades */}
                          {creator.skills && creator.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                              {creator.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-[var(--radius-md)] text-[11px] sm:text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] shadow-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Zócalo de Acción Integrado */}
                        <div className="relative z-10 py-2.5 sm:py-3.5 md:py-4 px-4.5 sm:px-7 md:px-8 -mx-4.5 -mb-4.5 sm:-mx-7 sm:-mb-7 md:-mx-8 md:-mb-8 mt-4 sm:mt-6 [@media(max-height:540px)]:mt-2.5 bg-[var(--color-bg-surface-elevated)] border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-3 rounded-b-[var(--radius-2xl)]">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] ${badge.hoverText} transition-colors duration-150`}
                          >
                            {i18n.showcase.explorePortfolio}
                          </span>

                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-xs flex items-center justify-center text-[var(--color-text-primary)] ${badge.hoverButton} group-hover:translate-x-1 transition-[transform,background-color,border-color,color] duration-150`}
                          >
                            <ArrowRightIcon size={13} />
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* Pie de Página */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: MOTION_DURATIONS.normal, delay: 0.25 }}
                className="pt-2 pb-1 text-center text-[11px] sm:text-xs text-[var(--color-text-muted)] shrink-0 select-none"
              >
                <p>© {new Date().getFullYear()} Portafolio Builder • Crafted with Astro, React & Cloudflare</p>
              </motion.footer>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Modales Accesibles de Contacto e Inicio de Sesión cargados bajo demanda */}
      <Suspense fallback={null}>
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          redirectUrl={loginRedirect}
          initialError={loginInitialError}
        />
      </Suspense>
    </div>
  );
}

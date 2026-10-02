/**
 * @file DualShowcase.tsx
 * @description Portal interactivo con animación cinemática fluida basada en scroll-snap nativo por hardware (120 FPS) y título con física cinética.
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import { ArrowRightIcon, BrandLogoIcon, ChevronDownIcon, MailIcon, CodeIcon, PaletteIcon, UserIcon, RefreshIcon } from '../icons/Icons';
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
      hoverButton: 'group-hover:bg-[var(--color-brand-accent)] group-hover:text-white group-hover:border-[var(--color-brand-accent)]',
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
      hoverButton: 'group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)]',
      hoverShadow: 'hover:shadow-xl',
    };
  }
  return {
    icon: <UserIcon size={24} className="text-[var(--color-brand-accent)]" />,
    containerClass: 'bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] shadow-xs',
    hoverBorder: 'hover:border-[var(--color-border-default)]',
    hoverText: 'group-hover:text-[var(--color-brand-accent)]',
    hoverButton: 'group-hover:bg-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-on-primary)] group-hover:border-[var(--color-brand-primary)]',
    hoverShadow: 'hover:shadow-xl',
  };
}

export default function DualShowcase({ data }: DualShowcaseProps) {
  const [currentView, setCurrentView] = useState<'hero' | 'portfolios'>('hero');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState('');
  const [loginInitialError, setLoginInitialError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const portfoliosRef = useRef<HTMLElement>(null);
  const navBackdropRef = useRef<HTMLDivElement>(null);

  const { creators } = data;

  const scrollToHero = useCallback(() => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToPortfolios = useCallback(() => {
    portfoliosRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Desenfoque y fondo progresivo gradual en GPU compositor vinculado al desplazamiento (Directivas 1, 3, 13)
  useEffect(() => {
    const container = containerRef.current;
    const navBackdrop = navBackdropRef.current;
    if (!container || !navBackdrop) return;

    let rafId: number | null = null;

    const updateBlurProgress = () => {
      const scrollTop = container.scrollTop;
      // Umbral de transición: de 0px (0% blur) a 140px (100% blur) de forma suave y proporcional
      const maxDistance = 140;
      const progress = Math.min(1, Math.max(0, scrollTop / maxDistance));
      
      navBackdrop.style.opacity = progress.toString();
      // Ocultar completamente el backdrop cuando la opacidad es 0 para que la GPU no gaste ciclos de desenfoque
      navBackdrop.style.visibility = progress > 0 ? 'visible' : 'hidden';
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateBlurProgress);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateBlurProgress();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Estado para el gesto interactivo de recarga hacia abajo (Pull-to-Refresh) en dispositivos móviles
  const [pullState, setPullState] = useState({ distance: 0, progress: 0, isRefreshing: false });
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Iniciar pull-to-refresh únicamente si el usuario está en el tope superior absoluto, en la portada hero y sin modales activos
      if (container.scrollTop > 0 || isContactOpen || isLoginOpen || pullState.isRefreshing) {
        touchStartYRef.current = null;
        touchStartXRef.current = null;
        isPullingRef.current = false;
        return;
      }

      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
        touchStartXRef.current = e.touches[0].clientX;
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || touchStartXRef.current === null || pullState.isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartYRef.current;
      const deltaX = currentX - touchStartXRef.current;

      // Ignorar si el desplazamiento es predominantemente horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;

      // Arrastre hacia abajo en el tope del contenedor
      if (deltaY > 0 && container.scrollTop <= 0) {
        isPullingRef.current = true;
        // Resistencia física orgánica para una respuesta táctil agradable
        const distance = Math.min(85, Math.pow(deltaY, 0.85));
        const progress = Math.min(1, distance / 60);

        setPullState({ distance, progress, isRefreshing: false });

        if (distance > 10 && e.cancelable) {
          e.preventDefault();
        }
      } else if (isPullingRef.current) {
        isPullingRef.current = false;
        setPullState({ distance: 0, progress: 0, isRefreshing: false });
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || pullState.isRefreshing) {
        touchStartYRef.current = null;
        touchStartXRef.current = null;
        isPullingRef.current = false;
        return;
      }

      touchStartYRef.current = null;
      touchStartXRef.current = null;
      isPullingRef.current = false;

      if (pullState.progress >= 1) {
        setPullState({ distance: 60, progress: 1, isRefreshing: true });
        try {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(15);
          }
        } catch {
          // Ignorar si la vibración no está disponible
        }

        setTimeout(() => {
          window.location.reload();
        }, 350);
      } else {
        setPullState({ distance: 0, progress: 0, isRefreshing: false });
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isContactOpen, isLoginOpen, pullState.isRefreshing, pullState.progress]);

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
      // Prevenir que teclas como Space o ArrowDown desplacen el fondo si un modal está abierto
      if (isContactOpen || isLoginOpen) return;

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
  }, [currentView, scrollToHero, scrollToPortfolios, isContactOpen, isLoginOpen]);

  const isPortfolios = currentView === 'portfolios';

  return (
    <div className="relative w-full h-full min-h-[100dvh] max-h-[100dvh] overflow-hidden selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)]">
      {/* Fondo Topográfico Fijo de Curvas de Trayectoria y Relieve Profesional con animación continua fluida */}
      <TopographicBackground isPaused={isContactOpen || isLoginOpen} />

      {/* Indicador táctil de recarga hacia abajo (Pull-to-Refresh) para móviles (Directivas 3, 13, 31, 32) */}
      <div
        aria-hidden="true"
        className="fixed top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center justify-center will-change-transform"
        style={{
          transform: `translate(-50%, ${pullState.distance > 0 || pullState.isRefreshing ? pullState.distance - 44 : -60}px)`,
          opacity: pullState.distance > 0 || pullState.isRefreshing ? Math.min(1, pullState.progress * 1.4) : 0,
          transition:
            pullState.distance === 0 && !pullState.isRefreshing
              ? 'transform 260ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease'
              : 'none',
        }}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-default)] shadow-[var(--shadow-dropdown)] flex items-center justify-center text-[var(--color-text-secondary)] backdrop-blur-md">
          <RefreshIcon
            size={18}
            className={`transition-colors duration-150 ${
              pullState.isRefreshing
                ? 'animate-spin text-[var(--color-brand-accent)]'
                : pullState.progress >= 1
                ? 'text-[var(--color-brand-accent)] scale-110'
                : 'text-[var(--color-text-secondary)]'
            }`}
            style={{
              transform: pullState.isRefreshing ? undefined : `rotate(${pullState.progress * 360}deg)`,
            }}
          />
        </div>
      </div>

      {/* Barra de Navegación Superior Fija */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-[padding] duration-300 ${
          isPortfolios ? 'py-2 sm:py-3' : 'py-2 sm:py-3.5 md:py-5'
        }`}
      >
        {/* Capa de fondo con desenfoque (blur) y sombra progresiva en GPU vinculada al desplazamiento (Directivas 1, 3, 4, 13) */}
        <div
          ref={navBackdropRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[var(--color-bg-base)]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] will-change-[opacity]"
          style={{ opacity: 0, visibility: 'hidden' }}
        />

        <div className="relative z-10 max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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

                  {/* Título de Marca */}
                  <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-none select-none">
                    {i18n.showcase.title}
                  </span>
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

      {/* Contenedor de Scroll-Snap Nativo Fluido a 120 FPS */}
      <div
        ref={containerRef}
        className={`w-full h-full min-h-[100dvh] max-h-[100dvh] ${
          isContactOpen || isLoginOpen
            ? 'overflow-hidden pointer-events-none'
            : 'overflow-y-auto snap-y snap-mandatory'
        } overflow-x-hidden scroll-smooth relative z-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {/* Sección 1: Portada Cinemática con Título Cinético */}
        <section
          id="hero"
          ref={heroRef}
          aria-hidden={isPortfolios}
          className="w-full h-full min-h-[100dvh] max-h-[100dvh] snap-start snap-always relative flex flex-col items-center justify-center text-center px-3 sm:px-6 max-w-7xl mx-auto select-none"
        >
          <KineticTitle text={i18n.showcase.title} />

          {/* Botón de acceso a portafolios adaptable para móvil vertical, horizontal y escritorio */}
          <button
            type="button"
            onClick={scrollToPortfolios}
            className="group absolute bottom-6 sm:bottom-8 md:bottom-12 [@media(max-height:540px)]:bottom-1.5 left-1/2 -translate-x-1/2 min-h-(--size-touch-target) sm:min-h-[50px] md:min-h-[64px] [@media(max-height:540px)]:min-h-[34px] px-4 sm:px-7 py-1.5 sm:py-2 [@media(max-height:540px)]:py-0.5 bg-transparent text-xs sm:text-sm md:text-base [@media(max-height:540px)]:text-[11px] font-bold tracking-wide text-[var(--color-text-primary)] hover:opacity-90 transition-opacity duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] rounded-xl active:scale-[0.98] pb-[max(0.25rem,env(safe-area-inset-bottom))]"
            aria-label={i18n.showcase.goToPortfolios}
          >
            <span>{i18n.showcase.goToPortfolios}</span>
            <div
              className="text-[var(--color-brand-accent)] flex items-center justify-center -mt-0.5 animate-bounce-indicator group-hover:translate-y-1 group-hover:animate-none transition-transform duration-150"
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
          className="w-full min-h-[100dvh] snap-start snap-always relative flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-18 md:pt-20 pb-6 sm:pb-8 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] [@media(max-height:540px)]:pt-12 [@media(max-height:540px)]:pb-3"
        >
          <div className="flex-1 flex flex-col justify-center py-2 sm:py-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl mx-auto">
              {creators.map((creator) => {
                const badge = getCreatorBadge(creator.slug, creator.role);

                return (
                  <a
                    key={creator.id}
                    href={`/${creator.slug}`}
                    className={`group relative flex flex-col justify-between p-4.5 sm:p-6 md:p-8 [@media(max-height:540px)]:p-3.5 rounded-[var(--radius-2xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md hover:shadow-xl ${badge.hoverShadow} ${badge.hoverBorder} transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1.5 overflow-hidden cursor-pointer block`}
                  >
                    {/* Contenido Superior de la Tarjeta */}
                    <div className="relative z-10 space-y-2.5 sm:space-y-4 [@media(max-height:540px)]:space-y-1.5">
                      {/* Cabecera con Icono SVG vectorial con color y Slug */}
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-[var(--radius-xl)] border flex items-center justify-center group-hover:scale-105 transition-transform duration-150 ${badge.containerClass}`}>
                          {badge.icon}
                        </div>

                        <div className={`flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-[11px] sm:text-xs font-mono font-semibold text-[var(--color-text-secondary)] shadow-xs ${badge.hoverText} transition-colors duration-150`}>
                          <span className="opacity-50">/</span>
                          <span>{creator.slug}</span>
                        </div>
                      </div>

                      {/* Nombre y Especialidad */}
                      <div className="space-y-0.5 sm:space-y-1 pt-0.5">
                        <h2 className={`text-lg sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] ${badge.hoverText} transition-colors duration-150`}>
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
                      <span className={`text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] ${badge.hoverText} transition-colors duration-150`}>
                        {i18n.showcase.explorePortfolio}
                      </span>

                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-xs flex items-center justify-center text-[var(--color-text-primary)] ${badge.hoverButton} group-hover:translate-x-1 transition-all duration-150`}>
                        <ArrowRightIcon size={13} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Pie de Página con Espaciado de Respiro Completo */}
          <footer className="pt-2 pb-1 text-center text-[11px] sm:text-xs text-[var(--color-text-muted)] opacity-70 shrink-0 select-none">
            <p>© {new Date().getFullYear()} Portafolio Builder • Crafted with Astro, React & Cloudflare</p>
          </footer>
        </section>
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

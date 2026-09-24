/**
 * @file ThemeToggle.tsx
 * @description Botón interactivo y accesible para alternar y persistir entre tema claro y oscuro (Directiva 1).
 */

import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '../icons/Icons';
import { i18n } from '../../lib/i18n/es';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
      if (current === 'light' || current === 'dark') return current;
    }
    return 'dark';
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Obtener las coordenadas del centro del botón o punto de clic para el origen radial
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || buttonRect.left + buttonRect.width / 2;
    const y = event.clientY || buttonRect.top + buttonRect.height / 2;

    // Calcular el radio máximo necesario para cubrir la pantalla completa
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const applyThemeChange = () => {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    };

    // Verificar si el navegador soporta View Transitions API y si no prefiere movimiento reducido
    const isAppearanceTransition =
      typeof document !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Boolean((document as any).startViewTransition) &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition) {
      applyThemeChange();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => {
      applyThemeChange();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="min-w-(--size-touch-target) min-h-(--size-touch-target) p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xs border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-all flex items-center justify-center shadow-[var(--shadow-card)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
      aria-label={isDark ? i18n.theme.light : i18n.theme.dark}
      title={isDark ? i18n.theme.light : i18n.theme.dark}
    >
      {isDark ? (
        <SunIcon size={16} className="text-amber-400" />
      ) : (
        <MoonIcon size={16} className="text-indigo-500" />
      )}
    </button>
  );
}

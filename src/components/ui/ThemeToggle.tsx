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
    const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (current === 'light' || current === 'dark') {
      setTheme(current);
    } else {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      } else {
        setTheme('dark');
      }
    }
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Obtener las coordenadas del centro del botón o punto de clic para el origen radial
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX && event.clientX > 0 ? event.clientX : buttonRect.left + buttonRect.width / 2;
    const y = event.clientY && event.clientY > 0 ? event.clientY : buttonRect.top + buttonRect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Inyectar variables CSS para que la GPU renderice la onda expansiva
    document.documentElement.style.setProperty('--theme-wave-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-wave-y', `${y}px`);
    document.documentElement.style.setProperty('--theme-wave-r', `${endRadius}px`);

    const applyThemeChange = () => {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) {
        meta.setAttribute('content', nextTheme === 'light' ? 'only light' : 'only dark');
      }
      try {
        localStorage.setItem('theme', nextTheme);
      } catch {
        // Ignorar si el almacenamiento local está restringido
      }
    };

    // Si el navegador no soporta View Transitions o prefiere reducción de movimiento
    if (
      typeof document === 'undefined' ||
      !('startViewTransition' in document) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      applyThemeChange();
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transition = (document as any).startViewTransition(() => {
        applyThemeChange();
      });

      if (transition && transition.ready) {
        transition.ready.catch(() => {
          // Ignorar silenciosamente si la transición se cancela
        });
      }
    } catch {
      applyThemeChange();
    }
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="min-w-(--size-touch-target) min-h-(--size-touch-target) p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-[color,border-color] duration-150 flex items-center justify-center shadow-[var(--shadow-card)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] active:scale-95"
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

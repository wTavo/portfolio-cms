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

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
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

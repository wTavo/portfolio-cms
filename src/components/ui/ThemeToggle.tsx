/**
 * @file ThemeToggle.tsx
 * @description Botón interactivo y accesible para alternar y persistir entre tema claro y oscuro (Directiva 1).
 */

import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '../icons/Icons';
import { i18n } from '../../lib/i18n/es';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Leer tema previo o preferencia del sistema
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 min-w-(--size-touch-target) min-h-(--size-touch-target) rounded-[var(--radius-md)] p-2" aria-hidden="true" />
    );
  }

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

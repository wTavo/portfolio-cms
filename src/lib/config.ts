/**
 * @file config.ts
 * @description Configuración centralizada del sitio, metadatos globales y feature flags (Directiva 6).
 */

export interface SiteConfig {
  title: string;
  description: string;
  baseUrl: string;
  author: string;
  defaultLocale: string;
  featureFlags: {
    enableRegistration: boolean;
    enablePublicDirectory: boolean;
    enableThemeToggle: boolean;
    enableAnalytics: boolean;
  };
}

export const siteConfig: SiteConfig = {
  title: 'Portafolio Builder — CMS Dinámico',
  description: 'Plataforma profesional para creación, gestión y visualización de portafolios web.',
  baseUrl: 'https://portafolio-builder.pages.dev',
  author: 'Equipo Portafolio Builder',
  defaultLocale: 'es',
  featureFlags: {
    enableRegistration: false, // Solo altas por Superadmin
    enablePublicDirectory: true,
    enableThemeToggle: true,
    enableAnalytics: false,
  },
} as const;

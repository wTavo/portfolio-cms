/**
 * @file constants.ts
 * @description Constantes globales, roles, límites y rutas reservadas del sistema.
 */

/** Roles del sistema */
export const ROLES = {
  SUPERADMIN: 'superadmin',
  OWNER: 'owner',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** Slugs reservados que no pueden ser asignados a ningún portafolio de usuario */
export const RESERVED_SLUGS = [
  'admin',
  'dashboard',
  'login',
  'logout',
  'api',
  'auth',
  'callback',
  'health',
  '404',
  '403',
  '500',
  'sitemap.xml',
  'sitemap-index.xml',
  'robots.txt',
  'favicon.ico',
  'www',
  'app',
  'static',
  'assets',
  'public',
  'new',
  'edit',
  'delete',
  'settings',
  'profile',
] as const;

/** Límites de subida y almacenamiento de archivos */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
  ] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'] as const,
  MAX_IMAGE_DIMENSION_PX: 4096,
} as const;

/** Límites de payload para endpoints JSON */
export const API_LIMITS = {
  MAX_JSON_PAYLOAD_BYTES: 1 * 1024 * 1024, // 1 MB
} as const;

/** Nombres de buckets en Supabase Storage */
export const STORAGE_BUCKETS = {
  PORTFOLIO_MEDIA: 'portfolio-media',
} as const;

/** Tipos de bloques de sección soportados */
export const SECTION_TYPES = {
  HERO: 'hero',
  ABOUT: 'about',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  GALLERY: 'gallery',
  CONTACT: 'contact',
  CUSTOM: 'custom',
} as const;

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

/** Temas visuales soportados */
export const THEMES = {
  MINIMAL: 'minimal',
  PROFESSIONAL: 'professional',
  CREATIVE: 'creative',
  DEVELOPER: 'developer',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

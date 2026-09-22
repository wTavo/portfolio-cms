/**
 * @file portfolio.ts
 * @description Tipos e interfaces de dominio para los bloques de contenido del portfolio.
 */

import type { SectionType } from '../constants';

/** Información principal del perfil */
export interface ProfileData {
  id: string;
  name: string;
  profession: string;
  bio: string;
  photoUrl?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  theme: string;
  isPublished: boolean;
}

/** Configuración de apariencia de una sección */
export interface SectionConfig {
  layout?: 'default' | 'narrow' | 'wide';
  showBackground?: boolean;
  align?: 'left' | 'center' | 'right';
  [key: string]: unknown;
}

/** Estructura base de una sección */
export interface SectionBlock<T = unknown> {
  id: string;
  type: SectionType;
  variant: string;
  title?: string;
  position: number;
  visible: boolean;
  config?: SectionConfig;
  data: T;
}

/** Datos del bloque Hero */
export interface HeroBlockData {
  greeting?: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  avatarUrl?: string;
  statusBadge?: string;
}

/** Datos de experiencia laboral individual */
export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  technologies?: string[];
  companyUrl?: string;
}

/** Datos del bloque Experiencia */
export interface ExperienceBlockData {
  items: ExperienceItem[];
}

/** Datos de proyecto individual */
export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string[];
  featured?: boolean;
}

/** Datos del bloque Proyectos */
export interface ProjectsBlockData {
  items: ProjectItem[];
}

/** Datos de habilidad o categoría */
export interface SkillCategory {
  name: string;
  skills: string[];
}

/** Datos del bloque Habilidades */
export interface SkillsBlockData {
  categories?: SkillCategory[];
  items?: string[];
}

/** Datos del bloque Sobre Mí */
export interface AboutBlockData {
  paragraphs: string[];
  highlights?: { label: string; value: string }[];
}

/** Datos del bloque Contacto */
export interface ContactBlockData {
  message?: string;
  email?: string;
  location?: string;
  availableForHire?: boolean;
}

/** Estructura completa de un Portfolio mock o real */
export interface PortfolioPayload {
  profile: ProfileData;
  sections: SectionBlock[];
}

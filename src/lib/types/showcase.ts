/**
 * @file showcase.ts
 * @description Tipos e interfaces de datos para el Showcase Dual de creadores.
 */

export interface ShowcaseProject {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  photoUrl?: string;
  location?: string;
  theme: string;
  statusBadge?: string;
  skills: string[];
  featuredProjects: ShowcaseProject[];
  accentColor?: string;
}

export interface ShowcaseData {
  creators: CreatorProfile[];
  sharedTechnologies: string[];
}

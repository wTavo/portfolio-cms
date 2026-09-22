/**
 * @file directory.ts
 * @description Tipos e interfaces de datos para el directorio público de portafolios y talentos.
 */

export interface DirectoryProjectPreview {
  title: string;
  description: string;
  technologies: string[];
}

export interface DirectoryProfileItem {
  id: string;
  name: string;
  slug: string;
  profession: string;
  bio: string;
  photoUrl?: string;
  location?: string;
  theme: string;
  category: string;
  skills: string[];
  featuredProjects: DirectoryProjectPreview[];
  isFeatured?: boolean;
}

export interface DirectoryFilterParams {
  category?: string;
  searchQuery?: string;
}

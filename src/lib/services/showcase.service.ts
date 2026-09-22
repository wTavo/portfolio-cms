/**
 * @file showcase.service.ts
 * @description Servicio para obtener y presentar los perfiles del Showcase Dual de creadores.
 */

import { createClient } from '@supabase/supabase-js';
import type { CreatorProfile, ShowcaseData } from '../types/showcase';

/** Perfiles base preconfigurados para el dúo de creadores */
export const SEED_DUAL_CREATORS: CreatorProfile[] = [
  {
    id: 'creator-gustavo',
    name: 'Gustavo Morales',
    slug: 'gustavo',
    role: 'Ingeniero de software & Full-stack Architect',
    bio: 'Construyendo experiencias web modernas, escalables y visualmente atractivas con Astro, TypeScript y Cloudflare.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    location: 'México',
    theme: 'minimal',
    statusBadge: 'Disponible para proyectos',
    skills: ['Astro', 'TypeScript', 'React', 'Cloudflare Workers', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    featuredProjects: [
      {
        title: 'Portafolio Builder CMS',
        description: 'Plataforma dinámica multi-tenant con arquitectura Zero Trust y despliegue edge.',
        technologies: ['Astro', 'React', 'Supabase', 'Cloudflare'],
        githubUrl: 'https://github.com/wTavo/portfolio-cms',
      },
      {
        title: 'AppOPT Authenticator',
        description: 'Autenticador 2FA nativo con criptografía en hardware y diseño ultra fluido.',
        technologies: ['Kotlin', 'Security', 'Material Design 3'],
      },
    ],
    accentColor: 'var(--color-brand-primary)',
  },
  {
    id: 'creator-partner',
    name: 'Creative Partner',
    slug: 'partner',
    role: 'Ingeniero de software & Diseñador de producto',
    bio: 'Especialista en sistemas de diseño modulares, interfaces web inmersivas y arquitecturas frontend de alto rendimiento.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: 'Remoto',
    theme: 'developer',
    statusBadge: 'Colaborando en nuevos productos',
    skills: ['Next.js', 'React', 'Figma', 'Design Systems', 'Node.js', 'GraphQL', 'Motion'],
    featuredProjects: [
      {
        title: 'Design System & Component Library',
        description: 'Biblioteca modular de 150+ componentes accesibles con tokens de diseño centralizados.',
        technologies: ['Figma', 'React', 'Tokens'],
      },
      {
        title: 'Real-time Analytics Engine',
        description: 'Dashboard de visualización de métricas en tiempo real con WebSockets.',
        technologies: ['Node.js', 'PostgreSQL', 'Tailwind CSS'],
      },
    ],
    accentColor: 'var(--color-brand-accent)',
  },
];

/** Tecnologías y herramientas compartidas del equipo */
export const SHARED_TECH_STACK = [
  'Astro',
  'React 19',
  'TypeScript',
  'Cloudflare Workers',
  'Supabase',
  'Tailwind CSS',
  'PostgreSQL',
  'Motion',
  'Zod',
  'Vitest',
];

/**
 * Obtiene los perfiles de los creadores para la página principal del Showcase.
 *
 * @returns Estructura completa de creadores y tecnologías compartidas
 */
export async function getShowcaseData(): Promise<ShowcaseData> {
  try {
    const supabaseUrl =
      (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) ||
      import.meta.env.SUPABASE_URL ||
      '';

    const supabaseKey =
      (typeof process !== 'undefined' ? (process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_SERVICE_ROLE_KEY) : undefined) ||
      import.meta.env.SUPABASE_ANON_KEY ||
      import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';

    if (!supabaseUrl || !supabaseKey) {
      return {
        creators: SEED_DUAL_CREATORS,
        sharedTechnologies: SHARED_TECH_STACK,
      };
    }

    const client = createClient(supabaseUrl, supabaseKey);

    // Consultar perfiles publicados
    const { data: profiles, error: profilesError } = await (client as any)
      .from('profiles')
      .select('id, user_id, name, slug, profession, bio, photo_url, location, theme, is_published')
      .eq('is_published', true)
      .limit(2);

    if (profilesError || !profiles || profiles.length === 0) {
      return {
        creators: SEED_DUAL_CREATORS,
        sharedTechnologies: SHARED_TECH_STACK,
      };
    }

    // Filtrar usuarios activos
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: activeUsers } = await (client as any)
      .from('users')
      .select('id, is_active')
      .in('id', userIds)
      .eq('is_active', true);

    const activeSet = new Set((activeUsers || []).map((u: any) => u.id));
    const validProfiles = profiles.filter((p: any) => activeSet.has(p.user_id));

    if (validProfiles.length === 0) {
      return {
        creators: SEED_DUAL_CREATORS,
        sharedTechnologies: SHARED_TECH_STACK,
      };
    }

    // Consultar proyectos y secciones
    const profileIds = validProfiles.map((p: any) => p.id);
    const { data: sections } = await (client as any)
      .from('sections')
      .select('profile_id, type, data')
      .in('profile_id', profileIds)
      .eq('visible', true);

    const sectionsMap = new Map<string, any[]>();
    if (sections) {
      for (const s of sections) {
        if (!sectionsMap.has(s.profile_id)) {
          sectionsMap.set(s.profile_id, []);
        }
        sectionsMap.get(s.profile_id)!.push(s);
      }
    }

    const liveCreators: CreatorProfile[] = validProfiles.map((p: any, idx: number) => {
      const pSections = sectionsMap.get(p.id) || [];
      const skillsSection = pSections.find((s) => s.type === 'skills');
      const projectsSection = pSections.find((s) => s.type === 'projects');

      const skills: string[] = [];
      if (skillsSection?.data?.categories) {
        for (const cat of skillsSection.data.categories) {
          if (Array.isArray(cat.skills)) skills.push(...cat.skills);
        }
      } else if (Array.isArray(skillsSection?.data?.items)) {
        skills.push(...skillsSection.data.items);
      }

      const featuredProjects = (projectsSection?.data?.items || []).slice(0, 2).map((item: any) => ({
        title: item.title || 'Proyecto',
        description: item.description || '',
        technologies: item.technologies || [],
        githubUrl: item.githubUrl,
        liveUrl: item.projectUrl,
      }));

      return {
        id: p.id,
        name: p.name || `Creador ${idx + 1}`,
        slug: p.slug,
        role: p.profession || 'Ingeniero de software',
        bio: p.bio || 'Construyendo experiencias web modernas.',
        photoUrl: p.photo_url || SEED_DUAL_CREATORS[idx]?.photoUrl,
        location: p.location || 'Remoto',
        theme: p.theme || 'minimal',
        statusBadge: 'Portafolio activo',
        skills: skills.length > 0 ? skills.slice(0, 6) : SEED_DUAL_CREATORS[idx]?.skills || ['Astro', 'TypeScript'],
        featuredProjects: featuredProjects.length > 0 ? featuredProjects : SEED_DUAL_CREATORS[idx]?.featuredProjects || [],
        accentColor: idx === 0 ? 'var(--color-brand-primary)' : 'var(--color-brand-accent)',
      };
    });

    // Si solo hay 1 perfil real registrado en Supabase, completar el segundo con el seed
    if (liveCreators.length === 1) {
      liveCreators.push(SEED_DUAL_CREATORS[1]);
    }

    return {
      creators: liveCreators,
      sharedTechnologies: SHARED_TECH_STACK,
    };
  } catch {
    return {
      creators: SEED_DUAL_CREATORS,
      sharedTechnologies: SHARED_TECH_STACK,
    };
  }
}

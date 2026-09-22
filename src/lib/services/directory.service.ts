/**
 * @file directory.service.ts
 * @description Servicio de negocio para la consulta y catalogación de portafolios públicos publicados.
 */

import { getSupabaseAdminClient } from '../supabase/server';
import type { DirectoryProfileItem } from '../types/directory';

/** Categorías estándar de la plataforma para filtrado rápido */
export const DIRECTORY_CATEGORIES = [
  'Todos',
  'Desarrollo web',
  'Diseño UI/UX',
  'Móvil',
  'Backend & Cloud',
] as const;

/** Lista curada de muestra cuando la base de datos se encuentra en inicialización */
export const SEED_DIRECTORY_PROFILES: DirectoryProfileItem[] = [
  {
    id: 'seed-1',
    name: 'Gustavo Morales',
    slug: 'gustavo',
    profession: 'Ingeniero de software & Full-stack',
    bio: 'Construyendo experiencias web modernas, escalables y visualmente atractivas con Astro, React y TypeScript.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    location: 'México',
    theme: 'minimal',
    category: 'Desarrollo web',
    skills: ['Astro', 'TypeScript', 'React', 'Cloudflare', 'Supabase', 'Tailwind CSS'],
    featuredProjects: [
      {
        title: 'Portafolio Builder CMS',
        description: 'Plataforma dinámica multi-tenant con Astro y Cloudflare Workers.',
        technologies: ['Astro', 'React', 'Supabase'],
      },
      {
        title: 'AppOPT Authenticator',
        description: 'Autenticación en dos pasos con arquitectura Zero Trust.',
        technologies: ['Kotlin', 'Security'],
      },
    ],
    isFeatured: true,
  },
  {
    id: 'seed-2',
    name: 'Sofía Valenzuela',
    slug: 'sofia-design',
    profession: 'Diseñadora de producto & UI/UX',
    bio: 'Diseño sistemas visuales elegantes centrados en la usabilidad, accesibilidad WCAG y microinteracciones fluidas.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    location: 'Remoto / Colombia',
    theme: 'creative',
    category: 'Diseño UI/UX',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Tailwind CSS'],
    featuredProjects: [
      {
        title: 'Fintech Mobile Design System',
        description: 'Biblioteca modular de 120+ componentes accesibles para banca móvil.',
        technologies: ['Figma', 'Tokens'],
      },
      {
        title: 'SaaS Analytics Dashboard',
        description: 'Rediseño completo de experiencia de usuario incrementando retención en 34%.',
        technologies: ['UI/UX', 'Research'],
      },
    ],
    isFeatured: true,
  },
  {
    id: 'seed-3',
    name: 'Mateo Ortega',
    slug: 'mateo-mobile',
    profession: 'Desarrollador móvil senior',
    bio: 'Especialista en desarrollo móvil nativo y multiplataforma enfocado en rendimiento y animaciones a 60fps.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: 'Argentina',
    theme: 'developer',
    category: 'Móvil',
    skills: ['Flutter', 'React Native', 'Kotlin', 'Swift', 'GraphQL', 'Firebase'],
    featuredProjects: [
      {
        title: 'HealthTrack Pro',
        description: 'App médica de monitoreo de biométricos con sincronización en tiempo real.',
        technologies: ['Flutter', 'HealthKit'],
      },
      {
        title: 'Delivery Fast Router',
        description: 'Sistema de geolocalización y despacho optimizado para repartidores.',
        technologies: ['React Native', 'Mapbox'],
      },
    ],
    isFeatured: false,
  },
  {
    id: 'seed-4',
    name: 'Camila Herrera',
    slug: 'camila-cloud',
    profession: 'Arquitecta Cloud & DevOps',
    bio: 'Diseño infraestructuras resilientes, pipelines CI/CD automatizados y arquitecturas serverless de alta disponibilidad.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    location: 'Chile',
    theme: 'professional',
    category: 'Backend & Cloud',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'PostgreSQL', 'Cloudflare'],
    featuredProjects: [
      {
        title: 'Multi-region Microservices Pipeline',
        description: 'Infraestructura como código desplegando clústeres en 3 regiones.',
        technologies: ['Terraform', 'AWS', 'EKS'],
      },
    ],
    isFeatured: false,
  },
];

/**
 * Categoriza automáticamente un perfil según su profesión o habilidades si no tiene categoría explícita.
 *
 * @param profession - Título o profesión del usuario
 * @returns Categoría normalizada para los chips del directorio
 */
export function inferCategory(profession: string = ''): string {
  const p = profession.toLowerCase();
  if (p.includes('diseñ') || p.includes('design') || /\bui\b/.test(p) || /\bux\b/.test(p) || p.includes('product designer')) {
    return 'Diseño UI/UX';
  }
  if (p.includes('móvil') || p.includes('movil') || p.includes('mobile') || p.includes('android') || p.includes('ios') || p.includes('flutter')) {
    return 'Móvil';
  }
  if (p.includes('cloud') || p.includes('backend') || p.includes('devops') || p.includes('data') || p.includes('infra') || p.includes('seguridad')) {
    return 'Backend & Cloud';
  }
  return 'Desarrollo web';
}

/**
 * Obtiene la lista de perfiles públicos publicados para el directorio de la página principal.
 *
 * @returns Lista de perfiles formateados para la cuadrícula y vista previa
 */
export async function getPublishedDirectoryProfiles(): Promise<DirectoryProfileItem[]> {
  try {
    const adminClient = getSupabaseAdminClient();

    // Consultar perfiles publicados
    const { data: profiles, error: profilesError } = await (adminClient as any)
      .from('profiles')
      .select('id, user_id, name, slug, profession, bio, photo_url, location, theme, is_published')
      .eq('is_published', true);

    if (profilesError || !profiles || profiles.length === 0) {
      return SEED_DIRECTORY_PROFILES;
    }

    // Filtrar solo usuarios activos
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: activeUsers } = await (adminClient as any)
      .from('users')
      .select('id, is_active')
      .in('id', userIds)
      .eq('is_active', true);

    const activeUserSet = new Set((activeUsers || []).map((u: any) => u.id));
    const validProfiles = profiles.filter((p: any) => activeUserSet.has(p.user_id));

    if (validProfiles.length === 0) {
      return SEED_DIRECTORY_PROFILES;
    }

    // Consultar secciones de habilidades y proyectos para enriquecer tarjetas
    const profileIds = validProfiles.map((p: any) => p.id);
    const { data: sections } = await (adminClient as any)
      .from('sections')
      .select('profile_id, type, data')
      .in('profile_id', profileIds)
      .eq('visible', true);

    const sectionsByProfile = new Map<string, any[]>();
    if (sections) {
      for (const s of sections) {
        if (!sectionsByProfile.has(s.profile_id)) {
          sectionsByProfile.set(s.profile_id, []);
        }
        sectionsByProfile.get(s.profile_id)!.push(s);
      }
    }

    const liveItems: DirectoryProfileItem[] = validProfiles.map((p: any) => {
      const pSections = sectionsByProfile.get(p.id) || [];
      const skillsSection = pSections.find((s) => s.type === 'skills');
      const projectsSection = pSections.find((s) => s.type === 'projects');

      // Extraer habilidades
      const skills: string[] = [];
      if (skillsSection?.data?.categories) {
        for (const cat of skillsSection.data.categories) {
          if (Array.isArray(cat.skills)) {
            skills.push(...cat.skills);
          }
        }
      } else if (Array.isArray(skillsSection?.data?.items)) {
        skills.push(...skillsSection.data.items);
      }

      // Extraer proyectos
      const featuredProjects = (projectsSection?.data?.items || []).slice(0, 2).map((item: any) => ({
        title: item.title || 'Proyecto',
        description: item.description || '',
        technologies: item.technologies || [],
      }));

      return {
        id: p.id,
        name: p.name || 'Profesional',
        slug: p.slug,
        profession: p.profession || 'Desarrollador',
        bio: p.bio || 'Portafolio profesional en Portafolio Builder CMS.',
        photoUrl: p.photo_url || undefined,
        location: p.location || undefined,
        theme: p.theme || 'minimal',
        category: inferCategory(p.profession),
        skills: skills.length > 0 ? skills.slice(0, 6) : ['Astro', 'TypeScript', 'Tailwind CSS'],
        featuredProjects: featuredProjects.length > 0 ? featuredProjects : [],
        isFeatured: true,
      };
    });

    // Combinar los perfiles activos reales con los de muestra asegurando variedad
    const existingSlugs = new Set(liveItems.map((item) => item.slug));
    const extraSeeds = SEED_DIRECTORY_PROFILES.filter((s) => !existingSlugs.has(s.slug));

    return [...liveItems, ...extraSeeds];
  } catch {
    return SEED_DIRECTORY_PROFILES;
  }
}

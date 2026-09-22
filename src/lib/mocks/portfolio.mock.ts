/**
 * @file portfolio.mock.ts
 * @description Datos mock enriquecidos para visualizar y probar bloques y variantes de portafolio.
 */

import type { PortfolioPayload } from '../types/portfolio';

export const mockPortfolioData: PortfolioPayload = {
  profile: {
    id: 'mock-profile-001',
    name: 'Gustavo Morales',
    profession: 'Ingeniero de software & Desarrollador full-stack',
    bio: 'Construyendo experiencias web modernas, escalables y visualmente atractivas con Astro, React y TypeScript.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    location: 'México',
    email: 'contacto@ejemplo.com',
    website: 'https://github.com',
    socialLinks: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    metaTitle: 'Gustavo Morales | Ingeniero de software',
    metaDescription: 'Portafolio profesional con proyectos destacados, experiencia y habilidades técnicas.',
    theme: 'minimal',
    isPublished: true,
  },
  sections: [
    {
      id: 'section-hero',
      type: 'hero',
      variant: 'minimal',
      position: 1,
      visible: true,
      data: {
        greeting: 'Hola, soy Gustavo',
        headline: 'Creo aplicaciones web eficientes con diseño limpio y arquitectura moderna',
        subheadline: 'Especializado en interfaces de alto rendimiento, sistemas backend y plataformas CMS.',
        ctaText: 'Ver proyectos',
        ctaLink: '#proyectos',
        secondaryCtaText: 'Contactar',
        secondaryCtaLink: '#contacto',
        statusBadge: 'Disponible para nuevos proyectos',
      },
    },
    {
      id: 'section-about',
      type: 'about',
      variant: 'default',
      title: 'Sobre mí',
      position: 2,
      visible: true,
      data: {
        paragraphs: [
          'Soy un desarrollador apasionado por crear software bien estructurado, accesible y con excelente rendimiento.',
          'Me enfoco en el desarrollo full-stack utilizando arquitecturas serverless, bases de datos relacionales y buenas prácticas de seguridad e interfaces de usuario intuitivas.',
        ],
        highlights: [
          { label: 'Experiencia', value: '+4 años' },
          { label: 'Especialidad', value: 'Web & Cloud' },
          { label: 'Enfoque', value: 'UX & Seguridad' },
        ],
      },
    },
    {
      id: 'section-experience',
      type: 'experience',
      variant: 'timeline',
      title: 'Experiencia laboral',
      position: 3,
      visible: true,
      data: {
        items: [
          {
            id: 'exp-1',
            company: 'Tech Studio',
            position: 'Desarrollador full-stack senior',
            description: 'Liderazgo en la arquitectura de aplicaciones web con Astro y Cloudflare Workers. Optimización de rendimiento y diseño de APIs REST seguras.',
            startDate: '2023',
            isCurrent: true,
            location: 'Remoto',
            technologies: ['Astro', 'TypeScript', 'Cloudflare', 'Supabase', 'Tailwind CSS'],
          },
          {
            id: 'exp-2',
            company: 'Digital Solutions',
            position: 'Desarrollador frontend',
            description: 'Desarrollo de interfaces modulares en React, integración de sistemas de diseño y mejora del Core Web Vitals en más de 10 productos digitales.',
            startDate: '2021',
            endDate: '2023',
            location: 'Híbrido',
            technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
          },
        ],
      },
    },
    {
      id: 'section-projects',
      type: 'projects',
      variant: 'cards',
      title: 'Proyectos destacados',
      position: 4,
      visible: true,
      data: {
        items: [
          {
            id: 'proj-1',
            title: 'Portafolio Builder CMS',
            description: 'Plataforma dinámica multi-tenant para crear y personalizar portafolios profesionales con Astro, Supabase y Cloudflare.',
            technologies: ['Astro', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
            githubUrl: 'https://github.com/wTavo/portfolio-cms',
            featured: true,
          },
          {
            id: 'proj-2',
            title: 'AppOPT Authenticator',
            description: 'Aplicación nativa de autenticación de dos factores con arquitectura de seguridad Zero Trust y criptografía en hardware.',
            technologies: ['Kotlin', 'Jetpack Compose', 'Material Design 3', 'Security'],
            featured: true,
          },
        ],
      },
    },
    {
      id: 'section-skills',
      type: 'skills',
      variant: 'badges',
      title: 'Habilidades técnicas',
      position: 5,
      visible: true,
      data: {
        categories: [
          {
            name: 'Frontend',
            skills: ['Astro', 'React', 'TypeScript', 'Tailwind CSS', 'HTML Semántico', 'WCAG AA'],
          },
          {
            name: 'Backend & Cloud',
            skills: ['Node.js', 'PostgreSQL', 'Supabase', 'Cloudflare Workers', 'REST APIs', 'RLS'],
          },
          {
            name: 'Herramientas & Prácticas',
            skills: ['Git', 'Vitest', 'CI/CD', 'SEO', 'Arquitectura limpia', 'Zod'],
          },
        ],
      },
    },
    {
      id: 'section-contact',
      type: 'contact',
      variant: 'simple',
      title: 'Contacto',
      position: 6,
      visible: true,
      data: {
        message: '¿Tienes un proyecto en mente o te interesa colaborar? Envíame un mensaje y conversemos.',
        email: 'contacto@ejemplo.com',
        location: 'México',
        availableForHire: true,
      },
    },
  ],
};

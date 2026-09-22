# Plan de desarrollo — Portfolio Web Dinámico

## 1. Objetivo del proyecto

Desarrollar una plataforma web para crear y administrar un portfolio profesional dinámico.

La página permitirá mostrar información como:

- Información personal
- Experiencia laboral
- Educación
- Habilidades
- Proyectos
- Galería de imágenes
- Redes sociales
- Información de contacto
- Secciones personalizadas

El objetivo principal es que el desarrollador diseñe y programe experiencias visuales atractivas, modernas e interactivas, mientras que el propietario del portfolio pueda modificar el contenido sin necesidad de editar código.

## 2. Concepto del proyecto

El proyecto no se plantea simplemente como una página web estática, sino como un CMS especializado para portfolios profesionales.

```text
                    PORTFOLIO
                        │
          ┌─────────────┴─────────────┐
          │                           │
     PÁGINA PÚBLICA              PANEL ADMIN
          │                           │
        Astro                       React
          │                           │
    Componentes visuales       Editor de contenido
    Animaciones                Formularios
    Secciones                  Subida de imágenes
    Temas                      Ordenamiento
          │                    Vista previa
          └─────────────┬─────────────┘
                        │
                     Supabase
                        │
              ┌─────────┼─────────┐
              │         │         │
          PostgreSQL   Auth     Storage
```

## 3. Objetivos

### Objetivos principales

- Crear una página profesional y visualmente atractiva.
- Utilizar tecnologías modernas.
- Optimizar el rendimiento y SEO.
- Permitir contenido dinámico.
- Permitir al propietario modificar el contenido.
- Permitir subir imágenes.
- Permitir agregar y eliminar secciones.
- Permitir reordenar secciones.
- Permitir diferentes variantes de diseño.
- Mantener inicialmente el proyecto con infraestructura gratuita.
- Dejar preparada la arquitectura para añadir un dominio personalizado posteriormente.

### Objetivos futuros

- Soporte para múltiples portfolios.
- Diferentes temas visuales.
- Editor visual más avanzado.
- Personalización de colores y tipografías.
- Drag & Drop.
- Preview en tiempo real.
- Posible evolución hacia un SaaS.

## 4. Stack tecnológico

### Frontend

#### Astro

Framework principal para la página pública.

Responsabilidades:

- Renderizado de páginas.
- Generación de HTML.
- SEO.
- Estructura del sitio.
- Optimización del JavaScript.
- Integración con componentes interactivos.

Astro utiliza una arquitectura basada en "islands", permitiendo enviar JavaScript únicamente a las partes que realmente necesitan interactividad.

#### React

Utilizado para componentes que requieren interacción compleja.

Principalmente:

- Panel administrativo.
- Editor.
- Formularios.
- Galerías interactivas.
- Carruseles.
- Drag & Drop.
- Componentes con estado.
- Preview dinámico.
- Elementos interactivos de la página pública.

#### TypeScript

Lenguaje principal del proyecto.

Objetivos:

- Tipado estático.
- Mejor mantenibilidad.
- Seguridad en los datos.
- Mejor experiencia de desarrollo.
- Interfaces para el contenido del CMS.

#### Tailwind CSS

Framework CSS principal.

Se utilizará para:

- Diseño responsive.
- Sistema de estilos.
- Layouts.
- Componentes.
- Temas.
- Animaciones CSS.
- Estados visuales.

### Animaciones

#### CSS

Para:

- Transiciones.
- Hover.
- Transformaciones.
- Animaciones sencillas.
- Gradientes.
- Filtros.

#### Motion

Para:

- Animaciones de componentes.
- Entrada y salida.
- Scroll.
- Layout animations.
- Interacciones.

#### GSAP

Opcional para animaciones avanzadas y coreografías complejas.

#### Three.js

Opcional para futuras experiencias 3D/WebGL.

No se incorporarán estas tecnologías innecesariamente. Cada una se utilizará únicamente cuando aporte valor visual o funcional.

## 5. Backend y servicios

### Supabase

Supabase será utilizado como backend principal.

#### PostgreSQL

Base de datos para almacenar:

- Usuarios
- Perfil
- Experiencia laboral
- Educación
- Habilidades
- Proyectos
- Secciones
- Configuración
- Temas
- Orden de las secciones

#### Supabase Auth

Sistema de autenticación para el panel administrativo.

Ejemplo:

```text
/admin
```

El usuario deberá iniciar sesión para administrar el contenido.

#### Supabase Storage

Almacenamiento de:

- Fotografías.
- Logos.
- Imágenes de proyectos.
- Galerías.
- Otros archivos multimedia permitidos.

Las imágenes no se almacenarán directamente dentro del repositorio.

## 6. Hosting

### Cloudflare

Cloudflare será utilizado inicialmente como infraestructura de despliegue.

El objetivo es mantener el proyecto en **$0 inicialmente**, utilizando los planes gratuitos disponibles y respetando sus límites.

La página podrá utilizar inicialmente un subdominio proporcionado por Cloudflare:

```text
https://nombre-del-proyecto.pages.dev
```

No se comprará un dominio durante la primera etapa.

## 7. Repositorio

### GitHub

El código fuente estará almacenado en GitHub.

```text
GitHub
   │
   └── portfolio
          │
          ▼
      Cloudflare
          │
          ▼
       Página web
```

Cada actualización podrá desplegarse automáticamente mediante CI/CD.

## 8. Dominio

### Etapa inicial

No comprar dominio.

Utilizar:

```text
nombre-del-proyecto.pages.dev
```

Costo:

```text
$0
```

### Etapa futura

Si el cliente decide adquirir un dominio:

```text
nombre.com
```

se podrá registrar posteriormente y conectarlo al mismo proyecto.

Una opción a evaluar será Cloudflare Registrar.

El cambio de dominio no deberá requerir modificar la arquitectura de la aplicación.

## 9. Arquitectura del contenido

El contenido deberá estar separado del diseño.

```text
Contenido
    │
    ▼
Supabase
    │
    ▼
Astro / React
    │
    ▼
Diseño
```

El cliente modifica los datos, pero no el código visual.

## 10. Sistema de bloques

La página utilizará un sistema de bloques/secciones.

Ejemplos:

```text
Hero
Texto
Imagen
Texto + Imagen
Experiencia
Educación
Proyecto
Galería
Video
Botones
Testimonios
Contacto
```

Cada bloque tendrá su propia estructura y diseño.

Ejemplo:

```text
section
----------------
id
profile_id
type
position
visible
data
```

El campo `type` determina qué componente debe utilizarse.

```text
type = "hero"
```

Renderiza:

```text
Hero
```

Mientras que:

```text
type = "experience"
```

renderiza:

```text
Experience
```

## 11. Separación entre contenido y diseño

El sistema deberá seguir este principio:

> El usuario administra contenido; el desarrollador controla la experiencia visual.

Ejemplo:

El cliente proporciona:

```text
Empresa:
Empresa X

Puesto:
Software Engineer

Descripción:
Desarrollo de aplicaciones...

Fecha:
2024 - 2026
```

El sistema decide cómo mostrarlo:

```text
Timeline
Cards
Minimal
Interactive
```

Esto permite crear diseños atractivos sin permitir que el usuario rompa la identidad visual del sitio.

## 12. Variantes de diseño

Cada sección podrá tener diferentes variantes.

Ejemplo:

```text
Experience

- Timeline
- Cards
- Minimal
- Interactive
```

Internamente:

```text
ExperienceTimeline
ExperienceCards
ExperienceMinimal
ExperienceInteractive
```

El usuario podrá seleccionar una variante desde el panel administrativo.

## 13. Temas visuales

Se podrán crear diferentes temas.

### Minimal

- Espacios amplios.
- Tipografía limpia.
- Diseño simple.
- Pocos elementos decorativos.

### Professional

- Apariencia corporativa.
- Estructura organizada.
- Colores sobrios.

### Creative

- Gradientes.
- Animaciones.
- Elementos dinámicos.
- Diseños más experimentales.

### Developer

- Dark mode.
- Estética tecnológica.
- Tipografía monoespaciada.
- Elementos inspirados en interfaces de desarrollo.

Los temas serán definidos por el desarrollador.

## 14. Página pública

La página pública podría incluir inicialmente:

```text
/
├── Hero
├── Sobre mí
├── Experiencia
├── Educación
├── Habilidades
├── Proyectos
├── Galería
└── Contacto
```

Sin embargo, la estructura final no será necesariamente fija.

El sistema deberá permitir:

```text
Hero
↓
Sobre mí
↓
Proyectos
↓
Experiencia
↓
Galería
↓
Contacto
```

o:

```text
Hero
↓
Experiencia
↓
Proyectos
↓
Habilidades
↓
Contacto
```

dependiendo de la configuración del usuario.

## 15. Panel administrativo

Ruta principal:

```text
/admin
```

Secciones iniciales:

```text
Dashboard
Perfil
Secciones
Experiencia
Educación
Proyectos
Galería
Multimedia
Tema
Configuración
```

## 16. Editor

El editor deberá permitir:

- Crear sección.
- Editar sección.
- Eliminar sección.
- Ocultar sección.
- Mostrar sección.
- Reordenar sección.
- Seleccionar variante.
- Modificar contenido.
- Subir imágenes.
- Previsualizar cambios.

Interfaz conceptual:

```text
┌──────────────────────┬─────────────────────────┐
│ COMPONENTES          │ PREVIEW                 │
│                      │                         │
│ + Hero               │      Portfolio          │
│ + Texto              │                         │
│ + Imagen             │      Hero               │
│ + Galería            │                         │
│ + Experiencia        │      Sobre mí           │
│ + Proyecto           │                         │
│ + Contacto           │      Experiencia        │
│                      │                         │
└──────────────────────┴─────────────────────────┘
```

## 17. Drag & Drop

En una fase posterior, el editor podrá permitir:

```text
☰ Hero

☰ Sobre mí

☰ Experiencia

☰ Proyectos

☰ Galería

☰ Contacto
```

y modificar el orden mediante Drag & Drop.

El nuevo orden se almacenará en:

```text
position
```

## 18. Arquitectura de componentes

Estructura aproximada:

```text
src/
│
├── components/
│   │
│   ├── blocks/
│   │   ├── Hero/
│   │   ├── About/
│   │   ├── Experience/
│   │   ├── Education/
│   │   ├── Skills/
│   │   ├── Projects/
│   │   ├── Gallery/
│   │   └── Contact/
│   │
│   ├── editor/
│   │   ├── SectionEditor/
│   │   ├── BlockSelector/
│   │   ├── SortableList/
│   │   └── Preview/
│   │
│   └── ui/
│
├── layouts/
│
├── pages/
│   ├── index.astro
│   └── admin/
│
├── lib/
│   ├── supabase.ts
│   ├── content.ts
│   └── types.ts
│
└── styles/
```

La estructura podrá modificarse durante el desarrollo si aparecen necesidades mejores.

## 19. Modelo de datos inicial

### profiles

```text
id
name
profession
bio
photo
location
email
phone
website
created_at
updated_at
```

### experiences

```text
id
profile_id
company
position
description
start_date
end_date
logo
location
order
created_at
updated_at
```

### education

```text
id
profile_id
institution
degree
description
start_date
end_date
logo
order
```

### projects

```text
id
profile_id
title
description
image
url
github_url
technologies
order
```

### sections

```text
id
profile_id
type
variant
position
visible
data
created_at
updated_at
```

El modelo definitivo se diseñará antes de implementar el backend.

## 20. Seguridad

El panel administrativo deberá estar protegido mediante autenticación.

Supabase Row Level Security (RLS) deberá utilizarse para garantizar que un usuario únicamente pueda modificar los datos que le corresponden.

Ejemplo conceptual:

```text
Usuario A
   ↓
Puede modificar
Portfolio A

Usuario B
   ↓
Puede modificar
Portfolio B
```

No se deberá confiar únicamente en restricciones del frontend.

## 21. Optimización de imágenes

Las imágenes deberán optimizarse antes de almacenarse o servirse.

Consideraciones:

- WebP/AVIF cuando sea apropiado.
- Redimensionamiento.
- Compresión.
- Límites de tamaño.
- Lazy loading.
- Responsive images.
- Evitar imágenes innecesariamente grandes.

Ejemplo de límite inicial:

```text
Máximo por imagen: 5 MB
```

El límite podrá modificarse posteriormente.

## 22. SEO

La página pública deberá incluir:

- `title`
- `description`
- Open Graph
- Twitter/X Cards
- URLs limpias
- Sitemap
- Robots.txt
- HTML semántico
- Imágenes con `alt`
- Datos estructurados cuando sean apropiados

También se deberá considerar:

- Core Web Vitals.
- Performance.
- Accesibilidad.
- Mobile-first.

## 23. Responsive Design

El diseño deberá funcionar correctamente en:

```text
Mobile
Tablet
Laptop
Desktop
```

La prioridad será:

```text
Mobile
   ↓
Tablet
   ↓
Desktop
```

No se deberá diseñar únicamente pensando en escritorio.

## 24. Accesibilidad

Considerar desde el inicio:

- HTML semántico.
- Navegación mediante teclado.
- Contraste adecuado.
- Estados `focus`.
- `aria-*` cuando sea necesario.
- Texto alternativo.
- Respeto a `prefers-reduced-motion`.

Las animaciones no deberán impedir el uso normal de la página.

## 25. Fases de desarrollo

### Fase 1 — Diseño conceptual

Definir:

- Identidad visual.
- Paleta.
- Tipografías.
- Layout.
- Animaciones.
- Secciones.
- Componentes.
- Responsive design.

Resultado:

```text
Sistema visual definido
```

### Fase 2 — Setup

Crear:

- Proyecto Astro.
- TypeScript.
- React.
- Tailwind.
- Git.
- GitHub.
- Configuración inicial de Cloudflare.
- Proyecto Supabase.

### Fase 3 — Página pública

Implementar:

- Layout.
- Header.
- Hero.
- About.
- Experience.
- Education.
- Skills.
- Projects.
- Gallery.
- Contact.
- Footer.

Inicialmente utilizando datos mock.

### Fase 4 — Sistema de componentes

Crear componentes reutilizables:

```text
Hero
Experience
Project
Gallery
Section
Button
Card
Timeline
Modal
```

Definir variantes visuales.

### Fase 5 — Supabase

Implementar:

- PostgreSQL.
- Tablas.
- Relaciones.
- RLS.
- Auth.
- Storage.

### Fase 6 — Panel administrativo

Implementar:

```text
/login
/admin
/admin/profile
/admin/sections
/admin/experience
/admin/projects
/admin/gallery
/admin/theme
```

### Fase 7 — Editor

Implementar:

- Crear sección.
- Editar.
- Eliminar.
- Ocultar.
- Mostrar.
- Reordenar.
- Variantes.
- Preview.

### Fase 8 — Multimedia

Implementar:

- Upload.
- Storage.
- Compresión.
- Preview.
- Eliminación.
- Gestión de imágenes.

### Fase 9 — Animaciones

Agregar:

- Scroll animations.
- Transiciones.
- Hover effects.
- Microinteracciones.
- Page transitions.

Las animaciones deberán incorporarse después de tener la estructura funcional para evitar complicar el desarrollo prematuramente.

### Fase 10 — Optimización

Revisar:

- Performance.
- SEO.
- Accesibilidad.
- Mobile.
- Imágenes.
- JavaScript enviado al cliente.
- Tiempos de carga.

### Fase 11 — Deploy

Configurar:

```text
GitHub
   ↓
Cloudflare
   ↓
Production
```

Obtener inicialmente:

```text
https://nombre.pages.dev
```

## 26. Control de versiones

Utilizar Git con commits pequeños y descriptivos.

Ejemplos:

```text
feat: add portfolio hero section
feat: add experience component
feat: add Supabase authentication
feat: add admin dashboard
feat: add image upload
feat: add section editor

fix: fix mobile navigation
fix: fix image upload validation

refactor: improve section rendering
refactor: reorganize portfolio components

perf: optimize portfolio images
perf: reduce client-side javascript
```

## 27. Estrategia de costos

### Inicialmente

```text
Astro             $0
React             $0
TypeScript        $0
Tailwind          $0
GitHub            $0
Cloudflare        $0
Supabase          $0
Dominio           $0
```

### Total inicial

```text
$0 / mes
```

Siempre sujeto a las cuotas y condiciones vigentes de los servicios gratuitos.

## 28. Evolución futura

Si el cliente quiere invertir posteriormente:

```text
                 PROYECTO
                    │
        ┌───────────┴───────────┐
        │                       │
    Dominio                  Servicios
        │                       │
   nombre.com              Plan superior
```

El dominio podrá agregarse sin modificar la aplicación.

Si el proyecto crece, también podrá evolucionar hacia:

```text
Portfolio CMS
      ↓
Multiusuario
      ↓
Multi-tenant
      ↓
SaaS
```

## 29. Principios de desarrollo

### 1. Diseño primero

La experiencia visual será una parte fundamental del producto.

### 2. Contenido separado del diseño

El usuario modifica contenido, no código.

### 3. Componentización

Los bloques deberán ser reutilizables.

### 4. Performance

No utilizar JavaScript donde no sea necesario.

### 5. Responsive

Mobile-first.

### 6. Accesibilidad

Debe considerarse desde el diseño inicial.

### 7. Seguridad

La autorización deberá aplicarse en backend mediante RLS y no solamente en el frontend.

### 8. Escalabilidad

Aunque inicialmente exista un solo cliente, la arquitectura deberá permitir crecer.

### 9. Costos

Evitar servicios de pago mientras no sean necesarios.

## 30. Stack final propuesto

```text
Frontend
├── Astro
├── React
├── TypeScript
└── Tailwind CSS

Animaciones
├── CSS
├── Motion
└── GSAP (cuando sea necesario)

Backend
└── Supabase
    ├── PostgreSQL
    ├── Auth
    └── Storage

Deployment
└── Cloudflare

Version Control
└── GitHub

Dominio inicial
└── *.pages.dev
```

## 31. Resultado esperado

Al finalizar la primera versión, el cliente deberá poder:

1. Iniciar sesión.
2. Editar su información personal.
3. Agregar experiencia laboral.
4. Agregar educación.
5. Agregar proyectos.
6. Subir imágenes.
7. Crear secciones.
8. Eliminar secciones.
9. Ocultar secciones.
10. Reordenar secciones.
11. Seleccionar variantes de diseño.
12. Ver una previsualización.
13. Publicar los cambios.

Mientras que el desarrollador deberá poder:

1. Crear nuevos bloques.
2. Crear nuevas variantes visuales.
3. Crear nuevos temas.
4. Mejorar las animaciones.
5. Mejorar el diseño.
6. Agregar nuevas funcionalidades.
7. Mantener el sistema sin modificar manualmente el contenido del cliente.

## 32. Prioridad inicial

El desarrollo deberá comenzar en este orden:

```text
1. Diseño visual
        ↓
2. Sistema de componentes
        ↓
3. Página pública
        ↓
4. Modelo de datos
        ↓
5. Supabase
        ↓
6. Autenticación
        ↓
7. Panel administrativo
        ↓
8. Editor de secciones
        ↓
9. Upload de imágenes
        ↓
10. Animaciones avanzadas
        ↓
11. SEO + Performance + Accessibility
        ↓
12. Deploy
```

La prioridad es construir primero una experiencia visual sólida, y posteriormente desarrollar el CMS alrededor de los componentes y patrones de diseño ya definidos.

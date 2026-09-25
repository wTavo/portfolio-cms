# Reglas y Directivas del Proyecto — Portfolio Web Dinámico (CMS)

Este archivo define las directivas y estándares obligatorios de desarrollo que el asistente de IA y los desarrolladores deben cumplir estrictamente en cada modificación o adición de código.

---

## 1. Escala Tipográfica y Tokens de Diseño Centralizados
- **PROHIBIDO** quemar tamaños de texto, colores, fuentes o pesos directamente en los componentes (ej. `text-[16px]`, `text-gray-500`, `font-bold` sueltos y repetidos).
- **OBLIGATORIO** definir y consumir una escala tipográfica y tokens de diseño centralizados en `src/styles/tokens/` a través de CSS custom properties y clases utilitarias del tema:
  - `--font-display`: Para títulos hero y de alto impacto visual.
  - `--font-heading`: Para títulos de secciones y tarjetas.
  - `--font-body`: Para párrafos, descripciones y texto de lectura continua.
  - `--font-label`: Para botones, etiquetas de formulario, badges y metadatos.
  - `--font-mono`: Para bloques de código, datos técnicos o terminales (tema Developer).
- **OBLIGATORIO** definir la paleta de colores completa (incluyendo variantes dark mode), sombras, radios de borde y espaciados como tokens centralizados.

---

## 2. Centralización de Textos e Internacionalización
- **PROHIBIDO** quemar textos de interfaz del sistema directamente en los componentes (ej. `<button>Guardar cambios</button>`). Aplica al **panel administrativo, dashboard de usuario y componentes del sistema**, no al contenido dinámico que viene de la base de datos.
- **OBLIGATORIO** declarar los textos de interfaz en un módulo centralizado (`src/lib/i18n/es.ts`) para facilitar mantenimiento y futura internacionalización.
- **OBLIGATORIO el uso de "Sentence case" estándar en español** en toda la interfaz: Solo la primera letra de la oración debe ir en mayúscula (ej. CORRECTO: "Guardar cambios", "Editar perfil", "Agregar sección"). INCORRECTO: "Guardar Cambios", "Editar Perfil".
- **PROHIBIDO el uso de la palabra «Cancelar»** en modales y diálogos. Solo se permite **«Cerrar»** (para descartar) o **«Volver»** (para regresar de un sub-paso).

---

## 3. Sistema Centralizado de Animaciones y Movimiento
- **PROHIBIDO** quemar duraciones mágicas (`duration-300`, `delay-[750ms]`), curvas de aceleración sueltas o keyframes arbitrarios en los componentes.
- **PROHIBIDO** animar propiedades de alto costo de rasterizado/pintado (`filter: drop-shadow()`, `filter: blur()`, `box-shadow`) dinámicamente en múltiples keyframes concurrentes por software.
- **OBLIGATORIO** implementar la técnica de capas de opacidad (*Layered Glow Technique*): definir capas de resplandor pre-rasterizadas en GPU y animar exclusivamente `opacity` y `transform` (GPU Compositor), garantizando 60/120 FPS fijos sin degradación de rendimiento.
- **OBLIGATORIO** consumir las duraciones, curvas y presets de animación centralizados en `src/styles/tokens/motion.css` y/o `src/lib/motion.ts`:
  - `--motion-duration-fast`: 150ms — microinteracciones, hover, focus.
  - `--motion-duration-normal`: 250ms — transiciones de contenido, modales.
  - `--motion-duration-slow`: 400ms — animaciones de entrada de secciones, scroll reveals.
  - `--motion-easing-standard`: `cubic-bezier(0.2, 0, 0, 1)` — movimiento estándar.
  - `--motion-easing-decelerate`: `cubic-bezier(0, 0, 0, 1)` — entradas de contenido.
  - `--motion-easing-accelerate`: `cubic-bezier(0.3, 0, 1, 1)` — salidas de contenido.
- **OBLIGATORIO** respetar `prefers-reduced-motion` en todas las animaciones.
- **PROHIBIDO** simular cargas con `delay()` artificiales. Todo indicador de progreso responde a la duración real del trabajo asíncrono.

---

## 4. Sistema Centralizado de Espaciados, Dimensiones y Elevaciones
- **PROHIBIDO** quemar valores arbitrarios de espaciado, radios de borde, sombras o elevaciones en los componentes (ej. `p-[13px]`, `rounded-[10px]`).
- **OBLIGATORIO** consumir los tokens de diseño centralizados en `src/styles/tokens/spacing.css`:
  - `--spacing-xs` (4px), `--spacing-sm` (8px), `--spacing-md` (12px), `--spacing-lg` (16px), `--spacing-xl` (24px), `--spacing-2xl` (32px), `--spacing-3xl` (48px).
  - `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (16px), `--radius-xl` (24px), `--radius-full` (9999px).
  - Sombras predefinidas: `--shadow-card`, `--shadow-modal`, `--shadow-dropdown`.
  - Tamaños de componente: `--size-button-height` (44px), `--size-input-height` (44px), `--size-icon-sm/md/lg`.
- **OBLIGATORIO** incluir siempre espacio de respiro inferior en toda pantalla y lista scrolleable.
- **OBLIGATORIO** respetar target táctil mínimo de **44×44px** en todos los elementos interactivos (WCAG 2.2 AAA).

---

## 5. Reutilización de Componentes de Interfaz (DRY)
- **PROHIBIDO** duplicar contenedores de sección, tarjetas, formularios, modales o layouts entre pantallas o componentes.
- **OBLIGATORIO** encapsular y reutilizar componentes modulares:
  - **Página pública (`src/components/ui/`)**: `Button.astro`, `Card.astro`, `SectionContainer.astro`, `SEOHead.astro`.
  - **Paneles (`src/components/admin/ui/`, `src/components/dashboard/ui/`)**: `AdminButton.tsx`, `FormField.tsx`, `Modal.tsx`, `Toast.tsx`, `ConfirmDialog.tsx`, `LoadingButton.tsx`.
  - **Despachador central**: `BlockRenderer.astro` para mapear dinámicamente `type` y `variant` hacia el componente visual correspondiente.
- **PROHIBIDO** crear componentes *wrapper* que únicamente re-envíen props sin agregar lógica o presentación (antipatrón de intermediarios pasivos).

---

## 6. Centralización de Constantes, Configuración y Claves
- **PROHIBIDO** dispersar cadenas literales, números mágicos, límites de upload, claves de storage, nombres de tablas o rutas de API en los componentes.
- **OBLIGATORIO** declarar y consumir todas las constantes en módulos centralizados:
  - `src/lib/constants.ts`: Límites de upload, extensiones permitidas, dimensiones máximas, nombres de buckets, rutas de API, roles (`superadmin`, `owner`), slugs reservados (`RESERVED_SLUGS`).
  - `src/lib/config.ts`: Configuración del sitio (título, descripción, URL base, feature flags).
  - `src/lib/security.config.ts`: Configuración de seguridad (CSP, CORS, rate limit thresholds, cookie settings).

---

## 7. Documentación TSDoc
- **OBLIGATORIO** que **cada** servicio, helper, validator, guard, tipo e interfaz en `src/lib/` incluya documentación TSDoc (`/** ... */`).
- **OBLIGATORIO** documentar parámetros (`@param`), retornos (`@returns`) y excepciones posibles (`@throws`).
- Componentes `.astro` y `.tsx` deben incluir un comentario de cabecera explicando su propósito y Props esperadas.

---

## 8. Arquitectura Limpia y Separación de Capas
- **Capa de Presentación (`src/pages/`, `src/components/`, `src/layouts/`)**: Renderizado visual y UI. Cero lógica de negocio ni acceso directo a Supabase.
- **Capa de Guards (`src/lib/guards/`)**: Funciones de autorización por rol y validación de ownership.
- **Capa de Servicios (`src/lib/services/`)**: Lógica de negocio, orquestación de operaciones y acceso a datos.
- **Capa de Validación (`src/lib/validators/`)**: Schemas de Zod para validación server-side.
- **Capa de Datos (`src/lib/supabase/`)**: Clientes Supabase (anon y server) y tipos generados de base de datos.
- **Capa de Utilidades (`src/lib/helpers/`)**: Funciones puras sin side effects.
- **PROHIBIDO** acceder a Supabase directamente desde componentes `.astro` o `.tsx`. Siempre a través de servicios.
- **PROHIBIDO** colocar lógica de negocio en endpoints de API. Los endpoints delegan a servicios.

---

## 9. Seguridad: Zero Trust, Roles y Defensa en Profundidad
- **PROHIBIDO** confiar en validaciones client-side para seguridad.
- **PROHIBIDO** exponer la `SUPABASE_SERVICE_ROLE_KEY` en el cliente, en variables `PUBLIC_*` o en repositorios.
- **PROHIBIDO** crear tablas en Supabase sin habilitar Row Level Security (RLS).
- **OBLIGATORIO** validar todo input del usuario server-side con Zod antes de procesar en base de datos.
- **OBLIGATORIO** aplicar Security Headers en el middleware (`src/middleware.ts`):
  - CSP restrictiva permitiendo únicamente orígenes necesarios.
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`.
- **OBLIGATORIO** distinguir tres niveles de autorización:
  1. **Autenticación**: ¿Tiene sesión válida?
  2. **Rol**: ¿Es `superadmin` para `/admin/*` o `owner` para `/dashboard/*`?
  3. **Propiedad (Ownership)**: ¿El portfolio/sección que intenta modificar pertenece a este usuario?
- **OBLIGATORIO** usar cookies `HttpOnly`, `Secure`, `SameSite=Strict` para sesiones con `@supabase/ssr`.
- **OBLIGATORIO** validar uploads por tipo MIME real (magic bytes), tamaño máximo, lista blanca y sanitizar nombres de archivo y SVGs.
- **OBLIGATORIO** sanitizar contenido antes de renderizar para prevenir XSS almacenado.

---

## 10. Manejo de Errores: Amigable, Descriptivo y Accionable
- **PROHIBIDO** exponer mensajes técnicos internos en la interfaz (`error.message`, stack traces, errores SQL).
- **PROHIBIDO** el antipatrón mudo (*Swallowing Errors*): Dejar bloques `catch` vacíos.
- **OBLIGATORIO** capturar excepciones y presentar mensajes amigables, descriptivos y accionables.
- **OBLIGATORIO** páginas de error personalizadas: `404.astro`, `403.astro`, `500.astro`.
- **OBLIGATORIO** formato de respuesta API estandarizado: `{ success: true, data: T }` o `{ success: false, error: { code: string, message: string } }`.

---

## 11. Testing y Verificación
- **PROHIBIDO** introducir nuevos validadores, servicios, helpers o guards sin cobertura de pruebas.
- **OBLIGATORIO** unit tests con Vitest en `__tests__/unit/` para Zod schemas, guards de rol y ownership, servicios y helpers.
- **OBLIGATORIO** verificar builds: `astro check` y `astro build`.

---

## 12. Gestión de Modales y Diálogos
- **PROHIBIDO** superponer o apilar múltiples diálogos modales simultáneamente.
- **PROHIBIDO** cerrar un modal y abrir otro inmediatamente (parpadeo visual). Usar máquina de estados interna.
- **OBLIGATORIO** estructura tripartita: Cabecera fija, cuerpo scrolleable y pie fijo con botones de acción.
- **OBLIGATORIO** alineación de botones: Descarte a la izquierda, Acción afirmativa a la derecha.

---

## 13. Rendimiento Web y Pipeline de Rendering
- **PROHIBIDO** enviar JavaScript innecesario al cliente. Usar `.astro` para contenido estático.
- **PROHIBIDO** cargar imágenes de golpe. Lazy loading obligatorio.
- **PROHIBIDO** bloquear el desplazamiento de pantalla completa con `overflow: hidden` e intercepciones de gestos táctiles rígidos que impidan la retroalimentación táctil inmediata.
- **OBLIGATORIO** animaciones CSS con `transform` y `opacity` (aceleradas por GPU).
- **OBLIGATORIO** transiciones entre secciones de pantalla completa usando desplazamiento nativo del compositor y `scroll-snap-type: y mandatory`, garantizando respuesta táctil instantánea con física inercial sin bloquear el hilo principal.
- **OBLIGATORIO** islas React con `client:visible` o `client:idle`.
- **OBLIGATORIO** imágenes en WebP/AVIF con `srcset` responsive y `loading="lazy"`.

---

## 14. Modularidad de Archivos
- **PROHIBIDO** crear o mantener archivos que superen **300–400 líneas de código**.
- **OBLIGATORIO** descomponer módulos especializados ante crecimiento de líneas, manteniendo una única responsabilidad (SRP).

---

## 15. Organización de Paquetes
- **PROHIBIDO** carpetas sobre-anidadas de un único elemento.
- **PROHIBIDO** enterrar tipos compartidos dentro de servicios. Todo tipo compartido reside en `src/lib/types/`.

---

## 16. Endpoints de API Estandarizados
- **OBLIGATORIO** estructura: 1) Auth & Role check -> 2) Payload limit check -> 3) Zod validation -> 4) Ownership check -> 5) Servicio -> 6) Respuesta estandarizada.
- **PROHIBIDO** retornar HTTP 200 con body de error. Usar códigos HTTP semánticos (400, 401, 403, 404, 413, 422, 429, 500).
- **OBLIGATORIO** separar endpoints por contexto: `/api/auth/*`, `/api/admin/*`, `/api/dashboard/*`, `/api/public/*`.

---

## 17. Modelado de Estados de UI
- **PROHIBIDO** gestionar estados con múltiples booleanos dispersos.
- **OBLIGATORIO** modelar con unión discriminada: `type UiState<T> = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'empty' } | { status: 'error'; message: string }`.

---

## 18. Estrategia de Cache y Rendering
- **OBLIGATORIO** configurar `Cache-Control` por zona:
  - Portfolios públicos (`/[slug]`): `public, s-maxage=3600, stale-while-revalidate=86400`.
  - Paneles (`/admin/*`, `/dashboard/*`, `/api/*`): `private, no-cache, no-store, must-revalidate`.

---

## 19. Manejo de Environment Variables
- **PROHIBIDO** commitear `.env` al repositorio.
- **OBLIGATORIO** mantener `.env.example` actualizado con nombres de variables requeridas.
- **OBLIGATORIO** service role key configurada como **encrypted** en Cloudflare Pages.

---

## 20. Idempotencia y Bloqueo de Doble Clic
- **PROHIBIDO** permitir clicks concurrentes en acciones asíncronas.
- **OBLIGATORIO** usar `LoadingButton` que congele interactividad al primer click y dé retroalimentación visual (spinner / confirmación).

---

## 21. Control de Versiones en Español
- **OBLIGATORIO** escribir todos los mensajes de commit en **español** usando Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `perf:`, `security:`).

---

## 22. Accesibilidad (WCAG 2.2 AA)
- **OBLIGATORIO** HTML semántico, navegación por teclado visible, contraste 4.5:1 (texto normal), texto `alt` en imágenes y `aria-label` en controles iconográficos.

---

## 23. SEO y Metadatos
- **OBLIGATORIO** componente `SEOHead.astro` con Open Graph, Twitter Cards y JSON-LD.
- **OBLIGATORIO** `robots.txt` excluyendo `/admin/`, `/dashboard/` y `/api/`.

---

## 24. Presupuestos de Rendimiento
- **OBLIGATORIO** Lighthouse > 90 en Performance, SEO y Accesibilidad. JS bundle de página pública < 50 KB gzipped.

---

## 25. Linting y Formato
- **OBLIGATORIO** ESLint estricto con TypeScript, Prettier y `astro check` sin advertencias.

---

## 26. Git Branching y CI/CD
- **OBLIGATORIO** trunk-based development (`main` produccion, `dev` integración, ramas `feat/*`). CI obligatorio con validación de tipos, lint y pruebas.

---

## 27. Sanitización de Contenido
- **PROHIBIDO** usar `set:html` o `dangerouslySetInnerHTML` con datos de usuario sin sanitizar.
- **OBLIGATORIO** sanitizar nombres de archivo y verificar protocolos `https://` en URLs.

---

## 28. Monitoreo y Observabilidad
- **OBLIGATORIO** logs estructurados en JSON, endpoint `/api/health` y cron job de ping a Supabase para evitar pausa de 7 días.

---

## 29. Respaldo y Recuperación
- **OBLIGATORIO** función de exportación JSON en dashboard y procedimientos de backup manual documentados.

---

## 30. Privacidad y Cumplimiento
- **OBLIGATORIO** avisos de privacidad claros en formularios de contacto y gestión de consentimiento de analítica opcional.

---

## 31. Iconografía y Elementos Visuales: Cero Emojis y Diseños SVG Reutilizables
- **PROHIBIDO el uso de emojis** en toda la interfaz de usuario, paneles administrativos, dashboards, páginas públicas, badges, botones, formularios y textos del sistema.
- **OBLIGATORIO** utilizar exclusivamente iconos y elementos gráficos vectoriales en formato **SVG**, optimizados, accesibles (`aria-hidden="true"` en iconos decorativos o con etiquetas accesibles en controles interactivos) y estilizables con `currentColor` y clases del tema.
- **OBLIGATORIO** declarar y centralizar todos los diseños SVG reutilizables en `src/components/icons/` (`Icon.astro` para componentes Astro e `Icons.tsx` para componentes React), prohibiendo duplicación de vectores inline y garantizando coherencia visual en toda la plataforma.

---

## 32. Responsividad Universal y Entornos Multi-Dispositivo (Orientación y Altura Adaptable)
- **PROHIBIDO** diseñar asumiendo únicamente móviles en orientación vertical (portrait) o pantallas de escritorio estándar. Toda interfaz debe adaptarse con calidad profesional a:
  1. Móviles en orientación vertical (portrait).
  2. Móviles en orientación horizontal (landscape / pantallas con altura reducida `height < 540px` o `@media (max-height: 540px)`).
  3. Tablets y dispositivos plegables (foldables).
  4. Laptops y monitores ultrawide.
- **OBLIGATORIO** en entornos de altura reducida (landscape móvil):
  - Limitar la altura de elementos tipográficos y gráficos heroicos (`max-h-[...dvh]`) para evitar colisiones con cabeceras y controles de acción.
  - Ajustar dinámicamente el espaciado y anclaje de botones para que nunca se superpongan con el contenido central ni queden cortados por barras de navegación.
  - Reducir paddings de cabeceras fijas (`py-2` en landscape) y asegurar targets táctiles accesibles.
  - Habilitar scroll controlado (`overflow-y-auto`) en vistas modales o compuestas cuando el contenido supere la altura visible.

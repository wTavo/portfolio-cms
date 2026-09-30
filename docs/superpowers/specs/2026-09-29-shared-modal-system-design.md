# Sistema compartido de diálogos accesibles

## Objetivo

Unificar el comportamiento estructural de los tres diálogos existentes —inicio de sesión, contacto y vista previa del directorio— para que compartan una implementación accesible, predecible y fácil de mantener, sin alterar innecesariamente su contenido ni el manejo móvil del teclado que ya tiene `AdaptiveModal`.

## Estado actual

- `AdaptiveModal` implementa un diálogo personalizado con portal, backdrop, cierre por Escape, bloqueo del scroll y lógica de `VisualViewport`/teclado.
- `LoginModal` y `ContactModal` consumen `AdaptiveModal`.
- `DirectoryExplorer` contiene una segunda implementación independiente, sin bloqueo común del fondo ni política de foco compartida.
- Login y contacto difieren en formularios y estado, pero ambos limpian estado con temporizadores no cancelables al cerrar.
- `useKeyboardOffset.ts` mezcla el bloqueo de scroll usado actualmente con utilidades/hooks de teclado antiguos y aliases sin comportamiento.

## Diseño elegido

### 1. Primitiva modal compartida basada en `<dialog>`

Crear una primitiva controlada y reusable que abra el elemento mediante `HTMLDialogElement.showModal()` y lo cierre al recibir `isOpen=false`. Su responsabilidad será el ciclo de vida nativo, el backdrop, las solicitudes de cierre, el foco inicial/restaurado y la coordinación del bloqueo del scroll. No contendrá lógica de formularios ni reglas de presentación específicas.

La primitiva debe:

- usar `showModal()` para obtener el comportamiento modal del navegador y su top layer;
- manejar el evento `cancel` de forma controlada para mantener sincronizados DOM y estado React;
- cerrar mediante botón explícito y permitir cierre por backdrop solo cuando el puntero inicia/termina en el propio backdrop (no al seleccionar contenido);
- etiquetar el diálogo con `aria-labelledby` y, cuando exista, `aria-describedby`;
- evitar que la apertura enfoque automáticamente un campo de texto en móviles; el control inicial será no editable (normalmente el botón de cerrar), salvo una opción explícita del consumidor;
- restaurar el foco al elemento que lo tenía antes de abrir, si sigue conectado y enfocable;
- mantener el bloqueo de scroll del documento mientras haya un diálogo abierto y restaurarlo sin sobrescribir estilos previos;
- respetar `prefers-reduced-motion` y permitir animar entrada/salida sin desincronizar `dialog.open` y React.

Se evitará implementar manualmente focus trap, `aria-hidden` del fondo o `z-index` global si la plataforma ya aporta esas garantías con `showModal()`.

### 2. Composición de los tres diálogos

- `AdaptiveModal` seguirá siendo el shell visual adaptable para login y contacto, pero compondrá la primitiva compartida en lugar de crear su propio `role="dialog"`/portal/backdrop.
- La vista previa del directorio migrará a la misma primitiva; su cuerpo seguirá siendo la región desplazable de contenido y mantendrá cabecera/pie.
- Login y contacto mantendrán sus campos, validaciones y copy. La vista previa mantendrá sus datos y navegación.
- La lógica de `VisualViewport`, altura disponible y scroll interno seguirá aislada en la capa adaptable. No se cambiará por una nueva política de teclado como parte de la unificación.

### 3. Ciclo de vida de formularios

Reemplazar los `setTimeout` de limpieza que sobreviven a una reapertura por una estrategia cancelable y consistente. Un cierre seguido de reapertura antes de la duración de salida no deberá limpiar el estado del diálogo reabierto. Al completar el cierre, el estado de formulario debe resetearse como hoy.

No se cambiará el destino ni el contrato del envío de contacto: el flujo actual simula éxito y no hay endpoint de contacto identificado en esta auditoría. La implementación de envío real queda fuera de alcance.

### 4. Higiene de utilidades de teclado

Antes de borrar exports heredados, comprobar referencias internas y documentar que no son API pública externa. Retirar únicamente cálculos/hooks/aliases sin consumidor, conservando el bloqueo de scroll que usa el shell adaptable. La detección de teclado y las métricas de viewport no se duplicarán en otro hook durante esta tarea.

## Compatibilidad y requisitos móviles

`<dialog>.showModal()` es ampliamente compatible en navegadores actuales. Aun así, el sistema debe verificarse como mínimo en Chrome Android del emulador y Samsung A52; cuando sea posible, validar además Firefox Android. El uso de `<dialog>` no se considerará una solución automática al redimensionamiento del viewport visual por el teclado.

La apertura desde móvil no debe enfocar un input ni abrir el teclado por sí sola. Con teclado abierto, el modal debe permanecer contenido en el viewport visible; si el contenido excede el espacio, el desplazamiento debe ocurrir dentro del área de contenido/modal y no mover la página completa. Al cerrar, deben restaurarse scroll y foco sin saltos.

## Pruebas y criterios de aceptación

1. Pruebas de ciclo de vida del diálogo: apertura/cierre controlados, Escape, botón de cierre, backdrop, foco inicial no editable y restauración del foco.
2. Pruebas de scroll-lock: el fondo queda bloqueado con diálogo abierto y se restauran exactamente estilos/posición al cerrar; no se desbloquea mientras quede otro diálogo abierto.
3. Pruebas de formularios: cerrar y reabrir antes del tiempo de salida conserva el estado del nuevo período abierto; tras un cierre completo el formulario se reinicia.
4. Pruebas de regresión de `AdaptiveModal`: viewport reducido, contenido que cabe/no cabe, scroll interno y cambios rápidos de foco no introducen recentrado/rebote nuevo.
5. La vista previa conserva cierre con Escape/botón, scroll de su contenido y enlaces funcionales.
6. `npm test`, `astro check` y `astro build` deben completarse; advertencias preexistentes no relacionadas se reportarán por separado.
7. Revisión manual en dispositivos objetivo: abrir/cerrar cada modal, usar Tab/Shift+Tab, teclado del sistema, cerrar teclado y volver a enfocar campos, y comprobar que el fondo no se desplaza.

## Fuera de alcance

- Rehacer el diseño visual de los modals.
- Cambiar endpoint o semántica del envío del formulario de contacto.
- Cambiar la detección de teclado, `interactive-widget`, unidades `dvh` globales o estilos generales de la portada sin evidencia y prueba específica.
- Añadir una dependencia de terceros para diálogos.

## Riesgos y mitigaciones

- **Diferencias entre navegador y teclado virtual:** mantener el adaptador `VisualViewport` separado y probar en navegador/dispositivo real; no inferir estabilidad del teclado solo por el soporte nativo de `<dialog>`.
- **Cierre React vs. estado nativo:** tratar `cancel` de forma controlada y probar transición de salida para evitar que el navegador cierre mientras React aún declara `isOpen=true`.
- **Bloqueos de scroll anidados o solapados:** centralizar/referenciar el bloqueo para que el cierre de un diálogo no restaure el documento si queda otro activo.
- **Efecto colateral de foco inicial:** priorizar un control no editable al abrir y verificar que el teclado móvil no aparezca espontáneamente.
- **Animación en top layer:** definir un único mecanismo de entrada/salida y cubrir `prefers-reduced-motion`, en vez de combinar animaciones independientes de backdrop, contenedor y estado nativo.

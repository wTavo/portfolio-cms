# Diseño: posicionamiento transaccional del modal con teclado virtual

## Objetivo

Mantener la tarjeta estable al alternar entre inputs con el teclado abierto, centrarla en el espacio visible al abrir el teclado con un solo movimiento fluido y conservar el scroll interno cuando el contenido no quepa. La solución no debe añadir ciclos redundantes de medición ni hacer que la tarjeta persiga cada ajuste nativo del navegador.

## Evidencia y causa

En la implementación actual, `observeViewportBounds` escucha `visualViewport.resize`, `visualViewport.scroll`, `window.resize` y `window.scroll`, y sincroniza directamente `top`, `left`, `width` y `height` del contenedor modal con cada rectángulo leído. La tarjeta usa `safe center` dentro de ese contenedor. Por tanto, un cambio de `VisualViewport.offsetTop` desplaza el contenedor y vuelve a centrar la tarjeta, aunque el teclado continúe abierto y solo haya cambiado el input enfocado.

El navegador puede emitir actualizaciones de geometría en frames separados durante la apertura del teclado. Coalescer eventos en un único `requestAnimationFrame` solo agrupa eventos del mismo frame; no transforma una secuencia de varios frames en una transición única. La aplicación sigue cada geometría intermedia y hace visible cada reposicionamiento.

La pasada más reciente también quitó `animateVerticalPosition` y su wrapper. La tarjeta conserva animación de opacidad/escala al entrar, pero perdió la transición de reposicionamiento que daba fluidez. Esto explica la regresión visual reportada y debe corregirse.

## Diseño elegido

### 1. Estado explícito del ciclo del teclado

Modelar los estados necesarios para posicionamiento: teclado cerrado, apertura/cambio de geometría inicial, teclado abierto estable y cierre. El estado se deriva de una línea base estable y de eventos observados del viewport, no de cambios de foco por sí solos. Para clasificar una reducción de altura como apertura del teclado debe existir además un input o textarea editable enfocado; el foco nunca reposiciona por sí mismo. Esto evita confundir con el teclado un redimensionamiento vertical normal en escritorio. Alternar correo/contraseña con el teclado abierto no debe reiniciar una apertura ni disparar el centrado de la tarjeta.

El controlador de viewport debe conservar el origen de cada actualización (`visualviewport-resize`, `visualviewport-scroll`, `window-resize`, `window-scroll`) para que pruebas y diagnóstico puedan distinguir el desencadenante. No añadir temporizadores de duración fija como criterio primario para declarar estable el teclado.

### 2. Apertura: aceptar geometría, publicar una posición final

Durante la apertura, seguir leyendo la geometría visible para no calcular con una altura obsoleta, pero no exponer cada estado intermedio como un nuevo destino visible de la tarjeta. Mientras el navegador desplaza el `VisualViewport`, actualizar solo el `top` del marco fijo para compensar `offsetTop`, manteniendo congelados su tamaño y el destino de la tarjeta. Agrupar la transición con estabilidad observable; al confirmarse la geometría final, actualizar el rectángulo completo de interacción/scroll y producir un único destino centrado.

Animar la tarjeta desde su posición visual actual hasta ese destino final usando la abstracción existente de movimiento del proyecto o una alternativa pequeña y comprobable. La animación debe cancelarse/reemplazarse limpiamente si comienza un cierre, una nueva apertura, una rotación o una geometría incompatible. Debe respetar `prefers-reduced-motion` y no competir con la animación de entrada/salida del diálogo.

La estabilidad no debe depender exclusivamente de `VisualViewport.scrollend`, porque no es uniforme entre navegadores. La implementación debe definir y probar un fallback por frames consecutivos sin cambios geométricos relevantes, con un límite máximo razonable para no dejar el modal esperando indefinidamente. Los umbrales y la duración se centralizarán y se documentarán; no se distribuirán como números mágicos entre handlers.

### 3. Mientras el teclado está abierto: no reposicionar al cambiar de input

Después de la apertura, un cambio de foco o un desplazamiento de `VisualViewport` que solo acompaña al foco no reposicionará la tarjeta completa en coordenadas visibles. El marco seguirá `offsetTop` para compensar el auto-pan nativo, sin cambiar altura ni volver a centrar. El input enfocado podrá desplazarse dentro del scroll propio del modal si hace falta, sin desplazar la tarjeta entera ni el documento de fondo.

Los cambios genuinos de geometría que no sean un cambio de foco —por ejemplo, orientación, redimensionamiento de ventana o zoom— deben invalidar el estado estable y recalcular el área utilizable de manera controlada. La detección debe apoyarse en señales y dimensiones observables; no se debe clasificar todo `visualViewport.scroll` como apertura/cierre ni ignorar para siempre cambios del viewport.

### 4. Cierre del teclado

Al cerrarse el teclado, actualizar la geometría del contenedor y devolver el modal a su posición centrada en el viewport disponible con una sola transición fluida, sin restaurar una posición intermedia capturada durante la apertura. Preservar la intención de scroll interno del usuario según el contrato que ya tiene el modal.

### 5. Compatibilidad, movimiento y reducción de movimiento

Usar `VisualViewport` cuando exista y fallback al viewport de layout cuando no. No activar `navigator.virtualKeyboard.overlaysContent`, no cambiar configuración global de viewport y no añadir dependencias. Mantener la animación de apertura/cierre existente y restaurar una animación separada de reposicionamiento, de modo que cada una tenga una sola responsabilidad. Con `prefers-reduced-motion`, el reposicionamiento debe ocurrir sin interpolación.

## Alternativas consideradas

1. **Seguir cada rectángulo recibido:** implementa el flujo actual y reproduce los saltos cuando el navegador informa varios rectángulos o cambia el offset al enfocar otro input. No satisface el objetivo.
2. **Congelar permanentemente la altura/posición modal:** puede ocultar el síntoma, pero falla ante rotación, cambios reales de viewport o contenido que deje de caber. No se recomienda como solución general.
3. **Transacción de geometría + destino final animado, con estabilidad mientras el teclado permanece abierto:** separa las fases nativas de la presentación del modal; mantiene el centrado al abrir/cerrar y evita que el foco cambie el marco entero. Es la recomendación y el diseño aprobado conversacionalmente.

## Pruebas de aceptación

1. Una secuencia de varios `resize`/`scroll` de `VisualViewport` durante la apertura mantiene estable la posición visible de la tarjeta mientras el marco compensa `offsetTop`, y termina en un único destino de reposicionamiento.
2. Con teclado estable, enfocar alternativamente dos inputs puede cambiar únicamente el anclaje del marco; la tarjeta permanece estable en pantalla y no inicia una animación de reposicionamiento.
3. Cerrar y volver a abrir el teclado realiza una transición por ciclo, sin rebotes por valores de offset transitorios.
4. Un cambio real de ancho/orientación durante el teclado abierto invalida y recalcula la geometría una sola vez.
5. El contenido alto mantiene scroll dentro del modal; el documento de fondo sigue bloqueado.
6. Sin `VisualViewport`, el fallback mantiene apertura, cierre y centrado funcionales.
7. `prefers-reduced-motion` evita la transición de reposicionamiento; el modo normal mantiene la animación fluida.
8. Los listeners, RAF, callbacks de estabilidad y animaciones se limpian al cerrar/desmontar; no quedan escrituras tardías.
9. Pruebas automatizadas cubren las secuencias anteriores. La validación física se reporta por separado para Chrome Android, Samsung Internet, Firefox Android y el emulador disponible; no se afirmará compatibilidad manual no probada.

## Archivos y límites

- `src/components/ui/AdaptiveModal.tsx`: integrar el ciclo de posicionamiento y preservar el contrato accesible y de scroll.
- `src/lib/visualViewportMetrics.ts`: exponer mediciones con fuente y proveer el mecanismo de estabilidad sin ocultar cambios reales.
- `src/lib/modalPositionAnimation.ts` (o abstracción equivalente): restaurar y probar una transición de posición con cancelación y soporte de movimiento reducido.
- Pruebas unitarias de estos controladores y del componente: comprobar secuencias de eventos, no solo valores aislados.

No se rediseñan `ModalDialog`, los formularios ni los estilos globales salvo dependencia demostrada por una prueba. Se conservan todos los cambios locales fuera del alcance de estos archivos.

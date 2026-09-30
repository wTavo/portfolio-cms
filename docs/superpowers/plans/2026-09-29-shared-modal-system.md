# Sistema compartido de modals — Plan de implementación

> **Para agentes de implementación:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para ejecutar cada tarea por separado. Cada tarea debe seguir TDD y cerrar con verificación propia.

**Goal:** Unificar login, contacto y vista previa bajo un ciclo modal accesible basado en `<dialog>`, corregir la limpieza insegura al reabrir y retirar la lógica de teclado heredada sin cambiar el comportamiento de viewport sin evidencia.

**Architecture:** Una primitiva controlada `ModalDialog` usará `showModal()` y gestionará la vida nativa, el cierre, el backdrop y el bloqueo compartido del documento. `AdaptiveModal` compondrá esa primitiva y mantendrá separado su adaptador `VisualViewport`; la vista previa del directorio migrará a la misma primitiva. Cada modal conservará su contenido y estado específico.

**Tech Stack:** React 19, TypeScript 6, Astro 7, Motion, Vitest 5, jsdom y `@testing-library/react` para pruebas DOM (sin biblioteca de diálogos).

**Spec:** `docs/superpowers/specs/2026-09-29-shared-modal-system-design.md`

## Global Constraints

- `<dialog>.showModal()` es ampliamente compatible en navegadores actuales; verificar en Chrome Android del emulador y Samsung A52, y cuando sea posible Firefox Android.
- La apertura móvil no debe enfocar un input ni abrir el teclado por sí sola.
- Mantener el adaptador `VisualViewport` separado; `<dialog>` no se considera solución automática al redimensionamiento del viewport por el teclado.
- No cambiar el contrato/envío de contacto, detección de teclado, `interactive-widget`, `dvh` global ni estilos generales de portada.
- No añadir dependencia de terceros para diálogos.

## Review Focus

1. **Apertura en móvil con inputs:** ningún input recibe foco inicial; el teclado permanece cerrado hasta una acción explícita. Validar en el test del shell y en QA Android.
2. **Cierre y reapertura antes de la salida:** el temporizador de cierre previo no debe limpiar el formulario que acaba de reabrirse. Testear en login y contacto.
3. **Dos modals solapados/transición de desmontaje:** al cerrar uno, el documento no se desbloquea mientras otro siga abierto. Testear contador/ref-count del bloqueo.
4. **Escape y click fuera del contenido:** `cancel` sincroniza el estado React; un click dentro no cierra; el backdrop solo cierra cuando el gesto ocurre íntegramente sobre él. Testear la primitiva y revisar manualmente el cierre nativo.
5. **Contenido con teclado visible que excede el viewport:** el scroll se queda dentro del modal y el diseño del modal que sí cabe no recentra ni rebota por mover la base a `<dialog>`. Probar helper geométrico y manualmente en dispositivos.

---

### Task 1: Preparar pruebas DOM para el ciclo controlado de `<dialog>`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `__tests__/setup/dialog-test-utils.ts`
- Create: `__tests__/unit/modal-dialog.test.tsx`

**Interfaces:**
- La suite usa Vitest y jsdom para montar componentes React con `createRoot`/`act`.
- Las pruebas DOM usan `// @vitest-environment jsdom` y `render`, `screen`, `fireEvent`, `cleanup`/`renderHook` de Testing Library.
- Stubs de `showModal()`/`close()` permiten probar sincronización; no simulan top layer, inertness ni focus trap del navegador.

- [ ] **Step 1: Añadir el entorno de DOM de pruebas**

Añadir entorno DOM y utilidades de interacción React, no una biblioteca de diálogos:

```powershell
npm install --save-dev jsdom @testing-library/react
```

- [ ] **Step 2: Escribir una prueba inicial del ciclo controlado**

Crear `modal-dialog.test.tsx` con directiva `// @vitest-environment jsdom`, imports de Testing Library y stubs de `dialog-test-utils.ts`. Importar `ModalDialog` y probar `showModal`, `cancel` y cierre controlado. La prueba base debe fallar inicialmente porque el componente no existe.

`dialog-test-utils.ts` exporta `installDialogStubs()`, que define `HTMLDialogElement.prototype.showModal/close` si jsdom no los expone y simula su contrato mínimo actualizando el atributo `open`; cada test DOM llama esa función en `beforeEach` y hace `cleanup()` en `afterEach`.

```tsx
it('abre el diálogo nativo y comunica Escape al propietario sin desincronizar el DOM', async () => {
  const onClose = vi.fn();
  const view = render(<ModalDialog isOpen onClose={onClose} labelledBy="title">
    <h2 id="title">Acceso</h2><button type="button">Cerrar</button>
  </ModalDialog>);
  const dialog = screen.getByRole('dialog');
  expect(dialog.showModal).toHaveBeenCalledOnce();
  fireEvent(dialog, new Event('cancel', { cancelable: true }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(dialog.open).toBe(true);
  view.rerender(<ModalDialog isOpen={false} onClose={onClose} labelledBy="title">
    <h2 id="title">Acceso</h2><button type="button">Cerrar</button>
  </ModalDialog>);
  await waitFor(() => expect(dialog.close).toHaveBeenCalledOnce());
});
```

Importar `waitFor` de `@testing-library/react`; la espera cubre la salida Motion de 150 ms.

- [ ] **Step 3: Ejecutar la prueba y confirmar fallo esperado**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/modal-dialog.test.tsx`

Expected: FAIL por el módulo `ModalDialog` inexistente, no por un error de sintaxis/configuración.

- [ ] **Step 4: Verificar el harness DOM**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/modal-dialog.test.tsx`

Tras crear los stubs DOM mínimos, el fallo restante debe ser únicamente la ausencia del componente. No añadir lógica de producción en esta tarea.

---

### Task 2: Crear bloqueo de scroll de documento compartido y con contador

**Files:**
- Create: `src/lib/hooks/useDocumentScrollLock.ts`
- Create: `__tests__/unit/document-scroll-lock.test.tsx`
- Modify: `__tests__/setup/dialog-test-utils.ts`

**Interfaces:**
- Exportar `useDocumentScrollLock(isLocked: boolean): void`.
- Guardar valores originales de estilos y `scrollY` al pasar de cero a un lock; restaurarlos solo al volver el contador a cero.
- Pruebas: `document-scroll-lock.test.tsx` monta dos consumidores React y fija `window.scrollTo` para evitar comportamiento no implementado de jsdom.

- [ ] **Step 1: Escribir pruebas para adquisición y restauración exacta**

Probar un consumidor: guarda `overflow`, `position`, `top`, `left`, `right`, `width`, `scrollBehavior` y scroll inicial; al desmontarlo restaura cada valor y llama `scrollTo(0, scrollY)`.

```tsx
expect(document.body.style.position).toBe('fixed');
root.unmount();
expect(document.body.style.position).toBe('');
expect(window.scrollTo).toHaveBeenCalledWith(0, 120);
```

- [ ] **Step 2: Verificar RED**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/document-scroll-lock.test.tsx`

Expected: FAIL porque no existe `useDocumentScrollLock`.

- [ ] **Step 3: Implementar el contador compartido**

Al primer lock, capturar estilos/scroll y aplicar el bloqueo; cada hook activo aumenta el contador una sola vez. Al limpiar un hook, reducirlo; solo el último cleanup restaura estado. Mantener SSR seguro: no acceder a `document` durante render.

- [ ] **Step 4: Escribir y verificar la prueba de solapamiento**

Montar dos consumidores activos y apagar/desmontar el primero; comprobar que el fondo sigue fijo. Desmontar el segundo y comprobar restauración exacta.

```tsx
first.rerender(false);
expect(document.body.style.position).toBe('fixed');
second.unmount();
expect(document.body.style.position).toBe(originalPosition);
```

- [ ] **Step 5: Ejecutar pruebas de la unidad**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/document-scroll-lock.test.tsx`

Expected: todas las pruebas pasan, incluyendo remounts de Strict Mode si el harness los usa.

---

### Task 3: Implementar `ModalDialog` accesible sobre `<dialog>`

**Files:**
- Create: `src/components/ui/ModalDialog.tsx`
- Modify: `__tests__/unit/modal-dialog.test.tsx`
- Modify: `__tests__/setup/dialog-test-utils.ts`

**Interfaces:**
- `ModalDialogProps = { isOpen: boolean; onClose: () => void; labelledBy: string; describedBy?: string; children: React.ReactNode; className?: string; closeOnBackdrop?: boolean }`.
- Renderiza un subcomponente bajo `AnimatePresence`; ese subcomponente usa `useDocumentScrollLock(true)` durante apertura y salida, crea portal a `document.body`, llama `showModal()` al montar y `close()` al desmontar tras la salida.
- `cancel` se previene y llama `onClose`; backdrop cierra solo si pointer-down y pointer-up ocurrieron en el elemento de diálogo mismo.
- `aria-labelledby` obligatorio; `aria-describedby` opcional. No agregar `aria-modal` manual: `showModal()` provee el estado modal nativo.

- [ ] **Step 1: Añadir pruebas de label, descripción y petición de cierre**

Probar que la primitiva renderiza `<dialog>`, asigna los IDs accesibles, llama `showModal()` al abrir, atiende `cancel` como cierre controlado y llama `close()` al pasar a cerrado.

```tsx
expect(dialog.getAttribute('aria-labelledby')).toBe('sample-title');
expect(dialog.getAttribute('aria-describedby')).toBe('sample-description');
expect(dialog.showModal).toHaveBeenCalledOnce();
```

- [ ] **Step 2: Confirmar RED para las pruebas nuevas**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/modal-dialog.test.tsx`

Expected: fallan las aserciones de atributos/eventos todavía no implementados.

- [ ] **Step 3: Implementar el ciclo de vida controlado y el portal**

Renderizar con `createPortal`; conectar efectos para `showModal()`/`close()` de modo que `isOpen` sea fuente única de verdad; proteger la llamada si `dialog.open` ya coincide. El subcomponente permanece durante salida Motion; su cleanup cierra el nodo y libera el bloqueo después de la animación, no antes.

- [ ] **Step 4: Añadir pruebas de backdrop y puntero**

Probar que click/pointer completo sobre backdrop pide cierre; pointer-down en backdrop con pointer-up en contenido no cierra; clicks dentro del contenido no cierran.

```tsx
fireEvent.pointerDown(dialog, { pointerId: 1 });
fireEvent.pointerUp(content, { pointerId: 1 });
expect(onClose).not.toHaveBeenCalled();
```

- [ ] **Step 5: Implementar backdrop, reduced motion y estructura visual base**

Preservar tokens visuales existentes; mover backdrop y animación a un solo punto de control. `prefers-reduced-motion` elimina/neutraliza duración, sin impedir cleanup del elemento nativo. Mantener el nodo en top layer durante su salida Motion y cerrar el `<dialog>` en el cleanup final.

- [ ] **Step 6: Verificar componente y foco inicial seguro**

Comprobar en DOM que el primer control interactivo es el botón de cierre antes de inputs y que no se aplica autofocus a campos por la primitiva. Añadir prueba de restauración de foco solo para fallback si el navegador no lo realiza; confirmar manualmente el comportamiento nativo en Chromium real.

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/modal-dialog.test.tsx __tests__/unit/document-scroll-lock.test.tsx`

---

### Task 4: Migrar `AdaptiveModal` conservando geometría y scroll de viewport

**Files:**
- Modify: `src/components/ui/AdaptiveModal.tsx`
- Modify: `src/lib/modalFrameLayout.ts` solo si la integración lo requiere
- Modify: `__tests__/unit/modal-frame-layout.test.ts`
- Modify: `__tests__/unit/visual-viewport-metrics.test.ts`
- Create: `__tests__/unit/adaptive-modal.test.tsx`

**Interfaces:**
- `AdaptiveModal` conserva su API actual para `LoginModal` y `ContactModal`.
- La primitiva recibirá el label/subtitle IDs y el adaptador conservará las mismas métricas, fit-check, anclaje y área scrollable.

- [ ] **Step 1: Añadir prueba de regresión para el shell**

Montar un `AdaptiveModal` abierto con contenido y comprobar rol nativo, ID de título y scroll container identificado mediante consultas accesibles de Testing Library. Probar cálculo fit/no-fit sin alterar teclado ni la lógica de recentrado.

```tsx
expect(container.querySelector('dialog')?.getAttribute('aria-labelledby')).toBe('test-title');
expect(container.querySelector('[data-modal-scroll-container]')).not.toBeNull();
```

- [ ] **Step 2: Confirmar fallo RED**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/adaptive-modal.test.tsx`

Expected: falla porque el modal actual no compone `ModalDialog` ni expone la estructura acordada.

- [ ] **Step 3: Componer `ModalDialog` sin cambiar métricas**

Retirar el `role="dialog"` custom/portal/backdrop/AnimatePresence duplicados de `AdaptiveModal`; componer `ModalDialog` alrededor de la superficie y conectar el contenedor de viewport desplazable. Seguir aplicando `syncVisualViewportBounds` al área correcta y dejar `getModalFrameLayout`/fit-check sin cambios salvo incompatibilidad probada.

- [ ] **Step 4: Verificar eventos al cambiar foco/teclado**

Mantener pruebas actuales de `getNextViewportMetrics`, `syncVisualViewportBounds`, fit y anclaje. Añadir caso de transición de altura al cambiar input: el offset se actualiza pero la altura estabilizada respeta el contrato actual.

- [ ] **Step 5: Ejecutar pruebas modales**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/modal-dialog.test.tsx __tests__/unit/adaptive-modal.test.tsx __tests__/unit/modal-frame-layout.test.ts __tests__/unit/visual-viewport-metrics.test.ts`

Expected: todas pasan; no se cambia la fuente de geometría del modal.

---

### Task 5: Migrar la vista previa del directorio a la primitiva común

**Files:**
- Create: `src/components/directory/DirectoryPreviewModal.tsx`
- Modify: `src/components/directory/DirectoryExplorer.tsx`
- Create: `__tests__/unit/directory-preview-modal.test.tsx`

**Interfaces:**
- `DirectoryPreviewModalProps = { profile: DirectoryProfileItem | null; onClose: () => void }`.
- `DirectoryExplorer` mantiene `previewProfile` y renderiza el nuevo componente; la vista previa usa `ModalDialog`, mantiene encabezado/pie, y solo su cuerpo tiene `overflow-y-auto`.

- [ ] **Step 1: Probar modal abierto/cerrado y acciones existentes**

Montar con un perfil mínimo mediante `render`; comprobar título etiquetado, botón de cerrar invoca callback, vínculo a `/${profile.slug}` mantiene `target="_blank"`, y el cuerpo es la zona scrolleable. Usar `getByRole`/`fireEvent` de Testing Library.

```tsx
  expect(screen.getByRole('dialog', { name: /Vista rápida/ })).toBeTruthy();
expect(screen.getByRole('link', { name: /Ver portafolio completo/ }).getAttribute('href'))
  .toBe('/perfil-demo');
```

- [ ] **Step 2: Confirmar RED**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/directory-preview-modal.test.tsx`

Expected: falla porque `DirectoryPreviewModal` no existe.

- [ ] **Step 3: Extraer y migrar el markup**

Mover el contenido de vista previa a `DirectoryPreviewModal`; borrar el listener Escape de `DirectoryExplorer` para no duplicar cierre, y permitir que `ModalDialog` gobierne Escape/backdrop/fondo.

- [ ] **Step 4: Ejecutar prueba de vista previa**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/directory-preview-modal.test.tsx`

Expected: título, cierre, enlace y scroll del contenido pasan.

---

### Task 6: Hacer cancelable el reset de login/contacto

**Files:**
- Modify: `src/components/home/LoginModal.tsx`
- Modify: `src/components/home/ContactModal.tsx`
- Create: `__tests__/unit/form-modal-lifecycle.test.tsx`

**Interfaces:**
- No cambia la API pública de LoginModal ni ContactModal.
- El reset diferido se cancela en cleanup cuando `isOpen` cambia de nuevo a `true` o el componente se desmonta.

- [ ] **Step 1: Escribir prueba temporal de cierre/reapertura para Login**

Con fake timers: escribir en email, cerrar, reabrir antes de 250 ms, escribir nuevo valor, avanzar reloj; el valor nuevo debe seguir intacto.

```tsx
fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'nuevo@ejemplo.com' } });
rerender(<LoginModal isOpen={false} onClose={onClose} />);
rerender(<LoginModal isOpen onClose={onClose} />);
fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'nuevo@ejemplo.com' } });
act(() => vi.advanceTimersByTime(300));
expect((screen.getByLabelText(/correo electrónico/i) as HTMLInputElement).value)
  .toBe('nuevo@ejemplo.com');
```

- [ ] **Step 2: Confirmar RED**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/form-modal-lifecycle.test.tsx`

Expected: falla porque el timeout anterior limpia el estado después de reabrir.

- [ ] **Step 3: Implementar reset con timer cancelable en LoginModal**

El efecto que programa reset al cerrar debe retornar cleanup con `clearTimeout`; el siguiente ciclo (reapertura/desmontaje) cancela el reset anterior. Conservar el delay de salida actual salvo que el componente ya no requiera conservar contenido durante animación.

- [ ] **Step 4: Repetir RED-GREEN para ContactModal**

Aplicar la misma prueba temporal a nombre/email/mensaje. Separar el efecto de reset del efecto actual de foco de escritorio para que limpiar/cancelar timer no cambie el momento del autofocus.

- [ ] **Step 5: Probar cierre completo y reset real**

Con el modal cerrado más allá del delay actual, comprobar que el siguiente período abre con campos vacíos y estado `idle`; comprobar también desmontaje antes del vencimiento sin actualizaciones tardías.

- [ ] **Step 6: Ejecutar pruebas de ambos formularios**

Run: `.\node_modules\.bin\vitest.cmd run __tests__/unit/form-modal-lifecycle.test.tsx`

Expected: los casos de reentrada y cierre completo pasan.

---

### Task 7: Retirar utilidades de teclado sin consumidor

**Files:**
- Create: `src/lib/hooks/useIsMobile.ts`
- Delete: `src/lib/hooks/useKeyboardOffset.ts`
- Modify: `src/components/home/ContactModal.tsx`
- Delete: `__tests__/unit/keyboard.offset.test.ts`
- Create: `__tests__/unit/use-is-mobile.test.tsx`

**Interfaces:**
- `useIsMobile(): boolean` mantiene exactamente la regla existente: ancho menor a 768 px, alto menor a 540 px o `(pointer: coarse)`.
- La detección de viewport/teclado permanece dentro de `AdaptiveModal`; el scroll lock reside en `useDocumentScrollLock.ts`.

- [ ] **Step 1: Confirmar referencias de exports antiguos**

Run: `rg -n 'calculateKeyboardOffset|calculateSafeKeyboardOffset|useKeyboardHeight|useVisualViewportInfo|useMobileFormElevation|useKeyboardModalOffset|useKeyboardActive|useKeyboardOffset|useIsMobile' src __tests__`

Expected: `useIsMobile` solo lo necesita ContactModal; los demás exports solo tienen referencias dentro del propio archivo y sus tests heredados.

- [ ] **Step 2: Mover `useIsMobile` con prueba primero**

Crear prueba DOM con `renderHook` que controle `innerWidth`, `innerHeight`, `matchMedia` y evento `resize`: ancho menor a 768, alto menor a 540 y pointer coarse retornan `true`; desktop retorna `false`. Ejecutarla y confirmar fallo por módulo inexistente.

- [ ] **Step 3: Extraer el hook y actualizar ContactModal**

Mover solo `useIsMobile` a `useIsMobile.ts`, actualizar import de ContactModal y comprobar las cuatro condiciones de la prueba.

- [ ] **Step 4: Eliminar código muerto y tests de offsets obsoletos**

Eliminar `useKeyboardOffset.ts` y `keyboard.offset.test.ts` después de `rg` confirmar que no hay consumidores. No quitar `visualViewportMetrics`, `modalFrameLayout`, ni test de dichos comportamientos.

- [ ] **Step 5: Correr suite completa**

Run: `.\node_modules\.bin\vitest.cmd run`

Expected: la suite completa pasa y no queda import roto de ninguno de los símbolos retirados.

---

### Task 8: Verificación integrada y validación en dispositivos

**Files:**
- Modify: solo los archivos de las tareas anteriores si se detecta un fallo respaldado por prueba.

- [ ] **Step 1: Ejecutar suite completa**

Run: `.\node_modules\.bin\vitest.cmd run`

Expected: todos los archivos y pruebas pasan.

- [ ] **Step 2: Ejecutar diagnóstico Astro**

Run: `.\node_modules\.bin\astro.cmd check`

Expected: cero errores; registrar advertencias e identificar cuáles son preexistentes al cambio.

- [ ] **Step 3: Ejecutar build**

Run: `.\node_modules\.bin\astro.cmd build`

Expected: exit code 0 y artefacto server generado. Distinguir cualquier problema de permisos de logs Wrangler del resultado del build.

- [ ] **Step 4: Revisar diff y alcance**

Run: `git diff --check` y `git status --short`.

Expected: sin whitespace errors ni archivos generados/ajenos; `ContactModal` conserva su comportamiento de envío simulado y los cambios de viewport quedan limitados al shell común.

- [ ] **Step 5: Ejecutar protocolo manual en dispositivos**

Para login, contacto y vista previa: abrir/cerrar, probar Tab/Shift+Tab, Escape, backdrop y scroll; en login/contacto, abrir teclado, cambiar de campo, cerrar teclado y reabrirlo repetidamente. Confirmar que apertura no invoca teclado, que página de fondo queda fija y que scroll excedente pertenece al diálogo. Registrar navegador/dispositivo y capturas/logs si reaparece un salto.

---

## Orden de dependencias

`Task 1 → Task 2 → Task 3 → Task 4 → Task 5`; `Task 6` puede desarrollarse tras el harness de Task 1 y antes o después de Tasks 2–5. `Task 7` depende de que Task 4 haya movido el scroll lock. `Task 8` cierra el conjunto.

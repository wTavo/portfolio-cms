# Adaptive Modal Keyboard Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the modal card still when switching inputs with the keyboard open, while centering it with one fluid repositioning when the keyboard opens or closes.

**Architecture:** Separate raw viewport observation from modal-position decisions. A controller classifies keyboard open/close, batches transition geometry until stable, ignores focus-associated viewport panning while the keyboard remains open, and publishes one final bounds snapshot. `AdaptiveModal` applies that snapshot and animates one FLIP-style vertical reposition through a dedicated, reduced-motion-aware helper.

**Tech Stack:** React 19, TypeScript, Motion, VisualViewport API with layout-viewport fallback, Vitest, Testing Library, Astro.

**Spec:** `docs/superpowers/specs/2026-09-30-adaptive-modal-viewport-design.md`

## Global Constraints

- Do not add dependencies or change global viewport configuration.
- Preserve modal accessibility, document scroll lock, internal scrolling, and existing open/close motion.
- `VisualViewport` is optional; use `window.innerWidth`/`innerHeight` when unavailable.
- Respect `prefers-reduced-motion` for repositioning.
- Keep the modal fixed after keyboard-open settles; input focus changes alone must not start reposition animation.
- Do not claim physical-browser validation unless performed on that browser/device.

## Review Focus

- Rapid multi-frame viewport changes during OSK opening: must publish one stable destination and start at most one position animation.
- Switching inputs while keyboard remains open, including offset-only panning and small viewport changes: must not reposition the card.
- Keyboard closure after prior internal scrolling: must center once and restore the saved scroll intent.
- Window-width/orientation changes while keyboard is open: must not remain incorrectly frozen; must recalculate once.
- Reduced motion and unmount during pending RAF/animation: must not leave motion, listeners, or callbacks active.

---

### Task 1: Make viewport observation preserve event provenance

**Files:**
- Modify: `src/lib/visualViewportMetrics.ts`
- Test: `__tests__/unit/visual-viewport-metrics.test.ts`

**Interfaces:**
- `ViewportBounds` remains `{ top: number; left: number; width: number; height: number }`.
- Add `ViewportEventSourceName = 'visualviewport-resize' | 'visualviewport-scroll' | 'window-resize' | 'window-scroll' | 'initial'`.
- Change observer callback to `(bounds: ViewportBounds, sources: readonly ViewportEventSourceName[]) => void`.

- [ ] **Step 1: Write failing provenance tests.** Assert initial callback reports `initial`; one VisualViewport resize reports only `visualviewport-resize`; resize and scroll in one frame report both sources once and the latest full rectangle; later frames produce independent reports.

```ts
expect(onBounds).toHaveBeenLastCalledWith(
  { top: 48, left: 0, width: 390, height: 496 },
  ['visualviewport-resize', 'visualviewport-scroll'],
);
```

- [ ] **Step 2: Run the focused test and confirm the expected missing-source failure.**

Run: `node_modules/.bin/vitest.cmd run __tests__/unit/visual-viewport-metrics.test.ts`

Expected: FAIL because the observer currently supplies bounds only.

- [ ] **Step 3: Implement source-aware coalescing and preserve current cleanup/fallback behavior.** Track pending sources in a `Set`, pass a stable array with the latest snapshot, clear the set after each RAF, and continue to cancel the RAF/remove exact listeners on disposal.
- [ ] **Step 4: Re-run the focused test and confirm all observer tests pass.**
- [ ] **Step 5: Commit this independently testable change.**

### Task 2: Add a tested keyboard viewport transition controller

**Files:**
- Create: `src/lib/modalViewportController.ts`
- Create: `__tests__/unit/modal-viewport-controller.test.ts`
- Modify: `src/lib/visualViewportMetrics.ts` only if the controller needs a shared exported type.

**Interfaces:**
- Export `createModalViewportController(options)`.
- `options`: `initialBounds: ViewportBounds`, `baselineHeight: number`, `initialEditableInputFocused?: boolean`, `readLayoutViewport(): { width: number; height: number }`, `scheduleFrame(callback): number`, `cancelFrame(id): void`, `now(): number`, `onStableBounds(bounds, transition: 'keyboard-open' | 'keyboard-close' | 'viewport-resize'): void`.
- Controller methods: `observe(bounds, sources, focusState?: { editableInputFocused: boolean; changed?: boolean }): void`, `dispose(): void`.
- Centralize policy constants: keyboard threshold `80` CSS px; stability tolerance `1` CSS px; `3` consecutive stable RAF samples; maximum settling time `500` ms.
- Opening classification requires both a viewport-height reduction and a focused `input`/`textarea`; focus alone never positions the modal. Focus changes while keyboard-open is stable suppress offset-only movement and keyboard-height changes; a real `window-resize` or width change invalidates that freeze and settles a `viewport-resize` transition.

```ts
interface ModalViewportController {
  observe(
    bounds: ViewportBounds,
    sources: readonly ViewportEventSourceName[],
    focusState?: { editableInputFocused: boolean; changed?: boolean },
  ): void;
  dispose(): void;
}
```

- [ ] **Step 1: Write failing tests for event sequences:** initial closed geometry does not animate; a large desktop height resize without editable focus is a normal viewport-resize, not a keyboard opening; focused input plus height crossing the keyboard threshold begins one opening transaction; many changed frames followed by three stable samples emit exactly one final open snapshot; closing emits exactly one close snapshot; offset-only scrolling with keyboard open emits no reposition; focused-input change with keyboard open plus changed visual height emits no reposition; window resize/width change while open emits one stabilized viewport-resize snapshot and updates the layout-height baseline; max settling time emits the latest snapshot; disposal cancels pending work.
- [ ] **Step 2: Run the focused controller test and confirm it fails because the controller is absent.**

Run: `node_modules/.bin/vitest.cmd run __tests__/unit/modal-viewport-controller.test.ts`

Expected: FAIL at module resolution before implementation.

- [ ] **Step 3: Implement the smallest controller satisfying the tests.** Each observation replaces the pending snapshot. While a transition is settling, schedule one RAF at a time, compare the newest snapshot with the prior sample (all four bounds within 1 CSS px), increment/reset the stable-sample count, and emit after three consecutive stable samples. If 500 ms elapses first, emit the newest snapshot once. Require an editable input focus plus the height threshold to classify keyboard opening; focus alone never triggers position changes. Ignore VisualViewport-only geometry changes while open-stable; a focus change while keyboard-open suppresses repositioning until close. A width change or `window-resize` starts a viewport-resize settle. On a width/orientation change while open, refresh the keyboard baseline from `readLayoutViewport()` so closing in the new orientation is detected correctly. `dispose()` cancels the pending RAF and makes later observations/callbacks inert.
- [ ] **Step 4: Run controller and observer unit tests.**
- [ ] **Step 5: Commit the controller with its tests.**

### Task 3: Restore one fluid, cancelable card-position animation

**Files:**
- Create: `src/lib/modalPositionAnimation.ts`
- Create: `__tests__/unit/modal-position-animation.test.ts`
- Modify: `src/lib/motion.ts` only if a shared existing duration/easing is sufficient and needs no new abstraction.

**Interfaces:**
- Export `animateVerticalPosition(element, previousTop, options)` where options are `{ duration: number; easing: string; prefersReducedMotion: boolean }`.
- Measure the final card top after new bounds are applied; animate its wrapper from `previousTop - finalTop` to `0` using Web Animations API. Return a cancellation function. If no meaningful delta, no Web Animations API, or reduced motion is requested, do not animate.
- The helper owns only reposition motion, not opacity/scale entry/exit.

```ts
element.animate(
  [{ transform: `translateY(${previousTop - finalTop}px)` }, { transform: 'translateY(0)' }],
  { duration: options.duration * 1000, easing: options.easing, fill: 'both' },
);
```

- [ ] **Step 1: Write failing tests:** verify computed translate delta and duration/easing; no animation for zero delta; reduced-motion and unsupported `element.animate` paths are no-ops; invoking cleanup cancels a running animation; a new call cancels the prior animation on the same wrapper.
- [ ] **Step 2: Run the focused animation test and confirm it fails because the helper is absent.**

Run: `node_modules/.bin/vitest.cmd run __tests__/unit/modal-position-animation.test.ts`

Expected: FAIL at module resolution.

- [ ] **Step 3: Implement the helper with cancellation and `prefers-reduced-motion` behavior.** Use existing `MOTION_DURATIONS.normal` and `MOTION_EASINGS.standard` at the caller; do not introduce a spring or a second competing Motion transform on the same wrapper.
- [ ] **Step 4: Run the focused animation test.**
- [ ] **Step 5: Commit helper and tests.**

### Task 4: Integrate transactional positioning into AdaptiveModal

**Files:**
- Modify: `src/components/ui/AdaptiveModal.tsx`
- Test: `__tests__/unit/adaptive-modal.test.tsx`

**Interfaces:**
- Feed source-aware viewport observations into `createModalViewportController` while `isOpen`.
- Keep applying initial bounds immediately. During keyboard transitions, retain current rendered bounds until the controller emits a stable snapshot.
- On each emitted stable snapshot, capture current card top, update scroll-container bounds once, measure the new card top, then animate the dedicated position wrapper once.
- Focus capture compares the prior and next editable element and passes only actual input-to-input changes to the controller. Focus change with stable keyboard does not reset the keyboard-open transaction.
- Preserve internal scroll-save/restore semantics, safe centering, fixed scroll container, and current entry/exit opacity+scale animation.

```ts
const previousTop = card.getBoundingClientRect().top;
syncVisualViewportBounds(container, stableBounds);
const finalTop = card.getBoundingClientRect().top;
cancelPositionAnimation = animateVerticalPosition(positionWrapper, previousTop, motionOptions);
```

- [ ] **Step 1: Replace current behavior assertions with failing behavioral integration tests.** Simulate a multi-frame keyboard opening and assert intermediate viewport events do not move bounds; after stable frames assert final bounds and exactly one position animation. With keyboard open, switch email/password while dispatching visual viewport scroll/resize and assert no new animation or card-top change. Close/open cycles each yield one animation. Real width change while open yields one recalculation. Reduced motion yields zero positional animations. Preserve internal scroll restoration and modal scroll containment.
- [ ] **Step 2: Run `node_modules/.bin/vitest.cmd run __tests__/unit/adaptive-modal.test.tsx` and confirm these new expectations fail against current behavior.**
- [ ] **Step 3: Integrate the controller and animation wrapper with exact cleanup on modal close/unmount.** Remove only now-obsolete helpers/tests from the current working diff after replacement assertions are in place; do not revert unrelated user changes.
- [ ] **Step 4: Run the focused component test, controller test, observer test, and animation test.**
- [ ] **Step 5: Commit the integration after all focused tests pass.**

### Task 5: Full verification and device-check report

**Files:**
- Inspect: `git diff --check`, all changed modal source/tests, existing spec and plan.

- [ ] **Step 1: Run the full suite.**

Run: `node_modules/.bin/vitest.cmd run`

Expected: all tests pass.

- [ ] **Step 2: Run Astro type/content checks.**

Run: `node_modules/.bin/astro.cmd check`

Expected: zero errors; report pre-existing hints/warnings accurately.

- [ ] **Step 3: Run production build.**

Run: `node_modules/.bin/astro.cmd build`

Expected: exit code 0; report any environmental Cloudflare/Wrangler diagnostics separately.

- [ ] **Step 4: Review the complete diff and run `git diff --check`.** Confirm no redundant state, no obsolete animation or settling helper, exact listener/RAF/animation cleanup, no unrelated files included.
- [ ] **Step 5: Manually validate using the dev server on the available Android emulator:** keyboard closed → focus email → let keyboard open; alternate email/password without closing it; close keyboard; reopen from the other input; rotate/resize once; repeat with reduced motion if available. Save a fresh diagnostic only if a behavior fails. Record browser/device and explicitly mark physical Samsung/Firefox/Samsung Internet validation as pending unless performed.
- [ ] **Step 6: Report verified results and any manual checks still needed; do not state the visual bug is fixed based on unit tests alone.**

## Execution Notes

- Work in the current checkout as previously selected by the user; do not create a worktree.
- The checkout already contains unrelated local modal edits and generated design notes. Inspect every target before editing and preserve changes outside the exact scope above.
- `npm` on this machine previously resolved to a broken global shim; use the local `.cmd` executables shown above unless that environment has changed.
- Commit each independently testable task only after its tests pass; do not amend or rewrite existing commits.

## Approved implementation refinement (2026-09-30)

The Android diagnostic showed native `VisualViewport.offsetTop` panning during keyboard opening and input switches. While a keyboard transition is pending or open, mirror only `bounds.top` into the fixed frame so the card remains stationary in screen coordinates. Keep height/width frozen until the controller settles, then apply the complete bounds and run the existing single FLIP animation. Cover controller and component behavior with a delayed multi-step `offsetTop` sequence. This supersedes the earlier requirement that the rendered frame remain unchanged throughout the transition; screen-space card stability is the invariant.

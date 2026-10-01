/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con adaptación en tiempo real al teclado virtual (Directivas 5, 12, 14, 31, 32).
 * Centra la tarjeta cuando cabe en el viewport visible y permite desplazarla completa cuando no cabe.
 */

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';
import { i18n } from '../../lib/i18n/es';
import { XIcon } from '../icons/Icons';
import ModalDialog from './ModalDialog';
import {
  createDiagnosticBuffer,
  createModalDiagnosticGeometry,
  createModalScrollDiagnostic,
} from '../../lib/modalDiagnostics';
import { observeViewportBounds, syncVisualViewportBounds } from '../../lib/visualViewportMetrics';
import {
  MODAL_FRAME_JUSTIFY_CONTENT,
  MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT,
  MODAL_SCROLL_TOUCH_ACTION,
} from '../../lib/modalFrameLayout';
import { createModalViewportController, MODAL_KEYBOARD_HEIGHT_THRESHOLD } from '../../lib/modalViewportController';
import { animateVerticalPosition } from '../../lib/modalPositionAnimation';

export interface AdaptiveModalProps {
  /** Estado de visibilidad del modal */
  isOpen: boolean;
  /** Callback ejecutado al solicitar el cierre */
  onClose: () => void;
  /** Título principal de la cabecera */
  title: string;
  /** Subtítulo o texto descriptivo secundario opcional */
  subtitle?: string;
  /** Icono decorativo opcional a la izquierda del título */
  icon?: React.ReactNode;
  /** Contenido principal del cuerpo del modal */
  children: React.ReactNode;
  /** Pie de acción inferior opcional, desplazable junto con la tarjeta */
  footer?: React.ReactNode;
  /** Clase Tailwind para ancho máximo (por defecto 'max-w-md') */
  maxWidthClass?: string;
  /** Habilitar o deshabilitar botón de cierre 'X' (por defecto true) */
  showCloseButton?: boolean;
  /** Habilitar gesto de arrastre vertical (mantenido por compatibilidad de props) */
  enableDragToDismiss?: boolean;
  /** ID accesible para aria-labelledby */
  ariaLabelledBy?: string;
  /** Clase CSS adicional para el contenedor del cuerpo */
  contentClassName?: string;
}

export default function AdaptiveModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidthClass = 'max-w-md',
  showCloseButton = true,
  ariaLabelledBy = 'adaptive-modal-title',
  contentClassName = '',
}: AdaptiveModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  prefersReducedMotionRef.current = prefersReducedMotion;
  const diagnosticsEnabled = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('modalDebug') === '1';
  const modalRef = useRef<HTMLDivElement>(null);
  const modalPositionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalFrameRef = useRef<HTMLDivElement>(null);

  const keyboardOpenRef = useRef(false);
  /** Altura base del viewport sin teclado virtual activo */
  const baselineHeightRef = useRef<number>(
    typeof window !== 'undefined'
      ? Math.max(window.innerHeight, Math.round(window.visualViewport?.height ?? 0))
      : 0
  );
  /** Posición de scroll previa a la apertura del teclado para restaurar exactamente la intención del usuario */
  const userScrollBeforeKeyboardRef = useRef<number>(0);
  /** Indicador de si el usuario está realizando un desplazamiento táctil o con ratón directo */
  const isUserDraggingScroll = useRef<boolean>(false);
  const diagnosticsRef = useRef<ReturnType<typeof createDiagnosticBuffer> | null>(null);
  diagnosticsRef.current ??= createDiagnosticBuffer();
  const diagnosticFrameRef = useRef<number | null>(null);
  const diagnosticFramesRemainingRef = useRef(0);
  const diagnosticSampleSourceRef = useRef('interaction');
  const lastFocusedEditableRef = useRef<HTMLElement | null>(null);
  const editableInputFocusedRef = useRef(false);
  const isKeyboardSettledRef = useRef(false);
  const focusSwitchLockedRef = useRef(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewportControllerRef = useRef<ReturnType<typeof createModalViewportController> | null>(null);
  const cancelPositionAnimationRef = useRef<(() => void) | null>(null);

  const recordDiagnostic = (event: string, details: Record<string, string | number | boolean | null> = {}) => {
    if (diagnosticsEnabled) diagnosticsRef.current?.record(event, details);
  };

  const saveDiagnostics = () => {
    const payload = {
      capturedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: { width: window.screen.width, height: window.screen.height },
      devicePixelRatio: window.devicePixelRatio,
      events: diagnosticsRef.current?.getEvents() ?? [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modal-diagnostic-${Date.now()}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const schedulePositionSample = (event: string) => {
    if (!diagnosticsEnabled) return;
    diagnosticSampleSourceRef.current = event;
    diagnosticFramesRemainingRef.current = 45;
    if (diagnosticFrameRef.current !== null) return;

    const sample = () => {
      const modal = modalRef.current;
      const frame = modalFrameRef.current;
      const container = scrollContainerRef.current;
      if (!modal || !frame || !container || diagnosticFramesRemainingRef.current <= 0) {
        diagnosticFrameRef.current = null;
        return;
      }
      const rect = modal.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const posWrapper = modalPositionRef.current;
      const modalStyle = window.getComputedStyle(modal);
      const posStyle = posWrapper ? window.getComputedStyle(posWrapper) : null;
      const frameStyle = window.getComputedStyle(frame);
      const vv = window.visualViewport;
      recordDiagnostic('animation-frame-sample', {
        source: diagnosticSampleSourceRef.current,
        ...createModalDiagnosticGeometry({
          modalTop: rect.top,
          modalHeight: rect.height,
          frameTop: frameRect.top,
          frameHeight: frameRect.height,
          containerTop: containerRect.top,
          containerHeight: container.clientHeight,
          containerScrollTop: container.scrollTop,
          visualHeight: vv?.height ?? window.innerHeight,
          visualTop: vv?.offsetTop ?? 0,
          paddingTop: Number.parseFloat(frameStyle.paddingTop) || 0,
          paddingBottom: Number.parseFloat(frameStyle.paddingBottom) || 0,
          modalFits: container.scrollHeight <= container.clientHeight,
          keyboardAnchorTop: null,
          transform: (posStyle && posStyle.transform !== 'none') ? posStyle.transform : modalStyle.transform,
          animationName: modalStyle.animationName,
          transitionProperty: modalStyle.transitionProperty,
          opacity: modalStyle.opacity,
        }),
        windowScrollY: window.scrollY,
      });
      diagnosticFramesRemainingRef.current -= 1;
      if (diagnosticFramesRemainingRef.current > 0) {
        diagnosticFrameRef.current = window.requestAnimationFrame(sample);
      } else {
        diagnosticFrameRef.current = null;
      }
    };

    diagnosticFrameRef.current = window.requestAnimationFrame(sample);
  };

  // Position changes are committed once the keyboard/viewport transition reaches stable geometry.
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      userScrollBeforeKeyboardRef.current = 0;
      isUserDraggingScroll.current = false;
      keyboardOpenRef.current = false;
      lastFocusedEditableRef.current = null;
      editableInputFocusedRef.current = false;
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      return;
    }

    diagnosticsRef.current?.clear();
    recordDiagnostic('modal-open');

    const initialHeight = window.visualViewport?.height ?? window.innerHeight;
    baselineHeightRef.current = Math.max(baselineHeightRef.current, initialHeight);

    const readCurrentBounds = () => {
      const viewport = window.visualViewport;
      return viewport
        ? {
            top: viewport.offsetTop,
            left: viewport.offsetLeft,
            width: viewport.width,
            height: viewport.height,
          }
        : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    };
    const initialBounds = readCurrentBounds();
    const activeElement = document.activeElement;
    const initialEditableInputFocused = modalRef.current?.contains(activeElement) === true &&
      (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement);
    const initialKeyboardOpen = baselineHeightRef.current - initialBounds.height > MODAL_KEYBOARD_HEIGHT_THRESHOLD &&
      initialEditableInputFocused;
    keyboardOpenRef.current = initialKeyboardOpen;
    editableInputFocusedRef.current = initialEditableInputFocused;
    if (modalFrameRef.current) {
      modalFrameRef.current.style.justifyContent = initialKeyboardOpen
        ? MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT
        : MODAL_FRAME_JUSTIFY_CONTENT;
      modalFrameRef.current.style.paddingBottom = initialKeyboardOpen ? '5rem' : '';
    }

    const controller = createModalViewportController({
      initialBounds,
      baselineHeight: baselineHeightRef.current,
      initialEditableInputFocused,
      readLayoutViewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
      scheduleFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (id) => window.cancelAnimationFrame(id),
      now: () => window.performance.now(),
      onStableBounds: (bounds, transition) => {
        const container = scrollContainerRef.current;
        const card = modalRef.current;
        const positionWrapper = modalPositionRef.current;
        if (!container || !card || !positionWrapper) return;

        const previousContainerTop = container.getBoundingClientRect().top;
        const previousTop = card.getBoundingClientRect().top - previousContainerTop;

        if (transition === 'keyboard-open') {
          keyboardOpenRef.current = true;
          isKeyboardSettledRef.current = true;
          focusSwitchLockedRef.current = false;
          if (modalFrameRef.current) {
            modalFrameRef.current.style.justifyContent = MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT;
            modalFrameRef.current.style.paddingBottom = '5rem';
          }
          if (container.scrollHeight <= container.clientHeight + 2) {
            container.scrollTop = 0;
          }
        } else if (transition === 'keyboard-close') {
          keyboardOpenRef.current = false;
          isKeyboardSettledRef.current = false;
          focusSwitchLockedRef.current = false;
          editableInputFocusedRef.current = false;
          if (modalFrameRef.current) {
            modalFrameRef.current.style.justifyContent = MODAL_FRAME_JUSTIFY_CONTENT;
            modalFrameRef.current.style.paddingBottom = '';
          }
          baselineHeightRef.current = Math.max(baselineHeightRef.current, window.innerHeight, bounds.height);
          container.scrollTop = userScrollBeforeKeyboardRef.current;
        } else if (transition === 'viewport-resize' && !keyboardOpenRef.current) {
          baselineHeightRef.current = Math.max(baselineHeightRef.current, window.innerHeight, bounds.height);
        }

        syncVisualViewportBounds(container, bounds);
        const nextContainerTop = container.getBoundingClientRect().top;
        const finalTop = card.getBoundingClientRect().top - nextContainerTop;

        if (transition !== 'viewport-resize') {
          cancelPositionAnimationRef.current?.();
          cancelPositionAnimationRef.current = animateVerticalPosition(positionWrapper, previousTop, {
            duration: MOTION_DURATIONS.normal,
            easing: `cubic-bezier(${MOTION_EASINGS.standard.join(', ')})`,
            prefersReducedMotion: prefersReducedMotionRef.current ?? false,
          });
        }
        recordDiagnostic('viewport-transition-settled', {
          transition,
          visualHeight: bounds.height,
          visualWidth: bounds.width,
          visualTop: bounds.top,
          visualLeft: bounds.left,
          previousModalTop: previousTop,
          finalModalTop: finalTop,
          keyboardOpen: keyboardOpenRef.current,
          containerScrollTop: container.scrollTop,
        });
        schedulePositionSample(`viewport-${transition}`);
      },
    });
    viewportControllerRef.current = controller;

    const stopObservingViewport = observeViewportBounds(window, (bounds, sources) => {
      if (sources.includes('initial')) {
        syncVisualViewportBounds(scrollContainerRef.current, bounds);
        return;
      }

      const isKeyboardActive = (editableInputFocusedRef.current || keyboardOpenRef.current) &&
        baselineHeightRef.current - bounds.height > MODAL_KEYBOARD_HEIGHT_THRESHOLD;

      if (isKeyboardActive) {
        if (!keyboardOpenRef.current) {
          isKeyboardSettledRef.current = false;
        }
        keyboardOpenRef.current = true;
        if (modalFrameRef.current) {
          modalFrameRef.current.style.justifyContent = MODAL_FRAME_KEYBOARD_JUSTIFY_CONTENT;
          modalFrameRef.current.style.paddingBottom = '5rem';
        }
      } else if (bounds.height >= baselineHeightRef.current - MODAL_KEYBOARD_HEIGHT_THRESHOLD) {
        if (keyboardOpenRef.current) {
          isKeyboardSettledRef.current = false;
        }
      }

      // Si el visualViewport se desplaza mientras el teclado ya está asentado y no se cambia de input,
      // mantener top y left anclados a la cámara para que el modal nunca se despegue de la pantalla
      if (keyboardOpenRef.current && isKeyboardSettledRef.current && !focusSwitchLockedRef.current && sources.includes('visualviewport-scroll') && !sources.includes('visualviewport-resize') && !sources.includes('window-resize')) {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.top = `${bounds.top}px`;
          scrollContainerRef.current.style.left = `${bounds.left}px`;
        }
      }

      controller.observe(bounds, sources);
      recordDiagnostic('viewport-observation', {
        sources: sources.join(','),
        visualHeight: bounds.height,
        visualWidth: bounds.width,
        visualTop: bounds.top,
        visualLeft: bounds.left,
        keyboardHeight: Math.max(0, baselineHeightRef.current - bounds.height),
        keyboardOpen: keyboardOpenRef.current,
        windowInnerHeight: window.innerHeight,
        windowScrollY: window.scrollY,
        focusedInputType: document.activeElement instanceof HTMLInputElement
          ? document.activeElement.type
          : document.activeElement instanceof HTMLTextAreaElement
            ? 'textarea'
            : null,
        containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
      });
      schedulePositionSample(`viewport-${sources.join('-')}`);
    });

    return () => {
      stopObservingViewport();
      controller.dispose();
      viewportControllerRef.current = null;
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      cancelPositionAnimationRef.current?.();
      cancelPositionAnimationRef.current = null;
      if (diagnosticFrameRef.current !== null) {
        window.cancelAnimationFrame(diagnosticFrameRef.current);
        diagnosticFrameRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !diagnosticsEnabled) return;
    const modal = modalRef.current;
    const frame = modalFrameRef.current;
    const container = scrollContainerRef.current;
    if (!modal || !frame || !container) return;

    const rect = modal.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const vv = window.visualViewport;
    recordDiagnostic('rendered-modal-position', {
      modalTop: Math.round(rect.top * 100) / 100,
      modalHeight: Math.round(rect.height * 100) / 100,
      frameTop: Math.round(frameRect.top * 100) / 100,
      containerTop: Math.round(container.getBoundingClientRect().top * 100) / 100,
      containerHeight: container.clientHeight,
      containerScrollTop: container.scrollTop,
      modalFits: container.scrollHeight <= container.clientHeight,
      visualHeight: Math.round(vv?.height ?? window.innerHeight),
      visualTop: Math.round(vv?.offsetTop ?? 0),
      windowScrollY: window.scrollY,
    });
  }, [isOpen, diagnosticsEnabled]);

  /**
   * Registra la posición voluntaria de scroll del usuario cuando no hay teclado activo
   * o cuando el usuario arrastra intencionalmente con el dedo o ratón.
   */
  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (diagnosticsEnabled) {
      const viewport = window.visualViewport;
      recordDiagnostic('modal-container-scroll', createModalScrollDiagnostic({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        overflowY: window.getComputedStyle(container).overflowY,
        modalFits: container.scrollHeight <= container.clientHeight,
        keyboardOpen: keyboardOpenRef.current,
        visualHeight: viewport?.height ?? window.innerHeight,
        visualTop: viewport?.offsetTop ?? 0,
      }));
    }

    if (!keyboardOpenRef.current || isUserDraggingScroll.current) {
      userScrollBeforeKeyboardRef.current = container.scrollTop;
    }
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }

    const previousTarget = lastFocusedEditableRef.current;
    const focusedInputChanged = keyboardOpenRef.current && previousTarget !== null && previousTarget !== target;
    lastFocusedEditableRef.current = target;
    editableInputFocusedRef.current = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (focusedInputChanged) {
      focusSwitchLockedRef.current = true;
    }
    const viewport = window.visualViewport;
    viewportControllerRef.current?.observe(
      viewport
        ? { top: viewport.offsetTop, left: viewport.offsetLeft, width: viewport.width, height: viewport.height }
        : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
      [],
      {
        editableInputFocused: target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement,
        changed: focusedInputChanged,
      },
    );

    recordDiagnostic('input-focus', {
      inputChangedWhileKeyboardOpen: focusedInputChanged,
      inputType: target instanceof HTMLInputElement ? target.type : target.tagName.toLowerCase(),
      keyboardAlreadyOpen: keyboardOpenRef.current,
      windowScrollY: window.scrollY,
      containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
    });
    schedulePositionSample('input-focus');
  };

  const handleInputPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    editableInputFocusedRef.current = true;
    lastFocusedEditableRef.current = target;
    target.focus({ preventScroll: true });
    recordDiagnostic('input-pointerdown', {
      pointerType: event.pointerType,
      inputType: target instanceof HTMLInputElement ? target.type : target.tagName.toLowerCase(),
      windowScrollY: window.scrollY,
      containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
    });
    schedulePositionSample('input-pointerdown');
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

    const related = event.relatedTarget as HTMLElement | null;
    const isSwitchingToInternalInput = related instanceof HTMLElement &&
      modalRef.current?.contains(related) &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(related.tagName);

    if (isSwitchingToInternalInput) {
      editableInputFocusedRef.current = true;
    } else {
      blurTimerRef.current = setTimeout(() => {
        const active = document.activeElement;
        const isStillInput = Boolean(
          active instanceof HTMLElement &&
          modalRef.current?.contains(active) &&
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)
        );
        editableInputFocusedRef.current = isStillInput;
        const viewport = window.visualViewport;
        viewportControllerRef.current?.observe(
          viewport
            ? { top: viewport.offsetTop, left: viewport.offsetLeft, width: viewport.width, height: viewport.height }
            : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
          [],
          {
            editableInputFocused: isStillInput,
            changed: keyboardOpenRef.current,
          },
        );
      }, 60);
    }

    recordDiagnostic('input-blur', {
      inputType: target instanceof HTMLInputElement ? target.type : target.tagName.toLowerCase(),
      nextTargetTag: related?.tagName.toLowerCase() ?? null,
      windowScrollY: window.scrollY,
      containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
    });
    schedulePositionSample('input-blur');
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} labelledBy={ariaLabelledBy}>
          {diagnosticsEnabled && (
            <button
              type="button"
              onClick={saveDiagnostics}
              className="fixed bottom-2 right-2 z-[60] rounded-full border border-white/20 bg-black/85 px-3 py-2 text-xs font-semibold text-white shadow-lg"
              style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
              aria-label="Guardar registro de diagnóstico del modal"
            >
              Guardar diagnóstico
            </button>
          )}
          {/* Contenedor fijado al viewport visible; el overflow siempre pertenece al modal. */}
          <div
            ref={scrollContainerRef}
            onScroll={handleContainerScroll}
            onTouchStart={() => {
              isUserDraggingScroll.current = true;
            }}
            onTouchEnd={() => {
              isUserDraggingScroll.current = false;
            }}
            onMouseDown={() => {
              isUserDraggingScroll.current = true;
            }}
            onMouseUp={() => {
              isUserDraggingScroll.current = false;
            }}
            onFocusCapture={handleInputFocus}
            onBlurCapture={handleInputBlur}
            onPointerDownCapture={handleInputPointerDown}
            className="fixed overflow-y-auto overscroll-contain touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            data-modal-scroll-container
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: MODAL_SCROLL_TOUCH_ACTION,
              pointerEvents: 'auto',
            }}
          >
            {/* El centrado seguro es constante: cuando excede el viewport, el overflow empieza arriba. */}
            <div
              ref={modalFrameRef}
              className="w-full min-h-full flex flex-col items-center text-center pt-4 [@media(max-height:540px)]:pt-2 pb-2 px-2 sm:p-4"
              style={{
                justifyContent: MODAL_FRAME_JUSTIFY_CONTENT,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              {/* Tarjeta Modal Flotante */}
              <div ref={modalPositionRef} className="w-full flex justify-center shrink-0" data-modal-position-wrapper>
                <motion.div
                  ref={modalRef}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: MOTION_DURATIONS.fast,
                    ease: MOTION_EASINGS.standard,
                  }}
                  className={`relative w-full ${maxWidthClass} bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col text-left shrink-0`}
                >
                {/* Cabecera Fija de la Tarjeta */}
                <header className="px-4 sm:px-6 py-2 sm:py-3.5 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-surface-elevated)] shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {icon && (
                      <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-brand-accent)] flex items-center justify-center shadow-[var(--shadow-card)] shrink-0">
                        {icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2
                        id={ariaLabelledBy}
                        className="text-base font-bold text-[var(--color-text-primary)] tracking-tight truncate"
                      >
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-w-(--size-touch-target) min-h-(--size-touch-target) flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] cursor-pointer shrink-0"
                      aria-label={i18n.common.close}
                    >
                      <XIcon size={18} />
                    </button>
                  )}
                </header>

                {/* Cuerpo del Modal */}
                <div className={`flex-1 ${contentClassName}`}>
                  {children}
                </div>

                {/* Pie con Botones de Acción (Directiva 12) */}
                {footer && (
                  <footer className="px-4 sm:px-6 py-2 sm:py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] shrink-0">
                    {footer}
                  </footer>
                )}
                </motion.div>
              </div>
            </div>
          </div>
    </ModalDialog>
  );
}

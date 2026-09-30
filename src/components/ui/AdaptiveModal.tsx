/**
 * @file AdaptiveModal.tsx
 * @description Modal flotante y accesible con adaptación en tiempo real al teclado virtual (Directivas 5, 12, 14, 31, 32).
 * Centra la tarjeta cuando cabe en el viewport visible y permite desplazarla completa cuando no cabe.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../lib/motion';
import { i18n } from '../../lib/i18n/es';
import { XIcon } from '../icons/Icons';
import ModalDialog from './ModalDialog';
import {
  createDiagnosticBuffer,
  createDiagnosticEventIdGenerator,
  createModalDiagnosticGeometry,
  createModalScrollDiagnostic,
} from '../../lib/modalDiagnostics';
import { getNextViewportMetrics, syncVisualViewportBounds } from '../../lib/visualViewportMetrics';
import { getModalFrameLayout, getModalTouchAction } from '../../lib/modalFrameLayout';
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
  const diagnosticsEnabled = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('modalDebug') === '1';
  const modalRef = useRef<HTMLDivElement>(null);
  const modalPositionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalFrameRef = useRef<HTMLDivElement>(null);

  /** Métricas reactivas del viewport visual en tiempo real */
  const [viewportMetrics, setViewportMetrics] = useState(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isKeyboardOpen: false,
  }));
  const viewportMetricsRef = useRef(viewportMetrics);

  /** Estado que indica si la tarjeta modal cabe en la altura visible disponible */
  const [modalFits, setModalFits] = useState<boolean>(true);

  const lastWindowWidth = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const keyboardOpenRef = useRef(false);
  const isSwitchingInputRef = useRef(false);
  const activeInputRef = useRef<HTMLElement | null>(null);
  const focusSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const diagnosticEventIdRef = useRef<ReturnType<typeof createDiagnosticEventIdGenerator> | null>(null);
  diagnosticEventIdRef.current ??= createDiagnosticEventIdGenerator();
  const diagnosticCauseIdRef = useRef<string | null>(null);
  const diagnosticFrameRef = useRef<number | null>(null);
  const diagnosticFramesRemainingRef = useRef(0);
  const diagnosticSampleSourceRef = useRef('interaction');
  const modalFitsRef = useRef(modalFits);
  modalFitsRef.current = modalFits;

  const recordDiagnostic = (event: string, details: Record<string, string | number | boolean | null> = {}) => {
    if (!diagnosticsEnabled) return null;
    const eventId = diagnosticEventIdRef.current?.(event) ?? event;
    if (['modal-open', 'input-focus', 'input-pointerdown', 'input-blur', 'visualviewport-resize', 'visualviewport-scroll', 'window-resize', 'window-scroll'].includes(event)) {
      diagnosticCauseIdRef.current = eventId;
    }
    diagnosticsRef.current?.record(event, {
      eventId,
      causeId: diagnosticCauseIdRef.current,
      ...details,
    });
    return eventId;
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
    const causeId = diagnosticCauseIdRef.current;
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
      const modalStyle = window.getComputedStyle(modal);
      const frameStyle = window.getComputedStyle(frame);
      const vv = window.visualViewport;
      recordDiagnostic('animation-frame-sample', {
        source: diagnosticSampleSourceRef.current,
        causeId,
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
          modalFits: modalFitsRef.current,
          keyboardAnchorTop: null,
          transform: modalStyle.transform,
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

  // Sincroniza el modal con el viewport visual, que puede cambiar de tamaño y posición con el teclado.
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      userScrollBeforeKeyboardRef.current = 0;
      isUserDraggingScroll.current = false;
      keyboardOpenRef.current = false;
      isSwitchingInputRef.current = false;
      activeInputRef.current = null;
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
      return;
    }

    diagnosticsRef.current?.clear();
    recordDiagnostic('modal-open');

    // Inicializar o sincronizar altura base del viewport al abrir el modal
    const vvInit = window.visualViewport;
    const currentInitHeight = vvInit ? Math.round(vvInit.height) : window.innerHeight;
    if (baselineHeightRef.current === 0 || currentInitHeight > baselineHeightRef.current) {
      baselineHeightRef.current = currentInitHeight;
    }

    let viewportUpdateFrame: number | null = null;
    let pendingViewportUpdateSource = 'viewport-update';

    const updateMetrics = (source = 'viewport-update') => {
      const vv = window.visualViewport;
      const currentHeight = Math.round(vv?.height ?? window.innerHeight);
      const currentWidth = Math.round(vv?.width ?? window.innerWidth);
      const currentTop = Math.round(vv?.offsetTop ?? 0);
      const currentLeft = Math.round(vv?.offsetLeft ?? 0);
      const previousMetrics = viewportMetricsRef.current;
      const container = scrollContainerRef.current;
      const previousInlineBounds = container ? {
        top: container.style.top,
        left: container.style.left,
        width: container.style.width,
        height: container.style.height,
      } : null;

      // Detección de rotación de pantalla (Directiva 32)
      if (Math.abs(window.innerWidth - lastWindowWidth.current) > 20) {
        lastWindowWidth.current = window.innerWidth;
        baselineHeightRef.current = Math.max(window.innerHeight, currentHeight);
      } else if (!keyboardOpenRef.current && currentHeight > baselineHeightRef.current) {
        // Si el viewport crece más allá de la base conocida (ej. se ocultó barra del navegador o cerró teclado), actualizar base
        baselineHeightRef.current = currentHeight;
      }

      const keyboardHeight = Math.max(0, baselineHeightRef.current - currentHeight);
      const rawKeyboardOpen = keyboardHeight > 80;
      if (rawKeyboardOpen) {
        keyboardOpenRef.current = true;
      } else if (!isSwitchingInputRef.current) {
        keyboardOpenRef.current = false;
        baselineHeightRef.current = Math.max(baselineHeightRef.current, currentHeight);
      }
      const isKeyboard = keyboardOpenRef.current;
      const nextViewportMetrics = getNextViewportMetrics(
        viewportMetricsRef.current,
        { height: currentHeight, width: currentWidth },
        isKeyboard,
        isSwitchingInputRef.current,
      );
      viewportMetricsRef.current = nextViewportMetrics;
      const modalPosition = modalPositionRef.current;
      const previousModalTop = modalPosition?.getBoundingClientRect().top ?? null;
      modalPosition?.getAnimations?.().forEach((animation) => animation.cancel());
      syncVisualViewportBounds(scrollContainerRef.current, {
        top: currentTop,
        left: currentLeft,
        width: nextViewportMetrics.width,
        height: nextViewportMetrics.height,
      });
      animateVerticalPosition(modalPosition, previousModalTop, {
        duration: MOTION_DURATIONS.normal * 1000,
        easing: `cubic-bezier(${MOTION_EASINGS.standard.join(', ')})`,
        prefersReducedMotion: prefersReducedMotion ?? false,
      });
      recordDiagnostic(source, {
        handler: `updateMetrics (from ${source})`,
        visualHeight: currentHeight,
        visualWidth: currentWidth,
        visualTop: currentTop,
        visualLeft: currentLeft,
        keyboardHeight,
        keyboardOpen: isKeyboard,
        windowInnerHeight: window.innerHeight,
        windowScrollY: window.scrollY,
        focusedInputType: document.activeElement instanceof HTMLInputElement
          ? document.activeElement.type
          : document.activeElement instanceof HTMLTextAreaElement
            ? 'textarea'
            : null,
        containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
      });
      const nextViewportMetrics = getNextViewportMetrics(
        viewportMetricsRef.current,
        { height: currentHeight, width: currentWidth },
        isKeyboard,
        isSwitchingInputRef.current,
      );
      viewportMetricsRef.current = nextViewportMetrics;
      syncVisualViewportBounds(scrollContainerRef.current, {
        top: currentTop,
        left: currentLeft,
        width: nextViewportMetrics.width,
        height: nextViewportMetrics.height,
      });
      const nextInlineBounds = scrollContainerRef.current ? {
        top: scrollContainerRef.current.style.top,
        left: scrollContainerRef.current.style.left,
        width: scrollContainerRef.current.style.width,
        height: scrollContainerRef.current.style.height,
      } : null;
      recordDiagnostic('viewport-style-write', {
        handler: 'updateMetrics → syncVisualViewportBounds',
        trigger: source,
        previousHeight: previousMetrics.height,
        nextHeight: nextViewportMetrics.height,
        previousKeyboardOpen: previousMetrics.isKeyboardOpen,
        nextKeyboardOpen: nextViewportMetrics.isKeyboardOpen,
        inlineHeightBefore: previousInlineBounds?.height ?? null,
        inlineHeightAfter: nextInlineBounds?.height ?? null,
        inlineTopBefore: previousInlineBounds?.top ?? null,
        inlineTopAfter: nextInlineBounds?.top ?? null,
      });
      if (!isKeyboard) setKeyboardAnchorTop(null);
      schedulePositionSample(source);
      const metricsUnchanged = previousMetrics.height === nextViewportMetrics.height &&
        previousMetrics.width === nextViewportMetrics.width &&
        previousMetrics.isKeyboardOpen === nextViewportMetrics.isKeyboardOpen;
      recordDiagnostic('react-viewport-state-decision', {
        handler: 'updateMetrics → setViewportMetrics',
        trigger: source,
        decision: metricsUnchanged ? 'skip-render' : 'update-state',
        decisionBasis: 'synchronous viewport metrics ref',
        heightBefore: previousMetrics.height,
        heightAfter: nextViewportMetrics.height,
        keyboardBefore: previousMetrics.isKeyboardOpen,
        keyboardAfter: nextViewportMetrics.isKeyboardOpen,
      });
      setViewportMetrics((previous) => {
        if (previous.height === nextViewportMetrics.height &&
          previous.width === nextViewportMetrics.width &&
          previous.isKeyboardOpen === nextViewportMetrics.isKeyboardOpen) return previous;
        return nextViewportMetrics;
      });

      if (!isKeyboard && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = userScrollBeforeKeyboardRef.current;
      }
    };

    const scheduleViewportUpdate = (source: string) => {
      pendingViewportUpdateSource = source;
      if (viewportUpdateFrame !== null) return;
      viewportUpdateFrame = window.requestAnimationFrame(() => {
        viewportUpdateFrame = null;
        updateMetrics(pendingViewportUpdateSource);
      });
    };
    const onVisualViewportResize = () => scheduleViewportUpdate('visualviewport-resize');
    const onVisualViewportScroll = () => scheduleViewportUpdate('visualviewport-scroll');
    const onWindowScroll = () => scheduleViewportUpdate('window-scroll');
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVisualViewportResize);
      window.visualViewport.addEventListener('scroll', onVisualViewportScroll);
    }
    const onWindowResize = () => scheduleViewportUpdate('window-resize');
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    updateMetrics();

    return () => {
      if (window.visualViewport) {
        // Named handlers are registered below so cleanup removes the exact listeners.
        window.visualViewport.removeEventListener('resize', onVisualViewportResize);
        window.visualViewport.removeEventListener('scroll', onVisualViewportScroll);
      }
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('scroll', onWindowScroll);
      if (viewportUpdateFrame !== null) {
        window.cancelAnimationFrame(viewportUpdateFrame);
        viewportUpdateFrame = null;
      }
      if (diagnosticFrameRef.current !== null) {
        window.cancelAnimationFrame(diagnosticFrameRef.current);
        diagnosticFrameRef.current = null;
      }
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
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
      handler: 'AdaptiveModal viewport/layout effect',
      cause: 'React committed viewportMetrics/modalFits/keyboardAnchorTop',
      modalTop: Math.round(rect.top * 100) / 100,
      modalHeight: Math.round(rect.height * 100) / 100,
      frameTop: Math.round(frameRect.top * 100) / 100,
      containerTop: Math.round(container.getBoundingClientRect().top * 100) / 100,
      containerHeight: container.clientHeight,
      containerScrollTop: container.scrollTop,
      modalFits,
      visualHeight: Math.round(vv?.height ?? window.innerHeight),
      visualTop: Math.round(vv?.offsetTop ?? 0),
      windowScrollY: window.scrollY,
    });
  }, [isOpen, diagnosticsEnabled, modalFits, viewportMetrics]);

  // Incluye el padding del marco al decidir si centrar o permitir scroll desde arriba.
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    const frame = modalFrameRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!modal || !frame || !scrollContainer) return;

    const checkFit = () => {
      const frameStyle = window.getComputedStyle(frame);
      const verticalPadding = Number.parseFloat(frameStyle.paddingTop) +
        Number.parseFloat(frameStyle.paddingBottom);
      const availableHeight = Math.max(0, scrollContainer.clientHeight - verticalPadding);
      recordDiagnostic('fit-check', {
        handler: 'checkFit (ResizeObserver/viewport effect)',
        modalHeight: modal.offsetHeight,
        containerHeight: scrollContainer.clientHeight,
        paddingTop: Number.parseFloat(frameStyle.paddingTop),
        paddingBottom: Number.parseFloat(frameStyle.paddingBottom),
        availableHeight,
        fits: modal.offsetHeight <= availableHeight,
        previousFits: modalFitsRef.current,
        keyboardAnchorTop: null,
        visualHeight: window.visualViewport?.height ?? window.innerHeight,
      });
      setModalFits(modal.offsetHeight <= availableHeight);
    };

    checkFit();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(checkFit) : null;
    observer?.observe(modal);
    observer?.observe(frame);
    observer?.observe(scrollContainer);

    return () => {
      observer?.disconnect();
    };
  }, [isOpen, viewportMetrics.height]);

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
        modalFits,
        keyboardOpen: viewportMetrics.isKeyboardOpen,
        visualHeight: viewport?.height ?? window.innerHeight,
        visualTop: viewport?.offsetTop ?? 0,
      }));
    }

    if (!viewportMetrics.isKeyboardOpen || isUserDraggingScroll.current) {
      userScrollBeforeKeyboardRef.current = container.scrollTop;
    }
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    recordDiagnostic('input-focus', {
      inputType: target instanceof HTMLInputElement ? target.type : target.tagName.toLowerCase(),
      keyboardAlreadyOpen: keyboardOpenRef.current,
      windowScrollY: window.scrollY,
      containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
    });
    schedulePositionSample('input-focus');

    if (keyboardOpenRef.current && activeInputRef.current !== target) {
      isSwitchingInputRef.current = true;
      if (focusSettleTimerRef.current) clearTimeout(focusSettleTimerRef.current);
      focusSettleTimerRef.current = setTimeout(() => {
        isSwitchingInputRef.current = false;
        focusSettleTimerRef.current = null;
      }, 400);
    }
    activeInputRef.current = target;
  };

  const handleInputPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
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
    const nextTarget = event.relatedTarget as HTMLElement | null;
    recordDiagnostic('input-blur', {
      inputType: target instanceof HTMLInputElement ? target.type : target.tagName.toLowerCase(),
      nextTargetTag: nextTarget?.tagName.toLowerCase() ?? null,
      windowScrollY: window.scrollY,
      containerScrollTop: scrollContainerRef.current?.scrollTop ?? null,
    });
    schedulePositionSample('input-blur');
  };

  const frameLayout = getModalFrameLayout(modalFits);

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
          {/* Contenedor sincronizado con el viewport visual sobre el teclado */}
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
            className={`fixed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              modalFits
                ? 'overflow-y-clip overscroll-none'
                : 'overflow-y-auto overscroll-contain touch-pan-y'
            }`}
            data-modal-scroll-container
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: getModalTouchAction(modalFits),
              pointerEvents: 'auto',
            }}
          >
            {/* Contenedor flexible: centrado natural cuando cabe, o alineación superior para scroll fluido */}
            <div
              ref={modalFrameRef}
              className={`w-full min-h-full flex flex-col items-center text-center p-2 sm:p-4 ${
                frameLayout.justifyContent === 'safe center' ? 'justify-center' : 'justify-start'
              }`}
              style={{
                justifyContent: frameLayout.justifyContent,
                paddingTop: frameLayout.paddingTop ?? undefined,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              {/* Tarjeta Modal Flotante */}
              <div ref={modalPositionRef} className="w-full flex justify-center shrink-0">
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

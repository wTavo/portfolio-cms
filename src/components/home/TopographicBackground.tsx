/**
 * @file TopographicBackground.tsx
 * @description Fondo de líneas topográficas dinámicas y curvas de trayectoria profesional
 * con ondulación armónica, halo ambiental y optimización de energía para batería móvil (Directivas 3, 13 y 32).
 */

import { useEffect, useRef } from 'react';

/** Propiedades para el control del ciclo de vida del fondo topográfico */
export interface TopographicBackgroundProps {
  /** Si es true, congela el bucle de animación para ahorrar batería cuando el fondo no es visible */
  isPaused?: boolean;
}

/**
 * Componente de fondo con curvas topográficas y de nivel (Topographic Contour Lines).
 * Representa la trayectoria, relieve y crecimiento profesional mediante líneas fluidas elegantes en el lienzo.
 * Incluye cadencia adaptativa de FPS para móviles, pausa por visibilidad de pestaña y control de reposo.
 *
 * @param props - Propiedades de configuración y control de pausa
 * @returns Elemento JSX con lienzo dinámico y halo ambiental
 */
export default function TopographicBackground({ isPaused = false }: TopographicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Cadencia adaptativa: 30 FPS en móviles para reducir el consumo de GPU/batería en un 50%, 60 FPS en escritorio
    const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
    const targetFps = isMobile ? 30 : 60;
    const fpsInterval = 1000 / targetFps;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Limitar DPR a 2 para máxima nitidez Retina sin sobrecargar la GPU
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Estado reactivo del tema sin consultar el DOM en cada fotograma
    let isDark =
      document.documentElement.getAttribute('data-theme') !== 'light' &&
      (document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const lineCount = 7;
      const segmentCount = 16;
      const t = prefersReduced ? 1000 : time * 0.0006;

      const amp1 = 28;
      const amp2 = 14;
      const amp3 = 18;
      const spread = height * 0.44;

      for (let i = 0; i < lineCount; i++) {
        const progress = i / (lineCount - 1);
        const baseY = height * 0.5 + (progress - 0.5) * spread;

        const alpha = Math.sin(progress * Math.PI) * (isDark ? 0.28 : 0.38) + (isDark ? 0.08 : 0.14);
        const strokeColor = isDark
          ? i % 3 === 0
            ? `rgba(56, 189, 248, ${alpha * 1.25})`
            : i % 3 === 1
            ? `rgba(99, 102, 241, ${alpha * 0.95})`
            : `rgba(224, 242, 254, ${alpha * 0.75})`
          : i % 3 === 0
            ? `rgba(37, 99, 235, ${alpha * 1.35})`
            : i % 3 === 1
            ? `rgba(79, 70, 229, ${alpha * 1.15})`
            : `rgba(100, 116, 139, ${alpha * 0.9})`;

        ctx.beginPath();
        const points: { x: number; y: number }[] = [];

        for (let j = 0; j <= segmentCount; j++) {
          const segProgress = j / segmentCount;
          const x = segProgress * width;

          const wave1 = Math.sin(segProgress * Math.PI * 2.5 + t + i * 0.4) * amp1;
          const wave2 = Math.cos(segProgress * Math.PI * 4 - t * 0.8 + i * 0.25) * amp2;
          const wave3 = Math.sin(segProgress * Math.PI * 1.2 + t * 0.5) * amp3;

          const y = baseY + wave1 + wave2 + wave3;
          points.push({ x, y });
        }

        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 0; j < points.length - 1; j++) {
          const curr = points[j];
          const next = points[j + 1];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = i % 4 === 0 ? (isDark ? 1.5 : 1.7) : (isDark ? 0.9 : 1.15);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    };

    const themeObserver = new MutationObserver(() => {
      const themeAttr = document.documentElement.getAttribute('data-theme');
      isDark = themeAttr === 'dark' || (!themeAttr && window.matchMedia('(prefers-color-scheme: dark)').matches);
      drawFrame(lastTime || 1000);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Redimensionamiento con debouncing y umbral vertical para evitar reasignar búfer GPU al ocultarse la barra URL en móvil
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        // Ignorar variaciones verticales menores a 75px si el ancho no cambió (comportamiento de scroll móvil)
        if (newWidth === width && Math.abs(newHeight - height) < 75) return;

        width = newWidth;
        height = newHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        drawFrame(lastTime || 1000);
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const render = (time: number) => {
      if (isPausedRef.current || prefersReduced) return;

      animationFrameId = requestAnimationFrame(render);

      const delta = time - lastTime;
      if (delta < fpsInterval) return;
      lastTime = time - (delta % fpsInterval);

      drawFrame(time);
    };

    const startAnimation = () => {
      cancelAnimationFrame(animationFrameId);
      if (prefersReduced) {
        drawFrame(1000);
      } else if (!isPausedRef.current && !document.hidden) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      } else {
        drawFrame(lastTime || 1000);
      }
    };

    // Pausa inmediata cuando la pestaña o aplicación móvil pasa a segundo plano
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!isPausedRef.current) {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    startAnimation();

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] pointer-events-none z-0 overflow-hidden select-none bg-[var(--color-bg-base)] transition-colors duration-300"
      aria-hidden="true"
    >
      {/* 1. Halo Ambiental Central con gradiente radial difuso perfectamente centrado detrás del título */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,950px)] h-[min(26dvh,340px)] pointer-events-none opacity-30 dark:opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--color-brand-accent) 0%, rgba(99, 102, 241, 0.12) 35%, rgba(56, 189, 248, 0.03) 60%, transparent 80%)',
        }}
      />

      {/* 2. Lienzo de Curvas Topográficas dinámicas y orgánicas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

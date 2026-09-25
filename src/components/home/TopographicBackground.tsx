/**
 * @file TopographicBackground.tsx
 * @description Fondo de líneas topográficas dinámicas y curvas de trayectoria profesional con ondulación armónica y halo ambiental.
 */

import React, { useEffect, useRef } from 'react';

/**
 * Componente de fondo con curvas topográficas y de nivel (Topographic Contour Lines).
 * Representa la trayectoria, relieve y crecimiento profesional mediante líneas fluidas elegantes en el lienzo.
 */
export default function TopographicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let lastTime = 0;
    const isMobileDevice = window.innerWidth < 768;
    const fpsInterval = 1000 / (isMobileDevice ? 24 : 40);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Estado reactivo del tema sin consultar el DOM en cada fotograma
    let isDark =
      document.documentElement.getAttribute('data-theme') !== 'light' &&
      (document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const themeObserver = new MutationObserver(() => {
      const themeAttr = document.documentElement.getAttribute('data-theme');
      isDark = themeAttr === 'dark' || (!themeAttr && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Pausar renderizado cuando la pestaña esté oculta o en segundo plano
    const handleVisibilityChange = () => {
      isRunning = !document.hidden;
      if (isRunning && !prefersReduced) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const isMobile = width < 768;
    const lineCount = isMobile ? 5 : 7;
    const segmentCount = isMobile ? 10 : 16;

    const render = (time: number) => {
      if (!isRunning) return;

      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(render);
      }

      const delta = time - lastTime;
      if (delta < fpsInterval && !prefersReduced) return;
      lastTime = time - (delta % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      const t = prefersReduced ? 1000 : time * 0.0006;

      for (let i = 0; i < lineCount; i++) {
        const progress = i / (lineCount - 1);
        // Franja vertical central contenida (evita invadir el encabezado y el pie de página)
        const baseY = height * 0.28 + progress * (height * 0.44);

        // Color y transparencia de la curva
        const alpha = Math.sin(progress * Math.PI) * (isDark ? 0.28 : 0.38) + (isDark ? 0.08 : 0.14);
        const strokeColor = isDark
          ? i % 3 === 0
            ? `rgba(56, 189, 248, ${alpha * 1.25})` // Cian acento
            : i % 3 === 1
            ? `rgba(99, 102, 241, ${alpha * 0.95})` // Índigo
            : `rgba(224, 242, 254, ${alpha * 0.75})` // Blanco suave
          : i % 3 === 0
            ? `rgba(37, 99, 235, ${alpha * 1.35})` // Azul vibrante
            : i % 3 === 1
            ? `rgba(79, 70, 229, ${alpha * 1.15})` // Índigo
            : `rgba(100, 116, 139, ${alpha * 0.9})`; // Pizarra

        ctx.beginPath();

        const points: { x: number; y: number }[] = [];

        for (let j = 0; j <= segmentCount; j++) {
          const segProgress = j / segmentCount;
          const x = segProgress * width;

          // Ondulación armónica topográfica fluida y elegante
          const wave1 = Math.sin(segProgress * Math.PI * 2.5 + t + i * 0.4) * 28;
          const wave2 = Math.cos(segProgress * Math.PI * 4 - t * 0.8 + i * 0.25) * 14;
          const wave3 = Math.sin(segProgress * Math.PI * 1.2 + t * 0.5) * 18;

          const y = baseY + wave1 + wave2 + wave3;
          points.push({ x, y });
        }

        // Trazado suave con curvas de Bezier cuadráticas continuas
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

    if (prefersReduced) {
      render(0);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      isRunning = false;
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-[var(--color-bg-base)] transition-colors duration-300"
      aria-hidden="true"
    >
      {/* 1. Halo Ambiental Central con gradiente radial difuso nativo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[650px] pointer-events-none opacity-25 dark:opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--color-brand-accent) 0%, rgba(99, 102, 241, 0.1) 35%, rgba(56, 189, 248, 0.03) 60%, transparent 80%)',
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

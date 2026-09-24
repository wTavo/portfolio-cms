/**
 * @file TopographicBackground.tsx
 * @description Fondo de líneas topográficas y curvas de trayectoria profesional con ondulación fluida y foco ambiental de estudio.
 */

import React, { useEffect, useRef } from 'react';

/**
 * Componente de fondo con curvas topográficas y de nivel (Topographic Contour Lines).
 * Representa la trayectoria, relieve y crecimiento profesional mediante líneas fluidas elegantes en el lienzo oscuro.
 */
export default function TopographicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Configuracion sutilmente ampliada de 11 curvas topograficas (mayor amplitud sin saturar)
    const lineCount = 11;
    const segmentCount = 12;

    const render = (time: number) => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      const t = prefersReduced ? 1000 : time * 0.0005;

      // Dibujar cada linea topografica con distribucion sutilmente mas amplia en el horizonte
      for (let i = 0; i < lineCount; i++) {
        const progress = i / (lineCount - 1);
        const baseY = height * 0.15 + progress * (height * 0.63);

        // Color de la curva con gradiente de transparencia en los bordes
        const alpha = Math.sin(progress * Math.PI) * 0.25 + 0.06;
        const strokeColor =
          i % 3 === 0
            ? `rgba(56, 189, 248, ${alpha * 1.2})` // Cian acento
            : i % 3 === 1
            ? `rgba(99, 102, 241, ${alpha * 0.9})` // Indigo
            : `rgba(224, 242, 254, ${alpha * 0.7})`; // Blanco suave

        ctx.beginPath();

        const points: { x: number; y: number }[] = [];

        for (let j = 0; j <= segmentCount; j++) {
          const segProgress = j / segmentCount;
          const x = segProgress * width;

          // Ondulacion armonica topografica autonoma y serena
          const wave1 = Math.sin(segProgress * Math.PI * 2.5 + t + i * 0.35) * 35;
          const wave2 = Math.cos(segProgress * Math.PI * 4 - t * 0.8 + i * 0.2) * 18;
          const wave3 = Math.sin(segProgress * Math.PI * 1.2 + t * 0.5) * 22;

          const y = baseY + wave1 + wave2 + wave3;
          points.push({ x, y });
        }

        // Trazado suave con curvas de Bezier cubicas
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
        ctx.lineWidth = i % 4 === 0 ? 1.4 : 0.85;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReduced) {
      render(0);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-[var(--color-bg-base)]"
      aria-hidden="true"
    >
      {/* 1. Halo Ambiental de Exhibicion Central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.13) 0%, rgba(99, 102, 241, 0.05) 48%, transparent 75%)',
          filter: 'blur(55px)',
        }}
      />

      {/* 2. Lienzo de Curvas de Trayectoria Topografica */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          maskImage:
            'radial-gradient(ellipse 86% 68% at 50% 48%, #000 38%, rgba(0,0,0,0.5) 72%, transparent 96%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 86% 68% at 50% 48%, #000 38%, rgba(0,0,0,0.5) 72%, transparent 96%)',
        }}
      />
    </div>
  );
}

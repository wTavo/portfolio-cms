/**
 * @file CosmicBackground.tsx
 * @description Fondo cósmico infinito con cometas continuos claramente visibles y campo estelar multicapa con destellos de difracción.
 */

import React, { useEffect, useRef } from 'react';

/** Estructura de datos para un cometa distante */
interface DistantComet {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number; // Radianes de trayectoria
  thickness: number;
  opacity: number;
  hue: string; // Color base (#38BDF8, #818CF8, #38E0E8)
  sparks: { offset: number; drift: number; size: number }[];
  active: boolean;
  cooldown: number;
}

/** Estructura de datos para estrellas del campo cósmico */
interface CosmicStar {
  x: number;
  y: number;
  radius: number;
  type: 'micro' | 'gleam' | 'flare';
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  flareSize: number;
  color: string;
}

/**
 * Componente de fondo cósmico perpetuo con estrellas y cometas continuos.
 * Se sitúa en la capa base (z-0) asegurando máxima visibilidad sobre el fondo oscuro sin interferir con el contenido interactivo.
 */
export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    // Respetar directiva de accesibilidad para movimiento reducido
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 1. Generar Campo Estelar Galáctico Multicapa (160 estrellas)
    const starCount = 160;
    const stars: CosmicStar[] = Array.from({ length: starCount }, (_, i) => {
      // 8 estrellas destacadas con destellos en cruz de difracción
      const isFlare = i < 8;
      // 45 estrellas medianas brillantes
      const isGleam = !isFlare && i < 53;

      let type: CosmicStar['type'] = 'micro';
      let radius = Math.random() * 0.9 + 0.5;
      let baseAlpha = Math.random() * 0.45 + 0.25;
      let flareSize = 0;
      let color = 'rgba(224, 242, 254, '; // Blanco celeste por defecto

      if (isFlare) {
        type = 'flare';
        radius = Math.random() * 1.2 + 2.2;
        baseAlpha = Math.random() * 0.3 + 0.7;
        flareSize = Math.random() * 6 + 10;
        color = Math.random() > 0.5 ? 'rgba(255, 255, 255, ' : 'rgba(186, 230, 253, ';
      } else if (isGleam) {
        type = 'gleam';
        radius = Math.random() * 0.9 + 1.3;
        baseAlpha = Math.random() * 0.35 + 0.5;
        color = Math.random() > 0.3 ? 'rgba(224, 242, 254, ' : 'rgba(199, 210, 254, ';
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        type,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        phase: Math.random() * Math.PI * 2,
        flareSize,
        color,
      };
    });

    // 2. Generador de Cometas Distantes
    const createDistantComet = (initialSpawn = false): DistantComet => {
      // Ángulo diagonal natural espacial (entre 30° y 55°)
      const angle = (Math.PI / 180) * (30 + Math.random() * 25);
      const isCyan = Math.random() > 0.35;
      const hue = isCyan ? '#38BDF8' : '#818CF8';

      // Posición inicial: si es inicio, dispersar por la pantalla; si es reciclaje, arriba/afuera
      let startX: number;
      let startY: number;

      if (initialSpawn) {
        startX = Math.random() * width;
        startY = Math.random() * height * 0.7;
      } else {
        startX = Math.random() * (width + 300) - 150;
        startY = -60 - Math.random() * 100;
      }

      const sparkCount = Math.floor(Math.random() * 4) + 2;
      const sparks = Array.from({ length: sparkCount }, () => ({
        offset: Math.random() * 0.7 + 0.15, // Porcentaje a lo largo de la cola
        drift: (Math.random() - 0.5) * 6, // Separación lateral
        size: Math.random() * 1.5 + 0.8,
      }));

      return {
        x: startX,
        y: startY,
        length: Math.random() * 90 + 110, // 110px a 200px
        speed: Math.random() * 3.5 + 4.2, // Velocidad continua y fluida
        angle,
        thickness: Math.random() * 1.4 + 1.8,
        opacity: Math.random() * 0.25 + 0.7, // Alta visibilidad (0.70 a 0.95)
        hue,
        sparks,
        active: true,
        cooldown: 0,
      };
    };

    // 4 cometas activos en rotación continua y escalonada
    const comets: DistantComet[] = [
      createDistantComet(true),
      { ...createDistantComet(true), x: width * 0.65, y: height * 0.2 },
      { ...createDistantComet(true), x: width * 0.25, y: height * 0.45 },
      { ...createDistantComet(false), cooldown: 40 },
    ];

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isRunning) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- DIBUJAR CAMPO ESTELAR ---
      stars.forEach((star) => {
        if (!prefersReduced) {
          star.phase += star.twinkleSpeed;
        }
        const currentAlpha = Math.max(
          0.1,
          Math.min(1, star.baseAlpha + Math.sin(star.phase) * 0.28)
        );

        // Núcleo de la estrella
        ctx.fillStyle = `${star.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Destello en cruz de 4 puntas para estrellas de tipo 'flare'
        if (star.type === 'flare') {
          const flareAlpha = currentAlpha * 0.75;
          ctx.strokeStyle = `${star.color}${flareAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Rayo horizontal
          ctx.moveTo(star.x - star.flareSize, star.y);
          ctx.lineTo(star.x + star.flareSize, star.y);
          // Rayo vertical
          ctx.moveTo(star.x, star.y - star.flareSize);
          ctx.lineTo(star.x, star.y + star.flareSize);
          ctx.stroke();

          // Halo concéntrico suave
          ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- DIBUJAR COMETAS PERPETUOS CONTINUOS ---
      if (!prefersReduced) {
        comets.forEach((comet) => {
          if (!comet.active) {
            comet.cooldown -= dt * 60;
            if (comet.cooldown <= 0) {
              const fresh = createDistantComet(false);
              Object.assign(comet, fresh);
            }
            return;
          }

          // Avanzar posición del cometa
          const vx = Math.cos(comet.angle) * comet.speed;
          const vy = Math.sin(comet.angle) * comet.speed;
          comet.x += vx;
          comet.y += vy;

          const tailX = comet.x - Math.cos(comet.angle) * comet.length;
          const tailY = comet.y - Math.sin(comet.angle) * comet.length;

          // 1. Estela ancha difusa exterior (Halo de plasma)
          const outerGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
          outerGrad.addColorStop(0, `rgba(56, 189, 248, ${comet.opacity * 0.6})`);
          outerGrad.addColorStop(0.4, `rgba(14, 165, 233, ${comet.opacity * 0.35})`);
          outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = comet.thickness * 3.8;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 2. Haz interior incandescente nítido
          const coreGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.opacity})`);
          coreGrad.addColorStop(0.3, `rgba(224, 242, 254, ${comet.opacity * 0.85})`);
          coreGrad.addColorStop(0.7, `${comet.hue}66`);
          coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = comet.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 3. Halo y Núcleo brillante
          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.thickness * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${comet.opacity * 0.5})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.thickness * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, comet.opacity * 1.2)})`;
          ctx.fill();

          // 4. Micro-chispas a lo largo de la estela
          const perpAngle = comet.angle + Math.PI / 2;
          comet.sparks.forEach((spark) => {
            const spX =
              comet.x -
              Math.cos(comet.angle) * (comet.length * spark.offset) +
              Math.cos(perpAngle) * spark.drift;
            const spY =
              comet.y -
              Math.sin(comet.angle) * (comet.length * spark.offset) +
              Math.sin(perpAngle) * spark.drift;

            ctx.beginPath();
            ctx.arc(spX, spY, spark.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(224, 242, 254, ${comet.opacity * 0.75})`;
            ctx.fill();
          });

          // 5. Reciclaje al salir del viewport
          if (comet.x > width + 250 || comet.y > height + 250) {
            comet.active = false;
            // Cooldown casi instantáneo (15 a 50 frames, ~0.25s a 0.8s) para flujo perpetuo
            comet.cooldown = Math.random() * 35 + 15;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none"
      aria-hidden="true"
    />
  );
}

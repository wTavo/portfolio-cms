/**
 * @file CosmicBackground.tsx
 * @description Fondo cósmico infinito con cometas distantes de vuelo majestuoso y campo estelar natural con titileo orgánico.
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
  hue: string; // Color base (#38BDF8, #818CF8)
  sparks: { offset: number; drift: number; size: number }[];
  active: boolean;
  cooldown: number;
}

/** Estructura de datos para estrellas del campo cósmico */
interface CosmicStar {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
  hasSoftGlow: boolean;
}

/**
 * Componente de fondo cósmico perpetuo con estrellas naturales y cometas de navegación pausada.
 * Se sitúa en la capa base (z-0) asegurando máxima visibilidad sobre el fondo oscuro sin interferir con el contenido.
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

    // 1. Campo Estelar Natural y Orgánico (170 estrellas esféricas puras)
    const starCount = 170;
    const stars: CosmicStar[] = Array.from({ length: starCount }, (_, i) => {
      // Distribución natural de tamaños y luminosidad
      const isBright = i < 18; // 18 estrellas más luminosas con halo difuso suave
      const isMedium = !isBright && i < 65; // Estrellas medianas

      let radius = Math.random() * 0.7 + 0.4; // 0.4px a 1.1px (polvo estelar)
      let baseAlpha = Math.random() * 0.4 + 0.2;
      let hasSoftGlow = false;

      // Variación sutil de color astronómico (blanco puro, celeste hielo o índigo suave)
      const colorRoll = Math.random();
      const color =
        colorRoll > 0.6
          ? 'rgba(255, 255, 255, '
          : colorRoll > 0.25
          ? 'rgba(224, 242, 254, '
          : 'rgba(199, 210, 254, ';

      if (isBright) {
        radius = Math.random() * 0.8 + 1.6; // 1.6px a 2.4px
        baseAlpha = Math.random() * 0.25 + 0.7;
        hasSoftGlow = true;
      } else if (isMedium) {
        radius = Math.random() * 0.5 + 1.1; // 1.1px a 1.6px
        baseAlpha = Math.random() * 0.3 + 0.45;
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.02 + 0.006,
        phase: Math.random() * Math.PI * 2,
        color,
        hasSoftGlow,
      };
    });

    // 2. Generador de Cometas Distantes con Vuelo Pausado y Sereno
    const createDistantComet = (initialSpawn = false): DistantComet => {
      // Ángulo diagonal suave (entre 32° y 48°)
      const angle = (Math.PI / 180) * (32 + Math.random() * 16);
      const isCyan = Math.random() > 0.35;
      const hue = isCyan ? '#38BDF8' : '#818CF8';

      let startX: number;
      let startY: number;

      if (initialSpawn) {
        startX = Math.random() * width;
        startY = Math.random() * height * 0.7;
      } else {
        startX = Math.random() * (width + 400) - 200;
        startY = -80 - Math.random() * 120;
      }

      const sparkCount = Math.floor(Math.random() * 4) + 2;
      const sparks = Array.from({ length: sparkCount }, () => ({
        offset: Math.random() * 0.65 + 0.2, // Distancia en la estela
        drift: (Math.random() - 0.5) * 5,
        size: Math.random() * 1.2 + 0.7,
      }));

      return {
        x: startX,
        y: startY,
        length: Math.random() * 80 + 130, // 130px a 210px de cola estilizada
        speed: Math.random() * 0.7 + 1.1, // Velocidad pausada y majestuosa (1.1 a 1.8 px/frame)
        angle,
        thickness: Math.random() * 1.2 + 1.6,
        opacity: Math.random() * 0.25 + 0.7, // Alta nitidez sobre fondo oscuro
        hue,
        sparks,
        active: true,
        cooldown: 0,
      };
    };

    // 3 cometas activos navegando simultáneamente a ritmo relajado
    const comets: DistantComet[] = [
      createDistantComet(true),
      { ...createDistantComet(true), x: width * 0.7, y: height * 0.25 },
      { ...createDistantComet(true), x: width * 0.3, y: height * 0.55 },
    ];

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isRunning) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- DIBUJAR CAMPO ESTELAR NATURAL ---
      stars.forEach((star) => {
        if (!prefersReduced) {
          star.phase += star.twinkleSpeed;
        }
        const currentAlpha = Math.max(
          0.1,
          Math.min(1, star.baseAlpha + Math.sin(star.phase) * 0.25)
        );

        // Halo suave difuso para estrellas destacadas (sin líneas ni cruces artificiales)
        if (star.hasSoftGlow) {
          ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha * 0.2})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Punto de luz esférico puro
        ctx.fillStyle = `${star.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- DIBUJAR COMETAS DISTANTES SERENOS ---
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

          // Desplazamiento pausado y majestuoso
          const vx = Math.cos(comet.angle) * comet.speed;
          const vy = Math.sin(comet.angle) * comet.speed;
          comet.x += vx;
          comet.y += vy;

          const tailX = comet.x - Math.cos(comet.angle) * comet.length;
          const tailY = comet.y - Math.sin(comet.angle) * comet.length;

          // 1. Estela exterior difusa de polvo/plasma
          const outerGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
          outerGrad.addColorStop(0, `rgba(56, 189, 248, ${comet.opacity * 0.55})`);
          outerGrad.addColorStop(0.35, `rgba(14, 165, 233, ${comet.opacity * 0.3})`);
          outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = comet.thickness * 3.5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 2. Haz interior incandescente blanco/celeste
          const coreGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.opacity})`);
          coreGrad.addColorStop(0.25, `rgba(224, 242, 254, ${comet.opacity * 0.85})`);
          coreGrad.addColorStop(0.65, `${comet.hue}66`);
          coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = comet.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 3. Resplandor y Núcleo del cometa
          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.thickness * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${comet.opacity * 0.45})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.thickness * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, comet.opacity * 1.15)})`;
          ctx.fill();

          // 4. Micro-partículas desprendidas en la estela
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
            ctx.fillStyle = `rgba(224, 242, 254, ${comet.opacity * 0.7})`;
            ctx.fill();
          });

          // 5. Salida del viewport y reinicio
          if (comet.x > width + 250 || comet.y > height + 250) {
            comet.active = false;
            // Cooldown de 20 a 60 frames (~0.3s a 1s) para reingreso continuo
            comet.cooldown = Math.random() * 40 + 20;
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

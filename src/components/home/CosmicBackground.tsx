/**
 * @file CosmicBackground.tsx
 * @description Fondo cósmico infinito con cometas distantes continuos y campo de estrellas en perspectiva profunda.
 */

import React, { useEffect, useRef } from 'react';

interface DistantComet {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number; // en radianes
  thickness: number;
  opacity: number;
  hue: string; // color del plasma lejano
  active: boolean;
  cooldown: number;
}

interface DistantStar {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

/**
 * Componente de fondo espacial vivo con cometas en perspectiva distante.
 * Funciona de manera perpetua e independiente, ambientando la escena sin interferir con las letras.
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

    // Comprobar preferencia de movimiento reducido
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 1. Inicializar Campo de Estrellas Lejanas
    const starCount = 55;
    const stars: DistantStar[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.4,
      baseAlpha: Math.random() * 0.4 + 0.15,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      phase: Math.random() * Math.PI * 2,
    }));

    // 2. Inicializar Cometas de Fondo Distantes
    const createDistantComet = (): DistantComet => {
      // Ángulo diagonal espacial (entre 30° y 55°)
      const angle = (Math.PI / 180) * (35 + Math.random() * 20);
      return {
        x: Math.random() * (width + 300) - 100,
        y: -100 - Math.random() * 200,
        length: Math.random() * 90 + 70, // 70px a 160px
        speed: Math.random() * 4 + 3.5, // Velocidad elegante
        angle,
        thickness: Math.random() * 1.2 + 0.8,
        opacity: Math.random() * 0.35 + 0.2, // Sutil para perspectiva lejana
        hue: Math.random() > 0.4 ? '#38BDF8' : '#818CF8', // Tonos cian o índigo
        active: true,
        cooldown: 0,
      };
    };

    // Mantener de 2 a 3 cometas distantes en rotación continua
    const comets: DistantComet[] = [
      { ...createDistantComet(), x: width * 0.3, y: height * 0.1, cooldown: 0 },
      { ...createDistantComet(), x: width * 0.7, y: -50, cooldown: 120 },
      { ...createDistantComet(), x: width * 0.1, y: -150, cooldown: 280 },
    ];

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isRunning) return;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Dibujar estrellas lejanas con brillo sutil
      stars.forEach((star) => {
        if (!prefersReduced) {
          star.phase += star.twinkleSpeed;
        }
        const alpha = star.baseAlpha + Math.sin(star.phase) * 0.15;
        ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0.05, Math.min(0.7, alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Si hay reducción de movimiento, no animar cometas
      if (!prefersReduced) {
        // Actualizar y dibujar cometas lejanos
        comets.forEach((comet) => {
          if (!comet.active) {
            comet.cooldown -= dt * 60;
            if (comet.cooldown <= 0) {
              const fresh = createDistantComet();
              Object.assign(comet, fresh);
            }
            return;
          }

          // Movimiento del cometa
          const vx = Math.cos(comet.angle) * comet.speed;
          const vy = Math.sin(comet.angle) * comet.speed;

          comet.x += vx;
          comet.y += vy;

          // Calcular cola
          const tailX = comet.x - Math.cos(comet.angle) * comet.length;
          const tailY = comet.y - Math.sin(comet.angle) * comet.length;

          // Dibujar estela gradiente
          const grad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${comet.opacity})`);
          grad.addColorStop(0.3, `${comet.hue}${Math.round(comet.opacity * 0.8 * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = comet.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Núcleo minúsculo brillante
          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.thickness * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, comet.opacity * 1.5)})`;
          ctx.fill();

          // Comprobar salida del viewport
          if (comet.x > width + 200 || comet.y > height + 200) {
            comet.active = false;
            // Cooldown aleatorio entre 90 y 240 frames (~1.5s a 4s)
            comet.cooldown = Math.random() * 150 + 90;
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
      className="fixed inset-0 w-full h-full pointer-events-none -z-20 select-none opacity-85"
      aria-hidden="true"
    />
  );
}

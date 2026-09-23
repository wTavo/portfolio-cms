/**
 * @file comet.renderer.test.ts
 * @description Pruebas unitarias para el motor de renderizado astronómico de cometas y física orbital.
 */

import { describe, it, expect } from 'vitest';
import {
  createCelestialTrajectory,
  evaluateTrajectory,
  initCometState,
  updateCometPhysics,
  calculateLetterIllumination,
} from '../../src/lib/canvas/cometRenderer';

describe('cometRenderer - Física y Cinemática de Cometas', () => {
  it('genera trayectorias orbitales celestiales válidas para todos los modos', () => {
    const winW = 1920;
    const winH = 1080;
    const centerY = 500;
    const titleH = 200;

    for (let mode = 0; mode < 3; mode++) {
      const traj = createCelestialTrajectory(mode, winW, winH, centerY, titleH);
      expect(traj.p0.x).toBeLessThan(0);
      expect(traj.p2.x).toBeGreaterThan(winW);
      expect(traj.speed).toBeGreaterThan(0.001);
      expect(traj.speed).toBeLessThan(0.01);
    }
  });

  it('evalúa puntos en la curva de Bézier con cálculo de ángulo tangencial preciso', () => {
    const traj = {
      p0: { x: 0, y: 0 },
      p1: { x: 500, y: 250 },
      p2: { x: 1000, y: 0 },
      speed: 0.005,
    };

    const start = evaluateTrajectory(traj, 0);
    expect(start.x).toBe(0);
    expect(start.y).toBe(0);
    expect(start.angle).toBeCloseTo(Math.atan2(250, 500), 2);

    const mid = evaluateTrajectory(traj, 0.5);
    expect(mid.x).toBe(500);
    expect(mid.y).toBe(125);

    const end = evaluateTrajectory(traj, 1);
    expect(end.x).toBe(1000);
    expect(end.y).toBe(0);
  });

  it('inicializa el estado del cometa correctamente con progreso inicial en cero', () => {
    const traj = createCelestialTrajectory(0, 1200, 800, 400, 160);
    const state = initCometState(traj);

    expect(state.progress).toBe(0);
    expect(state.spine).toEqual([]);
    expect(state.particles).toEqual([]);
    expect(state.maxSpineLength).toBeGreaterThan(50);
  });

  it('actualiza la física del cometa incrementando progreso y poblando la espina histórica', () => {
    const traj = createCelestialTrajectory(0, 1200, 800, 400, 160);
    const state = initCometState(traj);

    updateCometPhysics(state, 1000);
    expect(state.progress).toBeGreaterThan(0);
    expect(state.spine.length).toBe(1);

    // Múltiples pasos de física
    for (let i = 0; i < 20; i++) {
      updateCometPhysics(state, 1000 + i * 16);
    }
    expect(state.spine.length).toBe(21);
    expect(state.spine[0].time).toBe(1000 + 19 * 16);
  });

  it('calcula la iluminación proyectada sobre letras según la cercanía a la cabeza o la estela', () => {
    const headX = 300;
    const headY = 400;
    const spine = [
      { x: 300, y: 400, angle: 0, speed: 0.003, time: 0 },
      { x: 250, y: 400, angle: 0, speed: 0.003, time: 0 },
      { x: 200, y: 400, angle: 0, speed: 0.003, time: 0 },
      { x: 150, y: 400, angle: 0, speed: 0.003, time: 0 },
    ];

    // Letra muy cercana a la cabeza
    const directHit = calculateLetterIllumination(headX, headY, spine, 305, 405, 240);
    expect(directHit).toBeGreaterThan(0.8);

    // Letra cercana a la estela
    const spineHit = calculateLetterIllumination(headX, headY, spine, 210, 420, 240);
    expect(spineHit).toBeGreaterThan(0.5);

    // Letra fuera de alcance
    const outOfRange = calculateLetterIllumination(headX, headY, spine, 900, 900, 240);
    expect(outOfRange).toBe(0);
  });
});

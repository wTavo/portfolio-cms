/**
 * @file cometRenderer.ts
 * @description Motor de renderizado astronómico para cometas cósmicos realistas en Canvas 2D.
 * Implementa una estela vaporosa y difuminada mediante filtrado de desenfoque gaussiano por GPU
 * (ctx.filter = 'blur(...)') eliminando escalonamientos, contornos y líneas rígidas, combinado con
 * un núcleo incandescente óptico de alta fidelidad.
 */

/**
 * Punto de registro histórico para el rastro de la espina del cometa.
 */
export interface CometSpinePoint {
  x: number;
  y: number;
  angle: number;
  speed: number;
  time: number;
}

/**
 * Partícula de polvo cósmico desprendida en la estela.
 */
export interface CometDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  hue: string;
}

/**
 * Configuración de la trayectoria parabólica/orbital del cometa.
 */
export interface CometTrajectory {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  speed: number;
}

/**
 * Estado interno de una instancia de cometa activo.
 */
export interface CometState {
  trajectory: CometTrajectory;
  progress: number;
  spine: CometSpinePoint[];
  particles: CometDustParticle[];
  maxSpineLength: number;
  headX: number;
  headY: number;
  angle: number;
  speed: number;
}

/**
 * Genera una trayectoria orbital celestial suave basada en curvas de Bézier cuadráticas.
 *
 * @param index Índice correlativo del ciclo para alternar trayectorias.
 * @param winW Ancho actual de la ventana.
 * @param winH Alto actual de la ventana.
 * @param titleCenterY Coordenada Y del centro geométrico del bloque de título.
 * @param titleHeight Altura aproximada del bloque de título.
 * @returns Configuración completa de la trayectoria.
 */
export function createCelestialTrajectory(
  index: number,
  winW: number,
  winH: number,
  titleCenterY: number,
  titleHeight: number
): CometTrajectory {
  const mode = index % 3;
  const paddingX = 400;

  if (mode === 0) {
    // Trayectoria 1: Arco descendente majestuoso que barre de izquierda superior a derecha inferior
    return {
      p0: { x: -paddingX, y: titleCenterY - titleHeight * 1.35 },
      p1: { x: winW * 0.45, y: titleCenterY - titleHeight * 0.15 },
      p2: { x: winW + paddingX, y: titleCenterY + titleHeight * 1.4 },
      speed: 0.0026,
    };
  }

  if (mode === 1) {
    // Trayectoria 2: Arco ascendente suave que atraviesa la base y asciende por la cima
    return {
      p0: { x: -paddingX, y: titleCenterY + titleHeight * 1.3 },
      p1: { x: winW * 0.52, y: titleCenterY + titleHeight * 0.1 },
      p2: { x: winW + paddingX, y: titleCenterY - titleHeight * 1.25 },
      speed: 0.0028,
    };
  }

  // Trayectoria 3: Vuelo rasante central con leve inflexión gravitacional
  return {
    p0: { x: -paddingX, y: titleCenterY - titleHeight * 0.4 },
    p1: { x: winW * 0.48, y: titleCenterY + titleHeight * 0.45 },
    p2: { x: winW + paddingX, y: titleCenterY - titleHeight * 0.2 },
    speed: 0.0027,
  };
}

/**
 * Calcula la posición y ángulo en la curva de Bézier para un valor de progreso t.
 *
 * @param traj Trayectoria definida por 3 puntos de control.
 * @param t Progreso normalizado [0, 1].
 * @returns Posición {x, y} y ángulo de avance en radianes.
 */
export function evaluateTrajectory(
  traj: CometTrajectory,
  t: number
): { x: number; y: number; angle: number } {
  const { p0, p1, p2 } = traj;
  const invT = 1 - t;

  const x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
  const y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;

  // Derivada de primer orden (vector velocidad tangencial)
  const dx = 2 * invT * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * invT * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const angle = Math.atan2(dy, dx);

  return { x, y, angle };
}

/**
 * Inicializa un nuevo estado para el cometa cósmico.
 *
 * @param trajectory Trayectoria que recorrerá el cometa.
 * @returns Estado inicial del cometa.
 */
export function initCometState(trajectory: CometTrajectory): CometState {
  const initial = evaluateTrajectory(trajectory, 0);
  return {
    trajectory,
    progress: 0,
    spine: [],
    particles: [],
    maxSpineLength: 160,
    headX: initial.x,
    headY: initial.y,
    angle: initial.angle,
    speed: trajectory.speed,
  };
}

/**
 * Actualiza la física del cometa, posición, espina histórica y partículas.
 *
 * @param state Estado actual del cometa.
 * @param timestamp Marca de tiempo actual para oscilaciones.
 */
export function updateCometPhysics(state: CometState, timestamp: number): void {
  state.progress += state.speed;

  const pos = evaluateTrajectory(state.trajectory, state.progress);
  state.headX = pos.x;
  state.headY = pos.y;
  state.angle = pos.angle;

  // Registrar posición actual en la espina histórica
  state.spine.unshift({
    x: pos.x,
    y: pos.y,
    angle: pos.angle,
    speed: state.speed,
    time: timestamp,
  });

  if (state.spine.length > state.maxSpineLength) {
    state.spine.pop();
  }

  // Generar desprendimiento sutil de micro-polvo etéreo en la estela
  if (state.progress < 1.15 && Math.random() < 0.22) {
    const normal = pos.angle + Math.PI / 2;
    const spread = (Math.random() - 0.5) * 16;
    const trailAngle = pos.angle + Math.PI + (Math.random() - 0.5) * 0.15;
    const pSpeed = 0.2 + Math.random() * 1.0;

    state.particles.push({
      x: pos.x + Math.cos(normal) * spread,
      y: pos.y + Math.sin(normal) * spread,
      vx: Math.cos(trailAngle) * pSpeed,
      vy: Math.sin(trailAngle) * pSpeed,
      alpha: 0.5 + Math.random() * 0.25,
      size: 0.8 + Math.random() * 1.4,
      life: 0,
      maxLife: 35 + Math.random() * 30,
      hue: Math.random() > 0.4 ? '240, 249, 255' : '186, 230, 253',
    });
  }

  // Actualizar partículas activas
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    if (p.life >= p.maxLife) {
      state.particles.splice(i, 1);
    }
  }
}

/**
 * Renderiza el cometa cósmico con estela difuminada (blur gaussiano) y núcleo óptico estelar.
 *
 * @param ctx Contexto de renderizado 2D de Canvas.
 * @param state Estado actual del cometa.
 */
export function renderAstronomicalComet(
  ctx: CanvasRenderingContext2D,
  state: CometState
): void {
  const spine = state.spine;
  if (spine.length < 3) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const spineLen = spine.length;
  const head = spine[0];
  const tailEnd = spine[spineLen - 1];

  // =========================================================================
  // 1. ESTELA PROFUNDAMENTE DIFUMINADA (SIN LÍNEAS, SIN CAPAS RÍGIDAS NI ESCALONES)
  // Se emplea desenfoque gaussiano por GPU (ctx.filter = 'blur(...)') para
  // disolver todo contorno en una niebla celestial continua y suave.
  // =========================================================================

  // --- CAPA A: Velo exterior ultra difuso (blur 26px) ---
  ctx.filter = 'blur(26px)';
  ctx.beginPath();

  // Lado izquierdo del velo
  for (let i = 0; i < spineLen; i++) {
    const pt = spine[i];
    const t = i / (spineLen - 1);
    // Expansión suave y ahusamiento al final
    const profile = (1 - t * 0.85) * (Math.pow(t, 0.4) * 2.0 + 0.15);
    const width = 14 + profile * 72;
    const normal = pt.angle + Math.PI / 2;
    const px = pt.x + Math.cos(normal) * width;
    const py = pt.y + Math.sin(normal) * width;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  // Lado derecho del velo en reversa
  for (let i = spineLen - 1; i >= 0; i--) {
    const pt = spine[i];
    const t = i / (spineLen - 1);
    const profile = (1 - t * 0.85) * (Math.pow(t, 0.4) * 2.0 + 0.15);
    const width = 14 + profile * 72;
    const normal = pt.angle - Math.PI / 2;
    const px = pt.x + Math.cos(normal) * width;
    const py = pt.y + Math.sin(normal) * width;

    ctx.lineTo(px, py);
  }
  ctx.closePath();

  const outerGrad = ctx.createLinearGradient(head.x, head.y, tailEnd.x, tailEnd.y);
  outerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.48)');
  outerGrad.addColorStop(0.15, 'rgba(224, 242, 254, 0.38)');
  outerGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.20)');
  outerGrad.addColorStop(0.78, 'rgba(147, 197, 253, 0.05)');
  outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // --- CAPA B: Cuerpo medio sedoso difuminado (blur 14px) ---
  ctx.filter = 'blur(14px)';
  const midLen = Math.floor(spineLen * 0.72);
  if (midLen > 2) {
    ctx.beginPath();
    for (let i = 0; i < midLen; i++) {
      const pt = spine[i];
      const t = i / (midLen - 1);
      const width = 10 + Math.sin(t * Math.PI) * 36;
      const normal = pt.angle + Math.PI / 2;
      const px = pt.x + Math.cos(normal) * width;
      const py = pt.y + Math.sin(normal) * width;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = midLen - 1; i >= 0; i--) {
      const pt = spine[i];
      const t = i / (midLen - 1);
      const width = 10 + Math.sin(t * Math.PI) * 36;
      const normal = pt.angle - Math.PI / 2;
      const px = pt.x + Math.cos(normal) * width;
      const py = pt.y + Math.sin(normal) * width;

      ctx.lineTo(px, py);
    }
    ctx.closePath();

    const midGrad = ctx.createLinearGradient(head.x, head.y, spine[midLen - 1].x, spine[midLen - 1].y);
    midGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    midGrad.addColorStop(0.25, 'rgba(224, 242, 254, 0.45)');
    midGrad.addColorStop(0.65, 'rgba(186, 230, 253, 0.16)');
    midGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
    ctx.fillStyle = midGrad;
    ctx.fill();
  }

  // --- CAPA C: Núcleo de gas incandescente difuminado (blur 8px, sin líneas duras ni varas rígidas) ---
  ctx.filter = 'blur(8px)';
  const jetLen = Math.floor(spineLen * 0.42);
  if (jetLen > 2) {
    ctx.beginPath();
    for (let i = 0; i < jetLen; i++) {
      const pt = spine[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }

    const jetGrad = ctx.createLinearGradient(head.x, head.y, spine[jetLen - 1].x, spine[jetLen - 1].y);
    jetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    jetGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.55)');
    jetGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = jetGrad;
    ctx.stroke();
  }

  // --- MICRO-POLVO DIFUSO ---
  ctx.filter = 'blur(1.5px)';
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue}, ${p.alpha * 0.45})`;
    ctx.fill();
  }

  // =========================================================================
  // 2. RESTABLECER FILTRO PARA EL NÚCLEO NÍTIDO E INCANDESCENTE (VALIDADO)
  // =========================================================================
  ctx.filter = 'none';

  // COMA PARABÓLICA (ATMÓSFERA CELESTIAL DE GAS)
  const hx = state.headX;
  const hy = state.headY;
  const comaRadius = 55;

  const comaGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, comaRadius);
  comaGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  comaGrad.addColorStop(0.15, 'rgba(240, 249, 255, 0.92)');
  comaGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.45)');
  comaGrad.addColorStop(0.65, 'rgba(147, 197, 253, 0.15)');
  comaGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');

  ctx.beginPath();
  ctx.arc(hx, hy, comaRadius, 0, Math.PI * 2);
  ctx.fillStyle = comaGrad;
  ctx.fill();

  // NÚCLEO INCANDESCENTE ÓPTICO NATURAL (AIRY DISC NATURAL, EXACTO AL VALIDADO)
  const nucleusRadius = 22;
  const nucleusGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, nucleusRadius);
  nucleusGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  nucleusGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.9)');
  nucleusGrad.addColorStop(0.7, 'rgba(224, 242, 254, 0.4)');
  nucleusGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

  ctx.beginPath();
  ctx.arc(hx, hy, nucleusRadius, 0, Math.PI * 2);
  ctx.fillStyle = nucleusGrad;
  ctx.fill();

  // Punto central estelar ultra brillante
  ctx.beginPath();
  ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 18;
  ctx.fill();

  ctx.restore();
}

/**
 * Calcula la intensidad de iluminación proyectada sobre una letra del molde.
 *
 * @param headX Coordenada X de la cabeza del cometa.
 * @param headY Coordenada Y de la cabeza del cometa.
 * @param spine Espina histórica de la estela.
 * @param letterX Coordenada X de la letra.
 * @param letterY Coordenada Y de la letra.
 * @param beamRadius Radio máximo de alcance de la iluminación.
 * @returns Intensidad normalizada [0, 1].
 */
export function calculateLetterIllumination(
  headX: number,
  headY: number,
  spine: CometSpinePoint[],
  letterX: number,
  letterY: number,
  beamRadius = 230
): number {
  const distHead = Math.hypot(headX - letterX, headY - letterY);

  // Distancia mínima a la estela del cometa
  let minDistSpine = Infinity;
  const checkSteps = Math.min(spine.length, 60);

  for (let i = 0; i < checkSteps; i += 3) {
    const pt = spine[i];
    const dist = Math.hypot(pt.x - letterX, pt.y - letterY);
    if (dist < minDistSpine) {
      minDistSpine = dist;
    }
  }

  const effectiveDist = Math.min(distHead * 0.72, minDistSpine);

  if (effectiveDist < beamRadius) {
    return Math.pow(1 - effectiveDist / beamRadius, 1.35);
  }

  return 0;
}

/**
 * Motor de Robot Run: lógica pura, sin React ni componentes visuales.
 *
 * - Patrón State: la partida siempre está en una fase explícita y solo las
 *   transiciones de TRANSITIONS son válidas (p. ej. no hay doble salto porque
 *   'jumping' no acepta el evento JUMP).
 * - Game loop: useRobotRun llama a step() en cada cuadro; la pantalla solo
 *   dibuja el estado que devuelve.
 */
import {
  CRASH_DELAY_MS,
  HITBOX_MARGIN,
  JUMP,
  MAX_FRAME_MS,
  OBSTACLE_TYPES,
  ROBOT,
  SCORE,
  SPAWN,
  SPEED,
  type ObstacleType,
} from './robotRunConfig';

// ── Patrón State ──
export type RobotRunPhase = 'idle' | 'running' | 'jumping' | 'crashed' | 'finished';
export type RobotRunEvent = 'START' | 'JUMP' | 'LAND' | 'COLLIDE' | 'FINISH' | 'QUIT';

const TRANSITIONS: Record<RobotRunPhase, Partial<Record<RobotRunEvent, RobotRunPhase>>> = {
  idle: { START: 'running', QUIT: 'finished' },
  running: { JUMP: 'jumping', COLLIDE: 'crashed', QUIT: 'finished' },
  jumping: { LAND: 'running', COLLIDE: 'crashed', QUIT: 'finished' },
  crashed: { FINISH: 'finished' },
  finished: {},
};

/** Devuelve la nueva fase, o null si el evento no es válido en la fase actual. */
export function transition(phase: RobotRunPhase, event: RobotRunEvent): RobotRunPhase | null {
  return TRANSITIONS[phase][event] ?? null;
}

export function isPlaying(phase: RobotRunPhase): boolean {
  return phase === 'running' || phase === 'jumping';
}

// ── Estado de la partida ──
export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  passed: boolean;
}

export interface RobotRunState {
  phase: RobotRunPhase;
  fieldWidth: number;
  robotX: number;
  robotY: number; // altura sobre el suelo
  jumpElapsedMs: number;
  elapsedMs: number;
  crashElapsedMs: number;
  obstacles: Obstacle[];
  nextObstacleId: number;
  nextSpawnInMs: number;
  obstaclesPassed: number;
  score: number;
  level: number;
  speed: number;
  distance: number; // px recorridos (anima el suelo)
}

export function createInitialState(fieldWidth: number): RobotRunState {
  return {
    phase: 'idle',
    fieldWidth,
    robotX: Math.round(fieldWidth * ROBOT.xRatio),
    robotY: 0,
    jumpElapsedMs: 0,
    elapsedMs: 0,
    crashElapsedMs: 0,
    obstacles: [],
    nextObstacleId: 1,
    nextSpawnInMs: SPAWN.firstMs,
    obstaclesPassed: 0,
    score: 0,
    level: 0,
    speed: SPEED.base,
    distance: 0,
  };
}

/** Aplica un evento; si no es válido en la fase actual, el estado no cambia. */
export function dispatch(state: RobotRunState, event: RobotRunEvent): RobotRunState {
  const next = transition(state.phase, event);
  if (!next) return state;
  if (event === 'JUMP') return { ...state, phase: next, jumpElapsedMs: 0 };
  return { ...state, phase: next };
}

// ── Reglas del juego ──
export function getLevel(score: number): number {
  return Math.floor(score / SCORE.pointsPerLevel);
}

export function getSpeed(level: number): number {
  return Math.min(SPEED.max, SPEED.base + level * SPEED.perLevel);
}

export function getSpawnInterval(level: number, random: () => number): number {
  const base = SPAWN.baseMs - level * SPAWN.perLevelMs;
  const jitter = 1 + (random() * 2 - 1) * SPAWN.jitter;
  return Math.max(SPAWN.minMs, Math.round(base * jitter));
}

export function getJumpHeight(jumpElapsedMs: number): number {
  const t = Math.min(1, jumpElapsedMs / JUMP.durationMs);
  return 4 * JUMP.height * t * (1 - t); // parábola: 0 → altura máxima → 0
}

export function computeScore(elapsedMs: number, obstaclesPassed: number): number {
  return Math.floor((elapsedMs / 1000) * SCORE.pointsPerSecond) + obstaclesPassed * SCORE.pointsPerObstacle;
}

function pickObstacleType(level: number, random: () => number): ObstacleType {
  const available = OBSTACLE_TYPES.filter((type) => type.minLevel <= level);
  return available[Math.floor(random() * available.length)] ?? OBSTACLE_TYPES[0];
}

// ── Colisión por cajas (bounding boxes) ──
export interface Box {
  x: number;
  y: number; // borde inferior, medido desde el suelo
  width: number;
  height: number;
}

export function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function shrink(box: Box, margin: number): Box {
  return {
    x: box.x + margin,
    y: box.y + margin,
    width: Math.max(0, box.width - margin * 2),
    height: Math.max(0, box.height - margin * 2),
  };
}

export function robotBox(state: RobotRunState): Box {
  return { x: state.robotX, y: state.robotY, width: ROBOT.width, height: ROBOT.height };
}

export function obstacleBox(obstacle: Obstacle): Box {
  return { x: obstacle.x, y: 0, width: obstacle.type.width, height: obstacle.type.height };
}

// ── Un ciclo del game loop ──
export function step(state: RobotRunState, frameMs: number, random: () => number = Math.random): RobotRunState {
  const dt = Math.min(Math.max(frameMs, 0), MAX_FRAME_MS);

  if (state.phase === 'crashed') {
    const crashElapsedMs = state.crashElapsedMs + dt;
    const crashed = { ...state, crashElapsedMs };
    return crashElapsedMs >= CRASH_DELAY_MS ? dispatch(crashed, 'FINISH') : crashed;
  }
  if (!isPlaying(state.phase)) return state;

  let next: RobotRunState = { ...state, elapsedMs: state.elapsedMs + dt };
  const moved = (next.speed * dt) / 1000;
  next.distance += moved;

  // Salto
  if (next.phase === 'jumping') {
    const jumpElapsedMs = next.jumpElapsedMs + dt;
    if (jumpElapsedMs >= JUMP.durationMs) {
      next = { ...dispatch(next, 'LAND'), robotY: 0, jumpElapsedMs: 0 };
    } else {
      next.jumpElapsedMs = jumpElapsedMs;
      next.robotY = getJumpHeight(jumpElapsedMs);
    }
  }

  // Movimiento de obstáculos y conteo de los superados
  let passedNow = 0;
  const obstacles: Obstacle[] = [];
  for (const obstacle of next.obstacles) {
    const x = obstacle.x - moved;
    if (x + obstacle.type.width < -10) continue; // salió de la pantalla
    const passed = obstacle.passed || x + obstacle.type.width < next.robotX;
    if (passed && !obstacle.passed) passedNow += 1;
    obstacles.push({ ...obstacle, x, passed });
  }
  next.obstacles = obstacles;
  next.obstaclesPassed += passedNow;

  // Generación progresiva de obstáculos
  next.nextSpawnInMs -= dt;
  if (next.nextSpawnInMs <= 0) {
    next.obstacles = [
      ...next.obstacles,
      { id: next.nextObstacleId, type: pickObstacleType(next.level, random), x: next.fieldWidth, passed: false },
    ];
    next.nextObstacleId += 1;
    next.nextSpawnInMs = getSpawnInterval(next.level, random);
  }

  // Puntaje y dificultad
  next.score = computeScore(next.elapsedMs, next.obstaclesPassed);
  next.level = getLevel(next.score);
  next.speed = getSpeed(next.level);

  // Colisión
  const robot = shrink(robotBox(next), HITBOX_MARGIN);
  const hit = next.obstacles.some((obstacle) => intersects(robot, shrink(obstacleBox(obstacle), HITBOX_MARGIN)));
  if (hit) {
    next = { ...dispatch(next, 'COLLIDE'), crashElapsedMs: 0 };
  }

  return next;
}

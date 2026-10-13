/**
 * Parámetros de Robot Run. Ajustar la dificultad o agregar obstáculos se hace
 * aquí, sin tocar el motor (RNF-07). Distancias en px y tiempos en ms.
 */

export const GAME_ID = 'robotrun';

export const ROBOT = {
  xRatio: 0.15, // posición X fija, relativa al ancho del área de juego
  width: 34,
  height: 42,
};

// Salto temporizado (sin física de gravedad): sube y baja en duración fija.
export const JUMP = {
  durationMs: 650,
  height: 120,
};

// Velocidad de desplazamiento del escenario en px/s.
export const SPEED = {
  base: 240,
  perLevel: 30,
  max: 560,
};

// Intervalo entre obstáculos. minMs garantiza que siempre dé tiempo de
// aterrizar y volver a saltar.
export const SPAWN = {
  firstMs: 1200,
  baseMs: 1700,
  perLevelMs: 120,
  minMs: JUMP.durationMs + 300,
  jitter: 0.25,
};

export const SCORE = {
  pointsPerSecond: 10,
  pointsPerObstacle: 10,
  pointsPerLevel: 100, // cada 100 puntos sube el nivel (más velocidad y obstáculos)
};

// Margen que se descuenta a cada caja de colisión para que el juego se sienta justo.
export const HITBOX_MARGIN = 4;

// Máximo dt por cuadro: evita saltos bruscos tras una pausa o un cuadro lento.
export const MAX_FRAME_MS = 50;

// Tiempo que se muestra el choque antes de pasar a la pantalla de resultado.
export const CRASH_DELAY_MS = 700;

export type ObstacleShape = 'block' | 'diamond';

export interface ObstacleType {
  kind: string;
  width: number;
  height: number;
  shape: ObstacleShape;
  color: string;
  minLevel: number; // nivel desde el que puede aparecer
}

export const OBSTACLE_TYPES: ObstacleType[] = [
  { kind: 'box', width: 24, height: 34, shape: 'block', color: '#EC4899', minLevel: 0 },
  { kind: 'diamond', width: 34, height: 34, shape: 'diamond', color: '#22D3EE', minLevel: 1 },
  { kind: 'tower', width: 22, height: 52, shape: 'block', color: '#F59E0B', minLevel: 2 },
  { kind: 'wide', width: 46, height: 28, shape: 'block', color: '#EC4899', minLevel: 3 },
];

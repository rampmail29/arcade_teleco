/**
 * Motor de Buscaminas: funciones puras, sin nada de React Native. Igual que
 * robotRunEngine, la pantalla solo dispara acciones y dibuja el estado.
 */
import { GRID, SCORE } from './buscaminasConfig';

export type Phase = 'playing' | 'won' | 'lost';

export interface Cell {
  mine: boolean;
  adjacent: number; // minas en las 8 celdas vecinas
  revealed: boolean;
}

export interface BuscaminasState {
  rows: number;
  cols: number;
  mines: number;
  grid: Cell[][];
  minesPlaced: boolean; // las minas se colocan recién en el primer toque, nunca bajo esa celda
  phase: Phase;
  revealedSafeCount: number;
  score: number;
}

function emptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, adjacent: 0, revealed: false })),
  );
}

export function createInitialState(
  rows: number = GRID.rows,
  cols: number = GRID.cols,
  mines: number = GRID.mines,
): BuscaminasState {
  return {
    rows,
    cols,
    mines,
    grid: emptyGrid(rows, cols),
    minesPlaced: false,
    phase: 'playing',
    revealedSafeCount: 0,
    score: 0,
  };
}

function inBounds(state: BuscaminasState, row: number, col: number): boolean {
  return row >= 0 && row < state.rows && col >= 0 && col < state.cols;
}

function neighbors(row: number, col: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr !== 0 || dc !== 0) out.push([row + dr, col + dc]);
    }
  }
  return out;
}

/** Coloca las minas al azar, evitando siempre la celda del primer toque. */
function placeMines(state: BuscaminasState, safeRow: number, safeCol: number): Cell[][] {
  const grid = state.grid.map((row) => row.map((cell) => ({ ...cell })));
  const candidates: Array<[number, number]> = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (r !== safeRow || c !== safeCol) candidates.push([r, c]);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (const [r, c] of candidates.slice(0, state.mines)) {
    grid[r][c].mine = true;
  }
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (grid[r][c].mine) continue;
      let count = 0;
      for (const [nr, nc] of neighbors(r, c)) {
        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols && grid[nr][nc].mine) count++;
      }
      grid[r][c].adjacent = count;
    }
  }
  return grid;
}

/** Revela en cascada a partir de (row, col): si una celda no tiene minas
 * vecinas, revela automáticamente sus vecinas (y así sucesivamente). */
function floodReveal(grid: Cell[][], state: BuscaminasState, row: number, col: number): number {
  let revealedCount = 0;
  const queue: Array<[number, number]> = [[row, col]];
  const seen = new Set<string>([`${row},${col}`]);

  while (queue.length > 0) {
    const [r, c] = queue.shift() as [number, number];
    const cell = grid[r][c];
    if (cell.revealed || cell.mine) continue;
    cell.revealed = true;
    revealedCount++;
    if (cell.adjacent === 0) {
      for (const [nr, nc] of neighbors(r, c)) {
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols && !seen.has(key)) {
          seen.add(key);
          queue.push([nr, nc]);
        }
      }
    }
  }
  return revealedCount;
}

export function reveal(state: BuscaminasState, row: number, col: number): BuscaminasState {
  if (state.phase !== 'playing') return state;
  const current = state.grid[row][col];
  if (current.revealed) return state;

  const grid = state.minesPlaced ? state.grid.map((r) => r.map((c) => ({ ...c }))) : placeMines(state, row, col);
  const totalSafeCells = state.rows * state.cols - state.mines;

  if (grid[row][col].mine) {
    const revealedGrid = grid.map((r) => r.map((c) => ({ ...c, revealed: true })));
    return { ...state, grid: revealedGrid, minesPlaced: true, phase: 'lost' };
  }

  const newlyRevealed = floodReveal(grid, state, row, col);
  const revealedSafeCount = state.revealedSafeCount + newlyRevealed;
  const won = revealedSafeCount >= totalSafeCells;
  const score = revealedSafeCount + (won ? SCORE.winBonus : 0);

  return {
    ...state,
    grid,
    minesPlaced: true,
    revealedSafeCount,
    score,
    phase: won ? 'won' : 'playing',
  };
}

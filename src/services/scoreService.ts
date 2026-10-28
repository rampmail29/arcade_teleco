/**
 * scoreService
 * Persistencia del mejor puntaje por juego.
 *
 * Corte 1: el valor inicial sale de mockData y el récord se guarda en el
 * dispositivo con AsyncStorage (sobrevive a reinicios de la app).
 * Corte 2: reemplazar el cuerpo de estas funciones por llamadas a apiClient
 * (p. ej. POST /api/games/:id/scores). Las screens y hooks no cambian.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockRobotRunBestScore } from '../data/mockData';

const STORAGE_PREFIX = 'arcade-uts:best-score:';

const initialBestScores: Record<string, number> = {
  robotrun: mockRobotRunBestScore,
};

export interface SaveScoreResult {
  bestScore: number;
  isNewRecord: boolean;
}

export async function getBestScore(gameId: string): Promise<number> {
  const fallback = initialBestScores[gameId] ?? 0;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_PREFIX + gameId);
    const value = stored === null ? NaN : Number(stored);
    return Number.isFinite(value) ? Math.max(value, fallback) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveScore(gameId: string, score: number): Promise<SaveScoreResult> {
  const previousBest = await getBestScore(gameId);
  if (score <= previousBest) {
    return { bestScore: previousBest, isNewRecord: false };
  }
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + gameId, String(score));
  } catch {
    // Si el almacenamiento falla, el récord se muestra igual en esta sesión.
  }
  return { bestScore: score, isNewRecord: true };
}

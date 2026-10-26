import { apiClient } from './apiClient';
import { saveScore, getBestScore, SaveScoreResult } from './scoreService';

export interface RacingScorePayload {
  jugador: string;
  score: number;
  tiempo: number;
}

export const racingService = {
  /**
   * Guarda la puntuación usando el scoreService oficial con AsyncStorage (Corte 1)
   * y envía el registro al backend API si está disponible (Corte 2).
   */
  async guardarScore(jugador: string, score: number, tiempo: number): Promise<SaveScoreResult> {
    // 1. Persistencia local con AsyncStorage oficial
    const result = await saveScore('racing', score);

    // 2. Registro remoto al backend
    try {
      await apiClient.post('/games/racing/scores', {
        jugador,
        score,
        tiempo,
      });
    } catch {
      // Si la API remota no está activa, no rompe la experiencia del juego
    }

    return result;
  },

  /**
   * Obtiene el mejor puntaje registrado localmente para el juego de carreras.
   */
  async obtenerMejorScore(): Promise<number> {
    return getBestScore('racing');
  },

  /**
   * Obtiene el historial de carreras desde el backend.
   */
  async obtenerHistorial(): Promise<any> {
    return apiClient.get('/games/racing/history');
  },
};
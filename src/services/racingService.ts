import { apiClient } from './apiClient';
import { scoreService } from './scoreService';

export interface RacingScorePayload {
  jugador: string;
  score: number;
  tiempo: number;
}

export const racingService = {
  /**
   * Guarda la puntuación usando el servicio general de scores.
   * Si el backend tiene un endpoint directo dedicado, mantiene el fallback.
   */
  async guardarScore(jugador: string, score: number, tiempo: number): Promise<any> {
    try {
      return await scoreService.submitScore({
        gameId: 'racing',
        player: jugador,
        score,
        details: { tiempo },
      });
    } catch {
      return await apiClient.post('/games/racing/scores', {
        jugador,
        score,
        tiempo,
      });
    }
  },

  /**
   * Obtiene el historial o ranking específico de la pista de carreras.
   */
  async obtenerHistorial(): Promise<any> {
    return apiClient.get('/games/racing/history');
  },
};
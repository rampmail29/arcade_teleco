import { apiClient } from './apiClient';

export interface RacingScoreData {
  jugador: string;
  score: number;
  tiempo: number;
}

export const racingService = {
  // Envía la puntuación al backend
  async guardarScore(jugador: string, score: number, tiempo: number): Promise<any> {
    return apiClient.post('/games/racing/scores', { jugador, score, tiempo });
  },

  // Consulta el historial o ranking
  async obtenerHistorial(): Promise<any> {
    return apiClient.get('/games/racing/history');
  },
};
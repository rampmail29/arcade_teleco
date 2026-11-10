import { prisma } from '../lib/prisma.js';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  /** Si el usuario ya cumple la condición del logro (se llama solo si todavía no lo tiene). */
  isUnlockedFor(userId: string): Promise<boolean>;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'three_games_100',
    title: '100 en 3 juegos',
    description: 'Consigue al menos 100 puntos en 3 juegos distintos',
    async isUnlockedFor(userId: string): Promise<boolean> {
      const gamesWithHighScore = await prisma.score.groupBy({
        by: ['gameId'],
        where: { userId, value: { gte: 100 } },
      });
      return gamesWithHighScore.length >= 3;
    },
  },
];

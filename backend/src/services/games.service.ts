import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

export interface GameDTO {
  id: string;
  title: string;
  description: string;
}

export async function getAllGames(): Promise<GameDTO[]> {
  return prisma.game.findMany({
    select: { id: true, title: true, description: true },
    orderBy: { id: 'asc' },
  });
}

export async function getGameOrThrow(gameId: string): Promise<GameDTO> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true, description: true },
  });
  if (!game) {
    throw new HttpError(404, `No existe el juego "${gameId}"`);
  }
  return game;
}

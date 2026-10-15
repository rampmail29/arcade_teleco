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

export interface SaveScoreResult {
  bestScore: number;
  isNewRecord: boolean;
}

export async function saveScore(gameId: string, email: string, value: number): Promise<SaveScoreResult> {
  await getGameOrThrow(gameId);

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: { email: normalizedEmail },
    update: {},
  });

  const previousBest = await prisma.score.aggregate({
    where: { gameId, userId: user.id },
    _max: { value: true },
  });
  const bestScore = previousBest._max.value ?? 0;

  await prisma.score.create({ data: { gameId, userId: user.id, value } });

  return value > bestScore
    ? { bestScore: value, isNewRecord: true }
    : { bestScore, isNewRecord: false };
}

export interface HistoryEntryDTO {
  value: number;
  email: string;
  createdAt: string;
}

export async function getHistory(gameId: string, limit: number): Promise<HistoryEntryDTO[]> {
  await getGameOrThrow(gameId);

  const scores = await prisma.score.findMany({
    where: { gameId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { email: true } } },
  });

  return scores.map((score) => ({
    value: score.value,
    email: score.user.email,
    createdAt: score.createdAt.toISOString(),
  }));
}

export interface RankingEntryDTO {
  user: string;
  score: number;
}

export async function getRankings(gameId?: string): Promise<RankingEntryDTO[]> {
  if (gameId) {
    await getGameOrThrow(gameId);
  }

  const grouped = await prisma.score.groupBy({
    by: ['userId'],
    where: gameId ? { gameId } : undefined,
    _max: { value: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, email: true },
  });
  const emailById = new Map(users.map((u) => [u.id, u.email]));

  return grouped
    .map((g) => ({ user: emailById.get(g.userId) ?? 'desconocido', score: g._max.value ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

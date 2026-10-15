import type { Request, Response, NextFunction } from 'express';
import { getAllGames, getGameOrThrow, saveScore, getHistory, getRankings } from '../services/games.service.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function listGames(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getAllGames());
  } catch (error) {
    next(error);
  }
}

export async function getGame(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getGameOrThrow(req.params.id));
  } catch (error) {
    next(error);
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function postScore(req: Request, res: Response, next: NextFunction) {
  try {
    const { score, email } = req.body as { score?: unknown; email?: unknown };
    if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
      throw new HttpError(400, 'score debe ser un número entero mayor o igual a 0');
    }
    if (typeof email !== 'string' || !isValidEmail(email)) {
      throw new HttpError(400, 'email debe ser un correo válido');
    }
    res.json(await saveScore(req.params.id, email, score));
  } catch (error) {
    next(error);
  }
}

export async function getGameHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const limitParam = req.query.limit;
    const parsed = typeof limitParam === 'string' ? Number(limitParam) : NaN;
    const limit = Number.isInteger(parsed) && parsed > 0 ? parsed : 20;
    res.json(await getHistory(req.params.id, limit));
  } catch (error) {
    next(error);
  }
}

export async function listRankings(req: Request, res: Response, next: NextFunction) {
  try {
    const gameId = typeof req.query.gameId === 'string' ? req.query.gameId : undefined;
    res.json(await getRankings(gameId));
  } catch (error) {
    next(error);
  }
}

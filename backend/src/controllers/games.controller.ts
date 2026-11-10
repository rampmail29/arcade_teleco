import type { Request, Response, NextFunction } from 'express';
import { getAllGames, getGameOrThrow, saveScore, getHistory, getRankings } from '../services/games.service.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { AuthedRequest } from '../middleware/requireAuth.js';

export async function listGames(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getAllGames());
  } catch (error) {
    next(error);
  }
}

export async function getGame(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    res.json(await getGameOrThrow(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function postScore(req: AuthedRequest<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { score } = (req.body ?? {}) as { score?: unknown };
    const MAX_SCORE = 2_147_483_647; // límite de un INT de 32 bits en la columna Score.value
    if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
      throw new HttpError(400, `score debe ser un número entero entre 0 y ${MAX_SCORE}`);
    }
    // requireAuth ya corrió antes que este controller y garantiza req.userEmail.
    res.json(await saveScore(req.params.id, req.userEmail as string, score));
  } catch (error) {
    next(error);
  }
}

export async function getGameHistory(req: Request<{ id: string }>, res: Response, next: NextFunction) {
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

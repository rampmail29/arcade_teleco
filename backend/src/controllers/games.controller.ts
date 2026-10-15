import type { Request, Response, NextFunction } from 'express';
import { getAllGames, getGameOrThrow } from '../services/games.service.js';

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

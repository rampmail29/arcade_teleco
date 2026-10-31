import type { Response, NextFunction } from 'express';
import { getAchievementsForEmail } from '../services/achievements.service.js';
import type { AuthedRequest } from '../middleware/requireAuth.js';

export async function getMyAchievements(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    res.json(await getAchievementsForEmail(req.userEmail as string));
  } catch (error) {
    next(error);
  }
}

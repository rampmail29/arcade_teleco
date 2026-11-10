import { Router } from 'express';
import { getMyAchievements } from '../controllers/achievements.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const meRouter = Router();

meRouter.get('/achievements', requireAuth, getMyAchievements);

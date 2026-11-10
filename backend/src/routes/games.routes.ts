import { Router } from 'express';
import { listGames, getGame, postScore, getGameHistory, listRankings } from '../controllers/games.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const gamesRouter = Router();

gamesRouter.get('/', listGames);
gamesRouter.get('/:id', getGame);
gamesRouter.post('/:id/scores', requireAuth, postScore);
gamesRouter.get('/:id/history', getGameHistory);

export const rankingsRouter = Router();
rankingsRouter.get('/', listRankings);

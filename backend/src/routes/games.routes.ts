import { Router } from 'express';
import { listGames, getGame, postScore, getGameHistory } from '../controllers/games.controller.js';

export const gamesRouter = Router();

gamesRouter.get('/', listGames);
gamesRouter.get('/:id', getGame);
gamesRouter.post('/:id/scores', postScore);
gamesRouter.get('/:id/history', getGameHistory);

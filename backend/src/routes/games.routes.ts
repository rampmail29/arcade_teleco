import { Router } from 'express';
import { listGames, getGame } from '../controllers/games.controller.js';

export const gamesRouter = Router();

gamesRouter.get('/', listGames);
gamesRouter.get('/:id', getGame);

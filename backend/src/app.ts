import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { gamesRouter } from './routes/games.routes.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/games', gamesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

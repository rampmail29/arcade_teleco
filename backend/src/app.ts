import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { gamesRouter, rankingsRouter } from './routes/games.routes.js';

export const app = express();

// API local de curso, sin datos sensibles de producción: CORS abierto para que
// cualquier origen (incluido el target web de Expo) pueda consumirla sin fricción.
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/games', gamesRouter);
app.use('/api/rankings', rankingsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

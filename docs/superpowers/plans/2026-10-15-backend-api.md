# Backend API (Corte 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir, dentro de `backend/`, la API REST de ARCADE UTS (Express + Prisma + SQLite) con los endpoints de juegos, puntajes, historial y rankings, probados end-to-end.

**Architecture:** Segundo proyecto npm independiente dentro del monorepo (`backend/`, su propio `package.json`/`node_modules`). Capas `route → controller → service → Prisma Client → SQLite`. Una sola instancia de `PrismaClient` (`src/lib/prisma.ts`); ningún otro archivo importa `@prisma/client` directamente.

**Tech Stack:** Node 22.19.0 (ya pineado en la raíz del repo), TypeScript, Express 4, Prisma + SQLite, `tsx` (dev/test runner), `node:test` + `supertest` para pruebas, `dotenv` para cargar `.env` en runtime.

**Spec:** `docs/superpowers/specs/2026-10-15-backend-api-design.md`

## Global Constraints

- Node 22.19.0 (heredado del `mise.local.toml` de la raíz; no se repite dentro de `backend/`).
- `backend/` es un proyecto npm independiente — no se toca `package.json`, `node_modules` ni código de la app Expo/RN en este plan.
- Nada de Jest ni frameworks de test pesados: solo `node:test` (nativo de Node) + `supertest`.
- Toda respuesta de error es JSON `{ "error": "mensaje" }` con el código HTTP correcto (400/404/500).
- `GET /api/users/me` y la verificación de JWT de Supabase quedan **fuera de alcance** de este plan (follow-up documentado en la spec, sección 10).
- `Game` devuelto por la API es `{ id, title, description }` — sin `icon` ni `route` (esos son de presentación/navegación, viven solo en el frontend).
- Commits en español, atribuidos a la cuenta `spuwvy`. Co-autoría de Claude Code en cada commit (ver pie de página de cada paso de commit).
- Rama de trabajo: `feature/backend-api` (ya existe localmente, con la spec ya commiteada ahí).

## Review Focus

- `POST /api/games/:id/scores` con el mismo email en mayúsculas/minúsculas distintas (`Ana@UTS.edu.co` vs `ana@uts.edu.co`) — debe contar como el mismo usuario, no crear dos rankings separados. (Task 4)
- `POST /api/games/:id/scores` con `score` decimal (`10.5`) o negativo (`-5`) — debe responder 400, no guardarlo ni crashear. (Task 4)
- `POST /api/games/:id/scores` con body vacío (`{}`, sin `score` ni `email`) — debe responder 400 con mensaje claro, no un 500. (Task 4)
- `GET /api/games/:id/history?limit=` con un valor inválido (`abc`, `-1`, ausente) — debe caer a un default seguro (20) en vez de romperse. (Task 4)
- `GET /api/rankings` cuando no hay ningún puntaje guardado todavía — debe responder `[]`, no un error. (Task 5)

---

### Task 1: Scaffold del backend + servidor Express con healthcheck

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/.gitignore`
- Create: `backend/src/middleware/errorHandler.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Test: `backend/test/health.test.ts`

**Interfaces:**
- Consumes: nada (primer task).
- Produces: `export class HttpError extends Error { status: number }` y `export const errorHandler: ErrorRequestHandler` desde `src/middleware/errorHandler.ts`. `export const app` (instancia de Express, sin `.listen()`) desde `src/app.ts` — este es el export que todos los tests de los siguientes tasks usan con `supertest`.

- [ ] **Step 1: Crear el directorio y el `package.json` mínimo**

```bash
mkdir -p "backend"
```

Escribir `backend/package.json`:

```json
{
  "name": "arcade-uts-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "tsx --test"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

```bash
cd backend
npm install express dotenv
npm install -D typescript tsx @types/express @types/node supertest @types/supertest
```

- [ ] **Step 3: Escribir `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Escribir `.env.example` y `.gitignore`**

`backend/.env.example`:

```text
PORT=3000
DATABASE_URL="file:./prisma/dev.db"
```

`backend/.gitignore`:

```text
node_modules/
dist/
.env
prisma/*.db
prisma/*.db-journal
```

- [ ] **Step 5: Escribir la prueba que falla**

```typescript
// backend/test/health.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

test('GET /api/health responde 200 con status ok', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});
```

- [ ] **Step 6: Correr la prueba y verificar que falla**

Run: `cd backend && npm test`
Expected: FAIL — `Cannot find module '../src/app.js'` (todavía no existe).

- [ ] **Step 7: Implementar `errorHandler`, `app` y `server`**

```typescript
// backend/src/middleware/errorHandler.ts
import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Error interno';
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
};
```

```typescript
// backend/src/app.ts
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);
```

```typescript
// backend/src/server.ts
import 'dotenv/config';
import { app } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
```

- [ ] **Step 8: Correr la prueba y verificar que pasa**

Run: `cd backend && npm test`
Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
cd backend
git add package.json package-lock.json tsconfig.json .env.example .gitignore src test
git commit -m "feat(backend): scaffold de Express con healthcheck

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UjvZ1Tx7YRKkCfo7vFKHH"
```

---

### Task 2: Prisma — schema, cliente y seed de los 5 juegos

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/lib/prisma.ts`
- Create: `backend/prisma/seed.ts`
- Modify: `backend/package.json` (scripts `pretest`/`test`/`db:migrate`/`db:seed`, campo `prisma.seed`)
- Test: `backend/test/seed.test.ts`

**Interfaces:**
- Consumes: nada de Task 1 directamente (es infraestructura paralela).
- Produces: `export const prisma: PrismaClient` desde `src/lib/prisma.ts` (usado por todos los services de los siguientes tasks y por los tests). `export async function seedGames(prisma: PrismaClient): Promise<void>` y `export const GAME_FIXTURES: { id: string; title: string; description: string }[]` desde `prisma/seed.ts`.

- [ ] **Step 1: Instalar Prisma**

```bash
cd backend
npm install @prisma/client
npm install -D prisma
```

- [ ] **Step 2: Escribir el schema**

```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Game {
  id          String  @id
  title       String
  description String
  scores      Score[]
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  scores    Score[]
  createdAt DateTime @default(now())
}

model Score {
  id        String   @id @default(uuid())
  value     Int
  gameId    String
  userId    String
  game      Game     @relation(fields: [gameId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([gameId])
  @@index([userId])
}
```

- [ ] **Step 3: Generar el cliente y crear la base de dev**

```bash
cd backend
npx prisma generate
cp .env.example .env
npx prisma migrate dev --name init
```

Expected: crea `backend/prisma/migrations/` y `backend/prisma/dev.db` (este último gitignored).

- [ ] **Step 4: Escribir `src/lib/prisma.ts`**

```typescript
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

- [ ] **Step 5: Agregar scripts de test contra una base separada**

Modificar `backend/package.json` — agregar el campo `prisma` y actualizar `scripts`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "pretest": "rm -f prisma/test.db && DATABASE_URL=\"file:./prisma/test.db\" npx prisma db push --skip-generate --accept-data-loss",
    "test": "DATABASE_URL=\"file:./prisma/test.db\" tsx --test",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 6: Crear la base de test**

```bash
cd backend
npm run pretest
```

Expected: crea `backend/prisma/test.db` con el schema aplicado (sin filas).

- [ ] **Step 7: Escribir la prueba que falla**

```typescript
// backend/test/seed.test.ts
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { seedGames, GAME_FIXTURES } from '../prisma/seed.js';

before(async () => {
  await seedGames(prisma);
});

after(async () => {
  await prisma.$disconnect();
});

test('seedGames inserta los 5 juegos esperados', async () => {
  const games = await prisma.game.findMany({ orderBy: { id: 'asc' } });
  assert.equal(games.length, GAME_FIXTURES.length);
  assert.deepEqual(
    games.map((g) => g.id).sort(),
    GAME_FIXTURES.map((g) => g.id).sort(),
  );
});
```

- [ ] **Step 8: Correr la prueba y verificar que falla**

Run: `cd backend && DATABASE_URL="file:./prisma/test.db" tsx --test test/seed.test.ts`
Expected: FAIL — `Cannot find module '../prisma/seed.js'`.

- [ ] **Step 9: Implementar el seed**

```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

export const GAME_FIXTURES = [
  { id: 'trivia', title: 'Trivia', description: 'Preguntas y respuestas' },
  { id: 'memorama', title: 'Memorama', description: 'Encuentra las parejas' },
  { id: 'sudoku', title: 'Sudoku', description: 'Completa la cuadrícula' },
  { id: 'game4', title: 'Juego 4', description: 'Cuarto juego demostrativo' },
  { id: 'robotrun', title: 'Robot Run', description: 'Salta y esquiva obstáculos' },
];

export async function seedGames(prisma: PrismaClient): Promise<void> {
  for (const game of GAME_FIXTURES) {
    await prisma.game.upsert({
      where: { id: game.id },
      create: game,
      update: game,
    });
  }
}

const isMainModule = process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const prisma = new PrismaClient();
  seedGames(prisma)
    .then(() => console.log(`Seed listo: ${GAME_FIXTURES.length} juegos.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
```

- [ ] **Step 10: Correr la prueba y verificar que pasa**

Run: `cd backend && npm test test/seed.test.ts` (o `npm test` completo)
Expected: PASS — 2 tests en total (health + seed).

- [ ] **Step 11: Sembrar la base de dev también**

```bash
cd backend
npm run db:seed
```

- [ ] **Step 12: Commit**

```bash
cd backend
git add package.json prisma src/lib test/seed.test.ts .gitignore
git commit -m "feat(backend): schema de Prisma y seed de los 5 juegos

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UjvZ1Tx7YRKkCfo7vFKHH"
```

(`prisma/dev.db`, `prisma/test.db` y `.env` quedan fuera por el `.gitignore`; `prisma/migrations/` sí se commitea.)

---

### Task 3: `GET /api/games` y `GET /api/games/:id`

**Files:**
- Create: `backend/src/services/games.service.ts`
- Create: `backend/src/controllers/games.controller.ts`
- Create: `backend/src/routes/games.routes.ts`
- Modify: `backend/src/app.ts` (montar `gamesRouter`)
- Test: `backend/test/games.test.ts`

**Interfaces:**
- Consumes: `prisma` de `src/lib/prisma.ts` (Task 2); `HttpError` de `src/middleware/errorHandler.ts` (Task 1); `seedGames`, `GAME_FIXTURES` de `prisma/seed.ts` (Task 2) — usados en el `before()` del test.
- Produces: `export interface GameDTO { id: string; title: string; description: string }`, `export async function getAllGames(): Promise<GameDTO[]>`, `export async function getGameOrThrow(gameId: string): Promise<GameDTO>` desde `services/games.service.ts` — Tasks 4 y 5 los importan. `export const gamesRouter: Router` desde `routes/games.routes.ts` — Task 4 le agrega rutas.

- [ ] **Step 1: Escribir la prueba que falla**

```typescript
// backend/test/games.test.ts
import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { seedGames, GAME_FIXTURES } from '../prisma/seed.js';

before(async () => {
  await seedGames(prisma);
});

beforeEach(async () => {
  await prisma.score.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
});

test('GET /api/games devuelve los 5 juegos sembrados', async () => {
  const response = await request(app).get('/api/games');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, GAME_FIXTURES.length);
  assert.deepEqual(
    response.body.map((g: { id: string }) => g.id).sort(),
    GAME_FIXTURES.map((g) => g.id).sort(),
  );
});

test('GET /api/games/:id devuelve un juego existente', async () => {
  const response = await request(app).get('/api/games/trivia');
  assert.equal(response.status, 200);
  assert.equal(response.body.id, 'trivia');
  assert.equal(response.body.title, 'Trivia');
});

test('GET /api/games/:id responde 404 si el juego no existe', async () => {
  const response = await request(app).get('/api/games/no-existe');
  assert.equal(response.status, 404);
  assert.ok(response.body.error);
});
```

- [ ] **Step 2: Correr la prueba y verificar que falla**

Run: `cd backend && npm test`
Expected: FAIL — las tres pruebas de `games.test.ts` responden 404 (la ruta `/api/games` todavía no existe y cae en el handler "Ruta no encontrada" de `app.ts`).

- [ ] **Step 3: Implementar service, controller y routes**

```typescript
// backend/src/services/games.service.ts
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

export interface GameDTO {
  id: string;
  title: string;
  description: string;
}

export async function getAllGames(): Promise<GameDTO[]> {
  return prisma.game.findMany({
    select: { id: true, title: true, description: true },
    orderBy: { id: 'asc' },
  });
}

export async function getGameOrThrow(gameId: string): Promise<GameDTO> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true, description: true },
  });
  if (!game) {
    throw new HttpError(404, `No existe el juego "${gameId}"`);
  }
  return game;
}
```

```typescript
// backend/src/controllers/games.controller.ts
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
```

```typescript
// backend/src/routes/games.routes.ts
import { Router } from 'express';
import { listGames, getGame } from '../controllers/games.controller.js';

export const gamesRouter = Router();

gamesRouter.get('/', listGames);
gamesRouter.get('/:id', getGame);
```

Modificar `backend/src/app.ts` — insertar el router entre `express.json()` y el handler 404:

```typescript
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
```

- [ ] **Step 4: Correr la prueba y verificar que pasa**

Run: `cd backend && npm test`
Expected: PASS — 5 tests en total.

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/services src/controllers src/routes src/app.ts test/games.test.ts
git commit -m "feat(backend): endpoints GET /api/games y GET /api/games/:id

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UjvZ1Tx7YRKkCfo7vFKHH"
```

---

### Task 4: `POST /api/games/:id/scores` y `GET /api/games/:id/history`

**Files:**
- Modify: `backend/src/services/games.service.ts` (agregar `saveScore`, `getHistory`)
- Modify: `backend/src/controllers/games.controller.ts` (agregar `postScore`, `getGameHistory`)
- Modify: `backend/src/routes/games.routes.ts` (agregar las 2 rutas a `gamesRouter`)
- Modify: `backend/test/games.test.ts` (agregar los tests de esta sección)

**Interfaces:**
- Consumes: `getGameOrThrow`, `GameDTO` (Task 3); `prisma` (Task 2); `HttpError` (Task 1).
- Produces: `export interface SaveScoreResult { bestScore: number; isNewRecord: boolean }`, `export async function saveScore(gameId: string, email: string, value: number): Promise<SaveScoreResult>`, `export interface HistoryEntryDTO { value: number; email: string; createdAt: string }`, `export async function getHistory(gameId: string, limit: number): Promise<HistoryEntryDTO[]>` — Task 5 no los necesita, pero quedan disponibles para el frontend al migrar `scoreService.ts`.

- [ ] **Step 1: Agregar las pruebas que fallan**

Agregar al final de `backend/test/games.test.ts` (mismos imports y hooks de Task 3, sin duplicarlos):

```typescript
test('POST /api/games/:id/scores guarda un puntaje nuevo y lo marca como récord', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 100, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 100, isNewRecord: true });
});

test('POST /api/games/:id/scores no marca récord si el puntaje es menor al guardado', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 100, email: 'ana@uts.edu.co' });
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 50, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 100, isNewRecord: false });
});

test('POST /api/games/:id/scores trata el mismo correo en mayúsculas/minúsculas como el mismo usuario', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 70, email: 'Ana@UTS.edu.co' });
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 90, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 90, isNewRecord: true });

  const usersCount = await prisma.user.count({ where: { email: 'ana@uts.edu.co' } });
  assert.equal(usersCount, 1);
});

test('POST /api/games/:id/scores responde 400 si score es decimal o negativo', async () => {
  const decimal = await request(app).post('/api/games/trivia/scores').send({ score: 10.5, email: 'ana@uts.edu.co' });
  assert.equal(decimal.status, 400);

  const negativo = await request(app).post('/api/games/trivia/scores').send({ score: -5, email: 'ana@uts.edu.co' });
  assert.equal(negativo.status, 400);
});

test('POST /api/games/:id/scores responde 400 si el email no es válido', async () => {
  const response = await request(app).post('/api/games/trivia/scores').send({ score: 10, email: 'no-es-correo' });
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 400 con body vacío', async () => {
  const response = await request(app).post('/api/games/trivia/scores').send({});
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 404 si el juego no existe', async () => {
  const response = await request(app)
    .post('/api/games/no-existe/scores')
    .send({ score: 10, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 404);
});

test('GET /api/games/:id/history devuelve las partidas más recientes primero', async () => {
  await request(app).post('/api/games/memorama/scores').send({ score: 10, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/memorama/scores').send({ score: 20, email: 'ana@uts.edu.co' });

  const response = await request(app).get('/api/games/memorama/history');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 2);
  assert.equal(response.body[0].value, 20);
  assert.equal(response.body[1].value, 10);
  assert.equal(response.body[0].email, 'ana@uts.edu.co');
});

test('GET /api/games/:id/history con limit inválido cae al default de 20', async () => {
  const response = await request(app).get('/api/games/memorama/history').query({ limit: 'abc' });
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /api/games/:id/history responde 404 si el juego no existe', async () => {
  const response = await request(app).get('/api/games/no-existe/history');
  assert.equal(response.status, 404);
});
```

- [ ] **Step 2: Correr las pruebas y verificar que fallan**

Run: `cd backend && npm test`
Expected: FAIL — las rutas `POST /:id/scores` y `GET /:id/history` no existen (404 "Ruta no encontrada").

- [ ] **Step 3: Implementar service, controller y routes**

Agregar a `backend/src/services/games.service.ts`:

```typescript
export interface SaveScoreResult {
  bestScore: number;
  isNewRecord: boolean;
}

export async function saveScore(gameId: string, email: string, value: number): Promise<SaveScoreResult> {
  await getGameOrThrow(gameId);

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: { email: normalizedEmail },
    update: {},
  });

  const previousBest = await prisma.score.aggregate({
    where: { gameId, userId: user.id },
    _max: { value: true },
  });
  const bestScore = previousBest._max.value ?? 0;

  await prisma.score.create({ data: { gameId, userId: user.id, value } });

  return value > bestScore
    ? { bestScore: value, isNewRecord: true }
    : { bestScore, isNewRecord: false };
}

export interface HistoryEntryDTO {
  value: number;
  email: string;
  createdAt: string;
}

export async function getHistory(gameId: string, limit: number): Promise<HistoryEntryDTO[]> {
  await getGameOrThrow(gameId);

  const scores = await prisma.score.findMany({
    where: { gameId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { email: true } } },
  });

  return scores.map((score) => ({
    value: score.value,
    email: score.user.email,
    createdAt: score.createdAt.toISOString(),
  }));
}
```

Agregar a `backend/src/controllers/games.controller.ts`:

```typescript
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
```

(Agregar `HttpError` y `saveScore`/`getHistory` a los imports existentes del controller.)

Agregar a `backend/src/routes/games.routes.ts`:

```typescript
gamesRouter.post('/:id/scores', postScore);
gamesRouter.get('/:id/history', getGameHistory);
```

(Agregar `postScore`, `getGameHistory` al import existente.)

- [ ] **Step 4: Correr las pruebas y verificar que pasan**

Run: `cd backend && npm test`
Expected: PASS — 15 tests en total.

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/services/games.service.ts src/controllers/games.controller.ts src/routes/games.routes.ts test/games.test.ts
git commit -m "feat(backend): POST /api/games/:id/scores y GET /api/games/:id/history

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UjvZ1Tx7YRKkCfo7vFKHH"
```

---

### Task 5: `GET /api/rankings`

**Files:**
- Modify: `backend/src/services/games.service.ts` (agregar `getRankings`)
- Modify: `backend/src/controllers/games.controller.ts` (agregar `listRankings`)
- Modify: `backend/src/routes/games.routes.ts` (agregar `rankingsRouter`)
- Modify: `backend/src/app.ts` (montar `rankingsRouter` en `/api/rankings`)
- Modify: `backend/test/games.test.ts` (agregar los tests de esta sección)

**Interfaces:**
- Consumes: `prisma` (Task 2); `getGameOrThrow` (Task 3).
- Produces: `export interface RankingEntryDTO { user: string; score: number }`, `export async function getRankings(gameId?: string): Promise<RankingEntryDTO[]>`; `export const rankingsRouter: Router` desde `routes/games.routes.ts`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Agregar al final de `backend/test/games.test.ts`:

```typescript
test('GET /api/rankings sin gameId devuelve el mejor puntaje de cada usuario entre todos sus juegos', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 30, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/sudoku/scores').send({ score: 90, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/trivia/scores').send({ score: 50, email: 'bea@uts.edu.co' });

  const response = await request(app).get('/api/rankings');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [
    { user: 'ana@uts.edu.co', score: 90 },
    { user: 'bea@uts.edu.co', score: 50 },
  ]);
});

test('GET /api/rankings?gameId= filtra por juego', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 30, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/trivia/scores').send({ score: 50, email: 'bea@uts.edu.co' });
  await request(app).post('/api/games/sudoku/scores').send({ score: 999, email: 'ana@uts.edu.co' });

  const response = await request(app).get('/api/rankings').query({ gameId: 'trivia' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [
    { user: 'bea@uts.edu.co', score: 50 },
    { user: 'ana@uts.edu.co', score: 30 },
  ]);
});

test('GET /api/rankings?gameId= responde 404 si el juego no existe', async () => {
  const response = await request(app).get('/api/rankings').query({ gameId: 'no-existe' });
  assert.equal(response.status, 404);
});

test('GET /api/rankings devuelve [] si no hay puntajes guardados', async () => {
  const response = await request(app).get('/api/rankings');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});
```

- [ ] **Step 2: Correr las pruebas y verificar que fallan**

Run: `cd backend && npm test`
Expected: FAIL — `/api/rankings` no existe (404 "Ruta no encontrada").

- [ ] **Step 3: Implementar service, controller, routes y montaje**

Agregar a `backend/src/services/games.service.ts`:

```typescript
export interface RankingEntryDTO {
  user: string;
  score: number;
}

export async function getRankings(gameId?: string): Promise<RankingEntryDTO[]> {
  if (gameId) {
    await getGameOrThrow(gameId);
  }

  const grouped = await prisma.score.groupBy({
    by: ['userId'],
    where: gameId ? { gameId } : undefined,
    _max: { value: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, email: true },
  });
  const emailById = new Map(users.map((u) => [u.id, u.email]));

  return grouped
    .map((g) => ({ user: emailById.get(g.userId) ?? 'desconocido', score: g._max.value ?? 0 }))
    .sort((a, b) => b.score - a.score);
}
```

Agregar a `backend/src/controllers/games.controller.ts`:

```typescript
export async function listRankings(req: Request, res: Response, next: NextFunction) {
  try {
    const gameId = typeof req.query.gameId === 'string' ? req.query.gameId : undefined;
    res.json(await getRankings(gameId));
  } catch (error) {
    next(error);
  }
}
```

(Agregar `getRankings` al import existente.)

Modificar `backend/src/routes/games.routes.ts` — agregar al final:

```typescript
export const rankingsRouter = Router();
rankingsRouter.get('/', listRankings);
```

(Agregar `listRankings` al import existente.)

Modificar `backend/src/app.ts`:

```typescript
import { gamesRouter, rankingsRouter } from './routes/games.routes.js';
// ...
app.use('/api/games', gamesRouter);
app.use('/api/rankings', rankingsRouter);
```

- [ ] **Step 4: Correr las pruebas y verificar que pasan**

Run: `cd backend && npm test`
Expected: PASS — 19 tests en total.

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/services/games.service.ts src/controllers/games.controller.ts src/routes/games.routes.ts src/app.ts test/games.test.ts
git commit -m "feat(backend): endpoint GET /api/rankings

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UjvZ1Tx7YRKkCfo7vFKHH"
```

---

### Task 6: README del backend + verificación manual end-to-end

**Files:**
- Create: `backend/README.md`

**Interfaces:**
- Consumes: todo lo anterior (es el task de cierre, documenta lo ya construido).
- Produces: nada que otro código consuma — es documentación.

- [ ] **Step 1: Escribir `backend/README.md`**

```markdown
# ARCADE UTS — Backend

API REST (Corte 2) para ARCADE UTS. Node + Express + Prisma + SQLite.

## Instalación

\`\`\`bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
\`\`\`

## Ejecución

\`\`\`bash
npm run dev
\`\`\`

Levanta el servidor en `http://localhost:3000`. El frontend ya apunta ahí por
defecto (`EXPO_PUBLIC_API_BASE_URL`, ver `src/config/environment.ts` de la app).

## Pruebas

\`\`\`bash
npm test
\`\`\`

Corre contra una base SQLite separada (`prisma/test.db`), no contra `dev.db`.

## Endpoints

| Método | Ruta | Body/Query | Respuesta |
|---|---|---|---|
| GET | `/api/games` | — | `Game[]` |
| GET | `/api/games/:id` | — | `Game` (404 si no existe) |
| POST | `/api/games/:id/scores` | `{ score, email }` | `{ bestScore, isNewRecord }` |
| GET | `/api/games/:id/history` | `?limit=` (default 20) | `{ value, email, createdAt }[]` |
| GET | `/api/rankings` | `?gameId=` (opcional) | `{ user, score }[]` |

## Fuera de alcance de esta versión

`GET /api/users/me` y la verificación de JWT de Supabase — ver
`docs/superpowers/specs/2026-10-15-backend-api-design.md`, sección 10.
```

- [ ] **Step 2: Verificación manual end-to-end**

```bash
cd backend
npm run pretest && npm test
npm run dev &
sleep 1
curl -s http://localhost:3000/api/games | head -c 200
curl -s -X POST http://localhost:3000/api/games/trivia/scores \
  -H "Content-Type: application/json" \
  -d '{"score": 10, "email": "prueba@uts.edu.co"}'
curl -s http://localhost:3000/api/rankings
kill %1
```

Expected: `npm test` en verde (19 tests), `GET /api/games` devuelve los 5 juegos, el `POST` devuelve `{"bestScore":10,"isNewRecord":true}`, `GET /api/rankings` incluye a `prueba@uts.edu.co`.

- [ ] **Step 3: Commit**

```bash
cd backend
git add README.md
git commit -m "docs(backend): README de instalación y ejecución

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UjvZ1Tx7YRKkCfo7vFKHH"
```

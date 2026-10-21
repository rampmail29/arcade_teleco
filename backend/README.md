# ARCADE UTS — Backend

API REST (Corte 2) para ARCADE UTS. Node + Express + Prisma + SQLite.

## Instalación

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
```

## Ejecución

```bash
npm run dev
```

Levanta el servidor en `http://localhost:3000`. El frontend ya apunta ahí por
defecto (`EXPO_PUBLIC_API_BASE_URL`, ver `src/config/environment.ts` de la app).

## Pruebas

```bash
npm test
```

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

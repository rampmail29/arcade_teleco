# ARCADE UTS — Backend API (Corte 2) — Diseño

- **Fecha:** 2026-10-15
- **Autor:** spuwvy (grupo de backend), con Claude Code
- **Estado:** aprobado en chat, pendiente de plan de implementación
- **Rama:** `feature/backend-api`

## 1. Propósito y alcance

Implementar la API REST propia que `ARCADE_UTS_Especificacion.md` reserva para Corte 2
(secciones 2, 11, 23, 24, 30): un backend Node + Express + ORM + base de datos
relacional que el `apiClient` del frontend (ya existente en
`src/services/apiClient.ts`, sin consumidores todavía) empezará a usar en lugar de
`mockData`.

**Dentro de alcance de este PR:**
- Servidor Express corriendo en `http://localhost:3000`, prefijo `/api`.
- Base de datos SQLite + Prisma como ORM.
- Endpoints: `GET /api/games`, `GET /api/games/:id`, `POST /api/games/:id/scores`,
  `GET /api/games/:id/history`, `GET /api/rankings`.
- Seed con los 5 juegos ya definidos en el frontend (`trivia`, `memorama`, `sudoku`,
  `game4`, `robotrun` — este último viene de la PR #12, todavía sin mergear a `main`,
  pero ya es código real del equipo).
- Tests automatizados de cada endpoint.
- `backend/README.md` con instalación y ejecución.

**Fuera de alcance de este PR (documentado como follow-up):**
- `GET /api/users/me` y cualquier verificación de JWT de Supabase — requiere
  coordinarse con el grupo de Auth (su secreto de Supabase es propio de cada proyecto
  que cada estudiante crea localmente; no hay uno compartido en el repo). Se resuelve
  en un PR posterior.
- Cambiar el frontend para que consuma esta API en lugar de `mockData` — eso le
  corresponde a cada grupo de juego/hub, no a este PR (regla de la spec, sección 18:
  cada grupo trabaja dentro de su módulo).
- Despliegue a un servidor público. Corte 2 es local: cada quien corre su propio
  backend contra `localhost:3000`, igual que ya hace `ENV.API_BASE_URL` por defecto.

## 2. Validación contra el proyecto real (auditoría)

Antes de este diseño se releyó `ARCADE_UTS_Especificacion.md` completo y se revisó el
código de las ramas `main`, `Auth` (PR #13) y `feature/game-robotrun` (PR #12):

- `src/services/apiClient.ts` existe, es genérico (`get/post/put/delete` sobre
  `fetch`), y **no tiene ningún consumidor todavía** (`grep` solo encuentra su propia
  definición) — cero riesgo de colisión.
- No existe `gameService`, `userService` ni `rankingService` en ninguna rama.
- `src/types/index.ts` ya define `Game { id, title, description, icon, route }` y
  `RankingEntry { user, score }` (donde `user` es un email, según el mock:
  `estudiante1@uts.edu.co`).
- `src/services/scoreService.ts` (PR #12) documenta explícitamente: *"Corte 2:
  reemplazar el cuerpo de estas funciones por llamadas a apiClient (p. ej.
  `POST /api/games/:id/scores`)"* y su `SaveScoreResult` es `{ bestScore: number,
  isNewRecord: boolean }` — este diseño adopta ese mismo shape como respuesta del
  endpoint para no forzar un cambio de contrato cuando el frontend migre.
- `src/data/games.ts` en la rama de Robot Run ya tiene los 5 ids reales a sembrar.
- El grupo de Auth usa Supabase únicamente para autenticación y documenta
  explícitamente (`AUTH_SUPABASE.md`): *"No se usa Firestore ni ninguna base de datos
  de Supabase como store de negocio"* — confirma que este backend necesita su propia
  base de datos, separada de la de Auth.

## 3. Arquitectura

Segundo proyecto npm dentro del mismo monorepo (la spec, sección 19, exige monorepo):

```text
arcade_teleco/
├── (app Expo/RN, como ya está, intacta)
└── backend/
    ├── package.json          ← node_modules propio, independiente del de la app
    ├── tsconfig.json
    ├── .env.example
    ├── .gitignore            ← dev.db, node_modules, .env
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    ├── src/
    │   ├── server.ts         ← crea la app Express y levanta el puerto
    │   ├── app.ts            ← registra middlewares y rutas (separado de server.ts para poder testear sin levantar el puerto)
    │   ├── routes/
    │   │   └── games.routes.ts
    │   ├── controllers/
    │   │   └── games.controller.ts
    │   ├── services/
    │   │   └── games.service.ts
    │   ├── middleware/
    │   │   └── errorHandler.ts
    │   └── lib/
    │       └── prisma.ts     ← instancia única de PrismaClient
    └── test/
        └── games.test.ts
```

Capas, mismo espíritu que ya usa el frontend (spec, sección 9-11):

```text
route → controller → service → Prisma Client → SQLite (dev.db)
```

- **route**: solo mapea método + path al controller correspondiente. No lógica.
- **controller**: valida entrada (tipos, existencia de params), llama al service,
  traduce el resultado a respuesta HTTP (status + JSON). No habla con Prisma
  directamente.
- **service**: lógica de negocio (p. ej. "¿es un récord nuevo?", "¿cuál es el mejor
  puntaje por usuario y juego?"). Única capa que importa `prisma`.

Ningún otro módulo del backend importa `@prisma/client` directamente — mismo
principio de "una sola puerta de entrada" que la spec aplica a Firebase/Supabase y al
cliente HTTP del frontend.

## 4. Modelo de datos (Prisma + SQLite)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // file:./dev.db
}

generator client {
  provider = "prisma-client-js"
}

model Game {
  id          String  @id          // "trivia" | "memorama" | "sudoku" | "game4" | "robotrun"
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

Notas de diseño:
- No hay tabla `Ranking`: se calcula agregando `Score` (máximo `value` por
  `userId`+`gameId`, u ordenado globalmente). Evita datos derivados duplicados que se
  puedan desincronizar.
- `User` se identifica por **email**, no por el id de Supabase — porque este PR no
  verifica JWT (ver sección 1, fuera de alcance). El `email` llega en el body de
  `POST /scores` y el service hace upsert (crea el `User` si no existe). Cuando se
  integre JWT de Supabase (follow-up), `User.id` pasará a ser el `sub` del token; el
  cambio queda aislado en `games.service.ts`, no toca rutas ni controllers.
- `seed.ts` inserta los 5 `Game` con los ids/títulos/descripciones ya definidos en
  `src/data/games.ts` del frontend, para que `GET /api/games` devuelva exactamente
  esos nombres sin que el frontend tenga que cambiar nada al migrar de `mockData`.

## 5. Endpoints

| Método | Ruta | Body / Query | Respuesta 200 | Errores |
|---|---|---|---|---|
| GET | `/api/games` | — | `Game[]` | — |
| GET | `/api/games/:id` | — | `Game` | 404 si no existe |
| POST | `/api/games/:id/scores` | `{ score: number, email: string }` | `{ bestScore: number, isNewRecord: boolean }` | 400 si falta `score`/`email` o `score` no es número positivo; 404 si el juego no existe |
| GET | `/api/games/:id/history` | `?limit=` (opcional, default 20) | `{ value: number, email: string, createdAt: string }[]` | 404 si el juego no existe |
| GET | `/api/rankings` | `?gameId=` (opcional) | `RankingEntry[]` → `{ user: string, score: number }[]`, ordenado desc por `score`. Con `gameId`: el mejor `Score.value` de cada usuario en ese juego. Sin `gameId`: el mejor `Score.value` individual de cada usuario entre todos sus juegos (el máximo de una sola partida, **no** la suma de sus mejores puntajes por juego) | 404 si `gameId` no existe |

`Game` devuelto por la API: `{ id, title, description }` — el frontend añade `icon` y
`route` localmente (son puramente de presentación/navegación, no datos de negocio;
`games.ts` del frontend seguirá existiendo para eso cuando migre).

## 6. Manejo de errores

Middleware único de errores (`middleware/errorHandler.ts`) al final de la cadena de
Express. Toda respuesta de error:

```json
{ "error": "mensaje legible" }
```

con el código HTTP correspondiente (400 validación, 404 no encontrado, 500 no
esperado). El `apiClient` del frontend ya solo evalúa `response.ok`
(`src/services/apiClient.ts:10`), así que cualquier status fuera de 2xx es suficiente
— el shape del body es para debug humano y para cuando algún `*Service` del frontend
quiera leer `error` en el futuro.

## 7. Testing

`node:test` (incluido en Node 22, sin dependencia nueva) + `supertest` para pegarle a
la app Express sin levantar el puerto real. Una base SQLite de prueba separada
(`file:./test.db`, gitignored), reseteada antes de cada test. Un archivo de test por
recurso (`test/games.test.ts` cubre games, scores, history, rankings). Nada de Jest ni
frameworks pesados — mismo criterio de "stack chico" que la spec pide para el
frontend (sección 25).

## 8. Instalación y ejecución (para `backend/README.md`)

```bash
cd backend
npm install
cp .env.example .env        # DATABASE_URL="file:./dev.db"
npx prisma migrate dev      # crea dev.db y aplica el schema
npx prisma db seed          # inserta los 5 juegos
npm run dev                 # levanta Express en :3000
npm test                    # corre los tests
```

Node usado: 22.19.0 (el mismo ya pineado para el proyecto vía `mise.local.toml` en la
raíz; no se repitea en `backend/` porque hereda del directorio padre).

## 9. Plan de ramas y PR

- Rama: `feature/backend-api` (ya creada localmente desde `main`), siguiendo la
  convención `feature/*` de la spec (sección 19).
- Un solo PR con: este spec committeado, el scaffold de `backend/`, el schema +
  seed, los 5 endpoints, los tests, y `backend/README.md`.
- PR dirigido a `main` (el profesor indicó PRs hacia `main` o `dev`; se usa `main`
  porque es donde vive el resto del trabajo mergeado).
- Mensajes de commit y PR en español, atribuidos a la cuenta `spuwvy`.

## 10. Riesgos / decisiones abiertas para el siguiente PR

- **Identidad real de usuario:** hoy se confía en el `email` que manda el cliente sin
  verificar. Es aceptable para Corte 2 temprano (nadie más llama a este backend
  todavía), pero antes de que el frontend lo consume de verdad hay que decidir con el
  grupo de Auth cómo verificar el JWT de Supabase (secreto compartido, JWKS, o un
  endpoint de introspección). Se deja fuera deliberadamente de este PR.
- **SQLite vs Postgres:** si el profesor pide explícitamente Postgres más adelante,
  Prisma permite el cambio editando `datasource.provider` y `DATABASE_URL` sin tocar
  queries ni schema de modelos (sintaxis compatible).

# ARCADE UTS

## 1. Nombre

**ARCADE UTS** — aplicación móvil educativa desarrollada como proyecto de aula.

## 2. Objetivo

Servir como proyecto de aula durante tres cortes académicos de la asignatura, validando
progresivamente arquitectura frontend, navegación y, más adelante, integración con una
API REST propia.

## 3. Stack

**Frontend**
- React Native + Expo (EAS) + TypeScript
- React Navigation
- AsyncStorage (cuando sea necesario)
- Fetch para HTTP

**Autenticación**
- No incluida en el scaffold base. Cada grupo de trabajo implementará su propia
  estrategia (Firebase Authentication, backend propio, OAuth, etc.) en una fase
  posterior del curso. Ver sección 11.

**Backend futuro** (no implementado en esta versión)
- Node.js + Express, API REST, ORM, base de datos relacional

**Control de versiones**
- Git + GitHub, ramas por funcionalidad, Pull Requests, revisión de código

## 4. Requisitos

- Node.js LTS
- npm
- Expo Go (dispositivo físico) o emulador Android/iOS

## 5. Instalación

```bash
npm install
```

## 6. Ejecución

```bash
npx expo start
```

Escanear el QR con Expo Go, o presionar `a` / `i` para abrir en un emulador.

## 7. Árbol de directorios

```text
arcade-uts-mobile/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── game/
│   ├── screens/
│   │   ├── home/
│   │   └── games/
│   │       ├── trivia/
│   │       ├── memorama/
│   │       ├── sudoku/
│   │       └── game4/
│   ├── navigation/
│   ├── services/
│   ├── utils/
│   ├── data/
│   └── types/
├── App.tsx
├── package.json
├── app.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 8. Responsabilidades de cada directorio

| Carpeta | Responsabilidad |
|---|---|
| `assets/` | Recursos estáticos (imágenes, iconos, fuentes). Sin lógica de aplicación. |
| `components/common/` | Componentes reutilizables generales (`AppButton`, `AppCard`, `AppInput`, `Loading`, `ErrorMessage`). |
| `components/game/` | Componentes comunes al concepto de juego (`GameCard`, `GameGrid`, `GameHeader`). No dependen de un juego específico. |
| `screens/` | Vistas completas. Consumen componentes, services y datos — nunca HTTP directo (ver `services/apiClient`). |
| `navigation/` | `AppNavigator` (único `NavigationContainer`) y `GameNavigator`. |
| `services/` | `apiClient`: cliente HTTP común, preparado para el Corte 2 (sin backend real todavía). |
| `utils/` | Constantes, validadores y formateadores puros. |
| `data/` | `games.js` (catálogo de juegos) y `mockData.js` (datos temporales del Corte 1). |
| `types/` | Tipos e interfaces de TypeScript compartidos (`Game`, `RootStackParamList`, datos mock, etc.). |

## 9. Arquitectura

```text
                    APP
                     |
       +-------------+-------------+
       |             |             |
    SCREENS      COMPONENTS    NAVIGATION
       |             |             |
       +-------------+-------------+
                     |
                 SERVICES
                     |
                apiClient
                     |
                 API REST
                     |
                  BACKEND
                     |
                 DATABASE
```

Principio fundamental: `SCREEN → SERVICE → API CLIENT → BACKEND`.
Ninguna screen debe saltarse esta cadena ni hacer `fetch()` directo.

Cuando cada grupo incorpore su estrategia de autenticación, esta cadena se antepone
con su propio flujo (hook/context/servicio de auth) — ver sección 11.

## 10. Navegación

```text
                 App
                  |
              Game Hub
                  |
   +--------------+--------------+
   |              |              |
 Trivia        Memorama       Sudoku ... Game4
```

`AppNavigator` monta un único `NavigationContainer` y renderiza `GameNavigator`
directamente: no hay bifurcación por estado de sesión en el scaffold base (ver
sección 11).

## 11. Autenticación

**Intencionalmente no incluida en este scaffold.** El árbol de directorios no trae
`context/`, `hooks/` ni un servicio de autenticación: cada grupo de trabajo diseñará
e implementará su propia estrategia (Firebase Authentication, backend propio con JWT,
OAuth, etc.) como parte de su entrega.

Recomendación de patrón, independientemente de la estrategia elegida:

```text
LoginScreen
    |
    v
useAuth() (hook propio del grupo)
    |
    v
AuthContext (o el mecanismo de estado global que el grupo defina)
    |
    v
authService (encapsula el proveedor elegido)
    |
    v
Proveedor de autenticación (Firebase, backend propio, etc.)
```

Regla que se mantiene sin importar la estrategia: ninguna `Screen` debe llamar
directamente al proveedor de autenticación. Siempre debe pasar por un
hook/servicio propio, replicando el mismo principio de capas del resto del proyecto
(sección 9).

## 12. Git/GitHub

Monorepo. Convención de ramas:

```text
main
feature/auth
feature/game-hub
feature/game-trivia
feature/game-memorama
feature/game-sudoku
feature/game-game4
feature/game-...
```

Flujo: `branch → commit → push → Pull Request → Code Review → merge`.
No se trabaja directamente sobre `main`.

## 13. Estado actual

- **Corte 1 (en curso):** scaffold de arquitectura en TypeScript (Expo 57 / React
  Native 0.86), navegación, componentes comunes y datos mock. Rama de esta entrega:
  `chore/initial_arq`.
- Sin estrategia de autenticación (ver sección 11): queda a cargo de cada grupo.
- Los juegos (Trivia, Memorama, Sudoku, Game4, etc.) están representados con sus tres
  pantallas (Home, Game, Result) de forma demostrativa, pendientes de lógica real por
  parte de cada grupo.

## 14. Evolución hacia API REST

```text
CORTE 1                CORTE 2                    CORTE 3
Frontend (TS)     →     API REST                → Integración final
+ Mock Data              services/apiClient/HTTP    Auth definitiva por grupo
                          → Backend → Database        Testing, CI/CD, Deployment
                                                        → APK
```

Endpoints preliminares de referencia (no definitivos):

```text
GET    /api/games
GET    /api/games/:id
POST   /api/games/:id/scores
GET    /api/rankings
GET    /api/users/me
GET    /api/games/:id/history
```

---

React Native es solo el frontend de un sistema mayor.

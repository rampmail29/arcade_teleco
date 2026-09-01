# ARCADE UTS

## 1. Nombre

**ARCADE UTS** — aplicación móvil educativa desarrollada como proyecto de aula.

## 2. Objetivo

Servir como proyecto de aula durante tres cortes académicos de la asignatura, validando
progresivamente arquitectura frontend, navegación, autenticación y, más adelante,
integración con una API REST propia.

## 3. Stack

**Frontend**
- React Native + Expo + JavaScript + JSX
- React Navigation
- Firebase Authentication
- AsyncStorage (cuando sea necesario)
- Fetch para HTTP

**Backend futuro** (no implementado en esta versión)
- Node.js + Express, API REST, ORM, base de datos relacional

**Control de versiones**
- Git + GitHub, ramas por funcionalidad, Pull Requests, revisión de código

## 4. Requisitos

- Node.js LTS
- npm
- Expo Go (dispositivo físico) o emulador Android/iOS
- Cuenta de Firebase (Authentication habilitado)

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
│   │   ├── auth/
│   │   ├── home/
│   │   └── games/
│   │       ├── trivia/
│   │       ├── memorama/
│   │       ├── sudoku/
│   │       └── game4/
│   ├── navigation/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── data/
├── App.jsx
├── package.json
├── app.json
├── .gitignore
└── README.md
```

## 8. Responsabilidades de cada directorio

| Carpeta | Responsabilidad |
|---|---|
| `assets/` | Recursos estáticos (imágenes, iconos, fuentes). Sin lógica de aplicación. |
| `components/common/` | Componentes reutilizables generales (`AppButton`, `AppCard`, `AppInput`, `Loading`, `ErrorMessage`). |
| `components/game/` | Componentes comunes al concepto de juego (`GameCard`, `GameGrid`, `GameHeader`). No dependen de un juego específico. |
| `screens/` | Vistas completas. Consumen componentes, hooks, context y services — nunca HTTP ni Firebase directamente. |
| `navigation/` | `AppNavigator`, `AuthNavigator`, `GameNavigator`. Un único `NavigationContainer`. |
| `context/` | `AuthContext`: estado global de autenticación. Sin componentes visuales. |
| `hooks/` | `useAuth`: encapsula el acceso a `AuthContext`. |
| `services/` | `authService` (Firebase) y `apiClient` (HTTP común, preparado para el Corte 2). |
| `utils/` | Constantes, validadores y formateadores puros. |
| `config/` | `firebase.js` y `environment.js`: configuración centralizada. |
| `data/` | `games.js` (catálogo de juegos) y `mockData.js` (datos temporales del Corte 1). |

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
              HOOKS / CONTEXT
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

Firebase Authentication
          |
       Identity
```

Principio fundamental: `SCREEN → HOOK/CONTEXT → SERVICE → API CLIENT → BACKEND`.
Ninguna screen debe saltarse esta cadena.

## 10. Navegación

```text
                 App
                  |
          ¿Autenticado?
             /       \
           NO         SÍ
           |           |
           v           v
         Login      Game Hub
                       |
          +------------+------------+
          |            |            |
        Trivia       Memorama     Sudoku ... Game4
```

`AppNavigator` decide el flujo activo según `isAuthenticated` (nunca ocultando botones:
el árbol de navegación depende del estado real). Existe un estado `loading` durante la
restauración inicial de sesión.

## 11. Autenticación

```text
LoginScreen
    |
    v
useAuth()
    |
    v
AuthContext
    |
    v
authService
    |
    v
Firebase Authentication
```

Firebase responde **quién es el usuario**. El backend futuro responderá **qué puede
hacer y qué información de negocio puede consultar/modificar**. No se usa Firestore
como base de datos principal del proyecto.

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

- **Corte 1 (en curso):** scaffold de arquitectura, navegación, componentes comunes,
  autenticación con Firebase y datos mock. Rama de esta entrega: `chore/initial_arq`.
- Los juegos (Trivia, Memorama, Sudoku, Game4, etc.) están representados con sus tres
  pantallas (Home, Game, Result) de forma demostrativa, pendientes de lógica real por
  parte de cada grupo.

## 14. Evolución hacia API REST

```text
CORTE 1                CORTE 2                    CORTE 3
Frontend + Auth   →     API REST                → Integración final
Firebase                services/apiClient/HTTP     Testing, CI/CD, Deployment
Mock Data               → Backend → Database         → APK
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

React Native es solo el FE de un sistema mayor

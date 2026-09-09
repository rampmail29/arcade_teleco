# ARCADE UTS — Especificación técnica y prompt maestro para Claude Code

## 1. Propósito

Este documento define la especificación inicial de **ARCADE UTS**, una aplicación móvil educativa desarrollada con **React Native + Expo + JavaScript**, que servirá como proyecto de aula durante tres cortes académicos.

La primera versión será construida por el docente para validar la arquitectura, navegación, autenticación, estructura de directorios, integración de juegos y decisiones pedagógicas antes de entregar el proyecto a los estudiantes.

La estrategia será incremental:

- **Corte 1:** frontend, navegación, UX/UI, componentes, Firebase Authentication y datos mock.
- **Corte 2:** API REST, servicios, `apiClient`, integración con backend y base de datos.
- **Corte 3:** pruebas, refactorización, CI/CD, despliegue y APK/build.

---

## 2. Stack

### Frontend

- React Native
- Expo
- JavaScript
- JSX
- React Navigation
- Firebase Authentication
- AsyncStorage cuando sea necesario
- Fetch para HTTP

### Backend futuro

- Node 
- Express
- API REST
- ORM
- Base de datos relacional

El backend **no se implementa en esta versión**.

### Control de versiones

- Git
- GitHub
- ramas por funcionalidad
- Pull Requests
- revisión de código

---

## 3. Arquitectura general

```text
                         ARCADE UTS
                             |
                    FRONTEND MOBILE
                             |
              +--------------+--------------+
              |                             |
        Firebase Auth                 API REST futura
              |                             |
              |                       Node /Express
              |                             |
              |                          Database
              |
            Usuario
```

Durante el Corte 1:

```text
React Native
     |
     +---- Firebase Authentication
     |
     +---- Mock Data
```

Durante el Corte 2:

```text
React Native
     |
     v
 services/
     |
     v
 apiClient 
     |
     | HTTP / JSON
     v
 API REST
     |
     v
 Backend
     |
     v
 Database
```

Principio fundamental:

```text
SCREEN
   |
   v
HOOK / CONTEXT
   |
   v
SERVICE
   |
   v
API CLIENT
   |
   v
BACKEND
```

Para autenticación:

```text
SCREEN
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

---

# 4. Árbol de directorios

```text
arcade-uts-mobile/
|
+-- assets/
|   +-- images/
|   +-- icons/
|   +-- fonts/
|
+-- src/
|   |
|   +-- components/
|   |   +-- common/
|   |   |   +-- AppButton  
|   |   |   +-- AppCard  
|   |   |   +-- AppInput  
|   |   |   +-- Loading  
|   |   |   +-- ErrorMessage  
|   |   |
|   |   +-- game/
|   |       +-- GameCard  
|   |       +-- GameGrid  
|   |       +-- GameHeader  
|   |
|   +-- screens/
|   |   +-- auth/
|   |   |   +-- LoginScreen  
|   |   |
|   |   +-- home/
|   |   |   +-- HomeScreen  
|   |   |
|   |   +-- games/
|   |       +-- trivia/
|   |       |   +-- TriviaHomeScreen  
|   |       |   +-- TriviaGameScreen  
|   |       |   +-- TriviaResultScreen  
|   |       |
|   |       +-- memorama/
|   |       |   +-- MemoramaHomeScreen  
|   |       |   +-- MemoramaGameScreen  
|   |       |   +-- MemoramaResultScreen  
|   |       |
|   |       +-- sudoku/
|   |       |   +-- SudokuHomeScreen  
|   |       |   +-- SudokuGameScreen  
|   |       |   +-- SudokuResultScreen  
|   |       |
|   |       +-- game4/
|   |           +-- Game4HomeScreen  
|   |           +-- Game4GameScreen  
|   |           +-- Game4ResultScreen  
|   |
|   +-- navigation/
|   |   +-- AppNavigator  
|   |   +-- AuthNavigator  
|   |   +-- GameNavigator  
|   |
|   +-- context/
|   |   +-- AuthContext  
|   |
|   +-- hooks/
|   |   +-- useAuth 
|   |
|   +-- services/
|   |   +-- apiClient 
|   |   +-- authService 
|   |
|   +-- utils/
|   |   +-- constants 
|   |   +-- validators 
|   |   +-- formatters 
|   |
|   +-- config/
|   |   +-- firebase 
|   |   +-- environment 
|   |
|   +-- data/
|       +-- games 
|       +-- mockData 
|
+-- App  
+-- package on
+-- app on
+-- .gitignore
+-- README.md
```

---

# 5. Responsabilidad de cada directorio

## `/assets`

Recursos estáticos: imágenes, iconos, fuentes y posteriormente sonidos.

No contiene lógica de aplicación.

## `/components`

Componentes reutilizables.

### `/components/common`

Componentes generales:

- `AppButton`
- `AppCard`
- `AppInput`
- `Loading`
- `ErrorMessage`

### `/components/game`

Componentes comunes al concepto de juego:

- `GameCard`
- `GameGrid`
- `GameHeader`

Los componentes comunes no deben depender de un juego específico.

---

# 6. `/screens`

Una screen representa una vista completa.

Ejemplos:

```text
LoginScreen
HomeScreen
TriviaGameScreen
TriviaResultScreen
```

Las screens pueden consumir componentes, hooks, context y services, pero no deben realizar directamente llamadas HTTP ni acceder directamente a Firebase.

Evitar:

```javascript
fetch("https://...")
```

dentro de un Screen.

Preferir:

```text
Screen
  |
  v
Service
  |
  v
apiClient
```

---

# 7. `/navigation`

Debe existir **un único `NavigationContainer`**.

## `AppNavigator`

Decide qué flujo está activo:

```text
No autenticado -> AuthNavigator
Autenticado     -> GameNavigator
```

## `AuthNavigator`

Inicialmente contiene:

```text
Login
```

## `GameNavigator`

Contiene las pantallas protegidas:

```text
Home
Trivia
Memorama
Sudoku
Game4
```

El grupo de Game Hub administra la navegación global.

Cada grupo de juego administra su navegación interna.

---

# 8. Flujo de navegación

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
        Trivia       Memorama     Sudoku
          |            |            |
       flujo        flujo         flujo
       interno      interno       interno
```

El usuario no autenticado no debe poder acceder al Game Hub simplemente ocultando botones. El árbol de navegación debe depender de `isAuthenticated`.

Debe existir un estado `loading` durante la restauración inicial de la sesión.

---

# 9. `/context`

## `AuthContext  `

Debe exponer conceptualmente:

```javascript
{
  user,
  isAuthenticated,
  loading,
  login,
  logout
}
```

El contexto comparte el estado de autenticación. No contiene componentes visuales.

---

# 10. `/hooks`

Inicialmente:

```text
useAuth 
```

Debe permitir:

```javascript
const {
  user,
  isAuthenticated,
  login,
  logout
} = useAuth();
```

Los hooks encapsulan lógica reutilizable relacionada con React.

No crear hooks innecesarios.

---

# 11. `/services`

## `authService `

Encapsula Firebase Authentication:

- login;
- logout;
- observación del estado;
- posteriormente registro y recuperación de contraseña si se requieren.

Las screens no deben importar directamente funciones de Firebase.

## `apiClient `

Será el cliente HTTP común del segundo corte.

Conceptualmente:

```text
gameService
userService
rankingService
      |
      v
  apiClient
      |
      v
    HTTP
      |
      v
   API REST
```

No crear un `fetch` independiente por grupo.

En el Corte 1 puede existir preparado sin backend real.

---

# 12. Firebase Authentication

La autenticación estará desacoplada del backend académico.

```text
React Native
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

Firebase responde a:

> ¿Quién es el usuario?

El backend futuro responderá a:

> ¿Qué puede hacer el usuario y qué información de negocio puede consultar/modificar?

No utilizar Firestore como base de datos principal del proyecto.

## Google Authentication

Si se requiere específicamente Google Sign-In, implementar Firebase Authentication con proveedor Google.

Debe documentarse que determinados flujos nativos de Google Sign-In requieren un development build y no deben asumirse compatibles con Expo Go.

La integración debe quedar encapsulada en:

```text
config/firebase 
services/authService 
context/AuthContext  
hooks/useAuth 
```

No almacenar contraseñas manualmente en AsyncStorage.

---

# 13. `/config`

## `firebase `

Inicializa Firebase.

La configuración no debe estar dispersa por las screens.

## `environment `

Centraliza configuración del entorno, por ejemplo:

```javascript
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL
};
```

No escribir URLs de backend directamente en componentes.

No subir secretos privados al repositorio.

---

# 14. `/utils`

## `constants `

Constantes compartidas:

```text
APP_NAME
GAME_TYPES
MAX_GAME_SCORE
```

## `validators `

Validaciones puras:

```text
isValidEmail()
isValidPassword()
```

## `formatters `

Funciones como:

```text
formatScore()
formatDate()
```

No convertir `utils` en un cajón de sastre.

---

# 15. `/data`

## `games `

Catálogo central de juegos:

```javascript
[
  {
    id: 'trivia',
    title: 'Trivia',
    description: '...',
    icon: '...',
    route: 'Trivia'
  }
]
```

El Game Hub debe consumir este catálogo.

No codificar cinco botones independientes manualmente.

## `mockData `

Datos temporales para el Corte 1:

- preguntas;
- niveles;
- tableros;
- tarjetas;
- puntajes.

Posteriormente serán reemplazados por datos de API.

---

# 16. Game Hub

La pantalla principal debe denominarse **Game Hub** o **Home**, no `LandingPage`.

Archivo:

```text
src/screens/home/HomeScreen  
```

Debe presentar:

- nombre de ARCADE UTS;
- usuario autenticado;
- cuadrícula de juegos;
- cierre de sesión.

Conceptualmente:

```text
+--------------------------------+
|          ARCADE UTS            |
|                                |
| Hola, usuario                  |
|                                |
| +-----------+ +-----------+    |
| |  TRIVIA   | | MEMORAMA  |    |
| |   JUGAR   | |   JUGAR   |    |
| +-----------+ +-----------+    |
|                                |
| +-----------+ +-----------+    |
| |  SUDOKU   | |   JUEGO4  |    |
| |   JUGAR   | |   JUGAR   |    |
| +-----------+ +-----------+    |
|                                |
|        Cerrar sesión           |
+--------------------------------+
```

La cuadrícula debe reutilizar:

```text
GameGrid
   |
   +-- GameCard
```

---

# 17. Responsabilidades de los grupos

Con cinco grupos:

| Grupo | Responsabilidad |
|---|---|
| 1 | Auth |
| 2 | Game Hub + navegación |
| 3 | Juego 1 |
| 4 | Juego 2 |
| 5 | Juego 3 |

Con seis grupos:

| Grupo | Responsabilidad |
|---|---|
| 1 | Auth |
| 2 | Game Hub + navegación |
| 3 | Juego 1 |
| 4 | Juego 2 |
| 5 | Juego 3 |
| 6 | Juego 4 |

Los dos estudiantes con experiencia deben participar como referentes técnicos de integración/revisión, preferiblemente en grupos diferentes.

---

# 18. Reglas de integración

Ningún grupo debe:

- crear otro `NavigationContainer`;
- crear su propio cliente HTTP;
- duplicar autenticación;
- duplicar componentes comunes;
- modificar arbitrariamente la arquitectura común;
- llamar directamente a Firebase desde sus screens;
- realizar `fetch()` directamente desde una screen;
- cambiar las convenciones globales sin revisión.

Cada grupo trabaja principalmente dentro de su módulo.

Ejemplo:

```text
screens/games/trivia/
```

---

# 19. Git/GitHub

Utilizar un **monorepo**.

Ramas:

```text
main

feature/auth
feature/game-hub
feature/game-trivia
feature/game-memorama
feature/game-sudoku
feature/game-game4
```

Flujo:

```text
branch
   |
   v
commit
   |
   v
push
   |
   v
Pull Request
   |
   v
Code Review
   |
   v
merge
```

No trabajar directamente sobre `main`.

---

# 20. Convenciones

Componentes:

```text
HomeScreen  
GameCard  
LoginScreen  
```

Funciones/servicios:

```text
authService 
apiClient 
formatScore()
```

Evitar nombres ambiguos como:

```text
Screen2  
helper 
misc 
utils2 
```

---

# 21. UX/UI

La interfaz debe ser moderna, sencilla y consistente.

Debe demostrar:

- jerarquía visual;
- consistencia;
- reutilización;
- navegación clara;
- feedback;
- estados de carga;
- mensajes de error;
- adecuación a dispositivos móviles.

No incorporar inicialmente una biblioteca visual externa.

Utilizar `StyleSheet`.

---

# 22. Estado

Diferenciar:

### Estado local

Ejemplo:

```text
selectedAnswer
score
isPressed
```

### Estado global

Ejemplo:

```text
user
isAuthenticated
```

gestionado por `AuthContext`.

### Datos remotos

En el futuro:

```text
ranking
partidas
puntajes
perfil
```

obtenidos mediante services/API.

---

# 23. Evolución de services

### Corte 1

```text
services/
├── authService 
└── apiClient 
```

Los juegos utilizan `mockData`.

### Corte 2

```text
services/
├── apiClient 
├── authService 
├── userService 
├── gameService 
├── rankingService 
└── scoreService 
```

La transición buscada es:

```text
ANTES

Screen
  |
  v
mockData


DESPUÉS

Screen
  |
  v
gameService
  |
  v
apiClient
  |
  v
API
```

---

# 24. API futura

El backend se diseñará posteriormente. Como referencia inicial:

```text
GET    /api/games
GET    /api/games/:id
POST   /api/games/:id/scores
GET    /api/rankings
GET    /api/users/me
GET    /api/games/:id/history
```

Estos endpoints son preliminares y no deben considerarse definitivos.

---

# 25. Dependencias

Utilizar `npx expo install` para paquetes que deban mantener compatibilidad con la versión instalada de Expo.

Dependencias principales:

```text
@react-navigation/native
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
firebase
@react-native-async-storage/async-storage
```

Google Sign-In nativo:

```text
@react-native-google-signin/google-signin
```

solo si se selecciona ese flujo.

No instalar Redux, Zustand, Axios, React Query ni otras soluciones innecesarias.

La intención pedagógica es mantener el stack pequeño.

---

# 26. README

Crear un README que explique:

1. nombre;
2. objetivo;
3. stack;
4. requisitos;
5. instalación;
6. ejecución;
7. árbol de directorios;
8. responsabilidades;
9. arquitectura;
10. navegación;
11. autenticación;
12. Git/GitHub;
13. estado actual;
14. evolución hacia API REST.

---

# 27. Criterios de aceptación

El preliminar estará listo cuando:

### Instalación

```text
npm install
```

funcione correctamente.

### Ejecución

```text
npx expo start
```

funcione de acuerdo con la configuración seleccionada.

### Autenticación

Usuario no autenticado:

```text
Login
```

Usuario autenticado:

```text
Game Hub
```

Logout:

```text
Game Hub -> Login
```

### Navegación

Cada juego debe poder abrirse desde el Game Hub y regresar.

### Juegos

Cada juego debe tener:

```text
Home
Game
Result
```

aunque la lógica sea demostrativa.

### Arquitectura

No debe haber:

- HTTP directo desde screens;
- Firebase directo desde screens;
- múltiples NavigationContainer;
- clientes HTTP duplicados.

---

# 28. Prompt maestro para Claude Code

Utilizar lo siguiente como prompt inicial:

> Actúa como arquitecto y desarrollador senior especializado en React Native, Expo, React Navigation, Firebase Authentication y arquitectura frontend modular.
>
> Construye una aplicación móvil educativa llamada ARCADE UTS.
>
> El proyecto será posteriormente utilizado como proyecto de aula universitario, por lo que la prioridad es una arquitectura clara, modular, sencilla de explicar y fácil de evolucionar.
>
> Utiliza React Native + Expo + JavaScript + JSX + React Navigation.
>
> No utilices Expo Router, TypeScript, Redux, Zustand, Axios, React Query ni otras librerías innecesarias.
>
> Crea exactamente la estructura de directorios especificada en este documento.
>
> Implementa:
>
> 1. AppNavigator.
> 2. AuthNavigator.
> 3. GameNavigator.
> 4. Un único NavigationContainer.
> 5. LoginScreen.
> 6. Firebase Authentication desacoplada.
> 7. AuthContext.
> 8. useAuth.
> 9. authService.
> 10. HomeScreen/Game Hub.
> 11. GameCard.
> 12. GameGrid.
> 13. Cuatro juegos demostrativos.
> 14. Tres screens por juego: Home, Game y Result.
> 15. mockData.
> 16. games .
> 17. components comunes.
> 18. apiClient preparado para el segundo corte.
> 19. config/firebase .
> 20. config/environment .
> 21. utils.
> 22. README completo.
>
> La autenticación debe seguir:
>
> ```text
> LoginScreen
>     |
>     v
> useAuth()
>     |
>     v
> AuthContext
>     |
>     v
> authService
>     |
>     v
> Firebase Authentication
> ```
>
> La navegación debe seguir:
>
> ```text
> AppNavigator
>      |
>      +-- AuthNavigator
>      |      |
>      |      +-- Login
>      |
>      +-- GameNavigator
>             |
>             +-- Home
>             +-- Trivia
>             +-- Memorama
>             +-- Sudoku
>             +-- Game4
> ```
>
> El Game Hub debe utilizar `games `, `GameGrid` y `GameCard`. No codificar manualmente cada botón.
>
> Los juegos deben utilizar datos mock en el Corte 1.
>
> No implementar backend.
>
> No utilizar Firestore como base de datos principal.
>
> Preparar `apiClient ` para que en el segundo corte los services puedan comunicarse con una API REST.
>
> No realizar llamadas HTTP directamente desde Screens.
>
> No acceder directamente a Firebase desde múltiples Screens.
>
> No crear más de un NavigationContainer.
>
> Mantener una estricta separación de responsabilidades.
>
> Utilizar StyleSheet para estilos.
>
> Implementar estados básicos de loading, error y success.
>
> Si se implementa Google Sign-In nativo, documentar explícitamente las dependencias, configuración y necesidad de development build cuando corresponda.
>
> Antes de terminar:
>
> - verifica imports;
> - verifica navegación;
> - verifica autenticación;
> - verifica logout;
> - verifica Home;
> - verifica acceso a cada juego;
> - verifica regreso al Home;
> - verifica ausencia de HTTP en Screens;
> - verifica ausencia de Firebase directo en Screens;
> - verifica que exista un único NavigationContainer;
> - verifica estructura de carpetas;
> - actualiza README;
> - proporciona instrucciones exactas de ejecución;
> - proporciona lista de archivos creados/modificados.
>
> No agregues funcionalidades no solicitadas.
>
> Si alguna decisión técnica entra en conflicto con la versión actual de Expo o React Navigation, detente, verifica la documentación oficial correspondiente y elige la implementación compatible, documentando la decisión.

---

# 29. Nota técnica para el docente

La primera versión debe ser entendida como un **prototipo arquitectónico docente**, no como el producto final.

Antes de entregarlo a los estudiantes, el docente debe poder responder:

1. ¿Por qué existe cada carpeta?
2. ¿Quién es responsable de modificarla?
3. ¿Cómo funciona el flujo de autenticación?
4. ¿Cómo funciona la navegación?
5. ¿Cómo entra un juego al Game Hub?
6. ¿Por qué los juegos no hacen `fetch()` directamente?
7. ¿Por qué existe `apiClient`?
8. ¿Qué cambia cuando aparezca el backend?
9. ¿Qué diferencia existe entre Firebase Authentication y el backend?
10. ¿Qué responsabilidad tiene cada grupo?

La arquitectura debe poder explicarse visualmente:

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

---

# 30. Evolución pedagógica

```text
                     CORTE 1
                        |
              FRONTEND + AUTH
                        |
       +----------------+----------------+
       |                |                |
      Auth           Game Hub          Games
       |                |                |
    Firebase        Navigation        Mock Data


                     CORTE 2
                        |
                   API REST
                        |
       +----------------+----------------+
       |                |                |
    Services         apiClient         HTTP
                                        |
                                        v
                                     Backend
                                        |
                                        v
                                    Database


                     CORTE 3
                        |
              INTEGRACIÓN FINAL
                        |
       +----------------+----------------+
       |                |                |
     Testing          CI/CD         Deployment
       |                                  |
       +----------------+-----------------+
                        |
                       APK
```

El objetivo final es que el estudiante comprenda que:

```text
React Native != toda la aplicación
```

sino que React Native constituye el frontend de un sistema mayor.

---

## Fuentes técnicas verificadas

La documentación actual de Expo indica que el Firebase JavaScript SDK puede utilizarse en proyectos Expo para servicios como Authentication y recomienda instalarlo mediante `npx expo install firebase`. También distingue el Firebase JS SDK de React Native Firebase; esta última alternativa requiere código nativo y no funciona con Expo Go. citeturn0search2turn0search4

La documentación actual de Firebase expone `initializeAuth` y `getReactNativePersistence` para configurar persistencia de autenticación en React Native mediante AsyncStorage. citeturn0search0

La documentación actual de React Navigation mantiene `@react-navigation/native` como paquete central y recomienda instalar las dependencias compatibles mediante `npx expo install`. citeturn0search1

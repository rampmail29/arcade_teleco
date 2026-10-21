# Autenticación con Supabase — ARCADE UTS

Implementación de login/registro por correo y contraseña usando Supabase Authentication. Sustituye a Firebase (mencionado en `ARCADE_UTS_Especificacion.md`) manteniendo exactamente la misma arquitectura por capas que define ese documento (sección 3, 9, 10, 11 y 12):

```
Screen (LoginScreen / HomeScreen)
   |
   v
useAuth()            <- hook, único punto de entrada para cualquier archivo
   |
   v
AuthContext          <- estado global: user, isAuthenticated, loading
   |
   v
authService          <- única capa que llama a Supabase
   |
   v
config/supabase      <- inicializa el cliente
   |
   v
Supabase Auth
```

`AppNavigator` decide el árbol de navegación completo según `isAuthenticated` (no oculta botones): no autenticado → `AuthNavigator`, autenticado → `GameNavigator`. Así todas las pantallas de `GameNavigator` quedan protegidas de forma centralizada.

> **Nota sobre el alcance**: se evaluó agregar OAuth con Google, pero se retiró para mantener el Corte 1 simple — solo requiere correo/contraseña. `authService` quedó preparado para agregar un proveedor OAuth más adelante sin tocar `AuthContext`, `useAuth` ni las screens (solo se agregaría una función nueva en el servicio).

## Librerías instaladas

| Paquete | Para qué |
|---|---|
| `@supabase/supabase-js` | Cliente oficial de Supabase (auth, sesión). |
| `react-native-url-polyfill` | Polyfill de `URL` que `supabase-js` necesita en React Native. |
| `@types/node` (dev) | Tipa `process.env` para que `environment.ts` compile sin errores de TypeScript. |

Para correr en web (`npm run web`) también se instalaron `react-dom`, `react-native-web` y `@expo/metro-runtime` (requeridos por Expo para el target web, no están relacionados con auth).

## Requisitos de `authService` cubiertos

Según la sección 11 del spec (`authService` encapsula el proveedor; login, logout, observación del estado, registro):

| Requisito del spec | Función en `authService.ts` |
|---|---|
| login | `login(email, password)` → `supabase.auth.signInWithPassword` |
| registro | `register(email, password)` → `supabase.auth.signUp` |
| logout | `logout()` → `supabase.auth.signOut` |
| observación del estado | `onAuthStateChange(callback)` → `supabase.auth.onAuthStateChange`, usado por `AuthContext` para mantener la sesión sincronizada en toda la app |
| restauración de sesión al abrir la app | `getSession()` → `supabase.auth.getSession` |

Recuperación de contraseña no se implementó: el spec la marca como opcional ("si se requieren") y no fue solicitada.

## Archivos creados / modificados

| Archivo | Rol |
|---|---|
| `src/config/environment.ts` *(editado)* | Agrega `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde variables de entorno. |
| `src/config/supabase.ts` | Crea el cliente de Supabase con `AsyncStorage` como storage de sesión. |
| `src/services/authService.ts` | `login`, `register`, `logout`, `getSession`, `onAuthStateChange`. Única capa que toca `supabase.auth`. |
| `src/context/AuthContext.tsx` | `AuthProvider` + `AuthContext`: expone `user`, `isAuthenticated`, `loading`, `login`, `register`, `logout`. |
| `src/hooks/useAuth.ts` | `useAuth()` — hook reutilizable en cualquier screen/componente. |
| `src/screens/auth/LoginScreen.tsx` | Pantalla única con toggle login/registro (correo + contraseña), notificaciones de éxito/error y estilos con `AppCard`. |
| `src/screens/home/HomeScreen.tsx` *(editado)* | Muestra el correo del usuario autenticado y el botón "Cerrar sesión". |
| `src/navigation/AuthNavigator.tsx` | Stack con `LoginScreen`, montado cuando no hay sesión. |
| `src/navigation/AppNavigator.tsx` *(editado)* | Usa `useAuth()` para elegir entre `AuthNavigator` y `GameNavigator`, mostrando `Loading` mientras se restaura la sesión. |
| `App.tsx` *(editado)* | Envuelve `AppNavigator` en `AuthProvider`. |
| `src/components/common/Notification.tsx` | Componente reutilizable para mensajes de éxito/error (banner de color), usable en cualquier screen. |
| `src/components/common/AppButton.tsx` *(editado)* | Estilos base (antes vacíos) + variante `secondary`, usado para "Cerrar sesión". |
| `src/components/common/AppInput.tsx` *(editado)* | Estilos base (antes vacíos): borde, padding, color de placeholder. |
| `src/components/common/AppCard.tsx` *(editado)* | Estilos base (antes vacíos): tarjeta blanca con sombra, usada en `LoginScreen`. |
| `.env.example` | Plantilla de variables de entorno requeridas. |

## Funcionamiento

1. **Arranque de la app**: `AuthProvider` llama a `authService.getSession()` para restaurar la sesión persistida en `AsyncStorage` y se suscribe a `onAuthStateChange`. Mientras tanto `loading = true` y `AppNavigator` muestra `Loading`.
2. **Sin sesión**: `AppNavigator` monta `AuthNavigator` → `LoginScreen`.
3. **Login/registro por correo**: `LoginScreen` valida con `isValidEmail`/`isValidPassword` (ya existentes en `utils/validators.ts`) y llama a `login()`/`register()` de `useAuth()`.
   - Si falla, muestra un `Notification` tipo `error` con el mensaje de Supabase.
   - Al registrarse con éxito, muestra un `Notification` tipo `success` ("Cuenta creada...") y vuelve al modo login.
4. **Cambio de sesión**: cualquier login/logout dispara `onAuthStateChange`, actualiza `session` en `AuthContext`, y `AppNavigator` re-renderiza cambiando todo el árbol de navegación entre `AuthNavigator` y `GameNavigator`.
5. **Logout**: el botón "Cerrar sesión" de `HomeScreen` llama a `logout()` de `useAuth()`; al completarse, `onAuthStateChange` limpia la sesión y `AppNavigator` regresa automáticamente a `AuthNavigator` (Login).
6. **Reutilización**: cualquier screen o componente futuro solo necesita `const { user, login, logout } = useAuth();` — no vuelve a tocar Supabase ni el contexto. Igual con `Notification`: cualquier screen puede mostrar `<Notification type="success" message="..." />` sin lógica propia.

## Configuración pendiente (fuera del código)

1. Crear un proyecto en [supabase.com](https://supabase.com) y copiar `Project URL` y `anon public key`.
2. Crear `.env` en la raíz (ya está en `.gitignore`) a partir de `.env.example`, completando `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Notas

- No se usa Firestore ni ninguna base de datos de Supabase como store de negocio: Supabase solo resuelve *quién es el usuario* (Auth), igual que el rol que el spec original le daba a Firebase.
- No se guardan contraseñas en `AsyncStorage`; solo se persiste el token de sesión que gestiona `supabase-js`.

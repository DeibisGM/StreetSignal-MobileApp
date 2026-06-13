# StreetSignal Mobile App

Aplicación móvil StreetSignal para reportes ciudadanos, seguimiento de casos y notificaciones en tiempo real.

Este repositorio contiene la app móvil en `React Native`. El backend vive en el servicio aparte de StreetSignal y debe estar disponible para que el login, los reportes y las notificaciones funcionen correctamente.

## Que incluye este repositorio

- App móvil para ciudadano y funcionario.
- Navegación por stacks y tabs.
- Login, registro y manejo de sesión.
- Creación, consulta y seguimiento de reportes.
- Lista de notificaciones en la app.
- Registro de token de dispositivo para push notifications.
- Notificaciones locales con `Notifee`.

## Requisitos previos

Instala esto antes de intentar correr el proyecto:

- `Node.js` 22 o superior.
- `npm`.
- `Java JDK 17`.
- `Android Studio` con Android SDK, platform tools y un emulador configurado.
- `adb` disponible en el PATH.
- Para iPhone/iOS: `Xcode` y `CocoaPods` solo en macOS.
- Un backend de StreetSignal corriendo y accesible desde el dispositivo o emulador.
- Una cuenta de Firebase configurada para Android push notifications.

## Estructura rápida

```text
/
├── README.md
├── docs/
│   └── api-contracts/        Contratos de API y recursos de apoyo
└── app/
    ├── android/              Proyecto Android nativo
    ├── ios/                  Proyecto iOS nativo
    ├── src/                  Código principal de la app
    ├── package.json          Scripts y dependencias
    ├── .env                  Variables de entorno opcionales
    └── .env.example          Ejemplo de configuración
```

## Antes de empezar con notificaciones

Para que las notificaciones sirvan se debe de cumplir con estas 3 cosas:

1. La app debe poder llegar al backend.
2. El dispositivo debe registrar su token en `POST /device-tokens`.
3. El backend debe enviar notificaciones push usando ese token.

Además, en Android se necesita:

- El archivo `app/android/app/google-services.json`.
- Permisos de notificación en Android 13+.
- Probar idealmente en un dispositivo real para push notifications. Las notificaciones locales pueden verse en emulador, pero las push de FCM son mas confiables en un teléfono real.

## Configuración del backend

La app consume el backend de StreetSignal desde `BASE_URL`.

### URL por defecto

Si no se cambias, la app usa la URL definida en `app/src/constants/index.ts`.

### Opción recomendada para desarrollo

Si se corre el backend localmente:

- Android emulator: usa `adb reverse tcp:5000 tcp:5000` o se debe configurar la IP que tiene la computadora.
- iOS simulator: `http://localhost:5000/api`.
- Dispositivo fisico: se usa la IP LAN de la computadora, por ejemplo `http://192.168.1.20:5000/api`.

### Variables de entorno opcionales

El repo trae `app/.env.example` y `app/.env`, pero la app es `bare React Native` y no lee esas variables automáticamente a menos que se configure un loader como `react-native-dotenv`.

Si se quiere usar `.env` con `EXPO_PUBLIC_API_URL`, se debe:

1. Instalar el plugin de env que se vaya a usar.
2. Configurarlo en `babel.config.js`.
3. Reiniciar Metro.

Si no se quiere editar eso, se deja la URL por defecto en `app/src/constants/index.ts`.

## Configuración de Firebase para push notifications

Este proyecto ya incluye soporte nativo para Firebase Messaging en Android:

- `@react-native-firebase/app`
- `@react-native-firebase/messaging`
- `Notifee` para mostrar notificaciones locales

### Archivos necesarios

- `app/android/app/google-services.json`

Ese archivo ya existe en este repositorio. Si clonas el proyecto en otra máquina, verifica que siga dentro de `app/android/app/`. O si no se encuentra registrarse en firebase y obtenerlo, posteriormente agregarlo a esa ruta.

### Gradle

Android ya está preparado para aplicar el plugin de Google Services desde:

- `app/android/build.gradle`
- `app/android/app/build.gradle`

No hay necesidad de editar esto para desarrollo normal.

## Como instalar y ejecutar

### 1. Ir a la carpeta de la app

```bash
cd app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar el backend

Antes de abrir la app, asegúrese de que el backend de StreetSignal este corriendo y responda en la URL que la app va a usar.

Si el backend expone `http://localhost:5000/api`, entonces:

- en el emulador de Android, ejecuta `adb reverse tcp:5000 tcp:5000` o cambia la IP del backend;
- en un teléfono físico, usa la IP real de tu PC o simplemente colocar localhost si la IP de la computadora no funciona.

### 4. Levantar Metro

```bash
npm start
```

### 5. Ejecutar Android

En otra terminal, desde `app/`:

```bash
npm run android
```

## Como ejecutar en iPhone / iOS

Solo aplica en macOS:

```bash
cd app/ios
pod install
cd ..
npm start
```

En otra terminal:

```bash
npm run ios
```

## Credenciales de prueba

Una vez que el backend este disponible:

| Rol | Email | Password |
|---|---|---|
| Ciudadano | ciudadano@test.com | 123456 |
| Funcionario | funcionario@test.com | 123456 |

## Como funcionan las notificaciones

La app tiene dos capas de notificación:

### 1. Registro del token del dispositivo

Después de un login real, la app:

1. pide permiso de notificaciones;
2. obtiene el token FCM del dispositivo;
3. registra ese token en el backend con `POST /device-tokens`.

Esto esta implementado en:

- `app/src/services/notificationService.ts`
- `app/src/navigation/RootNavigator.tsx`
- `app/src/api/notificationsService.ts`

### 2. Notificaciones locales dentro de la app

Mientras el usuario esta autenticado y la app esta activa, la app consulta notificaciones no leídas cada 60 segundos.

Si encuentra notificaciones nuevas:

- las guarda como conocidas por usuario;
- muestra una notificación local con `Notifee`.

Eso significa que:

- aunque el push del backend tarde, el usuario puede ver alertas dentro de la app;
- para push reales en segundo plano, el backend debe mandar FCM.

## Flujo recomendado para probar notificaciones

1. Levanta el backend.
2. Levanta Metro con `npm start`.
3. Ejecuta la app en Android.
4. Inicia sesión con una cuenta valida.
5. Acepta el permiso de notificaciones.
6. Verifica que el backend reciba el token del dispositivo.
7. Genera una notificación nueva desde el backend o desde el flujo de reportes.
8. Deja la app abierta para ver el polling y la notificación local.
9. Si quieres validar push real, prueba también en un teléfono físico.

## Solución de problemas

### La app no conecta al backend

- Verifica que el backend este corriendo.
- Revisa la URL usada por la app.
- En Android emulator, prueba `adb reverse tcp:5000 tcp:5000`.
- En dispositivo físico, usa la IP LAN de tu computadora. (A veces no reconoce la IP de la computadora, pero colando locallhost funciona, a veces no funciona locallhost y reconoce la IP del computador)

### No llegan notificaciones

- Confirma que el usuario inicio sesión.
- Revisa que el permiso de notificaciones fue aceptado.
- Verifica que exista `google-services.json`.
- Confirma que el backend esta guardando el token en `/device-tokens`.
- Confirma que el backend realmente este enviando push por FCM.

### Veo notificaciones en la app, pero no push en segundo plano

Eso normalmente significa que el polling funciona, pero el backend o Firebase aún no están enviando push reales.

### Android 13 o superior no muestra alertas

- Verifica el permiso `POST_NOTIFICATIONS`.
- Reinstala la app si ya habías negado el permiso y quieres volver a probar desde cero.

## Scripts disponibles

Desde `app/`:

```bash
npm start     # Metro bundler
npm run android
npm run ios
npm run web
npm run lint
npm test
```

## Estructura de Código

```text
app/src/
├── api/           Cliente HTTP y servicios por dominio
├── components/    Componentes reutilizables
├── constants/     URLs, estados y storage keys
├── features/      Pantallas por modulo
├── hooks/         Hooks personalizados
├── navigation/    Navegación y auth
├── services/      Servicios de notificación y otros flujos
├── storage/       Persistencia local
└── utils/         Helpers
```

## Notas

- La app no es Expo; es `bare React Native`.
- El registro de token solo ocurre después de un login real.
- Para revisar endpoints disponibles, consulta `docs/api-contracts/streetsignal-api-contracts.yml`.

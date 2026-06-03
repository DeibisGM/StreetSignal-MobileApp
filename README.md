# StreetSignal

Plataforma de reportes ciudadanos — aplicación móvil React Native + backend .NET.

## Requisitos

- [Node.js](https://nodejs.org/) >= 22
- [JDK 17](https://adoptium.net/) y [Android Studio](https://developer.android.com/studio) (para Android)
- Xcode (para iOS, solo macOS)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)

## Estructura del repositorio

```
/app          React Native mobile app
/docs         Arquitectura, contratos de API, base de datos, screenshots
```

## Mobile app — setup

```bash
cd app
npm install
```

### Android

```bash
# Iniciar Metro bundler
npm start

# En otra terminal
npm run android
```

### iOS (solo macOS)

```bash
cd app/ios && pod install && cd ..
npm run ios
```

## Variables de entorno

Crea un archivo `.env` en `/app`:

```env
API_URL=http://10.0.2.2:5000/api
```

> `10.0.2.2` apunta al `localhost` del host desde el emulador Android.

## Estructura de la app

```
app/
├── src/
│   ├── api/           # HTTP client
│   ├── assets/        # Fuentes e imágenes
│   ├── components/    # Componentes reutilizables (ReportCard, StatusBadge…)
│   ├── constants/     # Constantes y storage keys
│   ├── features/
│   │   ├── auth/          # Login, registro
│   │   ├── reports/       # Crear reporte, lista, detalle (ciudadano)
│   │   ├── staff/         # Lista, filtros, cambio de estado (funcionario)
│   │   ├── notifications/ # Notificaciones locales
│   │   └── profile/       # Perfil y cerrar sesión
│   ├── hooks/         # Hooks personalizados
│   ├── navigation/    # Navegadores (stack, tabs)
│   ├── services/      # Capa de servicios por dominio
│   ├── storage/       # AsyncStorage (token, usuario, borradores)
│   ├── types/         # Interfaces y tipos TypeScript
│   └── utils/         # Fechas, validaciones, helpers
├── App.tsx
├── index.js
└── package.json
```

## Credenciales demo (una vez que el backend esté corriendo)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Ciudadano | ciudadano@test.com | 123456 |
| Funcionario | funcionario@test.com | 123456 |

## Tests

```bash
cd app && npm test
```

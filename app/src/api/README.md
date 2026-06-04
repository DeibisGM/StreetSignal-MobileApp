# API Layer

Single HTTP client for all StreetSignal backend communication.

## Files

| File | Purpose |
|------|---------|
| `client.ts` | `apiClient` — the only HTTP instance used by all services |
| `endpoints.ts` | `BASE_URL` + all typed endpoint paths |
| `sessionManager.ts` | In-memory JWT token store; clears session on 401 |
| `types.ts` | `ApiError` class + all request/response DTOs |
| `authService.ts` | `/auth/*` |
| `reportsService.ts` | `/reports/*` + `/reports/:id/updates` |
| `categoriesService.ts` | `/categories` |
| `notificationsService.ts` | `/notifications/*` + `/notifications/device-token` |

## Configuration

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`:

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api   # Android emulator
EXPO_PUBLIC_API_URL=http://localhost:5000/api   # iOS simulator
EXPO_PUBLIC_API_URL=https://api.streetsignal.example.com/api  # production
```

To make Metro/Babel resolve `process.env.EXPO_PUBLIC_API_URL`, install `react-native-dotenv` and add it to `babel.config.js`:

```js
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {moduleName: '@env', path: '.env'}],
  ],
};
```

## Authentication

`sessionManager` holds the JWT in memory. Set it once after login/register:

```ts
sessionManager.setSession(token, user);
```

Register a navigation callback to redirect to Login on 401 (call this once in your root component or navigation setup):

```ts
import {sessionManager} from '@/api';

sessionManager.setUnauthorizedHandler(() => {
  // e.g. navigationRef.current?.navigate('Login')
});
```

## Adding a new endpoint

1. Add the path to `ENDPOINTS` in `endpoints.ts`.
2. Add request/response types to `types.ts` (if not already in `src/types`).
3. Add the service function in the relevant `*Service.ts`, or create a new service file.
4. Export it from `index.ts`.

### Example — new service function

```ts
// In reportsService.ts
deleteReport: (id: string): Promise<void> =>
  apiClient.delete<void>(ENDPOINTS.reports.detail(id)),
```

```ts
// In endpoints.ts — add inside reports:
delete: (id: string) => `/reports/${id}`,
```

## Error handling

Every failed request throws `ApiError`:

```ts
import {ApiError} from '@/api';

try {
  await reportsService.createReport(data);
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.code, err.statusCode, err.message);
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | Machine-readable code from the server (e.g. `EMAIL_ALREADY_EXISTS`) |
| `message` | `string` | Human-readable message |
| `statusCode` | `number` | HTTP status (0 for network errors) |

## Timeouts & retries

| Scenario | Timeout | Retries |
|----------|---------|---------|
| JSON requests | 15 s | 1 (network errors only) |
| Multipart uploads | 60 s | 1 (network errors only) |
| 4xx / 5xx | — | none |

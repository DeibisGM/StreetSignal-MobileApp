---
name: project-api-layer
description: API + storage layer architecture — fetch client, sessionManager, all service files, storageService, test setup
metadata:
  type: project
---

## API layer (`app/src/api/`)

- `client.ts` — fetch-based HTTP client with timeout, retry on network error, 401 interception
- `sessionManager.ts` — in-memory token/user store; `notifyUnauthorized()` also calls `storageService.clearSession()` fire-and-forget
- `authService.ts` — login/register call `storageService.saveSession()` after success; logout calls `storageService.clearSession()`
- `endpoints.ts` — BASE_URL + ENDPOINTS map
- `types.ts` — API DTOs (ApiError class, request/response shapes)
- `index.ts` — barrel exports (also re-exports storageService + storage types)
- `reportsService.ts`, `categoriesService.ts`, `notificationsService.ts` — resource services

## Storage layer (`app/src/storage/`)

- `storageService.ts` — typed key-value API:
  - `getItem<T>`, `setItem<T>`, `removeItem` → AsyncStorage (non-sensitive data)
  - `saveSession(token, user)` → token via Keychain (iOS Keychain / Android Keystore), user fields (id, fullName, email, role) via AsyncStorage `auth.user`
  - `loadSession()` → reads both; returns `StoredSession | null`; missing either piece returns null
  - `clearSession()` → removes all 4 keys: `auth.token` (Keychain) + `auth.user`, `staff.lastFilter`, `report.draft` (AsyncStorage)
- `STORAGE_KEYS` const object with all 4 key strings
- Exported types: `StaffFilter`, `ReportDraft`, `StoredSession`

**Why:** Token must never go into unprotected AsyncStorage; draft/filter don't need Keychain overhead.

## Testing setup

- `jest.config.js` — `transformIgnorePatterns` extended to include `@react-native-async-storage` and `react-native-keychain` (ESM packages need Babel transform)
- `app/__mocks__/@react-native-async-storage/async-storage.js` — auto-mock for all test suites
- `app/__mocks__/react-native-keychain.js` — auto-mock for all test suites
- Individual tests use `jest.mock()` with factory to override the auto-mocks with specific jest.fn() stubs

## Installed packages (feature/57-http-client-api-service-layer)

- `@react-native-async-storage/async-storage` ^3.1.1
- `react-native-keychain` ^10.0.0

## App-startup integration (not yet implemented)

Call `storageService.loadSession()` at app root; if non-null, call `sessionManager.setSession(session.token, session.user)` to restore in-memory state before first render.

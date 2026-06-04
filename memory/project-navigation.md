---
name: project-navigation
description: Navigation architecture — RootNavigator, AuthNavigator, AppNavigator, AuthContext, typed params, deep links
metadata:
  type: project
---

## Navigation layer (`app/src/navigation/`)

- `types.ts` — typed param lists: `AuthStackParamList`, `HomeStackParamList`, `StaffStackParamList`, `AppTabParamList`, `RootParamList`
- `AuthContext.tsx` — `AuthContextValue` (isAuthenticated, user, login, logout); `useAuth()` hook
- `RootNavigator.tsx` — loads session on mount via `storageService.loadSession()`; calls `sessionManager.setSession()` if found; renders `AuthNavigator` or `AppNavigator`; registers `sessionManager.setUnauthorizedHandler(logout)`
- `AuthNavigator.tsx` — Native stack: Splash (initial, headerShown: false) → Login → Register
- `AppNavigator.tsx` — Bottom Tabs; citizen sees HomeTab (Home + ReportDetail nested stack) + CreateReport + Notifications + Profile; staff sees StaffTab (StaffReportsList + StaffReportDetail) + Notifications + Profile; role guard via `useAuth().user.role`
- `index.ts` — barrel exports all navigators, AuthContext, useAuth, and types

## Screens (placeholder implementations)

- `features/auth/screens/` — SplashScreen, LoginScreen, RegisterScreen
- `features/reports/screens/` — HomeScreen, ReportDetailScreen, CreateReportScreen
- `features/staff/screens/` — StaffReportsListScreen, StaffReportDetailScreen
- `features/notifications/screens/` — NotificationsScreen
- `features/profile/screens/` — ProfileScreen

## App entry (`app/App.tsx`)

Wraps `<NavigationContainer>` with deep-link config (`streetsignal://report/:reportId` → `App.HomeTab.ReportDetail`) inside `<SafeAreaProvider>`.

## Deep link config

`streetsignal://report/:reportId` resolves to `App → HomeTab → ReportDetail` with `reportId` param.

**Why:** Session check happens before first render to avoid flash of wrong navigator.
**How to apply:** When adding new screens, extend the param list in `types.ts` and register in the appropriate navigator. Use `useAuth()` for role-gated UI.

## Installed packages (feature/59-navigation-auth-app-flow)

- `@react-navigation/native` ^7.2.5
- `@react-navigation/native-stack` ^7.16.0
- `@react-navigation/bottom-tabs` ^7.16.2
- `react-native-screens` ^4.25.2
- `@testing-library/react-native` (devDep)

## Test

`src/navigation/__tests__/RootNavigator.test.tsx` — 3 cases: no session → AuthNavigator, valid session → AppNavigator, loadSession rejects → AuthNavigator.

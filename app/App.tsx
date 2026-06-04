import React, { useState } from 'react';
import { LoginScreen, RegisterScreen } from './src/features/auth';
import { ComponentsDemo } from './src/components/__demo__/ComponentsDemo';

// ─── Set to true to preview the design-system component library ───────────────
const SHOW_COMPONENTS_DEMO = false;
// ─────────────────────────────────────────────────────────────────────────────

type Screen = 'login' | 'register';

export default function App() {
  if (SHOW_COMPONENTS_DEMO) {
    return <ComponentsDemo />;
  }

  const [screen, setScreen] = useState<Screen>('login');
  const [loginToast, setLoginToast] = useState<string | null>(null);

  if (screen === 'register') {
    return (
      <RegisterScreen
        onNavigateToLogin={(message) => {
          setLoginToast(message ?? null);
          setScreen('login');
        }}
      />
    );
  }
  return (
    <LoginScreen
      onNavigateToRegister={() => setScreen('register')}
      successMessage={loginToast}
      onDismissSuccess={() => setLoginToast(null)}
    />
  );
}


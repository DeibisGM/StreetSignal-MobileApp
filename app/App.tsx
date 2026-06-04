import React, {useState} from 'react';
import {LoginScreen, RegisterScreen} from './src/features/auth';

type Screen = 'login' | 'register';

export default function App() {
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


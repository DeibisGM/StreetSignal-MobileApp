import React, {useEffect, useState} from 'react';
import {LoginScreen, RegisterScreen} from './src/features/auth';
import {StaffReportsScreen} from './src/features/staff';
import {storageService} from './src/storage/auth/storageService';
import type {User} from './src/types';

type Screen = 'login' | 'register' | 'staff';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [loginToast, setLoginToast] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      const user = await storageService.getUser();
      if (!mounted) {
        return;
      }
      setCurrentUser(user);
      if (user?.role === 'staff') {
        setScreen('staff');
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  if (screen === 'staff' || currentUser?.role === 'staff') {
    return <StaffReportsScreen />;
  }

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
      onSuccess={() => {
        void storageService.getUser().then(user => {
          setCurrentUser(user);
          if (user?.role === 'staff') {
            setScreen('staff');
          }
        });
      }}
    />
  );
}


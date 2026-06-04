import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, LinkingOptions} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation';
import {RootParamList} from './src/navigation/types';
import {LoginScreen, RegisterScreen} from './src/features/auth';
import {ComponentsDemo} from './src/components/__demo__/ComponentsDemo';

// Set to true to preview the design-system component library
const SHOW_COMPONENTS_DEMO = false;

type Screen = 'login' | 'register';

const linking: LinkingOptions<RootParamList> = {
  prefixes: ['streetsignal://'],
  config: {
    screens: {
      App: {
        screens: {
          HomeTab: {
            screens: {
              ReportDetail: 'report/:reportId',
            },
          },
        },
      },
    },
  },
};

export default function App() {
  if (SHOW_COMPONENTS_DEMO) {
    return <ComponentsDemo />;
  }

  const [isAuthenticated, _setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>('login');
  const [loginToast, setLoginToast] = useState<string | null>(null);

  const renderAuthFlow = () => {
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
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5E" />
      {isAuthenticated ? (
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        renderAuthFlow()
      )}
    </SafeAreaProvider>
  );
}

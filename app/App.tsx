import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, LinkingOptions} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation';
import {RootParamList} from './src/navigation/types';
import {ComponentsDemo} from './src/components/__demo__/ComponentsDemo';

const SHOW_COMPONENTS_DEMO = false;

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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5E" />
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

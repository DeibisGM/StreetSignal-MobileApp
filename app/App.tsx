import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation';

const linking = {
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
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5E" />
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

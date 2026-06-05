import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';
import SplashScreen from '../features/auth/screens/SplashScreen';
import {LoginScreen} from '../features/auth/screens/LoginScreen';
import {RegisterScreen} from '../features/auth/screens/RegisterScreen';

interface Props {
  initialLoading?: boolean;
}

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator({initialLoading}: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialLoading ? 'Splash' : 'Login'}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
          title: 'Iniciar sesión',
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
          title: 'Crear cuenta',
        }}
      />
    </Stack.Navigator>
  );
}

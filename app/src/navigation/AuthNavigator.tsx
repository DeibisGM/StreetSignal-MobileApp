import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';
import {LoginScreen} from '../features/auth/screens/LoginScreen';
import {RegisterScreen} from '../features/auth/screens/RegisterScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: true,
          title: 'Iniciar sesión',
          headerStyle: {backgroundColor: '#1A3C5E'},
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {fontWeight: '700'},
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Crear cuenta',
          headerStyle: {backgroundColor: '#1A3C5E'},
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {fontWeight: '700'},
        }}
      />
    </Stack.Navigator>
  );
}

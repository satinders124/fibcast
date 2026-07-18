import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider }     from './src/context/AuthContext';
import { CustomerProvider } from './src/context/CustomerContext';
import { BusinessProvider } from './src/context/BusinessContext';
import { RoleProvider }     from './src/context/RoleContext';
import AppNavigator         from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RoleProvider>
          <CustomerProvider>
            <BusinessProvider>
              <StatusBar style="light" />
              <AppNavigator />
            </BusinessProvider>
          </CustomerProvider>
        </RoleProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
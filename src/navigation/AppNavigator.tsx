import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import GameNavigator from './GameNavigator';
import Loading from '../components/common/Loading';

export default function AppNavigator(): React.JSX.Element {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <GameNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

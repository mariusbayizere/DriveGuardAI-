/**
 * App.jsx
 * Root component — owns auth state, delegates everything else.
 *
 * Responsibility:  Auth state management only.
 * Routing:         → router/AppRouter.jsx
 * Layout:          → components/layout/AppShell.jsx
 * Auth logic:      → hooks/useAuth.js
 * Nav constants:   → constants/navigation.js
 * Icons:           → components/icons/Icons.jsx
 */
import React from 'react';
import AppRouter  from './router/AppRouter';
import { useAuth } from './hooks/useAuth';

const App = () => {
  const { isAuthenticated, isDriver, homeRoute, roleLoading, login, logout } = useAuth();

  return (
    <AppRouter
      isAuthenticated={isAuthenticated}
      isDriver={isDriver}
      homeRoute={homeRoute}
      roleLoading={roleLoading}
      onLogin={login}
      onLogout={logout}
    />
  );
};

export default App;

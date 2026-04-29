/**
 * router/AppRouter.jsx
 * Single source of truth for all top-level routes.
 * Route guards live here — components stay pure.
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AppShell      from '../components/layout/AppShell';
import LoadingScreen from '../components/screens/LoadingScreen';
import OAuth2Callback from '../components/screens/OAuth2Callback';
import DriveGuardAuth from '../components/Auth/DriveGuardAI_Auth';
import DriverPortal   from '../components/Drivers/DriverPortal';
import { NotFoundPage, ServerErrorPage } from '../components/Errors/ErrorPages';

const AppRouter = ({ isAuthenticated, isDriver, homeRoute, roleLoading, onLogin, onLogout }) => {
  if (roleLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>

        {/* ── Public ────────────────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={homeRoute} replace />
              : <DriveGuardAuth onAuthSuccess={onLogin} />
          }
        />
        <Route
          path="/oauth2/callback"
          element={<OAuth2Callback onLogin={onLogin} />}
        />

        {/* ── Standalone error pages (no shell) ─────────────────────── */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />

        {/* ── Protected: Driver Portal ───────────────────────────────── */}
        <Route
          path="/driver-portal"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : isDriver        ? <DriverPortal />
            :                   <Navigate to="/" replace />
          }
        />

        {/* ── Protected: Admin / Manager Shell ──────────────────────── */}
        <Route
          path="/*"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : isDriver        ? <Navigate to="/driver-portal" replace />
            :                   <AppShell onLogout={onLogout} />
          }
        />

      </Routes>
    </Router>
  );
};

export default AppRouter;

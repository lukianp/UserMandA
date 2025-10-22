/**
 * Main Application Component
 *
 * Implements routing with lazy loading for optimal performance.
 * Wraps the application with error handling and notification systems.
 */

import React, { ErrorInfo } from 'react';
import { HashRouter, useRoutes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationContainer';
import { MainLayout } from './components/layouts/MainLayout';
import routes from './routes';

/**
 * AppContent - Renders routes within MainLayout
 */
const AppContent: React.FC = () => {
  const routing = useRoutes(routes);

  return (
    <MainLayout>
      {routing}
    </MainLayout>
  );
};

/**
 * App - Main application entry point
 */
const App: React.FC = () => {
  // Handle errors from ErrorBoundary
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to main process
    if (window.electronAPI?.logging) {
      window.electronAPI.logging.error(
        'App',
        error.message,
        error.stack,
        {
          componentStack: errorInfo.componentStack
        }
      );
    }
  };

  return (
    <ErrorBoundary onError={handleError} showDetails={true}>
      <NotificationContainer />
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;

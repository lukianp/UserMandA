/**
 * Main Application Component
 *
 * Implements routing with lazy loading for optimal performance.
 * Wraps the application with error handling and notification systems.
 */

import React, { ErrorInfo, useEffect } from 'react';
import { HashRouter, useRoutes } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationContainer';
import { ModalContainer } from './components/organisms/ModalContainer';
import { MainLayout } from './components/layouts/MainLayout';
import { useThemeStore } from './store/useThemeStore';
import routes from './routes';

/**
 * Theme Initializer - Ensures theme is applied on mount
 */
const ThemeInitializer: React.FC = () => {
  const { mode, actualMode } = useThemeStore();

  useEffect(() => {
    // Apply theme to DOM on mount
    const root = document.documentElement;
    if (actualMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode, actualMode]);

  return null;
};

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
      <ThemeInitializer />
      <NotificationContainer />
      <ModalContainer />
      <DndProvider backend={HTML5Backend}>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </DndProvider>
    </ErrorBoundary>
  );
};

export default App;



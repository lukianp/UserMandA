/**
 * Main Layout Component
 * Application shell with sidebar and main content area
 */

import React from 'react';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  /** Child components to render in main content area */
  children: React.ReactNode;
  /** Show sidebar */
  showSidebar?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MainLayout Component
 *
 * Provides the main application shell with sidebar navigation
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  className = '',
}) => {
  return (
    <div className={`h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;

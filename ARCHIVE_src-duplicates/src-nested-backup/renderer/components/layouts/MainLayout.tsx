/**
 * MainLayout Component
 *
 * Main application layout with sidebar and content area
 */

import React from 'react';

import { Sidebar } from '../organisms/Sidebar';
import { TabView } from '../organisms/TabView';
import { CommandPalette } from '../organisms/CommandPalette';
import { useModalStore } from '../../store/useModalStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isCommandPaletteOpen } = useModalStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <TabView />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && <CommandPalette />}
    </div>
  );
};
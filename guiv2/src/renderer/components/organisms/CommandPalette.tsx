/**
 * CommandPalette Component
 *
 * Global command palette for quick actions
 */

import React from 'react';
import { useModalStore } from '../../store/useModalStore';

/**
 * Command palette component (simplified stub)
 */
export const CommandPalette: React.FC = () => {
  const { closeCommandPalette } = useModalStore();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-4">
        <input
          type="text"
          placeholder="Type a command..."
          className="w-full px-4 py-2 border rounded"
          autoFocus
        />
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Press ESC to close
        </div>
      </div>
    </div>
  );
};
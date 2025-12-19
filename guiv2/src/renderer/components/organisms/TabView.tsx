/**
 * TabView Component
 *
 * Tab management component
 */

import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

import { useTabStore } from '../../store/useTabStore';

/**
 * Tab view component for managing open tabs
 */
export const TabView: React.FC = () => {
  const { tabs, selectedTabId, setSelectedTab, closeTab } = useTabStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              selectedTabId === tab.id && 'bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent border-b-2 border-blue-500'
            )}
            onClick={() => setSelectedTab(tab.id)}
          >
            <span className="text-sm">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              aria-label="Close tab"
              title="Close tab"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
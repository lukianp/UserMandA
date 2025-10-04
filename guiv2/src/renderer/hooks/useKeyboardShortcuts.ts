/**
 * Keyboard Shortcuts Hook
 *
 * Global keyboard shortcuts for the application.
 * Handles common actions like opening command palette, closing tabs, etc.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';

/**
 * Keyboard shortcuts configuration
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., 'k', 's', 'f') */
  key: string;
  /** Require Ctrl key */
  ctrl?: boolean;
  /** Require Alt key */
  alt?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Handler function */
  handler: () => void;
  /** Description for command palette */
  description: string;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Global keyboard shortcuts hook
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { tabs, selectedTabId, openTab, closeTab, closeAllTabs } = useTabStore();
  const { openModal } = useModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Ctrl+K)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        openModal('commandPalette');
        return;
      }

      // Close Current Tab (Ctrl+W)
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (selectedTabId) {
          closeTab(selectedTabId);
        }
        return;
      }

      // New Tab (Ctrl+T)
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        openTab({
          title: 'New Tab',
          content: 'overview',
          closable: true,
        });
        return;
      }

      // Save (Ctrl+S)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Trigger save event for current view
        const saveEvent = new CustomEvent('app:save');
        window.dispatchEvent(saveEvent);
        return;
      }

      // Focus Search (Ctrl+F)
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        // Focus the first search input on the page
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="text"][placeholder*="Search" i], input[type="search"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Print (Ctrl+P)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
        return;
      }

      // Close All Tabs (Ctrl+Shift+W)
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        if (confirm('Close all tabs?')) {
          closeAllTabs();
        }
        return;
      }

      // Navigate to Overview (Ctrl+Shift+H)
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        navigate('/');
        return;
      }

      // Navigate to Discovery (Ctrl+Shift+D)
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        navigate('/discovery');
        return;
      }

      // Navigate to Users (Ctrl+Shift+U)
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        navigate('/users');
        return;
      }

      // Navigate to Groups (Ctrl+Shift+G)
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        navigate('/groups');
        return;
      }

      // Navigate to Migration (Ctrl+Shift+M)
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        navigate('/migration');
        return;
      }

      // Navigate to Reports (Ctrl+Shift+R)
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        navigate('/reports');
        return;
      }

      // Navigate to Settings (Ctrl+,)
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
        return;
      }

      // Toggle DevTools (Ctrl+Shift+I) - only in development
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        if (process.env.NODE_ENV === 'development') {
          e.preventDefault();
          // DevTools toggle is handled by Electron
        }
        return;
      }

      // Reload App (Ctrl+R) - only in development
      if (e.ctrlKey && e.key === 'r') {
        if (process.env.NODE_ENV === 'development') {
          e.preventDefault();
          window.location.reload();
        }
        return;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, selectedTabId, openTab, closeTab, closeAllTabs, openModal]);
};

/**
 * Get list of all keyboard shortcuts (for command palette)
 */
export const getKeyboardShortcuts = (): KeyboardShortcut[] => [
  {
    key: 'k',
    ctrl: true,
    handler: () => {},
    description: 'Open Command Palette',
    preventDefault: true,
  },
  {
    key: 'w',
    ctrl: true,
    handler: () => {},
    description: 'Close Current Tab',
    preventDefault: true,
  },
  {
    key: 't',
    ctrl: true,
    handler: () => {},
    description: 'New Tab',
    preventDefault: true,
  },
  {
    key: 's',
    ctrl: true,
    handler: () => {},
    description: 'Save',
    preventDefault: true,
  },
  {
    key: 'f',
    ctrl: true,
    handler: () => {},
    description: 'Focus Search',
    preventDefault: true,
  },
  {
    key: 'p',
    ctrl: true,
    handler: () => {},
    description: 'Print',
    preventDefault: true,
  },
  {
    key: 'w',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Close All Tabs',
    preventDefault: true,
  },
  {
    key: 'h',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Go to Overview',
    preventDefault: true,
  },
  {
    key: 'd',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Go to Discovery',
    preventDefault: true,
  },
  {
    key: 'u',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Go to Users',
    preventDefault: true,
  },
  {
    key: 'g',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Go to Groups',
    preventDefault: true,
  },
  {
    key: 'm',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Go to Migration',
    preventDefault: true,
  },
  {
    key: 'r',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Go to Reports',
    preventDefault: true,
  },
  {
    key: ',',
    ctrl: true,
    handler: () => {},
    description: 'Open Settings',
    preventDefault: true,
  },
];

/**
 * Format keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};

export default useKeyboardShortcuts;

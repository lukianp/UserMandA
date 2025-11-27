/**
 * KeyboardShortcutsDialog Component
 *
 * Displays comprehensive list of keyboard shortcuts organized by category.
 * Triggered by F1 key or Help menu.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 *
 * @component
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * // Listen for F1 key
 * useEffect(() => {
 *   const handleHelp = () => setIsOpen(true);
 *   window.addEventListener('open-help-dialog', handleHelp);
 *   return () => window.removeEventListener('open-help-dialog', handleHelp);
 * }, []);
 *
 * <KeyboardShortcutsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */

import React from 'react';
import { Keyboard } from 'lucide-react';

import { Modal } from '../organisms/Modal';

export interface KeyboardShortcutsDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Keyboard shortcut definition
 */
interface ShortcutItem {
  key: string;
  action: string;
}

/**
 * Shortcut category
 */
interface ShortcutCategory {
  category: string;
  items: ShortcutItem[];
}

/**
 * All keyboard shortcuts organized by category
 */
const SHORTCUTS: ShortcutCategory[] = [
  {
    category: 'Navigation (Ctrl+Number)',
    items: [
      { key: 'Ctrl+1', action: 'Go to Dashboard' },
      { key: 'Ctrl+2', action: 'Go to Users' },
      { key: 'Ctrl+3', action: 'Go to Groups' },
      { key: 'Ctrl+4', action: 'Go to Computers' },
      { key: 'Ctrl+5', action: 'Go to Infrastructure' },
      { key: 'Ctrl+6', action: 'Go to Migration' },
      { key: 'Ctrl+7', action: 'Go to Reports' },
      { key: 'Ctrl+8', action: 'Go to Settings' },
      { key: 'Ctrl+9', action: 'Go to Discovery' },
    ],
  },
  {
    category: 'Advanced Navigation (Ctrl+Shift+Letter)',
    items: [
      { key: 'Ctrl+Shift+D', action: 'Open Discovery Dashboard' },
      { key: 'Ctrl+Shift+M', action: 'Open Migration Planning' },
      { key: 'Ctrl+Shift+R', action: 'Open Reports Dashboard' },
      { key: 'Ctrl+Shift+S', action: 'Open Security Dashboard' },
      { key: 'Ctrl+Shift+A', action: 'Open Analytics Dashboard' },
      { key: 'Ctrl+Shift+P', action: 'Open Project Configuration' },
      { key: 'Ctrl+Shift+I', action: 'Open Infrastructure Dashboard' },
      { key: 'Ctrl+Shift+C', action: 'Open Compliance Dashboard' },
      { key: 'Ctrl+Shift+U', action: 'Open Users View' },
      { key: 'Ctrl+Shift+G', action: 'Open Groups View' },
      { key: 'Ctrl+Shift+H', action: 'Go to Overview' },
    ],
  },
  {
    category: 'Quick Actions (Alt+Letter)',
    items: [
      { key: 'Alt+N', action: 'New Item' },
      { key: 'Alt+F', action: 'Focus Search' },
      { key: 'Alt+R', action: 'Refresh Current View' },
      { key: 'Alt+E', action: 'Export Data' },
      { key: 'Alt+I', action: 'Import Data' },
    ],
  },
  {
    category: 'Tab Management',
    items: [
      { key: 'Ctrl+T', action: 'New Tab' },
      { key: 'Ctrl+W', action: 'Close Current Tab' },
      { key: 'Ctrl+Shift+W', action: 'Close All Tabs' },
    ],
  },
  {
    category: 'File Operations',
    items: [
      { key: 'Ctrl+N', action: 'New Profile' },
      { key: 'Ctrl+O', action: 'Open Settings' },
      { key: 'Ctrl+S', action: 'Save' },
      { key: 'Ctrl+E', action: 'Export' },
      { key: 'Ctrl+P', action: 'Print' },
    ],
  },
  {
    category: 'Function Keys',
    items: [
      { key: 'F1', action: 'Show Help / Keyboard Shortcuts' },
      { key: 'F2', action: 'Rename Selected Item' },
      { key: 'F3', action: 'Focus Search' },
      { key: 'F5', action: 'Refresh View' },
    ],
  },
  {
    category: 'General',
    items: [
      { key: 'Ctrl+K', action: 'Open Command Palette' },
      { key: 'Ctrl+F', action: 'Focus Search' },
      { key: 'Ctrl+,', action: 'Open Settings' },
      { key: 'Escape', action: 'Close Modal/Dialog' },
    ],
  },
];

/**
 * KeyboardShortcutsDialog Component
 */
export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  isOpen,
  onClose,
  className = '',
  'data-cy': dataCy,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="lg"
      icon={<Keyboard className="w-5 h-5" />}
      className={className}
      data-cy={dataCy || 'keyboard-shortcuts-dialog'}
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {SHORTCUTS.map((section) => (
          <div key={section.category} className="space-y-3">
            {/* Section header */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              {section.category}
            </h3>

            {/* Shortcuts grid */}
            <div className="grid grid-cols-1 gap-2">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between items-center py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-cy={`shortcut-${item.key.toLowerCase().replace(/\+/g, '-')}`}
                >
                  {/* Action description */}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.action}
                  </span>

                  {/* Keyboard shortcut badge */}
                  <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-800 dark:text-gray-200 shadow-sm">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with tip */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <span className="font-semibold">Tip:</span> Press{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
            F1
          </kbd>{' '}
          anytime to view this help
        </p>
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsDialog;

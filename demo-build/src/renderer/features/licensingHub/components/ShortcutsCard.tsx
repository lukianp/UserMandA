import React from 'react';
import { Plus, Upload, Settings, FileText } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';

interface ShortcutItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface ShortcutsCardProps {
  className?: string;
}

export const ShortcutsCard: React.FC<ShortcutsCardProps> = ({ className = '' }) => {
  // These would be connected to actual actions from the hook
  const shortcuts: ShortcutItem[] = [
    {
      id: 'add-entitlement',
      label: 'Add License Entitlement',
      icon: Plus,
      description: 'Add new license entitlement',
      onClick: () => console.log('Add entitlement clicked'),
      variant: 'primary'
    },
    {
      id: 'add-agreement',
      label: 'Add Agreement',
      icon: FileText,
      description: 'Create new license agreement',
      onClick: () => console.log('Add agreement clicked'),
      variant: 'secondary'
    },
    {
      id: 'import-data',
      label: 'Import Data',
      icon: Upload,
      description: 'Import from CSV or external tools',
      onClick: () => console.log('Import data clicked'),
      variant: 'ghost'
    },
    {
      id: 'admin-settings',
      label: 'Administration',
      icon: Settings,
      description: 'Manage settings and normalization',
      onClick: () => console.log('Admin settings clicked'),
      variant: 'ghost'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-medium text-gray-900 dark:text-white">Quick Actions</h4>
      <div className="grid grid-cols-1 gap-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Button
              key={shortcut.id}
              variant={shortcut.variant}
              onClick={shortcut.onClick}
              className="justify-start h-auto p-3"
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm">{shortcut.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {shortcut.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
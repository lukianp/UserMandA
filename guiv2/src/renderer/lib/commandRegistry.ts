/**
 * Command Registry
 *
 * Central registry of all commands available in the command palette.
 * Commands are organized by category and include keyboard shortcuts.
 */

import { LucideIcon, Home, Search, Users, Server, Box, FileText, Settings, Plus, Download, Upload, RefreshCw, Calendar } from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  description: string;
  category: 'Navigation' | 'Actions' | 'Discovery' | 'Migration' | 'Data' | 'System';
  icon?: LucideIcon;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export interface CommandCategory {
  name: string;
  commands: Command[];
}

/**
 * Create command registry with navigation and action callbacks
 */
export const createCommandRegistry = (
  navigate: (path: string) => void,
  openModal: (type: string, data?: any) => void,
  triggerAction: (action: string) => void
): Command[] => {
  return [
    // Navigation Commands
    {
      id: 'nav-overview',
      label: 'Go to Overview',
      description: 'Navigate to the overview dashboard',
      category: 'Navigation',
      icon: Home,
      shortcut: 'Ctrl+Shift+H',
      action: () => navigate('/'),
      keywords: ['home', 'dashboard', 'overview'],
    },
    {
      id: 'nav-discovery',
      label: 'Go to Discovery',
      description: 'Navigate to discovery hub',
      category: 'Navigation',
      icon: Search,
      shortcut: 'Ctrl+Shift+D',
      action: () => navigate('/discovery'),
      keywords: ['find', 'scan', 'discover'],
    },
    {
      id: 'nav-users',
      label: 'Go to Users',
      description: 'Navigate to users view',
      category: 'Navigation',
      icon: Users,
      shortcut: 'Ctrl+Shift+U',
      action: () => navigate('/users'),
      keywords: ['people', 'accounts'],
    },
    {
      id: 'nav-groups',
      label: 'Go to Groups',
      description: 'Navigate to groups view',
      category: 'Navigation',
      icon: Users,
      shortcut: 'Ctrl+Shift+G',
      action: () => navigate('/groups'),
      keywords: ['teams', 'distribution'],
    },
    {
      id: 'nav-computers',
      label: 'Go to Computers',
      description: 'Navigate to computers view',
      category: 'Navigation',
      icon: Server,
      action: () => navigate('/computers'),
      keywords: ['devices', 'machines', 'workstations'],
    },
    {
      id: 'nav-infrastructure',
      label: 'Go to Infrastructure',
      description: 'Navigate to infrastructure view',
      category: 'Navigation',
      icon: Box,
      action: () => navigate('/infrastructure'),
      keywords: ['servers', 'network', 'systems'],
    },
    {
      id: 'nav-migration',
      label: 'Go to Migration Planning',
      description: 'Navigate to migration planning',
      category: 'Navigation',
      icon: Calendar,
      shortcut: 'Ctrl+Shift+M',
      action: () => navigate('/migration/planning'),
      keywords: ['waves', 'move', 'transfer'],
    },
    {
      id: 'nav-reports',
      label: 'Go to Reports',
      description: 'Navigate to reports view',
      category: 'Navigation',
      icon: FileText,
      shortcut: 'Ctrl+Shift+R',
      action: () => navigate('/reports'),
      keywords: ['analytics', 'data', 'export'],
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Navigate to settings',
      category: 'Navigation',
      icon: Settings,
      shortcut: 'Ctrl+,',
      action: () => navigate('/settings'),
      keywords: ['preferences', 'configuration', 'options'],
    },

    // Action Commands
    {
      id: 'action-new-profile',
      label: 'Create New Profile',
      description: 'Create a new connection profile',
      category: 'Actions',
      icon: Plus,
      shortcut: 'Ctrl+N',
      action: () => openModal('createProfile'),
      keywords: ['add', 'connection', 'tenant'],
    },
    {
      id: 'action-export',
      label: 'Export Data',
      description: 'Export current view data',
      category: 'Actions',
      icon: Download,
      shortcut: 'Ctrl+E',
      action: () => triggerAction('export'),
      keywords: ['save', 'download', 'csv'],
    },
    {
      id: 'action-import',
      label: 'Import Data',
      description: 'Import data from file',
      category: 'Actions',
      icon: Upload,
      action: () => openModal('importData'),
      keywords: ['load', 'upload', 'csv'],
    },
    {
      id: 'action-refresh',
      label: 'Refresh Current View',
      description: 'Reload data in current view',
      category: 'Actions',
      icon: RefreshCw,
      shortcut: 'F5',
      action: () => triggerAction('refresh'),
      keywords: ['reload', 'update', 'sync'],
    },
    {
      id: 'action-search',
      label: 'Focus Search',
      description: 'Focus the search input',
      category: 'Actions',
      icon: Search,
      shortcut: 'Ctrl+F',
      action: () => triggerAction('focus-search'),
      keywords: ['find', 'filter', 'query'],
    },

    // Discovery Commands
    {
      id: 'discovery-domain',
      label: 'Run Domain Discovery',
      description: 'Start domain discovery process',
      category: 'Discovery',
      action: () => navigate('/discovery/domain'),
      keywords: ['scan', 'active directory', 'ad'],
    },
    {
      id: 'discovery-azure',
      label: 'Run Azure Discovery',
      description: 'Start Azure AD discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/azure'),
      keywords: ['scan', 'aad', 'entra'],
    },
    {
      id: 'discovery-office365',
      label: 'Run Office 365 Discovery',
      description: 'Start Office 365 discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/office365'),
      keywords: ['scan', 'o365', 'microsoft'],
    },
    {
      id: 'discovery-exchange',
      label: 'Run Exchange Discovery',
      description: 'Start Exchange discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/exchange'),
      keywords: ['scan', 'email', 'mailbox'],
    },
    {
      id: 'discovery-sharepoint',
      label: 'Run SharePoint Discovery',
      description: 'Start SharePoint discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/sharepoint'),
      keywords: ['scan', 'spo', 'sites'],
    },
    {
      id: 'discovery-teams',
      label: 'Run Teams Discovery',
      description: 'Start Microsoft Teams discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/teams'),
      keywords: ['scan', 'chat', 'channels'],
    },

    // Migration Commands
    {
      id: 'migration-schedule-wave',
      label: 'Schedule Migration Wave',
      description: 'Create and schedule a new migration wave',
      category: 'Migration',
      icon: Calendar,
      action: () => openModal('waveScheduling'),
      keywords: ['plan', 'batch', 'cutover'],
    },
    {
      id: 'migration-validation',
      label: 'Run Migration Validation',
      description: 'Validate migration readiness',
      category: 'Migration',
      action: () => navigate('/migration/validation'),
      keywords: ['check', 'verify', 'test'],
    },
    {
      id: 'migration-execution',
      label: 'View Migration Execution',
      description: 'Monitor active migrations',
      category: 'Migration',
      action: () => navigate('/migration/execution'),
      keywords: ['run', 'progress', 'status'],
    },

    // Data Commands
    {
      id: 'data-export-users',
      label: 'Export Users',
      description: 'Export user data to file',
      category: 'Data',
      action: () => {
        navigate('/users');
        setTimeout(() => triggerAction('export'), 100);
      },
      keywords: ['save', 'download', 'accounts'],
    },
    {
      id: 'data-export-groups',
      label: 'Export Groups',
      description: 'Export group data to file',
      category: 'Data',
      action: () => {
        navigate('/groups');
        setTimeout(() => triggerAction('export'), 100);
      },
      keywords: ['save', 'download', 'teams'],
    },

    // System Commands
    {
      id: 'system-about',
      label: 'About',
      description: 'View application information',
      category: 'System',
      action: () => openModal('about'),
      keywords: ['version', 'info', 'help'],
    },
    {
      id: 'system-settings',
      label: 'Open Settings',
      description: 'Configure application settings',
      category: 'System',
      icon: Settings,
      action: () => openModal('settings'),
      keywords: ['preferences', 'config', 'options'],
    },
  ];
};

/**
 * Filter commands based on search query
 */
export const filterCommands = (commands: Command[], query: string): Command[] => {
  if (!query.trim()) {
    return commands;
  }

  const lowerQuery = query.toLowerCase();

  return commands.filter((command) => {
    // Search in label, description, category, and keywords
    const searchableText = [
      command.label,
      command.description,
      command.category,
      ...(command.keywords || []),
    ].join(' ').toLowerCase();

    return searchableText.includes(lowerQuery);
  });
};

/**
 * Group commands by category
 */
export const groupCommandsByCategory = (commands: Command[]): CommandCategory[] => {
  const categories: Record<string, Command[]> = {};

  commands.forEach((command) => {
    if (!categories[command.category]) {
      categories[command.category] = [];
    }
    categories[command.category].push(command);
  });

  return Object.entries(categories).map(([name, commands]) => ({
    name,
    commands,
  }));
};

export default createCommandRegistry;

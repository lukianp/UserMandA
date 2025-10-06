/**
 * Sidebar Component
 *
 * Application sidebar with navigation, profile management, and system status.
 * Enhanced with SystemStatus component for real-time health monitoring.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Server,
  ArrowRightLeft,
  FileText,
  Settings,
  Sun,
  Moon,
  Monitor,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Button } from '../atoms/Button';
import { SystemStatus } from '../molecules/SystemStatus';
import { useSystemHealthLogic } from '../../hooks/useSystemHealthLogic';

/**
 * Navigation item interface
 */
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

/**
 * Sidebar navigation component
 */
export const Sidebar: React.FC = () => {
  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();
  const { mode, setMode } = useThemeStore();
  const { systemStatus } = useSystemHealthLogic();

  // Navigation items
  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Overview',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/discovery',
      label: 'Discovery',
      icon: <Search size={20} />,
      children: [
        { path: '/discovery/domain', label: 'Domain', icon: <ChevronRight size={16} /> },
        { path: '/discovery/azure', label: 'Azure AD', icon: <ChevronRight size={16} /> },
      ],
    },
    {
      path: '/users',
      label: 'Users',
      icon: <Users size={20} />,
    },
    {
      path: '/groups',
      label: 'Groups',
      icon: <UserCheck size={20} />,
    },
    {
      path: '/infrastructure',
      label: 'Infrastructure',
      icon: <Server size={20} />,
    },
    {
      path: '/migration',
      label: 'Migration',
      icon: <ArrowRightLeft size={20} />,
      children: [
        { path: '/migration/planning', label: 'Planning', icon: <ChevronRight size={16} /> },
        { path: '/migration/mapping', label: 'Mapping', icon: <ChevronRight size={16} /> },
        { path: '/migration/validation', label: 'Validation', icon: <ChevronRight size={16} /> },
        { path: '/migration/execution', label: 'Execution', icon: <ChevronRight size={16} /> },
      ],
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <FileText size={20} />,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
  ];

  // Theme toggle
  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(mode || 'light');
    const nextIndex = (currentIndex + 1) % themes.length;
    setMode(themes[nextIndex]);
  };

  // Get theme icon
  const getThemeIcon = () => {
    switch (mode) {
      case 'dark':
        return <Moon size={18} />;
      case 'system':
        return <Monitor size={18} />;
      default:
        return <Sun size={18} />;
    }
  };

  // Get theme label
  const getThemeLabel = () => {
    switch (mode) {
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo/Title */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">M&A Discovery Suite</h1>
        <p className="text-xs text-gray-400 mt-1">v2.0.0</p>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-gray-800">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Source Environment</label>
            <div className="mt-1 p-2 bg-gray-800 rounded text-sm">
              {selectedSourceProfile ? (
                <span>{selectedSourceProfile.name}</span>
              ) : (
                <span className="text-gray-500">Not selected</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Target Environment</label>
            <div className="mt-1 p-2 bg-gray-800 rounded text-sm">
              {selectedTargetProfile ? (
                <span>{selectedTargetProfile.name}</span>
              ) : (
                <span className="text-gray-500">Not selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  'hover:bg-gray-800 hover:text-white',
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                    : 'text-gray-300'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>

            {/* Child items */}
            {item.children && (
              <div className="ml-4">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2 px-4 py-1.5 text-sm transition-colors',
                        'hover:bg-gray-800 hover:text-white',
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400'
                      )
                    }
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* System Status Section */}
      <div className="p-4 border-t border-gray-800">
        <SystemStatus indicators={systemStatus} showLastSync={true} />
      </div>

      {/* Footer - Theme Toggle */}
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          icon={getThemeIcon()}
          onClick={cycleTheme}
          className="justify-start text-gray-300 hover:text-white"
        >
          {getThemeLabel()} Theme
        </Button>
      </div>
    </aside>
  );
};

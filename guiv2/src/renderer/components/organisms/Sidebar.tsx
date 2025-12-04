/**
 * Sidebar Component
 *
 * Application sidebar with navigation, profile management, and system status.
 * Enhanced with SystemStatus component for real-time health monitoring.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 */

import React, { useState, useMemo } from 'react';
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
  Search,
  ChevronRight,
  ChevronDown,
  Cloud,
  Mail,
  HardDrive,
  Database,
  Folder,
  MessageSquare,
  Shield,
  Folders,
  Package,
  Lock,
  Key,
  Network,
  Globe,
  Cpu,
  Binary,
  FileCode,
  Layers,
  Workflow,
  BarChart3,
  Printer,
  Calendar,
  FileSearch,
  Box,
} from 'lucide-react';

import { useProfileStore } from '../../store/useProfileStore';
import { SystemStatus } from '../molecules/SystemStatus';
import { ProfileSelector } from '../molecules/ProfileSelector';
import { useSystemHealthLogic } from '../../hooks/useSystemHealthLogic';
import { discoveredNavItems } from '../../views/discovered/_sidebar.generated';

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
  const { systemStatus } = useSystemHealthLogic();

  // Discovered Data - Shows results from discovery operations
  // These are DATA DISPLAY views, not discovery execution interfaces
  // Now using auto-generated navigation items from _sidebar.generated.ts
  const discoveredItems: NavItem[] = useMemo(() => discoveredNavItems, []);

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
        {
          path: '/discovered',
          label: 'Discovered',
          icon: <FileSearch size={18} />,
          children: discoveredItems,
        },
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
      path: '/organisation-map',
      label: 'Organisation Map',
      icon: <Workflow size={20} />,
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

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col relative z-50">
      {/* Logo/Title */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">M&A Discovery Suite</h1>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-gray-800">
        <ProfileSelector
          type="source"
          label="Source Profile"
          showActions={true}
          className="mb-3"
          data-cy="sidebar-source-profile"
        />
        <div className="h-px bg-gray-800 my-3" />
        <ProfileSelector
          type="target"
          label="Target Profile"
          showActions={true}
          data-cy="sidebar-target-profile"
        />
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
                  <div key={child.path}>
                    <NavLink
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

                    {/* Grandchild items (nested children) */}
                    {child.children && (
                      <div className="ml-4">
                        {child.children.map((grandchild) => (
                          <NavLink
                            key={grandchild.path}
                            to={grandchild.path}
                            className={({ isActive }) =>
                              clsx(
                                'flex items-center gap-2 px-4 py-1.5 text-xs transition-colors',
                                'hover:bg-gray-800 hover:text-white',
                                isActive
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-500'
                              )
                            }
                          >
                            {grandchild.icon}
                            <span>{grandchild.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
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
    </aside>
  );
};

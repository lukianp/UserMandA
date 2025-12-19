/**
 * Sidebar Component
 *
 * Application sidebar with navigation, profile management, and system status.
 * Enhanced with SystemStatus component for real-time health monitoring.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronLeft,
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
  Wrench,
  Building2,
  Download,
} from 'lucide-react';

import { useProfileStore } from '../../store/useProfileStore';
import { SystemStatus } from '../molecules/SystemStatus';
import { ProfileSelector } from '../molecules/ProfileSelector';
import { useSystemHealthLogic } from '../../hooks/useSystemHealthLogic';
import { discoveredNavItems } from '../../views/discovered/_sidebar.generated';
import { discoveryNavItems } from '../../views/discovery/_sidebar.generated';

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
  const location = useLocation();

  // State for sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    setup: false,
    discovery: false,
    migration: false,
  });

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Check if a section should be expanded based on current path
  const isSectionActive = useCallback((paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  // Discovered Data - Shows results from discovery operations
  // These are DATA DISPLAY views, not discovery execution interfaces
  // Now using auto-generated navigation items from _sidebar.generated.ts
  const discoveredItems: NavItem[] = useMemo(() => discoveredNavItems, []);

  // Setup menu items (admin-only)
  const setupItems: NavItem[] = [
    {
      path: '/setup/company',
      label: 'Company',
      icon: <Building2 size={16} />,
    },
    {
      path: '/setup/azure-prerequisites',
      label: 'Azure Prerequisites',
      icon: <Cloud size={16} />,
    },
    {
      path: '/setup/installers',
      label: 'Installers',
      icon: <Download size={16} />,
    },
  ];

  // Navigation items
  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Overview',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/setup',
      label: 'Setup',
      icon: <Wrench size={20} />,
      children: setupItems,
    },
    {
      path: '/discovery',
      label: 'Discovery',
      icon: <Search size={20} />,
    },
    {
      path: '/discovery/discovered',
      label: 'Discovered',
      icon: <FileSearch size={20} />,
      children: discoveredItems,
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
    <aside className={clsx(
      'bg-gray-900 text-white flex flex-col relative z-50 transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={clsx(
          'absolute -right-3 top-20 z-50',
          'w-6 h-6 rounded-full',
          'bg-gray-800 border border-gray-700',
          'flex items-center justify-center',
          'text-gray-400 hover:text-white hover:bg-gray-700',
          'transition-all duration-200',
          'shadow-lg'
        )}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo/Title */}
      <div className="p-4 border-b border-gray-800">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold">Enterprise Discovery & Migration Suite</h1>
            <p className="text-xs text-gray-400 mt-1">Complete IT Assessment Platform</p>
          </>
        ) : (
          <div className="text-center text-xs font-bold">EDMS</div>
        )}
      </div>

      {/* Profile Section */}
      {!isCollapsed && (
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
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2 text-sm transition-all duration-200',
                  'hover:bg-gray-800 hover:text-white',
                  isCollapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white border-l-4 border-blue-500'
                    : 'text-gray-300'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>

            {/* Child items with visual hierarchy */}
            {item.children && !isCollapsed && (
              <div className="ml-4 border-l border-gray-700/50 relative">
                {item.children.map((child, childIndex) => (
                  <div key={child.path} className="relative">
                    {/* Connecting line dot */}
                    <div className="absolute left-0 top-3 w-2 h-px bg-gray-700/50" />
                    <NavLink
                      to={child.path}
                      className={({ isActive }: { isActive: boolean }) =>
                        clsx(
                          'flex items-center gap-2 ml-2 px-3 py-1.5 text-sm transition-all duration-200 rounded-r-md',
                          'hover:bg-gray-800/70 hover:text-white hover:translate-x-0.5',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/15 to-transparent text-white font-medium'
                            : 'text-gray-400'
                        )
                      }
                    >
                      <span className="opacity-70">{child.icon}</span>
                      <span>{child.label}</span>
                    </NavLink>

                    {/* Grandchild items (nested children) with deeper hierarchy */}
                    {child.children && (
                      <div className="ml-4 border-l border-gray-700/30 relative">
                        {child.children.map((grandchild) => (
                          <div key={grandchild.path} className="relative">
                            {/* Deeper connecting line dot */}
                            <div className="absolute left-0 top-2.5 w-2 h-px bg-gray-700/30" />
                            <NavLink
                              to={grandchild.path}
                              className={({ isActive }: { isActive: boolean }) =>
                                clsx(
                                  'flex items-center gap-2 ml-2 px-3 py-1 text-xs transition-all duration-200 rounded-r-md',
                                  'hover:bg-gray-800/50 hover:text-white hover:translate-x-0.5',
                                  isActive
                                    ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-white font-medium'
                                    : 'text-gray-500'
                                )
                              }
                            >
                              <span className="opacity-60 scale-90">{grandchild.icon}</span>
                              <span>{grandchild.label}</span>
                            </NavLink>
                          </div>
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
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <SystemStatus indicators={systemStatus} showLastSync={true} />
        </div>
      )}
    </aside>
  );
};

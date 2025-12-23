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
  Activity,
  GanttChartSquare,
  GitBranch,
  CloudCog,
  Gauge,
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

  // State for profile section collapse (default to collapsed)
  const [isSourceProfileExpanded, setIsSourceProfileExpanded] = useState(false);
  const [isTargetProfileExpanded, setIsTargetProfileExpanded] = useState(false);

  // Helper function to get profile display name
  const getProfileDisplayName = (profile: any): string => {
    if (profile?.companyName) {
      return profile.companyName;
    }
    if (profile?.name) {
      return profile.name;
    }
    if (profile?.id) {
      return profile.id;
    }
    return 'No Profile';
  };

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
      path: '/inventory',
      label: 'Inventory',
      icon: <Database size={20} />,
    },
    {
      path: '/migration',
      label: 'Migration',
      icon: <ArrowRightLeft size={20} />,
      children: [
        { path: '/migration/dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
        { path: '/migration/planning', label: 'Wave Planning', icon: <Calendar size={16} /> },
        { path: '/migration/domain-mapping', label: 'Domain Mapping', icon: <GitBranch size={16} /> },
        { path: '/migration/mapping', label: 'Resource Mapping', icon: <ChevronRight size={16} /> },
        { path: '/migration/validation', label: 'Validation', icon: <ChevronRight size={16} /> },
        { path: '/migration/go-no-go', label: 'Go/No-Go', icon: <Shield size={16} /> },
        { path: '/migration/execution', label: 'Execution', icon: <ChevronRight size={16} /> },
        { path: '/migration/gantt', label: 'Gantt Chart', icon: <GanttChartSquare size={16} /> },
        { path: '/migration/monitor', label: 'Monitor', icon: <Activity size={16} /> },
        { path: '/migration/azure-resources', label: 'Azure Resources', icon: <CloudCog size={16} /> },
        { path: '/migration/engineering', label: 'Engineering', icon: <Gauge size={16} /> },
        {
          path: '/migration/workloads',
          label: 'Workloads',
          icon: <Layers size={16} />,
          children: [
            { path: '/migration/workloads/users', label: 'Users', icon: <Users size={14} /> },
            { path: '/migration/workloads/mailboxes', label: 'Mailboxes', icon: <Mail size={14} /> },
            { path: '/migration/workloads/sharepoint', label: 'SharePoint', icon: <Globe size={14} /> },
            { path: '/migration/workloads/onedrive', label: 'OneDrive', icon: <HardDrive size={14} /> },
            { path: '/migration/workloads/teams', label: 'Teams', icon: <MessageSquare size={14} /> },
            { path: '/migration/workloads/devices', label: 'Devices', icon: <Cpu size={14} /> },
          ],
        },
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
      <div className="p-4 border-b border-gray-800 text-center">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold">Enterprise Discovery & Migration Suite</h1>
            <p className="text-xs text-gray-400 mt-1">Complete IT Assessment Platform</p>
          </>
        ) : (
          <div className="text-xs font-bold">EDMS</div>
        )}
      </div>

      {/* Profile Section */}
      {!isCollapsed && (
        <div className="border-b border-gray-800">
          {/* Source Profile - Collapsible */}
          <div className="p-4 pb-2">
            <button
              onClick={() => setIsSourceProfileExpanded(!isSourceProfileExpanded)}
              className="flex items-center justify-between w-full text-left mb-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Source Profile{selectedSourceProfile ? ` (${getProfileDisplayName(selectedSourceProfile)})` : ''}
              </span>
              {isSourceProfileExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>
            <div
              className={clsx(
                'overflow-hidden transition-all duration-300 ease-in-out',
                isSourceProfileExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <ProfileSelector
                type="source"
                label=""
                showActions={true}
                className="pb-2"
                data-cy="sidebar-source-profile"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-800 mx-4" />

          {/* Target Profile - Collapsible */}
          <div className="p-4 pt-2">
            <button
              onClick={() => setIsTargetProfileExpanded(!isTargetProfileExpanded)}
              className="flex items-center justify-between w-full text-left mb-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Target Profile{selectedTargetProfile ? ` (${getProfileDisplayName(selectedTargetProfile)})` : ''}
              </span>
              {isTargetProfileExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>
            <div
              className={clsx(
                'overflow-hidden transition-all duration-300 ease-in-out',
                isTargetProfileExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <ProfileSelector
                type="target"
                label=""
                showActions={true}
                data-cy="sidebar-target-profile"
              />
            </div>
          </div>
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

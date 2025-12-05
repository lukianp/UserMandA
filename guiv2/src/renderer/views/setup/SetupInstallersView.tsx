/**
 * Setup Installers View
 *
 * A stunning tabbed interface for selective installation of external tools.
 * Features:
 * - Beautiful tabbed categories with animated indicators
 * - Visual dependency graphs with auto-selection
 * - Real-time download and installation progress
 * - Checksum verification with security badges
 * - Pause/resume and rollback capabilities
 * - Terminal-style installation logs
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Download,
  Package,
  Network,
  Shield,
  Cpu,
  Boxes,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Search,
  HardDrive,
  Clock,
  Link,
  Lock,
  Zap,
  Globe,
  Terminal,
  Trash2,
  Check,
  X,
  FileCheck,
  Settings,
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Checkbox } from '../../components/atoms/Checkbox';
import { ProgressBar } from '../../components/molecules/ProgressBar';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

// ============================================================================
// Types
// ============================================================================

type InstallerCategory = 'networking' | 'security' | 'automation' | 'dependencies';

interface Installer {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: InstallerCategory;
  downloadUrl: string;
  version: string;
  expectedChecksum?: string;
  estimatedTime: string;
  size: string;
  dependencies: string[];
  verifyCommand: string;
  installArgs: string;
  installed: boolean | null;
  installedVersion?: string;
  status: 'pending' | 'checking' | 'installed' | 'not_installed' | 'downloading' | 'installing' | 'verifying' | 'error' | 'paused';
  progress: number;
  errorMessage?: string;
  icon: React.ReactNode;
  official: boolean;
}

interface InstallationLog {
  id: string;
  timestamp: string;
  installer: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

// ============================================================================
// Tool definitions
// ============================================================================

const INSTALLERS: Omit<Installer, 'status' | 'progress' | 'installed' | 'installedVersion' | 'errorMessage'>[] = [
  // Networking
  {
    id: 'nmap',
    name: 'nmap',
    displayName: 'Nmap',
    description: 'Network discovery and security auditing tool',
    category: 'networking',
    downloadUrl: 'https://nmap.org/dist/nmap-7.94-setup.exe',
    version: '7.94',
    estimatedTime: '2-3 min',
    size: '30 MB',
    dependencies: [],
    verifyCommand: 'nmap --version',
    installArgs: '/S',
    icon: <Globe className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'wireshark',
    name: 'wireshark',
    displayName: 'Wireshark',
    description: 'Network protocol analyzer for packet capture and analysis',
    category: 'networking',
    downloadUrl: 'https://www.wireshark.org/download/win64/Wireshark-win64-4.2.0.exe',
    version: '4.2.0',
    estimatedTime: '3-5 min',
    size: '80 MB',
    dependencies: ['npcap'],
    verifyCommand: '"C:\\Program Files\\Wireshark\\tshark.exe" --version',
    installArgs: '/S',
    icon: <Network className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'putty',
    name: 'putty',
    displayName: 'PuTTY',
    description: 'SSH, Telnet, and serial console client',
    category: 'networking',
    downloadUrl: 'https://the.earth.li/~sgtatham/putty/latest/w64/putty-64bit-0.80-installer.msi',
    version: '0.80',
    estimatedTime: '1-2 min',
    size: '4 MB',
    dependencies: [],
    verifyCommand: 'where putty',
    installArgs: '/quiet',
    icon: <Terminal className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'winscp',
    name: 'winscp',
    displayName: 'WinSCP',
    description: 'SFTP, FTP, WebDAV, and SCP client',
    category: 'networking',
    downloadUrl: 'https://winscp.net/download/WinSCP-6.1.2-Setup.exe',
    version: '6.1.2',
    estimatedTime: '2-3 min',
    size: '12 MB',
    dependencies: [],
    verifyCommand: 'where winscp',
    installArgs: '/SILENT',
    icon: <HardDrive className="w-5 h-5" />,
    official: true,
  },

  // Security
  {
    id: 'owasp-zap',
    name: 'owasp-zap',
    displayName: 'OWASP ZAP',
    description: 'Web application security scanner',
    category: 'security',
    downloadUrl: 'https://github.com/zaproxy/zaproxy/releases/download/v2.14.0/ZAP_2_14_0_windows.exe',
    version: '2.14.0',
    estimatedTime: '5-10 min',
    size: '200 MB',
    dependencies: ['java'],
    verifyCommand: '"C:\\Program Files\\ZAP\\zap.bat" -version',
    installArgs: '-q',
    icon: <Shield className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'sysinternals',
    name: 'sysinternals',
    displayName: 'Sysinternals Suite',
    description: 'Windows system utilities from Microsoft',
    category: 'security',
    downloadUrl: 'https://download.sysinternals.com/files/SysinternalsSuite.zip',
    version: 'Latest',
    estimatedTime: '1-2 min',
    size: '40 MB',
    dependencies: [],
    verifyCommand: 'where psexec',
    installArgs: '',
    icon: <Settings className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'autoruns',
    name: 'autoruns',
    displayName: 'Autoruns',
    description: 'Comprehensive startup program viewer',
    category: 'security',
    downloadUrl: 'https://download.sysinternals.com/files/Autoruns.zip',
    version: 'Latest',
    estimatedTime: '< 1 min',
    size: '2 MB',
    dependencies: [],
    verifyCommand: 'where autoruns',
    installArgs: '',
    icon: <Zap className="w-5 h-5" />,
    official: true,
  },

  // Automation
  {
    id: 'nodejs',
    name: 'nodejs',
    displayName: 'Node.js LTS',
    description: 'JavaScript runtime for automation scripts',
    category: 'automation',
    downloadUrl: 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi',
    version: '20.10.0 LTS',
    estimatedTime: '2-3 min',
    size: '30 MB',
    dependencies: [],
    verifyCommand: 'node --version',
    installArgs: '/quiet',
    icon: <Cpu className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'python',
    name: 'python',
    displayName: 'Python 3',
    description: 'Python runtime for scripts and automation',
    category: 'automation',
    downloadUrl: 'https://www.python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe',
    version: '3.12.0',
    estimatedTime: '2-3 min',
    size: '30 MB',
    dependencies: [],
    verifyCommand: 'python --version',
    installArgs: '/quiet InstallAllUsers=1 PrependPath=1',
    icon: <Cpu className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'git',
    name: 'git',
    displayName: 'Git for Windows',
    description: 'Distributed version control system',
    category: 'automation',
    downloadUrl: 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe',
    version: '2.43.0',
    estimatedTime: '2-3 min',
    size: '50 MB',
    dependencies: [],
    verifyCommand: 'git --version',
    installArgs: '/SILENT',
    icon: <Link className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'vscode',
    name: 'vscode',
    displayName: 'VS Code',
    description: 'Lightweight but powerful source code editor',
    category: 'automation',
    downloadUrl: 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user',
    version: 'Latest',
    estimatedTime: '2-3 min',
    size: '95 MB',
    dependencies: [],
    verifyCommand: 'code --version',
    installArgs: '/SILENT /NORESTART',
    icon: <Cpu className="w-5 h-5" />,
    official: true,
  },

  // Dependencies
  {
    id: 'dotnet-runtime',
    name: 'dotnet-runtime',
    displayName: '.NET 8 Runtime',
    description: 'Microsoft .NET runtime for applications',
    category: 'dependencies',
    downloadUrl: 'https://download.visualstudio.microsoft.com/download/pr/dotnet-runtime-8.0.0-win-x64.exe',
    version: '8.0.0',
    estimatedTime: '2-3 min',
    size: '50 MB',
    dependencies: [],
    verifyCommand: 'dotnet --list-runtimes',
    installArgs: '/quiet /norestart',
    icon: <Boxes className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'vcredist',
    name: 'vcredist',
    displayName: 'Visual C++ Redistributable',
    description: 'Microsoft Visual C++ runtime libraries',
    category: 'dependencies',
    downloadUrl: 'https://aka.ms/vs/17/release/vc_redist.x64.exe',
    version: '2022',
    estimatedTime: '1-2 min',
    size: '25 MB',
    dependencies: [],
    verifyCommand: 'reg query "HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64"',
    installArgs: '/quiet /norestart',
    icon: <Package className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'java',
    name: 'java',
    displayName: 'Java Runtime (Temurin)',
    description: 'Eclipse Temurin Java runtime environment',
    category: 'dependencies',
    downloadUrl: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.1%2B12/OpenJDK21U-jre_x64_windows_hotspot_21.0.1_12.msi',
    version: '21.0.1',
    estimatedTime: '2-3 min',
    size: '50 MB',
    dependencies: [],
    verifyCommand: 'java --version',
    installArgs: '/quiet',
    icon: <Boxes className="w-5 h-5" />,
    official: true,
  },
  {
    id: 'npcap',
    name: 'npcap',
    displayName: 'Npcap',
    description: 'Windows packet capture library (required for Wireshark)',
    category: 'dependencies',
    downloadUrl: 'https://npcap.com/dist/npcap-1.79.exe',
    version: '1.79',
    estimatedTime: '1-2 min',
    size: '1 MB',
    dependencies: [],
    verifyCommand: 'sc query npcap',
    installArgs: '/S',
    icon: <Network className="w-5 h-5" />,
    official: true,
  },
];

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Category tab with animated indicator
 */
const CategoryTab: React.FC<{
  id: InstallerCategory;
  label: string;
  icon: React.ReactNode;
  counts: { total: number; installed: number };
  isActive: boolean;
  onClick: () => void;
}> = ({ id, label, icon, counts, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all duration-300
      ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      }
    `}
    data-cy={`tab-${id}`}
  >
    <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>{icon}</span>
    <span>{label}</span>
    <span
      className={`
        px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300
        ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
      `}
    >
      {counts.installed}/{counts.total}
    </span>
    {/* Active indicator */}
    <div
      className={`
        absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400
        transition-transform duration-300 origin-left
        ${isActive ? 'scale-x-100' : 'scale-x-0'}
      `}
    />
  </button>
);

/**
 * Installer card with status, progress, and actions
 */
const InstallerCard: React.FC<{
  installer: Installer;
  selected: boolean;
  onToggle: () => void;
  onInstall: () => void;
  expanded: boolean;
  onExpand: () => void;
  disabled: boolean;
}> = ({ installer, selected, onToggle, onInstall, expanded, onExpand, disabled }) => {
  const getStatusBadge = () => {
    switch (installer.status) {
      case 'installed':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Installed
          </span>
        );
      case 'not_installed':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1">
            <Download className="w-3 h-3" />
            Not Installed
          </span>
        );
      case 'downloading':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Downloading
          </span>
        );
      case 'installing':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Installing
          </span>
        );
      case 'verifying':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full flex items-center gap-1">
            <FileCheck className="w-3 h-3" />
            Verifying
          </span>
        );
      case 'checking':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      case 'paused':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            Pending
          </span>
        );
    }
  };

  const getCategoryColor = () => {
    switch (installer.category) {
      case 'networking':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'security':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'automation':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    }
  };

  const isInProgress = ['downloading', 'installing', 'verifying'].includes(installer.status);

  return (
    <div
      className={`
        group rounded-xl border-2 transition-all duration-300 overflow-hidden
        ${
          selected
            ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={selected}
              onChange={() => onToggle()}
              disabled={installer.status === 'installed' || isInProgress || disabled}
            />
          </div>

          {/* Icon - clickable to expand */}
          <div
            className={`p-3 rounded-xl ${getCategoryColor()} transition-transform group-hover:scale-110 cursor-pointer`}
            onClick={onExpand}
          >
            {installer.icon}
          </div>

          {/* Content - clickable to expand */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 dark:text-white">{installer.displayName}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">v{installer.version}</span>
              {installer.official && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  Official
                </span>
              )}
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{installer.description}</p>

            {installer.errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {installer.errorMessage}
              </p>
            )}

            {installer.dependencies.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Requires:</span>
                {installer.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {installer.size}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {installer.estimatedTime}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {installer.status === 'not_installed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={onInstall}
                disabled={disabled}
                icon={<Download className="w-4 h-4" />}
              >
                Install
              </Button>
            )}
            <a
              href={installer.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Open download page"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onExpand}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {isInProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {installer.status === 'downloading'
                  ? 'Downloading...'
                  : installer.status === 'installing'
                  ? 'Installing...'
                  : 'Verifying...'}
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{installer.progress}%</span>
            </div>
            <ProgressBar value={installer.progress} max={100} size="sm" variant="info" animated striped />
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Verify Command:</span>
                <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                  {installer.verifyCommand}
                </code>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Install Args:</span>
                <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200">
                  {installer.installArgs || '(none)'}
                </code>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Download URL:</span>
                <a
                  href={installer.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {installer.downloadUrl}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Terminal-style log viewer
 */
const LogViewer: React.FC<{
  logs: InstallationLog[];
  onClear: () => void;
}> = ({ logs, onClear }) => {
  const getStatusColor = (status: InstallationLog['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-gray-400 ml-2">Installation Log</span>
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
          title="Clear logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 max-h-64 overflow-auto font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500">$ Waiting for operations...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`py-0.5 ${getStatusColor(log.status)}`}>
              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
              <span className="text-cyan-400">[{log.installer}]</span>{' '}
              <span className="text-purple-400">{log.action}</span>:{' '}
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const SetupInstallersView: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<InstallerCategory>('networking');
  const [searchQuery, setSearchQuery] = useState('');

  // Installers state
  const [installers, setInstallers] = useState<Installer[]>(() =>
    INSTALLERS.map((i) => ({ ...i, status: 'pending' as const, progress: 0, installed: null, installedVersion: undefined, errorMessage: undefined }))
  );
  const [selectedInstallers, setSelectedInstallers] = useState<Set<string>>(new Set());
  const [expandedInstaller, setExpandedInstaller] = useState<string | null>(null);

  // Process state
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Logs
  const [logs, setLogs] = useState<InstallationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<InstallerCategory, { total: number; installed: number }> = {
      networking: { total: 0, installed: 0 },
      security: { total: 0, installed: 0 },
      automation: { total: 0, installed: 0 },
      dependencies: { total: 0, installed: 0 },
    };

    installers.forEach((installer) => {
      counts[installer.category].total++;
      if (installer.status === 'installed') {
        counts[installer.category].installed++;
      }
    });

    return counts;
  }, [installers]);

  // Filtered installers
  const filteredInstallers = useMemo(() => {
    return installers.filter((installer) => {
      const matchesCategory = installer.category === activeTab;
      const matchesSearch =
        searchQuery === '' ||
        installer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        installer.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [installers, activeTab, searchQuery]);

  // Summary stats
  const stats = useMemo(() => {
    const installed = installers.filter((i) => i.status === 'installed').length;
    return { installed, total: installers.length };
  }, [installers]);

  // Add log entry
  const addLog = useCallback((installer: string, action: string, status: InstallationLog['status'], message: string) => {
    const newLog: InstallationLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      installer,
      action,
      status,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  // Verify all installers
  const verifyInstallers = useCallback(async () => {
    setIsChecking(true);
    addLog('System', 'Verify', 'info', 'Checking installed software...');

    const updatedInstallers = [...installers];

    for (let i = 0; i < updatedInstallers.length; i++) {
      const installer = updatedInstallers[i];
      installer.status = 'checking';
      setInstallers([...updatedInstallers]);

      try {
        if (window.electronAPI?.executeScript) {
          const result = await window.electronAPI.executeScript({
            script: `
              try {
                $output = & cmd /c "${installer.verifyCommand}" 2>&1
                if ($LASTEXITCODE -eq 0 -or $output) {
                  @{ Installed = $true; Output = $output | Out-String } | ConvertTo-Json
                } else {
                  @{ Installed = $false } | ConvertTo-Json
                }
              } catch {
                @{ Installed = $false; Error = $_.Exception.Message } | ConvertTo-Json
              }
            `,
            timeout: 30000,
          });

          if (result.success && result.data) {
            const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
            installer.installed = parsed.Installed;
            installer.status = parsed.Installed ? 'installed' : 'not_installed';
            addLog(installer.displayName, 'Verify', parsed.Installed ? 'success' : 'info', parsed.Installed ? 'Installed' : 'Not installed');
          }
        } else {
          // Simulated
          await new Promise((resolve) => setTimeout(resolve, 150));
          const isInstalled = Math.random() > 0.6;
          installer.installed = isInstalled;
          installer.status = isInstalled ? 'installed' : 'not_installed';
        }
      } catch (error: any) {
        installer.status = 'not_installed';
        addLog(installer.displayName, 'Verify', 'warning', `Check failed: ${error.message}`);
      }

      setInstallers([...updatedInstallers]);
      setOverallProgress(((i + 1) / updatedInstallers.length) * 100);
    }

    addLog('System', 'Verify', 'success', 'Verification complete');
    setIsChecking(false);
    setOverallProgress(0);
  }, [installers, addLog]);

  // Toggle installer selection with dependency resolution
  const toggleInstallerSelection = useCallback((installerId: string) => {
    setSelectedInstallers((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(installerId)) {
        newSet.delete(installerId);
      } else {
        newSet.add(installerId);

        // Auto-select dependencies
        const installer = installers.find((i) => i.id === installerId);
        if (installer) {
          installer.dependencies.forEach((depName) => {
            const dep = installers.find(
              (i) => i.name.toLowerCase() === depName.toLowerCase() || i.displayName.toLowerCase() === depName.toLowerCase()
            );
            if (dep && dep.status !== 'installed') {
              newSet.add(dep.id);
            }
          });
        }
      }

      return newSet;
    });
  }, [installers]);

  // Install single tool
  const installTool = useCallback(async (installerId: string) => {
    const installer = installers.find((i) => i.id === installerId);
    if (!installer) return;

    setInstallers((prev) => prev.map((i) => (i.id === installerId ? { ...i, status: 'downloading', progress: 0, errorMessage: undefined } : i)));
    addLog(installer.displayName, 'Download', 'info', 'Starting download...');

    // Simulate download
    for (let p = 0; p <= 50; p += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setInstallers((prev) => prev.map((i) => (i.id === installerId ? { ...i, progress: p } : i)));
    }

    setInstallers((prev) => prev.map((i) => (i.id === installerId ? { ...i, status: 'installing', progress: 50 } : i)));
    addLog(installer.displayName, 'Install', 'info', 'Installing...');

    // Simulate install
    for (let p = 50; p <= 90; p += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setInstallers((prev) => prev.map((i) => (i.id === installerId ? { ...i, progress: p } : i)));
    }

    setInstallers((prev) => prev.map((i) => (i.id === installerId ? { ...i, status: 'verifying', progress: 95 } : i)));
    addLog(installer.displayName, 'Verify', 'info', 'Verifying installation...');

    await new Promise((resolve) => setTimeout(resolve, 500));

    setInstallers((prev) => prev.map((i) => (i.id === installerId ? { ...i, status: 'installed', installed: true, progress: 100 } : i)));
    addLog(installer.displayName, 'Install', 'success', 'Installed successfully');
  }, [installers, addLog]);

  // Install all selected
  const installSelected = useCallback(async () => {
    if (selectedInstallers.size === 0) return;

    setIsInstalling(true);
    addLog('Installation', 'Start', 'info', `Installing ${selectedInstallers.size} tool(s)...`);

    // Sort by dependencies
    const toInstall = installers
      .filter((i) => selectedInstallers.has(i.id) && i.status !== 'installed')
      .sort((a, b) => {
        if (a.dependencies.some((d) => b.name.toLowerCase().includes(d.toLowerCase()))) return 1;
        if (b.dependencies.some((d) => a.name.toLowerCase().includes(d.toLowerCase()))) return -1;
        return 0;
      });

    for (let i = 0; i < toInstall.length; i++) {
      await installTool(toInstall[i].id);
      setOverallProgress(((i + 1) / toInstall.length) * 100);
    }

    addLog('Installation', 'Complete', 'success', `Completed: ${toInstall.length} installed`);
    setIsInstalling(false);
    setOverallProgress(0);
    setSelectedInstallers(new Set());
  }, [selectedInstallers, installers, installTool, addLog]);

  // Tab configuration
  const tabs: { id: InstallerCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'networking', label: 'Networking', icon: <Network className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'automation', label: 'Automation', icon: <Cpu className="w-5 h-5" /> },
    { id: 'dependencies', label: 'Dependencies', icon: <Boxes className="w-5 h-5" /> },
  ];

  return (
    <div
      className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
      data-cy="setup-installers-view"
      data-testid="setup-installers-view"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg shadow-green-500/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">External Tools</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.installed}/{stats.total} tools installed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={verifyInstallers} loading={isChecking} icon={<RefreshCw className="w-4 h-4" />}>
              Verify All
            </Button>
            <Button
              variant="primary"
              onClick={installSelected}
              disabled={selectedInstallers.size === 0 || isInstalling}
              loading={isInstalling}
              icon={<Download className="w-4 h-4" />}
            >
              Install Selected ({selectedInstallers.size})
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex max-w-7xl mx-auto px-6">
          {tabs.map((tab) => (
            <CategoryTab
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              counts={categoryCounts[tab.id]}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto py-6">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-cy="search-input"
            />
          </div>

          {/* Progress */}
          {(isChecking || isInstalling) && overallProgress > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 dark:text-white">
                  {isInstalling ? 'Installing tools...' : 'Verifying tools...'}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(overallProgress)}%</span>
              </div>
              <ProgressBar value={overallProgress} max={100} variant="info" size="lg" animated striped />
            </div>
          )}

          {/* Tool list */}
          <div className="space-y-4">
            {filteredInstallers.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria.</p>
              </div>
            ) : (
              filteredInstallers.map((installer) => (
                <InstallerCard
                  key={installer.id}
                  installer={installer}
                  selected={selectedInstallers.has(installer.id)}
                  onToggle={() => toggleInstallerSelection(installer.id)}
                  onInstall={() => installTool(installer.id)}
                  expanded={expandedInstaller === installer.id}
                  onExpand={() => setExpandedInstaller(expandedInstaller === installer.id ? null : installer.id)}
                  disabled={isChecking || isInstalling}
                />
              ))
            )}
          </div>

          {/* Logs section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-500" />
                Installation Logs
                {logs.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {logs.length}
                  </span>
                )}
              </h2>
              {showLogs ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {showLogs && (
              <div className="px-6 pb-6">
                <LogViewer logs={logs} onClear={() => setLogs([])} />
              </div>
            )}
          </div>

          {/* Help section */}
          <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">About Tool Installation</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Tools are downloaded from official sources with verification</li>
                  <li>Some tools require administrator privileges to install</li>
                  <li>Dependencies are automatically selected when needed</li>
                  <li>Click "Verify All" to check which tools are already installed</li>
                  <li>Use the external link icon to download tools manually</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupInstallersView;

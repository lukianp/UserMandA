/**
 * Setup Installers and Dependencies View
 *
 * A beautiful module management interface for PowerShell prerequisites and system dependencies.
 * Features:
 * - Visual dependency tracking with animated connections
 * - Real-time installation progress with step tracking
 * - Module version detection and conflict resolution
 * - Elevated permissions check with visual feedback
 * - Smart verification with retry capability
 * - Terminal-style logging with syntax highlighting
 * - PowerShell Remoting status and security considerations
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Package,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Download,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Terminal,
  Cpu,
  Box,
  Layers,
  GitBranch,
  Clock,
  HardDrive,
  Activity,
  Settings,
  Search,
  Cloud,
  Loader2,
  Copy,
  Trash2,
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Checkbox } from '../../components/atoms/Checkbox';
import { ProgressBar } from '../../components/molecules/ProgressBar';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

// ============================================================================
// Types
// ============================================================================

interface PowerShellModule {
  name: string;
  displayName: string;
  description: string;
  category: 'core' | 'azure' | 'graph' | 'utility';
  version?: string;
  installedVersion?: string;
  status: 'unknown' | 'checking' | 'installed' | 'outdated' | 'not_installed' | 'installing' | 'error';
  required: boolean;
  dependencies: string[];
  size?: string;
  icon: React.ReactNode;
  errorMessage?: string;
  conflictsWith?: string;
  rsatFeature?: string; // Windows RSAT capability name (e.g., 'Rsat.GroupPolicy.Management.Tools~~~~0.0.1.0')
}

interface InstallationLog {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

interface SystemRequirements {
  powershellVersion: { required: string; installed: string | null; met: boolean | null };
  elevated: boolean | null;
  diskSpace: { required: number; available: number; met: boolean };
  networkAccess: boolean | null;
  psRemoting: { enabled: boolean | null; required: boolean; securityNote: string };
}

interface ExternalTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'network' | 'security' | 'development' | 'runtime';
  version?: string;
  installedVersion?: string;
  status: 'unknown' | 'checking' | 'installed' | 'not_installed' | 'installing' | 'error';
  required: boolean;
  downloadUrl: string;
  checkCommand: string; // PowerShell command to check if installed
  installCommand?: string; // PowerShell command to install (if silent install available)
  size?: string;
  icon: React.ReactNode;
  errorMessage?: string;
  notes?: string;
}

// ============================================================================
// Module definitions
// ============================================================================

const POWERSHELL_MODULES: Omit<PowerShellModule, 'status' | 'installedVersion' | 'errorMessage'>[] = [
  {
    name: 'Microsoft.Graph',
    displayName: 'Microsoft Graph SDK',
    description: 'Microsoft Graph PowerShell SDK for accessing Microsoft 365 services',
    category: 'graph',
    version: '2.x',
    required: true,
    dependencies: ['Microsoft.Graph.Authentication'],
    size: '~50 MB',
    icon: <GitBranch className="w-5 h-5" />,
  },
  {
    name: 'Microsoft.Graph.Authentication',
    displayName: 'Graph Authentication',
    description: 'Authentication module for Microsoft Graph SDK',
    category: 'graph',
    version: '2.x',
    required: true,
    dependencies: [],
    size: '~5 MB',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: 'Az.Accounts',
    displayName: 'Azure Accounts',
    description: 'Azure Resource Manager authentication and account management',
    category: 'azure',
    version: '2.x',
    required: true,
    dependencies: [],
    size: '~15 MB',
    icon: <Cloud className="w-5 h-5" />,
    conflictsWith: 'AzureRM',
  },
  {
    name: 'Az.Resources',
    displayName: 'Azure Resources',
    description: 'Azure Resource Manager cmdlets for managing resources',
    category: 'azure',
    version: '6.x',
    required: false,
    dependencies: ['Az.Accounts'],
    size: '~10 MB',
    icon: <Box className="w-5 h-5" />,
  },
  {
    name: 'ExchangeOnlineManagement',
    displayName: 'Exchange Online',
    description: 'Exchange Online PowerShell V3 module for mailbox management',
    category: 'core',
    version: '3.x',
    required: true,
    dependencies: [],
    size: '~20 MB',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    name: 'MicrosoftTeams',
    displayName: 'Microsoft Teams',
    description: 'Manage Teams settings, channels, and policies',
    category: 'core',
    version: '5.x',
    required: false,
    dependencies: [],
    size: '~30 MB',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    name: 'PnP.PowerShell',
    displayName: 'PnP PowerShell',
    description: 'Community-driven SharePoint and Microsoft 365 management',
    category: 'core',
    version: '2.x',
    required: false,
    dependencies: [],
    size: '~25 MB',
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    name: 'MSAL.PS',
    displayName: 'MSAL PowerShell',
    description: 'Microsoft Authentication Library for PowerShell',
    category: 'utility',
    version: '4.x',
    required: false,
    dependencies: [],
    size: '~2 MB',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: 'ImportExcel',
    displayName: 'ImportExcel',
    description: 'Import/Export Excel spreadsheets without Excel installed',
    category: 'utility',
    version: '7.x',
    required: false,
    dependencies: [],
    size: '~3 MB',
    icon: <HardDrive className="w-5 h-5" />,
  },
  {
    name: 'PSWriteHTML',
    displayName: 'PSWriteHTML',
    description: 'Create beautiful HTML reports from PowerShell',
    category: 'utility',
    version: '1.x',
    required: false,
    dependencies: [],
    size: '~5 MB',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    name: 'GroupPolicy',
    displayName: 'Group Policy Management',
    description: 'RSAT Group Policy cmdlets for GPO discovery (requires Windows RSAT feature)',
    category: 'core',
    version: 'Windows',
    required: true,
    dependencies: [],
    size: '~2 MB',
    icon: <Settings className="w-5 h-5" />,
    rsatFeature: 'Rsat.GroupPolicy.Management.Tools~~~~0.0.1.0',
  },
  {
    name: 'ActiveDirectory',
    displayName: 'Active Directory',
    description: 'RSAT Active Directory cmdlets (requires Windows RSAT feature)',
    category: 'core',
    version: 'Windows',
    required: true,
    dependencies: [],
    size: '~3 MB',
    icon: <Layers className="w-5 h-5" />,
    rsatFeature: 'Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0',
  },
];

// ============================================================================
// External Tools definitions
// ============================================================================

const EXTERNAL_TOOLS: Omit<ExternalTool, 'status' | 'installedVersion' | 'errorMessage'>[] = [
  {
    id: 'nmap',
    name: 'nmap',
    displayName: 'Nmap',
    description: 'Network mapper for network discovery and security auditing. Required for network infrastructure discovery.',
    category: 'network',
    version: '7.98',
    required: true,
    downloadUrl: 'https://nmap.org/dist/nmap-7.98-setup.exe',
    checkCommand: `
      $nmapPath = @(
        'C:\\Program Files (x86)\\Nmap\\nmap.exe',
        'C:\\Program Files\\Nmap\\nmap.exe',
        (Get-Command nmap -ErrorAction SilentlyContinue).Source
      ) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
      if ($nmapPath) {
        $version = & $nmapPath --version 2>&1 | Select-String -Pattern 'Nmap version ([\\d.]+)' | ForEach-Object { $_.Matches[0].Groups[1].Value }
        @{ Installed = $true; Version = $version; Path = $nmapPath } | ConvertTo-Json
      } else {
        @{ Installed = $false } | ConvertTo-Json
      }
    `,
    installCommand: `
      $url = 'https://nmap.org/dist/nmap-7.98-setup.exe'
      $installer = "$env:TEMP\\nmap-setup.exe"
      Write-Host "Downloading Nmap installer..."
      [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing Nmap silently (includes Npcap)..."
      Start-Process -FilePath $installer -ArgumentList '/S' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~30 MB',
    icon: <Activity className="w-5 h-5" />,
    notes: 'Includes Npcap for packet capture.',
  },
  {
    id: 'npcap',
    name: 'npcap',
    displayName: 'Npcap',
    description: 'Packet capture library for Windows. Required by Nmap and Wireshark for raw packet capture.',
    category: 'network',
    version: '1.79',
    required: false,
    downloadUrl: 'https://npcap.com/dist/npcap-1.79.exe',
    checkCommand: `
      $npcapService = Get-Service -Name npcap -ErrorAction SilentlyContinue
      $npcapPath = 'C:\\Program Files\\Npcap\\NPFInstall.exe'
      if ($npcapService -or (Test-Path $npcapPath)) {
        @{ Installed = $true; Version = 'Installed' } | ConvertTo-Json
      } else {
        @{ Installed = $false } | ConvertTo-Json
      }
    `,
    installCommand: `
      $url = 'https://npcap.com/dist/npcap-1.79.exe'
      $installer = "$env:TEMP\\npcap-installer.exe"
      Write-Host "Downloading Npcap installer..."
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing Npcap silently..."
      Start-Process -FilePath $installer -ArgumentList '/S', '/winpcap_mode=no' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~1 MB',
    icon: <Zap className="w-5 h-5" />,
    notes: 'Usually installed with Nmap. Standalone install if needed.',
  },
  {
    id: 'wireshark',
    name: 'wireshark',
    displayName: 'Wireshark',
    description: 'Network protocol analyzer for deep packet inspection and network troubleshooting.',
    category: 'network',
    version: '4.4.2',
    required: false,
    downloadUrl: 'https://2.na.dl.wireshark.org/win64/Wireshark-4.4.2-x64.exe',
    checkCommand: `
      $wiresharkPath = @(
        'C:\\Program Files\\Wireshark\\Wireshark.exe',
        (Get-Command wireshark -ErrorAction SilentlyContinue).Source
      ) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
      if ($wiresharkPath) {
        @{ Installed = $true; Path = $wiresharkPath } | ConvertTo-Json
      } else {
        @{ Installed = $false } | ConvertTo-Json
      }
    `,
    installCommand: `
      $url = 'https://2.na.dl.wireshark.org/win64/Wireshark-4.4.2-x64.exe'
      $installer = "$env:TEMP\\wireshark-installer.exe"
      Write-Host "Downloading Wireshark installer..."
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing Wireshark silently..."
      Start-Process -FilePath $installer -ArgumentList '/S', '/desktopicon=no', '/quicklaunchicon=no' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~80 MB',
    icon: <Search className="w-5 h-5" />,
    notes: 'Optional. Useful for advanced network analysis.',
  },
  {
    id: 'git',
    name: 'git',
    displayName: 'Git',
    description: 'Distributed version control system. Required for source code management and updates.',
    category: 'development',
    version: '2.47.1',
    required: false,
    downloadUrl: 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe',
    checkCommand: `
      try {
        $gitVersion = git --version 2>&1
        if ($gitVersion -match 'git version ([\\d.]+)') {
          @{ Installed = $true; Version = $Matches[1] } | ConvertTo-Json
        } else {
          @{ Installed = $false } | ConvertTo-Json
        }
      } catch {
        @{ Installed = $false } | ConvertTo-Json
      }
    `,
    installCommand: `
      $url = 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe'
      $installer = "$env:TEMP\\git-installer.exe"
      Write-Host "Downloading Git installer..."
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing Git silently..."
      Start-Process -FilePath $installer -ArgumentList '/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/CLOSEAPPLICATIONS', '/RESTARTAPPLICATIONS' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~60 MB',
    icon: <GitBranch className="w-5 h-5" />,
    notes: 'Recommended for keeping discovery suite updated.',
  },
  {
    id: 'vcredist',
    name: 'vcredist',
    displayName: 'Visual C++ Redistributable',
    description: 'Microsoft Visual C++ runtime libraries. Required for native Node.js modules.',
    category: 'runtime',
    version: '2022',
    required: true,
    downloadUrl: 'https://aka.ms/vs/17/release/vc_redist.x64.exe',
    checkCommand: `
      $vcKeys = @(
        'HKLM:\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64',
        'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64'
      )
      $installed = $false
      $version = $null
      foreach ($key in $vcKeys) {
        if (Test-Path $key) {
          $installed = $true
          $version = (Get-ItemProperty $key -ErrorAction SilentlyContinue).Version
          break
        }
      }
      @{ Installed = $installed; Version = $version } | ConvertTo-Json
    `,
    installCommand: `
      $url = 'https://aka.ms/vs/17/release/vc_redist.x64.exe'
      $installer = "$env:TEMP\\vc_redist.x64.exe"
      Write-Host "Downloading VC++ Redistributable..."
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing VC++ Redistributable silently..."
      Start-Process -FilePath $installer -ArgumentList '/install', '/quiet', '/norestart' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~25 MB',
    icon: <Cpu className="w-5 h-5" />,
    notes: 'Required for better-sqlite3 and other native modules.',
  },
  {
    id: 'dotnet',
    name: 'dotnet',
    displayName: '.NET Runtime 8.0',
    description: '.NET Runtime for PowerShell 7 and modern Windows applications.',
    category: 'runtime',
    version: '8.0',
    required: false,
    downloadUrl: 'https://download.visualstudio.microsoft.com/download/pr/f18288f6-1732-415b-b577-7fb46510479a/a98239f751a7aed31bc4aa12f348a9bf/windowsdesktop-runtime-8.0.11-win-x64.exe',
    checkCommand: `
      try {
        $dotnetVersion = dotnet --version 2>&1
        if ($dotnetVersion -match '^[\\d.]+') {
          @{ Installed = $true; Version = $dotnetVersion.Trim() } | ConvertTo-Json
        } else {
          @{ Installed = $false } | ConvertTo-Json
        }
      } catch {
        @{ Installed = $false } | ConvertTo-Json
      }
    `,
    installCommand: `
      $url = 'https://download.visualstudio.microsoft.com/download/pr/f18288f6-1732-415b-b577-7fb46510479a/a98239f751a7aed31bc4aa12f348a9bf/windowsdesktop-runtime-8.0.11-win-x64.exe'
      $installer = "$env:TEMP\\dotnet-runtime.exe"
      Write-Host "Downloading .NET Runtime..."
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing .NET Runtime silently..."
      Start-Process -FilePath $installer -ArgumentList '/install', '/quiet', '/norestart' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~60 MB',
    icon: <Box className="w-5 h-5" />,
    notes: 'Recommended for PowerShell 7 compatibility.',
  },
  {
    id: 'pwsh7',
    name: 'pwsh',
    displayName: 'PowerShell 7',
    description: 'Cross-platform PowerShell with improved performance and modern features.',
    category: 'runtime',
    version: '7.4.6',
    required: false,
    downloadUrl: 'https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/PowerShell-7.4.6-win-x64.msi',
    checkCommand: `
      try {
        $pwshPath = Get-Command pwsh -ErrorAction SilentlyContinue
        if ($pwshPath) {
          $version = pwsh -Command '$PSVersionTable.PSVersion.ToString()' 2>&1
          @{ Installed = $true; Version = $version.Trim() } | ConvertTo-Json
        } else {
          @{ Installed = $false } | ConvertTo-Json
        }
      } catch {
        @{ Installed = $false } | ConvertTo-Json
      }
    `,
    installCommand: `
      $url = 'https://github.com/PowerShell/PowerShell/releases/download/v7.4.6/PowerShell-7.4.6-win-x64.msi'
      $installer = "$env:TEMP\\powershell7.msi"
      Write-Host "Downloading PowerShell 7..."
      Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
      Write-Host "Installing PowerShell 7 silently..."
      Start-Process -FilePath 'msiexec.exe' -ArgumentList '/i', $installer, '/quiet', '/norestart', 'ADD_EXPLORER_CONTEXT_MENU_OPENPOWERSHELL=1', 'ADD_FILE_CONTEXT_MENU_RUNPOWERSHELL=1', 'ENABLE_PSREMOTING=0', 'REGISTER_MANIFEST=1' -Wait
      Remove-Item $installer -Force -ErrorAction SilentlyContinue
      @{ Success = $true } | ConvertTo-Json
    `,
    size: '~100 MB',
    icon: <Terminal className="w-5 h-5" />,
    notes: 'Recommended for improved Graph module performance.',
  },
];

// ============================================================================
// Sub-components
// ============================================================================

/**
 * System requirements panel with visual indicators
 */
const SystemRequirementsPanel: React.FC<{
  requirements: SystemRequirements;
  onRefresh: () => void;
  isChecking: boolean;
}> = ({ requirements, onRefresh, isChecking }) => {
  const items = [
    {
      label: 'PowerShell Version',
      value: requirements.powershellVersion.installed
        ? `${requirements.powershellVersion.installed} (requires ${requirements.powershellVersion.required}+)`
        : 'Checking...',
      met: requirements.powershellVersion.met,
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      label: 'Administrator Privileges',
      value: requirements.elevated === null
        ? 'Checking...'
        : requirements.elevated
        ? 'Running as Administrator'
        : 'Standard User (CurrentUser scope)',
      met: requirements.elevated,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: 'Disk Space',
      value: `${requirements.diskSpace.available.toFixed(1)} GB available`,
      met: requirements.diskSpace.met,
      icon: <HardDrive className="w-4 h-4" />,
    },
    {
      label: 'Network Access',
      value: requirements.networkAccess === null
        ? 'Checking...'
        : requirements.networkAccess
        ? 'PowerShell Gallery accessible'
        : 'Cannot reach PSGallery',
      met: requirements.networkAccess,
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: 'PowerShell Remoting',
      value: requirements.psRemoting.enabled === null
        ? 'Checking...'
        : requirements.psRemoting.enabled
        ? 'Enabled (GPO discovery with alternate credentials supported)'
        : 'Disabled (Enable for GPO discovery with saved credentials)',
      met: requirements.psRemoting.enabled === null ? null : (requirements.psRemoting.required ? requirements.psRemoting.enabled : true),
      icon: <Zap className="w-4 h-4" />,
      warning: !requirements.psRemoting.enabled && requirements.psRemoting.enabled !== null,
      note: requirements.psRemoting.securityNote,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" />
          System Requirements
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          loading={isChecking}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${
                item.met === null
                  ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                  : item.met
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={
                  item.met === null
                    ? 'text-gray-500 dark:text-gray-400'
                    : item.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }
              >
                {item.icon}
              </span>
              {item.met === null ? (
                <LoadingSpinner size="sm" />
              ) : item.met ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Module card with status indicator and controls
 */
const ModuleCard: React.FC<{
  module: PowerShellModule;
  selected: boolean;
  onToggle: () => void;
  onInstall: () => void;
  expanded: boolean;
  onExpand: () => void;
  disabled: boolean;
}> = ({ module, selected, onToggle, onInstall, expanded, onExpand, disabled }) => {
  const getStatusBadge = () => {
    switch (module.status) {
      case 'installed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Installed
          </span>
        );
      case 'outdated':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Update Available
          </span>
        );
      case 'not_installed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1">
            <X className="w-3 h-3" />
            Not Installed
          </span>
        );
      case 'installing':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Installing
          </span>
        );
      case 'checking':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            Unknown
          </span>
        );
    }
  };

  const getCategoryColor = () => {
    switch (module.category) {
      case 'graph':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'azure':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'core':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div
      className={`
        group rounded-xl border-2 transition-all duration-300
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
              disabled={module.required || module.status === 'installing' || module.status === 'installed' || disabled}
            />
          </div>

          {/* Icon - clickable to expand */}
          <div
            className={`p-3 rounded-xl ${getCategoryColor()} transition-transform group-hover:scale-110 cursor-pointer`}
            onClick={onExpand}
          >
            {module.icon}
          </div>

          {/* Content - clickable to expand */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 dark:text-white">{module.displayName}</h4>
              {module.required && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                  Required
                </span>
              )}
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{module.description}</p>

            {module.errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {module.errorMessage}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {module.installedVersion ? (
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    Installed: v{module.installedVersion}
                  </span>
                ) : (
                  <span>Required: {module.version}</span>
                )}
              </span>
              {module.size && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {module.size}
                </span>
              )}
              {module.dependencies.length > 0 && (
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {module.dependencies.length} dep{module.dependencies.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {module.status === 'not_installed' && (
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
            {module.status === 'outdated' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onInstall}
                disabled={disabled}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Update
              </Button>
            )}
            <button
              onClick={onExpand}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="ml-2 text-gray-900 dark:text-white capitalize">{module.category}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Module Name:</span>
                <code className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 text-xs">
                  {module.name}
                </code>
              </div>
              {module.dependencies.length > 0 && (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Dependencies:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {module.dependencies.map((dep) => (
                      <span
                        key={dep}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {module.conflictsWith && (
                <div className="col-span-2">
                  <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Conflicts with: {module.conflictsWith}
                  </span>
                </div>
              )}
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
              <span className="text-cyan-400">[{log.module}]</span>{' '}
              <span className="text-purple-400">{log.action}</span>:{' '}
              {log.message}
              {log.duration && <span className="text-gray-500"> ({(log.duration / 1000).toFixed(1)}s)</span>}
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
  console.log('[SetupInstallersView] Component rendering');

  // Module state
  const [modules, setModules] = useState<PowerShellModule[]>(() => {
    console.log('[SetupInstallersView] Initializing modules state');
    return POWERSHELL_MODULES.map((m) => ({ ...m, status: 'unknown' as const, installedVersion: undefined, errorMessage: undefined }));
  });
  const [selectedModules, setSelectedModules] = useState<Set<string>>(() => {
    console.log('[SetupInstallersView] Initializing selected modules');
    return new Set(POWERSHELL_MODULES.filter((m) => m.required).map((m) => m.name));
  });
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // External tools state
  const [externalTools, setExternalTools] = useState<ExternalTool[]>(() => {
    console.log('[SetupInstallersView] Initializing external tools state');
    return EXTERNAL_TOOLS.map((t) => ({ ...t, status: 'unknown' as const, installedVersion: undefined, errorMessage: undefined }));
  });
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'tools'>('modules');

  // System requirements
  const [requirements, setRequirements] = useState<SystemRequirements>({
    powershellVersion: { required: '5.1', installed: null, met: null },
    elevated: null,
    diskSpace: { required: 0.5, available: 100, met: true },
    networkAccess: null,
    psRemoting: {
      enabled: null,
      required: false,
      securityNote: 'Required for GPO discovery with alternate credentials. Opens PowerShell remoting on localhost only.',
    },
  });
  const [isCheckingRequirements, setIsCheckingRequirements] = useState(false);

  // Process state
  const [isInstalling, setIsInstalling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);

  // Logs
  const [logs, setLogs] = useState<InstallationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add log entry
  const addLog = useCallback((module: string, action: string, status: InstallationLog['status'], message: string, duration?: number) => {
    const newLog: InstallationLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      module,
      action,
      status,
      message,
      duration,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  // Check system requirements
  const checkRequirements = useCallback(async () => {
    console.log('[SetupInstallersView] checkRequirements called');
    setIsCheckingRequirements(true);
    addLog('System', 'Check', 'info', 'Checking system requirements...');

    try {
      console.log('[SetupInstallersView] Checking if electronAPI exists:', !!window.electronAPI);
      console.log('[SetupInstallersView] Checking if executeScript exists:', !!window.electronAPI?.executeScript);

      // Check admin rights
      if (window.electronAPI?.executeScript) {
        console.log('[SetupInstallersView] Executing admin check script');
        const adminResult = await window.electronAPI.executeScript({
          script: `
            $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
            $principal = New-Object Security.Principal.WindowsPrincipal $identity
            $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
            @{ IsAdmin = $isAdmin } | ConvertTo-Json
          `,
          timeout: 10000,
        });

        console.log('[SetupInstallersView] Admin check result:', adminResult);

        if (adminResult.success && adminResult.data) {
          const parsed = typeof adminResult.data === 'string' ? JSON.parse(adminResult.data) : adminResult.data;
          setRequirements((prev) => ({ ...prev, elevated: parsed.IsAdmin }));
          addLog('System', 'AdminCheck', parsed.IsAdmin ? 'success' : 'warning',
            parsed.IsAdmin ? 'Running with administrator privileges' : 'Running without admin (CurrentUser scope)');
        }

        // Check PowerShell version
        console.log('[SetupInstallersView] Executing PowerShell version check');
        const versionResult = await window.electronAPI.executeScript({
          script: `$PSVersionTable.PSVersion.ToString()`,
          timeout: 10000,
        });

        console.log('[SetupInstallersView] PowerShell version result:', versionResult);

        if (versionResult.success && versionResult.data) {
          const version = versionResult.data.toString().trim();
          const majorVersion = parseFloat(version.split('.')[0]);
          setRequirements((prev) => ({
            ...prev,
            powershellVersion: {
              ...prev.powershellVersion,
              installed: version,
              met: majorVersion >= 5.1,
            },
          }));
          addLog('System', 'VersionCheck', 'info', `PowerShell version: ${version}`);
        }

        // Check PSRemoting status
        console.log('[SetupInstallersView] Checking PSRemoting status');
        const psRemotingResult = await window.electronAPI.executeScript({
          script: `
            try {
              $psRemoting = Test-WSMan -ErrorAction SilentlyContinue
              @{ Enabled = $true } | ConvertTo-Json
            } catch {
              @{ Enabled = $false } | ConvertTo-Json
            }
          `,
          timeout: 10000,
        });

        console.log('[SetupInstallersView] PSRemoting check result:', psRemotingResult);

        if (psRemotingResult.success && psRemotingResult.data) {
          const parsed = typeof psRemotingResult.data === 'string' ? JSON.parse(psRemotingResult.data) : psRemotingResult.data;
          setRequirements((prev) => ({
            ...prev,
            psRemoting: {
              ...prev.psRemoting,
              enabled: parsed.Enabled,
            },
          }));
          addLog('System', 'PSRemotingCheck', parsed.Enabled ? 'success' : 'warning',
            parsed.Enabled ? 'PowerShell Remoting is enabled' : 'PowerShell Remoting is disabled (required for GPO discovery with alternate credentials)');
        }
      } else {
        console.warn('[SetupInstallersView] electronAPI.executeScript not available - using simulated data');
        // Simulated for development
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRequirements((prev) => ({
          ...prev,
          powershellVersion: { required: '5.1', installed: '7.3.4', met: true },
          elevated: true,
          networkAccess: navigator.onLine,
          psRemoting: { ...prev.psRemoting, enabled: false },
        }));
        addLog('System', 'Check', 'success', 'Environment check complete (simulated)');
      }

      // Check network
      setRequirements((prev) => ({ ...prev, networkAccess: navigator.onLine }));

      // Check completion flag
      if (window.electronAPI?.getConfig) {
        const completedFlag = await window.electronAPI.getConfig('azurePrerequisitesCompleted');
        setSetupComplete(!!completedFlag);
      }
    } catch (error: any) {
      console.error('[SetupInstallersView] checkRequirements error:', error);
      addLog('System', 'Check', 'error', `Environment check failed: ${error.message}`);
    } finally {
      console.log('[SetupInstallersView] checkRequirements complete');
      setIsCheckingRequirements(false);
    }
  }, [addLog]);

  // Verify module status
  const verifyModules = useCallback(async () => {
    console.log('[SetupInstallersView] verifyModules called, module count:', modules.length);
    setIsVerifying(true);
    addLog('Modules', 'Verify', 'info', 'Checking installed modules...');

    const updatedModules = [...modules];
    let installedCount = 0;

    for (let i = 0; i < updatedModules.length; i++) {
      const module = updatedModules[i];
      console.log(`[SetupInstallersView] Checking module ${i + 1}/${updatedModules.length}: ${module.name}`);
      module.status = 'checking';
      setModules([...updatedModules]);

      try {
        if (window.electronAPI?.executeScript) {
          console.log(`[SetupInstallersView] Executing Get-Module for: ${module.name}`);
          const result = await window.electronAPI.executeScript({
            script: `
              $module = Get-Module -ListAvailable -Name '${module.name}' | Select-Object -First 1
              if ($module) {
                @{ Installed = $true; Version = $module.Version.ToString() } | ConvertTo-Json
              } else {
                @{ Installed = $false } | ConvertTo-Json
              }
            `,
            timeout: 30000,
          });

          console.log(`[SetupInstallersView] Module ${module.name} check result:`, result);

          if (result.success && result.data) {
            const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
            module.status = parsed.Installed ? 'installed' : 'not_installed';
            module.installedVersion = parsed.Version;

            if (parsed.Installed) {
              installedCount++;
              addLog(module.name, 'Verify', 'success', `Installed (v${parsed.Version})`);
            } else {
              addLog(module.name, 'Verify', 'info', 'Not installed');
            }
          } else {
            // Handle failed PowerShell check (no sessions available, etc.)
            console.warn(`[SetupInstallersView] Module ${module.name} check failed:`, result.error);
            module.status = 'error';
            module.errorMessage = result.error || 'Check failed - unable to verify module';
            addLog(module.name, 'Verify', 'error', result.error || 'Check failed');
          }
        } else {
          console.warn(`[SetupInstallersView] electronAPI.executeScript not available for module: ${module.name}`);
          // Simulated for development
          await new Promise((resolve) => setTimeout(resolve, 200));
          const isInstalled = Math.random() > 0.4;
          module.status = isInstalled ? 'installed' : 'not_installed';
          module.installedVersion = isInstalled ? module.version : undefined;
          if (isInstalled) installedCount++;
        }
      } catch (error: any) {
        console.error(`[SetupInstallersView] Module ${module.name} check error:`, error);
        module.status = 'error';
        module.errorMessage = error.message;
        addLog(module.name, 'Verify', 'error', error.message);
      }

      setModules([...updatedModules]);
      setOverallProgress(((i + 1) / updatedModules.length) * 100);
    }

    addLog('Modules', 'Verify', 'success', `Verification complete: ${installedCount}/${updatedModules.length} installed`);
    setIsVerifying(false);
    setOverallProgress(0);
  }, [modules, addLog]);

  // Toggle module selection
  const toggleModule = useCallback((name: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  // Install single module
  const installModule = useCallback(async (moduleName: string) => {
    const moduleDefinition = POWERSHELL_MODULES.find((m) => m.name === moduleName);
    const module = modules.find((m) => m.name === moduleName);
    if (!module || !moduleDefinition) return;

    setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'installing', errorMessage: undefined } : m)));
    addLog(moduleName, 'Install', 'info', 'Starting installation...');

    const startTime = Date.now();

    try {
      if (window.electronAPI?.executeScript) {
        // Check if this is a Windows RSAT feature
        const isRSATFeature = !!moduleDefinition.rsatFeature;

        let script: string;
        if (isRSATFeature) {
          // Use Add-WindowsCapability for RSAT features
          addLog(moduleName, 'Install', 'info', 'Installing Windows RSAT feature (requires admin rights)...');
          script = `
            try {
              # Check if running as administrator
              $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
              $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

              if (-not $isAdmin) {
                throw "Administrator privileges required to install RSAT features. Please run the application as Administrator."
              }

              # Install the RSAT feature
              $result = Add-WindowsCapability -Online -Name '${moduleDefinition.rsatFeature}' -ErrorAction Stop

              if ($result.State -eq 'Installed' -or $result.RestartNeeded -eq $false) {
                @{ Success = $true; RestartNeeded = $result.RestartNeeded } | ConvertTo-Json
              } else {
                @{ Success = $false; Error = "Installation state: $($result.State)" } | ConvertTo-Json
              }
            } catch {
              @{ Success = $false; Error = $_.Exception.Message } | ConvertTo-Json
            }
          `;
        } else {
          // Use Install-Module for PowerShell Gallery modules
          script = `
            try {
              Install-Module -Name '${moduleName}' -Force -AllowClobber -Scope CurrentUser -ErrorAction Stop
              @{ Success = $true } | ConvertTo-Json
            } catch {
              @{ Success = $false; Error = $_.Exception.Message } | ConvertTo-Json
            }
          `;
        }

        const result = await window.electronAPI.executeScript({
          script: script,
          timeout: 300000,
        });

        const duration = Date.now() - startTime;

        if (result.success) {
          const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          if (parsed.Success) {
            setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'installed', installedVersion: m.version } : m)));
            const message = parsed.RestartNeeded
              ? 'Installed successfully (restart may be required)'
              : 'Installed successfully';
            addLog(moduleName, 'Install', 'success', message, duration);
          } else {
            setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'error', errorMessage: parsed.Error } : m)));
            addLog(moduleName, 'Install', 'error', parsed.Error || 'Installation failed', duration);
          }
        }
      } else {
        // Simulated for development
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const duration = Date.now() - startTime;
        setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'installed', installedVersion: m.version } : m)));
        addLog(moduleName, 'Install', 'success', 'Installed successfully (simulated)', duration);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'error', errorMessage: error.message } : m)));
      addLog(moduleName, 'Install', 'error', error.message, duration);
    }
  }, [modules, addLog]);

  // Install all selected modules
  const installSelectedModules = useCallback(async () => {
    setIsInstalling(true);
    setOverallProgress(0);

    const toInstall = modules.filter((m) => selectedModules.has(m.name) && m.status !== 'installed');
    addLog('Installation', 'Start', 'info', `Installing ${toInstall.length} module(s)...`);

    for (let i = 0; i < toInstall.length; i++) {
      await installModule(toInstall[i].name);
      setOverallProgress(((i + 1) / toInstall.length) * 100);
    }

    // Check if all required modules are installed
    const allRequiredInstalled = modules.filter((m) => m.required).every((m) => m.status === 'installed');
    if (allRequiredInstalled) {
      if (window.electronAPI?.setConfig) {
        await window.electronAPI.setConfig('azurePrerequisitesCompleted', true);
      }
      setSetupComplete(true);
      addLog('Installation', 'Complete', 'success', 'All required prerequisites installed');
    }

    setIsInstalling(false);
    setOverallProgress(0);
    setSelectedModules(new Set(POWERSHELL_MODULES.filter((m) => m.required).map((m) => m.name)));
  }, [modules, selectedModules, installModule, addLog]);

  // Verify external tools status
  const verifyExternalTools = useCallback(async () => {
    console.log('[SetupInstallersView] verifyExternalTools called');
    setIsVerifying(true);
    addLog('Tools', 'Verify', 'info', 'Checking installed external tools...');

    const updatedTools = [...externalTools];
    let installedCount = 0;

    for (let i = 0; i < updatedTools.length; i++) {
      const tool = updatedTools[i];
      const toolDef = EXTERNAL_TOOLS.find((t) => t.id === tool.id);
      if (!toolDef) continue;

      console.log(`[SetupInstallersView] Checking tool ${i + 1}/${updatedTools.length}: ${tool.name}`);
      tool.status = 'checking';
      setExternalTools([...updatedTools]);

      try {
        if (window.electronAPI?.executeScript) {
          const result = await window.electronAPI.executeScript({
            script: toolDef.checkCommand,
            timeout: 30000,
          });

          console.log(`[SetupInstallersView] Tool ${tool.name} check result:`, result);

          if (result.success && result.data) {
            const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
            tool.status = parsed.Installed ? 'installed' : 'not_installed';
            tool.installedVersion = parsed.Version;

            if (parsed.Installed) {
              installedCount++;
              addLog(tool.displayName, 'Verify', 'success', `Installed${parsed.Version ? ` (v${parsed.Version})` : ''}`);
            } else {
              addLog(tool.displayName, 'Verify', 'info', 'Not installed');
            }
          } else {
            tool.status = 'error';
            tool.errorMessage = result.error || 'Check failed';
            addLog(tool.displayName, 'Verify', 'error', result.error || 'Check failed');
          }
        } else {
          // Simulated for development
          await new Promise((resolve) => setTimeout(resolve, 200));
          const isInstalled = Math.random() > 0.5;
          tool.status = isInstalled ? 'installed' : 'not_installed';
          if (isInstalled) installedCount++;
        }
      } catch (error: any) {
        console.error(`[SetupInstallersView] Tool ${tool.name} check error:`, error);
        tool.status = 'error';
        tool.errorMessage = error.message;
        addLog(tool.displayName, 'Verify', 'error', error.message);
      }

      setExternalTools([...updatedTools]);
      setOverallProgress(((i + 1) / updatedTools.length) * 100);
    }

    addLog('Tools', 'Verify', 'success', `Verification complete: ${installedCount}/${updatedTools.length} installed`);
    setIsVerifying(false);
    setOverallProgress(0);
  }, [externalTools, addLog]);

  // Install external tool (download and silent install)
  const installTool = useCallback(async (toolId: string) => {
    const toolDef = EXTERNAL_TOOLS.find((t) => t.id === toolId);
    if (!toolDef || !toolDef.installCommand) {
      addLog(toolDef?.displayName || toolId, 'Install', 'error', 'No install command available for this tool');
      return;
    }

    // Update tool status to installing
    setExternalTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, status: 'installing' as const, errorMessage: undefined } : t))
    );
    addLog(toolDef.displayName, 'Install', 'info', 'Starting download and installation...');

    const startTime = Date.now();

    try {
      if (window.electronAPI?.executeScript) {
        const result = await window.electronAPI.executeScript({
          script: toolDef.installCommand,
          timeout: 600000, // 10 minutes for large downloads
        });

        const duration = Date.now() - startTime;

        if (result.success) {
          addLog(toolDef.displayName, 'Install', 'success', `Installation completed in ${(duration / 1000).toFixed(1)}s`);
          // Re-verify the tool to get the installed version
          const verifyResult = await window.electronAPI.executeScript({
            script: toolDef.checkCommand,
            timeout: 30000,
          });
          if (verifyResult.success && verifyResult.data) {
            const parsed = typeof verifyResult.data === 'string' ? JSON.parse(verifyResult.data) : verifyResult.data;
            setExternalTools((prev) =>
              prev.map((t) =>
                t.id === toolId
                  ? { ...t, status: parsed.Installed ? 'installed' : 'not_installed', installedVersion: parsed.Version }
                  : t
              )
            );
          } else {
            setExternalTools((prev) =>
              prev.map((t) => (t.id === toolId ? { ...t, status: 'installed' as const } : t))
            );
          }
        } else {
          addLog(toolDef.displayName, 'Install', 'error', result.error || 'Installation failed');
          setExternalTools((prev) =>
            prev.map((t) => (t.id === toolId ? { ...t, status: 'error' as const, errorMessage: result.error } : t))
          );
        }
      } else {
        // Fallback: open download URL in browser
        addLog(toolDef.displayName, 'Install', 'warning', 'Silent install not available, opening download page...');
        window.open(toolDef.downloadUrl, '_blank');
        setExternalTools((prev) =>
          prev.map((t) => (t.id === toolId ? { ...t, status: 'not_installed' as const } : t))
        );
      }
    } catch (error: any) {
      console.error(`[SetupInstallersView] Tool ${toolId} install error:`, error);
      addLog(toolDef.displayName, 'Install', 'error', error.message);
      setExternalTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, status: 'error' as const, errorMessage: error.message } : t))
      );
    }
  }, [addLog]);

  // Filter external tools
  const filteredTools = useMemo(() => {
    return externalTools.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [externalTools, searchQuery]);

  // External tools stats
  const toolStats = useMemo(() => {
    const installed = externalTools.filter((t) => t.status === 'installed').length;
    const required = externalTools.filter((t) => t.required).length;
    const requiredInstalled = externalTools.filter((t) => t.required && t.status === 'installed').length;
    return { installed, total: externalTools.length, required, requiredInstalled };
  }, [externalTools]);

  // Filter modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [modules, categoryFilter, searchQuery]);

  // Summary stats
  const stats = useMemo(() => {
    const installed = modules.filter((m) => m.status === 'installed').length;
    const required = modules.filter((m) => m.required).length;
    const requiredInstalled = modules.filter((m) => m.required && m.status === 'installed').length;
    return { installed, total: modules.length, required, requiredInstalled };
  }, [modules]);

  // Initial check on mount only
  useEffect(() => {
    console.log('[SetupInstallersView] useEffect - Component mounted, starting initialization');
    let mounted = true;

    const initialize = async () => {
      console.log('[SetupInstallersView] initialize - Starting...');
      if (!mounted) {
        console.log('[SetupInstallersView] initialize - Component unmounted, aborting');
        return;
      }
      await checkRequirements();
      if (!mounted) {
        console.log('[SetupInstallersView] initialize - Component unmounted after checkRequirements');
        return;
      }
      await verifyModules();
      if (!mounted) return;
      await verifyExternalTools();
      console.log('[SetupInstallersView] initialize - Complete');
    };

    initialize();

    return () => {
      console.log('[SetupInstallersView] useEffect cleanup - Component unmounting');
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const allRequirementsMet =
    requirements.powershellVersion.met !== false && requirements.networkAccess !== false;

  return (
    <div
      className="min-h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
      data-cy="setup-prerequisites-view"
      data-testid="setup-prerequisites-view"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Prerequisites & Tools</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">PowerShell Modules & External Tools</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {setupComplete && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Complete
              </span>
            )}
            <Button
              variant="secondary"
              onClick={activeTab === 'modules' ? verifyModules : verifyExternalTools}
              loading={isVerifying}
              icon={<Search className="w-4 h-4" />}
            >
              Verify All
            </Button>
            {activeTab === 'modules' && (
              <Button
                variant="primary"
                onClick={installSelectedModules}
                disabled={isInstalling || !allRequirementsMet || selectedModules.size === 0}
                loading={isInstalling}
                icon={<Download className="w-4 h-4" />}
              >
                Install Selected ({selectedModules.size})
              </Button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-4 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'modules'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            PowerShell Modules
            <span className={`px-1.5 py-0.5 text-xs rounded ${activeTab === 'modules' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
              {stats.installed}/{stats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'tools'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Terminal className="w-4 h-4" />
            External Tools
            <span className={`px-1.5 py-0.5 text-xs rounded ${activeTab === 'tools' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
              {toolStats.installed}/{toolStats.total}
            </span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto py-6">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Success banner */}
          {setupComplete && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Prerequisites Installed</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All required PowerShell modules for Enterprise Discovery & Migration Suite are installed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modules Tab Content */}
          {activeTab === 'modules' && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Modules', value: stats.total, icon: <Package className="w-5 h-5" />, color: 'blue' },
                  { label: 'Installed', value: stats.installed, icon: <CheckCircle className="w-5 h-5" />, color: 'green' },
                  { label: 'Required', value: `${stats.requiredInstalled}/${stats.required}`, icon: <AlertTriangle className="w-5 h-5" />, color: 'yellow' },
                  { label: 'Selected', value: selectedModules.size, icon: <Check className="w-5 h-5" />, color: 'purple' },
                ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System requirements */}
          <SystemRequirementsPanel requirements={requirements} onRefresh={checkRequirements} isChecking={isCheckingRequirements} />

          {/* Progress */}
          {(isInstalling || isVerifying) && overallProgress > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 dark:text-white">
                  {isInstalling ? 'Installing modules...' : 'Verifying modules...'}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(overallProgress)}%</span>
              </div>
              <ProgressBar value={overallProgress} max={100} variant="info" size="lg" animated striped />
            </div>
          )}

          {/* Module list header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PowerShell Modules</h2>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-2">
                {['all', 'graph', 'azure', 'core', 'utility'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.name}
                module={module}
                selected={selectedModules.has(module.name)}
                onToggle={() => toggleModule(module.name)}
                onInstall={() => installModule(module.name)}
                expanded={expandedModule === module.name}
                onExpand={() => setExpandedModule(expandedModule === module.name ? null : module.name)}
                disabled={isInstalling || isVerifying}
              />
            ))}
          </div>

              {/* No results */}
              {filteredModules.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No modules found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </>
          )}

          {/* External Tools Tab Content */}
          {activeTab === 'tools' && (
            <>
              {/* Tools Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Tools', value: toolStats.total, icon: <Terminal className="w-5 h-5" />, color: 'blue' },
                  { label: 'Installed', value: toolStats.installed, icon: <CheckCircle className="w-5 h-5" />, color: 'green' },
                  { label: 'Required', value: `${toolStats.requiredInstalled}/${toolStats.required}`, icon: <AlertTriangle className="w-5 h-5" />, color: 'yellow' },
                  { label: 'Not Installed', value: toolStats.total - toolStats.installed, icon: <X className="w-5 h-5" />, color: 'red' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {isVerifying && overallProgress > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 dark:text-white">Verifying tools...</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(overallProgress)}%</span>
                  </div>
                  <ProgressBar value={overallProgress} max={100} variant="info" size="lg" animated striped />
                </div>
              )}

              {/* Tools list header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">External Tools</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tools grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`
                      group rounded-xl border-2 transition-all duration-300
                      ${
                        tool.status === 'installed'
                          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                            tool.category === 'network'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : tool.category === 'runtime'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : tool.category === 'development'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {tool.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{tool.displayName}</h4>
                            {tool.required && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                                Required
                              </span>
                            )}
                            {/* Status badge */}
                            {tool.status === 'installed' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Installed
                              </span>
                            ) : tool.status === 'checking' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Checking
                              </span>
                            ) : tool.status === 'installing' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Installing...
                              </span>
                            ) : tool.status === 'not_installed' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1">
                                <X className="w-3 h-3" />
                                Not Installed
                              </span>
                            ) : tool.status === 'error' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Error
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>

                          {tool.errorMessage && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {tool.errorMessage}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {tool.installedVersion ? (
                                <span className="font-semibold text-green-600 dark:text-green-400">v{tool.installedVersion}</span>
                              ) : (
                                <span>v{tool.version}</span>
                              )}
                            </span>
                            {tool.size && (
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {tool.size}
                              </span>
                            )}
                            <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                              {tool.category}
                            </span>
                          </div>

                          {tool.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                              <Info className="w-3 h-3 inline mr-1" />
                              {tool.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {tool.status !== 'installed' && tool.status !== 'checking' && tool.status !== 'installing' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => installTool(tool.id)}
                              disabled={isVerifying || isInstalling}
                              icon={<Download className="w-4 h-4" />}
                            >
                              Install
                            </Button>
                          )}
                          {tool.status === 'installing' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled
                              icon={<Loader2 className="w-4 h-4 animate-spin" />}
                            >
                              Installing...
                            </Button>
                          )}
                          <button
                            onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {expandedTool === tool.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedTool === tool.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Category:</span>
                              <span className="ml-2 text-gray-900 dark:text-white capitalize">{tool.category}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Download:</span>
                              <a
                                href={tool.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 inline-flex"
                              >
                                Official Site <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* No results */}
              {filteredTools.length === 0 && (
                <div className="text-center py-12">
                  <Terminal className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria.</p>
                </div>
              )}
            </>
          )}

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
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  These modules are required for the Enterprise Discovery & Migration Suite to function properly. Required modules are
                  automatically selected and cannot be deselected.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://docs.microsoft.com/powershell/microsoftgraph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Microsoft Graph Docs
                  </a>
                  <a
                    href="https://www.powershellgallery.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    PowerShell Gallery
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupInstallersView;



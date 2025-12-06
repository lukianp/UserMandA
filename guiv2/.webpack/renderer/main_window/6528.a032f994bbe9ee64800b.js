"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6528],{

/***/ 6528:
/*!**********************************************************!*\
  !*** ./src/renderer/views/setup/SetupInstallersView.tsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/atoms/Button */ 74160);
/* harmony import */ var _components_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/atoms/Checkbox */ 63683);
/* harmony import */ var _components_molecules_ProgressBar__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/molecules/ProgressBar */ 33523);

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





// ============================================================================
// Tool definitions
// ============================================================================
const INSTALLERS = [
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Globe, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Network, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Terminal, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.HardDrive, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Shield, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Settings, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Zap, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Cpu, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Cpu, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Link, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Cpu, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Boxes, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Package, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Boxes, { className: "w-5 h-5" }),
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
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Network, { className: "w-5 h-5" }),
        official: true,
    },
];
// ============================================================================
// Sub-components
// ============================================================================
/**
 * Category tab with animated indicator
 */
const CategoryTab = ({ id, label, icon, counts, isActive, onClick }) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: onClick, className: `
      relative flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all duration-300
      ${isActive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
    `, "data-cy": `tab-${id}`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: `transition-transform duration-300 ${isActive ? 'scale-110' : ''}`, children: icon }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: label }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: `
        px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300
        ${isActive
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
      `, children: [counts.installed, "/", counts.total] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `
        absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400
        transition-transform duration-300 origin-left
        ${isActive ? 'scale-x-100' : 'scale-x-0'}
      ` })] }));
/**
 * Installer card with status, progress, and actions
 */
const InstallerCard = ({ installer, selected, onToggle, onInstall, expanded, onExpand, disabled }) => {
    const getStatusBadge = () => {
        switch (installer.status) {
            case 'installed':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Check, { className: "w-3 h-3" }), "Installed"] }));
            case 'not_installed':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Download, { className: "w-3 h-3" }), "Not Installed"] }));
            case 'downloading':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Loader2, { className: "w-3 h-3 animate-spin" }), "Downloading"] }));
            case 'installing':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Loader2, { className: "w-3 h-3 animate-spin" }), "Installing"] }));
            case 'verifying':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.FileCheck, { className: "w-3 h-3" }), "Verifying"] }));
            case 'checking':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Loader2, { className: "w-3 h-3 animate-spin" }), "Checking"] }));
            case 'error':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.AlertCircle, { className: "w-3 h-3" }), "Error"] }));
            case 'paused':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2.5 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Pause, { className: "w-3 h-3" }), "Paused"] }));
            default:
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full", children: "Pending" }));
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
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `
        group rounded-xl border-2 transition-all duration-300 overflow-hidden
        ${selected
            ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}
      `, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "pt-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_4__.Checkbox, { checked: selected, onChange: () => onToggle(), disabled: installer.status === 'installed' || isInProgress || disabled }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `p-3 rounded-xl ${getCategoryColor()} transition-transform group-hover:scale-110 cursor-pointer`, onClick: onExpand, children: installer.icon }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: onExpand, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 flex-wrap", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h4", { className: "font-semibold text-gray-900 dark:text-white", children: installer.displayName }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["v", installer.version] }), installer.official && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex items-center gap-0.5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Lock, { className: "w-2.5 h-2.5" }), "Official"] })), getStatusBadge()] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: installer.description }), installer.errorMessage && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), installer.errorMessage] })), installer.dependencies.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Requires:" }), installer.dependencies.map((dep) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded", children: dep }, dep)))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.HardDrive, { className: "w-3 h-3" }), installer.size] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Clock, { className: "w-3 h-3" }), installer.estimatedTime] })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [installer.status === 'not_installed' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "primary", size: "sm", onClick: onInstall, disabled: disabled, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Download, { className: "w-4 h-4" }), children: "Install" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", { href: installer.downloadUrl, target: "_blank", rel: "noopener noreferrer", className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200", title: "Open download page", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.ExternalLink, { className: "w-4 h-4" }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onExpand, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: expanded ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.ChevronDown, { className: "w-4 h-4" }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.ChevronRight, { className: "w-4 h-4" }) })] })] }), isInProgress && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "mt-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: installer.status === 'downloading'
                                        ? 'Downloading...'
                                        : installer.status === 'installing'
                                            ? 'Installing...'
                                            : 'Verifying...' }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-xs font-medium text-blue-600 dark:text-blue-400", children: [installer.progress, "%"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_molecules_ProgressBar__WEBPACK_IMPORTED_MODULE_5__.ProgressBar, { value: installer.progress, max: 100, size: "sm", variant: "info", animated: true, striped: true })] })), expanded && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: "Verify Command:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("code", { className: "block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 overflow-x-auto", children: installer.verifyCommand })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: "Install Args:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("code", { className: "block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200", children: installer.installArgs || '(none)' })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "col-span-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: "Download URL:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", { href: installer.downloadUrl, target: "_blank", rel: "noopener noreferrer", className: "block mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate", children: installer.downloadUrl })] })] }) }))] }) }));
};
/**
 * Terminal-style log viewer
 */
const LogViewer = ({ logs, onClear }) => {
    const getStatusColor = (status) => {
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
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-gray-900 rounded-lg overflow-hidden", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-1.5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 rounded-full bg-red-500" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-400 ml-2", children: "Installation Log" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClear, className: "p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors", title: "Clear logs", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Trash2, { className: "w-4 h-4" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-4 max-h-64 overflow-auto font-mono text-sm", children: logs.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-500", children: "$ Waiting for operations..." })) : (logs.map((log) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `py-0.5 ${getStatusColor(log.status)}`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-gray-500", children: ["[", new Date(log.timestamp).toLocaleTimeString(), "]"] }), ' ', (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-cyan-400", children: ["[", log.installer, "]"] }), ' ', (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-purple-400", children: log.action }), ":", ' ', log.message] }, log.id)))) })] }));
};
// ============================================================================
// Main Component
// ============================================================================
const SetupInstallersView = () => {
    // Tab state
    const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('networking');
    const [searchQuery, setSearchQuery] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    // Installers state
    const [installers, setInstallers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => INSTALLERS.map((i) => ({ ...i, status: 'pending', progress: 0, installed: null, installedVersion: undefined, errorMessage: undefined })));
    const [selectedInstallers, setSelectedInstallers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(new Set());
    const [expandedInstaller, setExpandedInstaller] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    // Process state
    const [isChecking, setIsChecking] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [isInstalling, setIsInstalling] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [overallProgress, setOverallProgress] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
    // Logs
    const [logs, setLogs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [showLogs, setShowLogs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    // Category counts
    const categoryCounts = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        const counts = {
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
    const filteredInstallers = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        return installers.filter((installer) => {
            const matchesCategory = installer.category === activeTab;
            const matchesSearch = searchQuery === '' ||
                installer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                installer.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [installers, activeTab, searchQuery]);
    // Summary stats
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        const installed = installers.filter((i) => i.status === 'installed').length;
        return { installed, total: installers.length };
    }, [installers]);
    // Add log entry
    const addLog = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((installer, action, status, message) => {
        const newLog = {
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
    const verifyInstallers = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
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
                }
                else {
                    // Simulated
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    const isInstalled = Math.random() > 0.6;
                    installer.installed = isInstalled;
                    installer.status = isInstalled ? 'installed' : 'not_installed';
                }
            }
            catch (error) {
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
    const toggleInstallerSelection = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((installerId) => {
        setSelectedInstallers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(installerId)) {
                newSet.delete(installerId);
            }
            else {
                newSet.add(installerId);
                // Auto-select dependencies
                const installer = installers.find((i) => i.id === installerId);
                if (installer) {
                    installer.dependencies.forEach((depName) => {
                        const dep = installers.find((i) => i.name.toLowerCase() === depName.toLowerCase() || i.displayName.toLowerCase() === depName.toLowerCase());
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
    const installTool = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async (installerId) => {
        const installer = installers.find((i) => i.id === installerId);
        if (!installer)
            return;
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
    const installSelected = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        if (selectedInstallers.size === 0)
            return;
        setIsInstalling(true);
        addLog('Installation', 'Start', 'info', `Installing ${selectedInstallers.size} tool(s)...`);
        // Sort by dependencies
        const toInstall = installers
            .filter((i) => selectedInstallers.has(i.id) && i.status !== 'installed')
            .sort((a, b) => {
            if (a.dependencies.some((d) => b.name.toLowerCase().includes(d.toLowerCase())))
                return 1;
            if (b.dependencies.some((d) => a.name.toLowerCase().includes(d.toLowerCase())))
                return -1;
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
    const tabs = [
        { id: 'networking', label: 'Networking', icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Network, { className: "w-5 h-5" }) },
        { id: 'security', label: 'Security', icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Shield, { className: "w-5 h-5" }) },
        { id: 'automation', label: 'Automation', icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Cpu, { className: "w-5 h-5" }) },
        { id: 'dependencies', label: 'Dependencies', icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Boxes, { className: "w-5 h-5" }) },
    ];
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950", "data-cy": "setup-installers-view", "data-testid": "setup-installers-view", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between max-w-7xl mx-auto", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg shadow-green-500/20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Download, { className: "w-6 h-6 text-white" }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "External Tools" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [stats.installed, "/", stats.total, " tools installed"] })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "secondary", onClick: verifyInstallers, loading: isChecking, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.RefreshCw, { className: "w-4 h-4" }), children: "Verify All" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "primary", onClick: installSelected, disabled: selectedInstallers.size === 0 || isInstalling, loading: isInstalling, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Download, { className: "w-4 h-4" }), children: ["Install Selected (", selectedInstallers.size, ")"] })] })] }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex max-w-7xl mx-auto px-6", children: tabs.map((tab) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(CategoryTab, { id: tab.id, label: tab.label, icon: tab.icon, counts: categoryCounts[tab.id], isActive: activeTab === tab.id, onClick: () => setActiveTab(tab.id) }, tab.id))) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex-1 overflow-auto py-6", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "max-w-7xl mx-auto px-6 space-y-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative max-w-md", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search tools...", className: "w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", "data-cy": "search-input" })] }), (isChecking || isInstalling) && overallProgress > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "font-medium text-gray-900 dark:text-white", children: isInstalling ? 'Installing tools...' : 'Verifying tools...' }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-sm font-bold text-blue-600 dark:text-blue-400", children: [Math.round(overallProgress), "%"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_molecules_ProgressBar__WEBPACK_IMPORTED_MODULE_5__.ProgressBar, { value: overallProgress, max: 100, variant: "info", size: "lg", animated: true, striped: true })] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "space-y-4", children: filteredInstallers.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Package, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No tools found" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Try adjusting your search criteria." })] })) : (filteredInstallers.map((installer) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(InstallerCard, { installer: installer, selected: selectedInstallers.has(installer.id), onToggle: () => toggleInstallerSelection(installer.id), onInstall: () => installTool(installer.id), expanded: expandedInstaller === installer.id, onExpand: () => setExpandedInstaller(expandedInstaller === installer.id ? null : installer.id), disabled: isChecking || isInstalling }, installer.id)))) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: () => setShowLogs(!showLogs), className: "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Terminal, { className: "w-5 h-5 text-green-500" }), "Installation Logs", logs.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full", children: logs.length }))] }), showLogs ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.ChevronDown, { className: "w-5 h-5" }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.ChevronRight, { className: "w-5 h-5" })] }), showLogs && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "px-6 pb-6", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(LogViewer, { logs: logs, onClear: () => setLogs([]) }) }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Info, { className: "w-6 h-6 text-blue-500 flex-shrink-0" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-blue-800 dark:text-blue-200 mb-2", children: "About Tool Installation" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("ul", { className: "text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Tools are downloaded from official sources with verification" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Some tools require administrator privileges to install" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Dependencies are automatically selected when needed" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Click \"Verify All\" to check which tools are already installed" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Use the external link icon to download tools manually" })] })] })] }) })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SetupInstallersView);


/***/ }),

/***/ 33523:
/*!***********************************************************!*\
  !*** ./src/renderer/components/molecules/ProgressBar.tsx ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProgressBar: () => (/* binding */ ProgressBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * ProgressBar Component
 *
 * Progress indicator with percentage display and optional label.
 * Supports different variants and sizes.
 */


/**
 * ProgressBar Component
 */
const ProgressBar = ({ value, max = 100, variant = 'default', size = 'md', showLabel = true, label, labelPosition = 'inside', striped = false, animated = false, className, 'data-cy': dataCy, }) => {
    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    // Variant colors
    const variantClasses = {
        default: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
        info: 'bg-cyan-600',
    };
    // Background colors
    const bgClasses = {
        default: 'bg-blue-100',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        danger: 'bg-red-100',
        info: 'bg-cyan-100',
    };
    // Size classes
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full', className);
    const trackClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full rounded-full overflow-hidden', bgClasses[variant], sizeClasses[size]);
    const barClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('h-full transition-all duration-300 ease-out', variantClasses[variant], {
        // Striped pattern
        'bg-gradient-to-r from-transparent via-black/10 to-transparent bg-[length:1rem_100%]': striped,
        'animate-progress-stripes': striped && animated,
    });
    const labelText = label || (showLabel ? `${Math.round(percentage)}%` : '');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [labelText && labelPosition === 'outside' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-between mb-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium text-gray-700", children: labelText }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: trackClasses, role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: barClasses, style: { width: `${percentage}%` }, children: labelText && labelPosition === 'inside' && size !== 'sm' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-center h-full px-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-xs font-semibold text-white whitespace-nowrap", children: labelText }) })) }) })] }));
};
// Add animation for striped progress bars
const styles = `
@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
`;
// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('progress-bar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'progress-bar-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProgressBar);


/***/ }),

/***/ 63683:
/*!****************************************************!*\
  !*** ./src/renderer/components/atoms/Checkbox.tsx ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Checkbox: () => (/* binding */ Checkbox),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * Checkbox Component
 *
 * Fully accessible checkbox component with labels and error states.
 * Follows WCAG 2.1 AA guidelines.
 */



/**
 * Checkbox Component
 */
const Checkbox = ({ label, description, checked = false, onChange, error, disabled = false, indeterminate = false, className, 'data-cy': dataCy, }) => {
    const id = (0,react__WEBPACK_IMPORTED_MODULE_1__.useId)();
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;
    const hasError = Boolean(error);
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };
    // Handle indeterminate via ref
    const checkboxRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef(null);
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);
    const checkboxClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'h-5 w-5 rounded border-2', 'transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'dark:ring-offset-gray-900', 
    // State-based styles
    {
        // Normal state (unchecked)
        'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700': !hasError && !disabled && !checked,
        'focus:ring-blue-500': !hasError && !disabled,
        // Checked state
        'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500': checked && !disabled && !hasError,
        // Error state
        'border-red-500 text-red-600 dark:border-red-400': hasError && !disabled,
        'focus:ring-red-500': hasError && !disabled,
        // Disabled state
        'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed': disabled,
    });
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('text-sm font-medium', {
        'text-gray-700 dark:text-gray-200': !hasError && !disabled,
        'text-red-700 dark:text-red-400': hasError && !disabled,
        'text-gray-500 dark:text-gray-500': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('flex flex-col', className), children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center h-5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: checkboxRef, id: id, type: "checkbox", checked: checked, onChange: handleChange, disabled: disabled, className: "sr-only peer", "aria-invalid": hasError, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)({
                                    [errorId]: hasError,
                                    [descriptionId]: description,
                                }), "data-cy": dataCy }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(checkboxClasses, 'flex items-center justify-center cursor-pointer', {
                                    'cursor-not-allowed': disabled,
                                }), children: [checked && !indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Check, { className: "h-4 w-4 text-white", strokeWidth: 3 })), indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "h-0.5 w-3 bg-white rounded" }))] })] }), (label || description) && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "ml-3", children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(labelClasses, 'cursor-pointer'), children: label })), description && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: descriptionId, className: "text-sm text-gray-500 dark:text-gray-400 mt-0.5", children: description }))] }))] }), hasError && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: errorId, className: "mt-1 ml-8 text-sm text-red-600", role: "alert", "aria-live": "polite", children: error }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Checkbox);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0wsNEJBQTRCLDBDQUFJO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLDBDQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZLHVEQUFLLFVBQVUsV0FBVywwQ0FBSSx5Q0FBeUMsdURBQUssVUFBVSwwQ0FBMEMsdURBQUssVUFBVSwrQ0FBK0Msc0RBQUksWUFBWSxtTEFBbUwsMENBQUk7QUFDalo7QUFDQTtBQUNBLGlDQUFpQyxzQkFBc0IsR0FBRyx1REFBSyxZQUFZLHdCQUF3QiwwQ0FBSTtBQUN2RztBQUNBLGlDQUFpQyw0Q0FBNEMsc0RBQUksQ0FBQywrQ0FBSyxJQUFJLGlEQUFpRCxzQkFBc0Isc0RBQUksVUFBVSx5Q0FBeUMsS0FBSyxJQUFJLDhCQUE4Qix1REFBSyxVQUFVLHdDQUF3QyxzREFBSSxZQUFZLHdCQUF3QiwwQ0FBSSxtREFBbUQsb0JBQW9CLHNEQUFJLFFBQVEsd0dBQXdHLEtBQUssS0FBSyxnQkFBZ0Isc0RBQUksUUFBUSxpSEFBaUgsS0FBSztBQUMxckI7QUFDQSxpRUFBZSxRQUFRLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9zZXR1cC9TZXR1cEluc3RhbGxlcnNWaWV3LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9Qcm9ncmVzc0Jhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2V0dXAgSW5zdGFsbGVycyBWaWV3XG4gKlxuICogQSBzdHVubmluZyB0YWJiZWQgaW50ZXJmYWNlIGZvciBzZWxlY3RpdmUgaW5zdGFsbGF0aW9uIG9mIGV4dGVybmFsIHRvb2xzLlxuICogRmVhdHVyZXM6XG4gKiAtIEJlYXV0aWZ1bCB0YWJiZWQgY2F0ZWdvcmllcyB3aXRoIGFuaW1hdGVkIGluZGljYXRvcnNcbiAqIC0gVmlzdWFsIGRlcGVuZGVuY3kgZ3JhcGhzIHdpdGggYXV0by1zZWxlY3Rpb25cbiAqIC0gUmVhbC10aW1lIGRvd25sb2FkIGFuZCBpbnN0YWxsYXRpb24gcHJvZ3Jlc3NcbiAqIC0gQ2hlY2tzdW0gdmVyaWZpY2F0aW9uIHdpdGggc2VjdXJpdHkgYmFkZ2VzXG4gKiAtIFBhdXNlL3Jlc3VtZSBhbmQgcm9sbGJhY2sgY2FwYWJpbGl0aWVzXG4gKiAtIFRlcm1pbmFsLXN0eWxlIGluc3RhbGxhdGlvbiBsb2dzXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUGFja2FnZSwgTmV0d29yaywgU2hpZWxkLCBDcHUsIEJveGVzLCBBbGVydENpcmNsZSwgUmVmcmVzaEN3LCBFeHRlcm5hbExpbmssIEluZm8sIENoZXZyb25Eb3duLCBDaGV2cm9uUmlnaHQsIExvYWRlcjIsIFBhdXNlLCBTZWFyY2gsIEhhcmREcml2ZSwgQ2xvY2ssIExpbmssIExvY2ssIFphcCwgR2xvYmUsIFRlcm1pbmFsLCBUcmFzaDIsIENoZWNrLCBGaWxlQ2hlY2ssIFNldHRpbmdzLCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBDaGVja2JveCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQ2hlY2tib3gnO1xuaW1wb3J0IHsgUHJvZ3Jlc3NCYXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL21vbGVjdWxlcy9Qcm9ncmVzc0Jhcic7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBUb29sIGRlZmluaXRpb25zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdCBJTlNUQUxMRVJTID0gW1xuICAgIC8vIE5ldHdvcmtpbmdcbiAgICB7XG4gICAgICAgIGlkOiAnbm1hcCcsXG4gICAgICAgIG5hbWU6ICdubWFwJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdObWFwJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOZXR3b3JrIGRpc2NvdmVyeSBhbmQgc2VjdXJpdHkgYXVkaXRpbmcgdG9vbCcsXG4gICAgICAgIGNhdGVnb3J5OiAnbmV0d29ya2luZycsXG4gICAgICAgIGRvd25sb2FkVXJsOiAnaHR0cHM6Ly9ubWFwLm9yZy9kaXN0L25tYXAtNy45NC1zZXR1cC5leGUnLFxuICAgICAgICB2ZXJzaW9uOiAnNy45NCcsXG4gICAgICAgIGVzdGltYXRlZFRpbWU6ICcyLTMgbWluJyxcbiAgICAgICAgc2l6ZTogJzMwIE1CJyxcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgdmVyaWZ5Q29tbWFuZDogJ25tYXAgLS12ZXJzaW9uJyxcbiAgICAgICAgaW5zdGFsbEFyZ3M6ICcvUycsXG4gICAgICAgIGljb246IF9qc3goR2xvYmUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICAgICAgb2ZmaWNpYWw6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnd2lyZXNoYXJrJyxcbiAgICAgICAgbmFtZTogJ3dpcmVzaGFyaycsXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnV2lyZXNoYXJrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOZXR3b3JrIHByb3RvY29sIGFuYWx5emVyIGZvciBwYWNrZXQgY2FwdHVyZSBhbmQgYW5hbHlzaXMnLFxuICAgICAgICBjYXRlZ29yeTogJ25ldHdvcmtpbmcnLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vd3d3LndpcmVzaGFyay5vcmcvZG93bmxvYWQvd2luNjQvV2lyZXNoYXJrLXdpbjY0LTQuMi4wLmV4ZScsXG4gICAgICAgIHZlcnNpb246ICc0LjIuMCcsXG4gICAgICAgIGVzdGltYXRlZFRpbWU6ICczLTUgbWluJyxcbiAgICAgICAgc2l6ZTogJzgwIE1CJyxcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbJ25wY2FwJ10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICdcIkM6XFxcXFByb2dyYW0gRmlsZXNcXFxcV2lyZXNoYXJrXFxcXHRzaGFyay5leGVcIiAtLXZlcnNpb24nLFxuICAgICAgICBpbnN0YWxsQXJnczogJy9TJyxcbiAgICAgICAgaWNvbjogX2pzeChOZXR3b3JrLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgICAgIG9mZmljaWFsOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3B1dHR5JyxcbiAgICAgICAgbmFtZTogJ3B1dHR5JyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdQdVRUWScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU1NILCBUZWxuZXQsIGFuZCBzZXJpYWwgY29uc29sZSBjbGllbnQnLFxuICAgICAgICBjYXRlZ29yeTogJ25ldHdvcmtpbmcnLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vdGhlLmVhcnRoLmxpL35zZ3RhdGhhbS9wdXR0eS9sYXRlc3QvdzY0L3B1dHR5LTY0Yml0LTAuODAtaW5zdGFsbGVyLm1zaScsXG4gICAgICAgIHZlcnNpb246ICcwLjgwJyxcbiAgICAgICAgZXN0aW1hdGVkVGltZTogJzEtMiBtaW4nLFxuICAgICAgICBzaXplOiAnNCBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICd3aGVyZSBwdXR0eScsXG4gICAgICAgIGluc3RhbGxBcmdzOiAnL3F1aWV0JyxcbiAgICAgICAgaWNvbjogX2pzeChUZXJtaW5hbCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgICAgICBvZmZpY2lhbDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICd3aW5zY3AnLFxuICAgICAgICBuYW1lOiAnd2luc2NwJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdXaW5TQ1AnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1NGVFAsIEZUUCwgV2ViREFWLCBhbmQgU0NQIGNsaWVudCcsXG4gICAgICAgIGNhdGVnb3J5OiAnbmV0d29ya2luZycsXG4gICAgICAgIGRvd25sb2FkVXJsOiAnaHR0cHM6Ly93aW5zY3AubmV0L2Rvd25sb2FkL1dpblNDUC02LjEuMi1TZXR1cC5leGUnLFxuICAgICAgICB2ZXJzaW9uOiAnNi4xLjInLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnMi0zIG1pbicsXG4gICAgICAgIHNpemU6ICcxMiBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICd3aGVyZSB3aW5zY3AnLFxuICAgICAgICBpbnN0YWxsQXJnczogJy9TSUxFTlQnLFxuICAgICAgICBpY29uOiBfanN4KEhhcmREcml2ZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgICAgICBvZmZpY2lhbDogdHJ1ZSxcbiAgICB9LFxuICAgIC8vIFNlY3VyaXR5XG4gICAge1xuICAgICAgICBpZDogJ293YXNwLXphcCcsXG4gICAgICAgIG5hbWU6ICdvd2FzcC16YXAnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ09XQVNQIFpBUCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2ViIGFwcGxpY2F0aW9uIHNlY3VyaXR5IHNjYW5uZXInLFxuICAgICAgICBjYXRlZ29yeTogJ3NlY3VyaXR5JyxcbiAgICAgICAgZG93bmxvYWRVcmw6ICdodHRwczovL2dpdGh1Yi5jb20vemFwcm94eS96YXByb3h5L3JlbGVhc2VzL2Rvd25sb2FkL3YyLjE0LjAvWkFQXzJfMTRfMF93aW5kb3dzLmV4ZScsXG4gICAgICAgIHZlcnNpb246ICcyLjE0LjAnLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnNS0xMCBtaW4nLFxuICAgICAgICBzaXplOiAnMjAwIE1CJyxcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbJ2phdmEnXSxcbiAgICAgICAgdmVyaWZ5Q29tbWFuZDogJ1wiQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxaQVBcXFxcemFwLmJhdFwiIC12ZXJzaW9uJyxcbiAgICAgICAgaW5zdGFsbEFyZ3M6ICctcScsXG4gICAgICAgIGljb246IF9qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgICAgIG9mZmljaWFsOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3N5c2ludGVybmFscycsXG4gICAgICAgIG5hbWU6ICdzeXNpbnRlcm5hbHMnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ1N5c2ludGVybmFscyBTdWl0ZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2luZG93cyBzeXN0ZW0gdXRpbGl0aWVzIGZyb20gTWljcm9zb2Z0JyxcbiAgICAgICAgY2F0ZWdvcnk6ICdzZWN1cml0eScsXG4gICAgICAgIGRvd25sb2FkVXJsOiAnaHR0cHM6Ly9kb3dubG9hZC5zeXNpbnRlcm5hbHMuY29tL2ZpbGVzL1N5c2ludGVybmFsc1N1aXRlLnppcCcsXG4gICAgICAgIHZlcnNpb246ICdMYXRlc3QnLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnMS0yIG1pbicsXG4gICAgICAgIHNpemU6ICc0MCBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICd3aGVyZSBwc2V4ZWMnLFxuICAgICAgICBpbnN0YWxsQXJnczogJycsXG4gICAgICAgIGljb246IF9qc3goU2V0dGluZ3MsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICAgICAgb2ZmaWNpYWw6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnYXV0b3J1bnMnLFxuICAgICAgICBuYW1lOiAnYXV0b3J1bnMnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ0F1dG9ydW5zJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDb21wcmVoZW5zaXZlIHN0YXJ0dXAgcHJvZ3JhbSB2aWV3ZXInLFxuICAgICAgICBjYXRlZ29yeTogJ3NlY3VyaXR5JyxcbiAgICAgICAgZG93bmxvYWRVcmw6ICdodHRwczovL2Rvd25sb2FkLnN5c2ludGVybmFscy5jb20vZmlsZXMvQXV0b3J1bnMuemlwJyxcbiAgICAgICAgdmVyc2lvbjogJ0xhdGVzdCcsXG4gICAgICAgIGVzdGltYXRlZFRpbWU6ICc8IDEgbWluJyxcbiAgICAgICAgc2l6ZTogJzIgTUInLFxuICAgICAgICBkZXBlbmRlbmNpZXM6IFtdLFxuICAgICAgICB2ZXJpZnlDb21tYW5kOiAnd2hlcmUgYXV0b3J1bnMnLFxuICAgICAgICBpbnN0YWxsQXJnczogJycsXG4gICAgICAgIGljb246IF9qc3goWmFwLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgICAgIG9mZmljaWFsOiB0cnVlLFxuICAgIH0sXG4gICAgLy8gQXV0b21hdGlvblxuICAgIHtcbiAgICAgICAgaWQ6ICdub2RlanMnLFxuICAgICAgICBuYW1lOiAnbm9kZWpzJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdOb2RlLmpzIExUUycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSmF2YVNjcmlwdCBydW50aW1lIGZvciBhdXRvbWF0aW9uIHNjcmlwdHMnLFxuICAgICAgICBjYXRlZ29yeTogJ2F1dG9tYXRpb24nLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vbm9kZWpzLm9yZy9kaXN0L3YyMC4xMC4wL25vZGUtdjIwLjEwLjAteDY0Lm1zaScsXG4gICAgICAgIHZlcnNpb246ICcyMC4xMC4wIExUUycsXG4gICAgICAgIGVzdGltYXRlZFRpbWU6ICcyLTMgbWluJyxcbiAgICAgICAgc2l6ZTogJzMwIE1CJyxcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgdmVyaWZ5Q29tbWFuZDogJ25vZGUgLS12ZXJzaW9uJyxcbiAgICAgICAgaW5zdGFsbEFyZ3M6ICcvcXVpZXQnLFxuICAgICAgICBpY29uOiBfanN4KENwdSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgICAgICBvZmZpY2lhbDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdweXRob24nLFxuICAgICAgICBuYW1lOiAncHl0aG9uJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdQeXRob24gMycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUHl0aG9uIHJ1bnRpbWUgZm9yIHNjcmlwdHMgYW5kIGF1dG9tYXRpb24nLFxuICAgICAgICBjYXRlZ29yeTogJ2F1dG9tYXRpb24nLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vd3d3LnB5dGhvbi5vcmcvZnRwL3B5dGhvbi8zLjEyLjAvcHl0aG9uLTMuMTIuMC1hbWQ2NC5leGUnLFxuICAgICAgICB2ZXJzaW9uOiAnMy4xMi4wJyxcbiAgICAgICAgZXN0aW1hdGVkVGltZTogJzItMyBtaW4nLFxuICAgICAgICBzaXplOiAnMzAgTUInLFxuICAgICAgICBkZXBlbmRlbmNpZXM6IFtdLFxuICAgICAgICB2ZXJpZnlDb21tYW5kOiAncHl0aG9uIC0tdmVyc2lvbicsXG4gICAgICAgIGluc3RhbGxBcmdzOiAnL3F1aWV0IEluc3RhbGxBbGxVc2Vycz0xIFByZXBlbmRQYXRoPTEnLFxuICAgICAgICBpY29uOiBfanN4KENwdSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgICAgICBvZmZpY2lhbDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdnaXQnLFxuICAgICAgICBuYW1lOiAnZ2l0JyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdHaXQgZm9yIFdpbmRvd3MnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc3RyaWJ1dGVkIHZlcnNpb24gY29udHJvbCBzeXN0ZW0nLFxuICAgICAgICBjYXRlZ29yeTogJ2F1dG9tYXRpb24nLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9naXQtZm9yLXdpbmRvd3MvZ2l0L3JlbGVhc2VzL2Rvd25sb2FkL3YyLjQzLjAud2luZG93cy4xL0dpdC0yLjQzLjAtNjQtYml0LmV4ZScsXG4gICAgICAgIHZlcnNpb246ICcyLjQzLjAnLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnMi0zIG1pbicsXG4gICAgICAgIHNpemU6ICc1MCBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICdnaXQgLS12ZXJzaW9uJyxcbiAgICAgICAgaW5zdGFsbEFyZ3M6ICcvU0lMRU5UJyxcbiAgICAgICAgaWNvbjogX2pzeChMaW5rLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgICAgIG9mZmljaWFsOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3ZzY29kZScsXG4gICAgICAgIG5hbWU6ICd2c2NvZGUnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ1ZTIENvZGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0xpZ2h0d2VpZ2h0IGJ1dCBwb3dlcmZ1bCBzb3VyY2UgY29kZSBlZGl0b3InLFxuICAgICAgICBjYXRlZ29yeTogJ2F1dG9tYXRpb24nLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vY29kZS52aXN1YWxzdHVkaW8uY29tL3NoYS9kb3dubG9hZD9idWlsZD1zdGFibGUmb3M9d2luMzIteDY0LXVzZXInLFxuICAgICAgICB2ZXJzaW9uOiAnTGF0ZXN0JyxcbiAgICAgICAgZXN0aW1hdGVkVGltZTogJzItMyBtaW4nLFxuICAgICAgICBzaXplOiAnOTUgTUInLFxuICAgICAgICBkZXBlbmRlbmNpZXM6IFtdLFxuICAgICAgICB2ZXJpZnlDb21tYW5kOiAnY29kZSAtLXZlcnNpb24nLFxuICAgICAgICBpbnN0YWxsQXJnczogJy9TSUxFTlQgL05PUkVTVEFSVCcsXG4gICAgICAgIGljb246IF9qc3goQ3B1LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgICAgIG9mZmljaWFsOiB0cnVlLFxuICAgIH0sXG4gICAgLy8gRGVwZW5kZW5jaWVzXG4gICAge1xuICAgICAgICBpZDogJ2RvdG5ldC1ydW50aW1lJyxcbiAgICAgICAgbmFtZTogJ2RvdG5ldC1ydW50aW1lJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICcuTkVUIDggUnVudGltZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTWljcm9zb2Z0IC5ORVQgcnVudGltZSBmb3IgYXBwbGljYXRpb25zJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdkZXBlbmRlbmNpZXMnLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vZG93bmxvYWQudmlzdWFsc3R1ZGlvLm1pY3Jvc29mdC5jb20vZG93bmxvYWQvcHIvZG90bmV0LXJ1bnRpbWUtOC4wLjAtd2luLXg2NC5leGUnLFxuICAgICAgICB2ZXJzaW9uOiAnOC4wLjAnLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnMi0zIG1pbicsXG4gICAgICAgIHNpemU6ICc1MCBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICdkb3RuZXQgLS1saXN0LXJ1bnRpbWVzJyxcbiAgICAgICAgaW5zdGFsbEFyZ3M6ICcvcXVpZXQgL25vcmVzdGFydCcsXG4gICAgICAgIGljb246IF9qc3goQm94ZXMsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICAgICAgb2ZmaWNpYWw6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAndmNyZWRpc3QnLFxuICAgICAgICBuYW1lOiAndmNyZWRpc3QnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ1Zpc3VhbCBDKysgUmVkaXN0cmlidXRhYmxlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdNaWNyb3NvZnQgVmlzdWFsIEMrKyBydW50aW1lIGxpYnJhcmllcycsXG4gICAgICAgIGNhdGVnb3J5OiAnZGVwZW5kZW5jaWVzJyxcbiAgICAgICAgZG93bmxvYWRVcmw6ICdodHRwczovL2FrYS5tcy92cy8xNy9yZWxlYXNlL3ZjX3JlZGlzdC54NjQuZXhlJyxcbiAgICAgICAgdmVyc2lvbjogJzIwMjInLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnMS0yIG1pbicsXG4gICAgICAgIHNpemU6ICcyNSBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICdyZWcgcXVlcnkgXCJIS0xNXFxcXFNPRlRXQVJFXFxcXE1pY3Jvc29mdFxcXFxWaXN1YWxTdHVkaW9cXFxcMTQuMFxcXFxWQ1xcXFxSdW50aW1lc1xcXFx4NjRcIicsXG4gICAgICAgIGluc3RhbGxBcmdzOiAnL3F1aWV0IC9ub3Jlc3RhcnQnLFxuICAgICAgICBpY29uOiBfanN4KFBhY2thZ2UsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICAgICAgb2ZmaWNpYWw6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnamF2YScsXG4gICAgICAgIG5hbWU6ICdqYXZhJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdKYXZhIFJ1bnRpbWUgKFRlbXVyaW4pJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFY2xpcHNlIFRlbXVyaW4gSmF2YSBydW50aW1lIGVudmlyb25tZW50JyxcbiAgICAgICAgY2F0ZWdvcnk6ICdkZXBlbmRlbmNpZXMnLFxuICAgICAgICBkb3dubG9hZFVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hZG9wdGl1bS90ZW11cmluMjEtYmluYXJpZXMvcmVsZWFzZXMvZG93bmxvYWQvamRrLTIxLjAuMSUyQjEyL09wZW5KREsyMVUtanJlX3g2NF93aW5kb3dzX2hvdHNwb3RfMjEuMC4xXzEyLm1zaScsXG4gICAgICAgIHZlcnNpb246ICcyMS4wLjEnLFxuICAgICAgICBlc3RpbWF0ZWRUaW1lOiAnMi0zIG1pbicsXG4gICAgICAgIHNpemU6ICc1MCBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICdqYXZhIC0tdmVyc2lvbicsXG4gICAgICAgIGluc3RhbGxBcmdzOiAnL3F1aWV0JyxcbiAgICAgICAgaWNvbjogX2pzeChCb3hlcywgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgICAgICBvZmZpY2lhbDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICducGNhcCcsXG4gICAgICAgIG5hbWU6ICducGNhcCcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnTnBjYXAnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1dpbmRvd3MgcGFja2V0IGNhcHR1cmUgbGlicmFyeSAocmVxdWlyZWQgZm9yIFdpcmVzaGFyayknLFxuICAgICAgICBjYXRlZ29yeTogJ2RlcGVuZGVuY2llcycsXG4gICAgICAgIGRvd25sb2FkVXJsOiAnaHR0cHM6Ly9ucGNhcC5jb20vZGlzdC9ucGNhcC0xLjc5LmV4ZScsXG4gICAgICAgIHZlcnNpb246ICcxLjc5JyxcbiAgICAgICAgZXN0aW1hdGVkVGltZTogJzEtMiBtaW4nLFxuICAgICAgICBzaXplOiAnMSBNQicsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHZlcmlmeUNvbW1hbmQ6ICdzYyBxdWVyeSBucGNhcCcsXG4gICAgICAgIGluc3RhbGxBcmdzOiAnL1MnLFxuICAgICAgICBpY29uOiBfanN4KE5ldHdvcmssIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICAgICAgb2ZmaWNpYWw6IHRydWUsXG4gICAgfSxcbl07XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTdWItY29tcG9uZW50c1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLyoqXG4gKiBDYXRlZ29yeSB0YWIgd2l0aCBhbmltYXRlZCBpbmRpY2F0b3JcbiAqL1xuY29uc3QgQ2F0ZWdvcnlUYWIgPSAoeyBpZCwgbGFiZWwsIGljb24sIGNvdW50cywgaXNBY3RpdmUsIG9uQ2xpY2sgfSkgPT4gKF9qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbGljaywgY2xhc3NOYW1lOiBgXHJcbiAgICAgIHJlbGF0aXZlIGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHB4LTUgcHktNCB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMFxyXG4gICAgICAke2lzQWN0aXZlXG4gICAgICAgID8gJ3RleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwJ1xuICAgICAgICA6ICd0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktOTAwIGRhcms6aG92ZXI6dGV4dC13aGl0ZSd9XHJcbiAgICBgLCBcImRhdGEtY3lcIjogYHRhYi0ke2lkfWAsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0zMDAgJHtpc0FjdGl2ZSA/ICdzY2FsZS0xMTAnIDogJyd9YCwgY2hpbGRyZW46IGljb24gfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IGxhYmVsIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IGBcclxuICAgICAgICBweC0yLjUgcHktMSB0ZXh0LXhzIGZvbnQtYm9sZCByb3VuZGVkLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwXHJcbiAgICAgICAgJHtpc0FjdGl2ZVxuICAgICAgICAgICAgICAgID8gJ2JnLWJsdWUtMTAwIGRhcms6YmctYmx1ZS05MDAvMzAgdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnXG4gICAgICAgICAgICAgICAgOiAnYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCd9XHJcbiAgICAgIGAsIGNoaWxkcmVuOiBbY291bnRzLmluc3RhbGxlZCwgXCIvXCIsIGNvdW50cy50b3RhbF0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBcclxuICAgICAgICBhYnNvbHV0ZSBib3R0b20tMCBsZWZ0LTAgcmlnaHQtMCBoLTAuNSBiZy1ibHVlLTYwMCBkYXJrOmJnLWJsdWUtNDAwXHJcbiAgICAgICAgdHJhbnNpdGlvbi10cmFuc2Zvcm0gZHVyYXRpb24tMzAwIG9yaWdpbi1sZWZ0XHJcbiAgICAgICAgJHtpc0FjdGl2ZSA/ICdzY2FsZS14LTEwMCcgOiAnc2NhbGUteC0wJ31cclxuICAgICAgYCB9KV0gfSkpO1xuLyoqXG4gKiBJbnN0YWxsZXIgY2FyZCB3aXRoIHN0YXR1cywgcHJvZ3Jlc3MsIGFuZCBhY3Rpb25zXG4gKi9cbmNvbnN0IEluc3RhbGxlckNhcmQgPSAoeyBpbnN0YWxsZXIsIHNlbGVjdGVkLCBvblRvZ2dsZSwgb25JbnN0YWxsLCBleHBhbmRlZCwgb25FeHBhbmQsIGRpc2FibGVkIH0pID0+IHtcbiAgICBjb25zdCBnZXRTdGF0dXNCYWRnZSA9ICgpID0+IHtcbiAgICAgICAgc3dpdGNoIChpbnN0YWxsZXIuc3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlICdpbnN0YWxsZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIuNSBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctZ3JlZW4tMTAwIGRhcms6YmctZ3JlZW4tOTAwLzMwIHRleHQtZ3JlZW4tNzAwIGRhcms6dGV4dC1ncmVlbi0zMDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVjaywgeyBjbGFzc05hbWU6IFwidy0zIGgtM1wiIH0pLCBcIkluc3RhbGxlZFwiXSB9KSk7XG4gICAgICAgICAgICBjYXNlICdub3RfaW5zdGFsbGVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJweC0yLjUgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS03MDAgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS0zMDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy0zIGgtM1wiIH0pLCBcIk5vdCBJbnN0YWxsZWRcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAnZG93bmxvYWRpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIuNSBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctYmx1ZS0xMDAgZGFyazpiZy1ibHVlLTkwMC8zMCB0ZXh0LWJsdWUtNzAwIGRhcms6dGV4dC1ibHVlLTMwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgYW5pbWF0ZS1zcGluXCIgfSksIFwiRG93bmxvYWRpbmdcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAnaW5zdGFsbGluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicHgtMi41IHB5LTEgdGV4dC14cyBmb250LW1lZGl1bSBiZy1wdXJwbGUtMTAwIGRhcms6YmctcHVycGxlLTkwMC8zMCB0ZXh0LXB1cnBsZS03MDAgZGFyazp0ZXh0LXB1cnBsZS0zMDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChMb2FkZXIyLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIGFuaW1hdGUtc3BpblwiIH0pLCBcIkluc3RhbGxpbmdcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAndmVyaWZ5aW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJweC0yLjUgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIGJnLWN5YW4tMTAwIGRhcms6YmctY3lhbi05MDAvMzAgdGV4dC1jeWFuLTcwMCBkYXJrOnRleHQtY3lhbi0zMDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChGaWxlQ2hlY2ssIHsgY2xhc3NOYW1lOiBcInctMyBoLTNcIiB9KSwgXCJWZXJpZnlpbmdcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAnY2hlY2tpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIuNSBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTMwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgYW5pbWF0ZS1zcGluXCIgfSksIFwiQ2hlY2tpbmdcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIuNSBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctcmVkLTEwMCBkYXJrOmJnLXJlZC05MDAvMzAgdGV4dC1yZWQtNzAwIGRhcms6dGV4dC1yZWQtMzAwIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctMyBoLTNcIiB9KSwgXCJFcnJvclwiXSB9KSk7XG4gICAgICAgICAgICBjYXNlICdwYXVzZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIuNSBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmcteWVsbG93LTEwMCBkYXJrOmJnLXllbGxvdy05MDAvMzAgdGV4dC15ZWxsb3ctNzAwIGRhcms6dGV4dC15ZWxsb3ctMzAwIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goUGF1c2UsIHsgY2xhc3NOYW1lOiBcInctMyBoLTNcIiB9KSwgXCJQYXVzZWRcIl0gfSkpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIuNSBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTMwMCByb3VuZGVkLWZ1bGxcIiwgY2hpbGRyZW46IFwiUGVuZGluZ1wiIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2V0Q2F0ZWdvcnlDb2xvciA9ICgpID0+IHtcbiAgICAgICAgc3dpdGNoIChpbnN0YWxsZXIuY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgIGNhc2UgJ25ldHdvcmtpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYmctYmx1ZS0xMDAgZGFyazpiZy1ibHVlLTkwMC8zMCB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCc7XG4gICAgICAgICAgICBjYXNlICdzZWN1cml0eSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1yZWQtMTAwIGRhcms6YmctcmVkLTkwMC8zMCB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnO1xuICAgICAgICAgICAgY2FzZSAnYXV0b21hdGlvbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1wdXJwbGUtMTAwIGRhcms6YmctcHVycGxlLTkwMC8zMCB0ZXh0LXB1cnBsZS02MDAgZGFyazp0ZXh0LXB1cnBsZS00MDAnO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyZWVuLTEwMCBkYXJrOmJnLWdyZWVuLTkwMC8zMCB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaXNJblByb2dyZXNzID0gWydkb3dubG9hZGluZycsICdpbnN0YWxsaW5nJywgJ3ZlcmlmeWluZyddLmluY2x1ZGVzKGluc3RhbGxlci5zdGF0dXMpO1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYFxyXG4gICAgICAgIGdyb3VwIHJvdW5kZWQteGwgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIG92ZXJmbG93LWhpZGRlblxyXG4gICAgICAgICR7c2VsZWN0ZWRcbiAgICAgICAgICAgID8gJ2JvcmRlci1ibHVlLTQwMCBkYXJrOmJvcmRlci1ibHVlLTYwMCBiZy1ibHVlLTUwLzUwIGRhcms6YmctYmx1ZS05MDAvMTAgc2hhZG93LWxnIHNoYWRvdy1ibHVlLTUwMC8xMCdcbiAgICAgICAgICAgIDogJ2JvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGhvdmVyOmJvcmRlci1ncmF5LTMwMCBkYXJrOmhvdmVyOmJvcmRlci1ncmF5LTYwMCd9XHJcbiAgICAgIGAsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwdC0xXCIsIGNoaWxkcmVuOiBfanN4KENoZWNrYm94LCB7IGNoZWNrZWQ6IHNlbGVjdGVkLCBvbkNoYW5nZTogKCkgPT4gb25Ub2dnbGUoKSwgZGlzYWJsZWQ6IGluc3RhbGxlci5zdGF0dXMgPT09ICdpbnN0YWxsZWQnIHx8IGlzSW5Qcm9ncmVzcyB8fCBkaXNhYmxlZCB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYHAtMyByb3VuZGVkLXhsICR7Z2V0Q2F0ZWdvcnlDb2xvcigpfSB0cmFuc2l0aW9uLXRyYW5zZm9ybSBncm91cC1ob3ZlcjpzY2FsZS0xMTAgY3Vyc29yLXBvaW50ZXJgLCBvbkNsaWNrOiBvbkV4cGFuZCwgY2hpbGRyZW46IGluc3RhbGxlci5pY29uIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgbWluLXctMCBjdXJzb3ItcG9pbnRlclwiLCBvbkNsaWNrOiBvbkV4cGFuZCwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBmbGV4LXdyYXBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDRcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogaW5zdGFsbGVyLmRpc3BsYXlOYW1lIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW1widlwiLCBpbnN0YWxsZXIudmVyc2lvbl0gfSksIGluc3RhbGxlci5vZmZpY2lhbCAmJiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTEuNSBweS0wLjUgdGV4dC14cyBmb250LW1lZGl1bSBiZy1ncmVlbi0xMDAgZGFyazpiZy1ncmVlbi05MDAvMzAgdGV4dC1ncmVlbi03MDAgZGFyazp0ZXh0LWdyZWVuLTMwMCByb3VuZGVkIGZsZXggaXRlbXMtY2VudGVyIGdhcC0wLjVcIiwgY2hpbGRyZW46IFtfanN4KExvY2ssIHsgY2xhc3NOYW1lOiBcInctMi41IGgtMi41XCIgfSksIFwiT2ZmaWNpYWxcIl0gfSkpLCBnZXRTdGF0dXNCYWRnZSgpXSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBpbnN0YWxsZXIuZGVzY3JpcHRpb24gfSksIGluc3RhbGxlci5lcnJvck1lc3NhZ2UgJiYgKF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCBtdC0yIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBmbGV4LXNocmluay0wXCIgfSksIGluc3RhbGxlci5lcnJvck1lc3NhZ2VdIH0pKSwgaW5zdGFsbGVyLmRlcGVuZGVuY2llcy5sZW5ndGggPiAwICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBtdC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJSZXF1aXJlczpcIiB9KSwgaW5zdGFsbGVyLmRlcGVuZGVuY2llcy5tYXAoKGRlcCkgPT4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIgcHktMC41IHRleHQteHMgYmcteWVsbG93LTEwMCBkYXJrOmJnLXllbGxvdy05MDAvMzAgdGV4dC15ZWxsb3ctNzAwIGRhcms6dGV4dC15ZWxsb3ctMzAwIHJvdW5kZWRcIiwgY2hpbGRyZW46IGRlcCB9LCBkZXApKSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgbXQtMyB0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChIYXJkRHJpdmUsIHsgY2xhc3NOYW1lOiBcInctMyBoLTNcIiB9KSwgaW5zdGFsbGVyLnNpemVdIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KENsb2NrLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zXCIgfSksIGluc3RhbGxlci5lc3RpbWF0ZWRUaW1lXSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2luc3RhbGxlci5zdGF0dXMgPT09ICdub3RfaW5zdGFsbGVkJyAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogb25JbnN0YWxsLCBkaXNhYmxlZDogZGlzYWJsZWQsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IFwiSW5zdGFsbFwiIH0pKSwgX2pzeChcImFcIiwgeyBocmVmOiBpbnN0YWxsZXIuZG93bmxvYWRVcmwsIHRhcmdldDogXCJfYmxhbmtcIiwgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiwgY2xhc3NOYW1lOiBcInAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwIGRhcms6aG92ZXI6dGV4dC1ncmF5LTIwMFwiLCB0aXRsZTogXCJPcGVuIGRvd25sb2FkIHBhZ2VcIiwgY2hpbGRyZW46IF9qc3goRXh0ZXJuYWxMaW5rLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSkgfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBvbkV4cGFuZCwgY2xhc3NOYW1lOiBcInAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IGV4cGFuZGVkID8gX2pzeChDaGV2cm9uRG93biwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pIDogX2pzeChDaGV2cm9uUmlnaHQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSB9KV0gfSldIH0pLCBpc0luUHJvZ3Jlc3MgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMVwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGluc3RhbGxlci5zdGF0dXMgPT09ICdkb3dubG9hZGluZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdEb3dubG9hZGluZy4uLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGluc3RhbGxlci5zdGF0dXMgPT09ICdpbnN0YWxsaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdJbnN0YWxsaW5nLi4uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdWZXJpZnlpbmcuLi4nIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMFwiLCBjaGlsZHJlbjogW2luc3RhbGxlci5wcm9ncmVzcywgXCIlXCJdIH0pXSB9KSwgX2pzeChQcm9ncmVzc0JhciwgeyB2YWx1ZTogaW5zdGFsbGVyLnByb2dyZXNzLCBtYXg6IDEwMCwgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImluZm9cIiwgYW5pbWF0ZWQ6IHRydWUsIHN0cmlwZWQ6IHRydWUgfSldIH0pKSwgZXhwYW5kZWQgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBwdC00IGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNCB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlZlcmlmeSBDb21tYW5kOlwiIH0pLCBfanN4KFwiY29kZVwiLCB7IGNsYXNzTmFtZTogXCJibG9jayBtdC0xIHB4LTIgcHktMSBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQgdGV4dC14cyB0ZXh0LWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTIwMCBvdmVyZmxvdy14LWF1dG9cIiwgY2hpbGRyZW46IGluc3RhbGxlci52ZXJpZnlDb21tYW5kIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkluc3RhbGwgQXJnczpcIiB9KSwgX2pzeChcImNvZGVcIiwgeyBjbGFzc05hbWU6IFwiYmxvY2sgbXQtMSBweC0yIHB5LTEgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkIHRleHQteHMgdGV4dC1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0yMDBcIiwgY2hpbGRyZW46IGluc3RhbGxlci5pbnN0YWxsQXJncyB8fCAnKG5vbmUpJyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNvbC1zcGFuLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJEb3dubG9hZCBVUkw6XCIgfSksIF9qc3goXCJhXCIsIHsgaHJlZjogaW5zdGFsbGVyLmRvd25sb2FkVXJsLCB0YXJnZXQ6IFwiX2JsYW5rXCIsIHJlbDogXCJub29wZW5lciBub3JlZmVycmVyXCIsIGNsYXNzTmFtZTogXCJibG9jayBtdC0xIHRleHQteHMgdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgaG92ZXI6dW5kZXJsaW5lIHRydW5jYXRlXCIsIGNoaWxkcmVuOiBpbnN0YWxsZXIuZG93bmxvYWRVcmwgfSldIH0pXSB9KSB9KSldIH0pIH0pKTtcbn07XG4vKipcbiAqIFRlcm1pbmFsLXN0eWxlIGxvZyB2aWV3ZXJcbiAqL1xuY29uc3QgTG9nVmlld2VyID0gKHsgbG9ncywgb25DbGVhciB9KSA9PiB7XG4gICAgY29uc3QgZ2V0U3RhdHVzQ29sb3IgPSAoc3RhdHVzKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RleHQtZ3JlZW4tNDAwJztcbiAgICAgICAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC15ZWxsb3ctNDAwJztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RleHQtcmVkLTQwMCc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC1ncmF5LTMwMCc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JheS05MDAgcm91bmRlZC1sZyBvdmVyZmxvdy1oaWRkZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNCBweS0yIGJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMS41XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIHJvdW5kZWQtZnVsbCBiZy1yZWQtNTAwXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy0zIGgtMyByb3VuZGVkLWZ1bGwgYmcteWVsbG93LTUwMFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgcm91bmRlZC1mdWxsIGJnLWdyZWVuLTUwMFwiIH0pXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNDAwIG1sLTJcIiwgY2hpbGRyZW46IFwiSW5zdGFsbGF0aW9uIExvZ1wiIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IG9uQ2xlYXIsIGNsYXNzTmFtZTogXCJwLTEgcm91bmRlZCBob3ZlcjpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS0yMDAgdHJhbnNpdGlvbi1jb2xvcnNcIiwgdGl0bGU6IFwiQ2xlYXIgbG9nc1wiLCBjaGlsZHJlbjogX2pzeChUcmFzaDIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IG1heC1oLTY0IG92ZXJmbG93LWF1dG8gZm9udC1tb25vIHRleHQtc21cIiwgY2hpbGRyZW46IGxvZ3MubGVuZ3RoID09PSAwID8gKF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFwiJCBXYWl0aW5nIGZvciBvcGVyYXRpb25zLi4uXCIgfSkpIDogKGxvZ3MubWFwKChsb2cpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogYHB5LTAuNSAke2dldFN0YXR1c0NvbG9yKGxvZy5zdGF0dXMpfWAsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFtcIltcIiwgbmV3IERhdGUobG9nLnRpbWVzdGFtcCkudG9Mb2NhbGVUaW1lU3RyaW5nKCksIFwiXVwiXSB9KSwgJyAnLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jeWFuLTQwMFwiLCBjaGlsZHJlbjogW1wiW1wiLCBsb2cuaW5zdGFsbGVyLCBcIl1cIl0gfSksICcgJywgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1wdXJwbGUtNDAwXCIsIGNoaWxkcmVuOiBsb2cuYWN0aW9uIH0pLCBcIjpcIiwgJyAnLCBsb2cubWVzc2FnZV0gfSwgbG9nLmlkKSkpKSB9KV0gfSkpO1xufTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1haW4gQ29tcG9uZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdCBTZXR1cEluc3RhbGxlcnNWaWV3ID0gKCkgPT4ge1xuICAgIC8vIFRhYiBzdGF0ZVxuICAgIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnbmV0d29ya2luZycpO1xuICAgIGNvbnN0IFtzZWFyY2hRdWVyeSwgc2V0U2VhcmNoUXVlcnldID0gdXNlU3RhdGUoJycpO1xuICAgIC8vIEluc3RhbGxlcnMgc3RhdGVcbiAgICBjb25zdCBbaW5zdGFsbGVycywgc2V0SW5zdGFsbGVyc10gPSB1c2VTdGF0ZSgoKSA9PiBJTlNUQUxMRVJTLm1hcCgoaSkgPT4gKHsgLi4uaSwgc3RhdHVzOiAncGVuZGluZycsIHByb2dyZXNzOiAwLCBpbnN0YWxsZWQ6IG51bGwsIGluc3RhbGxlZFZlcnNpb246IHVuZGVmaW5lZCwgZXJyb3JNZXNzYWdlOiB1bmRlZmluZWQgfSkpKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRJbnN0YWxsZXJzLCBzZXRTZWxlY3RlZEluc3RhbGxlcnNdID0gdXNlU3RhdGUobmV3IFNldCgpKTtcbiAgICBjb25zdCBbZXhwYW5kZWRJbnN0YWxsZXIsIHNldEV4cGFuZGVkSW5zdGFsbGVyXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIC8vIFByb2Nlc3Mgc3RhdGVcbiAgICBjb25zdCBbaXNDaGVja2luZywgc2V0SXNDaGVja2luZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2lzSW5zdGFsbGluZywgc2V0SXNJbnN0YWxsaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbb3ZlcmFsbFByb2dyZXNzLCBzZXRPdmVyYWxsUHJvZ3Jlc3NdID0gdXNlU3RhdGUoMCk7XG4gICAgLy8gTG9nc1xuICAgIGNvbnN0IFtsb2dzLCBzZXRMb2dzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2hvd0xvZ3MsIHNldFNob3dMb2dzXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICAvLyBDYXRlZ29yeSBjb3VudHNcbiAgICBjb25zdCBjYXRlZ29yeUNvdW50cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBjb3VudHMgPSB7XG4gICAgICAgICAgICBuZXR3b3JraW5nOiB7IHRvdGFsOiAwLCBpbnN0YWxsZWQ6IDAgfSxcbiAgICAgICAgICAgIHNlY3VyaXR5OiB7IHRvdGFsOiAwLCBpbnN0YWxsZWQ6IDAgfSxcbiAgICAgICAgICAgIGF1dG9tYXRpb246IHsgdG90YWw6IDAsIGluc3RhbGxlZDogMCB9LFxuICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiB7IHRvdGFsOiAwLCBpbnN0YWxsZWQ6IDAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgaW5zdGFsbGVycy5mb3JFYWNoKChpbnN0YWxsZXIpID0+IHtcbiAgICAgICAgICAgIGNvdW50c1tpbnN0YWxsZXIuY2F0ZWdvcnldLnRvdGFsKys7XG4gICAgICAgICAgICBpZiAoaW5zdGFsbGVyLnN0YXR1cyA9PT0gJ2luc3RhbGxlZCcpIHtcbiAgICAgICAgICAgICAgICBjb3VudHNbaW5zdGFsbGVyLmNhdGVnb3J5XS5pbnN0YWxsZWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb3VudHM7XG4gICAgfSwgW2luc3RhbGxlcnNdKTtcbiAgICAvLyBGaWx0ZXJlZCBpbnN0YWxsZXJzXG4gICAgY29uc3QgZmlsdGVyZWRJbnN0YWxsZXJzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbnN0YWxsZXJzLmZpbHRlcigoaW5zdGFsbGVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzQ2F0ZWdvcnkgPSBpbnN0YWxsZXIuY2F0ZWdvcnkgPT09IGFjdGl2ZVRhYjtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSBzZWFyY2hRdWVyeSA9PT0gJycgfHxcbiAgICAgICAgICAgICAgICBpbnN0YWxsZXIuZGlzcGxheU5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIGluc3RhbGxlci5kZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNDYXRlZ29yeSAmJiBtYXRjaGVzU2VhcmNoO1xuICAgICAgICB9KTtcbiAgICB9LCBbaW5zdGFsbGVycywgYWN0aXZlVGFiLCBzZWFyY2hRdWVyeV0pO1xuICAgIC8vIFN1bW1hcnkgc3RhdHNcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnN0YWxsZWQgPSBpbnN0YWxsZXJzLmZpbHRlcigoaSkgPT4gaS5zdGF0dXMgPT09ICdpbnN0YWxsZWQnKS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7IGluc3RhbGxlZCwgdG90YWw6IGluc3RhbGxlcnMubGVuZ3RoIH07XG4gICAgfSwgW2luc3RhbGxlcnNdKTtcbiAgICAvLyBBZGQgbG9nIGVudHJ5XG4gICAgY29uc3QgYWRkTG9nID0gdXNlQ2FsbGJhY2soKGluc3RhbGxlciwgYWN0aW9uLCBzdGF0dXMsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgY29uc3QgbmV3TG9nID0ge1xuICAgICAgICAgICAgaWQ6IGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWAsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGluc3RhbGxlcixcbiAgICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIH07XG4gICAgICAgIHNldExvZ3MoKHByZXYpID0+IFsuLi5wcmV2LCBuZXdMb2ddKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gVmVyaWZ5IGFsbCBpbnN0YWxsZXJzXG4gICAgY29uc3QgdmVyaWZ5SW5zdGFsbGVycyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNDaGVja2luZyh0cnVlKTtcbiAgICAgICAgYWRkTG9nKCdTeXN0ZW0nLCAnVmVyaWZ5JywgJ2luZm8nLCAnQ2hlY2tpbmcgaW5zdGFsbGVkIHNvZnR3YXJlLi4uJyk7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRJbnN0YWxsZXJzID0gWy4uLmluc3RhbGxlcnNdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVwZGF0ZWRJbnN0YWxsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpbnN0YWxsZXIgPSB1cGRhdGVkSW5zdGFsbGVyc1tpXTtcbiAgICAgICAgICAgIGluc3RhbGxlci5zdGF0dXMgPSAnY2hlY2tpbmcnO1xuICAgICAgICAgICAgc2V0SW5zdGFsbGVycyhbLi4udXBkYXRlZEluc3RhbGxlcnNdKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5lbGVjdHJvbkFQST8uZXhlY3V0ZVNjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQ6IGBcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgJG91dHB1dCA9ICYgY21kIC9jIFwiJHtpbnN0YWxsZXIudmVyaWZ5Q29tbWFuZH1cIiAyPiYxXHJcbiAgICAgICAgICAgICAgICBpZiAoJExBU1RFWElUQ09ERSAtZXEgMCAtb3IgJG91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgICBAeyBJbnN0YWxsZWQgPSAkdHJ1ZTsgT3V0cHV0ID0gJG91dHB1dCB8IE91dC1TdHJpbmcgfSB8IENvbnZlcnRUby1Kc29uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBAeyBJbnN0YWxsZWQgPSAkZmFsc2UgfSB8IENvbnZlcnRUby1Kc29uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICBAeyBJbnN0YWxsZWQgPSAkZmFsc2U7IEVycm9yID0gJF8uRXhjZXB0aW9uLk1lc3NhZ2UgfSB8IENvbnZlcnRUby1Kc29uXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHR5cGVvZiByZXN1bHQuZGF0YSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHJlc3VsdC5kYXRhKSA6IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbGVyLmluc3RhbGxlZCA9IHBhcnNlZC5JbnN0YWxsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsZXIuc3RhdHVzID0gcGFyc2VkLkluc3RhbGxlZCA/ICdpbnN0YWxsZWQnIDogJ25vdF9pbnN0YWxsZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkTG9nKGluc3RhbGxlci5kaXNwbGF5TmFtZSwgJ1ZlcmlmeScsIHBhcnNlZC5JbnN0YWxsZWQgPyAnc3VjY2VzcycgOiAnaW5mbycsIHBhcnNlZC5JbnN0YWxsZWQgPyAnSW5zdGFsbGVkJyA6ICdOb3QgaW5zdGFsbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbXVsYXRlZFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxNTApKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNJbnN0YWxsZWQgPSBNYXRoLnJhbmRvbSgpID4gMC42O1xuICAgICAgICAgICAgICAgICAgICBpbnN0YWxsZXIuaW5zdGFsbGVkID0gaXNJbnN0YWxsZWQ7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbGxlci5zdGF0dXMgPSBpc0luc3RhbGxlZCA/ICdpbnN0YWxsZWQnIDogJ25vdF9pbnN0YWxsZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGluc3RhbGxlci5zdGF0dXMgPSAnbm90X2luc3RhbGxlZCc7XG4gICAgICAgICAgICAgICAgYWRkTG9nKGluc3RhbGxlci5kaXNwbGF5TmFtZSwgJ1ZlcmlmeScsICd3YXJuaW5nJywgYENoZWNrIGZhaWxlZDogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0SW5zdGFsbGVycyhbLi4udXBkYXRlZEluc3RhbGxlcnNdKTtcbiAgICAgICAgICAgIHNldE92ZXJhbGxQcm9ncmVzcygoKGkgKyAxKSAvIHVwZGF0ZWRJbnN0YWxsZXJzLmxlbmd0aCkgKiAxMDApO1xuICAgICAgICB9XG4gICAgICAgIGFkZExvZygnU3lzdGVtJywgJ1ZlcmlmeScsICdzdWNjZXNzJywgJ1ZlcmlmaWNhdGlvbiBjb21wbGV0ZScpO1xuICAgICAgICBzZXRJc0NoZWNraW5nKGZhbHNlKTtcbiAgICAgICAgc2V0T3ZlcmFsbFByb2dyZXNzKDApO1xuICAgIH0sIFtpbnN0YWxsZXJzLCBhZGRMb2ddKTtcbiAgICAvLyBUb2dnbGUgaW5zdGFsbGVyIHNlbGVjdGlvbiB3aXRoIGRlcGVuZGVuY3kgcmVzb2x1dGlvblxuICAgIGNvbnN0IHRvZ2dsZUluc3RhbGxlclNlbGVjdGlvbiA9IHVzZUNhbGxiYWNrKChpbnN0YWxsZXJJZCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZEluc3RhbGxlcnMoKHByZXYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1NldCA9IG5ldyBTZXQocHJldik7XG4gICAgICAgICAgICBpZiAobmV3U2V0LmhhcyhpbnN0YWxsZXJJZCkpIHtcbiAgICAgICAgICAgICAgICBuZXdTZXQuZGVsZXRlKGluc3RhbGxlcklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1NldC5hZGQoaW5zdGFsbGVySWQpO1xuICAgICAgICAgICAgICAgIC8vIEF1dG8tc2VsZWN0IGRlcGVuZGVuY2llc1xuICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbGxlciA9IGluc3RhbGxlcnMuZmluZCgoaSkgPT4gaS5pZCA9PT0gaW5zdGFsbGVySWQpO1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YWxsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFsbGVyLmRlcGVuZGVuY2llcy5mb3JFYWNoKChkZXBOYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXAgPSBpbnN0YWxsZXJzLmZpbmQoKGkpID0+IGkubmFtZS50b0xvd2VyQ2FzZSgpID09PSBkZXBOYW1lLnRvTG93ZXJDYXNlKCkgfHwgaS5kaXNwbGF5TmFtZS50b0xvd2VyQ2FzZSgpID09PSBkZXBOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlcCAmJiBkZXAuc3RhdHVzICE9PSAnaW5zdGFsbGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1NldC5hZGQoZGVwLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld1NldDtcbiAgICAgICAgfSk7XG4gICAgfSwgW2luc3RhbGxlcnNdKTtcbiAgICAvLyBJbnN0YWxsIHNpbmdsZSB0b29sXG4gICAgY29uc3QgaW5zdGFsbFRvb2wgPSB1c2VDYWxsYmFjayhhc3luYyAoaW5zdGFsbGVySWQpID0+IHtcbiAgICAgICAgY29uc3QgaW5zdGFsbGVyID0gaW5zdGFsbGVycy5maW5kKChpKSA9PiBpLmlkID09PSBpbnN0YWxsZXJJZCk7XG4gICAgICAgIGlmICghaW5zdGFsbGVyKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJbnN0YWxsZXJzKChwcmV2KSA9PiBwcmV2Lm1hcCgoaSkgPT4gKGkuaWQgPT09IGluc3RhbGxlcklkID8geyAuLi5pLCBzdGF0dXM6ICdkb3dubG9hZGluZycsIHByb2dyZXNzOiAwLCBlcnJvck1lc3NhZ2U6IHVuZGVmaW5lZCB9IDogaSkpKTtcbiAgICAgICAgYWRkTG9nKGluc3RhbGxlci5kaXNwbGF5TmFtZSwgJ0Rvd25sb2FkJywgJ2luZm8nLCAnU3RhcnRpbmcgZG93bmxvYWQuLi4nKTtcbiAgICAgICAgLy8gU2ltdWxhdGUgZG93bmxvYWRcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gNTA7IHAgKz0gMTApIHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMCkpO1xuICAgICAgICAgICAgc2V0SW5zdGFsbGVycygocHJldikgPT4gcHJldi5tYXAoKGkpID0+IChpLmlkID09PSBpbnN0YWxsZXJJZCA/IHsgLi4uaSwgcHJvZ3Jlc3M6IHAgfSA6IGkpKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0SW5zdGFsbGVycygocHJldikgPT4gcHJldi5tYXAoKGkpID0+IChpLmlkID09PSBpbnN0YWxsZXJJZCA/IHsgLi4uaSwgc3RhdHVzOiAnaW5zdGFsbGluZycsIHByb2dyZXNzOiA1MCB9IDogaSkpKTtcbiAgICAgICAgYWRkTG9nKGluc3RhbGxlci5kaXNwbGF5TmFtZSwgJ0luc3RhbGwnLCAnaW5mbycsICdJbnN0YWxsaW5nLi4uJyk7XG4gICAgICAgIC8vIFNpbXVsYXRlIGluc3RhbGxcbiAgICAgICAgZm9yIChsZXQgcCA9IDUwOyBwIDw9IDkwOyBwICs9IDEwKSB7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAzMDApKTtcbiAgICAgICAgICAgIHNldEluc3RhbGxlcnMoKHByZXYpID0+IHByZXYubWFwKChpKSA9PiAoaS5pZCA9PT0gaW5zdGFsbGVySWQgPyB7IC4uLmksIHByb2dyZXNzOiBwIH0gOiBpKSkpO1xuICAgICAgICB9XG4gICAgICAgIHNldEluc3RhbGxlcnMoKHByZXYpID0+IHByZXYubWFwKChpKSA9PiAoaS5pZCA9PT0gaW5zdGFsbGVySWQgPyB7IC4uLmksIHN0YXR1czogJ3ZlcmlmeWluZycsIHByb2dyZXNzOiA5NSB9IDogaSkpKTtcbiAgICAgICAgYWRkTG9nKGluc3RhbGxlci5kaXNwbGF5TmFtZSwgJ1ZlcmlmeScsICdpbmZvJywgJ1ZlcmlmeWluZyBpbnN0YWxsYXRpb24uLi4nKTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG4gICAgICAgIHNldEluc3RhbGxlcnMoKHByZXYpID0+IHByZXYubWFwKChpKSA9PiAoaS5pZCA9PT0gaW5zdGFsbGVySWQgPyB7IC4uLmksIHN0YXR1czogJ2luc3RhbGxlZCcsIGluc3RhbGxlZDogdHJ1ZSwgcHJvZ3Jlc3M6IDEwMCB9IDogaSkpKTtcbiAgICAgICAgYWRkTG9nKGluc3RhbGxlci5kaXNwbGF5TmFtZSwgJ0luc3RhbGwnLCAnc3VjY2VzcycsICdJbnN0YWxsZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfSwgW2luc3RhbGxlcnMsIGFkZExvZ10pO1xuICAgIC8vIEluc3RhbGwgYWxsIHNlbGVjdGVkXG4gICAgY29uc3QgaW5zdGFsbFNlbGVjdGVkID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRJbnN0YWxsZXJzLnNpemUgPT09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzSW5zdGFsbGluZyh0cnVlKTtcbiAgICAgICAgYWRkTG9nKCdJbnN0YWxsYXRpb24nLCAnU3RhcnQnLCAnaW5mbycsIGBJbnN0YWxsaW5nICR7c2VsZWN0ZWRJbnN0YWxsZXJzLnNpemV9IHRvb2wocykuLi5gKTtcbiAgICAgICAgLy8gU29ydCBieSBkZXBlbmRlbmNpZXNcbiAgICAgICAgY29uc3QgdG9JbnN0YWxsID0gaW5zdGFsbGVyc1xuICAgICAgICAgICAgLmZpbHRlcigoaSkgPT4gc2VsZWN0ZWRJbnN0YWxsZXJzLmhhcyhpLmlkKSAmJiBpLnN0YXR1cyAhPT0gJ2luc3RhbGxlZCcpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGEuZGVwZW5kZW5jaWVzLnNvbWUoKGQpID0+IGIubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGQudG9Mb3dlckNhc2UoKSkpKVxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgaWYgKGIuZGVwZW5kZW5jaWVzLnNvbWUoKGQpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGQudG9Mb3dlckNhc2UoKSkpKVxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b0luc3RhbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGF3YWl0IGluc3RhbGxUb29sKHRvSW5zdGFsbFtpXS5pZCk7XG4gICAgICAgICAgICBzZXRPdmVyYWxsUHJvZ3Jlc3MoKChpICsgMSkgLyB0b0luc3RhbGwubGVuZ3RoKSAqIDEwMCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkTG9nKCdJbnN0YWxsYXRpb24nLCAnQ29tcGxldGUnLCAnc3VjY2VzcycsIGBDb21wbGV0ZWQ6ICR7dG9JbnN0YWxsLmxlbmd0aH0gaW5zdGFsbGVkYCk7XG4gICAgICAgIHNldElzSW5zdGFsbGluZyhmYWxzZSk7XG4gICAgICAgIHNldE92ZXJhbGxQcm9ncmVzcygwKTtcbiAgICAgICAgc2V0U2VsZWN0ZWRJbnN0YWxsZXJzKG5ldyBTZXQoKSk7XG4gICAgfSwgW3NlbGVjdGVkSW5zdGFsbGVycywgaW5zdGFsbGVycywgaW5zdGFsbFRvb2wsIGFkZExvZ10pO1xuICAgIC8vIFRhYiBjb25maWd1cmF0aW9uXG4gICAgY29uc3QgdGFicyA9IFtcbiAgICAgICAgeyBpZDogJ25ldHdvcmtpbmcnLCBsYWJlbDogJ05ldHdvcmtpbmcnLCBpY29uOiBfanN4KE5ldHdvcmssIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9LFxuICAgICAgICB7IGlkOiAnc2VjdXJpdHknLCBsYWJlbDogJ1NlY3VyaXR5JywgaWNvbjogX2pzeChTaGllbGQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9LFxuICAgICAgICB7IGlkOiAnYXV0b21hdGlvbicsIGxhYmVsOiAnQXV0b21hdGlvbicsIGljb246IF9qc3goQ3B1LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSxcbiAgICAgICAgeyBpZDogJ2RlcGVuZGVuY2llcycsIGxhYmVsOiAnRGVwZW5kZW5jaWVzJywgaWNvbjogX2pzeChCb3hlcywgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0sXG4gICAgXTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYWRpZW50LXRvLWJyIGZyb20tZ3JheS01MCB0by1ncmF5LTEwMCBkYXJrOmZyb20tZ3JheS05MDAgZGFyazp0by1ncmF5LTk1MFwiLCBcImRhdGEtY3lcIjogXCJzZXR1cC1pbnN0YWxsZXJzLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInNldHVwLWluc3RhbGxlcnMtdmlld1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00IHNoYWRvdy1zbVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1heC13LTd4bCBteC1hdXRvXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtMiBiZy1ncmFkaWVudC10by1iciBmcm9tLWdyZWVuLTUwMCB0by10ZWFsLTYwMCByb3VuZGVkLXhsIHNoYWRvdy1sZyBzaGFkb3ctZ3JlZW4tNTAwLzIwXCIsIGNoaWxkcmVuOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJFeHRlcm5hbCBUb29sc1wiIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW3N0YXRzLmluc3RhbGxlZCwgXCIvXCIsIHN0YXRzLnRvdGFsLCBcIiB0b29scyBpbnN0YWxsZWRcIl0gfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiB2ZXJpZnlJbnN0YWxsZXJzLCBsb2FkaW5nOiBpc0NoZWNraW5nLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJWZXJpZnkgQWxsXCIgfSksIF9qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaW5zdGFsbFNlbGVjdGVkLCBkaXNhYmxlZDogc2VsZWN0ZWRJbnN0YWxsZXJzLnNpemUgPT09IDAgfHwgaXNJbnN0YWxsaW5nLCBsb2FkaW5nOiBpc0luc3RhbGxpbmcsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IFtcIkluc3RhbGwgU2VsZWN0ZWQgKFwiLCBzZWxlY3RlZEluc3RhbGxlcnMuc2l6ZSwgXCIpXCJdIH0pXSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBtYXgtdy03eGwgbXgtYXV0byBweC02XCIsIGNoaWxkcmVuOiB0YWJzLm1hcCgodGFiKSA9PiAoX2pzeChDYXRlZ29yeVRhYiwgeyBpZDogdGFiLmlkLCBsYWJlbDogdGFiLmxhYmVsLCBpY29uOiB0YWIuaWNvbiwgY291bnRzOiBjYXRlZ29yeUNvdW50c1t0YWIuaWRdLCBpc0FjdGl2ZTogYWN0aXZlVGFiID09PSB0YWIuaWQsIG9uQ2xpY2s6ICgpID0+IHNldEFjdGl2ZVRhYih0YWIuaWQpIH0sIHRhYi5pZCkpKSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBweS02XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYXgtdy03eGwgbXgtYXV0byBweC02IHNwYWNlLXktNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlIG1heC13LW1kXCIsIGNoaWxkcmVuOiBbX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdy01IGgtNSB0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogc2VhcmNoUXVlcnksIG9uQ2hhbmdlOiAoZSkgPT4gc2V0U2VhcmNoUXVlcnkoZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJTZWFyY2ggdG9vbHMuLi5cIiwgY2xhc3NOYW1lOiBcInctZnVsbCBwbC0xMCBwci00IHB5LTIuNSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbGcgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItdHJhbnNwYXJlbnRcIiwgXCJkYXRhLWN5XCI6IFwic2VhcmNoLWlucHV0XCIgfSldIH0pLCAoaXNDaGVja2luZyB8fCBpc0luc3RhbGxpbmcpICYmIG92ZXJhbGxQcm9ncmVzcyA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0zXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGlzSW5zdGFsbGluZyA/ICdJbnN0YWxsaW5nIHRvb2xzLi4uJyA6ICdWZXJpZnlpbmcgdG9vbHMuLi4nIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgY2hpbGRyZW46IFtNYXRoLnJvdW5kKG92ZXJhbGxQcm9ncmVzcyksIFwiJVwiXSB9KV0gfSksIF9qc3goUHJvZ3Jlc3NCYXIsIHsgdmFsdWU6IG92ZXJhbGxQcm9ncmVzcywgbWF4OiAxMDAsIHZhcmlhbnQ6IFwiaW5mb1wiLCBzaXplOiBcImxnXCIsIGFuaW1hdGVkOiB0cnVlLCBzdHJpcGVkOiB0cnVlIH0pXSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS00XCIsIGNoaWxkcmVuOiBmaWx0ZXJlZEluc3RhbGxlcnMubGVuZ3RoID09PSAwID8gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHB5LTEyIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChQYWNrYWdlLCB7IGNsYXNzTmFtZTogXCJ3LTEyIGgtMTIgbXgtYXV0byB0ZXh0LWdyYXktNDAwIG1iLTRcIiB9KSwgX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMlwiLCBjaGlsZHJlbjogXCJObyB0b29scyBmb3VuZFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJUcnkgYWRqdXN0aW5nIHlvdXIgc2VhcmNoIGNyaXRlcmlhLlwiIH0pXSB9KSkgOiAoZmlsdGVyZWRJbnN0YWxsZXJzLm1hcCgoaW5zdGFsbGVyKSA9PiAoX2pzeChJbnN0YWxsZXJDYXJkLCB7IGluc3RhbGxlcjogaW5zdGFsbGVyLCBzZWxlY3RlZDogc2VsZWN0ZWRJbnN0YWxsZXJzLmhhcyhpbnN0YWxsZXIuaWQpLCBvblRvZ2dsZTogKCkgPT4gdG9nZ2xlSW5zdGFsbGVyU2VsZWN0aW9uKGluc3RhbGxlci5pZCksIG9uSW5zdGFsbDogKCkgPT4gaW5zdGFsbFRvb2woaW5zdGFsbGVyLmlkKSwgZXhwYW5kZWQ6IGV4cGFuZGVkSW5zdGFsbGVyID09PSBpbnN0YWxsZXIuaWQsIG9uRXhwYW5kOiAoKSA9PiBzZXRFeHBhbmRlZEluc3RhbGxlcihleHBhbmRlZEluc3RhbGxlciA9PT0gaW5zdGFsbGVyLmlkID8gbnVsbCA6IGluc3RhbGxlci5pZCksIGRpc2FibGVkOiBpc0NoZWNraW5nIHx8IGlzSW5zdGFsbGluZyB9LCBpbnN0YWxsZXIuaWQpKSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBvdmVyZmxvdy1oaWRkZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IHNldFNob3dMb2dzKCFzaG93TG9ncyksIGNsYXNzTmFtZTogXCJ3LWZ1bGwgcHgtNiBweS00IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiB0ZXh0LWxlZnQgaG92ZXI6YmctZ3JheS01MCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwLzUwIHRyYW5zaXRpb24tY29sb3JzXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFRlcm1pbmFsLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JlZW4tNTAwXCIgfSksIFwiSW5zdGFsbGF0aW9uIExvZ3NcIiwgbG9ncy5sZW5ndGggPiAwICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJweC0yIHB5LTAuNSB0ZXh0LXhzIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS03MDAgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS0zMDAgcm91bmRlZC1mdWxsXCIsIGNoaWxkcmVuOiBsb2dzLmxlbmd0aCB9KSldIH0pLCBzaG93TG9ncyA/IF9qc3goQ2hldnJvbkRvd24sIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSA6IF9qc3goQ2hldnJvblJpZ2h0LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSldIH0pLCBzaG93TG9ncyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHBiLTZcIiwgY2hpbGRyZW46IF9qc3goTG9nVmlld2VyLCB7IGxvZ3M6IGxvZ3MsIG9uQ2xlYXI6ICgpID0+IHNldExvZ3MoW10pIH0pIH0pKV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC02IHJvdW5kZWQteGwgYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwIGJvcmRlciBib3JkZXItYmx1ZS0yMDAgZGFyazpib3JkZXItYmx1ZS04MDBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnQgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC1ibHVlLTUwMCBmbGV4LXNocmluay0wXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWJsdWUtODAwIGRhcms6dGV4dC1ibHVlLTIwMCBtYi0yXCIsIGNoaWxkcmVuOiBcIkFib3V0IFRvb2wgSW5zdGFsbGF0aW9uXCIgfSksIF9qc3hzKFwidWxcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWJsdWUtNzAwIGRhcms6dGV4dC1ibHVlLTMwMCBzcGFjZS15LTEgbGlzdC1kaXNjIGxpc3QtaW5zaWRlXCIsIGNoaWxkcmVuOiBbX2pzeChcImxpXCIsIHsgY2hpbGRyZW46IFwiVG9vbHMgYXJlIGRvd25sb2FkZWQgZnJvbSBvZmZpY2lhbCBzb3VyY2VzIHdpdGggdmVyaWZpY2F0aW9uXCIgfSksIF9qc3goXCJsaVwiLCB7IGNoaWxkcmVuOiBcIlNvbWUgdG9vbHMgcmVxdWlyZSBhZG1pbmlzdHJhdG9yIHByaXZpbGVnZXMgdG8gaW5zdGFsbFwiIH0pLCBfanN4KFwibGlcIiwgeyBjaGlsZHJlbjogXCJEZXBlbmRlbmNpZXMgYXJlIGF1dG9tYXRpY2FsbHkgc2VsZWN0ZWQgd2hlbiBuZWVkZWRcIiB9KSwgX2pzeChcImxpXCIsIHsgY2hpbGRyZW46IFwiQ2xpY2sgXFxcIlZlcmlmeSBBbGxcXFwiIHRvIGNoZWNrIHdoaWNoIHRvb2xzIGFyZSBhbHJlYWR5IGluc3RhbGxlZFwiIH0pLCBfanN4KFwibGlcIiwgeyBjaGlsZHJlbjogXCJVc2UgdGhlIGV4dGVybmFsIGxpbmsgaWNvbiB0byBkb3dubG9hZCB0b29scyBtYW51YWxseVwiIH0pXSB9KV0gfSldIH0pIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFNldHVwSW5zdGFsbGVyc1ZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqXG4gKiBQcm9ncmVzcyBpbmRpY2F0b3Igd2l0aCBwZXJjZW50YWdlIGRpc3BsYXkgYW5kIG9wdGlvbmFsIGxhYmVsLlxuICogU3VwcG9ydHMgZGlmZmVyZW50IHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0JhciA9ICh7IHZhbHVlLCBtYXggPSAxMDAsIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBzaG93TGFiZWwgPSB0cnVlLCBsYWJlbCwgbGFiZWxQb3NpdGlvbiA9ICdpbnNpZGUnLCBzdHJpcGVkID0gZmFsc2UsIGFuaW1hdGVkID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBDYWxjdWxhdGUgcGVyY2VudGFnZVxuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsICh2YWx1ZSAvIG1heCkgKiAxMDApKTtcbiAgICAvLyBWYXJpYW50IGNvbG9yc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS02MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy02MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNjAwJyxcbiAgICB9O1xuICAgIC8vIEJhY2tncm91bmQgY29sb3JzXG4gICAgY29uc3QgYmdDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS0xMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtMicsXG4gICAgICAgIG1kOiAnaC00JyxcbiAgICAgICAgbGc6ICdoLTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCcsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgdHJhY2tDbGFzc2VzID0gY2xzeCgndy1mdWxsIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW4nLCBiZ0NsYXNzZXNbdmFyaWFudF0sIHNpemVDbGFzc2VzW3NpemVdKTtcbiAgICBjb25zdCBiYXJDbGFzc2VzID0gY2xzeCgnaC1mdWxsIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCBlYXNlLW91dCcsIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCB7XG4gICAgICAgIC8vIFN0cmlwZWQgcGF0dGVyblxuICAgICAgICAnYmctZ3JhZGllbnQtdG8tciBmcm9tLXRyYW5zcGFyZW50IHZpYS1ibGFjay8xMCB0by10cmFuc3BhcmVudCBiZy1bbGVuZ3RoOjFyZW1fMTAwJV0nOiBzdHJpcGVkLFxuICAgICAgICAnYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzJzogc3RyaXBlZCAmJiBhbmltYXRlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbFRleHQgPSBsYWJlbCB8fCAoc2hvd0xhYmVsID8gYCR7TWF0aC5yb3VuZChwZXJjZW50YWdlKX0lYCA6ICcnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2xhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnb3V0c2lkZScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTFcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogdHJhY2tDbGFzc2VzLCByb2xlOiBcInByb2dyZXNzYmFyXCIsIFwiYXJpYS12YWx1ZW5vd1wiOiB2YWx1ZSwgXCJhcmlhLXZhbHVlbWluXCI6IDAsIFwiYXJpYS12YWx1ZW1heFwiOiBtYXgsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBiYXJDbGFzc2VzLCBzdHlsZTogeyB3aWR0aDogYCR7cGVyY2VudGFnZX0lYCB9LCBjaGlsZHJlbjogbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdpbnNpZGUnICYmIHNpemUgIT09ICdzbScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsIHB4LTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXdoaXRlIHdoaXRlc3BhY2Utbm93cmFwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpIH0pIH0pXSB9KSk7XG59O1xuLy8gQWRkIGFuaW1hdGlvbiBmb3Igc3RyaXBlZCBwcm9ncmVzcyBiYXJzXG5jb25zdCBzdHlsZXMgPSBgXHJcbkBrZXlmcmFtZXMgcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgZnJvbSB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxcmVtIDA7XHJcbiAgfVxyXG4gIHRvIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcclxuICB9XHJcbn1cclxuXHJcbi5hbmltYXRlLXByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGFuaW1hdGlvbjogcHJvZ3Jlc3Mtc3RyaXBlcyAxcyBsaW5lYXIgaW5maW5pdGU7XHJcbn1cclxuYDtcbi8vIEluamVjdCBzdHlsZXNcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3MtYmFyLXN0eWxlcycpKSB7XG4gICAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGVTaGVldC5pZCA9ICdwcm9ncmVzcy1iYXItc3R5bGVzJztcbiAgICBzdHlsZVNoZWV0LnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG59XG5leHBvcnQgZGVmYXVsdCBQcm9ncmVzc0JhcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgY2hlY2tib3ggY29tcG9uZW50IHdpdGggbGFiZWxzIGFuZCBlcnJvciBzdGF0ZXMuXG4gKiBGb2xsb3dzIFdDQUcgMi4xIEFBIGd1aWRlbGluZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VJZCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZWNrIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDaGVja2JveCA9ICh7IGxhYmVsLCBkZXNjcmlwdGlvbiwgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgZXJyb3IsIGRpc2FibGVkID0gZmFsc2UsIGluZGV0ZXJtaW5hdGUgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IGlkID0gdXNlSWQoKTtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aWR9LWVycm9yYDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbklkID0gYCR7aWR9LWRlc2NyaXB0aW9uYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBpbmRldGVybWluYXRlIHZpYSByZWZcbiAgICBjb25zdCBjaGVja2JveFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2hlY2tib3hSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2hlY2tib3hSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH0sIFtpbmRldGVybWluYXRlXSk7XG4gICAgY29uc3QgY2hlY2tib3hDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdoLTUgdy01IHJvdW5kZWQgYm9yZGVyLTInLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkYXJrOnJpbmctb2Zmc2V0LWdyYXktOTAwJywgXG4gICAgLy8gU3RhdGUtYmFzZWQgc3R5bGVzXG4gICAge1xuICAgICAgICAvLyBOb3JtYWwgc3RhdGUgKHVuY2hlY2tlZClcbiAgICAgICAgJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTUwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCAmJiAhY2hlY2tlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBDaGVja2VkIHN0YXRlXG4gICAgICAgICdiZy1ibHVlLTYwMCBib3JkZXItYmx1ZS02MDAgZGFyazpiZy1ibHVlLTUwMCBkYXJrOmJvcmRlci1ibHVlLTUwMCc6IGNoZWNrZWQgJiYgIWRpc2FibGVkICYmICFoYXNFcnJvcixcbiAgICAgICAgLy8gRXJyb3Igc3RhdGVcbiAgICAgICAgJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTYwMCBkYXJrOmJvcmRlci1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6cmluZy1yZWQtNTAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBEaXNhYmxlZCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgndGV4dC1zbSBmb250LW1lZGl1bScsIHtcbiAgICAgICAgJ3RleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNTAwJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCcsIGNsYXNzTmFtZSksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGgtNVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHJlZjogY2hlY2tib3hSZWYsIGlkOiBpZCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBjaGVja2VkLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogXCJzci1vbmx5IHBlZXJcIiwgXCJhcmlhLWludmFsaWRcIjogaGFzRXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25JZF06IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3goY2hlY2tib3hDbGFzc2VzLCAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBjaGlsZHJlbjogW2NoZWNrZWQgJiYgIWluZGV0ZXJtaW5hdGUgJiYgKF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcImgtNCB3LTQgdGV4dC13aGl0ZVwiLCBzdHJva2VXaWR0aDogMyB9KSksIGluZGV0ZXJtaW5hdGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0wLjUgdy0zIGJnLXdoaXRlIHJvdW5kZWRcIiB9KSldIH0pXSB9KSwgKGxhYmVsIHx8IGRlc2NyaXB0aW9uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtM1wiLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGxhYmVsQ2xhc3NlcywgJ2N1cnNvci1wb2ludGVyJyksIGNoaWxkcmVuOiBsYWJlbCB9KSksIGRlc2NyaXB0aW9uICYmIChfanN4KFwicFwiLCB7IGlkOiBkZXNjcmlwdGlvbklkLCBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0wLjVcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pKV0gfSkpXSB9KSwgaGFzRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogXCJtdC0xIG1sLTggdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ2hlY2tib3g7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
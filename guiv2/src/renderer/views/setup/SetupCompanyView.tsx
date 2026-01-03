/**
 * Setup Company View
 *
 * A stunning wizard-style interface for Azure App Registration setup.
 * Features:
 * - Multi-step wizard with animated transitions
 * - Real-time connectivity monitoring
 * - Progress visualization with step indicators
 * - Credential management with secure masking
 * - Beautiful card-based layout with glass morphism effects
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Cloud,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Info,
  ChevronRight,
  ChevronLeft,
  Zap,
  Globe,
  Lock,
  Users,
  Folder,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Wifi,
  WifiOff,
  Server,
  Clock,
  AlertTriangle,
  Play,
  StopCircle,
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Checkbox } from '../../components/atoms/Checkbox';
import { Modal } from '../../components/organisms/Modal';
import { ProgressBar } from '../../components/molecules/ProgressBar';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';
import { useAppRegistration, REGISTRATION_STEPS, type RegistrationStepId } from '../../hooks/useAppRegistration';
import { useProfileStore } from '../../store/useProfileStore';
import DomainCredentialsDialog from '../../components/dialogs/DomainCredentialsDialog';

// ============================================================================
// Types
// ============================================================================

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  percentage: number;
  message?: string;
  duration?: number; // Duration in seconds for completed steps
}

interface ConnectivityStatus {
  internet: 'unknown' | 'checking' | 'connected' | 'failed';
  graph: 'unknown' | 'checking' | 'connected' | 'failed';
  azure: 'unknown' | 'checking' | 'connected' | 'failed';
}

interface CredentialSummary {
  tenantId: string;
  clientId: string;
  domain: string;
  created: string;
  expiresAt?: string;
  permissions: string[];
}

// Required Graph API permissions with descriptions
const REQUIRED_PERMISSIONS = [
  {
    name: 'Directory.Read.All',
    description: 'Read directory objects like users, groups, and organizational contacts',
    icon: <Folder className="w-4 h-4" />,
    scope: 'Application',
  },
  {
    name: 'User.Read.All',
    description: 'Read user profiles, licenses, and authentication methods',
    icon: <Users className="w-4 h-4" />,
    scope: 'Application',
  },
  {
    name: 'Group.Read.All',
    description: 'Read group memberships and properties',
    icon: <Users className="w-4 h-4" />,
    scope: 'Application',
  },
  {
    name: 'Organization.Read.All',
    description: 'Read tenant and organization information',
    icon: <Building2 className="w-4 h-4" />,
    scope: 'Application',
  },
];

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Animated step indicator for the wizard
 */
const StepIndicator: React.FC<{
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
}> = ({ steps, currentStep, completedSteps }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              transition-all duration-500 transform
              ${
                completedSteps.has(index)
                  ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-100 shadow-lg shadow-green-500/30'
                  : index === currentStep
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 shadow-lg shadow-blue-500/40 ring-4 ring-blue-200 dark:ring-blue-800'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 scale-90'
              }
            `}
          >
            {completedSteps.has(index) ? (
              <Check className="w-6 h-6" />
            ) : (
              <span className="text-sm font-bold">{index + 1}</span>
            )}
          </div>
          <span
            className={`
              mt-2 text-xs font-medium transition-colors duration-300
              ${
                index === currentStep
                  ? 'text-blue-600 dark:text-blue-400'
                  : completedSteps.has(index)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
            `}
          >
            {step.title}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`
              w-16 h-1 mx-2 rounded-full transition-all duration-500
              ${
                completedSteps.has(index)
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : index < currentStep
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }
            `}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

/**
 * Connectivity status card with animated indicators
 */
const ConnectivityCard: React.FC<{
  status: ConnectivityStatus;
  onRefresh: () => void;
  isRefreshing: boolean;
}> = ({ status, onRefresh, isRefreshing }) => {
  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <LoadingSpinner size="sm" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'connected':
        return 'border-green-500/30 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'border-red-500/30 bg-red-50 dark:bg-red-900/20';
      case 'checking':
        return 'border-blue-500/30 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  const services = [
    { key: 'internet', label: 'Internet', icon: <Globe className="w-4 h-4" />, status: status.internet },
    { key: 'graph', label: 'Microsoft Graph', icon: <Cloud className="w-4 h-4" />, status: status.graph },
    { key: 'azure', label: 'Azure AD', icon: <Shield className="w-4 h-4" />, status: status.azure },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-500" />
          Connectivity Status
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          loading={isRefreshing}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.key}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${getStatusColor(service.status)}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">{service.icon}</span>
              {getStatusIcon(service.status)}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{service.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
              {service.status === 'unknown' ? 'Not checked' : service.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Permission card with hover effects
 */
const PermissionCard: React.FC<{
  permission: typeof REQUIRED_PERMISSIONS[0];
  index: number;
}> = ({ permission, index }) => (
  <div
    className="
      group p-4 rounded-lg border border-gray-200 dark:border-gray-700
      bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
      hover:border-blue-300 dark:hover:border-blue-600
      hover:shadow-lg hover:shadow-blue-500/10
      transition-all duration-300 transform hover:-translate-y-1
    "
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
        {permission.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white">{permission.name}</p>
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
            {permission.scope}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{permission.description}</p>
      </div>
    </div>
  </div>
);

/**
 * Format duration for display (short format for step durations)
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toFixed(0)}s`;
  }
};

/**
 * Format elapsed time for display (full format for total time)
 */
const formatElapsedTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Elapsed time display component with live updating
 */
const ElapsedTimeDisplay: React.FC<{
  startTime: number | null;
  endTime: number | null;
  isRunning: boolean;
}> = ({ startTime, endTime, isRunning }) => {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }
    
    // If we have an end time, show the final duration
    if (endTime) {
      setElapsed(endTime - startTime);
      return;
    }
    
    // If running, update every second
    if (isRunning) {
      const updateElapsed = () => setElapsed(Date.now() - startTime);
      updateElapsed(); // Initial update
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime, isRunning]);
  
  if (!startTime && elapsed === 0) return null;
  
  return (
    <div className="flex items-center justify-center gap-2 mb-4 py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {isRunning && !endTime ? 'Elapsed Time:' : 'Total Time:'}
      </span>
      <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
        {formatElapsedTime(elapsed)}
      </span>
      {isRunning && !endTime && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      )}
    </div>
  );
};

/**
 * Progress step visualization - compact view for 12 steps with auto-scroll
 */
const ProgressStepCard: React.FC<{
  steps: ProgressStep[];
  currentStepIndex: number;
}> = ({ steps, currentStepIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-scroll to the current in-progress step
  useEffect(() => {
    if (currentStepIndex >= 0 && stepRefs.current[currentStepIndex]) {
      stepRefs.current[currentStepIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentStepIndex]);

  return (
  <div ref={containerRef} className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scroll-smooth">
    {steps.map((step, index) => (
      <div
        key={step.id}
        ref={(el) => { stepRefs.current[index] = el; }}
        className={`
          flex items-center gap-3 p-3 rounded-lg transition-all duration-300
          ${
            step.status === 'in_progress'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-sm'
              : step.status === 'completed'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : step.status === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60'
          }
        `}
      >
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${
              step.status === 'completed'
                ? 'bg-green-500 text-white'
                : step.status === 'in_progress'
                ? 'bg-blue-500 text-white'
                : step.status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }
          `}
        >
          {step.status === 'completed' ? (
            <Check className="w-4 h-4" />
          ) : step.status === 'in_progress' ? (
            <LoadingSpinner size="sm" />
          ) : step.status === 'error' ? (
            <X className="w-4 h-4" />
          ) : (
            <span className="text-xs font-bold">{index + 1}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`
                text-sm font-medium truncate
                ${
                  step.status === 'completed'
                    ? 'text-green-700 dark:text-green-300'
                    : step.status === 'in_progress'
                    ? 'text-blue-700 dark:text-blue-300'
                    : step.status === 'error'
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              {step.label}
            </p>
            {/* Show duration for completed steps */}
            {step.status === 'completed' && step.duration !== undefined && (
              <span className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                {formatDuration(step.duration)}
              </span>
            )}
          </div>
          {step.status === 'in_progress' && step.message && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">{step.message}</p>
          )}
          {step.status === 'error' && step.message && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate">{step.message}</p>
          )}
        </div>

        <div className="w-12 text-right flex-shrink-0">
          <span
            className={`
              text-xs font-medium
              ${
                step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'in_progress'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400'
              }
            `}
          >
            {step.percentage}%
          </span>
        </div>
      </div>
    ))}
  </div>
  );
};

/**
 * Credential display with secure masking
 */
const CredentialDisplay: React.FC<{
  credentials: CredentialSummary;
  showDetails: boolean;
  onToggleDetails: () => void;
  onCopy: (text: string) => void;
}> = ({ credentials, showDetails, onToggleDetails, onCopy }) => {
  const maskValue = (value: string, showFirst = 4, showLast = 4) => {
    if (!value || value.length <= showFirst + showLast + 4) return value;
    return `${value.slice(0, showFirst)}${'*'.repeat(8)}${value.slice(-showLast)}`;
  };

  const fields = [
    { label: 'Tenant ID', value: credentials.tenantId },
    { label: 'Client ID', value: credentials.clientId },
    { label: 'Domain', value: credentials.domain },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Credential Details</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDetails}
          icon={showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        >
          {showDetails ? 'Hide' : 'Show'}
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-24">{field.label}:</span>
            <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200">
              {showDetails ? field.value : maskValue(field.value)}
            </code>
            <Button variant="ghost" size="sm" onClick={() => onCopy(field.value)} icon={<Copy className="w-4 h-4" />} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Clock className="w-4 h-4" />
        <span>Created: {credentials.created}</span>
        {credentials.expiresAt && (
          <>
            <span className="mx-2">•</span>
            <span>Expires: {credentials.expiresAt}</span>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Confirmation Dialog Component
// ============================================================================

const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyName: string;
  showWindow: boolean;
  autoInstallModules: boolean;
  skipAzureRoles: boolean;
  secretValidityYears: number;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  showWindow,
  autoInstallModules,
  skipAzureRoles,
  secretValidityYears,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm App Registration" size="md">
      <div className="space-y-6">
        {/* Summary Header */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Review Your Settings</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Please confirm the following settings before proceeding. A browser window will open for Azure authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Configuration Summary
            </h3>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Company Name */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Company Name</span>
              <span className="font-medium text-gray-900 dark:text-white">{companyName}</span>
            </div>

            {/* Credential Storage Path */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Credentials Path</span>
              <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                C:\DiscoveryData\{companyName}\Credentials
              </code>
            </div>

            {/* Secret Validity */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Secret Validity</span>
              <span className="font-medium text-gray-900 dark:text-white">{secretValidityYears} year{secretValidityYears !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Options Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Options
            </h3>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {showWindow ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm ${showWindow ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Show PowerShell Window
              </span>
            </div>

            <div className="flex items-center gap-3">
              {autoInstallModules ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm ${autoInstallModules ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Auto-Install Required Modules
              </span>
            </div>

            <div className="flex items-center gap-3">
              {skipAzureRoles ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm ${skipAzureRoles ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Skip Azure Role Assignments
              </span>
            </div>
          </div>
        </div>

        {/* Authentication Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Global Admin Required</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                After clicking "Confirm & Launch", a browser window will open for Microsoft authentication.
                You must sign in with a <strong>Global Administrator</strong> account to create the app registration.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            icon={<Play className="w-4 h-4" />}
          >
            Confirm & Launch
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const SetupCompanyView: React.FC = () => {
  console.log('[SetupCompanyView] Component rendering');

  // Get selected profile from store
  const selectedSourceProfile = useProfileStore((state: { selectedSourceProfile: import('../../store/useProfileStore').CompanyProfile | null }) => state.selectedSourceProfile);

  // App registration hook
  const {
    state: appRegState,
    launchAppRegistration,
    checkExistingCredentials,
    importExistingCredentials,
    stopMonitoring,
    reset: resetAppRegistration
  } = useAppRegistration();

  console.log('[SetupCompanyView] App registration state:', appRegState);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state - default company name to selected profile's company name
  const [companyName, setCompanyName] = useState(selectedSourceProfile?.companyName || '');
  const [tenantId, setTenantId] = useState('');
  const [showWindow, setShowWindow] = useState(true);
  const [autoInstallModules, setAutoInstallModules] = useState(true);
  const [secretValidityYears, setSecretValidityYears] = useState(2);
  const [skipAzureRoles, setSkipAzureRoles] = useState(false);

  // Connectivity state
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>({
    internet: 'unknown',
    graph: 'unknown',
    azure: 'unknown',
  });
  const [isCheckingConnectivity, setIsCheckingConnectivity] = useState(false);

  // Existing credentials check
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);

  // Domain credentials state
  const [showDomainCredDialog, setShowDomainCredDialog] = useState(false);
  const [domainCredStatus, setDomainCredStatus] = useState<{
    hasCredentials: boolean;
    username?: string;
    validationStatus?: 'valid' | 'invalid' | 'unknown';
    lastValidated?: string;
    validationError?: string;
  } | null>(null);

  // Progress steps - driven by appRegState.currentStep from the PowerShell script's status file
  const progressSteps: ProgressStep[] = useMemo(() => {
    // Find the current step index in REGISTRATION_STEPS
    const currentStepIndex = appRegState.currentStep
      ? REGISTRATION_STEPS.findIndex(s => s.id === appRegState.currentStep)
      : -1;
    
    // Calculate percentage based on current step (12 steps total)
    const totalSteps = REGISTRATION_STEPS.length;
    
    return REGISTRATION_STEPS.map((step, index) => {
      let status: ProgressStep['status'] = 'pending';
      let message: string | undefined = undefined;
      
      // Determine status based on current step
      if (appRegState.success) {
        // All steps completed on success
        status = 'completed';
        message = step.description;
      } else if (appRegState.error) {
        // Mark steps up to current as completed, current as error
        if (index < currentStepIndex) {
          status = 'completed';
          message = step.description;
        } else if (index === currentStepIndex) {
          status = 'error';
          message = appRegState.error;
        }
      } else if (appRegState.isRunning || appRegState.isMonitoring) {
        // Active registration - use currentStep from status file
        if (index < currentStepIndex) {
          status = 'completed';
          message = step.description;
        } else if (index === currentStepIndex) {
          status = 'in_progress';
          // Use the actual message from the PowerShell script's status file
          message = appRegState.registrationStatus?.message || appRegState.progress || step.description;
        }
      }
      
      // Calculate percentage for this step (evenly distributed)
      const percentage = Math.round(((index + 1) / totalSteps) * 100);
      
      // Get duration for completed steps from stepDurations
      const duration = appRegState.stepDurations?.[step.id];
      
      return {
        id: step.id,
        label: step.label,
        status,
        percentage,
        message,
        duration: status === 'completed' ? duration : undefined,
      };
    });
  }, [appRegState]);

  // Credential state
  const [credentials, setCredentials] = useState<CredentialSummary | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Derived state from hook
  const isRunning = appRegState.isRunning || appRegState.isMonitoring;
  const error = appRegState.error;
  const success = appRegState.success;
  
  // Calculate progress based on current step from status file
  const progress = useMemo(() => {
    if (appRegState.success) return 100;
    if (!appRegState.currentStep) return 0;
    
    // Use progress from status file if available
    if (appRegState.registrationStatus?.progress !== undefined) {
      return appRegState.registrationStatus.progress;
    }
    
    // Fall back to calculating from step index
    const stepIndex = REGISTRATION_STEPS.findIndex(s => s.id === appRegState.currentStep);
    if (stepIndex === -1) return 0;
    return Math.round(((stepIndex + 1) / REGISTRATION_STEPS.length) * 100);
  }, [appRegState.success, appRegState.currentStep, appRegState.registrationStatus?.progress]);

  // Wizard steps definition
  const wizardSteps: WizardStep[] = useMemo(
    () => [
      {
        id: 'welcome',
        title: 'Welcome',
        description: 'Get started with Azure integration',
        icon: <Sparkles className="w-6 h-6" />,
      },
      {
        id: 'connectivity',
        title: 'Connectivity',
        description: 'Check cloud service connections',
        icon: <Globe className="w-6 h-6" />,
      },
      {
        id: 'company',
        title: 'Company',
        description: 'Enter organization details',
        icon: <Building2 className="w-6 h-6" />,
      },
      {
        id: 'permissions',
        title: 'Permissions',
        description: 'Review required access',
        icon: <Shield className="w-6 h-6" />,
      },
      {
        id: 'setup',
        title: 'Setup',
        description: 'Create app registration',
        icon: <Zap className="w-6 h-6" />,
      },
    ],
    []
  );

  // Check connectivity
  const checkConnectivity = useCallback(async () => {
    console.log('[SetupCompanyView] checkConnectivity called');
    setIsCheckingConnectivity(true);
    setConnectivity({ internet: 'checking', graph: 'checking', azure: 'checking' });

    // Check internet
    try {
      const online = navigator.onLine;
      setConnectivity((prev) => ({ ...prev, internet: online ? 'connected' : 'failed' }));
    } catch {
      setConnectivity((prev) => ({ ...prev, internet: 'failed' }));
    }

    // Check Graph API (simulated for now)
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      // In real implementation, use fetch to graph.microsoft.com
      setConnectivity((prev) => ({ ...prev, graph: 'connected' }));
    } catch {
      setConnectivity((prev) => ({ ...prev, graph: 'failed' }));
    }

    // Check Azure AD (simulated for now)
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      setConnectivity((prev) => ({ ...prev, azure: 'connected' }));
    } catch {
      setConnectivity((prev) => ({ ...prev, azure: 'failed' }));
    }

    setIsCheckingConnectivity(false);
  }, []);

  // Validate tenant ID format
  const validateTenantId = useCallback((id: string): boolean => {
    if (!id) return true; // Empty is valid (optional field)
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.onmicrosoft\.com$/i;
    return guidRegex.test(id) || domainRegex.test(id);
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Navigate wizard
  const nextStep = useCallback(() => {
    if (currentStep < wizardSteps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, wizardSteps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Check for existing credentials when company name changes
  useEffect(() => {
    if (companyName.trim()) {
      checkExistingCredentials(companyName.trim())
        .then(setHasExistingCredentials);
    } else {
      setHasExistingCredentials(false);
    }
  }, [companyName, checkExistingCredentials]);

  // Show confirmation dialog before starting
  const showConfirmDialog = useCallback(() => {
    if (!companyName.trim()) {
      return;
    }
    setShowConfirmation(true);
  }, [companyName]);

  // Actually launch the setup after confirmation
  const confirmAndLaunch = useCallback(() => {
    console.log('[SetupCompanyView] confirmAndLaunch called');
    console.log('[SetupCompanyView] Company name:', companyName);
    console.log('[SetupCompanyView] Options:', { showWindow, autoInstallModules, secretValidityYears, skipAzureRoles });
    setShowConfirmation(false);

    // Launch the real PowerShell script via the hook
    launchAppRegistration({
      companyName: companyName.trim(),
      showWindow,
      autoInstallModules,
      secretValidityYears,
      skipAzureRoles
    });
  }, [companyName, showWindow, autoInstallModules, secretValidityYears, skipAzureRoles, launchAppRegistration]);

  // Handle import existing credentials
  const handleImportExisting = useCallback(() => {
    if (companyName.trim()) {
      importExistingCredentials(companyName.trim());
    }
  }, [companyName, importExistingCredentials]);

  // Cancel/stop the process
  const handleCancel = useCallback(() => {
    stopMonitoring();
  }, [stopMonitoring]);

  // Reset form
  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setCompanyName('');
    setTenantId('');
    setShowWindow(true);
    setAutoInstallModules(true);
    setSecretValidityYears(2);
    setSkipAzureRoles(false);
    setCredentials(null);
    setHasExistingCredentials(false);
    resetAppRegistration();
  }, [resetAppRegistration]);

  // Domain credential handlers
  const handleSaveDomainCredentials = useCallback(async (credentials: { username: string; password: string }) => {
    if (!selectedSourceProfile) return;
    await window.electronAPI.profile.saveDomainCredentials(
      selectedSourceProfile.id,
      credentials.username,
      credentials.password
    );
    // Reload status after save
    const status = await window.electronAPI.profile.getDomainCredentialStatus(selectedSourceProfile.id);
    setDomainCredStatus(status);
  }, [selectedSourceProfile]);

  const handleClearDomainCredentials = useCallback(async () => {
    if (!selectedSourceProfile) return;
    await window.electronAPI.profile.clearDomainCredentials(selectedSourceProfile.id);
    // Reload status after clear
    const status = await window.electronAPI.profile.getDomainCredentialStatus(selectedSourceProfile.id);
    setDomainCredStatus(status);
  }, [selectedSourceProfile]);

  const handleTestDomainCredentials = useCallback(async (credentials: { username: string; password: string }) => {
    if (!selectedSourceProfile) {
      return { valid: false, error: 'No profile selected' };
    }
    // Test the credentials with provided values (without saving first)
    const result = await window.electronAPI.profile.testDomainCredentialsWithValues(credentials.username, credentials.password);
    return result;
  }, [selectedSourceProfile]);

  // Update company name when selected profile changes
  useEffect(() => {
    if (selectedSourceProfile?.companyName) {
      console.log('[SetupCompanyView] Updating company name from profile:', selectedSourceProfile.companyName);
      setCompanyName(selectedSourceProfile.companyName);
    }
  }, [selectedSourceProfile]);

  // Load domain credential status when profile changes
  useEffect(() => {
    if (selectedSourceProfile) {
      window.electronAPI.profile.getDomainCredentialStatus(selectedSourceProfile.id)
        .then(setDomainCredStatus)
        .catch(err => console.error('[SetupCompanyView] Failed to load domain credential status:', err));
    }
  }, [selectedSourceProfile]);

  // Check connectivity on mount
  useEffect(() => {
    console.log('[SetupCompanyView] useEffect - Component mounted, checking connectivity');
    checkConnectivity();
    return () => {
      console.log('[SetupCompanyView] useEffect cleanup - Component unmounting');
    };
  }, [checkConnectivity]);

  // Can proceed check
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Connectivity
        return connectivity.internet === 'connected';
      case 2: // Company
        return companyName.trim().length > 0 && validateTenantId(tenantId);
      case 3: // Permissions
        return true;
      case 4: // Setup
        return !isRunning;
      default:
        return false;
    }
  }, [currentStep, connectivity, companyName, tenantId, validateTenantId, isRunning]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Cloud className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Enterprise Discovery & Migration Suite
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              This wizard will guide you through creating an Azure App Registration for your M&A transaction
              and configuring the necessary <strong>Active Directory credentials</strong> and
              <strong>Azure credentials</strong> for comprehensive discovery and migration operations.
              You'll need <strong>Global Administrator</strong> or <strong>Application Administrator</strong> permissions in Azure AD,
              and appropriate Active Directory permissions for seamless integration.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
              {[
                { icon: <Shield className="w-8 h-8" />, label: 'Secure', desc: 'AES-256 encrypted credentials' },
                { icon: <Zap className="w-8 h-8" />, label: 'Fast', desc: 'Automated setup in minutes' },
                { icon: <Lock className="w-8 h-8" />, label: 'Compliant', desc: 'GDPR/CCPA ready' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 1: // Connectivity
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check Connectivity
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ensure all required cloud services are accessible before proceeding.
              </p>
            </div>

            <ConnectivityCard
              status={connectivity}
              onRefresh={checkConnectivity}
              isRefreshing={isCheckingConnectivity}
            />

            {connectivity.internet === 'failed' && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">No Internet Connection</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Please check your network connection and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Company
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Company Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your organization details for the app registration.
              </p>
            </div>

            <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
                fullWidth
                startIcon={<Building2 className="w-4 h-4" />}
                helperText="Used to organize credentials in C:\DiscoveryData\[CompanyName]"
                data-cy="company-name-input"
              />

              <Input
                label="Tenant ID"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx or domain.onmicrosoft.com"
                fullWidth
                startIcon={<Globe className="w-4 h-4" />}
                error={tenantId && !validateTenantId(tenantId) ? 'Invalid format' : undefined}
                helperText="Leave blank to select tenant during authentication"
                data-cy="tenant-id-input"
              />

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Options</h4>

                <div className="space-y-4">
                  <Checkbox
                    label="Show PowerShell Window"
                    checked={showWindow}
                    onChange={setShowWindow}
                    description="Recommended for first-time setup to see authentication prompts"
                  />

                  <Checkbox
                    label="Auto-Install Required Modules"
                    checked={autoInstallModules}
                    onChange={setAutoInstallModules}
                    description="Automatically install Microsoft.Graph and required PowerShell modules"
                  />

                  <Checkbox
                    label="Skip Azure Role Assignments"
                    checked={skipAzureRoles}
                    onChange={setSkipAzureRoles}
                    description="For limited admin access - skip assigning Azure AD roles"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client Secret Validity (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={secretValidityYears}
                      onChange={(e) => setSecretValidityYears(parseInt(e.target.value) || 2)}
                      className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Microsoft recommends maximum 2 years
                    </p>
                  </div>
                </div>
              </div>

              {/* Domain Credentials Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Domain Authentication
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure credentials for Active Directory and on-premises discovery modules.
                </p>

                {domainCredStatus?.hasCredentials && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Domain credentials configured
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Username: {domainCredStatus.username}
                      {domainCredStatus.validationStatus === 'valid' && (
                        <span className="ml-2 text-green-600">✓ Validated</span>
                      )}
                      {domainCredStatus.validationStatus === 'invalid' && (
                        <span className="ml-2 text-red-600">✗ Invalid</span>
                      )}
                    </p>
                  </div>
                )}

                <Button
                  variant="secondary"
                  onClick={() => setShowDomainCredDialog(true)}
                  icon={<Shield className="w-4 h-4" />}
                  data-cy="configure-domain-credentials-button"
                >
                  {domainCredStatus?.hasCredentials ? 'Update' : 'Configure'} Domain Credentials
                </Button>
              </div>
            </div>
          </div>
        );

      case 3: // Permissions
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Required Permissions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The following Microsoft Graph API permissions will be requested.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {REQUIRED_PERMISSIONS.map((permission, index) => (
                <PermissionCard key={permission.name} permission={permission} index={index} />
              ))}
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Administrator Consent Required</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    These permissions require admin consent. You'll be prompted to sign in with an administrator account
                    during the setup process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Setup
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {success ? 'Setup Complete!' : 'Create App Registration'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {success
                  ? 'Your Azure App Registration has been created successfully and credentials have been imported.'
                  : 'Ready to create the Azure App Registration for ' + companyName}
              </p>
            </div>

            {/* Existing Credentials Warning */}
            {hasExistingCredentials && !success && !isRunning && (
              <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Existing Credentials Found</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      App registration credentials already exist for "{companyName}". You can import them or create new ones.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleImportExisting}
                      className="mt-2"
                    >
                      Import Existing Credentials
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetAppRegistration}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {success ? (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">App Registration Complete</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Credentials have been securely stored and imported into your profile.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total elapsed time display */}
                <ElapsedTimeDisplay
                  startTime={appRegState.startTime}
                  endTime={appRegState.endTime}
                  isRunning={false}
                />

                <ProgressStepCard steps={progressSteps} currentStepIndex={REGISTRATION_STEPS.length - 1} />

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="secondary" onClick={resetForm} icon={<RefreshCw className="w-4 h-4" />}>
                    Create Another
                  </Button>
                  <Button
                    variant="primary"
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open('https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps')}
                  >
                    View in Azure Portal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Elapsed time display - shows during registration and after completion/error */}
                <ElapsedTimeDisplay
                  startTime={appRegState.startTime}
                  endTime={appRegState.endTime}
                  isRunning={isRunning}
                />

                <ProgressStepCard 
                  steps={progressSteps} 
                  currentStepIndex={appRegState.currentStep 
                    ? REGISTRATION_STEPS.findIndex(s => s.id === appRegState.currentStep) 
                    : 0
                  } 
                />

                {isRunning && (
                  <div className="mt-6">
                    <ProgressBar value={progress} max={100} variant="info" size="lg" animated striped />
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {appRegState.progress || 'Processing...'}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-4 mt-8">
                  {isRunning ? (
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={handleCancel}
                      icon={<StopCircle className="w-5 h-5" />}
                      className="px-8"
                    >
                      Cancel
                    </Button>
                  ) : !error && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={showConfirmDialog}
                      icon={<Play className="w-5 h-5" />}
                      className="px-8"
                    >
                      Start App Registration
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950" data-cy="setup-company-view" data-testid="setup-company-view">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmAndLaunch}
        companyName={companyName}
        showWindow={showWindow}
        autoInstallModules={autoInstallModules}
        skipAzureRoles={skipAzureRoles}
        secretValidityYears={secretValidityYears}
      />

      {/* Domain Credentials Dialog */}
      <DomainCredentialsDialog
        isOpen={showDomainCredDialog}
        onClose={() => setShowDomainCredDialog(false)}
        onSave={handleSaveDomainCredentials}
        onClear={handleClearDomainCredentials}
        onTest={handleTestDomainCredentials}
        profile={selectedSourceProfile ? {
          id: selectedSourceProfile.id,
          companyName: selectedSourceProfile.companyName
        } : null}
        credentialStatus={domainCredStatus || undefined}
        data-cy="domain-credentials-dialog"
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Azure Integration Setup</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure credentials for automated discovery</p>
            </div>
          </div>
          <Button variant="secondary" onClick={resetForm} icon={<RefreshCw className="w-4 h-4" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Step indicator */}
          <StepIndicator steps={wizardSteps} currentStep={currentStep} completedSteps={completedSteps} />

          {/* Step content */}
          <div className="min-h-[500px]">{renderStepContent()}</div>

          {/* Navigation */}
          {!success && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 0 || isRunning}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {wizardSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${index === currentStep ? 'w-8 bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                    `}
                  />
                ))}
              </div>

              {currentStep < wizardSteps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={nextStep}
                  disabled={!canProceed}
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="trailing"
                >
                  Continue
                </Button>
              ) : (
                <div className="w-24" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupCompanyView;



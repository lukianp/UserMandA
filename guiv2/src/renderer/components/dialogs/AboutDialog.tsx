/**
 * About Dialog Component
 * Displays application information, version, and license details
 */

import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Info } from 'lucide-react';

import { Button } from '../atoms/Button';

export interface AboutDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Application name */
  appName?: string;
  /** Application version */
  version?: string;
  /** Copyright information */
  copyright?: string;
  /** License information */
  license?: string;
  /** Additional information */
  description?: string;
  /** Logo image URL */
  logoUrl?: string;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * About Dialog Component
 */
const AboutDialog: React.FC<AboutDialogProps> = ({
  isOpen,
  onClose,
  appName = 'Enterprise Discovery Suite',
  version = '2.0.0',
  copyright = `© ${new Date().getFullYear()} Enterprise Discovery Suite. All Rights Reserved`,
  license = 'Enterprise License',
  description = 'M&A Intelligence & Integration Platform - Accelerating Due Diligence and Post-Merger Integration',
  logoUrl,
  'data-cy': dataCy = 'about-dialog',
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                About
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-about-btn"
              aria-label="Close dialog"
              title="Close"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Logo */}
            {logoUrl ? (
              <div className="flex justify-center">
                <img
                  src={logoUrl}
                  alt={`${appName} Logo`}
                  className="h-20 w-auto"
                  data-cy="about-logo"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white tracking-tight">EDS</span>
                </div>
              </div>
            )}

            {/* Application Info */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {appName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Version {version}
              </p>
              {description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 pt-2">
                  {description}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Details */}
            <div className="space-y-4">
              {/* Copyright */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Copyright
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {copyright}
                </p>
              </div>

              {/* License */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  License
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {license}
                </p>
              </div>

              {/* Build Info */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Build Information
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Electron:</span>
                    <span className="font-mono">{process.versions.electron || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chrome:</span>
                    <span className="font-mono">{process.versions.chrome || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Node.js:</span>
                    <span className="font-mono">{process.versions.node || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>V8:</span>
                    <span className="font-mono">{process.versions.v8 || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  System
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Platform:</span>
                    <span className="font-mono">{process.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Architecture:</span>
                    <span className="font-mono">{process.arch}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center p-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="primary" onClick={onClose} data-cy="close-about-dialog-btn">
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AboutDialog;



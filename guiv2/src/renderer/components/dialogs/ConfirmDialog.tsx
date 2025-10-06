/**
 * Confirm Dialog Component
 * Generic confirmation modal with customizable actions
 */

import React from 'react';
import { Dialog } from '@headlessui/react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface ConfirmDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Confirm action handler */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Confirmation message */
  message: string;
  /** Variant affects icon and confirm button style */
  variant?: 'danger' | 'warning' | 'info' | 'success';
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Show loading state on confirm */
  loading?: boolean;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Confirm Dialog Component
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  'data-cy': dataCy = 'confirm-dialog',
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  // Variant configurations
  const variantConfig = {
    danger: {
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      buttonVariant: 'primary' as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      buttonVariant: 'primary' as const,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-start gap-4 p-6">
            <div className={`flex-shrink-0 p-3 rounded-full ${config.bgColor}`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </Dialog.Description>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-confirm-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              data-cy="cancel-confirm-btn"
            >
              {cancelText}
            </Button>
            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              loading={loading}
              data-cy="confirm-btn"
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;

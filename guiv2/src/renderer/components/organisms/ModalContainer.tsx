/**
 * ModalContainer Component
 *
 * Global modal container that renders all active modals from the modal store.
 * Dynamically imports and renders the appropriate dialog component based on modal type.
 */

import React, { lazy, Suspense } from 'react';
import { useModalStore } from '../../store/useModalStore';
import { Spinner } from '../atoms/Spinner';

// Lazy load dialog components
const CreateProfileDialog = lazy(() => import('../dialogs/CreateProfileDialog'));
const EditProfileDialog = lazy(() => import('../dialogs/EditProfileDialog'));
const DeleteConfirmationDialog = lazy(() => import('../dialogs/DeleteConfirmationDialog'));
const ConfirmDialog = lazy(() => import('../dialogs/ConfirmDialog'));
const ExportDialog = lazy(() => import('../dialogs/ExportDialog'));
const ImportDialog = lazy(() => import('../dialogs/ImportDialog'));
const ColumnVisibilityDialog = lazy(() => import('../dialogs/ColumnVisibilityDialog'));
const WaveSchedulingDialog = lazy(() => import('../dialogs/WaveSchedulingDialog'));
const SettingsDialog = lazy(() => import('../dialogs/SettingsDialog'));
const AboutDialog = lazy(() => import('../dialogs/AboutDialog'));

/**
 * Loading fallback for lazy-loaded dialogs
 */
const DialogLoadingFallback: React.FC = () => (
  <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl">
      <Spinner size="lg" label="Loading dialog..." />
    </div>
  </div>
);

/**
 * Modal Container Component
 */
export const ModalContainer: React.FC = () => {
  const { modals, closeModal } = useModalStore();

  if (modals.length === 0) {
    return null;
  }

  return (
    <>
      {modals.map((modal) => {
        const handleClose = () => {
          if (modal.dismissable) {
            closeModal(modal.id);
          }
        };

        const handleConfirm = (result?: any) => {
          closeModal(modal.id, result);
        };

        // Render the appropriate dialog component based on type
        const renderDialog = () => {
          switch (modal.type) {
            case 'createProfile':
              return (
                <CreateProfileDialog
                  isOpen={true}
                  onClose={handleClose}
                  onSave={async (profile) => {
                    if (modal.onConfirm) {
                      modal.onConfirm(profile);
                    }
                    closeModal(modal.id, profile);
                  }}
                  data-cy="modal-create-profile"
                />
              );

            case 'editProfile':
              return (
                <EditProfileDialog
                  isOpen={true}
                  onClose={handleClose}
                  onSave={async (profile) => {
                    if (modal.onConfirm) {
                      modal.onConfirm(profile);
                    }
                    closeModal(modal.id, profile);
                  }}
                  profile={modal.data?.profile}
                  onTestConnection={modal.data?.onTestConnection}
                  data-cy="modal-edit-profile"
                />
              );

            case 'deleteConfirm':
              return (
                <DeleteConfirmationDialog
                  isOpen={true}
                  onClose={handleClose}
                  onConfirm={async () => {
                    if (modal.onConfirm) {
                      await modal.onConfirm();
                    }
                    closeModal(modal.id, true);
                  }}
                  title={modal.title}
                  message={modal.data?.message || 'Are you sure you want to delete this item?'}
                  itemName={modal.data?.itemName}
                  data-cy="modal-delete-confirm"
                />
              );

            case 'warning':
            case 'error':
            case 'success':
            case 'info':
              return (
                <ConfirmDialog
                  isOpen={true}
                  onClose={handleClose}
                  onConfirm={async () => {
                    if (modal.onConfirm) {
                      await modal.onConfirm();
                    }
                    closeModal(modal.id, true);
                  }}
                  title={modal.title}
                  message={modal.data?.message || ''}
                  variant={modal.type === 'warning' ? 'warning' : modal.type === 'error' ? 'danger' : modal.type === 'success' ? 'success' : 'info'}
                  confirmText={modal.data?.confirmText || 'OK'}
                  cancelText={modal.data?.cancelText}
                  data-cy={`modal-${modal.type}`}
                />
              );

            case 'exportData':
              return (
                <ExportDialog
                  isOpen={true}
                  onClose={handleClose}
                  onExport={async (options) => {
                    if (modal.onConfirm) {
                      await modal.onConfirm(options);
                    }
                    closeModal(modal.id, options);
                  }}
                  data={modal.data?.data}
                  availableFormats={modal.data?.availableFormats}
                  data-cy="modal-export"
                />
              );

            case 'importData':
              return (
                <ImportDialog
                  isOpen={true}
                  onClose={handleClose}
                  onImport={async (data) => {
                    if (modal.onConfirm) {
                      await modal.onConfirm(data);
                    }
                    closeModal(modal.id, data);
                  }}
                  acceptedFormats={modal.data?.acceptedFormats}
                  data-cy="modal-import"
                />
              );

            case 'columnVisibility':
              return (
                <ColumnVisibilityDialog
                  isOpen={true}
                  onClose={handleClose}
                  columns={modal.data?.columns || []}
                  onApply={(selectedColumns) => {
                    if (modal.onConfirm) {
                      modal.onConfirm(selectedColumns);
                    }
                    closeModal(modal.id, selectedColumns);
                  }}
                  data-cy="modal-column-visibility"
                />
              );

            case 'waveScheduling':
              return (
                <WaveSchedulingDialog
                  isOpen={true}
                  onClose={handleClose}
                  onSchedule={async (scheduleData) => {
                    if (modal.onConfirm) {
                      await modal.onConfirm(scheduleData);
                    }
                    closeModal(modal.id, scheduleData);
                  }}
                  wave={modal.data?.wave}
                  data-cy="modal-wave-scheduling"
                />
              );

            case 'settings':
              return (
                <SettingsDialog
                  isOpen={true}
                  onClose={handleClose}
                  data-cy="modal-settings"
                />
              );

            case 'about':
              return (
                <AboutDialog
                  isOpen={true}
                  onClose={handleClose}
                  data-cy="modal-about"
                />
              );

            case 'custom':
              // For custom modals, render the component passed in data
              if (modal.data?.Component) {
                const CustomComponent = modal.data.Component;
                return (
                  <CustomComponent
                    isOpen={true}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    {...modal.data.props}
                  />
                );
              }
              return null;

            default:
              return null;
          }
        };

        return (
          <Suspense key={modal.id} fallback={<DialogLoadingFallback />}>
            {renderDialog()}
          </Suspense>
        );
      })}
    </>
  );
};

export default ModalContainer;

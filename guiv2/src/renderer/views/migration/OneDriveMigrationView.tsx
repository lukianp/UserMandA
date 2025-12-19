/**
 * OneDrive Migration View
 *
 * OneDrive for Business content migration with:
 * - User OneDrive inventory with size and file counts
 * - Content filtering by date, type, size
 * - Incremental sync support
 * - Permission preservation
 * - Conflict resolution
 */

import React, { useState } from 'react';
import { HardDrive, Users, FileText, PlayCircle, Filter, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/atoms/Button';

export const OneDriveMigrationView: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [migrationOptions, setMigrationOptions] = useState({
    incrementalSync: true,
    preservePermissions: true,
    skipLargeFiles: false,
    largeSizeLimit: 15, // GB
    filterByDate: false,
    dateAfter: '',
  });

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'jdoe@contoso.com', sizeGB: 12.5, fileCount: 3420 },
    { id: '2', name: 'Jane Smith', email: 'jsmith@contoso.com', sizeGB: 45.2, fileCount: 8750 },
    { id: '3', name: 'Mike Johnson', email: 'mjohnson@contoso.com', sizeGB: 8.3, fileCount: 1250 },
  ];

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectedTotal = mockUsers
    .filter((u) => selectedUsers.includes(u.id))
    .reduce((sum, u) => sum + u.sizeGB, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
            <HardDrive size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OneDrive Migration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Migrate OneDrive for Business content
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={<PlayCircle size={18} />}
          disabled={selectedUsers.length === 0}
        >
          Start Migration
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedUsers.length} users selected - {selectedTotal.toFixed(1)} GB total
                </p>
              </div>
            )}
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={clsx(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    selectedUsers.includes(user.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{user.sizeGB} GB</p>
                      <p className="text-xs text-gray-500">{user.fileCount.toLocaleString()} files</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options Panel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Migration Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={migrationOptions.incrementalSync}
                  onChange={(e) =>
                    setMigrationOptions({ ...migrationOptions, incrementalSync: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Incremental Sync</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={migrationOptions.preservePermissions}
                  onChange={(e) =>
                    setMigrationOptions({ ...migrationOptions, preservePermissions: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Preserve Permissions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={migrationOptions.skipLargeFiles}
                  onChange={(e) =>
                    setMigrationOptions({ ...migrationOptions, skipLargeFiles: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Skip Large Files</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneDriveMigrationView;

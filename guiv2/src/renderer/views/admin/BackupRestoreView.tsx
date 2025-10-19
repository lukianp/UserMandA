import React from 'react';
import { Database, Download, Upload, Clock, FileText } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';

export const BackupRestoreView: React.FC = () => {
  const backupHistory = [
    { id: '1', date: new Date('2025-10-04T02:00:00'), size: '2.4 GB', type: 'Full', status: 'Success' },
    { id: '2', date: new Date('2025-10-03T02:00:00'), size: '2.3 GB', type: 'Full', status: 'Success' },
    { id: '3', date: new Date('2025-10-02T02:00:00'), size: '2.2 GB', type: 'Full', status: 'Success' },
  ];

  return (
    <div data-cy="backup-restore-view" className="flex flex-col h-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage database backups and restore operations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Create Backup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create a full backup of the current database
          </p>
          <Button variant="primary" icon={<Download />} className="w-full">
            Create Backup Now
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Restore from Backup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Restore database from a previous backup
          </p>
          <Button variant="secondary" icon={<Upload />} className="w-full">
            Select Backup File
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Backup History
          </h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {backupHistory.map((backup) => (
              <tr key={backup.id}>
                <td className="px-6 py-4">{(backup.date ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4">{backup.type}</td>
                <td className="px-6 py-4">{backup.size}</td>
                <td className="px-6 py-4">
                  <Badge variant="success">{backup.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Button size="sm" variant="secondary">Restore</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default BackupRestoreView;

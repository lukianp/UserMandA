/**
 * GroupDetailViewWrapper Component
 *
 * Wrapper component that extracts groupId from route params
 * and passes it to the GroupDetailView component.
 *
 * Epic 1 Task 1.4: Groups View Integration
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { GroupDetailView } from './GroupDetailView';

export const GroupDetailViewWrapper: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();

  if (!groupId) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">No group ID provided</p>
        </div>
      </div>
    );
  }

  return <GroupDetailView groupId={groupId} />;
};

export default GroupDetailViewWrapper;

/**
 * ComputerDetailViewWrapper Component
 *
 * Wrapper component that extracts computerId from route params
 * and passes it to the ComputerDetailView component.
 *
 * Epic 1 Task 1.3: Computers View Integration
 */

import React from 'react';
import { useParams } from 'react-router-dom';

import { ComputerDetailView } from './ComputerDetailView';

export const ComputerDetailViewWrapper: React.FC = () => {
  const { computerId } = useParams<{ computerId: string }>();

  if (!computerId) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">No computer ID provided</p>
        </div>
      </div>
    );
  }

  return <ComputerDetailView computerId={computerId} />;
};

export default ComputerDetailViewWrapper;

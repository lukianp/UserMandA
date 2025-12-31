/**
 * UserDetailViewWrapper Component
 *
 * Wrapper component that extracts userId from route params and passes it to UserDetailView.
 * This allows UserDetailView to be used both via routing and programmatically (e.g., from tabs).
 *
 * Epic 1 Task 1.2: UserDetailView Component
 */

import React from 'react';
import { useParams } from 'react-router-dom';

import UserDetailView from './UserDetailView';

/**
 * Wrapper that gets userId from URL parameters
 */
export const UserDetailViewWrapper: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Error: No user ID provided</p>
      </div>
    );
  }

  return <UserDetailView userId={decodeURIComponent(userId)} />;
};

export default UserDetailViewWrapper;



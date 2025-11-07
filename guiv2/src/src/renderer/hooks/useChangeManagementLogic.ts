import { useState, useCallback } from 'react';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'configuration' | 'deployment' | 'maintenance' | 'security' | 'infrastructure';
  requesterId: string;
  requesterName: string;
  assigneeId?: string;
  assigneeName?: string;
  reviewers: string[];
  approvers: string[];
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  impact: 'no_impact' | 'minor' | 'moderate' | 'significant' | 'severe';
  risk: 'low' | 'medium' | 'high' | 'very_high';
  rollbackPlan: string;
  testPlan: string;
  communicationPlan: string;
  attachments: string[];
  comments: ChangeComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'approval' | 'rejection';
}

export interface ChangeManagementLogicReturn {
  changeRequests: ChangeRequest[];
  filteredRequests: ChangeRequest[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  createRequest: (request: Omit<ChangeRequest, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRequest: (id: string, updates: Partial<ChangeRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  approveRequest: (id: string, comment?: string) => Promise<void>;
  rejectRequest: (id: string, comment?: string) => Promise<void>;
  startRequest: (id: string) => Promise<void>;
  completeRequest: (id: string, comment?: string) => Promise<void>;
  cancelRequest: (id: string, comment?: string) => Promise<void>;
  addComment: (requestId: string, comment: Omit<ChangeComment, 'id' | 'timestamp'>) => Promise<void>;
  assignRequest: (id: string, assigneeId: string, assigneeName: string) => Promise<void>;
  exportRequests: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useChangeManagementLogic(): ChangeManagementLogicReturn {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([
    {
      id: 'change-1',
      title: 'Update web server configuration',
      description: 'Update nginx configuration for improved performance and security',
      status: 'approved',
      priority: 'high',
      category: 'configuration',
      requesterId: 'user-123',
      requesterName: 'John Smith',
      assigneeId: 'user-456',
      assigneeName: 'Jane Doe',
      reviewers: ['user-789', 'user-101'],
      approvers: ['user-789'],
      plannedStartDate: new Date('2025-01-20'),
      plannedEndDate: new Date('2025-01-20'),
      actualStartDate: new Date('2025-01-20'),
      actualEndDate: new Date('2025-01-20'),
      impact: 'moderate',
      risk: 'low',
      rollbackPlan: 'Restore previous nginx configuration from backup',
      testPlan: 'Test website functionality and performance after deployment',
      communicationPlan: 'Notify development team and stakeholders via email',
      attachments: ['nginx-config-v2.conf', 'test-plan.pdf'],
      comments: [
        {
          id: 'comment-1',
          authorId: 'user-789',
          authorName: 'Bob Wilson',
          content: 'Approved for deployment. Ensure backup is taken before changes.',
          timestamp: new Date('2025-01-18'),
          type: 'approval',
        },
      ],
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      id: 'change-2',
      title: 'Database server maintenance',
      description: 'Apply security patches and optimize database performance',
      status: 'in_progress',
      priority: 'medium',
      category: 'maintenance',
      requesterId: 'user-456',
      requesterName: 'Jane Doe',
      assigneeId: 'user-456',
      assigneeName: 'Jane Doe',
      reviewers: ['user-123', 'user-789'],
      approvers: ['user-123'],
      plannedStartDate: new Date('2025-01-22'),
      plannedEndDate: new Date('2025-01-22'),
      actualStartDate: new Date('2025-01-22'),
      impact: 'significant',
      risk: 'medium',
      rollbackPlan: 'Use database point-in-time restore',
      testPlan: 'Run database performance tests and application integration tests',
      communicationPlan: 'Schedule maintenance window notification',
      attachments: ['maintenance-script.sql', 'rollback-procedure.pdf'],
      comments: [
        {
          id: 'comment-2',
          authorId: 'user-123',
          authorName: 'John Smith',
          content: 'Approved. Please ensure minimal downtime.',
          timestamp: new Date('2025-01-19'),
          type: 'approval',
        },
      ],
      createdAt: new Date('2025-01-16'),
      updatedAt: new Date('2025-01-22'),
    },
  ]);

  const [filteredRequests, setFilteredRequests] = useState<ChangeRequest[]>(changeRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  const totalCount = filteredRequests.length;

  const createRequest = useCallback(async (requestData: Omit<ChangeRequest, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newRequest: ChangeRequest = {
        ...requestData,
        id: `change-${Date.now()}`,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setChangeRequests(prev => [...prev, newRequest]);
      setFilteredRequests(prev => [...prev, newRequest]);
    } catch (err) {
      setError('Failed to create change request');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id: string, updates: Partial<ChangeRequest>) => {
    setIsLoading(true);
    setError(null);

    try {
      setChangeRequests(prev =>
        prev.map(request =>
          request.id === id
            ? { ...request, ...updates, updatedAt: new Date() }
            : request
        )
      );
      setFilteredRequests(prev =>
        prev.map(request =>
          request.id === id
            ? { ...request, ...updates, updatedAt: new Date() }
            : request
        )
      );
    } catch (err) {
      setError('Failed to update change request');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setChangeRequests(prev => prev.filter(request => request.id !== id));
      setFilteredRequests(prev => prev.filter(request => request.id !== id));
    } catch (err) {
      setError('Failed to delete change request');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (id: string, comment?: string) => {
    const updates: Partial<ChangeRequest> = { status: 'approved' };
    if (comment) {
      const newComment: ChangeComment = {
        id: `comment-${Date.now()}`,
        authorId: 'current-user',
        authorName: 'Current User',
        content: comment,
        timestamp: new Date(),
        type: 'approval',
      };
      updates.comments = [...(changeRequests.find(r => r.id === id)?.comments || []), newComment];
    }
    await updateRequest(id, updates);
  }, [changeRequests, updateRequest]);

  const rejectRequest = useCallback(async (id: string, comment?: string) => {
    const updates: Partial<ChangeRequest> = { status: 'rejected' };
    if (comment) {
      const newComment: ChangeComment = {
        id: `comment-${Date.now()}`,
        authorId: 'current-user',
        authorName: 'Current User',
        content: comment,
        timestamp: new Date(),
        type: 'rejection',
      };
      updates.comments = [...(changeRequests.find(r => r.id === id)?.comments || []), newComment];
    }
    await updateRequest(id, updates);
  }, [changeRequests, updateRequest]);

  const startRequest = useCallback(async (id: string) => {
    await updateRequest(id, {
      status: 'in_progress',
      actualStartDate: new Date(),
    });
  }, [updateRequest]);

  const completeRequest = useCallback(async (id: string, comment?: string) => {
    const updates: Partial<ChangeRequest> = {
      status: 'completed',
      actualEndDate: new Date(),
    };
    if (comment) {
      const newComment: ChangeComment = {
        id: `comment-${Date.now()}`,
        authorId: 'current-user',
        authorName: 'Current User',
        content: comment,
        timestamp: new Date(),
        type: 'comment',
      };
      updates.comments = [...(changeRequests.find(r => r.id === id)?.comments || []), newComment];
    }
    await updateRequest(id, updates);
  }, [changeRequests, updateRequest]);

  const cancelRequest = useCallback(async (id: string, comment?: string) => {
    const updates: Partial<ChangeRequest> = { status: 'cancelled' };
    if (comment) {
      const newComment: ChangeComment = {
        id: `comment-${Date.now()}`,
        authorId: 'current-user',
        authorName: 'Current User',
        content: comment,
        timestamp: new Date(),
        type: 'comment',
      };
      updates.comments = [...(changeRequests.find(r => r.id === id)?.comments || []), newComment];
    }
    await updateRequest(id, updates);
  }, [changeRequests, updateRequest]);

  const addComment = useCallback(async (requestId: string, comment: Omit<ChangeComment, 'id' | 'timestamp'>) => {
    const newComment: ChangeComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      timestamp: new Date(),
    };

    const request = changeRequests.find(r => r.id === requestId);
    if (request) {
      await updateRequest(requestId, {
        comments: [...request.comments, newComment],
      });
    }
  }, [changeRequests, updateRequest]);

  const assignRequest = useCallback(async (id: string, assigneeId: string, assigneeName: string) => {
    await updateRequest(id, {
      assigneeId,
      assigneeName,
    });
  }, [updateRequest]);

  const exportRequests = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Change requests exported as ${format}`);
    } catch (err) {
      setError('Failed to export change requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Failed to refresh change data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    changeRequests,
    filteredRequests,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    createRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
    startRequest,
    completeRequest,
    cancelRequest,
    addComment,
    assignRequest,
    exportRequests,
    refreshData,
  };
}
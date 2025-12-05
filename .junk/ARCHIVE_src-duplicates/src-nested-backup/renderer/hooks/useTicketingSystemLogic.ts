/**
 * useTicketingSystemLogic Hook
 *
 * Manages ticketing system data with full CRUD operations, ticket lifecycle management,
 * and integration with Logic Engine for ticket processing and automation.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Ticket priority levels
 */
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

/**
 * Ticket status states
 */
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled';

/**
 * Ticket data model
 */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  category: string;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  metadata?: Record<string, any>;
}

/**
 * Ticket comment model
 */
export interface TicketComment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

/**
 * Ticket attachment model
 */
export interface TicketAttachment {
  id: string;
  ticketId: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Ticketing system state
 */
export interface TicketingSystemState {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  searchText: string;
  statusFilter: TicketStatus | 'All';
  priorityFilter: TicketPriority | 'All';
  assigneeFilter: string;
  selectedTickets: Ticket[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

/**
 * Create ticket request payload
 */
export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Update ticket request payload
 */
export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Custom hook for ticketing system logic
 */
export const useTicketingSystemLogic = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'All'>('All');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 50,
    total: 0,
  });

  /**
   * Load tickets from backend
   */
  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.ticketing.getTickets({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchText,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        assignee: assigneeFilter || undefined,
      });

      if (result.success) {
        setTickets(result.data.tickets);
        setPagination(prev => ({ ...prev, total: result.data.total }));
        console.info('[TicketingSystem] Loaded tickets:', result.data.tickets.length);
      } else {
        throw new Error(result.error || 'Failed to load tickets');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load tickets';
      setError(errorMessage);
      console.error('[TicketingSystem] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchText, statusFilter, priorityFilter, assigneeFilter]);

  /**
   * Create a new ticket
   */
  const createTicket = useCallback(async (ticketData: CreateTicketRequest): Promise<Ticket | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.ticketing.createTicket(ticketData);

      if (result.success) {
        const newTicket = result.data;
        setTickets(prev => [newTicket, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        console.info('[TicketingSystem] Created ticket:', newTicket.id);
        return newTicket;
      } else {
        throw new Error(result.error || 'Failed to create ticket');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create ticket';
      setError(errorMessage);
      console.error('[TicketingSystem] Create error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing ticket
   */
  const updateTicket = useCallback(async (ticketId: string, updates: UpdateTicketRequest): Promise<Ticket | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.ticketing.updateTicket(ticketId, updates);

      if (result.success) {
        const updatedTicket = result.data;
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        console.info('[TicketingSystem] Updated ticket:', ticketId);
        return updatedTicket;
      } else {
        throw new Error(result.error || 'Failed to update ticket');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update ticket';
      setError(errorMessage);
      console.error('[TicketingSystem] Update error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a ticket
   */
  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.ticketing.deleteTicket(ticketId);

      if (result.success) {
        setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        setSelectedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        console.info('[TicketingSystem] Deleted ticket:', ticketId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete ticket');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete ticket';
      setError(errorMessage);
      console.error('[TicketingSystem] Delete error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add comment to ticket
   */
  const addComment = useCallback(async (ticketId: string, content: string, isInternal: boolean = false): Promise<TicketComment | null> => {
    try {
      setError(null);

      const result = await window.electronAPI.ticketing.addComment(ticketId, { content, isInternal });

      if (result.success) {
        const newComment = result.data;
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, comments: [...ticket.comments, newComment] }
            : ticket
        ));
        console.info('[TicketingSystem] Added comment to ticket:', ticketId);
        return newComment;
      } else {
        throw new Error(result.error || 'Failed to add comment');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to add comment';
      setError(errorMessage);
      console.error('[TicketingSystem] Add comment error:', err);
      return null;
    }
  }, []);

  /**
   * Upload attachment to ticket
   */
  const uploadAttachment = useCallback(async (ticketId: string, file: File): Promise<TicketAttachment | null> => {
    try {
      setError(null);

      // Convert file to base64 for Electron API
      const base64Data = await fileToBase64(file);

      const result = await window.electronAPI.ticketing.uploadAttachment(ticketId, {
        filename: file.name,
        data: base64Data,
        mimeType: file.type,
      });

      if (result.success) {
        const attachment = result.data;
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, attachments: [...ticket.attachments, attachment] }
            : ticket
        ));
        console.info('[TicketingSystem] Uploaded attachment to ticket:', ticketId);
        return attachment;
      } else {
        throw new Error(result.error || 'Failed to upload attachment');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to upload attachment';
      setError(errorMessage);
      console.error('[TicketingSystem] Upload attachment error:', err);
      return null;
    }
  }, []);

  /**
   * Bulk update ticket status
   */
  const bulkUpdateStatus = useCallback(async (ticketIds: string[], status: TicketStatus): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.ticketing.bulkUpdateStatus(ticketIds, status);

      if (result.success) {
        setTickets(prev => prev.map(ticket =>
          ticketIds.includes(ticket.id) ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket
        ));
        console.info('[TicketingSystem] Bulk updated status for tickets:', ticketIds.length);
        return true;
      } else {
        throw new Error(result.error || 'Failed to bulk update status');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to bulk update status';
      setError(errorMessage);
      console.error('[TicketingSystem] Bulk update error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Export tickets to CSV
   */
  const exportTickets = useCallback(async () => {
    try {
      setError(null);

      const result = await window.electronAPI.ticketing.exportTickets({
        search: searchText,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        assignee: assigneeFilter || undefined,
      });

      if (result.success) {
        console.info('[TicketingSystem] Exported tickets successfully');
      } else {
        throw new Error(result.error || 'Failed to export tickets');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to export tickets';
      setError(errorMessage);
      console.error('[TicketingSystem] Export error:', err);
    }
  }, [searchText, statusFilter, priorityFilter, assigneeFilter]);

  /**
   * Refresh tickets data
   */
  const refreshTickets = useCallback(async () => {
    await loadTickets();
  }, [loadTickets]);

  /**
   * Load data on mount and when filters change
   */
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    // State
    tickets,
    isLoading,
    error,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    selectedTickets,
    setSelectedTickets,
    pagination,
    setPagination,

    // Actions
    loadTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    addComment,
    uploadAttachment,
    bulkUpdateStatus,
    exportTickets,
    refreshTickets,
  };
};

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export default useTicketingSystemLogic;
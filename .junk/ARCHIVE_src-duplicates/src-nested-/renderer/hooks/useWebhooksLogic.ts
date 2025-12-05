/**
 * useWebhooksLogic Hook
 *
 * Manages webhook configuration, delivery tracking, and webhook management with
 * integration to Logic Engine for automated event processing and notifications.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Webhook HTTP methods
 */
export type WebhookMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Webhook trigger events
 */
export type WebhookEvent = 'ticket.created' | 'ticket.updated' | 'ticket.deleted' | 'ticket.status_changed' |
                          'discovery.completed' | 'discovery.failed' | 'report.generated' | 'alert.triggered' |
                          'user.created' | 'user.updated' | 'group.created' | 'group.updated';

/**
 * Webhook status
 */
export type WebhookStatus = 'active' | 'inactive' | 'failed' | 'pending';

/**
 * Webhook delivery status
 */
export type WebhookDeliveryStatus = 'success' | 'failed' | 'pending' | 'timeout';

/**
 * Webhook data model
 */
export interface Webhook {
  id: string;
  name: string;
  url: string;
  method: WebhookMethod;
  events: WebhookEvent[];
  headers: Record<string, string>;
  secret?: string;
  status: WebhookStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastDeliveryAt?: string;
  deliveryCount: number;
  failureCount: number;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // in seconds
    backoffMultiplier: number;
  };
  timeout: number; // in seconds
  filters?: Record<string, any>; // Event filtering conditions
}

/**
 * Webhook delivery attempt record
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  status: WebhookDeliveryStatus;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  attemptNumber: number;
  deliveredAt?: string;
  duration: number; // in milliseconds
  headers: Record<string, string>;
  requestId: string;
}

/**
 * Webhook statistics
 */
export interface WebhookStatistics {
  totalWebhooks: number;
  activeWebhooks: number;
  totalDeliveries: number;
  successRate: number;
  averageResponseTime: number;
  recentFailures: number;
}

/**
 * Create webhook request payload
 */
export interface CreateWebhookRequest {
  name: string;
  url: string;
  method?: WebhookMethod;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  secret?: string;
  retryPolicy?: {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
  };
  timeout?: number;
  filters?: Record<string, any>;
}

/**
 * Update webhook request payload
 */
export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  method?: WebhookMethod;
  events?: WebhookEvent[];
  headers?: Record<string, string>;
  secret?: string;
  status?: WebhookStatus;
  retryPolicy?: {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
  };
  timeout?: number;
  filters?: Record<string, any>;
}

/**
 * Test webhook request payload
 */
export interface TestWebhookRequest {
  event: WebhookEvent;
  payload?: any;
}

/**
 * Custom hook for webhooks logic
 */
export const useWebhooksLogic = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [statistics, setStatistics] = useState<WebhookStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<WebhookStatus | 'All'>('All');
  const [eventFilter, setEventFilter] = useState<WebhookEvent | 'All'>('All');
  const [selectedWebhooks, setSelectedWebhooks] = useState<Webhook[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 50,
    total: 0,
  });

  /**
   * Load webhooks from backend
   */
  const loadWebhooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.webhooks.getWebhooks({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchText,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        event: eventFilter !== 'All' ? eventFilter : undefined,
      });

      if (result.success) {
        setWebhooks(result.data.webhooks);
        setPagination(prev => ({ ...prev, total: result.data.total }));
        console.info('[Webhooks] Loaded webhooks:', result.data.webhooks.length);
      } else {
        throw new Error(result.error || 'Failed to load webhooks');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load webhooks';
      setError(errorMessage);
      console.error('[Webhooks] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchText, statusFilter, eventFilter]);

  /**
   * Load webhook deliveries
   */
  const loadDeliveries = useCallback(async (webhookId?: string, limit: number = 100) => {
    try {
      setError(null);

      const result = await window.electronAPI.webhooks.getDeliveries({
        webhookId,
        limit,
      });

      if (result.success) {
        setDeliveries(result.data.deliveries);
        console.info('[Webhooks] Loaded deliveries:', result.data.deliveries.length);
      } else {
        throw new Error(result.error || 'Failed to load deliveries');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load deliveries';
      setError(errorMessage);
      console.error('[Webhooks] Load deliveries error:', err);
    }
  }, []);

  /**
   * Load webhook statistics
   */
  const loadStatistics = useCallback(async () => {
    try {
      const result = await window.electronAPI.webhooks.getStatistics();

      if (result.success) {
        setStatistics(result.data.statistics);
        console.info('[Webhooks] Loaded statistics');
      } else {
        throw new Error(result.error || 'Failed to load statistics');
      }
    } catch (err: any) {
      console.error('[Webhooks] Load statistics error:', err);
      // Don't set error for statistics, as it's non-critical
    }
  }, []);

  /**
   * Create a new webhook
   */
  const createWebhook = useCallback(async (webhookData: CreateWebhookRequest): Promise<Webhook | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.webhooks.createWebhook(webhookData);

      if (result.success) {
        const newWebhook = result.data;
        setWebhooks(prev => [newWebhook, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        console.info('[Webhooks] Created webhook:', newWebhook.id);
        return newWebhook;
      } else {
        throw new Error(result.error || 'Failed to create webhook');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create webhook';
      setError(errorMessage);
      console.error('[Webhooks] Create error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing webhook
   */
  const updateWebhook = useCallback(async (webhookId: string, updates: UpdateWebhookRequest): Promise<Webhook | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.webhooks.updateWebhook(webhookId, updates);

      if (result.success) {
        const updatedWebhook = result.data;
        setWebhooks(prev => prev.map(webhook =>
          webhook.id === webhookId ? updatedWebhook : webhook
        ));
        console.info('[Webhooks] Updated webhook:', webhookId);
        return updatedWebhook;
      } else {
        throw new Error(result.error || 'Failed to update webhook');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update webhook';
      setError(errorMessage);
      console.error('[Webhooks] Update error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a webhook
   */
  const deleteWebhook = useCallback(async (webhookId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.webhooks.deleteWebhook(webhookId);

      if (result.success) {
        setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        setSelectedWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
        console.info('[Webhooks] Deleted webhook:', webhookId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete webhook');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete webhook';
      setError(errorMessage);
      console.error('[Webhooks] Delete error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Test a webhook
   */
  const testWebhook = useCallback(async (webhookId: string, testData: TestWebhookRequest): Promise<WebhookDelivery | null> => {
    try {
      setError(null);

      const result = await window.electronAPI.webhooks.testWebhook(webhookId, testData);

      if (result.success) {
        const delivery = result.data;
        console.info('[Webhooks] Tested webhook:', webhookId, delivery.status);
        return delivery;
      } else {
        throw new Error(result.error || 'Failed to test webhook');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to test webhook';
      setError(errorMessage);
      console.error('[Webhooks] Test error:', err);
      return null;
    }
  }, []);

  /**
   * Enable/disable webhook
   */
  const toggleWebhookStatus = useCallback(async (webhookId: string, status: WebhookStatus): Promise<boolean> => {
    return await updateWebhook(webhookId, { status }) !== null;
  }, [updateWebhook]);

  /**
   * Redeliver a failed webhook
   */
  const redeliverWebhook = useCallback(async (deliveryId: string): Promise<WebhookDelivery | null> => {
    try {
      setError(null);

      const result = await window.electronAPI.webhooks.redeliverWebhook(deliveryId);

      if (result.success) {
        const delivery = result.data;
        // Update deliveries list
        setDeliveries(prev => [delivery, ...prev]);
        console.info('[Webhooks] Redelivered webhook:', deliveryId);
        return delivery;
      } else {
        throw new Error(result.error || 'Failed to redeliver webhook');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to redeliver webhook';
      setError(errorMessage);
      console.error('[Webhooks] Redeliver error:', err);
      return null;
    }
  }, []);

  /**
   * Bulk toggle webhook status
   */
  const bulkToggleStatus = useCallback(async (webhookIds: string[], status: WebhookStatus): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.webhooks.bulkToggleStatus(webhookIds, status);

      if (result.success) {
        setWebhooks(prev => prev.map(webhook =>
          webhookIds.includes(webhook.id) ? { ...webhook, status, updatedAt: new Date().toISOString() } : webhook
        ));
        console.info('[Webhooks] Bulk toggled status for webhooks:', webhookIds.length);
        return true;
      } else {
        throw new Error(result.error || 'Failed to bulk toggle status');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to bulk toggle status';
      setError(errorMessage);
      console.error('[Webhooks] Bulk toggle error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Export webhooks to CSV
   */
  const exportWebhooks = useCallback(async () => {
    try {
      setError(null);

      const result = await window.electronAPI.webhooks.exportWebhooks({
        search: searchText,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        event: eventFilter !== 'All' ? eventFilter : undefined,
      });

      if (result.success) {
        console.info('[Webhooks] Exported webhooks successfully');
      } else {
        throw new Error(result.error || 'Failed to export webhooks');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to export webhooks';
      setError(errorMessage);
      console.error('[Webhooks] Export error:', err);
    }
  }, [searchText, statusFilter, eventFilter]);

  /**
   * Refresh webhooks data
   */
  const refreshWebhooks = useCallback(async () => {
    await loadWebhooks();
    await loadStatistics();
  }, [loadWebhooks, loadStatistics]);

  /**
   * Load data on mount and when filters change
   */
  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);

  /**
   * Load statistics on mount
   */
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    // State
    webhooks,
    deliveries,
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    eventFilter,
    setEventFilter,
    selectedWebhooks,
    setSelectedWebhooks,
    pagination,
    setPagination,

    // Actions
    loadWebhooks,
    loadDeliveries,
    loadStatistics,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    toggleWebhookStatus,
    redeliverWebhook,
    bulkToggleStatus,
    exportWebhooks,
    refreshWebhooks,
  };
};

export default useWebhooksLogic;
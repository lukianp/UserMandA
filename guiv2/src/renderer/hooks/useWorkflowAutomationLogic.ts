5.1/**
 * useWorkflowAutomationLogic Hook
 *
 * Manages workflow automation with complete workflow lifecycle, step execution,
 * conditional logic, and integration with Logic Engine for automated business processes.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Workflow execution status
 */
export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

/**
 * Workflow step types
 */
export type WorkflowStepType = 'action' | 'condition' | 'wait' | 'parallel' | 'loop' | 'subworkflow' | 'notification';

/**
 * Workflow trigger types
 */
export type WorkflowTriggerType = 'manual' | 'schedule' | 'event' | 'webhook' | 'api';

/**
 * Workflow data model
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  trigger: {
    type: WorkflowTriggerType;
    config: Record<string, any>;
  };
  steps: WorkflowStep[];
  variables: Record<string, any>;
  settings: {
    timeout: number; // in seconds
    retryPolicy: {
      maxRetries: number;
      retryDelay: number;
      backoffMultiplier: number;
    };
    notifications: {
      onStart: boolean;
      onComplete: boolean;
      onFailure: boolean;
      emailRecipients?: string[];
    };
  };
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastExecutedAt?: string;
  executionCount: number;
  successRate: number;
  tags: string[];
}

/**
 * Workflow step data model
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: Record<string, any>;
  conditions?: WorkflowCondition[];
  onSuccess?: string[]; // Next step IDs
  onFailure?: string[]; // Next step IDs
  timeout?: number; // in seconds
  retryCount?: number;
  metadata?: Record<string, any>;
}

/**
 * Workflow condition for conditional logic
 */
export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Workflow execution record
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: string;
  status: WorkflowExecutionStatus;
  trigger: {
    type: WorkflowTriggerType;
    source: string;
    payload?: any;
  };
  variables: Record<string, any>;
  steps: WorkflowStepExecution[];
  startedAt: string;
  completedAt?: string;
  duration?: number; // in milliseconds
  error?: string;
  logs: WorkflowExecutionLog[];
  createdBy?: string;
}

/**
 * Workflow step execution record
 */
export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  output?: any;
  error?: string;
  retryCount: number;
}

/**
 * Workflow execution log entry
 */
export interface WorkflowExecutionLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  stepId?: string;
  data?: any;
}

/**
 * Workflow statistics
 */
export interface WorkflowStatistics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  recentFailures: number;
  executionsByTrigger: Record<WorkflowTriggerType, number>;
}

/**
 * Create workflow request payload
 */
export interface CreateWorkflowRequest {
  name: string;
  description: string;
  trigger: {
    type: WorkflowTriggerType;
    config: Record<string, any>;
  };
  steps: Omit<WorkflowStep, 'id'>[];
  variables?: Record<string, any>;
  settings?: Partial<Workflow['settings']>;
  tags?: string[];
}

/**
 * Update workflow request payload
 */
export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  trigger?: {
    type: WorkflowTriggerType;
    config: Record<string, any>;
  };
  steps?: WorkflowStep[];
  variables?: Record<string, any>;
  settings?: Partial<Workflow['settings']>;
  status?: 'active' | 'inactive' | 'draft';
  tags?: string[];
}

/**
 * Execute workflow request payload
 */
export interface ExecuteWorkflowRequest {
  variables?: Record<string, any>;
  triggerPayload?: any;
}

/**
 * Custom hook for workflow automation logic
 */
export const useWorkflowAutomationLogic = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [statistics, setStatistics] = useState<WorkflowStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [triggerFilter, setTriggerFilter] = useState<WorkflowTriggerType | 'All'>('All');
  const [selectedWorkflows, setSelectedWorkflows] = useState<Workflow[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 50,
    total: 0,
  });

  /**
   * Load workflows from backend
   */
  const loadWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.workflows.getWorkflows({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchText,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        trigger: triggerFilter !== 'All' ? triggerFilter : undefined,
      });

      if (result.success && result.data) {
        setWorkflows(result.data.workflows || []);
        setPagination(prev => ({ ...prev, total: (result.data!.total || 0) }));
        console.info('[WorkflowAutomation] Loaded workflows:', (result.data.workflows || []).length);
      } else {
        throw new Error(result.error || 'Failed to load workflows');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load workflows';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchText, statusFilter, triggerFilter]);

  /**
   * Load workflow executions
   */
  const loadExecutions = useCallback(async (workflowId?: string, limit: number = 100) => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.getExecutions({
        workflowId,
        limit,
      });

      if (result.success && result.data) {
        setExecutions(result.data.executions || []);
        console.info('[WorkflowAutomation] Loaded executions:', (result.data.executions || []).length);
      } else {
        throw new Error(result.error || 'Failed to load executions');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load executions';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Load executions error:', err);
    }
  }, []);

  /**
   * Load workflow statistics
   */
  const loadStatistics = useCallback(async () => {
    try {
      const result = await window.electronAPI.workflows.getStatistics();

      if (result.success && result.data) {
        setStatistics(result.data!.statistics || null);
        console.info('[WorkflowAutomation] Loaded statistics');
      } else {
        throw new Error(result.error || 'Failed to load statistics');
      }
    } catch (err: any) {
      console.error('[WorkflowAutomation] Load statistics error:', err);
      // Don't set error for statistics, as it's non-critical
    }
  }, []);

  /**
   * Create a new workflow
   */
  const createWorkflow = useCallback(async (workflowData: CreateWorkflowRequest): Promise<Workflow | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.workflows.createWorkflow(workflowData);

      if (result.success && result.data) {
        const newWorkflow = result.data;
        setWorkflows(prev => [newWorkflow, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        console.info('[WorkflowAutomation] Created workflow:', newWorkflow.id);
        return newWorkflow;
      } else {
        throw new Error(result.error || 'Failed to create workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Create error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing workflow
   */
  const updateWorkflow = useCallback(async (workflowId: string, updates: UpdateWorkflowRequest): Promise<Workflow | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.workflows.updateWorkflow(workflowId, updates);

      if (result.success && result.data) {
        const updatedWorkflow = result.data;
        setWorkflows(prev => prev.map(workflow =>
          workflow.id === workflowId ? updatedWorkflow : workflow
        ));
        console.info('[WorkflowAutomation] Updated workflow:', workflowId);
        return updatedWorkflow;
      } else {
        throw new Error(result.error || 'Failed to update workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Update error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a workflow
   */
  const deleteWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.workflows.deleteWorkflow(workflowId);

      if (result.success) {
        setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        setSelectedWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
        console.info('[WorkflowAutomation] Deleted workflow:', workflowId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Delete error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Execute a workflow
   */
  const executeWorkflow = useCallback(async (workflowId: string, executionData?: ExecuteWorkflowRequest): Promise<WorkflowExecution | null> => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.executeWorkflow(workflowId, executionData || {});

      if (result.success && result.data) {
        const execution = result.data;
        setExecutions(prev => [execution, ...prev]);
        // Update workflow execution count
        setWorkflows(prev => prev.map(workflow =>
          workflow.id === workflowId
            ? {
                ...workflow,
                executionCount: workflow.executionCount + 1,
                lastExecutedAt: new Date().toISOString()
              }
            : workflow
        ));
        console.info('[WorkflowAutomation] Executed workflow:', workflowId, execution.id);
        return execution;
      } else {
        throw new Error(result.error || 'Failed to execute workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to execute workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Execute error:', err);
      return null;
    }
  }, []);

  /**
   * Cancel workflow execution
   */
  const cancelExecution = useCallback(async (executionId: string): Promise<boolean> => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.cancelExecution(executionId);

      if (result.success) {
        setExecutions(prev => prev.map(execution =>
          execution.id === executionId
            ? { ...execution, status: 'cancelled' as WorkflowExecutionStatus, completedAt: new Date().toISOString() }
            : execution
        ));
        console.info('[WorkflowAutomation] Cancelled execution:', executionId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to cancel execution');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to cancel execution';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Cancel execution error:', err);
      return false;
    }
  }, []);

  /**
   * Pause/resume workflow execution
   */
  const pauseExecution = useCallback(async (executionId: string): Promise<boolean> => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.pauseExecution(executionId);

      if (result.success) {
        setExecutions(prev => prev.map(execution =>
          execution.id === executionId
            ? { ...execution, status: 'paused' as WorkflowExecutionStatus }
            : execution
        ));
        console.info('[WorkflowAutomation] Paused execution:', executionId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to pause execution');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to pause execution';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Pause execution error:', err);
      return false;
    }
  }, []);

  const resumeExecution = useCallback(async (executionId: string): Promise<boolean> => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.resumeExecution(executionId);

      if (result.success) {
        setExecutions(prev => prev.map(execution =>
          execution.id === executionId
            ? { ...execution, status: 'running' as WorkflowExecutionStatus }
            : execution
        ));
        console.info('[WorkflowAutomation] Resumed execution:', executionId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to resume execution');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to resume execution';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Resume execution error:', err);
      return false;
    }
  }, []);

  /**
   * Enable/disable workflow
   */
  const toggleWorkflowStatus = useCallback(async (workflowId: string, status: 'active' | 'inactive'): Promise<boolean> => {
    return await updateWorkflow(workflowId, { status }) !== null;
  }, [updateWorkflow]);

  /**
   * Clone workflow
   */
  const cloneWorkflow = useCallback(async (workflowId: string, name: string): Promise<Workflow | null> => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.cloneWorkflow(workflowId, { name });

      if (result.success && result.data) {
        const clonedWorkflow = result.data;
        setWorkflows(prev => [clonedWorkflow, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        console.info('[WorkflowAutomation] Cloned workflow:', workflowId, clonedWorkflow.id);
        return clonedWorkflow;
      } else {
        throw new Error(result.error || 'Failed to clone workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to clone workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Clone error:', err);
      return null;
    }
  }, []);

  /**
   * Export workflow
   */
  const exportWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.exportWorkflow(workflowId);

      if (result.success) {
        console.info('[WorkflowAutomation] Exported workflow:', workflowId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to export workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to export workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Export error:', err);
      return false;
    }
  }, []);

  /**
   * Import workflow
   */
  const importWorkflow = useCallback(async (workflowData: string): Promise<Workflow | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.workflows.importWorkflow({ data: workflowData });

      if (result.success && result.data) {
        const importedWorkflow = result.data;
        setWorkflows(prev => [importedWorkflow, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        console.info('[WorkflowAutomation] Imported workflow:', importedWorkflow.id);
        return importedWorkflow;
      } else {
        throw new Error(result.error || 'Failed to import workflow');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to import workflow';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Import error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Bulk toggle workflow status
   */
  const bulkToggleStatus = useCallback(async (workflowIds: string[], status: 'active' | 'inactive'): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.workflows.bulkToggleStatus(workflowIds, status);

      if (result.success) {
        setWorkflows(prev => prev.map(workflow =>
          workflowIds.includes(workflow.id) ? { ...workflow, status, updatedAt: new Date().toISOString() } : workflow
        ));
        console.info('[WorkflowAutomation] Bulk toggled status for workflows:', workflowIds.length);
        return true;
      } else {
        throw new Error(result.error || 'Failed to bulk toggle status');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to bulk toggle status';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Bulk toggle error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get workflow execution logs
   */
  const getExecutionLogs = useCallback(async (executionId: string): Promise<WorkflowExecutionLog[]> => {
    try {
      const result = await window.electronAPI.workflows.getExecutionLogs(executionId);

      if (result.success && result.data) {
        return result.data!.logs || [];
      } else {
        throw new Error(result.error || 'Failed to get execution logs');
      }
    } catch (err: any) {
      console.error('[WorkflowAutomation] Get execution logs error:', err);
      return [];
    }
  }, []);

  /**
   * Export workflows to CSV
   */
  const exportWorkflows = useCallback(async () => {
    try {
      setError(null);

      const result = await window.electronAPI.workflows.exportWorkflows({
        search: searchText,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        trigger: triggerFilter !== 'All' ? triggerFilter : undefined,
      });

      if (result.success) {
        console.info('[WorkflowAutomation] Exported workflows successfully');
      } else {
        throw new Error(result.error || 'Failed to export workflows');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to export workflows';
      setError(errorMessage);
      console.error('[WorkflowAutomation] Export error:', err);
    }
  }, [searchText, statusFilter, triggerFilter]);

  /**
   * Refresh workflows data
   */
  const refreshWorkflows = useCallback(async () => {
    await loadWorkflows();
    await loadStatistics();
  }, [loadWorkflows, loadStatistics]);

  /**
   * Load data on mount and when filters change
   */
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  /**
   * Load statistics on mount
   */
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    // State
    workflows,
    executions,
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    triggerFilter,
    setTriggerFilter,
    selectedWorkflows,
    setSelectedWorkflows,
    pagination,
    setPagination,

    // Actions
    loadWorkflows,
    loadExecutions,
    loadStatistics,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    cancelExecution,
    pauseExecution,
    resumeExecution,
    toggleWorkflowStatus,
    cloneWorkflow,
    exportWorkflow,
    importWorkflow,
    bulkToggleStatus,
    getExecutionLogs,
    exportWorkflows,
    refreshWorkflows,
  };
};

export default useWorkflowAutomationLogic;

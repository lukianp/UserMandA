/**
 * Advanced IPC Handlers for Production APIs
 *
 * Provides IPC handlers for advanced APIs including:
 * - Ticketing system management
 * - Webhook management and testing
 * - Workflow management and execution
 *
 * All handlers include proper error handling and mock implementations
 * ready for production integration.
 */

import { ipcMain } from 'electron';

/**
 * Register all advanced IPC handlers
 */
export function registerAdvancedIpcHandlers(): void {

// ========================================
// Ticketing System Handlers
// ========================================

/**
 * Get tickets with optional filtering and pagination
 */
ipcMain.handle('getTickets', async (_, args: {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  try {
    console.log('IPC: getTickets', args);
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = args;

    // Mock ticket data - replace with actual database/service calls
    const mockTickets = [
      {
        id: 'ticket-1',
        title: 'User migration failed for john.doe@company.com',
        description: 'Migration batch #123 failed during mailbox migration phase',
        status: 'open',
        priority: 'high',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
        assignedTo: 'admin@company.com',
        createdBy: 'system@migration-service',
        tags: ['migration', 'mailbox', 'failure'],
        comments: [
          {
            id: 'comment-1',
            author: 'system@migration-service',
            message: 'Migration failed due to permissions issue',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      },
      {
        id: 'ticket-2',
        title: 'Data export completed successfully',
        description: 'Scheduled weekly data export for compliance reporting',
        status: 'closed',
        priority: 'medium',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        assignedTo: null,
        createdBy: 'scheduler@system',
        tags: ['export', 'compliance'],
        comments: []
      }
    ];

    // Apply filters
    let filteredTickets = mockTickets;

    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }

    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredTickets.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        tickets: paginatedTickets,
        total: filteredTickets.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTickets.length / limit)
      }
    };
  } catch (error: unknown) {
    console.error(`getTickets error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Create a new ticket
 */
ipcMain.handle('createTicket', async (_, ticketData: {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  assignedTo?: string;
}) => {
  try {
    console.log('IPC: createTicket', ticketData);
    const { title, description, priority, tags = [], assignedTo } = ticketData;

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    // Mock ticket creation - replace with actual database/service calls
    const newTicket = {
      id: `ticket-${Date.now()}`,
      title,
      description,
      status: 'open',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: assignedTo || null,
      createdBy: 'current-user@system', // TODO: Get from session
      tags,
      comments: []
    };

    console.log(`Ticket created: ${newTicket.id}`);
    return { success: true, data: newTicket };
  } catch (error: unknown) {
    console.error(`createTicket error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Update an existing ticket
 */
ipcMain.handle('updateTicket', async (_, args: {
  ticketId: string;
  updates: Partial<{
    title: string;
    description: string;
    status: 'open' | 'closed' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo: string | null;
    tags: string[];
  }>
}) => {
  try {
    console.log('IPC: updateTicket', args);
    const { ticketId, updates } = args;

    if (!ticketId) {
      throw new Error('Ticket ID is required');
    }

    // Mock ticket update - replace with actual database/service calls
    // In a real implementation, you would fetch the existing ticket first
    const updatedTicket = {
      id: ticketId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    console.log(`Ticket updated: ${ticketId}`);
    return { success: true, data: updatedTicket };
  } catch (error: unknown) {
    console.error(`updateTicket error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Delete a ticket
 */
ipcMain.handle('deleteTicket', async (_, args: { ticketId: string }) => {
  try {
    console.log('IPC: deleteTicket', args);
    const { ticketId } = args;

    if (!ticketId) {
      throw new Error('Ticket ID is required');
    }

    // Mock ticket deletion - replace with actual database/service calls
    console.log(`Ticket deleted: ${ticketId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error(`deleteTicket error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Add a comment to a ticket
 */
ipcMain.handle('addTicketComment', async (_, args: {
  ticketId: string;
  comment: string;
}) => {
  try {
    console.log('IPC: addTicketComment', args);
    const { ticketId, comment } = args;

    if (!ticketId || !comment) {
      throw new Error('Ticket ID and comment are required');
    }

    // Mock comment addition - replace with actual database/service calls
    const newComment = {
      id: `comment-${Date.now()}`,
      author: 'current-user@system', // TODO: Get from session
      message: comment,
      createdAt: new Date().toISOString()
    };

    console.log(`Comment added to ticket ${ticketId}: ${newComment.id}`);
    return { success: true, data: newComment };
  } catch (error: unknown) {
    console.error(`addTicketComment error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

// ========================================
// Webhook Handlers
// ========================================

/**
 * Get webhooks with optional filtering and pagination
 */
ipcMain.handle('getWebhooks', async (_, args: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'error';
} = {}) => {
  try {
    console.log('IPC: getWebhooks', args);
    const { page = 1, limit = 20, search, status } = args;

    // Mock webhook data - replace with actual webhook service
    const mockWebhooks = [
      {
        id: 'webhook-1',
        name: 'Migration Status Updates',
        url: 'https://api.example.com/webhooks/migration-status',
        events: ['migration.started', 'migration.completed', 'migration.failed'],
        status: 'active',
        lastTriggered: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        headers: { 'Authorization': 'Bearer token123' },
        retryPolicy: { maxRetries: 3, backoffMs: 1000 }
      },
      {
        id: 'webhook-2',
        name: 'Security Alerts',
        url: 'https://security.example.com/alerts',
        events: ['security.threat', 'security.policy_violation'],
        status: 'active',
        lastTriggered: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        headers: {},
        retryPolicy: { maxRetries: 5, backoffMs: 2000 }
      }
    ];

    // Apply filters
    let filteredWebhooks = mockWebhooks;

    if (status) {
      filteredWebhooks = filteredWebhooks.filter(webhook => webhook.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredWebhooks = filteredWebhooks.filter(webhook =>
        webhook.name.toLowerCase().includes(searchLower) ||
        webhook.url.toLowerCase().includes(searchLower) ||
        webhook.events.some(event => event.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWebhooks = filteredWebhooks.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        webhooks: paginatedWebhooks,
        total: filteredWebhooks.length,
        page,
        limit,
        totalPages: Math.ceil(filteredWebhooks.length / limit)
      }
    };
  } catch (error: unknown) {
    console.error(`getWebhooks error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Create a new webhook
 */
ipcMain.handle('createWebhook', async (_, webhookData: {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  retryPolicy?: { maxRetries: number; backoffMs: number };
}) => {
  try {
    console.log('IPC: createWebhook', webhookData);
    const { name, url, events, headers = {}, retryPolicy } = webhookData;

    if (!name || !url || !events || events.length === 0) {
      throw new Error('Name, URL, and at least one event are required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Mock webhook creation - replace with actual webhook service
    const newWebhook = {
      id: `webhook-${Date.now()}`,
      name,
      url,
      events,
      status: 'active',
      lastTriggered: null,
      createdAt: new Date().toISOString(),
      headers,
      retryPolicy: retryPolicy || { maxRetries: 3, backoffMs: 1000 }
    };

    console.log(`Webhook created: ${newWebhook.id}`);
    return { success: true, data: newWebhook };
  } catch (error: unknown) {
    console.error(`createWebhook error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Update an existing webhook
 */
ipcMain.handle('updateWebhook', async (_, args: {
  webhookId: string;
  updates: Partial<{
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive';
    headers: Record<string, string>;
    retryPolicy: { maxRetries: number; backoffMs: number };
  }>
}) => {
  try {
    console.log('IPC: updateWebhook', args);
    const { webhookId, updates } = args;

    if (!webhookId) {
      throw new Error('Webhook ID is required');
    }

    // Validate URL if provided
    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        throw new Error('Invalid URL format');
      }
    }

    // Mock webhook update - replace with actual webhook service
    const updatedWebhook = {
      id: webhookId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    console.log(`Webhook updated: ${webhookId}`);
    return { success: true, data: updatedWebhook };
  } catch (error: unknown) {
    console.error(`updateWebhook error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Delete a webhook
 */
ipcMain.handle('deleteWebhook', async (_, args: { webhookId: string }) => {
  try {
    console.log('IPC: deleteWebhook', args);
    const { webhookId } = args;

    if (!webhookId) {
      throw new Error('Webhook ID is required');
    }

    // Mock webhook deletion - replace with actual webhook service
    console.log(`Webhook deleted: ${webhookId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error(`deleteWebhook error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Test a webhook by sending a test payload
 */
ipcMain.handle('testWebhook', async (_, args: {
  webhookId: string;
  testEvent?: string;
  testData?: any;
}) => {
  try {
    console.log('IPC: testWebhook', args);
    const { webhookId, testEvent = 'test.event', testData = { message: 'Test webhook payload' } } = args;

    if (!webhookId) {
      throw new Error('Webhook ID is required');
    }

    // Mock webhook testing - replace with actual webhook service
    // In a real implementation, this would make an HTTP request to the webhook URL
    console.log(`Testing webhook ${webhookId} with event: ${testEvent}`);

    // Simulate async webhook call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testResult = {
      success: true,
      responseTime: 150,
      statusCode: 200,
      response: 'Webhook received successfully'
    };

    console.log(`Webhook test completed for ${webhookId}`);
    return { success: true, data: testResult };
  } catch (error: unknown) {
    console.error(`testWebhook error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

// ========================================
// Workflow Handlers
// ========================================

/**
 * Get workflows with optional filtering and pagination
 */
ipcMain.handle('getWorkflows', async (_, args: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'draft';
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'execution_count' | 'lastExecutedAt';
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  try {
    console.log('IPC: getWorkflows', args);
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = args;

    // Mock workflow data - replace with actual workflow service
    const mockWorkflows = [
      {
        id: 'workflow-1',
        name: 'Automated User Migration',
        description: 'Complete workflow for migrating users from Active Directory to Azure AD',
        status: 'active',
        steps: [
          { id: 'step-1', name: 'Validate User', type: 'validation' },
          { id: 'step-2', name: 'Create Azure AD Account', type: 'creation' },
          { id: 'step-3', name: 'Migrate Mailbox', type: 'migration' },
          { id: 'step-4', name: 'Update Permissions', type: 'permission' }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 15,
        lastExecutedAt: new Date(Date.now() - 3600000).toISOString(),
        successRate: 0.87,
        averageExecutionTime: 1800000 // 30 minutes
      },
      {
        id: 'workflow-2',
        name: 'Security Compliance Check',
        description: 'Automated security compliance validation workflow',
        status: 'active',
        steps: [
          { id: 'step-1', name: 'Gather User Data', type: 'collection' },
          { id: 'step-2', name: 'Check Compliance Rules', type: 'validation' },
          { id: 'step-3', name: 'Generate Report', type: 'reporting' }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        executionCount: 8,
        lastExecutedAt: new Date(Date.now() - 7200000).toISOString(),
        successRate: 0.95,
        averageExecutionTime: 900000 // 15 minutes
      }
    ];

    // Apply filters
    let filteredWorkflows = mockWorkflows;

    if (status) {
      filteredWorkflows = filteredWorkflows.filter(workflow => workflow.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredWorkflows = filteredWorkflows.filter(workflow =>
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description.toLowerCase().includes(searchLower) ||
        workflow.steps.some(step => step.name.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredWorkflows.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === 'created_at' || sortBy === 'updated_at' || (sortBy === 'lastExecutedAt' && 'lastExecutedAt' in a)) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWorkflows = filteredWorkflows.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        workflows: paginatedWorkflows,
        total: filteredWorkflows.length,
        page,
        limit,
        totalPages: Math.ceil(filteredWorkflows.length / limit)
      }
    };
  } catch (error: unknown) {
    console.error(`getWorkflows error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Create a new workflow
 */
ipcMain.handle('createWorkflow', async (_, workflowData: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    type: string;
    config?: Record<string, any>;
  }>;
  triggers?: Array<{
    type: string;
    config?: Record<string, any>;
  }>;
}) => {
  try {
    console.log('IPC: createWorkflow', workflowData);
    const { name, description, steps, triggers = [] } = workflowData;

    if (!name || !steps || steps.length === 0) {
      throw new Error('Name and at least one step are required');
    }

    // Mock workflow creation - replace with actual workflow service
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name,
      description,
      status: 'active',
      steps: steps.map((step, index) => ({
        id: `step-${index + 1}`,
        ...step
      })),
      triggers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
      lastExecutedAt: null,
      successRate: 0,
      averageExecutionTime: 0
    };

    console.log(`Workflow created: ${newWorkflow.id}`);
    return { success: true, data: newWorkflow };
  } catch (error: unknown) {
    console.error(`createWorkflow error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Execute a workflow with optional parameters
 */
ipcMain.handle('executeWorkflow', async (_, args: {
  workflowId: string;
  parameters?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}) => {
  try {
    console.log('IPC: executeWorkflow', args);
    const { workflowId, parameters = {}, priority = 'normal' } = args;

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    // Mock workflow execution - replace with actual workflow service
    const executionId = `execution-${Date.now()}`;

    const execution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      parameters,
      priority,
      currentStep: 'step-1',
      progress: 0,
      steps: [
        { id: 'step-1', name: 'Initialize', status: 'running', startedAt: new Date().toISOString() }
      ]
    };

    console.log(`Workflow execution started: ${executionId} for workflow ${workflowId}`);

    // Simulate async workflow execution
    setTimeout(() => {
      console.log(`Workflow execution completed: ${executionId}`);
    }, 2000);

    return { success: true, data: execution };
  } catch (error: unknown) {
    console.error(`executeWorkflow error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Get workflow execution status
 */
ipcMain.handle('getWorkflowExecution', async (_, args: { executionId: string }) => {
  try {
    console.log('IPC: getWorkflowExecution', args);
    const { executionId } = args;

    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    // Mock execution status - replace with actual workflow service
    const mockExecution = {
      id: executionId,
      workflowId: 'workflow-1',
      status: 'completed',
      startedAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date().toISOString(),
      parameters: { userId: 'user123' },
      priority: 'normal',
      currentStep: null,
      progress: 100,
      steps: [
        {
          id: 'step-1',
          name: 'Validate User',
          status: 'completed',
          startedAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date(Date.now() - 240000).toISOString(),
          duration: 60000
        },
        {
          id: 'step-2',
          name: 'Create Azure AD Account',
          status: 'completed',
          startedAt: new Date(Date.now() - 240000).toISOString(),
          completedAt: new Date(Date.now() - 180000).toISOString(),
          duration: 60000
        }
      ],
      result: { success: true, migratedUserId: 'azure-user-456' },
      error: null
    };

    return { success: true, data: mockExecution };
  } catch (error: unknown) {
    console.error(`getWorkflowExecution error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Cancel a running workflow execution
 */
ipcMain.handle('cancelWorkflowExecution', async (_, args: { executionId: string }) => {
  try {
    console.log('IPC: cancelWorkflowExecution', args);
    const { executionId } = args;

    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    // Mock execution cancellation - replace with actual workflow service
    console.log(`Workflow execution cancelled: ${executionId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error(`cancelWorkflowExecution error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Delete a workflow
 */
ipcMain.handle('deleteWorkflow', async (_, args: { workflowId: string }) => {
  try {
    console.log('IPC: deleteWorkflow', args);
    const { workflowId } = args;

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    // Mock workflow deletion - replace with actual workflow service
    console.log(`Workflow deleted: ${workflowId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error(`deleteWorkflow error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * Update an existing workflow
 */
ipcMain.handle('updateWorkflow', async (_, args: {
  workflowId: string;
  updates: Partial<{
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    steps: Array<{ id: string; name: string; type: string; config?: Record<string, any> }>;
    triggers: Array<{ type: string; config?: Record<string, any> }>;
  }>
}) => {
  try {
    console.log('IPC: updateWorkflow', args);
    const { workflowId, updates } = args;

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    // Mock workflow update - replace with actual workflow service
    const updatedWorkflow = {
      id: workflowId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    console.log(`Workflow updated: ${workflowId}`);
    return { success: true, data: updatedWorkflow };
  } catch (error: unknown) {
    console.error(`updateWorkflow error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
}
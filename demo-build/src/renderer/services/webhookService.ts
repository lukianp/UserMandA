/**
 * Webhook Service
 *
 * Enterprise webhook management with:
 * - Webhook registration and management
 * - Event-based webhook triggers
 * - Retry logic with exponential backoff
 * - Webhook signature verification
 * - Delivery tracking and logs
 * - Rate limiting
 * - Webhook testing and validation
 */

import loggingService from './loggingService';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[]; // Events to subscribe to
  enabled: boolean;
  secret?: string; // For signature verification
  headers?: Record<string, string>; // Custom headers
  timeout?: number; // Request timeout in ms
  retryCount?: number; // Number of retries
  retryDelay?: number; // Initial retry delay in ms
  metadata?: Record<string, any>; // Custom metadata
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: WebhookPayload;
  url: string;
  status: 'pending' | 'success' | 'failed';
  httpStatus?: number;
  attempt: number;
  maxAttempts: number;
  sentAt: Date;
  completedAt?: Date;
  error?: string;
  responseBody?: string;
  responseTime?: number; // in ms
}

export interface WebhookStats {
  webhookId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
  lastDelivery?: Date;
  successRate: number;
}

/**
 * Webhook Service
 */
export class WebhookService {
  private static instance: WebhookService;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveries: WebhookDelivery[] = [];
  private maxDeliveryHistory = 1000;
  private rateLimitMap: Map<string, number[]> = new Map(); // Track request timestamps
  private maxRequestsPerMinute = 60;

  private constructor() {
    // Initialize webhook service
    loggingService.debug('WebhookService instance created', 'WebhookService');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Register a webhook
   */
  register(config: WebhookConfig): void {
    this.webhooks.set(config.id, {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      ...config,
      enabled: config.enabled ?? true,
    });

    loggingService.info(`Webhook registered: ${config.name}`, 'WebhookService', {
      id: config.id,
      url: config.url,
      events: config.events,
    });
  }

  /**
   * Unregister a webhook
   */
  unregister(webhookId: string): boolean {
    const deleted = this.webhooks.delete(webhookId);

    if (deleted) {
      loggingService.info(`Webhook unregistered: ${webhookId}`, 'WebhookService');
    }

    return deleted;
  }

  /**
   * Get webhook by ID
   */
  getWebhook(webhookId: string): WebhookConfig | undefined {
    return this.webhooks.get(webhookId);
  }

  /**
   * Get all webhooks
   */
  getAllWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Update webhook configuration
   */
  update(webhookId: string, updates: Partial<WebhookConfig>): boolean {
    const webhook = this.webhooks.get(webhookId);

    if (!webhook) {
      return false;
    }

    this.webhooks.set(webhookId, {
      ...webhook,
      ...updates,
      id: webhookId, // Prevent ID change
    });

    loggingService.info(`Webhook updated: ${webhookId}`, 'WebhookService');
    return true;
  }

  /**
   * Enable webhook
   */
  enable(webhookId: string): boolean {
    return this.update(webhookId, { enabled: true });
  }

  /**
   * Disable webhook
   */
  disable(webhookId: string): boolean {
    return this.update(webhookId, { enabled: false });
  }

  /**
   * Trigger webhooks for an event
   */
  async trigger(event: string, data: unknown, metadata?: Record<string, unknown>): Promise<void> {
    const webhooks = this.getWebhooksForEvent(event);

    if (webhooks.length === 0) {
      loggingService.debug(`No webhooks registered for event: ${event}`, 'WebhookService');
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata,
    };

    const deliveryPromises = webhooks.map((webhook) =>
      this.deliver(webhook, payload)
    );

    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Get webhooks subscribed to an event
   */
  private getWebhooksForEvent(event: string): WebhookConfig[] {
    return Array.from(this.webhooks.values()).filter(
      (webhook) =>
        webhook.enabled &&
        (webhook.events.includes(event) || webhook.events.includes('*'))
    );
  }

  /**
   * Deliver webhook payload
   */
  private async deliver(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    attempt = 1
  ): Promise<void> {
    // Check rate limit
    if (!this.checkRateLimit(webhook.id)) {
      loggingService.warn(
        `Rate limit exceeded for webhook: ${webhook.id}`,
        'WebhookService'
      );
      return;
    }

    const deliveryId = this.generateDeliveryId();
    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      url: webhook.url,
      status: 'pending',
      attempt,
      maxAttempts: webhook.retryCount || 3,
      sentAt: new Date(),
    };

    this.addDelivery(delivery);

    try {
      const startTime = performance.now();

      // Build request
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'MandA-Discovery-Suite/1.0',
        ...webhook.headers,
      };

      // Add signature if secret is configured
      if (webhook.secret) {
        headers['X-Webhook-Signature'] = this.generateSignature(
          payload,
          webhook.secret
        );
      }

      // Make request
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        webhook.timeout || 30000
      );

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = performance.now() - startTime;
      const responseBody = await response.text();

      // Update delivery
      delivery.status = response.ok ? 'success' : 'failed';
      delivery.httpStatus = response.status;
      delivery.completedAt = new Date();
      delivery.responseBody = responseBody.substring(0, 1000); // Limit size
      delivery.responseTime = responseTime;

      if (!response.ok) {
        delivery.error = `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(delivery.error);
      }

      loggingService.info(
        `Webhook delivered successfully: ${webhook.name}`,
        'WebhookService',
        {
          event: payload.event,
          responseTime: `${responseTime.toFixed(2)}ms`,
          status: response.status,
        }
      );
    } catch (error: unknown) {
      delivery.status = 'failed';
      delivery.error = error instanceof Error ? error.message : String(error);
      delivery.completedAt = new Date();

      loggingService.error(
        `Webhook delivery failed: ${webhook.name}`,
        'WebhookService',
        {
          event: payload.event,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        }
      );

      // Retry if not max attempts
      if (attempt < (webhook.retryCount || 3)) {
        const retryDelay = this.calculateRetryDelay(
          attempt,
          webhook.retryDelay || 1000
        );

        loggingService.info(
          `Retrying webhook in ${retryDelay}ms`,
          'WebhookService',
          { attempt: attempt + 1 }
        );

        await this.sleep(retryDelay);
        await this.deliver(webhook, payload, attempt + 1);
      }
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(webhookId: string): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Get timestamps for this webhook
    const timestamps = this.rateLimitMap.get(webhookId) || [];

    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter((t) => t > oneMinuteAgo);

    // Check if under limit
    if (recentTimestamps.length >= this.maxRequestsPerMinute) {
      return false;
    }

    // Add current timestamp
    recentTimestamps.push(now);
    this.rateLimitMap.set(webhookId, recentTimestamps);

    return true;
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    // Simple HMAC-like signature (in production, use crypto.subtle)
    const data = JSON.stringify(payload);
    const combined = `${secret}.${data}`;

    // Base64 encode (simplified for demo)
    return btoa(combined);
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: WebhookPayload,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return signature === expectedSignature;
  }

  /**
   * Test webhook
   */
  async test(webhookId: string): Promise<WebhookDelivery> {
    const webhook = this.webhooks.get(webhookId);

    if (!webhook) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }

    const testPayload: WebhookPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
      },
      metadata: {
        test: true,
      },
    };

    await this.deliver(webhook, testPayload);

    // Return the most recent delivery for this webhook
    const deliveries = this.getDeliveriesForWebhook(webhookId);
    return deliveries[deliveries.length - 1];
  }

  /**
   * Generate delivery ID
   */
  private generateDeliveryId(): string {
    return `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add delivery to history
   */
  private addDelivery(delivery: WebhookDelivery): void {
    this.deliveries.push(delivery);

    // Trim history if needed
    if (this.deliveries.length > this.maxDeliveryHistory) {
      this.deliveries.shift();
    }
  }

  /**
   * Get deliveries for a webhook
   */
  getDeliveriesForWebhook(webhookId: string): WebhookDelivery[] {
    return this.deliveries.filter((d) => d.webhookId === webhookId);
  }

  /**
   * Get all deliveries
   */
  getAllDeliveries(): WebhookDelivery[] {
    return [...this.deliveries];
  }

  /**
   * Get delivery by ID
   */
  getDelivery(deliveryId: string): WebhookDelivery | undefined {
    return this.deliveries.find((d) => d.id === deliveryId);
  }

  /**
   * Get webhook statistics
   */
  getStats(webhookId: string): WebhookStats {
    const deliveries = this.getDeliveriesForWebhook(webhookId);

    const successful = deliveries.filter((d) => d.status === 'success');
    const failed = deliveries.filter((d) => d.status === 'failed');

    const totalResponseTime = successful.reduce(
      (sum, d) => sum + (d.responseTime || 0),
      0
    );
    const avgResponseTime =
      successful.length > 0 ? totalResponseTime / successful.length : 0;

    const lastDelivery =
      deliveries.length > 0 ? deliveries[deliveries.length - 1].sentAt : undefined;

    const successRate =
      deliveries.length > 0 ? successful.length / deliveries.length : 0;

    return {
      webhookId,
      totalDeliveries: deliveries.length,
      successfulDeliveries: successful.length,
      failedDeliveries: failed.length,
      averageResponseTime: avgResponseTime,
      lastDelivery,
      successRate,
    };
  }

  /**
   * Clear delivery history
   */
  clearDeliveries(): void {
    this.deliveries = [];
    loggingService.info('Webhook delivery history cleared', 'WebhookService');
  }

  /**
   * Export webhooks as JSON
   */
  exportWebhooks(): string {
    const webhooks = this.getAllWebhooks();
    return JSON.stringify(webhooks, null, 2);
  }

  /**
   * Import webhooks from JSON
   */
  importWebhooks(json: string): number {
    try {
      const webhooks = JSON.parse(json) as WebhookConfig[];
      let imported = 0;

      for (const webhook of webhooks) {
        this.register(webhook);
        imported++;
      }

      loggingService.info(
        `Imported ${imported} webhooks`,
        'WebhookService'
      );

      return imported;
    } catch (error) {
      loggingService.error(
        'Failed to import webhooks',
        'WebhookService',
        error as any
      );
      throw error;
    }
  }

  /**
   * Set rate limit
   */
  setRateLimit(requestsPerMinute: number): void {
    this.maxRequestsPerMinute = requestsPerMinute;
    loggingService.info(
      `Webhook rate limit set to ${requestsPerMinute} requests/minute`,
      'WebhookService'
    );
  }

  /**
   * Get rate limit
   */
  getRateLimit(): number {
    return this.maxRequestsPerMinute;
  }
}

/**
 * Export singleton instance
 */
export const webhookService = WebhookService.getInstance();



/**
 * WebhookService Tests
 */

// Mock logging service BEFORE imports
jest.mock('./loggingService', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { WebhookService, WebhookConfig } from './webhookService';

// Mock fetch
global.fetch = jest.fn();

// Mock Date.now() to work with fake timers
let mockTime = Date.now();
jest.spyOn(Date, 'now').mockImplementation(() => mockTime);

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Advance mock time to clear rate limit window (60 seconds)
    mockTime += 61000;
    service = WebhookService.getInstance();
    // Reset rate limit to default
    service.setRateLimit(60);

    // Clear all webhooks
    const webhooks = service.getAllWebhooks();
    webhooks.forEach((w) => service.unregister(w.id));
    service.clearDeliveries();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = WebhookService.getInstance();
      const instance2 = WebhookService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Webhook Registration', () => {
    it('should register a webhook', () => {
      const config: WebhookConfig = {
        id: 'webhook1',
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: ['user.created', 'user.updated'],
        enabled: true,
      };

      service.register(config);

      const webhook = service.getWebhook('webhook1');
      expect(webhook).toBeDefined();
      expect(webhook?.name).toBe('Test Webhook');
      expect(webhook?.events).toContain('user.created');
    });

    it('should unregister a webhook', () => {
      const config: WebhookConfig = {
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com',
        events: ['test'],
        enabled: true,
      };

      service.register(config);
      expect(service.getWebhook('webhook1')).toBeDefined();

      service.unregister('webhook1');
      expect(service.getWebhook('webhook1')).toBeUndefined();
    });

    it('should get all webhooks', () => {
      service.register({
        id: 'webhook1',
        name: 'Webhook 1',
        url: 'https://example.com/1',
        events: ['test'],
        enabled: true,
      });

      service.register({
        id: 'webhook2',
        name: 'Webhook 2',
        url: 'https://example.com/2',
        events: ['test'],
        enabled: true,
      });

      const webhooks = service.getAllWebhooks();
      expect(webhooks.length).toBe(2);
    });
  });

  describe('Webhook Updates', () => {
    beforeEach(() => {
      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com',
        events: ['test'],
        enabled: true,
      });
    });

    it('should update webhook configuration', () => {
      service.update('webhook1', {
        name: 'Updated Name',
        events: ['new.event'],
      });

      const webhook = service.getWebhook('webhook1');
      expect(webhook?.name).toBe('Updated Name');
      expect(webhook?.events).toContain('new.event');
    });

    it('should enable webhook', () => {
      service.disable('webhook1');
      expect(service.getWebhook('webhook1')?.enabled).toBe(false);

      service.enable('webhook1');
      expect(service.getWebhook('webhook1')?.enabled).toBe(true);
    });

    it('should disable webhook', () => {
      service.disable('webhook1');
      expect(service.getWebhook('webhook1')?.enabled).toBe(false);
    });
  });

  describe('Webhook Triggering', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });

      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['user.created'],
        enabled: true,
      });
    });

    it('should trigger webhook for matching event', async () => {
      await service.trigger('user.created', { userId: 123 });

      // Run pending promises
      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should not trigger disabled webhook', async () => {
      service.disable('webhook1');

      await service.trigger('user.created', { userId: 123 });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not trigger for non-matching event', async () => {
      await service.trigger('user.deleted', { userId: 123 });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should trigger wildcard webhook', async () => {
      service.register({
        id: 'wildcard',
        name: 'Wildcard',
        url: 'https://example.com/all',
        events: ['*'],
        enabled: true,
      });

      await service.trigger('any.event', { data: 'test' });

      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Webhook Delivery', () => {
    beforeEach(() => {
      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['test'],
        enabled: true,
      });
    });

    it('should record successful delivery', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });

      await service.trigger('test', { data: 'test' });
      await Promise.resolve();

      const deliveries = service.getDeliveriesForWebhook('webhook1');
      expect(deliveries.length).toBe(1);
      expect(deliveries[0].status).toBe('success');
      expect(deliveries[0].httpStatus).toBe(200);
    });

    it('should record failed delivery', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Error'),
      });

      const promise = service.trigger('test', { data: 'test' });

      // Run all timers and wait for promise
      await jest.runAllTimersAsync();
      await promise;

      const deliveries = service.getDeliveriesForWebhook('webhook1');
      expect(deliveries.length).toBeGreaterThan(0);
      expect(deliveries[0].status).toBe('failed');
    }, 15000);

    it('should retry on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: jest.fn().mockResolvedValue('Success'),
        });

      service.update('webhook1', { retryCount: 2, retryDelay: 100 });

      const promise = service.trigger('test', { data: 'test' });

      // Run all pending timers to execute retries
      await jest.runOnlyPendingTimersAsync();
      await promise;

      // Should have attempted delivery multiple times
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 15000);
  });

  describe('Webhook Testing', () => {
    beforeEach(() => {
      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['test'],
        enabled: true,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });
    });

    it('should send test webhook', async () => {
      const delivery = await service.test('webhook1');

      expect(delivery).toBeDefined();
      expect(delivery.event).toBe('test');
      expect((delivery.payload.data as any).message).toContain('test');
    });

    it('should throw error for non-existent webhook', async () => {
      await expect(service.test('nonexistent')).rejects.toThrow();
    });
  });

  describe('Webhook Signatures', () => {
    beforeEach(() => {
      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['test'],
        enabled: true,
        secret: 'my-secret',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });
    });

    it('should include signature header', async () => {
      await service.trigger('test', { data: 'test' });
      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Signature': expect.any(String),
          }),
        })
      );
    });

    it('should verify signature', () => {
      const payload = {
        event: 'test',
        timestamp: '2025-01-01T00:00:00.000Z',
        data: { test: true },
      };

      const signature = (service as any).generateSignature(
        payload,
        'my-secret'
      );

      const valid = service.verifySignature(payload, signature, 'my-secret');
      expect(valid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = {
        event: 'test',
        timestamp: '2025-01-01T00:00:00.000Z',
        data: { test: true },
      };

      const valid = service.verifySignature(
        payload,
        'invalid-signature',
        'my-secret'
      );
      expect(valid).toBe(false);
    });
  });

  describe('Webhook Statistics', () => {
    beforeEach(() => {
      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['test'],
        enabled: true,
        retryCount: 1,  // No retries (attempt=1, so 1 < 1 is false)
      });
    });

    it('should calculate statistics', async () => {
      // Clear any previous deliveries
      service.clearDeliveries();
      // Verify only one webhook
      const webhooks = service.getAllWebhooks();
      expect(webhooks.length).toBe(1);
      // Successful delivery
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });

      const promise1 = service.trigger('test', { data: 1 });
      await jest.runAllTimersAsync();
      await promise1;

      // Failed delivery
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Error',
        text: jest.fn().mockResolvedValue('Error'),
      });

      const promise2 = service.trigger('test', { data: 2 });
      await jest.runAllTimersAsync();
      await promise2;

      const stats = service.getStats('webhook1');

      expect(stats.totalDeliveries).toBe(2);
      expect(stats.successfulDeliveries).toBe(1);
      expect(stats.failedDeliveries).toBe(1);
    }, 15000);
  });

  describe('Import/Export', () => {
    it('should export webhooks as JSON', () => {
      service.register({
        id: 'webhook1',
        name: 'Test 1',
        url: 'https://example.com/1',
        events: ['test'],
        enabled: true,
      });

      service.register({
        id: 'webhook2',
        name: 'Test 2',
        url: 'https://example.com/2',
        events: ['test'],
        enabled: true,
      });

      const json = service.exportWebhooks();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('should import webhooks from JSON', () => {
      const webhooks = [
        {
          id: 'webhook1',
          name: 'Imported 1',
          url: 'https://example.com/1',
          events: ['test'],
          enabled: true,
        },
        {
          id: 'webhook2',
          name: 'Imported 2',
          url: 'https://example.com/2',
          events: ['test'],
          enabled: true,
        },
      ];

      const json = JSON.stringify(webhooks);
      const imported = service.importWebhooks(json);

      expect(imported).toBe(2);
      expect(service.getWebhook('webhook1')).toBeDefined();
      expect(service.getWebhook('webhook2')).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      service.setRateLimit(2); // 2 requests per minute

      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['test'],
        enabled: true,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });
    });

    it('should enforce rate limit', async () => {
      // Reset fetch mock call count
      (global.fetch as jest.Mock).mockClear();
      // Verify webhook is registered
      const webhooks = service.getAllWebhooks();
      expect(webhooks.length).toBe(1);
      // Trigger multiple webhooks
      const promise1 = service.trigger('test', { data: 1 });
      const promise2 = service.trigger('test', { data: 2 });
      const promise3 = service.trigger('test', { data: 3 });

      // Run all timers and await promises
      await jest.runAllTimersAsync();
      await Promise.allSettled([promise1, promise2, promise3]);

      // Only 2 requests should have been made due to rate limit
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 15000);

    it('should get rate limit', () => {
      expect(service.getRateLimit()).toBe(2);
    });
  });

  describe('Delivery History', () => {
    it('should clear delivery history', async () => {
      service.register({
        id: 'webhook1',
        name: 'Test',
        url: 'https://example.com/webhook',
        events: ['test'],
        enabled: true,
      });

      // Set up fetch mock for this test
      (global.fetch as jest.Mock).mockClear();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      });
      // Verify webhook is registered
      const webhooks = service.getAllWebhooks();
      expect(webhooks.length).toBe(1);
      expect(webhooks[0].enabled).toBe(true);
      const promise = service.trigger('test', { data: 'test' });
      await jest.runAllTimersAsync();
      await promise;

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();
      // Verify deliveries exist
      expect(service.getAllDeliveries().length).toBeGreaterThan(0);

      // Clear and verify
      service.clearDeliveries();
      expect(service.getAllDeliveries().length).toBe(0);
    }, 15000);
  });
});


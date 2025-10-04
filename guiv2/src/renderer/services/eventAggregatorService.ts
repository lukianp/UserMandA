/**
 * Event Aggregator Service (Event Bus)
 *
 * Features:
 * - Global event bus implementation
 * - Typed events with TypeScript
 * - Event subscription with filters
 * - Event replay for late subscribers
 * - Event history
 * - Event metrics (count, frequency)
 * - Namespace support (app, system, user, migration)
 * - Async event handlers
 * - Event middleware (logging, validation)
 */

import * as crypto from 'crypto';
import loggingService from './loggingService';

/**
 * Event namespaces
 */
export type EventNamespace = 'app' | 'system' | 'user' | 'migration' | 'custom';

/**
 * Event definition
 */
export interface Event<T = any> {
  id: string;
  type: string;
  namespace: EventNamespace;
  payload: T;
  timestamp: Date;
  source?: string;
  correlationId?: string;
}

/**
 * Event handler function
 */
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>;

/**
 * Event filter function
 */
export type EventFilter<T = any> = (event: Event<T>) => boolean;

/**
 * Event middleware function
 */
export type EventMiddleware = (event: Event, next: () => void) => void | Promise<void>;

/**
 * Subscription
 */
interface Subscription<T = any> {
  id: string;
  type: string;
  namespace?: EventNamespace;
  handler: EventHandler<T>;
  filter?: EventFilter<T>;
  replay?: boolean;
}

/**
 * Event Aggregator Service
 */
class EventAggregatorService {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private history: Event[] = [];
  private middleware: EventMiddleware[] = [];
  private maxHistorySize: number = 1000;
  private metrics: Map<string, { count: number; lastEmitted: Date }> = new Map();

  /**
   * Subscribe to events
   */
  subscribe<T = any>(
    type: string,
    handler: EventHandler<T>,
    options?: {
      namespace?: EventNamespace;
      filter?: EventFilter<T>;
      replay?: boolean;
    }
  ): string {
    const subscriptionId = crypto.randomUUID();

    const subscription: Subscription<T> = {
      id: subscriptionId,
      type,
      namespace: options?.namespace,
      handler,
      filter: options?.filter,
      replay: options?.replay || false,
    };

    // Add to subscriptions map
    const typeSubscriptions = this.subscriptions.get(type) || [];
    typeSubscriptions.push(subscription);
    this.subscriptions.set(type, typeSubscriptions);

    loggingService.debug(`Subscribed to event: ${type}`, 'EventAggregator', { subscriptionId });

    // Replay past events if requested
    if (subscription.replay) {
      this.replayEvents(subscription);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [type, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(type);
        }
        loggingService.debug(`Unsubscribed from event`, 'EventAggregator', { subscriptionId });
        return true;
      }
    }
    return false;
  }

  /**
   * Publish an event
   */
  async publish<T = any>(
    type: string,
    payload: T,
    options?: {
      namespace?: EventNamespace;
      source?: string;
      correlationId?: string;
    }
  ): Promise<void> {
    const event: Event<T> = {
      id: crypto.randomUUID(),
      type,
      namespace: options?.namespace || 'app',
      payload,
      timestamp: new Date(),
      source: options?.source,
      correlationId: options?.correlationId,
    };

    // Add to history
    this.history.push(event);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Update metrics
    const metric = this.metrics.get(type) || { count: 0, lastEmitted: new Date() };
    metric.count++;
    metric.lastEmitted = event.timestamp;
    this.metrics.set(type, metric);

    loggingService.trace(`Event published: ${type}`, 'EventAggregator', { eventId: event.id });

    // Execute middleware chain
    await this.executeMiddleware(event, async () => {
      await this.notifySubscribers(event);
    });
  }

  /**
   * Execute middleware chain
   */
  private async executeMiddleware(event: Event, finalHandler: () => Promise<void>): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index];
        index++;
        await middleware(event, next);
      } else {
        await finalHandler();
      }
    };

    await next();
  }

  /**
   * Notify subscribers
   */
  private async notifySubscribers<T = any>(event: Event<T>): Promise<void> {
    const subscriptions = this.subscriptions.get(event.type) || [];

    const handlers = subscriptions.filter((sub) => {
      // Filter by namespace
      if (sub.namespace && sub.namespace !== event.namespace) {
        return false;
      }

      // Apply custom filter
      if (sub.filter && !sub.filter(event)) {
        return false;
      }

      return true;
    });

    // Execute handlers
    const handlerPromises = handlers.map(async (sub) => {
      try {
        await sub.handler(event);
      } catch (error: any) {
        loggingService.error(
          `Event handler error for ${event.type}`,
          'EventAggregator',
          { subscriptionId: sub.id },
          error
        );
      }
    });

    await Promise.all(handlerPromises);
  }

  /**
   * Replay past events for a subscription
   */
  private async replayEvents<T = any>(subscription: Subscription<T>): Promise<void> {
    const events = this.history.filter((e) => {
      if (e.type !== subscription.type) return false;
      if (subscription.namespace && e.namespace !== subscription.namespace) return false;
      if (subscription.filter && !subscription.filter(e as Event<T>)) return false;
      return true;
    });

    loggingService.debug(
      `Replaying ${events.length} events for subscription`,
      'EventAggregator',
      { subscriptionId: subscription.id }
    );

    for (const event of events) {
      try {
        await subscription.handler(event as Event<T>);
      } catch (error: any) {
        loggingService.error(
          `Event replay handler error for ${event.type}`,
          'EventAggregator',
          { subscriptionId: subscription.id },
          error
        );
      }
    }
  }

  /**
   * Add middleware
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
    loggingService.debug('Added event middleware', 'EventAggregator');
  }

  /**
   * Get event history
   */
  getHistory(type?: string, namespace?: EventNamespace, limit?: number): Event[] {
    let history = this.history;

    if (type) {
      history = history.filter((e) => e.type === type);
    }

    if (namespace) {
      history = history.filter((e) => e.namespace === namespace);
    }

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Get event metrics
   */
  getMetrics(type?: string) {
    if (type) {
      return this.metrics.get(type);
    }

    const allMetrics: Record<string, { count: number; lastEmitted: Date }> = {};
    for (const [eventType, metric] of this.metrics.entries()) {
      allMetrics[eventType] = metric;
    }

    return allMetrics;
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(type?: string): number {
    if (type) {
      return this.subscriptions.get(type)?.length || 0;
    }

    let total = 0;
    for (const subs of this.subscriptions.values()) {
      total += subs.length;
    }
    return total;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    loggingService.info('Event history cleared', 'EventAggregator');
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    loggingService.info('Event metrics cleared', 'EventAggregator');
  }

  /**
   * Shutdown service
   */
  shutdown(): void {
    this.subscriptions.clear();
    this.history = [];
    this.middleware = [];
    this.metrics.clear();
    loggingService.info('EventAggregatorService shut down', 'EventAggregator');
  }
}

export default new EventAggregatorService();

/**
 * WebSocket Management Service
 *
 * Features:
 * - WebSocket connection management
 * - Automatic reconnection with exponential backoff
 * - Message queue during disconnect
 * - Heartbeat/ping-pong for connection health
 * - Binary and text message support
 * - Request-response pattern over WebSocket
 * - Subscription management (pub/sub)
 * - Connection pooling for multiple endpoints
 * - Integration with real-time updates
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import WebSocket from 'ws';

/**
 * Connection status
 */
export type WSConnectionStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';

/**
 * Message type
 */
export type MessageType = 'text' | 'binary' | 'request' | 'response' | 'subscribe' | 'unsubscribe' | 'publish';

/**
 * WebSocket message
 */
export interface WSMessage {
  id: string;
  type: MessageType;
  channel?: string;
  data: any;
  timestamp: Date;
}

/**
 * WebSocket configuration
 */
export interface WSConfig {
  url: string;
  reconnectInterval: number; // Initial reconnect delay
  maxReconnectInterval: number; // Max reconnect delay
  reconnectDecay: number; // Exponential backoff multiplier
  heartbeatInterval: number; // Ping interval
  messageQueueSize: number; // Max queued messages
  requestTimeout: number; // Request-response timeout
}

/**
 * Pending request
 */
interface PendingRequest {
  id: string;
  resolve: (response: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

/**
 * Subscription callback
 */
type SubscriptionCallback = (data: any) => void;

/**
 * WebSocket Connection
 */
class WSConnection extends EventEmitter {
  private config: WSConfig;
  private ws: WebSocket | null = null;
  private status: WSConnectionStatus = 'disconnected';
  private messageQueue: WSMessage[] = [];
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;

  constructor(config: WSConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }

    this.status = 'connecting';
    this.emit('status', this.status);

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.on('open', () => this.handleOpen());
      this.ws.on('message', (data) => this.handleMessage(data));
      this.ws.on('error', (error) => this.handleError(error));
      this.ws.on('close', (code, reason) => this.handleClose(code, reason.toString()));
      this.ws.on('ping', () => this.handlePing());
      this.ws.on('pong', () => this.handlePong());

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle connection open
   */
  private handleOpen(): void {
    this.status = 'connected';
    this.reconnectAttempts = 0;
    this.emit('status', this.status);
    this.emit('connected');

    console.log(`WebSocket connected: ${this.config.url}`);

    // Start heartbeat
    this.startHeartbeat();

    // Flush message queue
    this.flushMessageQueue();
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'response':
          this.handleResponse(message);
          break;
        case 'publish':
          this.handlePublish(message);
          break;
        default:
          this.emit('message', message);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle response message
   */
  private handleResponse(message: WSMessage): void {
    const request = this.pendingRequests.get(message.id);

    if (request) {
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.id);
      request.resolve(message.data);
    }
  }

  /**
   * Handle publish message
   */
  private handlePublish(message: WSMessage): void {
    if (!message.channel) return;

    const callbacks = this.subscriptions.get(message.channel);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(message.data);
        } catch (error) {
          console.error(`Subscription callback error for ${message.channel}:`, error);
        }
      }
    }
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    this.status = 'error';
    this.emit('status', this.status);
    this.emit('error', error);

    console.error('WebSocket error:', error);
  }

  /**
   * Handle connection close
   */
  private handleClose(code: number, reason: string): void {
    this.status = 'disconnected';
    this.emit('status', this.status);
    this.emit('disconnected', { code, reason });

    console.log(`WebSocket disconnected: ${this.config.url} (${code}: ${reason})`);

    this.stopHeartbeat();

    // Attempt reconnection
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      return; // Already scheduled
    }

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(this.config.reconnectDecay, this.reconnectAttempts),
      this.config.maxReconnectInterval
    );

    this.reconnectAttempts++;

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  /**
   * Cancel reconnection
   */
  private cancelReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle ping
   */
  private handlePing(): void {
    this.emit('ping');
  }

  /**
   * Handle pong
   */
  private handlePong(): void {
    this.emit('pong');
  }

  /**
   * Send message
   */
  send(message: Omit<WSMessage, 'id' | 'timestamp'>): void {
    const fullMessage: WSMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      // Queue message
      if (this.messageQueue.length < this.config.messageQueueSize) {
        this.messageQueue.push(fullMessage);
      } else {
        console.warn('Message queue full, dropping message');
      }
    }
  }

  /**
   * Send request and wait for response
   */
  async request(data: any, timeout?: number): Promise<any> {
    const requestId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const timeoutMs = timeout || this.config.requestTimeout;

      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }, timeoutMs);

      this.pendingRequests.set(requestId, {
        id: requestId,
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      this.send({
        type: 'request',
        data,
      });
    });
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string, callback: SubscriptionCallback): () => void {
    let callbacks = this.subscriptions.get(channel);

    if (!callbacks) {
      callbacks = new Set();
      this.subscriptions.set(channel, callbacks);

      // Send subscribe message
      this.send({
        type: 'subscribe',
        channel,
        data: null,
      });
    }

    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, callback);
    };
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string, callback: SubscriptionCallback): void {
    const callbacks = this.subscriptions.get(channel);

    if (callbacks) {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        this.subscriptions.delete(channel);

        // Send unsubscribe message
        this.send({
          type: 'unsubscribe',
          channel,
          data: null,
        });
      }
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.cancelReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.status = 'disconnecting';
      this.emit('status', this.status);

      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.status = 'disconnected';
    this.emit('status', this.status);
  }

  /**
   * Get connection status
   */
  getStatus(): WSConnectionStatus {
    return this.status;
  }

  /**
   * Is connected
   */
  isConnected(): boolean {
    return this.status === 'connected';
  }
}

/**
 * WebSocket Management Service
 */
class WebSocketService {
  private connections: Map<string, WSConnection> = new Map();

  /**
   * Create a WebSocket connection
   */
  createConnection(name: string, config: WSConfig): WSConnection {
    if (this.connections.has(name)) {
      throw new Error(`Connection ${name} already exists`);
    }

    const connection = new WSConnection(config);
    this.connections.set(name, connection);

    console.log(`Created WebSocket connection: ${name}`);

    return connection;
  }

  /**
   * Get a connection by name
   */
  getConnection(name: string): WSConnection | undefined {
    return this.connections.get(name);
  }

  /**
   * Close a connection
   */
  closeConnection(name: string): void {
    const connection = this.connections.get(name);

    if (connection) {
      connection.disconnect();
      this.connections.delete(name);

      console.log(`Closed WebSocket connection: ${name}`);
    }
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    for (const [name, connection] of this.connections.entries()) {
      connection.disconnect();
      console.log(`Closed WebSocket connection: ${name}`);
    }

    this.connections.clear();
  }

  /**
   * Get all connection names
   */
  getConnectionNames(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Shutdown service
   */
  shutdown(): void {
    console.log('Shutting down WebSocketService...');
    this.closeAllConnections();
    console.log('WebSocketService shutdown complete');
  }
}

export default new WebSocketService();
export { WSConnection };

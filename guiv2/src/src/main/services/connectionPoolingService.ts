/**
 * Connection Pooling Service
 *
 * Features:
 * - Database connection pooling
 * - HTTP connection pooling
 * - PowerShell session pooling (reuse sessions)
 * - Connection health checks
 * - Connection recycling on error
 * - Connection limits (min, max)
 * - Connection timeout handling
 * - Pool statistics
 * - Integration with existing services
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

/**
 * Connection types
 */
export type ConnectionType = 'database' | 'http' | 'powershell' | 'custom';

/**
 * Connection status
 */
export type ConnectionStatus = 'idle' | 'active' | 'unhealthy' | 'closed';

/**
 * Connection interface
 */
export interface Connection {
  id: string;
  type: ConnectionType;
  status: ConnectionStatus;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
  maxUseCount: number;
  connection: any; // The actual connection object
  metadata?: Record<string, any>;
}

/**
 * Pool configuration
 */
export interface PoolConfig {
  type: ConnectionType;
  minConnections: number;
  maxConnections: number;
  maxUseCount: number; // Max uses before recycling
  idleTimeout: number; // ms before idle connection is closed
  connectionTimeout: number; // ms for connection establishment
  healthCheckInterval: number; // ms between health checks
  acquireTimeout: number; // ms to wait for available connection
}

/**
 * Connection factory function
 */
export type ConnectionFactory<T = any> = () => Promise<T>;

/**
 * Connection validator function
 */
export type ConnectionValidator<T = any> = (connection: T) => Promise<boolean>;

/**
 * Connection pool
 */
class ConnectionPool<T = any> extends EventEmitter {
  private config: PoolConfig;
  private connections: Map<string, Connection>;
  private availableQueue: string[]; // IDs of available connections
  private waitingQueue: Array<{
    resolve: (connection: Connection) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }>;
  private factory: ConnectionFactory<T>;
  private validator: ConnectionValidator<T>;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor(
    config: PoolConfig,
    factory: ConnectionFactory<T>,
    validator: ConnectionValidator<T>
  ) {
    super();

    this.config = config;
    this.connections = new Map();
    this.availableQueue = [];
    this.waitingQueue = [];
    this.factory = factory;
    this.validator = validator;
  }

  /**
   * Initialize the pool
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn(`Connection pool for ${this.config.type} already initialized`);
      return;
    }

    console.log(`Initializing ${this.config.type} connection pool (min: ${this.config.minConnections}, max: ${this.config.maxConnections})`);

    // Create minimum connections
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }

    await Promise.all(promises);

    // Start health check interval
    this.healthCheckInterval = setInterval(
      () => this.performHealthChecks(),
      this.config.healthCheckInterval
    );

    // Start cleanup interval
    this.cleanupInterval = setInterval(
      () => this.cleanupIdleConnections(),
      this.config.idleTimeout / 2
    );

    this.initialized = true;
    this.emit('initialized', { type: this.config.type, poolSize: this.connections.size });
  }

  /**
   * Create a new connection
   */
  private async createConnection(): Promise<void> {
    if (this.connections.size >= this.config.maxConnections) {
      throw new Error(`Max connections reached for ${this.config.type} pool`);
    }

    try {
      const connection = await Promise.race([
        this.factory(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), this.config.connectionTimeout)
        ),
      ]);

      const id = crypto.randomUUID();
      const conn: Connection = {
        id,
        type: this.config.type,
        status: 'idle',
        createdAt: new Date(),
        lastUsed: new Date(),
        useCount: 0,
        maxUseCount: this.config.maxUseCount,
        connection,
      };

      this.connections.set(id, conn);
      this.availableQueue.push(id);

      console.log(`Created ${this.config.type} connection: ${id}`);
      this.emit('connection:created', conn);

      // Process waiting queue
      this.processWaitingQueue();
    } catch (error) {
      console.error(`Failed to create ${this.config.type} connection:`, error);
      throw error;
    }
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<Connection> {
    if (!this.initialized) {
      throw new Error('Pool not initialized');
    }

    // Try to get available connection
    if (this.availableQueue.length > 0) {
      const id = this.availableQueue.shift()!;
      const connection = this.connections.get(id);

      if (connection) {
        connection.status = 'active';
        connection.lastUsed = new Date();
        connection.useCount++;
        this.emit('connection:acquired', connection);
        return connection;
      }
    }

    // Try to create new connection if under max
    if (this.connections.size < this.config.maxConnections) {
      await this.createConnection();
      return this.acquire(); // Recursively acquire
    }

    // Wait for connection to become available
    return new Promise<Connection>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex((w) => w.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error(`Timeout waiting for ${this.config.type} connection`));
      }, this.config.acquireTimeout);

      this.waitingQueue.push({
        resolve: (conn) => {
          clearTimeout(timeout);
          resolve(conn);
        },
        reject,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Release a connection back to the pool
   */
  async release(connectionId: string, error?: Error): Promise<void> {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      console.warn(`Connection not found: ${connectionId}`);
      return;
    }

    // If error occurred or max use count reached, recycle the connection
    if (error || connection.useCount >= connection.maxUseCount) {
      await this.recycleConnection(connectionId);
      return;
    }

    // Mark as idle and add back to available queue
    connection.status = 'idle';
    connection.lastUsed = new Date();
    this.availableQueue.push(connectionId);

    this.emit('connection:released', connection);

    // Process waiting queue
    this.processWaitingQueue();
  }

  /**
   * Process waiting queue
   */
  private processWaitingQueue(): void {
    while (this.waitingQueue.length > 0 && this.availableQueue.length > 0) {
      const waiter = this.waitingQueue.shift();
      const id = this.availableQueue.shift();

      if (waiter && id) {
        const connection = this.connections.get(id);
        if (connection) {
          connection.status = 'active';
          connection.lastUsed = new Date();
          connection.useCount++;
          waiter.resolve(connection);
          this.emit('connection:acquired', connection);
        }
      }
    }
  }

  /**
   * Recycle a connection
   */
  private async recycleConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return;
    }

    // Close the connection
    try {
      if (connection.connection && typeof connection.connection.close === 'function') {
        await connection.connection.close();
      } else if (connection.connection && typeof connection.connection.destroy === 'function') {
        connection.connection.destroy();
      }
    } catch (error) {
      console.error(`Error closing connection ${connectionId}:`, error);
    }

    // Remove from pool
    this.connections.delete(connectionId);
    const queueIndex = this.availableQueue.indexOf(connectionId);
    if (queueIndex !== -1) {
      this.availableQueue.splice(queueIndex, 1);
    }

    console.log(`Recycled ${this.config.type} connection: ${connectionId}`);
    this.emit('connection:recycled', { id: connectionId });

    // Create replacement if below minimum
    if (this.connections.size < this.config.minConnections) {
      await this.createConnection().catch((error) => {
        console.error('Failed to create replacement connection:', error);
      });
    }
  }

  /**
   * Perform health checks on idle connections
   */
  private async performHealthChecks(): Promise<void> {
    for (const [id, connection] of this.connections.entries()) {
      if (connection.status === 'idle') {
        try {
          const isHealthy = await this.validator(connection.connection);

          if (!isHealthy) {
            console.warn(`Connection ${id} failed health check`);
            connection.status = 'unhealthy';
            await this.recycleConnection(id);
          }
        } catch (error) {
          console.error(`Health check failed for connection ${id}:`, error);
          connection.status = 'unhealthy';
          await this.recycleConnection(id);
        }
      }
    }
  }

  /**
   * Clean up idle connections beyond minimum
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();

    for (const [id, connection] of this.connections.entries()) {
      if (
        connection.status === 'idle' &&
        this.connections.size > this.config.minConnections &&
        now - connection.lastUsed.getTime() > this.config.idleTimeout
      ) {
        this.recycleConnection(id).catch((error) => {
          console.error(`Error cleaning up connection ${id}:`, error);
        });
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStatistics() {
    const connections = Array.from(this.connections.values());

    return {
      type: this.config.type,
      total: connections.length,
      idle: connections.filter((c) => c.status === 'idle').length,
      active: connections.filter((c) => c.status === 'active').length,
      unhealthy: connections.filter((c) => c.status === 'unhealthy').length,
      waiting: this.waitingQueue.length,
      averageUseCount: connections.length > 0
        ? connections.reduce((sum, c) => sum + c.useCount, 0) / connections.length
        : 0,
    };
  }

  /**
   * Shutdown the pool
   */
  async shutdown(): Promise<void> {
    console.log(`Shutting down ${this.config.type} connection pool...`);

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Reject all waiting requests
    for (const waiter of this.waitingQueue) {
      waiter.reject(new Error('Pool is shutting down'));
    }
    this.waitingQueue = [];

    // Close all connections
    const closePromises: Promise<void>[] = [];
    for (const id of this.connections.keys()) {
      closePromises.push(this.recycleConnection(id));
    }

    await Promise.all(closePromises);

    this.connections.clear();
    this.availableQueue = [];
    this.initialized = false;

    console.log(`${this.config.type} connection pool shutdown complete`);
  }
}

/**
 * Connection Pooling Service
 */
class ConnectionPoolingService {
  private pools: Map<string, ConnectionPool>;

  constructor() {
    this.pools = new Map();
  }

  /**
   * Create a new connection pool
   */
  createPool<T = any>(
    name: string,
    config: PoolConfig,
    factory: ConnectionFactory<T>,
    validator: ConnectionValidator<T>
  ): ConnectionPool<T> {
    if (this.pools.has(name)) {
      throw new Error(`Pool ${name} already exists`);
    }

    const pool = new ConnectionPool<T>(config, factory, validator);
    this.pools.set(name, pool);

    console.log(`Created connection pool: ${name}`);
    return pool;
  }

  /**
   * Get a pool by name
   */
  getPool<T = any>(name: string): ConnectionPool<T> | undefined {
    return this.pools.get(name) as ConnectionPool<T> | undefined;
  }

  /**
   * Get all pool names
   */
  getPoolNames(): string[] {
    return Array.from(this.pools.keys());
  }

  /**
   * Get statistics for all pools
   */
  getAllStatistics() {
    const stats: Record<string, any> = {};

    for (const [name, pool] of this.pools.entries()) {
      stats[name] = pool.getStatistics();
    }

    return stats;
  }

  /**
   * Shutdown all pools
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down all connection pools...');

    const shutdownPromises: Promise<void>[] = [];

    for (const pool of this.pools.values()) {
      shutdownPromises.push(pool.shutdown());
    }

    await Promise.all(shutdownPromises);

    this.pools.clear();

    console.log('All connection pools shut down');
  }
}

export default new ConnectionPoolingService();
export { ConnectionPool };

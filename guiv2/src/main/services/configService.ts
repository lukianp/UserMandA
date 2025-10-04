/**
 * Configuration Service
 * Manages application configuration with persistence to file system
 */

import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';

interface ConfigData {
  [key: string]: unknown;
}

export class ConfigService {
  private configPath: string;
  private config: ConfigData = {};
  private initialized = false;

  constructor() {
    // Store config in user data directory
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
  }

  /**
   * Initialize the config service by loading from disk
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty config
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading config:', error);
      }
      this.config = this.getDefaultConfig();
      await this.save();
    }

    this.initialized = true;
  }

  /**
   * Get a configuration value
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    await this.ensureInitialized();
    return this.config[key] as T;
  }

  /**
   * Set a configuration value
   */
  async set(key: string, value: unknown): Promise<void> {
    await this.ensureInitialized();
    this.config[key] = value;
    await this.save();
  }

  /**
   * Get all configuration
   */
  async getAll(): Promise<ConfigData> {
    await this.ensureInitialized();
    return { ...this.config };
  }

  /**
   * Delete a configuration key
   */
  async delete(key: string): Promise<void> {
    await this.ensureInitialized();
    delete this.config[key];
    await this.save();
  }

  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    this.config = this.getDefaultConfig();
    await this.save();
  }

  /**
   * Save configuration to disk
   */
  private async save(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });

      // Write config with pretty formatting
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ConfigData {
    return {
      theme: 'light',
      language: 'en',
      powerShell: {
        maxPoolSize: 10,
        minPoolSize: 2,
        sessionTimeout: 300000, // 5 minutes
        executionTimeout: 60000, // 1 minute
      },
      discovery: {
        defaultTimeout: 30000,
        maxConcurrentOperations: 5,
      },
      ui: {
        enableAnimations: true,
        compactMode: false,
        showSystemStatus: true,
      },
      logging: {
        level: 'info',
        maxLogFiles: 10,
        maxLogSize: 10485760, // 10MB
      },
    };
  }
}

export default ConfigService;

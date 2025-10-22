/**
 * Module Registry System
 *
 * Centralized registry for PowerShell discovery/migration modules.
 * Provides metadata, categorization, validation, and execution routing.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { ExecutionOptions, ExecutionResult } from '../../types/shared';

import PowerShellExecutionService from './powerShellService';

/**
 * Module categories
 */
export type ModuleCategory =
  | 'discovery'
  | 'migration'
  | 'reporting'
  | 'security'
  | 'compliance'
  | 'analysis'
  | 'utilities';

/**
 * Parameter definition for module functions
 */
export interface ParameterDefinition {
  /** Parameter name */
  name: string;
  /** Parameter data type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  /** Whether parameter is required */
  required: boolean;
  /** Default value if not provided */
  default?: any;
  /** Human-readable description */
  description?: string;
  /** Validation rules */
  validation?: {
    /** Minimum value (for numbers) */
    min?: number;
    /** Maximum value (for numbers) */
    max?: number;
    /** Minimum length (for strings/arrays) */
    minLength?: number;
    /** Maximum length (for strings/arrays) */
    maxLength?: number;
    /** Regular expression pattern (for strings) */
    pattern?: string;
    /** Allowed values (enum) */
    enum?: any[];
  };
}

/**
 * Module definition
 */
export interface ModuleDefinition {
  /** Unique module identifier */
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** Detailed description of module functionality */
  description: string;
  /** Module category */
  category: ModuleCategory;
  /** Icon identifier (Lucide icon name) */
  icon: string;
  /** Execution priority (higher = more important) */
  priority: number;
  /** Whether module is currently enabled */
  enabled: boolean;
  /** Default timeout in milliseconds */
  timeout: number;
  /** Relative path to PowerShell script */
  scriptPath: string;
  /** Function name to invoke (for modules) */
  functionName?: string;
  /** Required permissions/roles */
  requiredPermissions: string[];
  /** Parameter definitions */
  parameters: ParameterDefinition[];
  /** Module version */
  version: string;
  /** Module author */
  author?: string;
  /** Last updated timestamp */
  lastUpdated?: string;
  /** Tags for searchability */
  tags?: string[];
  /** Estimated execution time (seconds) */
  estimatedDuration?: number;
}

/**
 * Validation error
 */
interface ValidationError {
  parameter: string;
  message: string;
  value?: any;
}

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Module Registry
 * Manages discovery, validation, and execution of PowerShell modules
 */
class ModuleRegistry {
  private modules: Map<string, ModuleDefinition>;
  private categories: Map<ModuleCategory, ModuleDefinition[]>;
  private psService: PowerShellExecutionService;
  private registryPath: string;
  private loaded: boolean;

  constructor(psService: PowerShellExecutionService, registryPath?: string) {
    this.modules = new Map();
    this.categories = new Map();
    this.psService = psService;
    this.registryPath = registryPath || path.join(process.cwd(), 'module-registry.json');
    this.loaded = false;
  }

  /**
   * Load module registry from JSON file
   */
  async loadRegistry(customPath?: string): Promise<void> {
    const loadPath = customPath || this.registryPath;

    try {
      const data = await fs.readFile(loadPath, 'utf-8');
      const registry = JSON.parse(data);

      if (registry.modules && Array.isArray(registry.modules)) {
        for (const module of registry.modules) {
          await this.registerModule(module);
        }
        console.log(`Loaded ${this.modules.size} modules from registry`);
        this.loaded = true;
      } else {
        console.warn('Invalid registry format, expected { modules: [...] }');
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`No module registry found at ${loadPath}, starting with empty registry`);
        this.loaded = true;
      } else {
        console.error(`Failed to load module registry: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Save current registry to JSON file
   */
  async saveRegistry(customPath?: string): Promise<void> {
    const savePath = customPath || this.registryPath;
    const modules = Array.from(this.modules.values());

    const registry = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      modules,
    };

    try {
      await fs.writeFile(savePath, JSON.stringify(registry, null, 2), 'utf-8');
      console.log(`Saved ${modules.length} modules to registry`);
    } catch (error: any) {
      console.error(`Failed to save module registry: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register a new module
   */
  async registerModule(module: ModuleDefinition): Promise<void> {
    // Validate module definition
    if (!module.id || !module.displayName || !module.scriptPath) {
      throw new Error('Module must have id, displayName, and scriptPath');
    }

    // Check for duplicate ID
    if (this.modules.has(module.id)) {
      console.warn(`Module ${module.id} already registered, overwriting`);
    }

    // Set defaults
    const fullModule: ModuleDefinition = {
      ...module,
      enabled: module.enabled !== false,
      priority: module.priority || 100,
      timeout: module.timeout || 60000,
      requiredPermissions: module.requiredPermissions || [],
      parameters: module.parameters || [],
      version: module.version || '1.0.0',
      tags: module.tags || [],
    };

    // Add to modules map
    this.modules.set(module.id, fullModule);

    // Add to category map
    if (!this.categories.has(module.category)) {
      this.categories.set(module.category, []);
    }
    const categoryModules = this.categories.get(module.category)!;
    // Remove if already exists in category
    const existingIndex = categoryModules.findIndex(m => m.id === module.id);
    if (existingIndex >= 0) {
      categoryModules.splice(existingIndex, 1);
    }
    categoryModules.push(fullModule);
    // Sort by priority (descending)
    categoryModules.sort((a, b) => b.priority - a.priority);

    console.log(`Registered module: ${module.id} (${module.category})`);
  }

  /**
   * Unregister a module
   */
  async unregisterModule(moduleId: string): Promise<boolean> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return false;
    }

    // Remove from modules map
    this.modules.delete(moduleId);

    // Remove from category map
    const categoryModules = this.categories.get(module.category);
    if (categoryModules) {
      const index = categoryModules.findIndex(m => m.id === moduleId);
      if (index >= 0) {
        categoryModules.splice(index, 1);
      }
    }

    console.log(`Unregistered module: ${moduleId}`);
    return true;
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: string): ModuleDefinition | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all modules
   */
  getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get all categories with module counts
   */
  getCategories(): Array<{ category: ModuleCategory; count: number }> {
    return Array.from(this.categories.entries()).map(([category, modules]) => ({
      category,
      count: modules.length,
    }));
  }

  /**
   * Validate module parameters
   */
  validateModuleParameters(moduleId: string, params: Record<string, any>): ValidationResult {
    const module = this.modules.get(moduleId);
    if (!module) {
      return {
        valid: false,
        errors: [{ parameter: '_module', message: `Module ${moduleId} not found` }],
      };
    }

    const errors: ValidationError[] = [];

    // Check required parameters
    for (const param of module.parameters) {
      const value = params[param.name];

      // Required check
      if (param.required && (value === undefined || value === null)) {
        errors.push({
          parameter: param.name,
          message: `Parameter '${param.name}' is required`,
        });
        continue;
      }

      // Skip validation if optional and not provided
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (param.type !== actualType && param.type !== 'object') {
        errors.push({
          parameter: param.name,
          message: `Parameter '${param.name}' must be of type ${param.type}, got ${actualType}`,
          value,
        });
        continue;
      }

      // Validation rules
      if (param.validation) {
        const { validation } = param;

        // Number validations
        if (param.type === 'number') {
          if (validation.min !== undefined && value < validation.min) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' must be >= ${validation.min}`,
              value,
            });
          }
          if (validation.max !== undefined && value > validation.max) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' must be <= ${validation.max}`,
              value,
            });
          }
        }

        // String validations
        if (param.type === 'string') {
          if (validation.minLength !== undefined && value.length < validation.minLength) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' must have at least ${validation.minLength} characters`,
              value,
            });
          }
          if (validation.maxLength !== undefined && value.length > validation.maxLength) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' must have at most ${validation.maxLength} characters`,
              value,
            });
          }
          if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' does not match required pattern`,
              value,
            });
          }
        }

        // Array validations
        if (param.type === 'array') {
          if (validation.minLength !== undefined && value.length < validation.minLength) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' must have at least ${validation.minLength} items`,
              value,
            });
          }
          if (validation.maxLength !== undefined && value.length > validation.maxLength) {
            errors.push({
              parameter: param.name,
              message: `Parameter '${param.name}' must have at most ${validation.maxLength} items`,
              value,
            });
          }
        }

        // Enum validation
        if (validation.enum && !validation.enum.includes(value)) {
          errors.push({
            parameter: param.name,
            message: `Parameter '${param.name}' must be one of: ${validation.enum.join(', ')}`,
            value,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply default values to parameters
   */
  private applyDefaults(module: ModuleDefinition, params: Record<string, any>): Record<string, any> {
    const result = { ...params };

    for (const param of module.parameters) {
      if (result[param.name] === undefined && param.default !== undefined) {
        result[param.name] = param.default;
      }
    }

    return result;
  }

  /**
   * Execute a module by ID
   */
  async executeModule(
    moduleId: string,
    params: Record<string, any> = {},
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    const module = this.modules.get(moduleId);

    if (!module) {
      return {
        success: false,
        error: `Module ${moduleId} not found in registry`,
        duration: 0,
        warnings: [],
      };
    }

    if (!module.enabled) {
      return {
        success: false,
        error: `Module ${moduleId} is disabled`,
        duration: 0,
        warnings: [],
      };
    }

    // Apply defaults
    const paramsWithDefaults = this.applyDefaults(module, params);

    // Validate parameters
    const validation = this.validateModuleParameters(moduleId, paramsWithDefaults);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => `  - ${e.parameter}: ${e.message}`).join('\n');
      return {
        success: false,
        error: `Parameter validation failed:\n${errorMessages}`,
        duration: 0,
        warnings: [],
      };
    }

    // Build execution options
    const execOptions: ExecutionOptions = {
      timeout: module.timeout,
      ...options,
    };

    // Convert params to script arguments
    const args: string[] = [];
    for (const [key, value] of Object.entries(paramsWithDefaults)) {
      args.push(`-${key}`);
      if (typeof value === 'object') {
        args.push(JSON.stringify(value));
      } else {
        args.push(String(value));
      }
    }

    console.log(`Executing module ${moduleId} with args:`, args);

    // Execute via PowerShell service
    return this.psService.executeScript(module.scriptPath, args, execOptions);
  }

  /**
   * Search modules by query
   */
  searchModules(query: string): ModuleDefinition[] {
    const lowerQuery = query.toLowerCase();
    const results: ModuleDefinition[] = [];

    for (const module of this.modules.values()) {
      // Search in ID, display name, description, and tags
      if (
        module.id.toLowerCase().includes(lowerQuery) ||
        module.displayName.toLowerCase().includes(lowerQuery) ||
        module.description.toLowerCase().includes(lowerQuery) ||
        (module.tags && module.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      ) {
        results.push(module);
      }
    }

    // Sort by priority
    results.sort((a, b) => b.priority - a.priority);

    return results;
  }

  /**
   * Get modules by tags
   */
  getModulesByTags(tags: string[]): ModuleDefinition[] {
    const results: ModuleDefinition[] = [];
    const lowerTags = tags.map(t => t.toLowerCase());

    for (const module of this.modules.values()) {
      if (module.tags && module.tags.some(tag => lowerTags.includes(tag.toLowerCase()))) {
        results.push(module);
      }
    }

    results.sort((a, b) => b.priority - a.priority);

    return results;
  }

  /**
   * Get registry statistics
   */
  getStatistics() {
    const totalModules = this.modules.size;
    const enabledModules = Array.from(this.modules.values()).filter(m => m.enabled).length;
    const categories = this.getCategories();

    return {
      totalModules,
      enabledModules,
      disabledModules: totalModules - enabledModules,
      categories,
      loaded: this.loaded,
    };
  }
}

export default ModuleRegistry;

/**
 * Authorization Service
 * Implements Role-Based Access Control (RBAC) with resource permissions
 *
 * Features:
 * - Role hierarchy (Admin > PowerUser > Analyst > ReadOnly)
 * - Resource-based permissions (users, groups, migrations, reports, settings)
 * - Permission inheritance and caching
 * - Audit trail for authorization decisions
 * - Dynamic permission evaluation
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';

// ============================================================================
// Types
// ============================================================================

/**
 * System roles with hierarchical structure
 */
export enum Role {
  Admin = 'Admin',
  PowerUser = 'PowerUser',
  Analyst = 'Analyst',
  ReadOnly = 'ReadOnly'
}

/**
 * Permission types
 */
export enum Permission {
  Read = 'read',
  Write = 'write',
  Execute = 'execute',
  Delete = 'delete',
  Export = 'export',
  Import = 'import',
  Manage = 'manage'
}

/**
 * Resource types
 */
export enum Resource {
  Users = 'users',
  Groups = 'groups',
  Migrations = 'migrations',
  Reports = 'reports',
  Settings = 'settings',
  Profiles = 'profiles',
  Discoveries = 'discoveries',
  Infrastructure = 'infrastructure',
  Applications = 'applications',
  Audit = 'audit',
  Security = 'security'
}

/**
 * User role assignment
 */
export interface UserRole {
  userId: string;
  username: string;
  roles: Role[];
  customPermissions?: ResourcePermission[];
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
}

/**
 * Resource permission definition
 */
export interface ResourcePermission {
  resource: Resource;
  permissions: Permission[];
  conditions?: PermissionCondition[];
}

/**
 * Dynamic permission condition
 */
export interface PermissionCondition {
  type: 'time' | 'ip' | 'location' | 'custom';
  operator: 'equals' | 'contains' | 'matches' | 'between';
  value: any;
}

/**
 * Authorization check result
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  matchedRole?: Role;
  matchedPermission?: ResourcePermission;
}

/**
 * Authorization audit entry
 */
export interface AuthorizationAudit {
  timestamp: Date;
  userId: string;
  username: string;
  resource: Resource;
  permission: Permission;
  allowed: boolean;
  reason: string;
  context?: Record<string, any>;
}

/**
 * Role definition with permissions
 */
interface RoleDefinition {
  role: Role;
  inherits?: Role[];
  permissions: ResourcePermission[];
  description: string;
}

// ============================================================================
// Authorization Service
// ============================================================================

export class AuthorizationService extends EventEmitter {
  private userRoles: Map<string, UserRole> = new Map();
  private roleDefinitions: Map<Role, RoleDefinition> = new Map();
  private permissionCache: Map<string, { result: boolean; timestamp: number }> = new Map();
  private auditLog: AuthorizationAudit[] = [];
  private rolesPath: string;
  private auditPath: string;
  private initialized = false;

  // Cache TTL in milliseconds (5 minutes)
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.rolesPath = path.join(userDataPath, 'security', 'roles.json');
    this.auditPath = path.join(userDataPath, 'security', 'authorization-audit.json');

    this.initializeRoleDefinitions();
  }

  /**
   * Initialize default role definitions
   */
  private initializeRoleDefinitions(): void {
    // Admin - Full access to everything
    this.roleDefinitions.set(Role.Admin, {
      role: Role.Admin,
      permissions: [
        {
          resource: Resource.Users,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export, Permission.Import, Permission.Manage]
        },
        {
          resource: Resource.Groups,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export, Permission.Import, Permission.Manage]
        },
        {
          resource: Resource.Migrations,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export, Permission.Import, Permission.Manage]
        },
        {
          resource: Resource.Reports,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export, Permission.Import, Permission.Manage]
        },
        {
          resource: Resource.Settings,
          permissions: [Permission.Read, Permission.Write, Permission.Manage]
        },
        {
          resource: Resource.Profiles,
          permissions: [Permission.Read, Permission.Write, Permission.Delete, Permission.Manage]
        },
        {
          resource: Resource.Discoveries,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export]
        },
        {
          resource: Resource.Infrastructure,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export]
        },
        {
          resource: Resource.Applications,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export]
        },
        {
          resource: Resource.Audit,
          permissions: [Permission.Read, Permission.Export, Permission.Manage]
        },
        {
          resource: Resource.Security,
          permissions: [Permission.Read, Permission.Write, Permission.Manage]
        }
      ],
      description: 'Full system administrator with unrestricted access'
    });

    // PowerUser - Can execute migrations, manage users/groups, no security/audit
    this.roleDefinitions.set(Role.PowerUser, {
      role: Role.PowerUser,
      permissions: [
        {
          resource: Resource.Users,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export, Permission.Import]
        },
        {
          resource: Resource.Groups,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Delete, Permission.Export, Permission.Import]
        },
        {
          resource: Resource.Migrations,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Reports,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Settings,
          permissions: [Permission.Read, Permission.Write]
        },
        {
          resource: Resource.Profiles,
          permissions: [Permission.Read, Permission.Write, Permission.Delete]
        },
        {
          resource: Resource.Discoveries,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Infrastructure,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Applications,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Audit,
          permissions: [Permission.Read]
        }
      ],
      description: 'Power user with migration and data management capabilities'
    });

    // Analyst - Read/Export only, can execute discoveries
    this.roleDefinitions.set(Role.Analyst, {
      role: Role.Analyst,
      permissions: [
        {
          resource: Resource.Users,
          permissions: [Permission.Read, Permission.Export]
        },
        {
          resource: Resource.Groups,
          permissions: [Permission.Read, Permission.Export]
        },
        {
          resource: Resource.Migrations,
          permissions: [Permission.Read, Permission.Export]
        },
        {
          resource: Resource.Reports,
          permissions: [Permission.Read, Permission.Write, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Settings,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Profiles,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Discoveries,
          permissions: [Permission.Read, Permission.Execute, Permission.Export]
        },
        {
          resource: Resource.Infrastructure,
          permissions: [Permission.Read, Permission.Export]
        },
        {
          resource: Resource.Applications,
          permissions: [Permission.Read, Permission.Export]
        }
      ],
      description: 'Analyst with read and reporting capabilities'
    });

    // ReadOnly - Read-only access to most resources
    this.roleDefinitions.set(Role.ReadOnly, {
      role: Role.ReadOnly,
      permissions: [
        {
          resource: Resource.Users,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Groups,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Migrations,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Reports,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Settings,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Profiles,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Discoveries,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Infrastructure,
          permissions: [Permission.Read]
        },
        {
          resource: Resource.Applications,
          permissions: [Permission.Read]
        }
      ],
      description: 'Read-only access for viewing data'
    });
  }

  /**
   * Initialize the authorization service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load user roles
      const rolesData = await fs.readFile(this.rolesPath, 'utf-8');
      const roles: UserRole[] = JSON.parse(rolesData);
      roles.forEach(role => {
        this.userRoles.set(role.userId, {
          ...role,
          assignedAt: new Date(role.assignedAt),
          expiresAt: role.expiresAt ? new Date(role.expiresAt) : undefined
        });
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading user roles:', error);
      }
    }

    // Load audit log
    try {
      const auditData = await fs.readFile(this.auditPath, 'utf-8');
      const audits: AuthorizationAudit[] = JSON.parse(auditData);
      this.auditLog = audits.map(a => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading authorization audit log:', error);
      }
    }

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Assign roles to a user
   */
  async assignRoles(
    userId: string,
    username: string,
    roles: Role[],
    assignedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    await this.ensureInitialized();

    const userRole: UserRole = {
      userId,
      username,
      roles,
      assignedAt: new Date(),
      assignedBy,
      expiresAt
    };

    this.userRoles.set(userId, userRole);
    await this.saveRoles();

    // Clear permission cache for this user
    this.clearUserCache(userId);

    this.emit('roles-assigned', { userId, roles, assignedBy });
  }

  /**
   * Add custom permissions to a user (beyond role defaults)
   */
  async addCustomPermissions(
    userId: string,
    permissions: ResourcePermission[]
  ): Promise<void> {
    await this.ensureInitialized();

    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      throw new Error(`User ${userId} not found`);
    }

    userRole.customPermissions = [
      ...(userRole.customPermissions || []),
      ...permissions
    ];

    await this.saveRoles();
    this.clearUserCache(userId);

    this.emit('custom-permissions-added', { userId, permissions });
  }

  /**
   * Remove roles from a user
   */
  async removeRoles(userId: string, roles: Role[]): Promise<void> {
    await this.ensureInitialized();

    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      return;
    }

    userRole.roles = userRole.roles.filter(r => !roles.includes(r));

    if (userRole.roles.length === 0) {
      this.userRoles.delete(userId);
    }

    await this.saveRoles();
    this.clearUserCache(userId);

    this.emit('roles-removed', { userId, roles });
  }

  /**
   * Check if user has a specific role
   */
  hasRole(userId: string, role: Role): boolean {
    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      return false;
    }

    // Check expiration
    if (userRole.expiresAt && userRole.expiresAt < new Date()) {
      return false;
    }

    return userRole.roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(userId: string, roles: Role[]): boolean {
    return roles.some(role => this.hasRole(userId, role));
  }

  /**
   * Check if user has all specified roles
   */
  hasAllRoles(userId: string, roles: Role[]): boolean {
    return roles.every(role => this.hasRole(userId, role));
  }

  /**
   * Check if user has permission for a resource action
   */
  async hasPermission(
    userId: string,
    username: string,
    resource: Resource,
    permission: Permission,
    context?: Record<string, any>
  ): Promise<AuthorizationResult> {
    await this.ensureInitialized();

    // Check cache first
    const cacheKey = `${userId}:${resource}:${permission}`;
    const cached = this.permissionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return {
        allowed: cached.result,
        reason: 'cached'
      };
    }

    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      const result = {
        allowed: false,
        reason: 'User has no assigned roles'
      };
      this.auditAuthorization(userId, username, resource, permission, result.allowed, result.reason, context);
      return result;
    }

    // Check expiration
    if (userRole.expiresAt && userRole.expiresAt < new Date()) {
      const result = {
        allowed: false,
        reason: 'User roles have expired'
      };
      this.auditAuthorization(userId, username, resource, permission, result.allowed, result.reason, context);
      return result;
    }

    // Check custom permissions first (highest priority)
    if (userRole.customPermissions) {
      for (const customPerm of userRole.customPermissions) {
        if (customPerm.resource === resource && customPerm.permissions.includes(permission)) {
          // Check conditions
          if (customPerm.conditions && !this.evaluateConditions(customPerm.conditions, context)) {
            continue;
          }

          const result = {
            allowed: true,
            reason: 'Custom permission grant',
            matchedPermission: customPerm
          };
          this.permissionCache.set(cacheKey, { result: true, timestamp: Date.now() });
          this.auditAuthorization(userId, username, resource, permission, result.allowed, result.reason, context);
          return result;
        }
      }
    }

    // Check role-based permissions
    for (const role of userRole.roles) {
      const roleDef = this.roleDefinitions.get(role);
      if (!roleDef) {
        continue;
      }

      // Check direct permissions
      const resourcePerm = roleDef.permissions.find(p => p.resource === resource);
      if (resourcePerm && resourcePerm.permissions.includes(permission)) {
        const result = {
          allowed: true,
          reason: `Granted by role: ${role}`,
          matchedRole: role,
          matchedPermission: resourcePerm
        };
        this.permissionCache.set(cacheKey, { result: true, timestamp: Date.now() });
        this.auditAuthorization(userId, username, resource, permission, result.allowed, result.reason, context);
        return result;
      }
    }

    // Permission denied
    const result = {
      allowed: false,
      reason: 'No matching permission found in user roles'
    };
    this.permissionCache.set(cacheKey, { result: false, timestamp: Date.now() });
    this.auditAuthorization(userId, username, resource, permission, result.allowed, result.reason, context);
    return result;
  }

  /**
   * Get all roles for a user
   */
  getUserRoles(userId: string): Role[] {
    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      return [];
    }

    // Check expiration
    if (userRole.expiresAt && userRole.expiresAt < new Date()) {
      return [];
    }

    return userRole.roles;
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(userId: string): ResourcePermission[] {
    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      return [];
    }

    // Check expiration
    if (userRole.expiresAt && userRole.expiresAt < new Date()) {
      return [];
    }

    const permissions: ResourcePermission[] = [];

    // Add role-based permissions
    for (const role of userRole.roles) {
      const roleDef = this.roleDefinitions.get(role);
      if (roleDef) {
        permissions.push(...roleDef.permissions);
      }
    }

    // Add custom permissions
    if (userRole.customPermissions) {
      permissions.push(...userRole.customPermissions);
    }

    return permissions;
  }

  /**
   * Get role definition
   */
  getRoleDefinition(role: Role): RoleDefinition | undefined {
    return this.roleDefinitions.get(role);
  }

  /**
   * Get all role definitions
   */
  getAllRoleDefinitions(): RoleDefinition[] {
    return Array.from(this.roleDefinitions.values());
  }

  /**
   * Get authorization audit log
   */
  getAuditLog(filter?: {
    userId?: string;
    resource?: Resource;
    permission?: Permission;
    allowed?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): AuthorizationAudit[] {
    let log = this.auditLog;

    if (filter) {
      if (filter.userId) {
        log = log.filter(a => a.userId === filter.userId);
      }
      if (filter.resource) {
        log = log.filter(a => a.resource === filter.resource);
      }
      if (filter.permission) {
        log = log.filter(a => a.permission === filter.permission);
      }
      if (filter.allowed !== undefined) {
        log = log.filter(a => a.allowed === filter.allowed);
      }
      if (filter.startDate) {
        log = log.filter(a => a.timestamp >= filter.startDate);
      }
      if (filter.endDate) {
        log = log.filter(a => a.timestamp <= filter.endDate);
      }
    }

    return log;
  }

  /**
   * Clear permission cache for a user
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.permissionCache.delete(key));
  }

  /**
   * Clear entire permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Evaluate permission conditions
   */
  private evaluateConditions(
    conditions: PermissionCondition[],
    context?: Record<string, any>
  ): boolean {
    if (!context) {
      return false;
    }

    return conditions.every(condition => {
      const contextValue = context[condition.type];
      if (contextValue === undefined) {
        return false;
      }

      switch (condition.operator) {
        case 'equals':
          return contextValue === condition.value;
        case 'contains':
          return String(contextValue).includes(String(condition.value));
        case 'matches':
          return new RegExp(condition.value).test(String(contextValue));
        case 'between':
          return contextValue >= condition.value[0] && contextValue <= condition.value[1];
        default:
          return false;
      }
    });
  }

  /**
   * Audit authorization decision
   */
  private auditAuthorization(
    userId: string,
    username: string,
    resource: Resource,
    permission: Permission,
    allowed: boolean,
    reason: string,
    context?: Record<string, any>
  ): void {
    const audit: AuthorizationAudit = {
      timestamp: new Date(),
      userId,
      username,
      resource,
      permission,
      allowed,
      reason,
      context
    };

    this.auditLog.push(audit);

    // Keep only last 10,000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }

    // Save async (don't wait)
    this.saveAuditLog().catch(err =>
      console.error('Failed to save authorization audit log:', err)
    );

    this.emit('authorization-checked', audit);
  }

  /**
   * Save user roles to disk
   */
  private async saveRoles(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.rolesPath), { recursive: true });
      const roles = Array.from(this.userRoles.values());
      await fs.writeFile(this.rolesPath, JSON.stringify(roles, null, 2));
    } catch (error) {
      console.error('Error saving user roles:', error);
      throw new Error(`Failed to save user roles: ${error}`);
    }
  }

  /**
   * Save audit log to disk
   */
  private async saveAuditLog(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.auditPath), { recursive: true });
      await fs.writeFile(this.auditPath, JSON.stringify(this.auditLog, null, 2));
    } catch (error) {
      console.error('Error saving authorization audit log:', error);
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
}

export default new AuthorizationService();

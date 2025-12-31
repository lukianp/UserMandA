/**
 * Enhanced PowerShell Module Discovery Service
 *
 * Automatically discovers and catalogs PowerShell scripts and modules
 * from the Scripts directory structure.
 *
 * Pattern from GUI/Services/ModuleDiscoveryService.cs
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

export interface DiscoveredModule {
  id: string;
  name: string;
  path: string;
  category: string;
  description: string;
  parameters: ModuleParameter[];
  dependencies: string[];
  version?: string;
  author?: string;
}

export interface ModuleParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

/**
 * Enhanced Module Discovery Service
 */
export class EnhancedModuleDiscoveryService {
  private modulesCache: Map<string, DiscoveredModule> = new Map();
  private lastScanTime: Date | null = null;

  /**
   * Discover all PowerShell modules in the Scripts directory
   */
  async discoverModules(scriptsRoot: string): Promise<DiscoveredModule[]> {
    console.log(`[ModuleDiscovery] Scanning scripts directory: ${scriptsRoot}`);

    const modules: DiscoveredModule[] = [];

    try {
      if (!fs.existsSync(scriptsRoot)) {
        console.warn(`[ModuleDiscovery] Scripts directory not found: ${scriptsRoot}`);
        return [];
      }

      // Scan Scripts directory structure
      await this.scanDirectory(scriptsRoot, modules);

      // Cache results
      modules.forEach(module => {
        this.modulesCache.set(module.id, module);
      });

      this.lastScanTime = new Date();

      console.log(`[ModuleDiscovery] Discovered ${modules.length} modules`);
      return modules;
    } catch (error: any) {
      console.error(`[ModuleDiscovery] Discovery failed:`, error);
      return [];
    }
  }

  /**
   * Recursively scan directory for PowerShell scripts
   */
  private async scanDirectory(dirPath: string, modules: DiscoveredModule[], category?: string): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Use directory name as category
          await this.scanDirectory(fullPath, modules, entry.name);
        } else if (entry.isFile() && (entry.name.endsWith('.ps1') || entry.name.endsWith('.psm1'))) {
          // Parse PowerShell script
          const module = await this.parseModule(fullPath, category || 'General');
          if (module) {
            modules.push(module);
          }
        }
      }
    } catch (error: any) {
      console.error(`[ModuleDiscovery] Failed to scan directory ${dirPath}:`, error);
    }
  }

  /**
   * Parse PowerShell script metadata and parameters
   */
  private async parseModule(scriptPath: string, category: string): Promise<DiscoveredModule | null> {
    try {
      const content = await fs.promises.readFile(scriptPath, 'utf8');

      // Extract module metadata from comments
      const metadata = this.extractMetadata(content);
      const parameters = await this.extractParameters(scriptPath, content);

      const moduleName = path.basename(scriptPath, path.extname(scriptPath));
      const moduleId = `${category.toLowerCase()}-${moduleName.toLowerCase()}`;

      return {
        id: moduleId,
        name: metadata.name || moduleName,
        path: scriptPath,
        category,
        description: metadata.description || '',
        parameters,
        dependencies: metadata.dependencies || [],
        version: metadata.version,
        author: metadata.author
      };
    } catch (error: any) {
      console.error(`[ModuleDiscovery] Failed to parse module ${scriptPath}:`, error);
      return null;
    }
  }

  /**
   * Extract metadata from PowerShell script comments
   */
  private extractMetadata(content: string): {
    name?: string;
    description?: string;
    version?: string;
    author?: string;
    dependencies?: string[];
  } {
    const metadata: any = {};

    // Look for .SYNOPSIS, .DESCRIPTION, etc. in help comments
    const synopsisMatch = content.match(/\.SYNOPSIS\s+(.*?)(?=\.|$)/is);
    if (synopsisMatch) {
      metadata.description = synopsisMatch[1].trim();
    }

    const descriptionMatch = content.match(/\.DESCRIPTION\s+(.*?)(?=\.|$)/is);
    if (descriptionMatch) {
      metadata.description = descriptionMatch[1].trim();
    }

    const versionMatch = content.match(/\.VERSION\s+(\S+)/i);
    if (versionMatch) {
      metadata.version = versionMatch[1].trim();
    }

    const authorMatch = content.match(/\.AUTHOR\s+(.*?)(?=\n|$)/i);
    if (authorMatch) {
      metadata.author = authorMatch[1].trim();
    }

    // Look for #Requires statements for dependencies
    const requiresMatches = content.matchAll(/#Requires\s+-Modules\s+([^\n]+)/gi);
    metadata.dependencies = [];
    for (const match of requiresMatches) {
      const modules = match[1].split(',').map(m => m.trim());
      metadata.dependencies.push(...modules);
    }

    return metadata;
  }

  /**
   * Extract parameters using PowerShell Get-Help
   */
  private async extractParameters(scriptPath: string, content: string): Promise<ModuleParameter[]> {
    const parameters: ModuleParameter[] = [];

    // Parse param block from script
    const paramBlockMatch = content.match(/param\s*\(([\s\S]*?)\)/i);
    if (!paramBlockMatch) {
      return parameters;
    }

    const paramBlock = paramBlockMatch[1];

    // Extract individual parameters
    const paramMatches = paramBlock.matchAll(/\[Parameter[^\]]*\]\s*\[(\w+)\]\s*\$(\w+)\s*=?\s*([^,\n]*)/gi);

    for (const match of paramMatches) {
      const type = match[1];
      const name = match[2];
      const defaultValue = match[3]?.trim();

      parameters.push({
        name,
        type,
        required: /Mandatory\s*=\s*\$true/i.test(match[0]),
        defaultValue: defaultValue || undefined,
        description: undefined
      });
    }

    return parameters;
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: string): DiscoveredModule | null {
    return this.modulesCache.get(moduleId) || null;
  }

  /**
   * Get all modules
   */
  getAllModules(): DiscoveredModule[] {
    return Array.from(this.modulesCache.values());
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): DiscoveredModule[] {
    return Array.from(this.modulesCache.values()).filter(
      m => m.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search modules by name or description
   */
  searchModules(query: string): DiscoveredModule[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.modulesCache.values()).filter(
      m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get discovery statistics
   */
  getStatistics() {
    return {
      totalModules: this.modulesCache.size,
      lastScanTime: this.lastScanTime,
      categories: Array.from(new Set(Array.from(this.modulesCache.values()).map(m => m.category)))
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.modulesCache.clear();
    this.lastScanTime = null;
  }
}

// Singleton instance
let enhancedModuleDiscoveryService: EnhancedModuleDiscoveryService | null = null;

export function getEnhancedModuleDiscoveryService(): EnhancedModuleDiscoveryService {
  if (!enhancedModuleDiscoveryService) {
    enhancedModuleDiscoveryService = new EnhancedModuleDiscoveryService();
  }
  return enhancedModuleDiscoveryService;
}

export default EnhancedModuleDiscoveryService;



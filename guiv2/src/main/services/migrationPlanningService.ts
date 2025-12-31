/**
 * Migration Planning Service
 *
 * Handles migration wave planning, user assignment, and execution scheduling.
 * Pattern from GUI/Services/MigrationPlanningService.cs
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MigrationWave {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'inprogress' | 'completed' | 'failed';
  users: string[]; // User IDs
  priority: number;
  dependencies: string[]; // Wave IDs that must complete first
  created: string;
  modified: string;
}

export interface MigrationPlan {
  id: string;
  profileName: string;
  name: string;
  description: string;
  waves: MigrationWave[];
  created: string;
  modified: string;
}

export interface WaveAssignment {
  userId: string;
  waveId: string;
  assignedDate: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedHours: number;
  actualHours?: number;
  status: 'pending' | 'inprogress' | 'completed' | 'failed';
}

/**
 * Migration Planning Service
 */
export class MigrationPlanningService {
  private plansDir: string;
  private plans: Map<string, MigrationPlan> = new Map();

  constructor(dataRoot = 'C:\\DiscoveryData') {
    this.plansDir = path.join(dataRoot, 'MigrationPlans');
    this.ensureDirectoryExists();
  }

  /**
   * Ensure migration plans directory exists
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.plansDir)) {
      fs.mkdirSync(this.plansDir, { recursive: true });
    }
  }

  /**
   * Create a new migration plan
   */
  async createPlan(planData: {
    profileName: string;
    name: string;
    description: string;
  }): Promise<MigrationPlan> {
    const plan: MigrationPlan = {
      id: crypto.randomUUID(),
      ...planData,
      waves: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this.plans.set(plan.id, plan);
    await this.savePlan(plan);

    return plan;
  }

  /**
   * Add a wave to a migration plan
   */
  async addWave(
    planId: string,
    waveData: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      priority?: number;
      dependencies?: string[];
    }
  ): Promise<MigrationWave> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Migration plan not found: ${planId}`);
    }

    const wave: MigrationWave = {
      id: crypto.randomUUID(),
      ...waveData,
      status: 'planned',
      users: [],
      priority: waveData.priority || 1,
      dependencies: waveData.dependencies || [],
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    plan.waves.push(wave);
    plan.modified = new Date().toISOString();

    await this.savePlan(plan);

    return wave;
  }

  /**
   * Assign users to a wave
   */
  async assignUsersToWave(planId: string, waveId: string, userIds: string[]): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Migration plan not found: ${planId}`);
    }

    const wave = plan.waves.find(w => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    // Add unique users only
    const existingUsers = new Set(wave.users);
    userIds.forEach(userId => existingUsers.add(userId));
    wave.users = Array.from(existingUsers);

    wave.modified = new Date().toISOString();
    plan.modified = new Date().toISOString();

    await this.savePlan(plan);
  }

  /**
   * Update wave status
   */
  async updateWaveStatus(
    planId: string,
    waveId: string,
    status: 'planned' | 'inprogress' | 'completed' | 'failed'
  ): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Migration plan not found: ${planId}`);
    }

    const wave = plan.waves.find(w => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    wave.status = status;
    wave.modified = new Date().toISOString();
    plan.modified = new Date().toISOString();

    await this.savePlan(plan);
  }

  /**
   * Get migration plan
   */
  async getPlan(planId: string): Promise<MigrationPlan | null> {
    if (this.plans.has(planId)) {
      const plan = this.plans.get(planId);
      return plan || null;
    }

    // Try to load from disk
    const planPath = path.join(this.plansDir, `${planId}.json`);
    if (fs.existsSync(planPath)) {
      const content = await fs.promises.readFile(planPath, 'utf8');
      const plan = JSON.parse(content) as MigrationPlan;
      this.plans.set(plan.id, plan);
      return plan;
    }

    return null;
  }

  /**
   * Get all migration plans for a profile
   */
  async getPlansByProfile(profileName: string): Promise<MigrationPlan[]> {
    await this.loadAllPlans();
    return Array.from(this.plans.values()).filter(p => p.profileName === profileName);
  }

  /**
   * Delete migration plan
   */
  async deletePlan(planId: string): Promise<void> {
    this.plans.delete(planId);

    const planPath = path.join(this.plansDir, `${planId}.json`);
    if (fs.existsSync(planPath)) {
      await fs.promises.unlink(planPath);
    }
  }

  /**
   * Save migration plan to disk
   */
  private async savePlan(plan: MigrationPlan): Promise<void> {
    const planPath = path.join(this.plansDir, `${plan.id}.json`);
    await fs.promises.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf8');
  }

  /**
   * Load all migration plans from disk
   */
  private async loadAllPlans(): Promise<void> {
    if (!fs.existsSync(this.plansDir)) {
      return;
    }

    const files = await fs.promises.readdir(this.plansDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const file of jsonFiles) {
      try {
        const content = await fs.promises.readFile(path.join(this.plansDir, file), 'utf8');
        const plan = JSON.parse(content) as MigrationPlan;
        this.plans.set(plan.id, plan);
      } catch (error) {
        console.error(`Failed to load migration plan ${file}:`, error);
      }
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const allWaves = Array.from(this.plans.values()).flatMap(p => p.waves);

    return {
      totalPlans: this.plans.size,
      totalWaves: allWaves.length,
      wavesByStatus: {
        planned: allWaves.filter(w => w.status === 'planned').length,
        inprogress: allWaves.filter(w => w.status === 'inprogress').length,
        completed: allWaves.filter(w => w.status === 'completed').length,
        failed: allWaves.filter(w => w.status === 'failed').length
      },
      totalUsersAssigned: Array.from(new Set(allWaves.flatMap(w => w.users))).length
    };
  }
}

// Singleton instance
let migrationPlanningService: MigrationPlanningService | null = null;

export function getMigrationPlanningService(dataRoot?: string): MigrationPlanningService {
  if (!migrationPlanningService) {
    migrationPlanningService = new MigrationPlanningService(dataRoot);
  }
  return migrationPlanningService;
}

export default MigrationPlanningService;



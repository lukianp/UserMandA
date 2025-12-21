import path from 'path';
import { PowerShellExecutionService } from '../services/powerShellService';
import ModuleRegistry from '../services/moduleRegistry';
import EnvironmentDetectionService from '../services/environmentDetectionService';
import { MockLogicEngineService } from '../services/mockLogicEngineService';
import { LogicEngineService } from '../services/logicEngineService';
import { ProjectService } from '../services/projectService';
import { DashboardService } from '../services/dashboardService';
import { ProfileService } from '../services/profileService';

/**
 * Service container interface
 * Defines all services available in the application
 */
export interface ServiceContainer {
  psService: PowerShellExecutionService;
  moduleRegistry: ModuleRegistry;
  environmentDetectionService: EnvironmentDetectionService;
  mockLogicEngineService: MockLogicEngineService;
  logicEngineService: LogicEngineService;
  projectService: ProjectService;
  dashboardService: DashboardService;
  profileService: ProfileService;
}

let services: ServiceContainer | null = null;

/**
 * Initialize all application services
 * @returns Promise<ServiceContainer> - The initialized service container
 */
export async function initializeServices(): Promise<ServiceContainer> {
  if (services) return services;

  console.log('Initializing IPC services...');

  const psService = new PowerShellExecutionService({
    maxPoolSize: 10,
    minPoolSize: 2,
    sessionTimeout: 300000,
    queueSize: 100,
    enableModuleCaching: true,
    defaultTimeout: 60000,
    scriptsBaseDir: process.cwd(),
  });

  await psService.initialize();

  const moduleRegistry = new ModuleRegistry(psService, path.join(process.cwd(), 'config', 'module-registry.json'));
  await moduleRegistry.loadRegistry();

  const environmentDetectionService = new EnvironmentDetectionService(psService);
  const mockLogicEngineService = MockLogicEngineService.getInstance();
  const logicEngineService = LogicEngineService.getInstance(path.join('C:', 'discoverydata', 'ljpops', 'Raw'));
  const projectService = new ProjectService();
  const dashboardService = new DashboardService(logicEngineService, projectService);
  const profileService = new ProfileService();
  await profileService.initialize();

  services = {
    psService,
    moduleRegistry,
    environmentDetectionService,
    mockLogicEngineService,
    logicEngineService,
    projectService,
    dashboardService,
    profileService,
  };

  console.log('IPC services initialized successfully');
  return services;
}

/**
 * Get the initialized service container
 * @throws Error if services have not been initialized
 * @returns ServiceContainer - The service container
 */
export function getServices(): ServiceContainer {
  if (!services) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  return services;
}

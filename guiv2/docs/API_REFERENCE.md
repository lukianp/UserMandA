**Author:** ljpops.com (Lukian Poleschtschuk)

**Last Updated:** 30/12/2025

**Status:** Production

**Version:** 1.0
# M&A Discovery Suite GUI v2 - API Reference

## IPC API Reference

### PowerShell Execution

#### `executePowerShell(scriptName, args)`

Execute a PowerShell script with arguments.

**Parameters:**
- `scriptName` (string): Name of the script in Scripts/ or Modules/
- `args` (string[]): Array of script arguments

**Returns:** `Promise<any>` - Parsed JSON result from PowerShell

**Example:**
```typescript
const result = await window.electronAPI.executePowerShell(
  'Get-ADUsers.ps1',
  ['-Domain', 'contoso.com']
);
```

#### `cancelPowerShell(executionId)`

Cancel a running PowerShell script.

**Parameters:**
- `executionId` (string): Execution ID from executePowerShell

**Returns:** `Promise<boolean>` - Success status

### File Operations

#### `readFile(path)`

Read file contents.

**Parameters:**
- `path` (string): Absolute file path

**Returns:** `Promise<string>` - File contents

#### `writeFile(path, contents)`

Write file contents.

**Parameters:**
- `path` (string): Absolute file path
- `contents` (string): File contents

**Returns:** `Promise<void>`

#### `readCSV(path)`

Read and parse CSV file.

**Parameters:**
- `path` (string): Absolute file path

**Returns:** `Promise<any[]>` - Parsed CSV data

#### `writeCSV(path, data)`

Write data to CSV file.

**Parameters:**
- `path` (string): Absolute file path
- `data` (any[]): Array of objects to write

**Returns:** `Promise<void>`

### Discovery Operations

#### `startDiscovery(config)`

Start a discovery operation.

**Parameters:**
- `config` (DiscoveryConfig): Discovery configuration

**Returns:** `Promise<string>` - Discovery run ID

#### `getDiscoveryStatus(runId)`

Get discovery status and progress.

**Parameters:**
- `runId` (string): Discovery run ID

**Returns:** `Promise<DiscoveryStatus>`

#### `getDiscoveryResults(runId)`

Get discovery results.

**Parameters:**
- `runId` (string): Discovery run ID

**Returns:** `Promise<DiscoveryResult>`

### Migration Operations

#### `planMigration(wave)`

Plan a migration wave.

**Parameters:**
- `wave` (MigrationWave): Wave configuration

**Returns:** `Promise<string>` - Wave ID

#### `executeMigration(waveId, mode)`

Execute a migration wave.

**Parameters:**
- `waveId` (string): Wave ID
- `mode` ('dry-run' | 'full'): Execution mode

**Returns:** `Promise<MigrationResult>`

#### `rollbackMigration(waveId)`

Rollback a migration wave.

**Parameters:**
- `waveId` (string): Wave ID

**Returns:** `Promise<RollbackResult>`

## Store APIs

### Profile Store

```typescript
interface ProfileStore {
  // State
  profiles: Profile[];
  selectedProfile: Profile | null;
  connectionStatus: 'connected' | 'disconnected' | 'testing';

  // Actions
  loadProfiles(): Promise<void>;
  setSelectedProfile(profile: Profile): void;
  createProfile(profile: Profile): Promise<void>;
  deleteProfile(profile: Profile): Promise<void>;
  testConnection(profile: Profile): Promise<boolean>;
}
```

### Migration Store

```typescript
interface MigrationStore {
  // State
  projects: MigrationProject[];
  waves: MigrationWave[];
  activeWave: string | null;
  progress: number;

  // Actions
  createProject(project: MigrationProject): Promise<void>;
  createWave(wave: MigrationWave): Promise<void>;
  executeMigration(waveId: string): Promise<void>;
  pauseMigration(): void;
  resumeMigration(): void;
  rollback(waveId: string): Promise<void>;
}
```

### Discovery Store

```typescript
interface DiscoveryStore {
  // State
  runs: DiscoveryRun[];
  activeRun: string | null;
  progress: number;
  results: any[];

  // Actions
  startDiscovery(config: DiscoveryConfig): Promise<string>;
  cancelDiscovery(runId: string): void;
  getResults(runId: string): Promise<any[]>;
}
```

## Component Props

### VirtualizedDataGrid

```typescript
interface VirtualizedDataGridProps<T = any> {
  data: T[];
  columns: ColDef[];
  loading?: boolean;
  enableExport?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  selectionMode?: 'single' | 'multiple';
  pagination?: boolean;
  paginationPageSize?: number;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (rows: T[]) => void;
  className?: string;
  height?: string;
}
```

### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  'data-cy'?: string;
}
```

### Input

```typescript
interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}
```

## Service APIs

### Export Service

```typescript
class ExportService {
  async exportToCSV(data: any[], options?: CsvExportOptions): Promise<void>;
  async exportToExcel(data: any[], options?: ExcelExportOptions): Promise<void>;
  async exportToPDF(data: any[], options?: PdfExportOptions): Promise<void>;
  async exportToJSON(data: any[], path: string): Promise<void>;
}
```

### Notification Service

```typescript
class NotificationService {
  success(message: string, options?: NotificationOptions): void;
  error(message: string, options?: NotificationOptions): void;
  warning(message: string, options?: NotificationOptions): void;
  info(message: string, options?: NotificationOptions): void;
}
```

---

For complete API documentation generated from source code, see the [TypeDoc documentation](api/index.html) (run `npm run docs:generate` to create).


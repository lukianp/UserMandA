# M&A Discovery Suite GUI v2 - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Process Architecture](#process-architecture)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Service Layer](#service-layer)
7. [IPC Communication](#ipc-communication)
8. [Module Structure](#module-structure)
9. [Performance Architecture](#performance-architecture)
10. [Security Architecture](#security-architecture)

## Overview

The M&A Discovery Suite GUI v2 is built on Electron, combining a Node.js main process with a React-based renderer process for maximum performance and native OS integration.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron 38.2 |
| UI Framework | React 18 |
| Language | TypeScript 5.6 |
| State Management | Zustand |
| Styling | Tailwind CSS 3.4 |
| Data Grid | AG Grid Enterprise 34.2 |
| Build Tool | Webpack 5 |
| Package Manager | npm 9+ |

## System Architecture

```mermaid
graph TB
    subgraph "Electron Application"
        subgraph "Main Process (Node.js)"
            M[Main Process]
            PS[PowerShell Service]
            FS[File Service]
            MS[Migration Services]
            CS[Credential Service]
            ES[Environment Service]
        end

        subgraph "Renderer Process (Chromium)"
            R[React App]
            ST[Zustand Stores]
            SV[Services]
            CO[Components]
            VI[Views]
        end

        subgraph "Preload Script"
            PL[IPC Bridge]
        end
    end

    subgraph "External"
        PW[PowerShell Scripts]
        M365[Microsoft 365]
        EX[Exchange Online]
        SP[SharePoint Online]
        FS_EXT[File System]
    end

    R <--> PL
    PL <--> M
    M --> PS
    M --> FS
    M --> MS
    M --> CS
    M --> ES
    PS --> PW
    PW --> M365
    PW --> EX
    PW --> SP
    FS --> FS_EXT
    ST --> R
    SV --> R
    CO --> R
    VI --> R
```

## Process Architecture

### Main Process

The main process runs on Node.js and handles:

- PowerShell script execution
- File system operations
- Credential management
- Environment detection
- IPC communication
- Window management

**Key Services:**

- `PowerShellService`: Session-pooled PowerShell execution
- `MigrationOrchestrationService`: Multi-wave migration coordination
- `FileWatcherService`: File system monitoring
- `CredentialService`: Secure credential storage
- `EnvironmentDetectionService`: Environment validation

### Renderer Process

The renderer process runs React in Chromium and handles:

- UI rendering
- User interactions
- State management
- Client-side validation
- Data visualization

**Key Components:**

- `App.tsx`: Root application component
- `MainLayout`: Primary layout structure
- `VirtualizedDataGrid`: High-performance data grid
- `Sidebar`: Navigation and profile management
- `Views`: Page-level components

### Preload Script

The preload script bridges the main and renderer processes:

```typescript
// Expose IPC APIs securely
const electronAPI = {
  // PowerShell execution
  executePowerShell: (scriptName: string, args: string[]) =>
    ipcRenderer.invoke('powershell:execute', { scriptName, args }),

  // File operations
  readFile: (path: string) =>
    ipcRenderer.invoke('file:read', path),

  // Discovery operations
  startDiscovery: (config: DiscoveryConfig) =>
    ipcRenderer.invoke('discovery:start', config),

  // Migration operations
  planMigration: (wave: MigrationWave) =>
    ipcRenderer.invoke('migration:plan', wave),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

## Data Flow

### Discovery Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant V as View
    participant S as Store
    participant IPC as IPC Bridge
    participant M as Main Process
    participant PS as PowerShell Service
    participant Script as PS Script

    U->>V: Click "Start Discovery"
    V->>S: Dispatch startDiscovery()
    S->>IPC: Call electronAPI.startDiscovery()
    IPC->>M: Invoke discovery:start
    M->>PS: Execute discovery script
    PS->>Script: Spawn PowerShell process
    Script-->>PS: Stream output (JSON)
    PS-->>M: Return results
    M-->>IPC: Send results
    IPC-->>S: Update store
    S-->>V: Trigger re-render
    V-->>U: Display results
```

### Migration Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant V as Migration View
    participant Store as Migration Store
    participant IPC as IPC Bridge
    participant MOS as Migration Orchestration
    participant MES as Migration Execution
    participant MVS as Migration Validation

    U->>V: Create Migration Wave
    V->>Store: Dispatch createWave()
    Store->>IPC: Call planWave()
    IPC->>MOS: Create wave
    MOS->>MVS: Validate wave
    MVS-->>MOS: Validation result
    MOS-->>Store: Wave created

    U->>V: Execute Migration
    V->>Store: Dispatch executeMigration()
    Store->>IPC: Call executeMigration()
    IPC->>MOS: Start execution
    MOS->>MES: Execute wave
    MES-->>MOS: Progress updates
    MOS-->>Store: Update progress
    Store-->>V: Re-render progress
```

### Export Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant Grid as Data Grid
    participant Export as Export Service
    participant IPC as IPC Bridge
    participant FS as File Service

    U->>Grid: Click "Export"
    Grid->>Export: Call export(data, format)
    Export->>Export: Transform data
    Export->>IPC: Call saveFile(data, path)
    IPC->>FS: Write file
    FS-->>IPC: Success
    IPC-->>Export: File saved
    Export-->>Grid: Show success toast
```

## State Management

### Zustand Store Architecture

```mermaid
graph LR
    subgraph "Global Stores"
        PS[Profile Store]
        TS[Theme Store]
        MS[Migration Store]
        DS[Discovery Store]
        US[User Store]
        NS[Notification Store]
    end

    subgraph "Components"
        C1[ProfileSelector]
        C2[ThemeToggle]
        C3[MigrationView]
        C4[DiscoveryView]
        C5[UsersView]
        C6[NotificationCenter]
    end

    C1 --> PS
    C2 --> TS
    C3 --> MS
    C4 --> DS
    C5 --> US
    C6 --> NS
```

### Store Pattern

```typescript
// Store structure
interface Store {
  // State
  data: any[];
  loading: boolean;
  error: string | null;

  // Actions
  loadData: () => Promise<void>;
  setData: (data: any[]) => void;
  clearData: () => void;
}

// Implementation with middleware
const useExampleStore = create<Store>()(
  devtools(              // Enable Redux DevTools
    persist(             // Persist to localStorage
      immer((set, get) => ({
        // State
        data: [],
        loading: false,
        error: null,

        // Actions
        async loadData() {
          set({ loading: true });
          try {
            const data = await fetch();
            set({ data, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
      })),
      { name: 'example-store' }
    )
  )
);
```

## Service Layer

### Main Process Services

```mermaid
graph TD
    subgraph "Core Services"
        PS[PowerShell Service]
        FS[File Service]
        CS[Config Service]
        CR[Credential Service]
    end

    subgraph "Discovery Services"
        DS[Discovery Service]
        ADS[AD Discovery]
        EXD[Exchange Discovery]
        SPD[SharePoint Discovery]
    end

    subgraph "Migration Services"
        MOS[Migration Orchestration]
        MES[Migration Execution]
        MVS[Migration Validation]
        RMS[Resource Mapping]
        CRS[Conflict Resolution]
        RBS[Rollback Service]
    end

    subgraph "Infrastructure Services"
        BTS[Background Task Queue]
        STS[Scheduled Task]
        LS[Logging Service]
        AS[Audit Service]
    end

    DS --> PS
    ADS --> PS
    EXD --> PS
    SPD --> PS
    MES --> PS
    MOS --> MES
    MOS --> MVS
    MOS --> RMS
    RMS --> CRS
    MES --> RBS
```

### Renderer Process Services

```mermaid
graph TD
    subgraph "Data Services"
        EXS[Export Service]
        IMS[Import Service]
        CSV[CSV Data Service]
        TVS[Transformation Service]
        VLS[Validation Service]
    end

    subgraph "UI Services"
        NS[Notification Service]
        PS[Progress Service]
        TS[Theme Service]
        LS[Layout Service]
        KS[Keyboard Shortcut Service]
    end

    subgraph "Business Services"
        DS[Discovery Service]
        US[User Service]
        MS[Migration Service]
        RS[Reporting Service]
    end
```

## IPC Communication

### IPC Architecture

```mermaid
graph LR
    subgraph "Renderer Process"
        RC[React Component]
        API[electronAPI]
    end

    subgraph "Preload"
        CB[contextBridge]
        IR[ipcRenderer]
    end

    subgraph "Main Process"
        IM[ipcMain]
        SVC[Services]
    end

    RC --> API
    API --> CB
    CB --> IR
    IR <-->|invoke/handle| IM
    IM --> SVC
    SVC --> IM
```

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `powershell:execute` | Renderer → Main | Execute PowerShell script |
| `powershell:cancel` | Renderer → Main | Cancel running script |
| `powershell:output` | Main → Renderer | Stream output |
| `file:read` | Renderer → Main | Read file |
| `file:write` | Renderer → Main | Write file |
| `file:watch` | Renderer ← Main | File change events |
| `discovery:start` | Renderer → Main | Start discovery |
| `discovery:progress` | Main → Renderer | Discovery progress |
| `migration:plan` | Renderer → Main | Plan migration |
| `migration:execute` | Renderer → Main | Execute migration |
| `migration:progress` | Main → Renderer | Migration progress |
| `notification:show` | Main → Renderer | Show notification |
| `config:get` | Renderer → Main | Get config |
| `config:set` | Renderer → Main | Set config |

## Module Structure

### Component Hierarchy

```mermaid
graph TD
    A[App.tsx]
    A --> L[MainLayout]
    L --> S[Sidebar]
    L --> T[TabView]
    T --> V1[OverviewView]
    T --> V2[DiscoveryView]
    T --> V3[UsersView]
    T --> V4[MigrationView]
    T --> V5[ReportsView]

    V3 --> G[VirtualizedDataGrid]
    V3 --> SB[SearchBar]
    V3 --> FP[FilterPanel]
    V3 --> P[Pagination]

    G --> B1[Button]
    SB --> I1[Input]
    FP --> S1[Select]
    P --> B2[Button]
```

### Service Dependencies

```mermaid
graph LR
    subgraph "Main Services"
        PS[PowerShell Service]
        MS[Migration Service]
        DS[Discovery Service]
        FS[File Service]
    end

    subgraph "Supporting Services"
        CS[Config Service]
        CR[Credential Service]
        LS[Logging Service]
        AS[Audit Service]
    end

    MS --> PS
    MS --> FS
    MS --> AS
    DS --> PS
    DS --> FS
    PS --> CS
    PS --> CR
    PS --> LS
    FS --> LS
```

## Performance Architecture

### Virtual Scrolling

```mermaid
graph TD
    Grid[Data Grid]
    VM[Viewport Manager]
    RR[Row Renderer]
    Buffer[Virtual Buffer]

    Grid --> VM
    VM --> Buffer
    Buffer --> RR
    RR --> DOM[Visible DOM Elements]

    Note[100,000 rows total<br/>Only ~50 rendered<br/>60 FPS maintained]
```

### PowerShell Session Pooling

```mermaid
graph LR
    subgraph "Session Pool"
        S1[Session 1: Idle]
        S2[Session 2: Busy]
        S3[Session 3: Idle]
        S4[Session 4: Busy]
        S5[Session 5: Idle]
    end

    subgraph "Request Queue"
        R1[Request 1]
        R2[Request 2]
        R3[Request 3]
    end

    R1 --> S1
    R2 --> S3
    R3 --> S5

    Note[Min: 2 sessions<br/>Max: 10 sessions<br/>Auto-scale based on load]
```

### Code Splitting

```mermaid
graph TD
    Entry[Main Bundle]
    Entry --> App[App Core]

    App -.->|Lazy Load| D[Discovery Views]
    App -.->|Lazy Load| M[Migration Views]
    App -.->|Lazy Load| R[Reports Views]
    App -.->|Lazy Load| AG[AG Grid]
    App -.->|Lazy Load| RC[Recharts]

    Note[Initial: < 5MB<br/>Total: < 15MB<br/>Load on demand]
```

## Security Architecture

### Credential Storage

```mermaid
graph LR
    User[User Credentials]
    Input[Input Form]
    Encrypt[DPAPI Encryption]
    Store[Encrypted Storage]
    Decrypt[DPAPI Decryption]
    Use[PowerShell Execution]

    User --> Input
    Input --> Encrypt
    Encrypt --> Store
    Store --> Decrypt
    Decrypt --> Use

    Note[Windows DPAPI<br/>User-scoped encryption<br/>Never stored in plain text]
```

### IPC Security

```mermaid
graph TD
    Renderer[Renderer Process]
    Preload[Preload Script]
    Main[Main Process]

    Renderer -->|contextBridge| Preload
    Preload -->|Validated IPC| Main

    Note[No direct Node.js access<br/>Whitelisted APIs only<br/>Input validation]
```

### Audit Trail

```mermaid
graph LR
    Action[User Action]
    Log[Audit Log Service]
    File[Encrypted Log File]
    DB[Audit Database]

    Action --> Log
    Log --> File
    Log --> DB

    Note[Who, What, When, Where<br/>Tamper-proof<br/>Compliance ready]
```

---

For more information, see:
- [Developer Guide](DEVELOPER_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT.md)

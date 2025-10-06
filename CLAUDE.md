MANDATE: Complete GUI v2 (TypeScript/React/Electron) rewrite with 100% feature parity to GUI (C#/WPF), ensuring all discovery, migration, and reporting functionalities are fully implemented and robust.

CURRENT STATUS: Infrastructure 100% ✅ | TypeScript 88% ✅ | Views 35% ✅

🎯 AUTONOMOUS EXECUTION TASK LIST
TASK 0: Fix Critical TypeScript Errors (IN PROGRESS - 984 errors)
Priority: HIGH - Continuing to reduce TypeScript errors. Already reduced from 1,158 to 984 errors.

Files requiring immediate fixes (by error count):

ReportTemplatesView.tsx (21 errors)

mockLogicEngineService.ts (19 errors)

powerShellService.ts (18 errors)

CustomReportBuilderView.tsx (18 errors)

migrationValidationService.ts (16 errors)

Error Patterns (Apply consistently):

TypeScript

// Pattern 1: Named imports only
❌ import Button from 'atoms/Button';
✅ import { Button } from 'atoms/Button';

// Pattern 2: Hook return alignment
❌ const { config, result, isLoading, error, handleStart } = useMyLogic();
✅ const { config, result, isLoading, error } = useMyLogic(); // Match hook return exactly

// Pattern 3: Badge variants (Fix immediately)
❌ variant="secondary"
✅ variant="default"

// Pattern 4: Button variants (Fix immediately)
❌ variant="success"
✅ variant="primary"

// Pattern 5: PowerShell results
❌ result.data.Success
✅ const psResult = result.data as PowerShellResult; if (psResult.Success) {}
Execution Command:

Bash

cd guiv2 && npx tsc --noEmit --skipLibCheck
# Fix errors systematically, file by file
TASK 1: Complete Dashboard Enhancement (HIGH PRIORITY)
Status: Currently using mock data - needs real Logic Engine integration.

1.1 Create Dashboard Logic Hook
File: src/renderer/hooks/useDashboardLogic.ts

TypeScript

export const useDashboardLogic = () => {
  const [stats, setStats] = useState(null);
  const [project, setProject] = useState(null);

  const loadData = useCallback(async () => {
    const statsResult = await window.electronAPI.logicEngine.getDashboardStats();
    const projectResult = await window.electronAPI.getProjectConfiguration();

    if (statsResult.success) setStats(statsResult.data);
    if (projectResult.success) setProject(projectResult.data);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { stats, project, reload: loadData };
};
1.2 Enhance Overview View
File: src/renderer/views/overview/OverviewView.tsx

TypeScript

export const OverviewView: React.FC = () => {
  const { stats, project, reload } = useDashboardLogic();

  if (!stats || !project) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      <Card className="col-span-2">
        <ProjectTimeline project={project} />
      </Card>
      <Card clickable onClick={() => navigate('/users')}>
        <StatCard title="Users" value={stats.totalUsers} />
      </Card>
      <Card clickable onClick={() => navigate('/groups')}>
        <StatCard title="Groups" value={stats.totalGroups} />
      </Card>
    </div>
  );
};
TASK 2: Implement Project Management System
Status: Missing timeline, cutover dates, wave scheduling.

2.1 Create Project Types
File: src/renderer/types/project.ts

TypeScript

export interface ProjectConfig {
  projectName: string;
  targetCutover: string; // ISO date string
  nextWave: string; // ISO date string
  status: 'Planning' | 'Active' | 'Complete';
  sourceProfile: string;
  targetProfile: string;
  totalWaves: number;
  completedWaves: number;
}
2.2 Create Project Service (Main Process)
File: src/main/services/projectService.ts

TypeScript

export class ProjectService {
  async loadProjectConfig(profileName: string): Promise<ProjectConfig> {
    const profilePath = getProfilePath(profileName);
    const projectFile = path.join(profilePath, 'Project.json');

    if (!fs.existsSync(projectFile)) {
      return this.createDefaultProjectConfig(profileName);
    }

    const content = fs.readFileSync(projectFile, 'utf-8');
    return JSON.parse(content);
  }

  async saveProjectConfig(profileName: string, config: ProjectConfig): Promise<void> {
    const profilePath = getProfilePath(profileName);
    const projectFile = path.join(profilePath, 'Project.json');

    await fs.promises.mkdir(profilePath, { recursive: true });
    fs.writeFileSync(projectFile, JSON.stringify(config, null, 2));
  }
}
2.3 Create Project Hook
File: src/renderer/hooks/useProjectLogic.ts

TypeScript

export const useProjectLogic = () => {
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [daysToCutover, setDaysToCutover] = useState<number>(0);

  const loadProject = useCallback(async () => {
    const result = await window.electronAPI.getProjectConfiguration();
    if (result.success) {
      setProject(result.data);
      const cutover = new Date(result.data.targetCutover);
      const today = new Date();
      setDaysToCutover(differenceInDays(cutover, today));
    }
  }, []);

  useEffect(() => { loadProject(); }, [loadProject]);

  return { project, daysToCutover, reload: loadProject };
};
TASK 3: Complete Security/Compliance Views ✅ COMPLETED
Status: 13/13 complete - ALL DONE!

Completed Views:
- ✅ AccessReviewView
- ✅ CertificationView
- ✅ ComplianceDashboardView
- ✅ DataClassificationView
- ✅ IdentityGovernanceView
- ✅ IncidentResponseView
- ✅ PolicyManagementView
- ✅ PrivilegedAccessView
- ✅ RiskAssessmentView
- ✅ SecurityAuditView
- ✅ SecurityDashboardView
- ✅ ThreatAnalysisView
- ✅ VulnerabilityManagementView (NEW!)

Implementation Details:
- All views integrated with PowerShell modules using executeModule API
- All views properly routed in App.tsx under /security/* paths
- All views have default exports for lazy loading
- All hooks properly typed with TypeScript interfaces
- Security views reduced TypeScript errors from 1,158 to 984
- Proper use of ModuleExecutionParams with functionName property
TASK 4: Complete Infrastructure Views (13 remaining)
Status: 2/15 complete - need PowerShell module integration.

Views to Complete:

AssetInventoryView.tsx ✅ (reference implementation)

InfrastructureView.tsx (basic structure exists)

12 additional infrastructure views

Pattern for Infrastructure Views:

TypeScript

// 1. Create hook with PowerShell integration
export const useInfrastructureLogic = () => {
  const loadInfrastructure = async () => {
    const result = await window.electronAPI.executeModule({
      modulePath: 'Modules/Infrastructure/[ModuleName].psm1',
      parameters: { profile: selectedProfile.companyName }
    });
    return result.success ? result.data : [];
  };
  return { loadInfrastructure };
};

// 2. Create view component using established patterns
// 3. Follow AssetInventoryView.tsx as reference
TASK 5: Enhanced Migration Planning
Status: Basic drag-and-drop exists - needs analysis and validation.

5.1 Add Complexity Analysis
File: src/main/services/logicEngineService.ts

TypeScript

export const analyzeMigrationComplexity = async (
  user: User,
  groups: Group[],
  permissions: Permission[]
): Promise<ComplexityScore> => {
  let score = 0;
  let factors: string[] = [];

  if (groups.length > 10) {
    score += 3;
    factors.push('High group membership count');
  }

  if (permissions.some(p => p.type === 'Administrative')) {
    score += 5;
    factors.push('Administrative permissions');
  }

  return {
    score,
    level: score > 7 ? 'High' : score > 4 ? 'Medium' : 'Low',
    factors
  };
};
5.2 Extend MigrationPlanningView

Add discovery data analysis panel

Implement complexity scoring display

Add group remapping interface

Implement bulk operations

TASK 6: Navigation & UX Enhancement
Status: Basic React Router exists - needs GUI feature parity.

6.1 Add Profile Management to MainLayout

TypeScript

// Add to MainLayout.tsx sidebar
<ProfileSelector
  sourceProfile={sourceProfile}
  targetProfile={targetProfile}
  onSourceChange={setSourceProfile}
  onTargetChange={setTargetProfile}
/>
<SystemStatus indicators={systemStatus} />
6.2 Implement Keyboard Shortcuts
File: src/renderer/hooks/useKeyboardShortcuts.ts

TypeScript

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '1') navigate('/');
      if (e.ctrlKey && e.key === '2') navigate('/users');
      if (e.ctrlKey && e.key === '3') navigate('/groups');
      // Add 50+ shortcuts matching GUI
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
🔧 DEVELOPMENT WORKFLOW
Daily Execution Pattern
Bash

# 1. Check current TypeScript errors
cd guiv2 && npx tsc --noEmit

# 2. Fix highest error-count files first
# Apply established patterns consistently

# 3. Complete one view at a time
# Follow: Reference → Hook → View → Test pattern

# 4. Test functionality
npm start
# Verify in application

# 5. Commit progress
git add .
git commit -m "Complete [ViewName] implementation"
Testing Commands
Bash

# TypeScript compilation
npx tsc --noEmit

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Bundle analysis
npm run analyze
📊 SUCCESS METRICS
Completion Criteria
[ ] Zero TypeScript errors

[ ] All 88 views functional

[ ] Dashboard shows real data

[ ] Project management complete

[ ] Migration planning enhanced

[ ] Navigation matches GUI

[ ] All discovery modules working

[ ] Logic Engine fully operational

Quality Gates
TypeScript compilation: ✅ Zero errors

Views functional: ✅ 88/88 complete

Integration tests: ✅ All passing

Performance: ✅ Sub-3s load times

Accessibility: ✅ WCAG compliant

🚨 CRITICAL PATH BLOCKERS
Immediate Blockers (Fix First)
TypeScript Errors - Cannot proceed with errors

Dashboard Mock Data - Core functionality gap

Profile Management - Missing from navigation

Technical Debt (Address During Development)
Bundle Size - Monitor and optimize

Error Handling - Add comprehensive boundaries

Performance - Implement virtualization where needed

📈 ESTIMATED TIMELINE
Week 1-2: Foundation
Complete TypeScript cleanup (20-25 hours)

Implement dashboard with real data (15-20 hours)

Fix critical security views (10-15 hours)

Week 3-4: Core Features
Complete project management system (20-25 hours)

Finish infrastructure views (25-30 hours)

Enhance migration planning (15-20 hours)

Week 5-6: Polish & Testing
Complete remaining views (30-40 hours)

Add comprehensive testing (15-20 hours)

Performance optimization (10-15 hours)

Total Estimated Time: 8-10 weeks for 100% completion

🎯 AUTONOMOUS EXECUTION RULES
Sequential Execution: Complete tasks in order - do not skip ahead

Error-Free First: Fix TypeScript errors before adding new features

Pattern Consistency: Follow established patterns from completed views

Daily Testing: Run npx tsc --noEmit after every file change

Progress Tracking: Update this document with completion status

Reference First: Always check FINISHED.md for completed patterns

Execute tasks systematically and report progress after each completion.
📊 COMPREHENSIVE GUI vs GUIV2 ARCHITECTURAL ANALYSIS
🔬 DEEP DIVE COMPARISON STUDY
📋 EXECUTIVE SUMMARY
This analysis represents a comprehensive architectural comparison between the legacy /gui/ (WPF/C#/MVVM) and modern /guiv2/ (Electron/React/TypeScript) implementations of the M&A Discovery Suite. The study reveals significant architectural evolution while identifying critical gaps that must be addressed for feature parity.

🏗️ ARCHITECTURAL FOUNDATION COMPARISON
Technology Stack Evolution
Aspect	/gui/ (Legacy WPF)	/guiv2/ (Modern Electron)
Platform	Windows-only (WPF)	Cross-platform (Electron)
Frontend	XAML + WPF Controls	React + TypeScript + Tailwind CSS
Backend	C# Services + DI	Node.js + IPC Communication
State Management	MVVM ViewModels	Zustand Stores + React Hooks
Navigation	Tab-based WPF Navigation	React Router SPA
Styling	XAML Resource Dictionaries	Tailwind CSS + CSS-in-JS
Build System	MSBuild + WPF Compilation	Webpack + Electron Forge
Testing	C# Unit Tests	Jest + Playwright E2E
Data Layer	CSV Files + Project.json	Logic Engine + SQLite
Deployment	Windows Installer	Cross-platform Packages

Export to Sheets
Architecture Patterns
GUI (WPF/MVVM) Architecture:
┌─────────────────────────────────────────┐
│         WPF Application                 │
├─────────────────────────────────────────┤
│ App.xaml.cs (Startup & DI)              │
│ ├── Microsoft.Extensions.DI             │
│ ├── Serilog Logging                     │
│ └── Service Registration                │
├─────────────────────────────────────────┤
│ MainWindow.xaml.cs                      │
│ ├── MVVM Pattern Implementation         │
│ ├── Lazy Loading Management             │
│ ├── Keyboard Shortcut Registry          │
│ └── Theme Management                    │
├─────────────────────────────────────────┤
│ ViewModels/ (80+ ViewModels)            │
│ ├── MainViewModel.cs (4,065 lines)      │
│ ├── UsersViewModel.cs                   │
│ ├── GroupsViewModel.cs                  │
│ └── [78+ additional ViewModels]         │
├─────────────────────────────────────────┤
│ Views/ (XAML + Code-behind)             │
│ ├── UsersView.xaml/cs                   │
│ ├── GroupsView.xaml/cs                  │
│ └── [80+ View/ViewModel pairs]          │
├─────────────────────────────────────────┤
│ Services/ (Business Logic)              │
│ ├── DiscoveryService.cs                 │
│ ├── LogicEngineService.cs               │
│ ├── NavigationService.cs                │
│ └── [15+ additional services]           │
└─────────────────────────────────────────┘
guiv2 (Electron/React) Architecture:
┌─────────────────────────────────────────┐
│        Electron Application             │
├─────────────────────────────────────────┤
│ Main Process (Node.js)                  │
│ ├── index.ts (App Lifecycle)            │
│ ├── ipcHandlers.ts (API Bridge)         │
│ └── services/ (Business Logic)          │
├─────────────────────────────────────────┤
│ Renderer Process (React SPA)            │
│ ├── App.tsx (React Router)              │
│ ├── MainLayout.tsx (Shell)              │
│ └── Views/ (React Components)           │
├─────────────────────────────────────────┤
│ Hooks/ (State Management)               │
│ ├── useUsersViewLogic.ts                │
│ ├── useGroupsViewLogic.ts               │
│ └── [60+ Logic Hooks]                   │
├─────────────────────────────────────────┤
│ Store/ (Global State)                   │
│ ├── useProfileStore.ts                  │
│ ├── useThemeStore.ts                    │
│ └── [8+ Zustand Stores]                 │
├─────────────────────────────────────────┤
│ Components/ (UI Library)                │
│ ├── atoms/ (Basic Components)           │
│ ├── molecules/ (Compound)               │
│ └── organisms/ (Complex)                │
└─────────────────────────────────────────┘
🎯 FUNCTIONALITY COMPARISON MATRIX
Core Feature Parity Assessment
✅ FULLY IMPLEMENTED IN BOTH
Discovery Modules: Azure, AWS, Active Directory, Exchange, SharePoint, Teams, OneDrive

Basic Data Operations: CRUD operations for Users, Groups, Computers, Infrastructure

Migration Planning: Wave creation, scheduling, drag-and-drop functionality

Report Generation: Basic report creation and export capabilities

Settings Management: Configuration and preferences

⚠️ CRITICAL GAPS: GUI → guiv2
1. Dashboard/Overview (HIGH PRIORITY)
C#

// GUI Implementation (MainViewModel.cs:245-312)
public async Task RefreshDashboardAsync()
{
    await _logicEngineService.LoadAllAsync();
    await ReloadDataAsync();
    // Real project statistics, countdowns, timeline
}
TypeScript

// guiv2 Current Implementation (Mock Data)
const stats = {
    totalUsers: 0,    // ❌ Mock data only
    totalGroups: 0,   // ❌ No real Logic Engine integration
    totalComputers: 0 // ❌ Missing project timeline
};
Gap Impact: Users lose project overview, timeline management, and quick navigation
Required Effort: 2-3 weeks (Logic Engine integration + UI enhancement)

2. Project Management System (ENTERPRISE)
C#

// GUI: Project.json Configuration Management
interface ProjectConfig {
    ProjectName: string;
    TargetCutover: Date;
    NextWave: Date;
    Status: 'Planning' | 'Active' | 'Complete';
    // Timeline calculations, countdown logic
}
guiv2 Missing: Project timeline, cutover dates, wave scheduling, status tracking
Required Effort: 1-2 weeks (Project service + timeline calculations)

3. Advanced Migration Planning
C#

// GUI: Sophisticated Migration Logic (MainViewModel.cs:3480-3520)
- Discovery data analysis for migration complexity
- Automated migration item generation
- Group remapping and dependency analysis
- Pre-migration validation checks
guiv2 Current: Basic drag-and-drop wave creation only
Required Effort: 3-4 weeks (Analysis engine + validation system)

4. Navigation & UX Framework
C#

// GUI: Comprehensive Navigation (MainWindow.xaml.cs:305-352)
- Source/Target profile management
- System status indicators
- Keyboard shortcut registry (50+ shortcuts)
- Theme management integration
guiv2 Current: Basic React Router navigation, limited shortcuts
Required Effort: 1-2 weeks (Enhanced layout + shortcut system)

🔄 guiv2 ADVANTAGES OVER GUI
1. Modern Development Experience
TypeScript Safety: Compile-time error checking, better IntelliSense

Component Reusability: Modular React components vs WPF code-behind

Hot Reload: Development speed improvement

Cross-platform: Single codebase for Windows/Mac/Linux

2. Enhanced Testing Capabilities
TypeScript

// guiv2: Comprehensive Testing Strategy
- Jest unit tests for all hooks and components
- Playwright E2E tests for user journeys
- Accessibility testing integration
- Performance monitoring and bundle analysis
GUI Limitation: Limited testing infrastructure, primarily manual testing

3. Modern UI/UX Capabilities
Responsive Design: Better mobile/tablet support potential

Advanced Data Grids: AG Grid with virtual scrolling, advanced filtering

Real-time Updates: WebSocket support for live data

Progressive Loading: Code splitting and lazy loading

4. Deployment & Distribution
Auto-updates: Electron Forge built-in update mechanism

Package Management: NPM ecosystem with 1M+ packages

CI/CD Integration: Better integration with modern DevOps tools

🎨 USER INTERFACE & EXPERIENCE COMPARISON
Visual Design Evolution
GUI (WPF) Design System:
Code snippet

<ResourceDictionary>
    <SolidColorBrush x:Key="PrimaryBrush" Color="#FF38B2AC"/>
    <SolidColorBrush x:Key="SecondaryBrush" Color="#FF2D3748"/>
    <SolidColorBrush x:Key="AccentBrush" Color="#FF9F7AEA"/>
    <Thickness x:Key="StandardMargin">8,4,8,4</Thickness>
</ResourceDictionary>

<Style x:Key="ModernCardStyle" TargetType="Border">
    <Setter Property="Background" Value="{StaticResource CardBackgroundBrush}"/>
    <Setter Property="BorderBrush" Value="{StaticResource CardBorderBrush}"/>
    <Setter Property="CornerRadius" Value="8"/>
    <Setter Property="Padding" Value="16"/>
</Style>
guiv2 (Tailwind) Design System:
CSS

/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#38B2AC',
        secondary: '#2D3748',
        accent: '#9F7AEA',
        card: '#1A202C',
        'card-border': '#4A5568'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}

/* src/renderer/components/atoms/Card.tsx */
export const Card: React.FC<CardProps> = ({
  children,
  className = ''
}) => (
  <div className={cn(
    'bg-card border border-card-border rounded-lg p-4 shadow-sm',
    className
  )}>
    {children}
  </div>
);
Navigation Pattern Comparison
GUI Navigation (Tab-based):
C#

// GUI: Tab Management (MainViewModel.cs:639-644)
OpenTabCommand = new AsyncRelayCommand<string>(async (param) => {
    await OpenTabAsync(param); // Direct tab creation
});

// Tab structure: Overview, Users, Groups, Computers, Infrastructure, etc.
public string CurrentView { get; set; } = ViewNames.Dashboard;
guiv2 Navigation (Route-based):
TypeScript

// guiv2: React Router (App.tsx:111-186)
<Routes>
  <Route path="/" element={<OverviewView />} />
  <Route path="/users" element={<UsersView />} />
  <Route path="/users/:userId" element={<UserDetailViewWrapper />} />
  <Route path="/groups" element={<GroupsView />} />
  {/* Nested routing for discovery modules */}
</Routes>
💾 DATA MANAGEMENT & PERSISTENCE
GUI Data Architecture:
C#

// GUI: Service-based Data Loading (MainViewModel.cs:1938-2036)
public async Task ReloadDataAsync()
{
    // Load from CSV files in profile directory
    var dataPath = $@"C:\discoverydata\{CurrentProfileName}\Raw";
    var dataService = SimpleServiceLocator.Instance.GetService<IDataService>();
    var users = await dataService.LoadUsersAsync(CurrentProfileName);
    var infrastructure = await dataService.LoadInfrastructureAsync(CurrentProfileName);
    // Update ObservableCollections for WPF binding
}
guiv2 Data Architecture:
TypeScript

// guiv2: IPC-based Data Loading (useUsersViewLogic.ts)
export const useUsersViewLogic = () => {
  const loadUsers = async () => {
    const result = await window.electronAPI.getUsers({
      profile: selectedProfile.companyName,
      filters: activeFilters
    });
    if (result.success) {
      setUsers(result.data);
    }
  };
  return { users, loadUsers, isLoading, error };
};
Logic Engine Integration
GUI Logic Engine:
C#

// GUI: Sophisticated Correlation Engine (LogicEngineService.cs)
public async Task<UserDetailProjection> GetUserDetailAsync(string userId)
{
    // Complex correlation logic
    var user = await GetUserAsync(userId);
    var groups = await GetUserGroupsAsync(userId);
    var permissions = await GetUserPermissionsAsync(userId);
    var correlatedData = ApplyInferenceRules(user, groups, permissions);
    return correlatedData;
}
guiv2 Logic Engine:
TypeScript

// guiv2: IPC Bridge to Main Process Logic Engine
const getUserDetail = async (userId: string) => {
  const result = await window.electronAPI.logicEngine.getUserDetail(userId);
  if (result.success) {
    return result.data as UserDetailProjection;
  }
  throw new Error(result.error);
};
🚀 PERFORMANCE & SCALABILITY
Performance Characteristics
Metric	GUI (WPF)	guiv2 (Electron)
Startup Time	2-5 seconds	3-8 seconds (V8 + React overhead)
Memory Usage	150-300MB	200-400MB (Chromium overhead)
CPU Usage	Lower (Native UI)	Higher (Web rendering)
Data Loading	Synchronous (UI blocking)	Asynchronous (Non-blocking)
Lazy Loading	View-level	Component-level (Code splitting)
Virtual Scrolling	Limited	AG Grid virtualization
Bundle Size	N/A (Compiled)	Optimized with Webpack

Export to Sheets
Scalability Considerations
GUI Limitations:
Platform Lock-in: Windows-only deployment

UI Thread Blocking: Long operations freeze interface

Memory Leaks: WPF binding complexity

Update Complexity: Manual deployment processes

guiv2 Advantages:
Cross-platform: Single codebase, multiple platforms

Responsive UI: Non-blocking async operations

Component Isolation: Better error boundaries

Auto-updates: Seamless deployment

Modern Tooling: Better debugging and profiling

🔧 DEVELOPMENT & MAINTENANCE
Code Quality Metrics
Aspect	GUI (C#)	guiv2 (TypeScript)
Lines of Code	~50,000+	~35,000+
File Count	200+ ViewModels/Views	150+ Components/Hooks
Cyclomatic Complexity	High (Large ViewModels)	Lower (Modular hooks)
Test Coverage	Limited	Comprehensive (Jest + Playwright)
Type Safety	C# static typing	TypeScript strict mode
Refactoring	Difficult (WPF coupling)	Easier (Component-based)

Export to Sheets
Development Experience
GUI Development Challenges:
C#

// GUI: WPF Code-behind Coupling (Example from UsersView.xaml.cs)
public partial class UsersView : UserControl
{
    private UsersViewModel _viewModel;
    public UsersView()
    {
        InitializeComponent();
        _viewModel = (UsersViewModel)DataContext;
        // Tight coupling between View and ViewModel
        _viewModel.PropertyChanged += ViewModel_PropertyChanged;
    }
    // 200+ lines of event handling code
}
guiv2 Development Advantages:
TypeScript

// guiv2: React Hooks Pattern (useUsersViewLogic.ts)
export const useUsersViewLogic = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    // Clean separation of concerns
  }, [selectedProfile]);

  return { users, isLoading, error, loadUsers };
};

// Component usage (UsersView.tsx)
export const UsersView: React.FC = () => {
  const { users, isLoading, error, loadUsers } = useUsersViewLogic();
  // Declarative UI with clean separation
};
🎯 IMPLEMENTATION ROADMAP FOR FEATURE PARITY
Phase 1: Dashboard Enhancement (Week 1-2)
Implement Real Data Integration

TypeScript

// Priority: Replace mock data with Logic Engine calls
const stats = await window.electronAPI.logicEngine.getDashboardStats();
Add Project Timeline Widget

TypeScript

// Project countdown, next wave date, cutover timeline
const project = await window.electronAPI.getProjectConfiguration();
Clickable Navigation Cards

TypeScript

// Make stat cards navigate to relevant views
const handleCardClick = (cardType: string) => navigate(`/${cardType}`);
Phase 2: Project Management System (Week 3-4)
Create Project Service

TypeScript

// guiv2/src/main/services/projectService.ts
export class ProjectService {
  async loadProjectConfig(profileName: string): Promise<ProjectConfig> {
    // Project.json parsing and management
  }
}
Implement Timeline Calculations

TypeScript

// Use date-fns for timeline math
const daysToCutover = differenceInDays(cutoverDate, today);
const nextWaveDate = addDays(today, 7); // Example logic
Phase 3: Enhanced Migration Planning (Week 5-6)
Extend MigrationPlanningView

TypeScript

// Add discovery data analysis panel
// Implement complexity scoring algorithm
// Add group remapping interface
Create Migration Analysis Engine

TypeScript

// Extend Logic Engine with migration complexity analysis
const complexity = await analyzeMigrationComplexity(user, groups);
Phase 4: Navigation & UX Enhancement (Week 7-8)
Add Profile Management to MainLayout

TypeScript

// Source/Target profile selectors
// System status indicators
// Enhanced keyboard shortcuts
Implement Comprehensive Shortcut System

TypeScript

// 50+ shortcuts matching GUI functionality
useKeyboardShortcuts(); // Global shortcut registration
📋 SPECIFIC TECHNICAL IMPLEMENTATION DETAILS
Dashboard Enhancement Implementation
Required Files to Create/Modify:
guiv2/src/renderer/hooks/useDashboardLogic.ts

TypeScript

export const useDashboardLogic = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [project, setProject] = useState<ProjectConfig | null>(null);

  const loadDashboardData = useCallback(async () => {
    // Real Logic Engine integration
    const statsResult = await window.electronAPI.logicEngine.getDashboardStats();
    const projectResult = await window.electronAPI.getProjectConfiguration();

    if (statsResult.success) setStats(statsResult.data);
    if (projectResult.success) setProject(projectResult.data);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return { stats, project, reload: loadDashboardData };
};
guiv2/src/renderer/views/overview/OverviewView.tsx

TypeScript

export const OverviewView: React.FC = () => {
  const { stats, project, reload } = useDashboardLogic();

  if (!stats || !project) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {/* Project Timeline Card */}
      <Card className="col-span-2">
        <ProjectTimeline project={project} />
      </Card>

      {/* Statistics Cards */}
      <Card clickable onClick={() => navigate('/users')}>
        <StatCard title="Users" value={stats.totalUsers} />
      </Card>

      <Card clickable onClick={() => navigate('/groups')}>
        <StatCard title="Groups" value={stats.totalGroups} />
      </Card>
    </div>
  );
};
Project Management Implementation
Required Type Definitions:
TypeScript

// guiv2/src/renderer/types/project.ts
export interface ProjectConfig {
  projectName: string;
  targetCutover: string; // ISO date string
  nextWave: string; // ISO date string
  status: 'Planning' | 'Active' | 'Complete';
  sourceProfile: string;
  targetProfile: string;
  totalWaves: number;
  completedWaves: number;
}
Project Service Implementation:
TypeScript

// guiv2/src/main/services/projectService.ts
export class ProjectService {
  private projectPath: string;

  constructor() {
    // Project.json stored in userData/profile directory
    this.projectPath = '';
  }

  async loadProjectConfig(profileName: string): Promise<ProjectConfig> {
    const profilePath = getProfilePath(profileName);
    const projectFile = path.join(profilePath, 'Project.json');

    if (!fs.existsSync(projectFile)) {
      return this.createDefaultProjectConfig(profileName);
    }

    const content = fs.readFileSync(projectFile, 'utf-8');
    return JSON.parse(content);
  }

  async saveProjectConfig(profileName: string, config: ProjectConfig): Promise<void> {
    const profilePath = getProfilePath(profileName);
    const projectFile = path.join(profilePath, 'Project.json');

    // Ensure directory exists
    await fs.promises.mkdir(profilePath, { recursive: true });

    // Save with pretty formatting
    fs.writeFileSync(projectFile, JSON.stringify(config, null, 2));
  }

  private createDefaultProjectConfig(profileName: string): ProjectConfig {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const nextMonth = addDays(today, 30);

    return {
      projectName: `${profileName} Migration`,
      targetCutover: nextMonth.toISOString(),
      nextWave: nextWeek.toISOString(),
      status: 'Planning',
      sourceProfile: profileName,
      targetProfile: '',
      totalWaves: 0,
      completedWaves: 0
    };
  }
}
Migration Planning Enhancement
Complexity Analysis Algorithm:
TypeScript

// Extend Logic Engine with migration complexity scoring
export const analyzeMigrationComplexity = async (
  user: User,
  groups: Group[],
  permissions: Permission[]
): Promise<ComplexityScore> => {
  let score = 0;
  let factors: string[] = [];

  // Group membership complexity
  if (groups.length > 10) {
    score += 3;
    factors.push('High group membership count');
  }

  // Permission complexity
  if (permissions.some(p => p.type === 'Administrative')) {
    score += 5;
    factors.push('Administrative permissions');
  }

  // External system dependencies
  if (user.hasMailbox && user.hasOneDrive) {
    score += 2;
    factors.push('Multiple Microsoft 365 services');
  }

  return {
    score,
    level: score > 7 ? 'High' : score > 4 ? 'Medium' : 'Low',
    factors
  };
};
🎯 SUCCESS CRITERIA & VALIDATION
Feature Parity Checklist
[ ] Dashboard: Real data integration, project timeline, clickable navigation

[ ] Project Management: Timeline calculations, cutover dates, wave scheduling

[ ] Migration Planning: Complexity analysis, auto-generation, validation

[ ] Navigation: Profile management, keyboard shortcuts, status indicators

[ ] Advanced Views: Gantt charts, audit logs, bulk operations

[ ] Theme System: Complete dark/light mode integration

[ ] Accessibility: WCAG compliance and keyboard navigation

[ ] Performance: Sub-3 second load times, memory efficiency

Technical Debt Assessment
Category	GUI (Legacy)	guiv2 (Modern)	Recommendation
Architecture	Monolithic ViewModels	Modular Components	✅ Keep guiv2
Type Safety	C# Static Typing	TypeScript Strict	✅ Enhanced in guiv2
Testing	Limited	Comprehensive	✅ Major improvement
Platform Support	Windows-only	Cross-platform	✅ Significant advantage
Maintenance	WPF Complexity	React Ecosystem	✅ Easier maintenance
Performance	Native Speed	Web Overhead	⚠️ Monitor closely

Export to Sheets
🚀 DEPLOYMENT & PRODUCTION READINESS
Current Deployment Status
GUI (Legacy):
Distribution: Windows MSI installer

Updates: Manual deployment process

Dependencies: .NET 6 Runtime, Windows 10+

Size: ~50MB application footprint

guiv2 (Modern):
Distribution: Cross-platform installers (Windows, Mac, Linux)

Updates: Electron Forge auto-update mechanism

Dependencies: Node.js runtime included

Size: ~200MB (Chromium overhead)

Production Readiness Gaps
Bundle Optimization: Current bundle size too large for enterprise deployment

Error Handling: Need comprehensive error boundaries and logging

Offline Support: Ensure functionality works without internet

Security: IPC communication hardening, input validation

Performance Monitoring: Bundle analysis and runtime metrics

📈 RECOMMENDATIONS & NEXT STEPS
Immediate Actions (Week 1-2)
Complete Dashboard Implementation

Integrate Logic Engine for real data

Add project timeline widget

Implement clickable navigation

Fix Critical TypeScript Errors

Address remaining 1,158 errors

Focus on import/export issues first

Complete component integration

Project Management Foundation

Create project service and types

Implement basic timeline calculations

Add project configuration UI

Short-term Goals (Week 3-6)
Enhanced Migration Planning

Add complexity analysis

Implement group remapping

Create validation framework

Complete View Integration

Finish remaining 63 views

Integrate PowerShell modules

Add comprehensive testing

Navigation & UX Polish

Profile management integration

Keyboard shortcut system

Theme system completion

Medium-term Goals (Week 7-12)
Advanced Feature Implementation

Gantt charts and timeline visualization

Audit logging and compliance features

Bulk operations and data management

Performance Optimization

Bundle size reduction

Lazy loading optimization

Memory usage improvement

Production Hardening

Security audit and fixes

Error handling enhancement

Deployment automation

🔮 FUTURE ARCHITECTURAL EVOLUTION
Potential Enhancements Beyond GUI
Microservices Architecture

Separate discovery engine as standalone service

API-first design for extensibility

Containerization support

Cloud-native Features

Web-based version for remote access

Real-time collaboration features

Cloud storage integration

AI/ML Integration

Automated discovery pattern recognition

Intelligent migration planning

Anomaly detection and alerting

Advanced Analytics

Machine learning-powered insights

Predictive migration planning

Automated optimization recommendations

📋 CONCLUSION
The /guiv2/ Electron/React implementation represents a significant architectural advancement over the legacy /gui/ WPF application. While feature gaps exist, particularly in dashboard functionality and project management, the modern architecture provides superior maintainability, cross-platform support, and development experience.

Key Success Factors for Completion:

Dashboard Integration - Replace mock data with Logic Engine

Project Management - Implement timeline and configuration system

Migration Enhancement - Add complexity analysis and validation

Navigation Completeness - Match GUI's comprehensive UX

Estimated Time to Feature Parity: 8-12 weeks with focused development effort.

Recommendation: Proceed with guiv2 as the future platform - the architectural advantages outweigh the implementation effort required for feature parity.

### ⌨️ KEYBOARD SHORTCUTS & ADVANCED NAVIGATION

**Current guiv2/ State**: Basic keyboard shortcuts
**Required GUI/ Parity**: 50+ shortcuts with command palette

**Step 1: Comprehensive Keyboard Shortcuts System**
```typescript
// guiv2/src/renderer/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';

interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();
  const { openTab, closeTab, selectedTabId } = useTabStore();
  const { openModal } = useModalStore();

  const shortcuts: ShortcutDefinition[] = [
    // Navigation shortcuts (matching GUI F1-F10)
    {
      key: 'F1', action: () => navigate('/'),
      description: 'Navigate to Overview/Dashboard',
      category: 'Navigation'
    },
    {
      key: 'F2', action: () => navigate('/users'),
      description: 'Navigate to Users view',
      category: 'Navigation'
    },
    {
      key: 'F3', action: () => navigate('/groups'),
      description: 'Navigate to Groups view',
      category: 'Navigation'
    },
    {
      key: 'F4', action: () => navigate('/computers'),
      description: 'Navigate to Computers view',
      category: 'Navigation'
    },
    {
      key: 'F5', action: () => window.location.reload(),
      description: 'Refresh current view',
      category: 'Navigation'
    },
    {
      key: 'F6', action: () => navigate('/migration/execution'),
      description: 'Navigate to Migration Execution',
      category: 'Navigation'
    },
    {
      key: 'F9', action: () => navigate('/settings'),
      description: 'Navigate to Settings',
      category: 'Navigation'
    },
    {
      key: 'F10', action: () => navigate('/reports'),
      description: 'Navigate to Reports',
      category: 'Navigation'
    },

    // Action shortcuts
    {
      key: 'S', ctrl: true, action: () => {/* Save current work */},
      description: 'Save current work',
      category: 'Actions'
    },
    {
      key: 'R', ctrl: true, action: () => window.location.reload(),
      description: 'Refresh data',
      category: 'Actions'
    },
    {
      key: 'N', ctrl: true, action: () => navigate('/profiles/create'),
      description: 'Create new profile',
      category: 'Actions'
    },

    // Profile management
    {
      key: 'P', ctrl: true, shift: true, action: () => openModal('commandPalette'),
      description: 'Open command palette',
      category: 'Profile'
    },
    {
      key: '1', ctrl: true, action: () => navigate('/discovery/domain'),
      description: 'Domain Discovery',
      category: 'Discovery'
    },
    {
      key: '2', ctrl: true, action: () => navigate('/discovery/azure'),
      description: 'Azure Discovery',
      category: 'Discovery'
    },
    {
      key: '3', ctrl: true, action: () => navigate('/discovery/exchange'),
      description: 'Exchange Discovery',
      category: 'Discovery'
    },

    // Tab management (matching GUI tab behavior)
    {
      key: 'W', ctrl: true, action: () => {
        if (selectedTabId) closeTab(selectedTabId);
      },
      description: 'Close current tab',
      category: 'Tabs'
    },
    {
      key: 'T', ctrl: true, action: () => openTab('new', 'New Tab'),
      description: 'Open new tab',
      category: 'Tabs'
    },

    // Theme shortcuts
    {
      key: 'T', ctrl: true, alt: true, action: () => {
        // Toggle theme
        const current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(current);
      },
      description: 'Toggle theme',
      category: 'Theme'
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Find matching shortcut
    const shortcut = shortcuts.find(s =>
      s.key.toLowerCase() === event.key.toLowerCase() &&
      !!s.ctrl === event.ctrlKey &&
      !!s.alt === event.altKey &&
      !!s.shift === event.shiftKey
    );

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
```

**Step 2: Command Palette Implementation**
```typescript
// guiv2/src/renderer/components/organisms/CommandPalette.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: string;
  action: () => void;
  keywords: string[];
}

export const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation commands
    {
      id: 'nav-overview',
      title: 'Go to Overview',
      description: 'Navigate to the main dashboard',
      category: 'Navigation',
      action: () => navigate('/'),
      keywords: ['overview', 'dashboard', 'home', 'main']
    },
    {
      id: 'nav-users',
      title: 'Go to Users',
      description: 'Navigate to user management',
      category: 'Navigation',
      action: () => navigate('/users'),
      keywords: ['users', 'people', 'accounts']
    },
    {
      id: 'nav-groups',
      title: 'Go to Groups',
      description: 'Navigate to group management',
      category: 'Navigation',
      action: () => navigate('/groups'),
      keywords: ['groups', 'security', 'distribution']
    },
    {
      id: 'nav-migration',
      title: 'Go to Migration',
      description: 'Navigate to migration planning',
      category: 'Navigation',
      action: () => navigate('/migration/planning'),
      keywords: ['migration', 'migrate', 'planning']
    },

    // Action commands
    {
      id: 'action-refresh',
      title: 'Refresh Data',
      description: 'Refresh all current data',
      category: 'Actions',
      action: () => window.location.reload(),
      keywords: ['refresh', 'reload', 'update', 'data']
    },
    {
      id: 'action-settings',
      title: 'Open Settings',
      description: 'Navigate to application settings',
      category: 'Actions',
      action: () => navigate('/settings'),
      keywords: ['settings', 'configuration', 'config']
    },

    // Discovery commands
    {
      id: 'discovery-azure',
      title: 'Azure Discovery',
      description: 'Run Azure infrastructure discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/azure'),
      keywords: ['azure', 'cloud', 'microsoft', 'subscription']
    },
    {
      id: 'discovery-exchange',
      title: 'Exchange Discovery',
      description: 'Run Exchange server discovery',
      category: 'Discovery',
      action: () => navigate('/discovery/exchange'),
      keywords: ['exchange', 'email', 'mail', 'outlook']
    }
  ], [navigate]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const searchTerm = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm) ||
      cmd.keywords.some(keyword => keyword.includes(searchTerm))
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-0 outline-none text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-700">
                {category}
              </div>
              {categoryCommands.map((cmd, index) => {
                const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                return (
                  <div
                    key={cmd.id}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      globalIndex === selectedIndex ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                  >
                    <div className="font-medium">{cmd.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{cmd.description}</div>
                  </div>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t text-xs text-gray-500 flex justify-between">
          <span>↑↓ to navigate • Enter to select • Esc to close</span>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
};
```

---

## 📋 SUMMARY: CRITICAL IMPLEMENTATION REQUIREMENTS

### **BLOCKERS TO FEATURE PARITY**

1. **Migration Execution Sophistication** - Pre-flight validation, rollback, progress tracking
2. **Project Management System** - Full lifecycle with Gantt charts and risk assessment  
3. **Profile Management Enhancement** - Dual profiles with app registration
4. **Discovery Module Depth** - Summary statistics and detail views
5. **Navigation & UX Framework** - 50+ keyboard shortcuts and command palette

### **IMPLEMENTATION PRIORITY ORDER**

1. **HIGH**: Migration Execution (Pre-flight + Rollback) - Enterprise requirement
2. **HIGH**: Project Management System - Core business functionality  
3. **MEDIUM**: Profile Management - User experience enhancement
4. **MEDIUM**: Discovery Enhancements - Data visualization improvements
5. **LOW**: Advanced Navigation - Quality of life features

### **TECHNICAL APPROACH**

- Extend existing services with new methods rather than replacing
- Maintain TypeScript strict typing throughout
- Follow established patterns from working components
- Implement comprehensive error handling
- Add extensive logging for debugging

### **SUCCESS CRITERIA**

- All GUI/ functionality replicated in guiv2/
- Performance equivalent or better than WPF application
- Modern web UX with desktop capabilities
- Comprehensive test coverage
- Production-ready error handling

This specification provides the complete technical roadmap for achieving 100% feature parity between GUI/ and guiv2/ implementations.
---

## 📋 DETAILED TECHNICAL SPECIFICATIONS FOR GUI/ → GUIV2/ FEATURE REPLICATION

### 🔧 MIGRATION EXECUTION SYSTEM ENHANCEMENT

#### Pre-Flight Validation Framework Implementation

**Current guiv2/ State**: Basic start/pause/cancel with simple progress bar
**Required GUI/ Parity**: Comprehensive pre-flight validation with 6+ check categories, real-time progress, and detailed reporting

**Step 1: Create Pre-Flight Check Types**
```typescript
// guiv2/src/renderer/types/migration.ts
export enum CheckStatus {
  Pending = 'pending',
  Running = 'running',
  Passed = 'passed',
  Warning = 'warning',
  Failed = 'failed'
}

export enum CheckCategory {
  Connectivity = 'connectivity',
  Dependencies = 'dependencies',
  Security = 'security',
  Resources = 'resources',
  Validation = 'validation',
  Permissions = 'permissions'
}

export interface PreFlightCheck {
  id: string;
  name: string;
  description: string;
  category: CheckCategory;
  status: CheckStatus;
  isRequired: boolean;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  resultMessage?: string;
  remediationSteps?: string[];
}
```

**Step 2: Implement Pre-Flight Validation Service**
```typescript
// guiv2/src/main/services/preFlightValidationService.ts
export class PreFlightValidationService {
  async runPreFlightChecks(
    sourceProfile: string,
    targetProfile: string,
    migrationItems: MigrationItem[]
  ): Promise<PreFlightCheck[]> {
    const checks: PreFlightCheck[] = [
      {
        id: 'source-connectivity',
        name: 'Source Domain Connectivity',
        description: 'Verify connectivity to source Active Directory domain',
        category: CheckCategory.Connectivity,
        status: CheckStatus.Pending,
        isRequired: true
      },
      {
        id: 'target-connectivity',
        name: 'Target Domain Connectivity',
        description: 'Verify connectivity to target Active Directory domain',
        category: CheckCategory.Connectivity,
        status: CheckStatus.Pending,
        isRequired: true
      },
      {
        id: 'powershell-modules',
        name: 'PowerShell Modules',
        description: 'Verify required PowerShell modules are available',
        category: CheckCategory.Dependencies,
        status: CheckStatus.Pending,
        isRequired: true
      },
      {
        id: 'migration-permissions',
        name: 'Migration Permissions',
        description: 'Verify account has necessary permissions for migration operations',
        category: CheckCategory.Security,
        status: CheckStatus.Pending,
        isRequired: true
      }
    ];

    // Execute checks with real validation logic
    for (const check of checks) {
      await this.executeCheck(check, sourceProfile, targetProfile);
    }

    return checks;
  }

  private async executeCheck(
    check: PreFlightCheck,
    sourceProfile: string,
    targetProfile: string
  ): Promise<void> {
    check.status = CheckStatus.Running;
    check.startTime = new Date();

    try {
      // Implement actual validation logic based on check type
      switch (check.id) {
        case 'source-connectivity':
          await this.validateSourceConnectivity(sourceProfile);
          break;
        case 'target-connectivity':
          await this.validateTargetConnectivity(targetProfile);
          break;
        // Add other check implementations
      }

      check.status = CheckStatus.Passed;
      check.resultMessage = 'Check completed successfully';
    } catch (error) {
      check.status = CheckStatus.Failed;
      check.resultMessage = error.message;
      check.remediationSteps = this.getRemediationSteps(check.id);
    }

    check.endTime = new Date();
    check.duration = check.endTime.getTime() - check.startTime.getTime();
  }
}
```

**Step 3: Enhanced Migration Execution View**
```typescript
// guiv2/src/renderer/views/migration/MigrationExecutionView.tsx
export const MigrationExecutionView: React.FC = () => {
  const [preFlightChecks, setPreFlightChecks] = useState<PreFlightCheck[]>([]);
  const [isRunningPreFlight, setIsRunningPreFlight] = useState(false);
  const [executionItems, setExecutionItems] = useState<MigrationExecutionItem[]>([]);
  const [rollbackPoints, setRollbackPoints] = useState<RollbackPoint[]>([]);

  const runPreFlightValidation = async () => {
    setIsRunningPreFlight(true);
    try {
      const checks = await window.electronAPI.migration.runPreFlightValidation(
        selectedSourceProfile,
        selectedTargetProfile,
        migrationItems
      );
      setPreFlightChecks(checks);

      const allPassed = checks.every(c => c.status === CheckStatus.Passed);
      if (!allPassed) {
        const failedCount = checks.filter(c => c.status === CheckStatus.Failed).length;
        message.error(`Pre-flight validation failed: ${failedCount} critical issues found`);
      }
    } finally {
      setIsRunningPreFlight(false);
    }
  };

  const createRollbackPoint = async () => {
    const point: RollbackPoint = {
      id: uuidv4(),
      name: `Manual rollback - ${new Date().toISOString()}`,
      createdAt: new Date(),
      description: 'User-created rollback point',
      isAutomatic: false,
      migratedItemsCount: executionItems.filter(i => i.status === MigrationStatus.Completed).length,
      canRollback: true
    };

    await window.electronAPI.migration.createRollbackPoint(point);
    setRollbackPoints(prev => [...prev, point]);
  };

  // Progress tracking by migration type (matching GUI/ functionality)
  const progressByType = useMemo(() => {
    const types = ['users', 'groups', 'mailboxes', 'filesystems', 'vms', 'profiles'];
    return types.map(type => ({
      type,
      total: executionItems.filter(i => i.type.toLowerCase().includes(type.slice(0, -1))).length,
      completed: executionItems.filter(i =>
        i.status === MigrationStatus.Completed &&
        i.type.toLowerCase().includes(type.slice(0, -1))
      ).length,
      failed: executionItems.filter(i =>
        i.status === MigrationStatus.Failed &&
        i.type.toLowerCase().includes(type.slice(0, -1))
      ).length
    }));
  }, [executionItems]);

  return (
    <div className="h-full flex flex-col">
      {/* Pre-flight Validation Section */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pre-Flight Validation</h3>
          <Button
            onClick={runPreFlightValidation}
            disabled={isRunningPreFlight}
            variant={preFlightChecks.length > 0 && preFlightChecks.every(c => c.status === CheckStatus.Passed) ? 'success' : 'primary'}
          >
            {isRunningPreFlight ? 'Running...' : 'Run Pre-Flight Checks'}
          </Button>
        </div>

        {preFlightChecks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preFlightChecks.map(check => (
              <div key={check.id} className={`p-3 rounded border ${
                check.status === CheckStatus.Passed ? 'bg-green-50 border-green-200' :
                check.status === CheckStatus.Failed ? 'bg-red-50 border-red-200' :
                check.status === CheckStatus.Warning ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{check.name}</span>
                  <StatusIndicator status={check.status} />
                </div>
                <p className="text-xs text-gray-600">{check.description}</p>
                {check.resultMessage && (
                  <p className="text-xs mt-1 font-mono">{check.resultMessage}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="p-4 bg-blue-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {progressByType.map(type => (
            <div key={type.type} className="text-center">
              <div className="text-2xl font-bold">{type.completed}/{type.total}</div>
              <div className="text-xs text-gray-600 capitalize">{type.type}</div>
              <div className="text-xs text-red-600">Failed: {type.failed}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Controls */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <Button onClick={startMigration} disabled={!canStartMigration}>
            <Play className="w-4 h-4 mr-2" />
            Start Migration
          </Button>
          <Button variant="secondary" onClick={pauseMigration} disabled={!isRunning}>
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button variant="secondary" onClick={stopMigration} disabled={!isRunning}>
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
          <Button variant="secondary" onClick={createRollbackPoint}>
            <Save className="w-4 h-4 mr-2" />
            Rollback Point
          </Button>
        </div>
      </div>

      {/* Execution Items Grid */}
      <div className="flex-1 overflow-auto">
        <VirtualizedDataGrid
          data={executionItems}
          columns={executionColumns}
          loading={isLoading}
        />
      </div>

      {/* Rollback Points Panel */}
      {rollbackPoints.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-semibold mb-2">Rollback Points</h4>
          <div className="flex gap-2 overflow-x-auto">
            {rollbackPoints.map(point => (
              <Button
                key={point.id}
                variant="outline"
                size="sm"
                onClick={() => executeRollback(point)}
              >
                {point.name} ({point.migratedItemsCount} items)
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Rollback Implementation
```typescript
// guiv2/src/main/services/rollbackService.ts
export interface RollbackPoint {
  id: string;
  name: string;
  createdAt: Date;
  description: string;
  isAutomatic: boolean;
  migratedItemsCount: number;
  canRollback: boolean;
  snapshotData?: any; // Store state snapshot
}

export class RollbackService {
  private rollbackPoints: RollbackPoint[] = [];

  async createRollbackPoint(description: string, migrationState: any): Promise<RollbackPoint> {
    const point: RollbackPoint = {
      id: uuidv4(),
      name: `Automatic - ${description}`,
      createdAt: new Date(),
      description,
      isAutomatic: true,
      migratedItemsCount: this.countMigratedItems(migrationState),
      canRollback: true,
      snapshotData: migrationState
    };

    this.rollbackPoints.push(point);
    await this.persistRollbackPoints();
    return point;
  }

  async executeRollback(point: RollbackPoint): Promise<void> {
    // Implement rollback logic
    // This would reverse migration operations using the snapshot data
    console.log(`Executing rollback to: ${point.name}`);

    // Reverse migration items
    // Restore original permissions, groups, etc.
    // This requires detailed implementation based on migration type
  }

  private countMigratedItems(state: any): number {
    // Count successfully migrated items from current state
    return state?.completedItems?.length || 0;
  }

  private async persistRollbackPoints(): Promise<void> {
    const filePath = path.join(app.getPath('userData'), 'rollback-points.json');
    await fs.promises.writeFile(filePath, JSON.stringify(this.rollbackPoints, null, 2));
  }
}
```

### 🏗️ PROJECT MANAGEMENT SYSTEM IMPLEMENTATION

**Current guiv2/ State**: Basic project configuration
**Required GUI/ Parity**: Complete project lifecycle with phases, tasks, Gantt charts, risk assessment

**Step 1: Enhanced Project Types**
```typescript
// guiv2/src/renderer/types/project.ts
export interface MigrationProject {
  id: string;
  name: string;
  description?: string;
  sourceProfile: string;
  targetProfile: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  phases: MigrationPhase[];
  risks: Risk[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MigrationPhase {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: PhaseStatus;
  tasks: MigrationProjectTask[];
  dependencies: string[]; // Phase IDs this depends on
  progress: number; // 0-100
}

export interface MigrationProjectTask {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dependencies: string[]; // Task IDs this depends on
  isCriticalPath: boolean;
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  riskLevel: RiskSeverity;
}

export enum ProjectStatus {
  Planning = 'planning',
  Active = 'active',
  OnHold = 'on_hold',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum RiskSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}
```

**Step 2: Project Service Implementation**
```typescript
// guiv2/src/main/services/projectService.ts
export class ProjectService {
  private readonly projectPath: string;

  constructor() {
    this.projectPath = path.join(app.getPath('userData'), 'projects');
    this.ensureProjectDirectory();
  }

  async createProject(projectData: Partial<MigrationProject>): Promise<MigrationProject> {
    const project: MigrationProject = {
      id: uuidv4(),
      name: projectData.name || 'New Migration Project',
      description: projectData.description,
      sourceProfile: projectData.sourceProfile || '',
      targetProfile: projectData.targetProfile || '',
      startDate: projectData.startDate || new Date(),
      endDate: projectData.endDate || addDays(new Date(), 90),
      status: ProjectStatus.Planning,
      phases: this.createDefaultPhases(),
      risks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveProject(project);
    return project;
  }

  async loadProject(projectId: string): Promise<MigrationProject | null> {
    try {
      const filePath = path.join(this.projectPath, `${projectId}.json`);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const project = JSON.parse(content);

      // Convert date strings back to Date objects
      return this.deserializeProject(project);
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }

  async updateProject(project: MigrationProject): Promise<void> {
    project.updatedAt = new Date();
    await this.saveProject(project);
  }

  async calculateOverallProgress(project: MigrationProject): Promise<number> {
    if (!project.phases || project.phases.length === 0) return 0;

    const totalTasks = project.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    if (totalTasks === 0) return 0;

    const completedTasks = project.phases.reduce((sum, phase) =>
      sum + phase.tasks.filter(task => task.status === TaskStatus.Completed).length, 0);

    return Math.round((completedTasks / totalTasks) * 100);
  }

  private createDefaultPhases(): MigrationPhase[] {
    const today = new Date();
    return [
      {
        id: uuidv4(),
        name: 'Discovery & Assessment',
        description: 'Initial discovery and environment assessment',
        startDate: today,
        endDate: addDays(today, 14),
        status: PhaseStatus.NotStarted,
        tasks: [],
        dependencies: [],
        progress: 0
      },
      {
        id: uuidv4(),
        name: 'Planning & Design',
        description: 'Migration planning and design',
        startDate: addDays(today, 15),
        endDate: addDays(today, 35),
        status: PhaseStatus.NotStarted,
        tasks: [],
        dependencies: [],
        progress: 0
      },
      {
        id: uuidv4(),
        name: 'Pilot Migration',
        description: 'Pilot migration testing',
        startDate: addDays(today, 36),
        endDate: addDays(today, 49),
        status: PhaseStatus.NotStarted,
        tasks: [],
        dependencies: [],
        progress: 0
      },
      {
        id: uuidv4(),
        name: 'Full Migration',
        description: 'Complete migration execution',
        startDate: addDays(today, 50),
        endDate: addDays(today, 70),
        status: PhaseStatus.NotStarted,
        tasks: [],
        dependencies: [],
        progress: 0
      },
      {
        id: uuidv4(),
        name: 'Validation & Go-Live',
        description: 'Final validation and go-live',
        startDate: addDays(today, 71),
        endDate: addDays(today, 84),
        status: PhaseStatus.NotStarted,
        tasks: [],
        dependencies: [],
        progress: 0
      }
    ];
  }

  private async saveProject(project: MigrationProject): Promise<void> {
    const filePath = path.join(this.projectPath, `${project.id}.json`);
    const serialized = this.serializeProject(project);
    await fs.promises.writeFile(filePath, JSON.stringify(serialized, null, 2));
  }

  private serializeProject(project: MigrationProject): any {
    return {
      ...project,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      phases: project.phases.map(phase => ({
        ...phase,
        startDate: phase.startDate.toISOString(),
        endDate: phase.endDate.toISOString(),
        tasks: phase.tasks.map(task => ({
          ...task,
          startDate: task.startDate.toISOString(),
          endDate: task.endDate.toISOString()
        }))
      }))
    };
  }

  private deserializeProject(data: any): MigrationProject {
    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      phases: data.phases.map((phase: any) => ({
        ...phase,
        startDate: new Date(phase.startDate),
        endDate: new Date(phase.endDate),
        tasks: phase.tasks.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate)
        }))
      }))
    };
  }

  private ensureProjectDirectory(): void {
    if (!fs.existsSync(this.projectPath)) {
      fs.mkdirSync(this.projectPath, { recursive: true });
    }
  }
}
```

**Step 3: Project Management Dashboard View**
```typescript
// guiv2/src/renderer/views/project/ProjectManagementDashboardView.tsx
export const ProjectManagementDashboardView: React.FC = () => {
  const { project, loading, updateProject, calculateProgress } = useProjectManagement();

  const overallProgress = useMemo(() => calculateProgress(project), [project, calculateProgress]);

  const tasksAtRisk = useMemo(() => {
    if (!project?.phases) return 0;
    return project.phases.reduce((count, phase) =>
      count + phase.tasks.filter(task =>
        task.status === TaskStatus.Blocked ||
        task.status === TaskStatus.AtRisk ||
        (task.endDate < new Date() && task.status !== TaskStatus.Completed)
      ).length, 0);
  }, [project]);

  const upcomingDeadlines = useMemo(() => {
    if (!project?.phases) return [];
    const allTasks = project.phases.flatMap(phase => phase.tasks);
    return allTasks
      .filter(task =>
        task.endDate <= addDays(new Date(), 7) &&
        task.status !== TaskStatus.Completed
      )
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
      .slice(0, 10);
  }, [project]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
          <p className="text-gray-600 mt-1">{project?.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{overallProgress}%</div>
          <div className="text-sm text-gray-600">Overall Progress</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tasks"
          value={project?.phases?.reduce((sum, phase) => sum + phase.tasks.length, 0) || 0}
          icon={<CheckSquare className="w-6 h-6" />}
        />
        <MetricCard
          title="Completed Tasks"
          value={project?.phases?.reduce((sum, phase) =>
            sum + phase.tasks.filter(task => task.status === TaskStatus.Completed).length, 0) || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Tasks at Risk"
          value={tasksAtRisk}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Days Remaining"
          value={project ? differenceInDays(project.endDate, new Date()) : 0}
          icon={<Calendar className="w-6 h-6" />}
        />
      </div>

      {/* Project Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
        <ProjectTimelineChart project={project} />
      </Card>

      {/* Phase Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Phase Progress</h3>
          <PhaseProgressChart phases={project?.phases || []} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
          <UpcomingDeadlinesList tasks={upcomingDeadlines} />
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
        <RiskMatrix risks={project?.risks || []} />
      </Card>
    </div>
  );
};
```

#### Gantt Chart Implementation
```typescript
// guiv2/src/renderer/components/charts/GanttChart.tsx
interface GanttChartProps {
  tasks: MigrationProjectTask[];
  phases: MigrationPhase[];
  onTaskUpdate: (taskId: string, updates: Partial<MigrationProjectTask>) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, phases, onTaskUpdate }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return tasks.map(task => {
      const phase = phases.find(p => p.id === task.phaseId);
      return {
        id: task.id,
        name: task.name,
        start: task.startDate,
        end: task.endDate,
        progress: task.progress,
        dependencies: task.dependencies,
        phase: phase?.name || 'Unknown',
        status: task.status,
        isCriticalPath: task.isCriticalPath
      };
    });
  }, [tasks, phases]);

  return (
    <div className="gantt-chart-container">
      <div className="gantt-header flex border-b">
        <div className="w-64 p-2 font-semibold">Task</div>
        <div className="flex-1 p-2 font-semibold">Timeline</div>
      </div>

      <div className="gantt-body max-h-96 overflow-y-auto">
        {chartData.map(task => (
          <GanttRow
            key={task.id}
            task={task}
            isSelected={selectedTask === task.id}
            onSelect={() => setSelectedTask(task.id)}
            onUpdate={(updates) => onTaskUpdate(task.id, updates)}
          />
        ))}
      </div>

      <GanttLegend />
    </div>
  );
};

// Individual Gantt row component
const GanttRow: React.FC<{
  task: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}> = ({ task, isSelected, onSelect, onUpdate }) => {
  return (
    <div
      className={`gantt-row flex border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={onSelect}
    >
      <div className="w-64 p-2 border-r">
        <div className="font-medium">{task.name}</div>
        <div className="text-sm text-gray-600">{task.phase}</div>
      </div>

      <div className="flex-1 relative p-2">
        <GanttBar
          task={task}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};
```

### 🔐 PROFILE MANAGEMENT ENHANCEMENT

**Current guiv2/ State**: Basic profile selection
**Required GUI/ Parity**: Dual profile management with app registration, connection testing

**Step 1: Enhanced Profile Store**
```typescript
// guiv2/src/renderer/store/useProfileStore.ts
interface ProfileState {
  sourceProfiles: CompanyProfile[];
  targetProfiles: TargetProfile[];
  selectedSourceProfile: CompanyProfile | null;
  selectedTargetProfile: TargetProfile | null;
  connectionStatuses: Record<string, ConnectionStatus>;
  isLoadingProfiles: boolean;

  // Actions
  loadSourceProfiles: () => Promise<void>;
  loadTargetProfiles: () => Promise<void>;
  setSelectedSourceProfile: (profile: CompanyProfile | null) => void;
  setSelectedTargetProfile: (profile: TargetProfile | null) => void;
  testSourceConnection: (profile: CompanyProfile) => Promise<ConnectionTestResult>;
  testTargetConnection: (profile: TargetProfile) => Promise<ConnectionTestResult>;
  createTargetProfile: (profile: Partial<TargetProfile>) => Promise<void>;
  runAppRegistration: (profile: CompanyProfile, isTarget: boolean) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  sourceProfiles: [],
  targetProfiles: [],
  selectedSourceProfile: null,
  selectedTargetProfile: null,
  connectionStatuses: {},
  isLoadingProfiles: false,

  loadSourceProfiles: async () => {
    set({ isLoadingProfiles: true });
    try {
      const profiles = await window.electronAPI.profiles.getSourceProfiles();
      set({ sourceProfiles: profiles });

      // Restore selected profile from persistent storage
      const savedId = await window.electronAPI.settings.get('selectedSourceProfileId');
      if (savedId) {
        const savedProfile = profiles.find(p => p.id === savedId);
        if (savedProfile) {
          set({ selectedSourceProfile: savedProfile });
        }
      }
    } finally {
      set({ isLoadingProfiles: false });
    }
  },

  loadTargetProfiles: async () => {
    const state = get();
    if (!state.selectedSourceProfile) return;

    try {
      const profiles = await window.electronAPI.profiles.getTargetProfiles(state.selectedSourceProfile.id);
      set({ targetProfiles: profiles });

      // Restore selected target profile
      const savedId = await window.electronAPI.settings.get('selectedTargetProfileId');
      if (savedId) {
        const savedProfile = profiles.find(p => p.id === savedId);
        if (savedProfile) {
          set({ selectedTargetProfile: savedProfile });
        }
      }
    } catch (error) {
      console.error('Failed to load target profiles:', error);
    }
  },

  setSelectedSourceProfile: async (profile) => {
    set({ selectedSourceProfile: profile });

    // Persist selection
    await window.electronAPI.settings.set('selectedSourceProfileId', profile?.id || null);

    // Refresh target profiles when source changes
    if (profile) {
      await get().loadTargetProfiles();
    } else {
      set({ targetProfiles: [], selectedTargetProfile: null });
    }
  },

  setSelectedTargetProfile: async (profile) => {
    set({ selectedTargetProfile: profile });

    // Persist selection
    await window.electronAPI.settings.set('selectedTargetProfileId', profile?.id || null);
  },

  testSourceConnection: async (profile) => {
    const testId = `source-${profile.id}`;
    set(state => ({
      connectionStatuses: { ...state.connectionStatuses, [testId]: ConnectionStatus.Testing }
    }));

    try {
      const result = await window.electronAPI.profiles.testSourceConnection(profile);

      set(state => ({
        connectionStatuses: { ...state.connectionStatuses, [testId]: result.success ? ConnectionStatus.Connected : ConnectionStatus.Failed }
      }));

      return result;
    } catch (error) {
      set(state => ({
        connectionStatuses: { ...state.connectionStatuses, [testId]: ConnectionStatus.Error }
      }));

      throw error;
    }
  },

  testTargetConnection: async (profile) => {
    const testId = `target-${profile.id}`;
    set(state => ({
      connectionStatuses: { ...state.connectionStatuses, [testId]: ConnectionStatus.Testing }
    }));

    try {
      const result = await window.electronAPI.profiles.testTargetConnection(profile);

      set(state => ({
        connectionStatuses: { ...state.connectionStatuses, [testId]: result.success ? ConnectionStatus.Connected : ConnectionStatus.Failed }
      }));

      return result;
    } catch (error) {
      set(state => ({
        connectionStatuses: { ...state.connectionStatuses, [testId]: ConnectionStatus.Error }
      }));

      throw error;
    }
  },

  createTargetProfile: async (profileData) => {
    const state = get();
    if (!state.selectedSourceProfile) {
      throw new Error('No source profile selected');
    }

    const newProfile: TargetProfile = {
      id: uuidv4(),
      name: profileData.name || 'New Target Profile',
      tenantId: profileData.tenantId || '',
      clientId: profileData.clientId || '',
      description: profileData.description || '',
      isActive: false,
      createdAt: new Date(),
      lastModified: new Date()
    };

    await window.electronAPI.profiles.createTargetProfile(state.selectedSourceProfile.id, newProfile);

    // Refresh target profiles
    await get().loadTargetProfiles();
  },

  runAppRegistration: async (profile, isTarget) => {
    try {
      await window.electronAPI.profiles.runAppRegistration({
        profileId: profile.id,
        isTarget,
        companyName: profile.companyName
      });

      // Show success message and refresh profiles
      await get().loadSourceProfiles();
      if (isTarget) {
        await get().loadTargetProfiles();
      }
    } catch (error) {
      console.error('App registration failed:', error);
      throw error;
    }
  }
}));
```

**Step 2: Enhanced Profile Selector Component**
```typescript
// guiv2/src/renderer/components/molecules/ProfileSelector.tsx
interface ProfileSelectorProps {
  className?: string;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ className }) => {
  const {
    sourceProfiles,
    targetProfiles,
    selectedSourceProfile,
    selectedTargetProfile,
    connectionStatuses,
    isLoadingProfiles,
    setSelectedSourceProfile,
    setSelectedTargetProfile,
    testSourceConnection,
    testTargetConnection,
    createTargetProfile,
    runAppRegistration
  } = useProfileStore();

  const [showCreateTargetDialog, setShowCreateTargetDialog] = useState(false);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Source Profile Section */}
      <div className="p-4 bg-white rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Source Company Profile</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profiles/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedSourceProfile && runAppRegistration(selectedSourceProfile, false)}
              disabled={!selectedSourceProfile}
            >
              <Shield className="w-4 h-4 mr-2" />
              App Reg
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Source Profile
            </label>
            <Select
              value={selectedSourceProfile?.id || ''}
              onValueChange={(value) => {
                const profile = sourceProfiles.find(p => p.id === value);
                setSelectedSourceProfile(profile || null);
              }}
              disabled={isLoadingProfiles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose source profile..." />
              </SelectTrigger>
              <SelectContent>
                {sourceProfiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSourceProfile && (
            <div className="grid grid-cols-2 gap-4">
              <ConnectionStatusCard
                title="Environment"
                status={connectionStatuses[`source-${selectedSourceProfile.id}`] || ConnectionStatus.Unknown}
                onTest={() => testSourceConnection(selectedSourceProfile)}
              />
              <ConnectionStatusCard
                title="Data Available"
                status={selectedSourceProfile.hasData ? ConnectionStatus.Connected : ConnectionStatus.NoData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Target Profile Section */}
      <div className="p-4 bg-white rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Target Company Profile</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateTargetDialog(true)}
              disabled={!selectedSourceProfile}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedTargetProfile && runAppRegistration(selectedTargetProfile, true)}
              disabled={!selectedTargetProfile}
            >
              <Shield className="w-4 h-4 mr-2" />
              App Reg
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Target Profile
            </label>
            <Select
              value={selectedTargetProfile?.id || ''}
              onValueChange={(value) => {
                const profile = targetProfiles.find(p => p.id === value);
                setSelectedTargetProfile(profile || null);
              }}
              disabled={!selectedSourceProfile || targetProfiles.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedSourceProfile ? "Choose target profile..." : "Select source profile first"} />
              </SelectTrigger>
              <SelectContent>
                {targetProfiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTargetProfile && (
            <div className="grid grid-cols-2 gap-4">
              <ConnectionStatusCard
                title="Environment"
                status={connectionStatuses[`target-${selectedTargetProfile.id}`] || ConnectionStatus.Unknown}
                onTest={() => testTargetConnection(selectedTargetProfile)}
              />
              <ConnectionStatusCard
                title="Credentials"
                status={selectedTargetProfile.hasValidCredentials ? ConnectionStatus.Connected : ConnectionStatus.NoCredentials}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Target Profile Dialog */}
      <CreateTargetProfileDialog
        open={showCreateTargetDialog}
        onClose={() => setShowCreateTargetDialog(false)}
        onCreate={createTargetProfile}
        sourceProfile={selectedSourceProfile}
      />
    </div>
  );
};
```

### 🎨 DISCOVERY MODULE ENHANCEMENT

**Current guiv2/ State**: Basic discovery hooks
**Required GUI/ Parity**: Summary statistics, detail views, export capabilities

**Step 1: Enhanced Discovery View Template**
```typescript
// guiv2/src/renderer/components/templates/DiscoveryViewTemplate.tsx
interface DiscoveryViewTemplateProps<T> {
  title: string;
  moduleInfo: ModuleInfo;
  data: T[];
  columns: ColumnDef<T>[];
  summaryStats?: DiscoverySummaryStats;
  onRefresh: () => Promise<void>;
  onExport: (format: 'csv' | 'json') => Promise<void>;
  onViewDetails: (item: T) => void;
  isLoading: boolean;
  error?: string;
}

export function DiscoveryViewTemplate<T extends DiscoveryItem>(props: DiscoveryViewTemplateProps<T>) {
  const {
    title,
    moduleInfo,
    data,
    columns,
    summaryStats,
    onRefresh,
    onExport,
    onViewDetails,
    isLoading,
    error
  } = props;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">{moduleInfo.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => onExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => onExport('json')}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {summaryStats && (
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Items"
              value={summaryStats.totalItems}
              icon={<Database className="w-5 h-5" />}
            />
            <StatsCard
              title="Unique Resources"
              value={summaryStats.uniqueResources}
              icon={<Layers className="w-5 h-5" />}
            />
            <StatsCard
              title="Last Discovery"
              value={summaryStats.lastDiscovery?.toLocaleString() || 'Never'}
              icon={<Clock className="w-5 h-5" />}
            />
            <StatsCard
              title="Data Sources"
              value={summaryStats.dataSources}
              icon={<Server className="w-5 h-5" />}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 border-b bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 overflow-hidden">
        <DataGrid
          data={data}
          columns={columns}
          loading={isLoading}
          onRowDoubleClick={onViewDetails}
          enableColumnResize
          enableSorting
          enableFiltering
          enablePagination
          pageSize={50}
        />
      </div>

      {/* Footer */}
      <div className="p-2 border-t text-center text-xs text-gray-500">
        {data.length} items loaded • {moduleInfo.displayName} Discovery Module
      </div>
    </div>
  );
}
```

**Step 2: Detail View Modal Implementation**
```typescript
// guiv2/src/renderer/components/organisms/DetailViewModal.tsx
interface DetailViewModalProps<T> {
  item: T | null;
  open: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
  onEdit?: (item: T, field: string, value: any) => void;
  readonly?: boolean;
}

interface DetailField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'json';
  readonly?: boolean;
  format?: (value: any) => string;
}

export function DetailViewModal<T extends Record<string, any>>({
  item,
  open,
  onClose,
  title,
  fields,
  onEdit,
  readonly = true
}: DetailViewModalProps<T>) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleEdit = (field: DetailField, value: any) => {
    if (readonly || !onEdit || !item) return;

    setEditingField(field.key);
    setEditValue(String(value));
  };

  const handleSave = () => {
    if (!editingField || !onEdit || !item) return;

    onEdit(item, editingField, editValue);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {fields.map(field => {
          const value = item?.[field.key];
          const isEditing = editingField === field.key;

          return (
            <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
              <label className="font-medium text-gray-700">
                {field.label}:
              </label>

              <div className="col-span-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    {field.type === 'boolean' ? (
                      <Switch
                        checked={editValue === 'true'}
                        onCheckedChange={(checked) => setEditValue(String(checked))}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type={field.type}
                      />
                    )}
                    <Button size="sm" onClick={handleSave}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`p-2 bg-gray-50 rounded ${!readonly && !field.readonly ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => handleEdit(field, value)}
                  >
                    {field.format ? field.format(value) :
                     field.type === 'json' ? JSON.stringify(value, null, 2) :
                     field.type === 'boolean' ? (value ? 'Yes' : 'No') :
                     String(value || 'N/A')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
```

### ⌨️ KEYBOARD SHORTCUTS & ADVANCED NAVIGATION

**Current guiv2/ State**: Basic keyboard shortcuts
**Required GUI/ Parity**: 50+ shortcuts with command palette

**Step 1: Comprehensive Keyboard Shortcuts System**
```typescript
// guiv2/src/renderer/hooks/useKeyboardShortcuts.ts
This analysis was completed on October 5, 2025, based on comprehensive code review of both /gui/ and /guiv2/ implementations.
---
### WPF Parity Implementation Backlog (generated 2025-10-15)

The legacy WPF surface still contains production-grade tooling that is not yet represented in /guiv2. Ship the feature groups below to close the gap. Each item lists the canonical WPF source, the guiv2 integration points, and concrete implementation steps.

#### Discovery & Infrastructure parity
- **Infrastructure drill-down (Azure/Network/Physical/File server)**  
  - Source: `GUI/ViewModels/AzureInfrastructureDiscoveryViewModel.cs:10`, `GUI/ViewModels/NetworkInfrastructureDiscoveryViewModel.cs:11`, `GUI/Services/CsvDataServiceNew.cs:381`, `GUI/Models/InfrastructureData.cs:9`.  
  - guiv2 targets: add IPC endpoints in `src/main/ipcHandlers.ts` and `src/main/services/logicEngineService.ts`, renderer views under `src/renderer/views/infrastructure`.  
  - Steps:  
    1. Extend `LogicEngineService` with typed selectors (`getInfrastructureSummary`, `getNetworkSegments`, `getPhysicalServers`, `getFileServers`) that hydrate from the existing maps populated in `loadDevicesStreamingAsync` and `loadSqlDatabasesStreamingAsync`.  
    2. Register IPC handlers (`ipcMain.handle('infrastructure:get-summary', ...)`) that pass the current profile from `useProfileStore`.  
    3. Replace the static `defaultDiscoveryModules` array in `useInfrastructureDiscoveryHubLogic.ts:54` with data retrieved from the module registry so tiles dynamically enable the new views.  
    4. Create hooks such as `useInfrastructureDetailLogic.ts` that call the IPC layer and wrap loading/error states. Example skeleton:
       ```ts
       export const useInfrastructureDetailLogic = (segment: string) => {
         const [state, setState] = useState<InfrastructureSummary | null>(null);
         const profile = useProfileStore.getState().activeProfile;
         useEffect(() => {
           if (!profile) return;
           window.electronAPI.infrastructure.getSummary({ profile, segment })
             .then(setState)
             .catch(err => setError(err.message));
         }, [profile, segment]);
         return state;
       };
       ```
    5. Build React surfaces (`AzureInfrastructureView.tsx`, `NetworkInfrastructureView.tsx`, `PhysicalServerDiscoveryView.tsx`, `FileServersView.tsx`) that mirror the tab/metric layout from the XAML layer (see `GUI/Views/AzureInfrastructureDiscoveryView.xaml`). Reuse the shared table components (`VirtualizedTable`, badges, sparklines`) for KPI rows defined in WPF.

- **Discovery launchpad parity**  
  - Source: `GUI/ViewModels/DiscoveryViewModel.cs:13` and `GUI/Services/ModuleRegistryService.cs:38`.  
  - guiv2 targets: `src/main/services/moduleRegistry.ts`, `src/renderer/views/discovery/InfrastructureDiscoveryHubView.tsx:45`, `src/renderer/store/useDiscoveryStore.ts:18`.  
  - Steps: surface all WPF module descriptors inside `config/module-registry.json`, then hydrate the hub view from IPC instead of `localStorage` (replace code around `localStorage.getItem('discoveryModulesStatus')` in the hook). Add support for category filters exposed in WPF (`identity`, `security`, `storage`) and wire the "Start discovery" buttons to `useDiscoveryStore.startDiscovery` with the correct PowerShell module names (pulled from `ModuleInfo.ModulePath` in the registry).

- **Asset detail inspector**  
  - Source: `GUI/ViewModels/AssetDetailViewModel.cs:15`, `GUI/Services/DataExportService.cs:24`.  
  - guiv2 targets: new IPC endpoint `logicEngine.getAssetDetail(deviceName)` plus renderer view `src/renderer/views/assets/AssetDetailView.tsx`.  
  - Steps:  
    1. Port the asset projection builder from `AssetDetailViewModel.LoadAssetDetailAsync` into a TypeScript method that composes the existing maps in `LogicEngineService` (`devicesByName`, `appsByDevice`, `aclByIdentitySid`).  
    2. Expose that projection through IPC and add an export handler that reuses `renderer/services/exportService.ts`.  
    3. Create `useAssetDetailLogic` hook that fetches the projection and groupings (users, apps, ACLs, GPOs, SQL DBs, risks) and memoizes tab payloads.  
    4. Implement tabbed UI with seven panes to match the WPF layout (Profile, Ownership, Applications, File Access, Policies, Databases, Risks). Include migration wave actions by dispatching to `useMigrationStore.addItemsToWave`.

#### Migration & project orchestration
- **Wave planner, Gantt, phase tracker, and VMMigration parity**  
  - Source: `GUI/ViewModels/MigrationPlanningViewModel.cs:18`, `GUI/ViewModels/GanttViewModel.cs:12`, `GUI/Views/WaveView.xaml`, `GUI/Views/VMMigrationView.xaml`.  
  - guiv2 targets: extend `src/main/services/projectService.ts`, `src/main/services/dashboardService.ts`, renderer views under `src/renderer/views/migration` and `src/renderer/views/project`.  
  - Steps:  
    1. Add persistent wave schema parity using the WPF `MigrationWave` model (`GUI/Models/MigrationModels.cs:21`) and map to the existing Zustand store (`useMigrationStore.ts:20`). Ensure ordering, priority, and dependency metadata are stored.  
    2. Implement `projectService.listGanttMilestones()` that emits the milestone structure captured in WPF (`ProjectPhase.Components.Tasks`). Feed this into new components `WaveTimeline` and `PhaseTrackerPanel`.  
    3. Transport virtualization tasks (Hyper-V, VMware) into dedicated views by adding PowerShell module bindings via IPC and reusing `useMigrationPlanningLogic`.  
    4. Wire pre/post migration validation flows by porting the command pipeline from `MigrationExecutionViewModel` to the existing `MigrationExecutionView.tsx`, enabling status transitions identical to the WPF `TabsService.OpenMigrationTabsAsync`.

- **Project management cockpit**  
  - Source: `GUI/ViewModels/ProjectManagementViewModel.cs:13`, `GUI/Models/ProjectManagementModels.cs:9`.  
  - guiv2 targets: create `src/renderer/views/project/ProjectManagementView.tsx` backed by a new `useProjectManagementLogic.ts` hook.  
  - Steps:  
    1. Extend `projectService.ts` with CRUD operations for phases, components, tasks, risks, and stakeholders mirroring the WPF models. Persist to `Project.json`.  
    2. Build a dedicated Zustand slice (`useProjectStore`) to manage the selected phase/component/task and expose computed stats (completed tasks, overdue tasks, high risks).  
    3. Implement UI regions: dashboard tiles, milestone timeline, expandable phase tree, risk matrix, and stakeholder roster. Reuse `DragDropContext` to support task reprioritization and emit events for `useNotificationStore`.  
    4. Hook export/report actions to `renderer/services/exportService.ts` to reproduce WPF save/export behavior.

- **What-If simulation & migration complexity**  
  - Source: `GUI/ViewModels/WhatIfSimulationViewModel.cs:15`, `GUI/Services/WhatIfSimulationService.cs:22`, `GUI/Services/LogicEngineService.cs:856`.  
  - guiv2 targets: add `logicEngine.runSimulation(parameters)` in the main process and build a renderer flow under `src/renderer/views/migration/WhatIfSimulationView.tsx`.  
  - Steps: port the scenario definitions (parameters, comparisons, risk outputs) and expose progress events via IPC streaming so the React view can show progress, status, and result tabs. Persist saved simulations in `config/simulations.json` with the same schema as the WPF service.

#### Data management & UX tooling
- **Advanced filter & bulk edit**  
  - Source: `GUI/ViewModels/AdvancedFilterViewModel.cs:15`, `GUI/ViewModels/BulkEditViewModel.cs:12`, `GUI/Services/IAdvancedFilterService.cs:9`.  
  - guiv2 targets: renderer view `src/renderer/views/advanced/AdvancedFilterView.tsx`, leverage `renderer/services/filteringService.ts` and `renderer/services/importService.ts`.  
  - Steps:  
    1. Build a reusable `AdvancedFilterPanel` component that mirrors rule groups, presets, and quick filters described in the WPF view model. Persist filters via `FilteringService.savePreset`.  
    2. Integrate bulk edit operations by sending selected entity IDs and edit payloads through `window.electronAPI.bulkEdit` (implement module execution using the existing PowerShell service).  
    3. Provide context menu entry points in entity tables (Users, Groups, Assets) to launch the filter/bulk-edit dialogs exactly as `MainViewModel.OpenAdvancedFilterCommand` does.

- **Virtualization, shimmer loading, keyboard shortcuts, command palette**  
  - Source: `GUI/Controls/VirtualizedListView.xaml`, `GUI/ViewModels/ShimmerLoadingViewModel.cs:9`, `GUI/ViewModels/KeyboardShortcutsViewModel.cs:11`, `GUI/ViewModels/CommandPaletteViewModel.cs:19`.  
  - guiv2 targets: wrap existing table components with `react-window`, surface shimmer placeholders in shared `LoadingSkeleton` components, expose keyboard shortcut inventory via `renderer/services/keyboardShortcutService.ts`, and connect `commandPaletteService.ts` to a UI overlay triggered by `Ctrl+P`.  
  - Steps:  
    1. Replace manual pagination in heavy tables with windowed rendering (for example integrate `VariableSizeList` in `components/organisms/DataGrid`).  
    2. Publish the shortcut list through a new route `/advanced/keyboard-shortcuts` replicating WPF�s reference sheet.  
    3. Ensure palette actions proxy to `useTabStore.openTab` so behavior matches `TabsService.OpenTabAsync`.

- **Notes tagging & notification templates**  
  - Source: `GUI/ViewModels/NotesTaggingViewModel.cs:13`, `GUI/ViewModels/NotificationTemplateEditorViewModel.cs:12`.  
  - guiv2 targets: new stores `useNotesStore`, `useNotificationTemplateStore`, renderer views under `src/renderer/views/advanced`.  
  - Steps: persist tag metadata in profile-scoped JSON (`Notes.json`, `NotificationTemplates.json`), expose CRUD IPC handlers, and build editors using existing form atoms. Ensure exports rely on `exportService` to maintain parity with WPF `DataExportService`.

#### Analytics, reporting & audit
- **Analytics dashboard & management hubs**  
  - Source: `GUI/ViewModels/AnalyticsViewModel.cs:10`, `GUI/ViewModels/ManagementHubViewModel.cs:14`, `GUI/ViewModels/ManagementDashboardViewModel.cs:11`.  
  - guiv2 targets: extend `useDashboardLogic.ts:53` to call new IPC endpoints (`dashboard.getAnalyticsSummary`, `dashboard.getManagementKPIs`) backed by `DashboardService`.  
  - Steps: add aggregation helpers in `DashboardService` that reuse logic engine counts (`getUserCount`, `getApplicationCount`) and emit the same KPI structure used in WPF. Update `OverviewView.tsx` and add dedicated views under `src/renderer/views/overview` to show persona cards, quick actions, and heat maps.

- **Report builder & templates**  
  - Source: `GUI/ViewModels/ReportBuilderViewModel.cs:18`, `GUI/Models/ReportModels.cs:9`.  
  - guiv2 targets: finish `ReportTemplatesView.tsx`, create `ReportBuilderView.tsx`, and use `renderer/services/exportService.ts` plus a new `renderer/services/reportBuilderService.ts`.  
  - Steps:  
    1. Port the report definition schema (data sources, columns, filters, groupings, sorting, execution history).  
    2. Implement main-process orchestration (`reportingService.generateReport(profile, definition)`) that batches logic-engine queries and streams progress via IPC.  
    3. Support template import/export (JSON) and quick execution to CSV/Excel/PDF to match `DataExportService.ExecuteExportAsync`.

- **Snapshot comparison & audit logging**  
  - Source: `GUI/ViewModels/SnapshotComparisonViewModel.cs:12`, `GUI/ViewModels/LogsAuditViewModel.cs:11`.  
  - guiv2 targets: create IPC endpoints to load profile snapshots (`Snapshots/*.json`) and audit logs (`Logs/gui-clicks.log`), store them in `renderer/store/useAuditStore.ts`, and build views under `src/renderer/views/reports`. Provide diff visualization using `Diff2Html` or existing diff components.

#### Security & compliance modules
- **Security posture / policy / group detail parity**  
  - Source: `GUI/ViewModels/SecurityViewModel.cs:12`, `GUI/ViewModels/SecurityPolicyViewModel.cs:14`, `GUI/ViewModels/SecurityGroupDetailViewModel.cs:16`, `GUI/ViewModels/SecurityGroupsViewModel.cs:17`.  
  - guiv2 targets: expand security views to include the missing policy detail blades, reuse (or create) `renderer/services/securityDashboardService.ts`, and provide drill-down routes `/security/policies/:id`, `/security/groups/:sid`.  
  - Steps:  
    1. Surface policy metadata by porting the CSV loader logic (`CsvDataServiceNew.LoadGroupPoliciesAsync`) into the TypeScript `csvDataService`.  
    2. Expose a `security.getGroupDetail` IPC endpoint to return membership, effective permissions, and risk flags so the detail pane matches WPF.  
    3. Add bulk actions (enable MFA, remediate risky policies) that map to PowerShell modules via `PowerShellExecutionService`.

- **Compliance/audit views** (Audit, Environment Risk Assessment, Risk Analysis)  
  - Source: `GUI/ViewModels/AuditViewModel.cs:12`, `GUI/ViewModels/EnvironmentRiskAssessmentViewModel.cs:13`, `GUI/ViewModels/RiskAnalysisViewModel.cs:15`.  
  - guiv2 targets: create views under `src/renderer/views/compliance` and `src/renderer/views/security`, using data from `logicEngineService.getRiskDashboard()` and the audit log pipeline.  
  - Steps: implement scoring logic in TypeScript mirroring the WPF calculation (see risk aggregation in `LogicEngineService` around line 3000) and render risk matrices plus recommended controls.

#### Automation & scheduling
- **Script editor & library**  
  - Source: `GUI/ViewModels/ScriptEditorViewModel.cs:18`, `GUI/Services/ScriptEditorService.cs:24`.  
  - guiv2 targets: enrich `ScriptLibraryView.tsx` and create `ScriptEditorView.tsx` with Monaco integration.  
  - Steps:  
    1. Store scripts in `config/scripts/*.ps1` with metadata (tags, description, run history).  
    2. Use the existing main-process `PowerShellExecutionService` for execution, wiring streaming output to an append-only console component.  
    3. Provide formatting, validation, and template loaders matching the WPF behaviors (format via `pwsh -Command Invoke-Formatter` or integrate `PSScriptAnalyzer`).

- **Task scheduler & notifications**  
  - Source: `GUI/ViewModels/TaskSchedulerViewModel.cs:12`, `GUI/Services/TaskSchedulerService.cs:18`, `GUI/ViewModels/NotificationTemplateEditorViewModel.cs:12`.  
  - guiv2 targets: add background scheduling in the main process using `node-cron`, store schedules per profile, and expose UI in `src/renderer/views/advanced/TaskSchedulerView.tsx`. Trigger notifications via `notificationService.ts`, mirroring WPF template merge fields such as `{{UserName}}` and `{{WaveName}}`.

Ship these workstreams sequentially; each unlocks parity for the named WPF modules. Keep IPC contracts narrow, reuse the existing `logicEngine` caches, and validate with CSV fixture data under `C:\discoverydata\ljpops`. Update Jest/Playwright suites alongside new views to preserve regression coverage in /guiv2.


Column Visibility Management - Dynamic column showing/hiding
Advanced Search Dialog - Multi-field query builder
Export Format Selection - CSV/Excel/JSON/PDF chooser
Theme Selection Dialog - Theme preview and selection
PowerShell Window - Dedicated PowerShell console
Password Policy Management - Security policy configuration
Password Generator - Secure password creation tool
Breadcrumb Navigation - Application location trail
System Tray Integration - Minimize to tray functionality
Dependency Graph Visualization - System relationship mapping
Each includes complete TypeScript implementation details for immediate development.
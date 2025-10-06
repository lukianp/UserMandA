# Dashboard Enhancement Implementation Handoff
## Detailed Implementation Guide for gui-module-executor

**Handoff From:** gui-module-architect
**Handoff To:** gui-module-executor
**Priority:** HIGH - TASK 1 from CLAUDE.md
**Estimated Effort:** 2-3 weeks

---

## Executive Summary

The Dashboard Enhancement feature requires replacing the current mock data implementation in `OverviewView.tsx` with real Logic Engine integration. This document provides step-by-step implementation guidance with all architectural decisions already made.

**Current State:**
- Mock data displayed in OverviewView
- No project timeline functionality
- Static statistics without real data
- No system health monitoring

**Target State:**
- Real-time data from Logic Engine
- Project timeline with cutover countdown
- Clickable navigation cards
- System health monitoring
- 30-second auto-refresh

---

## Implementation Checklist

### Phase 1: Type Definitions & Infrastructure (Day 1-2)

#### Step 1.1: Create Type Definition Files

**File:** `guiv2/src/renderer/types/dashboard.ts`
```typescript
// Copy the complete type definitions from Architecture Document Section 2.1
// Includes: DashboardStats, ProjectTimeline, SystemHealth, ActivityItem, etc.
```

**File:** `guiv2/src/renderer/types/project.ts`
```typescript
// Copy the complete type definitions from Architecture Document Section 2.2
// Includes: ProjectConfig, ProfileConfig, WaveConfig, etc.
```

**Validation:**
```bash
cd guiv2
npx tsc --noEmit
# Should have zero errors for these new files
```

#### Step 1.2: Create Project Service

**File:** `guiv2/src/main/services/projectService.ts`
```typescript
// Implementation provided in Architecture Document Section 6.2
// Key methods:
// - loadProjectConfig(profileName)
// - saveProjectConfig(profileName, config)
// - createDefaultProject(profileName)
```

**Testing:**
```typescript
// Quick test in main process
const service = new ProjectService();
const config = await service.loadProjectConfig('ljpops');
console.log(config); // Should return default or existing config
```

#### Step 1.3: Create Dashboard Service

**File:** `guiv2/src/main/services/dashboardService.ts`
```typescript
// Implementation provided in Architecture Document Section 6.1
// Key methods:
// - getStats(profileName)
// - getProjectTimeline(profileName)
// - getSystemHealth()
// - getRecentActivity(profileName, limit)
```

---

### Phase 2: Logic Engine Extensions (Day 3)

#### Step 2.1: Extend Logic Engine Service

**File:** `guiv2/src/main/services/logicEngineService.ts`

Add these methods to the existing class:
```typescript
// Add methods from Architecture Document Section 7.1
getUserCount(): number { return this.usersBySid.size; }
getGroupCount(): number { return this.groupsBySid.size; }
getDeviceCount(): number { return this.devicesByName.size; }
// ... (all other counting methods)
```

**Validation:**
```typescript
// Test in console
const logic = LogicEngineService.getInstance();
await logic.loadAllAsync('ljpops');
console.log(logic.getUserCount()); // Should return actual count
```

---

### Phase 3: IPC Communication Layer (Day 4)

#### Step 3.1: Register IPC Handlers

**File:** `guiv2/src/main/ipcHandlers.ts`

Add to `initializeServices()`:
```typescript
// Initialize new services
projectService = new ProjectService();
dashboardService = new DashboardService(logicEngineService, projectService);
```

Add new handler registration:
```typescript
// Add the complete handler registration from Section 5.1
ipcMain.handle('dashboard:getStats', async (_, profileName: string) => {
  // Implementation from architecture document
});
// ... all other handlers
```

#### Step 3.2: Update Preload Bridge

**File:** `guiv2/src/preload.ts`

Add to the `electronAPI` object:
```typescript
dashboard: {
  getStats: (profileName: string) =>
    ipcRenderer.invoke('dashboard:getStats', profileName),
  // ... all other dashboard methods from Section 5.2
}
```

#### Step 3.3: Update TypeScript Definitions

**File:** `guiv2/src/renderer/types/electron.d.ts`

Add dashboard API types:
```typescript
dashboard: {
  getStats: (profileName: string) => Promise<APIResponse<DashboardStats>>;
  getProjectTimeline: (profileName: string) => Promise<APIResponse<ProjectTimeline>>;
  getSystemHealth: () => Promise<APIResponse<SystemHealth>>;
  getRecentActivity: (profileName: string, limit?: number) => Promise<APIResponse<ActivityItem[]>>;
  acknowledgeAlert: (alertId: string) => Promise<APIResponse<void>>;
}
```

---

### Phase 4: Hook Implementation (Day 5)

#### Step 4.1: Create Dashboard Logic Hook

**File:** `guiv2/src/renderer/hooks/useDashboardLogic.ts`
```typescript
// Complete implementation from Architecture Document Section 3.1
// This is the core hook that manages all dashboard state
```

**Key Features to Implement:**
1. State management for all dashboard data
2. Auto-refresh mechanism (30 seconds)
3. Error handling with retry logic
4. Rate limiting for manual refresh
5. Loading states

**Testing Hook:**
```typescript
// Create test component
const TestDashboard = () => {
  const { stats, isLoading, error } = useDashboardLogic();
  return <pre>{JSON.stringify({ stats, isLoading, error }, null, 2)}</pre>;
};
```

---

### Phase 5: Component Development (Day 6-8)

#### Step 5.1: Create Sub-Components

**File:** `guiv2/src/renderer/components/molecules/ProjectTimelineCard.tsx`
```typescript
import React from 'react';
import { ProjectTimeline } from '../../types/dashboard';
import { Card } from '../atoms/Card';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface ProjectTimelineCardProps {
  timeline: ProjectTimeline;
}

export const ProjectTimelineCard: React.FC<ProjectTimelineCardProps> = ({ timeline }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{timeline.projectName}</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {timeline.currentPhase}
        </span>
      </div>

      <div className="space-y-4">
        {/* Countdown Timers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">Cutover In</span>
            </div>
            <div className="text-2xl font-bold">
              {timeline.daysToCutover} days
            </div>
          </div>

          <div>
            <div className="flex items-center text-gray-600 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">Next Wave</span>
            </div>
            <div className="text-2xl font-bold">
              {timeline.daysToNextWave} days
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{timeline.overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${timeline.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Wave Status */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Waves Completed</span>
            <span className="font-semibold">
              {timeline.completedWaves} / {timeline.totalWaves}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

**File:** `guiv2/src/renderer/components/molecules/StatisticsCard.tsx`
```typescript
import React from 'react';
import { Card } from '../atoms/Card';
import * as Icons from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: number;
  discoveredCount?: number;
  migratedCount?: number;
  icon: keyof typeof Icons;
  trend?: number;
  onClick?: () => void;
  isClickable?: boolean;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  discoveredCount = 0,
  migratedCount = 0,
  icon,
  trend = 0,
  onClick,
  isClickable = false
}) => {
  const Icon = Icons[icon] as React.FC<any>;

  return (
    <Card
      className={`p-6 ${isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>

          {/* Sub-metrics */}
          <div className="mt-3 space-y-1">
            {discoveredCount > 0 && (
              <div className="text-xs text-gray-500">
                Discovered: {discoveredCount.toLocaleString()}
              </div>
            )}
            {migratedCount > 0 && (
              <div className="text-xs text-gray-500">
                Migrated: {migratedCount.toLocaleString()}
              </div>
            )}
          </div>

          {/* Trend */}
          {trend !== 0 && (
            <div className={`mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="text-gray-400">
          <Icon size={32} />
        </div>
      </div>
    </Card>
  );
};
```

**Similar implementations needed for:**
- `SystemHealthPanel.tsx`
- `RecentActivityFeed.tsx`
- `QuickActionsPanel.tsx`

#### Step 5.2: Update OverviewView

**File:** `guiv2/src/renderer/views/overview/OverviewView.tsx`

Replace entire file with implementation from Architecture Document Section 4.2.

**Key changes:**
1. Import `useDashboardLogic` hook
2. Replace mock data with hook data
3. Add loading and error states
4. Implement refresh functionality
5. Add navigation handlers

---

### Phase 6: Testing & Validation (Day 9-10)

#### Step 6.1: Unit Tests

**File:** `guiv2/src/renderer/hooks/__tests__/useDashboardLogic.test.ts`
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardLogic } from '../useDashboardLogic';

describe('useDashboardLogic', () => {
  it('should load dashboard data on mount', async () => {
    const { result } = renderHook(() => useDashboardLogic());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.stats).toBeDefined();
    });
  });

  it('should handle refresh with rate limiting', async () => {
    const { result } = renderHook(() => useDashboardLogic());

    // First refresh should work
    await result.current.refresh();

    // Immediate second refresh should be rate limited
    await result.current.refresh();
    // Check for notification about rate limiting
  });
});
```

#### Step 6.2: Integration Testing

**Manual Test Checklist:**
1. [ ] Dashboard loads with real data from Logic Engine
2. [ ] Project timeline shows correct countdown
3. [ ] Clicking on stat cards navigates to correct views
4. [ ] Auto-refresh updates data every 30 seconds
5. [ ] Manual refresh works with rate limiting
6. [ ] Error states display when services fail
7. [ ] System health indicators are accurate
8. [ ] Recent activity shows actual log entries

#### Step 6.3: Performance Validation

```typescript
// Check bundle size impact
npm run analyze

// Profile render performance
// Use React DevTools Profiler
// Target: < 100ms for dashboard render

// Memory usage monitoring
// Check for memory leaks with auto-refresh
// Target: < 50MB increase over session
```

---

## Common Issues & Solutions

### Issue 1: Logic Engine Not Returning Data
**Symptom:** Stats show as 0 despite data existing
**Solution:** Ensure Logic Engine is loading data for correct profile:
```typescript
// In dashboardService.ts
await this.logicEngine.loadAllAsync(profileName); // Must be called before getting counts
```

### Issue 2: Project.json Not Found
**Symptom:** Default project always created
**Solution:** Verify path is correct:
```typescript
// Check actual path
const projectPath = path.join('C:', 'discoverydata', profileName, 'Project.json');
console.log('Looking for project at:', projectPath);
```

### Issue 3: IPC Handler Not Found
**Symptom:** "No handler registered for 'dashboard:getStats'"
**Solution:** Ensure handlers are registered in `ipcHandlers.ts`:
```typescript
// Must call registerDashboardHandlers() in registerIpcHandlers()
```

### Issue 4: TypeScript Errors
**Symptom:** Type errors in components
**Solution:** Ensure all imports are correct:
```typescript
import type { DashboardStats } from '../../types/dashboard';
// Note the 'type' keyword for type-only imports
```

---

## Validation Criteria

### Functional Requirements
- [ ] All mock data replaced with real data
- [ ] Project timeline functional with accurate calculations
- [ ] Navigation from cards works correctly
- [ ] Auto-refresh updates data every 30 seconds
- [ ] System health monitoring operational

### Technical Requirements
- [ ] Zero TypeScript compilation errors
- [ ] All tests passing
- [ ] Performance targets met (< 2s load, < 1s refresh)
- [ ] Error handling implemented with fallbacks
- [ ] Logging added for debugging

### Code Quality
- [ ] Follows established patterns from completed views
- [ ] Proper separation of concerns (hooks, services, components)
- [ ] Comments added for complex logic
- [ ] No console.log statements in production code

---

## Deployment Notes

1. **Feature Flag (Optional):**
```typescript
// In OverviewView.tsx
const useNewDashboard = appConfig.features?.newDashboard ?? true;

if (!useNewDashboard) {
  return <OldOverviewView />; // Keep old implementation as fallback
}
```

2. **Migration of Existing Data:**
- Existing profiles may not have Project.json
- ProjectService creates default automatically
- No data migration required

3. **Performance Monitoring:**
```typescript
// Add performance marks
performance.mark('dashboard-load-start');
// ... loading logic
performance.mark('dashboard-load-end');
performance.measure('dashboard-load', 'dashboard-load-start', 'dashboard-load-end');
```

---

## Support & Escalation

**Architecture Questions:** Refer to `Dashboard_Enhancement_Architecture.md`
**Implementation Issues:** Check Common Issues section first
**Performance Problems:** Profile with React DevTools first
**Data Issues:** Verify Logic Engine data loading

---

## Sign-off

This handoff document provides complete implementation guidance for the Dashboard Enhancement feature. The architecture is fully designed, patterns are established, and all technical decisions have been made. Implementation should proceed sequentially through the phases.

**Ready for Implementation:** ✅

**Next Agent Action:** Begin with Phase 1, Step 1.1 - Create type definition files
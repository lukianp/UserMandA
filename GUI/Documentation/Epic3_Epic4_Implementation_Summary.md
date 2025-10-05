# Epic 3 & Epic 4 Implementation Summary

**Date:** October 5, 2025
**Status:** Architecture Complete - Ready for Implementation
**Next Agent:** gui-module-executor

---

## What Was Delivered

I have created a **comprehensive 1,500+ line architecture document** that provides complete specifications for Epic 3 (Discovery Module Execution) and Epic 4 (Logic Engine Service).

**Document Location:** `D:\Scripts\UserMandA\GUI\Documentation\Epic3_Epic4_Architecture.md`

---

## Architecture Highlights

### Epic 3: Discovery Module Execution

**What It Does:** Enables real-time PowerShell discovery module execution from the GUI with streaming logs, progress tracking, and cancellation support.

**Key Components:**
1. **Custom Hook:** `useDiscoveryExecutionLogic.ts` - Manages execution state, IPC events, progress tracking
2. **IPC Handlers:** `discovery:execute`, `discovery:cancel`, `discovery:get-modules` - Main process orchestration
3. **UI Components:**
   - `DiscoveryLogViewer.tsx` - Real-time log streaming with 6 PowerShell stream types
   - `DiscoveryProgressBar.tsx` - Progress visualization with ETA calculation
4. **Integration:** Leverages existing `PowerShellExecutionService` (already implemented)

**Technical Approach:**
- EventEmitter pattern for streaming output
- Progress parsing from PowerShell `Write-Verbose` output
- Cancellation via `SIGTERM` to child process
- Auto-scroll log viewer with filtering by log level

### Epic 4: Logic Engine Service

**What It Does:** Core data correlation engine that loads CSV data, applies inference rules, performs fuzzy matching, and builds rich projections for detail views.

**Key Components:**
1. **Core Service:** `logicEngineService.ts` - Main orchestration with 30+ data indices
2. **CSV Loaders:** 9 streaming loaders for memory-efficient parsing
3. **Inference Rules:** 9 correlation algorithms (ACL→Group→User, Primary Device, GPO, etc.)
4. **Fuzzy Matching:** Levenshtein distance algorithm for identity/app resolution
5. **Projection Builders:** `buildUserDetailProjection`, `buildComputerDetailProjection`, `buildGroupDetailProjection`
6. **Caching:** Two-tier cache (hot + LRU) with 15-minute TTL

**Data Structures:**
- 30+ in-memory Map indices for O(1) lookups
- Graph structures for advanced relationship traversal
- Reverse indices for bidirectional queries

**Performance Targets:**
- CSV Load: < 5 seconds for 10,000 users
- Inference Processing: < 2 seconds for full ruleset
- Projection (cached): < 100ms
- Projection (uncached): < 500ms
- Memory: < 500MB for 10,000 users

---

## Critical Implementation Patterns

### Pattern 1: CSV Loading with Header Variation Handling

```typescript
// Handle inconsistent CSV headers (case-insensitive)
private parseUserFromCsv(row: Record<string, string>): UserDto | null {
  const getSafe = (key: string): string | undefined => {
    const keys = Object.keys(row);
    const match = keys.find(k => k.toLowerCase() === key.toLowerCase());
    return match ? row[match] : undefined;
  };

  const sid = getSafe('sid') || getSafe('objectsid');
  const sam = getSafe('sam') || getSafe('samaccountname');
  // ... handle all variations
}
```

### Pattern 2: Streaming CSV Parser (Memory-Efficient)

```typescript
// Use Node.js streams for large CSVs
private async loadUsersStreamingAsync(profilePath: string): Promise<void> {
  const parser = createReadStream(filePath).pipe(csvParser());

  for await (const row of parser) {
    const user = this.parseUserFromCsv(row);
    if (user) {
      this.usersBySid.set(user.sid, user);
    }
  }
}
```

### Pattern 3: ACL→Group→User Inference

```typescript
// Propagate permissions from groups to members
private applyAclGroupUserInference(): void {
  for (const [identitySid, entries] of this.aclByIdentitySid.entries()) {
    if (this.groupsBySid.has(identitySid)) {
      const members = this.membersByGroupSid.get(identitySid) || [];

      for (const memberSid of members) {
        for (const entry of entries) {
          this.aclByIdentitySid.get(memberSid)?.push({
            ...entry,
            inheritedFrom: identitySid,
          });
        }
      }
    }
  }
}
```

### Pattern 4: Levenshtein Fuzzy Matching

```typescript
// Calculate string similarity (0.0 to 1.0)
private calculateLevenshteinSimilarity(s1: string, s2: string): number {
  // DP matrix approach
  const matrix: number[][] = /* ... */;

  // Initialize and fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i-1].toLowerCase() === s2[j-1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,        // deletion
        matrix[i][j-1] + 1,        // insertion
        matrix[i-1][j-1] + cost    // substitution
      );
    }
  }

  return 1.0 - (matrix[len1][len2] / Math.max(len1, len2));
}
```

### Pattern 5: Two-Tier Caching

```typescript
// Hot cache (15-min TTL) + LRU cache (1-hour TTL)
buildUserDetailProjection(sidOrUpn: string): UserDetailProjection | null {
  // Check hot cache first
  const cached = this.hotCache.get(`user-detail:${sidOrUpn}`);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data;
  }

  // Build projection (expensive)
  const projection = /* ... correlate all data ... */;

  // Cache it
  this.hotCache.set(cacheKey, { data: projection, timestamp: new Date() });

  return projection;
}
```

---

## Implementation Roadmap (52-64 hours total)

### Phase 1: Epic 3 - Discovery Execution (12-16 hours)

**Week 1:**
1. IPC Handlers (3 hours)
2. Custom Hook (4 hours)
3. UI Components (5 hours)
4. Integration & Testing (4 hours)

**Deliverable:** Real-time discovery execution with streaming logs in all 25 discovery views

### Phase 2: Epic 4 - Logic Engine Core (28-36 hours)

**Week 2:**
5. Service Skeleton (4 hours)
6. CSV Loading Methods (8 hours)
7. Index Building (4 hours)

**Week 3:**
8. Inference Rules (8 hours)
9. Fuzzy Matching (4 hours)
10. Projection Builders (6 hours)
11. Caching & Performance (4 hours)

**Deliverable:** Full LogicEngine with all correlation capabilities

### Phase 3: Integration & Testing (8-12 hours)

**Week 4:**
12. IPC Integration (3 hours)
13. View Layer Integration (5 hours)
14. Comprehensive Testing (4 hours)

**Deliverable:** Detail views using LogicEngine projections

### Phase 4: Documentation & Handoff (4 hours)

15. Final Documentation (4 hours)

**Deliverable:** Complete system ready for production

---

## Testing Requirements

### Unit Tests (> 80% coverage required)

**Epic 3:**
- [ ] PowerShell execution with streaming
- [ ] Cancellation mechanism
- [ ] Progress parsing from verbose output
- [ ] Log filtering and auto-scroll

**Epic 4:**
- [ ] CSV loading with header variations
- [ ] Each inference rule independently
- [ ] Fuzzy matching accuracy (> 90% on test dataset)
- [ ] Projection completeness
- [ ] Cache hit/miss behavior

### Performance Tests

- [ ] Load 10,000 users in < 5 seconds
- [ ] Inference processing < 2 seconds
- [ ] Projection (cached) < 100ms
- [ ] Projection (uncached) < 500ms
- [ ] Memory usage < 500MB for 10,000 users

### Integration Tests

- [ ] Discovery execution → CSV files → LogicEngine load
- [ ] IPC communication end-to-end
- [ ] Detail view data flow

### E2E Tests

- [ ] DomainDiscoveryView full workflow
- [ ] UserDetailView with LogicEngine projections
- [ ] ComputerDetailView correlation
- [ ] GroupDetailView member correlation

---

## Reference Code Locations

### Existing Code to Study

1. **PowerShell Service:** `D:\Scripts\UserMandA\guiv2\src\main\services\powerShellService.ts`
   - Already implements session pooling, streaming, cancellation
   - You only need to integrate it, not rebuild it

2. **C# LogicEngine:** `D:\Scripts\UserMandA\GUI\Services\LogicEngineService.cs`
   - 59,000+ lines of reference implementation
   - Contains all inference rules and fuzzy matching algorithms
   - Port these patterns to TypeScript

3. **Discovery View Hook Pattern:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useDomainDiscoveryLogic.ts`
   - Follow this pattern for `useDiscoveryExecutionLogic.ts`
   - Shows form validation and state management

4. **Existing Discovery Views:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery/*.tsx`
   - 25 views that need integration with new execution hook
   - All follow same pattern

### Where to Create New Files

**Epic 3:**
- `guiv2/src/renderer/hooks/useDiscoveryExecutionLogic.ts`
- `guiv2/src/renderer/components/organisms/DiscoveryLogViewer.tsx`
- `guiv2/src/renderer/components/molecules/DiscoveryProgressBar.tsx`
- `guiv2/src/main/ipcHandlers.ts` (expand existing)

**Epic 4:**
- `guiv2/src/main/services/logicEngineService.ts`
- `guiv2/src/main/services/projectionCache.ts`
- `guiv2/src/renderer/hooks/useUserDetailLogic.ts`
- `guiv2/src/renderer/hooks/useComputerDetailLogic.ts`
- `guiv2/src/renderer/hooks/useGroupDetailLogic.ts`
- `guiv2/src/types/projections.ts` (TypeScript types)

---

## Critical Success Factors

### 1. CSV Header Variation Handling

Real discovery CSVs have inconsistent headers. Your parsers MUST handle:
- Case insensitivity: "SID" vs "sid" vs "objectsid"
- Alternate names: "Sam" vs "SamAccountName" vs "samaccountname"
- Missing columns: Use defaults or skip gracefully

**Test with real data from:** `C:\discoverydata\ljpops\Raw\`

### 2. Performance Validation

The LogicEngine must meet performance targets:
- 10,000 users in < 5 seconds
- < 500MB memory usage
- < 100ms cached projection retrieval

**Test with large dataset from:** `C:\discoverydata\{profile}\Raw\`

### 3. Inference Rule Correctness

All 9 inference rules must produce identical results to the C# implementation.

**Validation approach:**
1. Run C# LogicEngine on test dataset
2. Export correlation results to JSON
3. Run TypeScript LogicEngine on same dataset
4. Compare outputs programmatically
5. Assert 100% match for core entities (users, groups, devices)

### 4. Fuzzy Matching Accuracy

Levenshtein threshold (0.75) must achieve > 90% precision on test dataset.

**Test cases:**
- "Microsoft Office" → "Microsoft Office 2021" (should match)
- "Chrome" → "Google Chrome" (should match)
- "Firefox" → "Microsoft Edge" (should NOT match)

### 5. Memory Management

Monitor memory usage continuously. If heap exceeds 500MB, trigger cache eviction and GC.

**Implementation:**
```typescript
setInterval(() => {
  const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
  if (heapUsedMB > 500) {
    this.cache.evictLeastUsed();
    if (global.gc) global.gc();
  }
}, 60000); // Check every minute
```

---

## Questions for Implementation Agent

Before you start coding, answer these:

1. **Have you read the full architecture document?** (Epic3_Epic4_Architecture.md)
2. **Have you reviewed the C# LogicEngineService.cs?** (understand scope)
3. **Do you have access to test CSV data?** (real data from C:\discoverydata\)
4. **Have you verified PowerShellService works?** (run existing tests)
5. **Do you understand the CSV header variation problem?** (critical for parsing)
6. **Are you clear on the two-tier caching strategy?** (hot + LRU)
7. **Do you know the fuzzy matching threshold?** (0.75 = 75% similarity)

If any answer is "No", stop and review before implementing.

---

## Expected Outcomes

### After Epic 3 Implementation

**Users Can:**
- Execute any discovery module from the GUI
- See real-time streaming logs with color-coded levels
- Track progress with accurate percentage and ETA
- Cancel long-running operations instantly
- Export results to CSV or JSON

**Technical State:**
- All 25 discovery views integrated
- PowerShellService fully utilized
- IPC streaming pipeline validated
- E2E tests passing

### After Epic 4 Implementation

**Users Can:**
- Click on any user and see complete detail view with:
  - All group memberships (direct + inherited)
  - All devices they use (primary + secondary)
  - All applications they have installed
  - All file shares they can access (direct + via groups)
  - Exchange mailbox details
  - Azure role assignments
  - SQL database access
  - GPO applicability
  - Risk assessment scores
  - Migration hints

**Technical State:**
- LogicEngine loads data in < 5 seconds
- All 9 inference rules apply correctly
- Fuzzy matching achieves > 90% accuracy
- Cache hit rate > 80%
- Memory usage < 500MB for 10K users
- Detail views render in < 100ms (cached)

---

## Next Steps

**Immediate Actions for gui-module-executor:**

1. **Read Full Architecture Document** (`Epic3_Epic4_Architecture.md`)
   - Study all algorithms and patterns
   - Review reference C# code sections
   - Understand data flow diagrams

2. **Set Up Test Environment**
   - Verify access to `C:\discoverydata\ljpops\Raw\` CSV files
   - Run existing PowerShellService tests
   - Prepare large test dataset (10,000+ users)

3. **Start Implementation**
   - Follow roadmap phase-by-phase
   - Epic 3 first (simpler, immediate value)
   - Then Epic 4 (complex, critical dependency)
   - Write tests alongside code (TDD approach)

4. **Validation Checkpoints**
   - After each component, run unit tests
   - After each epic, run integration tests
   - Before completion, run full E2E test suite
   - Validate against performance targets

---

## Support & Escalation

**If You Encounter:**

- **Unclear Requirements:** Review C# reference code for that specific algorithm
- **Performance Issues:** Consult "Caching & Performance Strategy" section
- **CSV Parsing Failures:** Review "CSV Header Variation Handling" pattern
- **Test Failures:** Check against C# output for reference behavior
- **Memory Problems:** Implement cache eviction and GC triggers

**Do NOT:**
- Skip testing phases
- Change fuzzy matching threshold without testing
- Modify PowerShellService (it's already complete)
- Implement inference rules differently than C# (must match)

---

**Architecture Complete. Ready for Implementation.**

**Handoff to:** gui-module-executor agent
**Priority:** High (these are critical system dependencies)
**Timeline:** 4 weeks (following roadmap)
**Success Criteria:** All tests pass + performance targets met

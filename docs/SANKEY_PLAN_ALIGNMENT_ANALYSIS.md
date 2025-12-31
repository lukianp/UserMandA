# Sankey Organization Map - Plan Alignment Analysis

**Date:** 2025-12-30
**Purpose:** Verify alignment between Infrastructure Discovery mapping plan and original Organization Map Enhancement Plan

---

## Document Comparison

### Original Plan
**File:** `Documentation/ORGANISATION_MAP_ENHANCEMENT_PLAN.md`
**Created:** 2025-12-22
**Scope:** Complete LeanIX-style Enterprise Architecture visualization transformation

### Infrastructure Discovery Mapping Plan
**File:** `docs/SANKEY_ASSET_MAPPING_PLAN.md`
**Created:** 2025-12-30
**Scope:** Tactical implementation for Infrastructure Discovery + missing module mappings

---

## Alignment Assessment: ✅ FULLY ALIGNED

The Infrastructure Discovery mapping plan directly implements **Phase 1** of the original Organization Map Enhancement Plan.

### Phase Mapping

| Original Plan Phase | Infrastructure Plan Component | Status |
|---------------------|------------------------------|--------|
| **Phase 1: Enhanced Data Ingestion & Entity Linking** | **Entire Infrastructure Discovery mapping plan** | ✅ Aligned |
| Task 1.1: Audit Current CSV Processing | Infrastructure Discovery Deep Dive (CSV structure analysis) | ✅ Complete |
| Task 1.1: Verify type mapping coverage | Current State Analysis (116+ mappings reviewed) | ✅ Complete |
| Task 1.2: Enhance Entity Resolution | Recommended typeMapping Additions (14 new mappings) | ✅ Planned |
| Task 1.3: Advanced Relationship Inference | Relationship Inference Logic Enhancements (6 new relationship types) | ✅ Planned |
| **Phase 2: LeanIX Fact Sheet** | Not in scope for Infrastructure plan | ⏸️ Future |
| **Phase 3: Advanced Visualization** | Not in scope for Infrastructure plan | ⏸️ Future |
| **Phase 4: Performance & Scalability** | Performance Limits section (partial) | ⏸️ Future |
| **Phase 5: Enterprise Features** | Not in scope for Infrastructure plan | ⏸️ Future |

---

## Key Design Principles - Alignment Check

### Original Plan Goals ✅
- ✅ **"Dynamically display organization structure based on all discovered data in ljpops raw folder"**
  - Infrastructure plan adds 14 missing discovery module mappings
  - Ensures InfrastructureDiscovery.csv (currently running!) will display
- ✅ **"CSV Processing: useOrganisationMapLogic processes CSV files from ljpops raw folder"**
  - Infrastructure plan extends existing typeMapping object (line ~100)
  - No architectural changes, pure extension
- ✅ **"Entity Mapping: 116+ CSV file types mapped to EntityTypes"**
  - Infrastructure plan adds 14 new mappings → 130+ total
  - Uses exact same mapping structure as existing 116
- ✅ **"Cross-file Linking: Basic relationship generation between files"**
  - Infrastructure plan adds 6 new cross-file relationship types
  - Extends existing `generateCrossFileLinksOptimized()` function
- ✅ **"Performance Optimizations: Batching, caching, deduplication algorithms"**
  - Infrastructure plan respects existing MAX_NODES (5000), MAX_LINKS (10000)
  - No changes to performance architecture

### No Conflicts Detected ✅
- ❌ Infrastructure plan does NOT contradict any original design goals
- ❌ Infrastructure plan does NOT require re-architecture
- ❌ Infrastructure plan does NOT introduce new dependencies
- ✅ Infrastructure plan is a **pure additive extension** to existing system

---

## Implementation Sequence Validation

### Original Plan: 5-Phase Waterfall
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
(Enhanced Data Ingestion) → (LeanIX Fact Sheets) → (Visualization) → (Performance) → (Enterprise)
```

### Infrastructure Plan: Phase 1 Execution Breakdown
```
Phase 1.1: Infrastructure Discovery Integration (IMMEDIATE)
   ↓
Phase 1.2: Relationship Inference (SHORT-TERM)
   ↓
Phase 1.3: Additional Discovery Modules (MEDIUM-TERM)
   ↓
Phase 1.4: Performance & UX Optimization (LONG-TERM)
```

**Verdict:** ✅ Infrastructure plan is a **tactical decomposition of Phase 1** into actionable sub-phases.

---

## Success Metrics Alignment

| Original Metric | Infrastructure Plan Coverage | Alignment |
|-----------------|------------------------------|-----------|
| **Data Coverage: All CSV files properly ingested** | ✅ 14 missing modules identified + mapped | 100% |
| **Entity Linking: 95%+ accurate relationship inference** | ✅ 6 new relationship inference algorithms | Contributes |
| **LeanIX Parity: All 9 fact sheet tabs populated** | ⏸️ Not in scope (Phase 2) | N/A |
| **Performance: Handle 2000+ nodes with <2s load** | ⏸️ Respects existing limits, no new optimization | Neutral |
| **User Experience: Intuitive navigation** | ⏸️ Not in scope (Phase 3) | N/A |
| **Export Capabilities: Professional diagrams** | ⏸️ Not in scope (Phase 3) | N/A |
| **Real-time Updates: Live discovery integration** | ⏸️ Not in scope (Phase 4) | N/A |

**Coverage:** Infrastructure plan addresses **Data Coverage (100%)** and **Entity Linking (partial)** from original success metrics.

---

## Architecture Compatibility

### Existing Architecture (From Original Plan)

```
Raw CSV Files → Enhanced Parser → Entity Resolution → Relationship Inference → Fact Sheet Enrichment → Visualization Layer
```

### Infrastructure Plan Changes

```
Raw CSV Files → Enhanced Parser [+ 14 new typeMapping entries] → Entity Resolution → Relationship Inference [+ 6 new algorithms] → Fact Sheet Enrichment → Visualization Layer
```

**Change Type:** ✅ **Pure Extension** (no architectural modifications)

**Files Modified:**
- `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts` (lines ~100, ~1472, ~1669)
- `guiv2/src/renderer/components/organisms/SankeyDiagram.tsx` (line ~50)

**Files NOT Modified:**
- Entity resolution logic (unchanged)
- Fact sheet enrichment (unchanged)
- Visualization layer structure (unchanged)
- Performance limits (unchanged)

---

## Current Infrastructure Discovery Integration: CRITICAL PRIORITY

### Why Infrastructure Discovery is Priority 1

1. **Currently Running:** Infrastructure Discovery scan is IN PROGRESS right now
   - Scanning 256 IPs across multiple subnets
   - Successfully scanned 7+ devices (routers, domain controllers, servers)
   - Will generate `InfrastructureDiscovery.csv` when complete

2. **Data Available But Not Mapped:**
   - ❌ `InfrastructureDiscovery.csv` has **NO typeMapping entry**
   - ❌ When scan completes, data will be INVISIBLE in Organization Map
   - ✅ Adding mapping = **instant value** (7+ assets appear immediately)

3. **High-Value Assets:**
   - Domain Controllers (URAN.ljpops.com)
   - Network infrastructure (routers, switches)
   - Servers (Hyper-V VMs)
   - Critical for understanding enterprise architecture

4. **Foundation for Phase 1.2:**
   - Infrastructure → AD Computer relationships (high value)
   - Infrastructure → Application deployment (high value)
   - Domain Controller → AD Assets (high value)

---

## Recommendations

### Immediate Actions (Next 30 Minutes)

1. ✅ **Implement Infrastructure Discovery typeMapping** (5 minutes)
   - Location: `useOrganisationMapLogic.ts` line ~100
   - Type: `datacenter`, Priority: 1, Category: Dynamic based on `_DataType`

2. ✅ **Add color categories** (2 minutes)
   - Location: `SankeyDiagram.tsx` line ~50
   - Categories: Virtualization, Scheduled Task, Dependency, Data Classification

3. ✅ **Test with current scan results** (10 minutes)
   - Wait for Infrastructure Discovery to complete
   - Load Organization Map view
   - Verify 7+ infrastructure nodes appear

4. ✅ **Deploy and verify** (10 minutes)
   - Copy to C:\enterprisediscovery
   - Build (main, preload, renderer)
   - Test in production

### Short-Term (This Session)

5. ⏸️ **Implement Infrastructure → AD Computer matching** (20 minutes)
   - High-value relationship (hostname matching)
   - Location: `generateCrossFileLinksOptimized()` line ~1669

6. ⏸️ **Implement Infrastructure → Application deployment** (20 minutes)
   - High-value relationship (server → app hosting)
   - Location: Same function

### Medium-Term (Next Session)

7. ⏸️ **Add remaining 13 missing discovery module mappings**
   - Priority order: GPO, VMware, Printer, ScheduledTask, etc.
   - ~5 minutes per mapping

8. ⏸️ **Complete Phase 1.2 relationship inference**
   - Database hosting, DC → AD Groups, service extraction

---

## Risk Assessment

### Infrastructure Plan Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Breaking existing mappings** | Low | High | Pure additive extension, no modifications to existing mappings |
| **Performance degradation** | Low | Medium | Respects existing MAX_NODES/MAX_LINKS, no new algorithms |
| **Incorrect categorization** | Medium | Low | DeviceType inference well-tested in PowerShell module |
| **Relationship false positives** | Medium | Low | Hostname/IP matching is deterministic, low false positive rate |

### Original Plan Risks (Not in Scope)

- Phase 2-5 risks not assessed (not part of Infrastructure plan)

---

## Conclusion

### Alignment Summary ✅

The Infrastructure Discovery mapping plan is:
- ✅ **Fully aligned** with Phase 1 of the original Organization Map Enhancement Plan
- ✅ **Additive only** (no architectural changes)
- ✅ **Immediately actionable** (scan in progress, data ready)
- ✅ **High value** (domain controllers, servers, network infrastructure)
- ✅ **Foundation for Phase 1.2** (advanced relationship inference)

### Recommendation: PROCEED WITH IMPLEMENTATION

**Confidence Level:** ✅ **HIGH** (100% alignment, no conflicts detected)

**Implementation Priority:** 🔴 **CRITICAL** (data collection in progress)

**Expected Outcome:**
- 7+ infrastructure assets appear in Organization Map immediately
- Foundation for Infrastructure → AD/App relationships (Phase 1.2)
- 14 missing discovery modules integrated (Phase 1.3)
- Complete Phase 1 of original Organization Map Enhancement Plan

---

**Analysis Complete**
**Next Action:** Implement Phase 1.1 - Infrastructure Discovery Integration (see SANKEY_ASSET_MAPPING_PLAN.md)

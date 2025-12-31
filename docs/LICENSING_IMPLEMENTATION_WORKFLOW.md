# Licensing Implementation - Two-Computer Workflow Guide

## Overview

This guide ensures the licensing implementation work done on Computer 1 is properly synced to GitHub so it can be pulled and continued on Computer 2.

---

## Pre-Implementation Checklist (Computer 1)

Before starting implementation:

```bash
# 1. Ensure you're on the correct branch
cd D:\Scripts\UserMandA-1
git status
git branch

# 2. Pull latest changes (just to be safe)
git pull origin main

# 3. Create a feature branch for licensing work
git checkout -b feature/licensing-and-updates

# 4. Verify you're in workspace (NOT deployment)
pwd
# Should show: D:\Scripts\UserMandA-1
```

---

## During Implementation

### Work Location Rules
- ✅ **ALWAYS work in:** `D:\Scripts\UserMandA-1` (workspace)
- ✅ **ALWAYS commit from:** `D:\Scripts\UserMandA-1` (workspace)
- ⚠️ **For testing only:** Copy to `C:\enterprisediscovery` and build there

### Files Being Created/Modified

**Phase 1: Core Service Integration**
```
NEW FILES:
- guiv2/src/main/services/licenseService.ts
- guiv2/src/main/services/updateService.ts

MODIFIED FILES:
- guiv2/src/main/ipcHandlers.ts
- guiv2/src/preload.ts
- guiv2/package.json (add semver dependency)
```

**Phase 2: License Management**
```
NEW FILES:
- guiv2/src/renderer/hooks/useLicense.ts
- guiv2/src/main/services/licenseService.test.ts (optional)

MODIFIED FILES:
- guiv2/src/renderer/views/admin/LicenseActivationView.tsx
- guiv2/src/main/ipcHandlers.ts
```

**Phase 3: Update Service**
```
NEW FILES:
- guiv2/src/renderer/hooks/useUpdates.ts
- guiv2/src/main/services/updateService.test.ts (optional)

MODIFIED FILES:
- guiv2/src/main/ipcHandlers.ts
- guiv2/src/main/services/configService.ts
```

**Phase 4: Advanced Features**
```
NEW FILES:
- scripts/generate-license-key.js
- .github/workflows/build-and-release.yml

MODIFIED FILES:
- guiv2/src/main/main.ts (or index.ts)
- guiv2/src/main/services/configService.ts
```

### Commit Strategy

**Option A: Commit After Each Phase (RECOMMENDED)**
```bash
# After completing Phase 1
git add guiv2/src/main/services/licenseService.ts
git add guiv2/src/main/services/updateService.ts
git add guiv2/src/main/ipcHandlers.ts
git add guiv2/src/preload.ts
git add guiv2/package.json

git status  # Review what's being committed

git commit -m "feat: Phase 1 - Core licensing and update services

- Add LicenseService with offline validation and encryption
- Add UpdateService with GitHub integration via Octokit
- Register IPC handlers for license:* and update:* channels
- Expose license and update APIs in preload
- Add semver dependency for version comparison

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin feature/licensing-and-updates
```

**Option B: Commit Everything at End**
```bash
# After all 4 phases complete
git add .
git status  # Review ALL changes

git commit -m "feat: Complete licensing and update system implementation

Phases completed:
- Phase 1: Core service integration
- Phase 2: License management
- Phase 3: Update service
- Phase 4: Advanced features & UI

New services:
- LicenseService: Offline validation, encryption, feature gating
- UpdateService: GitHub-based updates, rollback, versioning

New UI:
- Updated LicenseActivationView with real activation
- Added useLicense and useUpdates hooks

Infrastructure:
- GitHub Actions CI/CD workflow
- License key generator script
- Comprehensive testing setup

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin feature/licensing-and-updates
```

---

## End of Session (Computer 1)

### Final Packaging Checklist

```bash
cd D:\Scripts\UserMandA-1

# 1. Check status - should be clean if you committed everything
git status

# 2. If there are uncommitted changes, commit them
git add .
git commit -m "feat: Licensing implementation - end of session checkpoint"

# 3. Push to remote
git push origin feature/licensing-and-updates

# 4. Verify push succeeded
git log --oneline -5
# You should see your recent commits

git status
# Should say: "Your branch is up to date with 'origin/feature/licensing-and-updates'"

# 5. Create a checkpoint summary
echo "=== Licensing Implementation Checkpoint ===" > CHECKPOINT.txt
echo "Date: $(date)" >> CHECKPOINT.txt
echo "Branch: feature/licensing-and-updates" >> CHECKPOINT.txt
echo "" >> CHECKPOINT.txt
echo "Completed Phases:" >> CHECKPOINT.txt
echo "- [ ] Phase 1: Core Service Integration" >> CHECKPOINT.txt
echo "- [ ] Phase 2: License Management" >> CHECKPOINT.txt
echo "- [ ] Phase 3: Update Service" >> CHECKPOINT.txt
echo "- [ ] Phase 4: Advanced Features" >> CHECKPOINT.txt
echo "" >> CHECKPOINT.txt
echo "Next Steps on Computer 2:" >> CHECKPOINT.txt
echo "1. git pull origin feature/licensing-and-updates" >> CHECKPOINT.txt
echo "2. Copy files to C:\enterprisediscovery" >> CHECKPOINT.txt
echo "3. npm install (if package.json changed)" >> CHECKPOINT.txt
echo "4. Build and test" >> CHECKPOINT.txt

git add CHECKPOINT.txt
git commit -m "docs: Add session checkpoint"
git push origin feature/licensing-and-updates
```

---

## Starting on Computer 2

### Morning Startup Checklist

```bash
# 1. Navigate to workspace
cd D:\Scripts\UserMandA-1

# 2. Check current state
git status
git branch

# 3. PULL LATEST CHANGES (CRITICAL!)
git fetch origin
git checkout feature/licensing-and-updates
git pull origin feature/licensing-and-updates

# 4. Verify you have the latest commits
git log --oneline -10
# Should see all commits from Computer 1

# 5. Check for checkpoint file
cat CHECKPOINT.txt
# Review what was completed

# 6. Verify new files exist
ls -la guiv2/src/main/services/licenseService.ts
ls -la guiv2/src/main/services/updateService.ts
# Should exist if Phase 1 was completed

# 7. Check if package.json changed (need to install)
git diff origin/main..HEAD -- guiv2/package.json

# If package.json changed, install dependencies IN WORKSPACE first
cd guiv2
npm install
cd ..
```

---

## Testing on Computer 2

### Copy to Deployment & Build

```powershell
# 1. Copy ALL modified/new files to deployment directory
robocopy D:\Scripts\UserMandA-1 C:\enterprisediscovery /MIR /XD .git node_modules .webpack /XF *.log /NFL /NDL /NJH /NJS

# 2. If package.json changed, install in deployment too
cd C:\enterprisediscovery\guiv2
npm install

# 3. Build in deployment directory (NEVER in workspace)
cd C:\enterprisediscovery\guiv2

# Kill any running Electron
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean webpack cache
if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }

# Build all 3 bundles
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# 4. Launch app
npm start

# 5. Wait 6-8 seconds, then verify
Start-Sleep -Seconds 8
Get-Process -Name electron -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, StartTime
```

### Testing the Licensing Features

```bash
# After app launches, test:
1. Navigate to Admin → License Activation
2. Try activating a test license key (generate one first)
3. Check browser console (F12) for any errors
4. Verify license status displays correctly
5. Test update check (if Phase 3 is complete)
```

---

## Continuing Work on Computer 2

### If Making Changes on Computer 2

```bash
# 1. Work in workspace
cd D:\Scripts\UserMandA-1

# 2. Make your changes (e.g., Phase 2 if you finished Phase 1 on Computer 1)

# 3. Copy to deployment for testing
robocopy D:\Scripts\UserMandA-1 C:\enterprisediscovery /MIR /XD .git node_modules .webpack /XF *.log /NFL /NDL /NJH /NJS

# 4. Build and test in deployment
cd C:\enterprisediscovery\guiv2
# ... build process ...

# 5. If tests pass, commit from WORKSPACE
cd D:\Scripts\UserMandA-1

git add .
git commit -m "feat: Phase 2 completed on Computer 2 - License management"
git push origin feature/licensing-and-updates
```

---

## Final Merge to Main

### When ALL 4 Phases Are Complete

```bash
# 1. Ensure you're on feature branch and pushed
cd D:\Scripts\UserMandA-1
git status
git push origin feature/licensing-and-updates

# 2. Switch to main
git checkout main
git pull origin main

# 3. Merge feature branch
git merge feature/licensing-and-updates

# 4. Resolve any conflicts (unlikely if working alone)

# 5. Run final tests
# Copy to deployment, build, test everything

# 6. If all tests pass, push to main
git push origin main

# 7. Delete feature branch (optional)
git branch -d feature/licensing-and-updates
git push origin --delete feature/licensing-and-updates
```

---

## Recovery Scenarios

### Scenario 1: Forgot to Push from Computer 1

**On Computer 2:**
```bash
# You won't see the changes yet
git pull origin feature/licensing-and-updates
# Shows: Already up to date

# SOLUTION: Wait until you can access Computer 1, or work on something else
```

**Prevention:**
- ALWAYS run `git push` before switching computers
- Verify with `git status` showing "up to date with origin"

### Scenario 2: Made Changes in Deployment Directory by Mistake

**If you edited files in C:\enterprisediscovery:**
```bash
# Copy the modified files BACK to workspace
Copy-Item -Path "C:\enterprisediscovery\guiv2\src\main\services\licenseService.ts" -Destination "D:\Scripts\UserMandA-1\guiv2\src\main\services\" -Force

# Then commit from workspace
cd D:\Scripts\UserMandA-1
git add guiv2/src/main/services/licenseService.ts
git commit -m "fix: Update licenseService (accidentally edited in deployment)"
git push origin feature/licensing-and-updates
```

### Scenario 3: Need to Sync Mid-Phase

**If you're in the middle of Phase 2 and need to switch computers:**
```bash
# Commit work-in-progress
git add .
git commit -m "wip: Phase 2 license management - in progress

Current status:
- ✅ LicenseService implementation complete
- ⏳ IPC handlers in progress (3 of 6 done)
- ⏳ React hook not started

Safe to continue on Computer 2."

git push origin feature/licensing-and-updates
```

---

## Quick Reference Commands

### Computer 1 - End of Session
```bash
cd D:\Scripts\UserMandA-1
git add .
git status
git commit -m "feat: [description]"
git push origin feature/licensing-and-updates
git log --oneline -5  # Verify push
```

### Computer 2 - Start of Session
```bash
cd D:\Scripts\UserMandA-1
git checkout feature/licensing-and-updates
git pull origin feature/licensing-and-updates
git log --online -10  # Verify you have latest
# Then copy to deployment and build
```

### Emergency Sync Check
```bash
# On either computer
cd D:\Scripts\UserMandA-1
git fetch origin
git status -sb  # Shows ahead/behind remote
git log --oneline origin/feature/licensing-and-updates..HEAD  # Shows unpushed commits
git log --oneline HEAD..origin/feature/licensing-and-updates  # Shows unpulled commits
```

---

## File Checklist Before Switching Computers

### Phase 1 Files (Must be in Git)
- [ ] `guiv2/src/main/services/licenseService.ts`
- [ ] `guiv2/src/main/services/updateService.ts`
- [ ] `guiv2/src/main/ipcHandlers.ts` (modified)
- [ ] `guiv2/src/preload.ts` (modified)
- [ ] `guiv2/package.json` (modified - semver added)
- [ ] `guiv2/package-lock.json` (modified - semver added)

### Phase 2 Files (Must be in Git)
- [ ] `guiv2/src/renderer/hooks/useLicense.ts`
- [ ] `guiv2/src/renderer/views/admin/LicenseActivationView.tsx` (modified)
- [ ] `guiv2/src/main/ipcHandlers.ts` (modified again)

### Phase 3 Files (Must be in Git)
- [ ] `guiv2/src/renderer/hooks/useUpdates.ts`
- [ ] `guiv2/src/main/services/configService.ts` (modified)
- [ ] `guiv2/src/main/ipcHandlers.ts` (modified again)

### Phase 4 Files (Must be in Git)
- [ ] `scripts/generate-license-key.js`
- [ ] `.github/workflows/build-and-release.yml`
- [ ] `guiv2/src/main/main.ts` (modified)

### Documentation Files (Should be in Git)
- [ ] `docs/CONSOLIDATED_LICENSING_IMPLEMENTATION_PLAN.md`
- [ ] `docs/LICENSING_PLANS_COMPARISON.md`
- [ ] `docs/LICENSING_IMPLEMENTATION_WORKFLOW.md` (this file)
- [ ] `CHECKPOINT.txt` (if created)

---

## Verification Script

**Run this before switching computers:**

```bash
# Save as: check-sync-ready.sh
#!/bin/bash

echo "=== Git Sync Readiness Check ==="
echo ""

# Check if in workspace
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" != *"UserMandA-1"* ]]; then
  echo "❌ ERROR: Not in workspace directory!"
  echo "   Current: $CURRENT_DIR"
  echo "   Expected: D:\Scripts\UserMandA-1"
  exit 1
fi
echo "✅ In workspace directory"

# Check for uncommitted changes
UNCOMMITTED=$(git status --porcelain)
if [ -n "$UNCOMMITTED" ]; then
  echo "⚠️  WARNING: Uncommitted changes detected:"
  git status --short
  echo ""
  echo "Run: git add . && git commit -m 'feat: [description]'"
  exit 1
fi
echo "✅ No uncommitted changes"

# Check if pushed
UNPUSHED=$(git log origin/$(git branch --show-current)..HEAD --oneline)
if [ -n "$UNPUSHED" ]; then
  echo "❌ ERROR: Unpushed commits detected:"
  echo "$UNPUSHED"
  echo ""
  echo "Run: git push origin $(git branch --show-current)"
  exit 1
fi
echo "✅ All commits pushed to remote"

# Check branch status
BRANCH=$(git branch --show-current)
echo "✅ Current branch: $BRANCH"

# Summary
echo ""
echo "=== ✅ READY TO SWITCH COMPUTERS ==="
echo "On the other computer, run:"
echo "  git checkout $BRANCH"
echo "  git pull origin $BRANCH"
echo ""
```

**Usage:**
```bash
bash check-sync-ready.sh
```

---

## Summary

**Golden Rules:**
1. ✅ **ALWAYS work in workspace:** `D:\Scripts\UserMandA-1`
2. ✅ **ALWAYS commit from workspace:** `D:\Scripts\UserMandA-1`
3. ✅ **ALWAYS push before switching computers**
4. ✅ **ALWAYS pull before starting work** on the other computer
5. ✅ **Only build in deployment:** `C:\enterprisediscovery`
6. ✅ **Copy changes back to workspace** if you accidentally edit in deployment

**Safe Workflow:**
```
Computer 1: Work → Commit → Push
                              ↓
                          GitHub (remote)
                              ↓
Computer 2:              Pull → Work → Commit → Push
```

**Testing Workflow:**
```
Workspace: Edit code
    ↓
Deployment: Copy files → Build → Test
    ↓
Workspace: If tests pass, commit → push
```

This ensures your licensing implementation work is ALWAYS safe, synchronized, and recoverable! 🚀

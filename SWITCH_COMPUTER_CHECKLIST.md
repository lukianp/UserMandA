# 🚀 Switch Computer Checklist - Licensing Implementation

## Before Leaving Computer 1 (Tonight)

```bash
cd D:\Scripts\UserMandA-1

# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Review what you're committing
git status

# 4. Commit (use appropriate message)
git commit -m "feat: Licensing implementation - [phase completed]

[Brief description of what was done]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 5. PUSH TO REMOTE (CRITICAL!)
git push origin feature/licensing-and-updates

# 6. VERIFY push succeeded
git status
# Should say: "Your branch is up to date with 'origin/feature/licensing-and-updates'"

git log --oneline -5
# Should show your recent commits
```

**✅ DONE! Safe to switch computers**

---

## Starting on Computer 2 (Tomorrow Morning)

```bash
cd D:\Scripts\UserMandA-1

# 1. PULL LATEST (CRITICAL!)
git checkout feature/licensing-and-updates
git pull origin feature/licensing-and-updates

# 2. Verify you have the changes
git log --oneline -10
# Should see commits from Computer 1

# 3. Check if package.json changed
git diff origin/main..HEAD -- guiv2/package.json

# 4. If package.json changed, install dependencies
cd guiv2
npm install
cd ..

# 5. Copy to deployment directory
robocopy D:\Scripts\UserMandA-1 C:\enterprisediscovery /MIR /XD .git node_modules .webpack /XF *.log /NFL /NDL /NJH /NJS

# 6. Build in deployment
cd C:\enterprisediscovery\guiv2

Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }

npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

npm start
```

**✅ READY! Continue working**

---

## Quick Sync Verification

```bash
# On EITHER computer - check sync status
cd D:\Scripts\UserMandA-1
git fetch origin
git status -sb

# Shows if you're ahead/behind remote
# "Your branch is up to date" = ✅ GOOD
# "Your branch is ahead by 3 commits" = ⚠️ NEED TO PUSH
# "Your branch is behind by 2 commits" = ⚠️ NEED TO PULL
```

---

## 🔴 CRITICAL RULES

1. **ALWAYS PUSH** before leaving Computer 1
2. **ALWAYS PULL** before starting on Computer 2
3. **WORK IN WORKSPACE:** `D:\Scripts\UserMandA-1`
4. **BUILD IN DEPLOYMENT:** `C:\enterprisediscovery`
5. **COMMIT FROM WORKSPACE** only

---

## Emergency: "I forgot to push from Computer 1"

**Solution:** You can't get the changes on Computer 2 yet.

**Options:**
1. Wait until you can access Computer 1 to push
2. Work on something else on Computer 2
3. Remote desktop to Computer 1 and push

**Prevention:** Run this before leaving Computer 1:
```bash
git status && git push origin feature/licensing-and-updates
```

---

## File Locations Reference

| Location | Purpose | Edit? | Build? | Commit? |
|----------|---------|-------|--------|---------|
| `D:\Scripts\UserMandA-1` | Workspace | ✅ YES | ❌ NO | ✅ YES |
| `C:\enterprisediscovery` | Deployment | ❌ NO | ✅ YES | ❌ NO |

---

## Quick Copy-Paste Commands

### End of Session (Computer 1)
```bash
cd D:\Scripts\UserMandA-1 && git add . && git status && git commit -m "feat: Session checkpoint" && git push origin feature/licensing-and-updates && git status
```

### Start of Session (Computer 2)
```bash
cd D:\Scripts\UserMandA-1 && git checkout feature/licensing-and-updates && git pull origin feature/licensing-and-updates && git log --oneline -5
```

### Copy to Deployment (Either Computer)
```powershell
robocopy D:\Scripts\UserMandA-1 C:\enterprisediscovery /MIR /XD .git node_modules .webpack /XF *.log /NFL /NDL /NJH /NJS
```

### Full Build (Either Computer)
```powershell
cd C:\enterprisediscovery\guiv2; Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force; if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }; npm run build:main; npx webpack --config webpack.preload.config.js --mode=production; npm run build:renderer; npm start
```

---

**Print this and keep it handy! 📋**

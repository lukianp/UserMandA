# Test Reports — How to Use

This folder stores **human-readable** test runs tied to orchestrator tasks.  
Each report documents the four gates: **Build Verify**, **Log Monitor**, **Test Validate**, **Doc Record**.

## File Naming
YYYYMMDD_taskid_shortname.md

examples:
20250823_T001_group-policies.md
20250823_T003_sql-view-fix.md

markdown
Copy
Edit

## Required Sections (per report)
1. **Header**
   - Task ID, Title, Commit/Branch, Timestamp (UTC), Runner (agent/human)
2. **Build Verifier (Gate 1)**
   - Built from `C:\enterprisediscovery\Build-GUI.ps1`
   - App launched from canonical path
   - Path leakage / workspace artifacts: [Yes/No] (list findings)
3. **Log Monitor (Gate 2)**
   - Sources scanned (build/runtime/module logs)
   - Errors / Warnings summary with pointers
4. **Test & Data Validation (Gate 3)**
   - C# tests summary (pass/fail count)
   - Pester summary (pass/fail count)
   - CSV validation summary (checked paths, missing cols, bad types)
   - Functional sim summary (key scenarios + pass/fail)
5. **Documentation (Gate 4)**
   - Files updated (CHANGELOG, feature doc, ADRs)
6. **Verdict**
   - PASS / PARTIAL / FAIL + next actions

> Keep prose concise; use bullet points.  
> Tables are OK for **keywords/numbers** only (avoid long sentences inside tables).

## Command Hints (informational)
- Build: run `C:\enterprisediscovery\Build-GUI.ps1`
- Typical CSV root: `C:\discoverydata\ljpops\RawData\...`

## Artifacts
Place any generated screenshots/log snippets alongside each report if needed.

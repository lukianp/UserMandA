# Moved Files Manifest
**Date:** 2025-12-23
**Reason:** Cleanup of old test files, DLLs, and unused directories

## To Restore
```powershell
# Restore all files from junk
Get-ChildItem "D:\Scripts\UserMandA\junk" -Exclude "MOVED_FILES_MANIFEST.md" | Move-Item -Destination "D:\Scripts\UserMandA\" -Force
```

---

## Old Fix/Test Scripts (Root)
- add-graph-disconnect.ps1
- apply-powershell-dialog-fixes.ps1
- apply-powershell-dialog-integration.ps1
- build-and-launch.ps1
- compare-hooks.ps1
- deploy-credential-fixes.ps1
- fix-activedirectory-credentials.ps1
- fix-activedirectory-credentials-v2.ps1
- fix-date-timestamps.ps1
- fix-discovery-modules.ps1
- fix-timestamp-errors.ps1
- make-all-discoveries-consistent.ps1
- scan-all-discovery-modules.ps1
- test-onedrive-credential-extraction.ps1
- update-infrastructure-hooks.ps1
- validate-onedrive-module.ps1
- verify-activedirectory-changes.ps1
- verify-and-deploy-all-fixes.ps1
- run-demo.bat (redundant - demo has its own)
- QuickStart.ps1

## Old .NET/WPF Application Files
- App.xaml
- MandADiscoverySuite.deps.json
- MandADiscoverySuite.dll
- MandADiscoverySuite.exe
- MandADiscoverySuite.pdb
- MandADiscoverySuite.runtimeconfig.json
- MandADiscoverySuite.xaml
- Launch-MandADiscoverySuite.bat
- All *.dll files (50+ DLLs)

## Old Directories
- GUI/ (old GUI)
- Configuration/
- Controls/
- Core/
- Resources/
- Styles/
- Themes/
- Views/
- obj/
- packages/
- runtimes/
- temp/
- Tools/
- plans/
- node_modules/ (root level - guiv2 has its own)
- nul (error file)

## Old Screenshots
- quest_features.png
- quest_screenshot.png
- quest_screenshot_features.png
- quest_screenshot_main.png
- quest_screenshot2.png
- quest_screenshot3.png
- app.ico

## Old Demo Files
- enterprise-discovery-demo.zip
- enterprise-discovery-demo-final.zip
- DemoPackage/

## Scripts Folder Cleanup
- Scripts/apply_complete_fix.ps1
- Scripts/fix_complete_method.ps1
- Scripts/DiscoveryModuleLauncher.ps1.backup
- Scripts/Fix-AppRegistrationScript.ps1
- Scripts/Fix-CommentBlock.ps1
- Scripts/Fix-Emojis.bat
- Scripts/Fix-Emojis.ps1
- Scripts/FixHardCodedColors.ps1
- Scripts/Fix-ModuleConflicts.ps1
- Scripts/MandADiscovery_Registration_Log.txt
- Scripts/MandADiscovery_Registration_Log_metrics.json
- Scripts/Purviewtest.ps1
- Scripts/PurviewRecover.ps1
- Scripts/Test-*.ps1 (all test scripts)
- Scripts/test-*.ps1 (all test scripts)

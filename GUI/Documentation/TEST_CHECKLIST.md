# M&A Discovery Suite - Test Verification Checklist
## Post-Implementation Testing Guide

### Build and Deployment Testing
- [ ] **1. Package Restoration**
  - Run: `dotnet restore GUI/MandADiscoverySuite.csproj`
  - Verify all NuGet packages are restored successfully
  
- [ ] **2. Build Compilation**
  - Run: `.\GUI\Build-GUI.ps1`
  - Verify build completes without errors
  - Check output directory: `C:\enterprisediscovery\`

- [ ] **3. Application Launch**
  - Run the application from any directory (not just C:\enterprisediscovery)
  - Verify application starts without NullReferenceException
  - Check that all services initialize properly

### Task-Specific Testing

#### Task 1: NullReferenceException Fix
- [ ] Launch application multiple times
- [ ] Verify no startup crashes
- [ ] Check debug logs for initialization errors

#### Task 2: PowerShell Path Detection
- [ ] Run a discovery module that uses PowerShell
- [ ] Verify it finds PowerShell Core (pwsh.exe) if installed
- [ ] Verify fallback to Windows PowerShell (powershell.exe) works
- [ ] Test on a system without PowerShell Core

#### Task 3: Profile Name Validation
- [ ] Create a new profile with only spaces
- [ ] Verify error message appears
- [ ] Create a profile with valid name
- [ ] Verify profile is created successfully

#### Task 4: Log Export Performance
- [ ] Generate a large debug log (>1000 entries)
- [ ] Click "Export Log" button
- [ ] Verify UI remains responsive during export
- [ ] Verify file is saved correctly

#### Task 5: PowerShell Script Execution
- [ ] Run a long-running PowerShell script
- [ ] Verify UI remains responsive
- [ ] Verify output appears in real-time
- [ ] Test script cancellation with Stop button

#### Task 6: Dynamic Root Path
- [ ] Install application to a non-default directory (e.g., D:\Apps\MandA\)
- [ ] Run the application
- [ ] Verify all modules load correctly
- [ ] Check that scripts and resources are found

#### Task 7: Profile Loading Error Handling
- [ ] Delete or corrupt the Profiles directory
- [ ] Start the application
- [ ] Verify graceful error handling
- [ ] Check that error message is user-friendly

#### Task 8: Redundant Call Testing
- [ ] Monitor debug output during startup
- [ ] Verify LoadCompanyProfiles is called only once
- [ ] Check performance metrics for startup time

#### Task 9: Loading Indicators
- [ ] Start a discovery operation
- [ ] Verify progress bar appears
- [ ] Load Users view - check loading animation
- [ ] Load Infrastructure view - check loading animation
- [ ] Load Groups view - check loading animation

#### Task 10: Log File Monitoring
- [ ] Navigate to Logs directory while app is running
- [ ] Add a line with "Error" to a .log file
- [ ] Verify notification appears in UI within 1 second
- [ ] Add a line with "Exception" - verify detection
- [ ] Add a line with "Failed" - verify detection

### Integration Testing

#### Cross-Module Testing
- [ ] Run complete discovery workflow
- [ ] Verify all modules can find their dependencies
- [ ] Test module communication and data sharing

#### Performance Testing
- [ ] Load large dataset (>10,000 users)
- [ ] Verify pagination works correctly
- [ ] Check memory usage remains stable
- [ ] Verify no memory leaks after extended use

#### Error Recovery Testing
- [ ] Simulate network disconnection during discovery
- [ ] Kill PowerShell process during script execution
- [ ] Corrupt a configuration file
- [ ] Verify graceful recovery in all cases

### Regression Testing

#### Existing Features
- [ ] Dashboard loads with correct metrics
- [ ] User search and filtering works
- [ ] Infrastructure view displays correctly
- [ ] Groups management functions properly
- [ ] Export functionality works for all views
- [ ] Theme switching works correctly
- [ ] Keyboard shortcuts function as expected

### Security Testing

#### Path Injection
- [ ] Verify no hardcoded sensitive paths exposed
- [ ] Test with restricted user permissions
- [ ] Verify no elevation prompts for normal operations

### Logging and Monitoring

#### Log Verification
- [ ] Check application logs for errors
- [ ] Verify debug output is comprehensive
- [ ] Confirm error messages are helpful
- [ ] Check performance metrics are logged

### User Acceptance Testing

#### Usability
- [ ] Application responds quickly to user input
- [ ] Loading states provide clear feedback
- [ ] Error messages are user-friendly
- [ ] Navigation is intuitive

#### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Screen reader compatibility (if applicable)

## Test Results Summary

| Test Category | Pass | Fail | N/A | Notes |
|--------------|------|------|-----|-------|
| Build & Deployment | | | | |
| Task-Specific | | | | |
| Integration | | | | |
| Regression | | | | |
| Security | | | | |
| Performance | | | | |
| Usability | | | | |

## Known Issues
- NuGet package restore requires proper package source configuration
- Build requires .NET 6.0 SDK installed

## Sign-off
- **Tester Name:** ________________________
- **Date:** ________________________
- **Version Tested:** ________________________
- **Environment:** Windows 11 / Windows Server 2022
- **Test Result:** PASS / FAIL / PARTIAL

## Notes
_Add any additional observations, issues found, or recommendations here._
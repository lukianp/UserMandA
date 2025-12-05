# Integration Testing Guide
## UserMandA guiv2 - Profile Management & Azure Integration

This document provides comprehensive integration testing procedures for all features implemented in Tasks 1-17.

## Table of Contents
1. [Testing Environment Setup](#testing-environment-setup)
2. [Azure App Registration Testing](#azure-app-registration-testing)
3. [Target Profile Management Testing](#target-profile-management-testing)
4. [Connection Testing (T-000) Testing](#connection-testing-t-000-testing)
5. [PowerShell Module Discovery Testing](#powershell-module-discovery-testing)
6. [Migration Planning Testing](#migration-planning-testing)
7. [Data Export/Import Testing](#data-exportimport-testing)
8. [Error Monitoring Testing](#error-monitoring-testing)
9. [End-to-End Integration Tests](#end-to-end-integration-tests)

---

## Testing Environment Setup

### Prerequisites
- Windows 10/11 with PowerShell 5.1+
- Node.js 16+ and npm
- Active Directory domain (for AD testing)
- Azure AD tenant with admin access (for Azure testing)
- Exchange Server or Exchange Online (for Exchange testing)

### Environment Configuration
```bash
# Install dependencies
cd guiv2
npm install

# Set environment variables
$env:SCRIPTS_ROOT = "D:\Scripts"  # Path to PowerShell scripts directory

# Build the application
npm run build

# Run in development mode
npm run start
```

---

## Azure App Registration Testing

### Test 1: Launch App Registration Script with UI
**Objective**: Verify the PowerShell script launches with UI window.

**Steps**:
1. Open Settings View
2. Navigate to "Azure & Cloud Integration" section
3. Click "Setup Azure App Registration"
4. Enter company name (e.g., "TestCompany")
5. Select "Show PowerShell Window"
6. Click "Launch Setup"

**Expected Result**:
- PowerShell window appears
- Script prompts for Azure credentials
- Success message shows after completion
- Credential files created at `C:\DiscoveryData\TestCompany\AppReg\`

**Validation**:
```powershell
# Check files exist
Test-Path "C:\DiscoveryData\TestCompany\AppReg\App-Cred-Summary.json"
Test-Path "C:\DiscoveryData\TestCompany\AppReg\App-ClientSecret-Encrypted.txt"
```

### Test 2: Automated App Registration
**Objective**: Verify automated credential import.

**Steps**:
1. Open Settings View
2. Click "Setup Azure App Registration"
3. Enter company name
4. **Uncheck** "Show PowerShell Window"
5. Check "Auto Install Modules"
6. Click "Launch Setup"
7. Wait for completion

**Expected Result**:
- Progress indicator shows execution
- Credentials auto-imported into target profile
- Success notification appears
- Target profile created with Azure credentials

**Validation**:
- Open Profile Management
- Verify new target profile exists with company name
- Check `tenantId`, `clientId` populated
- Verify `clientSecret` shows "[encrypted:...]"

### Test 3: Credential File Monitoring
**Objective**: Verify polling-based credential detection.

**Steps**:
1. Launch app registration with UI mode
2. Monitor app for 5 minutes during PowerShell execution
3. Observe progress messages

**Expected Result**:
- "Waiting for credentials..." message appears
- Polling occurs every 5 seconds
- Credentials detected automatically when files created
- Auto-import triggered

---

## Target Profile Management Testing

### Test 4: Create Target Profile
**Objective**: Create and persist target profile with encryption.

**Steps**:
1. Open Profile Management
2. Switch to "Target Profiles" tab
3. Click "Add Target Profile"
4. Fill in form:
   - Company Name: "Contoso"
   - Tenant ID: "12345678-1234-1234-1234-123456789012"
   - Client ID: "87654321-4321-4321-4321-210987654321"
   - Client Secret: "MySecretValue123!"
   - Domain: "contoso.onmicrosoft.com"
5. Click "Save"

**Expected Result**:
- Profile appears in target profiles list
- Client secret encrypted using DPAPI
- Profile file saved at `config/profiles/targets/contoso.json`

**Validation**:
```powershell
# Read profile file
$profile = Get-Content "config/profiles/targets/contoso.json" | ConvertFrom-Json
# Verify client secret is encrypted
$profile.clientSecret -like "[encrypted:*"
```

### Test 5: Update Target Profile
**Objective**: Update existing target profile.

**Steps**:
1. Select target profile "Contoso"
2. Click "Edit"
3. Change domain to "contoso.com"
4. Update client secret
5. Click "Save"

**Expected Result**:
- Changes persisted
- New client secret re-encrypted
- Modified timestamp updated

### Test 6: Delete Target Profile
**Objective**: Remove target profile and cleanup.

**Steps**:
1. Select target profile
2. Click "Delete"
3. Confirm deletion

**Expected Result**:
- Profile removed from list
- Profile file deleted
- Encrypted credentials cleared

---

## Connection Testing (T-000) Testing

### Test 7: Individual Service Testing - Active Directory
**Objective**: Test AD connectivity.

**Steps**:
1. Open Connection Test Dialog
2. Select "Individual Service Tests" mode
3. Enter domain controller hostname (e.g., "dc01.contoso.com")
4. Optionally enter credentials
5. Click "Test AD"

**Expected Result**:
- Test executes
- Progress indicator shows "Testing Active Directory..."
- Result shows:
  - Success/Failure status
  - Response time (ms)
  - Error details if failed
  - Detected capabilities (e.g., "UserDiscovery", "GroupDiscovery")

**Validation**:
- Verify DNS resolution works
- Verify LDAP port 389 connectivity
- Verify domain information retrieved

### Test 8: Individual Service Testing - Exchange
**Objective**: Test Exchange connectivity.

**Steps**:
1. Select "Individual Service Tests"
2. Enter Exchange server URL: "https://exchange.contoso.com/ews/exchange.asmx"
3. Enter credentials
4. Click "Test Exchange"

**Expected Result**:
- EWS endpoint connectivity verified
- Exchange version detected
- Capabilities identified (e.g., "MailboxDiscovery", "CalendarSync")

### Test 9: Individual Service Testing - Azure AD
**Objective**: Test Azure AD connectivity.

**Steps**:
1. Select "Individual Service Tests"
2. Enter Tenant ID, Client ID, Client Secret
3. Click "Test Azure AD"

**Expected Result**:
- OAuth2 token acquired successfully
- Microsoft Graph API accessible
- Permissions validated
- Capabilities listed (e.g., "CloudUserDiscovery", "TeamsDiscovery")

### Test 10: Comprehensive Environment Test (T-000)
**Objective**: Execute full environment detection.

**Steps**:
1. Select source profile with company data
2. Select "Comprehensive Environment Test"
3. Fill in all connection details:
   - Domain Controller
   - Exchange Server
   - Azure AD credentials
4. Click "Run Environment Test"

**Expected Result**:
- All configured services tested
- Overall status: Success/Partial/Failed
- Individual test results displayed
- Capabilities matrix generated:
  ```
  ✓ ActiveDirectory
  ✓ UserDiscovery
  ✓ GroupDiscovery
  ✓ Exchange
  ✓ MailboxDiscovery
  ✓ CloudUserDiscovery
  ✓ TeamsDiscovery
  ```
- Recommendations provided:
  - "Enable MFA for production migration"
  - "Archive old mailboxes before migration"

**Validation**:
- Check all enabled services return success
- Verify response times < 5000ms
- Confirm capabilities match environment

---

## PowerShell Module Discovery Testing

### Test 11: Module Discovery Scan
**Objective**: Discover all PowerShell modules.

**Steps**:
1. Open Module Discovery Dialog
2. Click "Refresh"
3. Wait for scan completion

**Expected Result**:
- All `.ps1` files in `D:\Scripts\` discovered
- Modules grouped by category (Discovery, Migration, Utilities)
- Module count displayed
- Last scan time shown

**Validation**:
```javascript
// Check discovered modules
modules.forEach(module => {
  assert(module.id)
  assert(module.name)
  assert(module.category)
  assert(module.description)
  assert(Array.isArray(module.parameters))
})
```

### Test 12: Search and Filter Modules
**Objective**: Test module search functionality.

**Steps**:
1. In Module Discovery Dialog
2. Search for "User" in search box
3. Select category "Discovery"
4. View filtered results

**Expected Result**:
- Only modules matching "User" displayed
- Only "Discovery" category shown
- Module count updates dynamically

### Test 13: Execute Module with Parameters
**Objective**: Execute discovered module.

**Steps**:
1. Find "Get-UserInventory" module
2. Click "Execute"
3. Fill in parameters:
   - `DomainController`: "dc01.contoso.com"
   - `OutputPath`: "C:\Temp\users.csv"
   - `IncludeDisabled`: false (unchecked)
4. Click "Execute Module"

**Expected Result**:
- Module execution starts
- Progress indicator shows
- PowerShell output streamed in real-time
- Execution result displayed (success/error)
- Output file created at specified path

**Validation**:
```powershell
Test-Path "C:\Temp\users.csv"
$users = Import-Csv "C:\Temp\users.csv"
$users.Count -gt 0
```

---

## Migration Planning Testing

### Test 14: Create Migration Plan
**Objective**: Create wave-based migration plan.

**Steps**:
1. Open Migration Planning Dialog
2. Click "Create New Plan"
3. Enter plan details:
   - Name: "Q1 2024 Migration"
   - Description: "First quarter user migration to Azure AD"
4. Click "Create Plan"

**Expected Result**:
- Plan created and selected
- Plan list updated
- Empty waves list displayed
- Plan persistence at `config/migration-plans/q1-2024-migration.json`

### Test 15: Add Migration Waves
**Objective**: Create multiple migration waves.

**Steps**:
1. In active plan, click "Add Wave"
2. Create Wave 1:
   - Name: "Executive Team"
   - Description: "C-level executives and direct reports"
   - Start Date: "2024-03-01"
   - End Date: "2024-03-07"
   - Priority: 1
3. Click "Create Wave"
4. Repeat for Wave 2:
   - Name: "Finance Department"
   - Priority: 2
   - Dependencies: ["Wave 1"]

**Expected Result**:
- Waves appear in priority order
- Wave 1 shows status: "planned"
- Wave 2 shows dependency on Wave 1
- Wave dates validated (end > start)

### Test 16: Assign Users to Wave
**Objective**: Assign users to migration wave.

**Steps**:
1. Select Wave 1 "Executive Team"
2. Click "Assign Users"
3. Search for users by department "Executive"
4. Select 5 users
5. Click "Assign"

**Expected Result**:
- Users added to wave
- Wave user count updated (5 users)
- Users marked as "Assigned" in list
- Cannot re-assign same users to different wave

### Test 17: Update Wave Status
**Objective**: Track wave progress.

**Steps**:
1. Select Wave 1
2. Click "Start Wave"
3. Status changes to "inprogress"
4. Complete migration tasks
5. Click "Complete Wave"
6. Status changes to "completed"

**Expected Result**:
- Status transitions: planned → inprogress → completed
- Wave 2 can now start (dependency satisfied)
- Timeline visualization updates

---

## Data Export/Import Testing

### Test 18: Export Users to CSV
**Objective**: Export user data with field selection.

**Steps**:
1. Navigate to Users View
2. Click "Export"
3. Select format: CSV
4. Select fields:
   - displayName
   - userPrincipalName
   - mail
   - department
5. Enter filename: "users-export.csv"
6. Click "Export Data"

**Expected Result**:
- Save dialog appears
- User selects save location
- Export progress shown
- Success message: "Exported 150 records to C:\Downloads\users-export.csv"

**Validation**:
```powershell
$csv = Import-Csv "C:\Downloads\users-export.csv"
$csv[0].PSObject.Properties.Name -contains "displayName"
$csv[0].PSObject.Properties.Name -contains "userPrincipalName"
```

### Test 19: Export to JSON
**Objective**: Export full objects to JSON.

**Steps**:
1. Click "Export"
2. Select format: JSON
3. Check "Include Metadata"
4. Click "Export Data"

**Expected Result**:
- JSON file created
- Full object structure preserved
- Metadata included (export date, source profile, record count)

**Validation**:
```javascript
const data = JSON.parse(fs.readFileSync('export.json'))
assert(data.metadata)
assert(data.metadata.exportDate)
assert(data.records.length > 0)
```

### Test 20: Import Data from CSV
**Objective**: Import data from external CSV.

**Steps**:
1. Create CSV with user data
2. Click "Import"
3. Select format: CSV
4. Choose file
5. Click "Import Data"

**Expected Result**:
- File parsed successfully
- Record count shown
- Warnings for invalid records
- Errors for malformed data
- Success message with import summary

**Validation**:
- Verify import count matches file rows
- Check error handling for missing fields
- Confirm warnings for data type mismatches

---

## Error Monitoring Testing

### Test 21: Error Dashboard - View Logs
**Objective**: Monitor system logs.

**Steps**:
1. Open Error Dashboard
2. Switch to "System Logs" tab
3. Filter by level: "error"
4. Filter by category: "PowerShell"

**Expected Result**:
- Log entries displayed in table
- Columns: Time, Level, Category, Message
- Real-time updates as new logs arrive
- Color-coded by severity (red=error, yellow=warn)

### Test 22: Error Reports - View and Resolve
**Objective**: Manage error reports.

**Steps**:
1. Switch to "Error Reports" tab
2. View unresolved errors
3. Select an error
4. Click "Resolve"
5. Enter resolution notes: "Fixed by updating credentials"
6. Click "Mark as Resolved"

**Expected Result**:
- Error moved to resolved list
- Resolution notes saved
- Unresolved count decremented
- Error report persisted with resolution

### Test 23: Error Logging Integration
**Objective**: Verify error logging from all services.

**Steps**:
1. Trigger an error (e.g., test connection with invalid credentials)
2. Check Error Dashboard
3. Verify error appears in both logs and error reports

**Expected Result**:
- Error logged automatically
- Error report created with context
- Stack trace captured
- Timestamp accurate

---

## End-to-End Integration Tests

### Test 24: Complete Migration Workflow
**Objective**: Full workflow from discovery to migration planning.

**Steps**:
1. **Setup Azure App Registration**
   - Launch app registration for "TestCo"
   - Verify credentials created

2. **Create Target Profile**
   - Auto-import Azure credentials
   - Verify profile created

3. **Test Environment (T-000)**
   - Run comprehensive environment test
   - Verify all services available

4. **Discover Modules**
   - Scan for PowerShell modules
   - Execute user discovery module

5. **Create Migration Plan**
   - Create "TestCo Migration Q1"
   - Add 3 waves
   - Assign users to waves

6. **Export Data**
   - Export users to CSV
   - Export groups to JSON

7. **Monitor Errors**
   - Check error dashboard
   - Resolve any issues

**Expected Result**:
- All steps complete successfully
- Data flows between services correctly
- No orphaned data or state
- All files and configurations persistent

### Test 25: Error Recovery
**Objective**: Verify graceful error handling.

**Steps**:
1. Start app registration
2. Kill PowerShell process mid-execution
3. Verify error handling
4. Restart operation

**Expected Result**:
- Error detected and logged
- User notified of failure
- Partial data cleaned up
- Retry successful

### Test 26: Concurrent Operations
**Objective**: Test multiple operations simultaneously.

**Steps**:
1. Start environment test
2. Simultaneously open module discovery
3. Execute a module while test is running
4. Monitor all operations complete

**Expected Result**:
- Operations don't interfere
- Progress updates for all operations
- All operations complete successfully
- No race conditions or deadlocks

---

## Performance Benchmarks

### Expected Performance Targets

| Operation | Target Time | Acceptable Range |
|-----------|-------------|------------------|
| App Registration Launch | < 2s | 1-3s |
| Environment Test (T-000) | < 30s | 10-45s |
| Module Discovery | < 5s | 2-10s |
| Module Execution | < 60s | 10-120s (varies by module) |
| CSV Export (1000 records) | < 3s | 1-5s |
| JSON Export (1000 records) | < 2s | 1-4s |
| Error Report Load | < 1s | 500ms-2s |

---

## Known Issues & Limitations

1. **Windows DPAPI**: Credential encryption tied to user account. Cannot decrypt on different machine/user.
2. **PowerShell Execution**: Requires PowerShell 5.1+. Windows PowerShell only (not PowerShell Core).
3. **File Monitoring**: 5-second polling interval may miss rapid file changes.
4. **Concurrent Limits**: Maximum 10 concurrent PowerShell sessions.

---

## Troubleshooting

### Common Issues

**Issue**: App registration fails with "Module not found"
**Solution**:
- Check PowerShell execution policy: `Set-ExecutionPolicy RemoteSigned`
- Install required modules: `Install-Module Microsoft.Graph -Force`

**Issue**: Connection test fails for Azure AD
**Solution**:
- Verify tenant ID is correct
- Ensure app has correct permissions
- Check firewall allows Microsoft Graph endpoints

**Issue**: Module discovery finds no modules
**Solution**:
- Verify `SCRIPTS_ROOT` environment variable set correctly
- Check script directory contains `.ps1` files
- Ensure scripts have proper metadata comments

**Issue**: Export fails with "Access Denied"
**Solution**:
- Check write permissions on target directory
- Try saving to different location
- Run application as administrator

---

## Test Automation

### Automated Test Suite

```javascript
// Example Playwright test
describe('Integration Tests', () => {
  test('should create target profile', async () => {
    await app.click('[data-testid="add-target-profile"]');
    await app.fill('[name="companyName"]', 'TestCompany');
    await app.fill('[name="tenantId"]', '12345678-1234-1234-1234-123456789012');
    await app.fill('[name="clientId"]', '87654321-4321-4321-4321-210987654321');
    await app.fill('[name="clientSecret"]', 'SecretValue123!');
    await app.click('[type="submit"]');

    // Verify profile created
    await expect(app.locator('text=TestCompany')).toBeVisible();
  });
});
```

---

## Test Sign-off Checklist

- [ ] All 26 test scenarios executed successfully
- [ ] Performance benchmarks met
- [ ] Error handling validated
- [ ] Security (DPAPI encryption) verified
- [ ] Documentation reviewed
- [ ] Known issues documented
- [ ] Regression tests passed
- [ ] User acceptance testing completed

**Tested By**: _________________
**Date**: _________________
**Version**: _________________
**Sign-off**: _________________

---

## Contact

For testing support or to report issues:
- Documentation: `IMPLEMENTATION_SUMMARY.md`
- Architecture: `PROFILE_ARCHITECTURE_DOCUMENTATION.md`
- Gap Analysis: `PROFILE_MANAGEMENT_GAP_ANALYSIS.md`

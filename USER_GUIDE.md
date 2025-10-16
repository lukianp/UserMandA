# UserMandA User Guide
## Profile Management & Azure Cloud Integration

Welcome to UserMandA - your complete solution for Active Directory to Azure AD migration planning, discovery, and execution.

This guide will help you get started with the new features in guiv2, including Azure App Registration, Connection Testing, Migration Planning, and more.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Azure App Registration](#azure-app-registration)
3. [Profile Management](#profile-management)
4. [Connection Testing (T-000)](#connection-testing-t-000)
5. [PowerShell Module Discovery](#powershell-module-discovery)
6. [Migration Planning](#migration-planning)
7. [Data Export & Import](#data-export--import)
8. [Error Monitoring](#error-monitoring)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- **Operating System**: Windows 10/11
- **PowerShell**: 5.1 or higher
- **Permissions**: Local administrator rights recommended
- **Network**: Access to Active Directory and Azure AD
- **Storage**: 500MB free disk space

### First Launch

1. **Launch the Application**
   ```
   Navigate to: C:\enterprisediscovery\guiv2\
   Run: UserMandA.exe
   ```

2. **Select a Source Profile**
   - The application auto-discovers profiles from `C:\DiscoveryData\`
   - Select your organization's profile from the dropdown
   - The profile contains all discovered AD data

3. **Initial Setup Checklist**
   - [ ] Source profile selected
   - [ ] Azure app registration completed (if migrating to cloud)
   - [ ] Target profile created
   - [ ] Connection testing passed
   - [ ] Ready to plan migration!

---

## Azure App Registration

Azure App Registration is required for cloud migrations. This creates an application in your Azure AD tenant with the necessary permissions.

### When Do You Need This?
- Migrating from on-premises AD to Azure AD
- Using Microsoft 365 / Exchange Online
- Accessing Teams, SharePoint, or other Microsoft cloud services

### Setup Wizard

#### Step 1: Launch Setup

1. Navigate to **Settings** → **Azure & Cloud Integration**
2. Click **"Setup Azure App Registration"**
3. The App Registration dialog opens

#### Step 2: Configure Options

![App Registration Dialog](images/app-reg-dialog.png)

**Company Name** (Required)
- Enter your organization name
- Used to organize credentials
- Example: "ContosoLtd"

**Display PowerShell Window** (Optional)
- ☑ Check to see the script execution
- ☐ Uncheck for silent background execution
- **Recommended**: Check first time to monitor progress

**Auto Install Modules** (Optional)
- ☑ Check to automatically install required PowerShell modules
- Installs: Microsoft.Graph, Az.Accounts, etc.
- **Recommended**: Check for first-time setup

**Secret Validity (Years)**
- Default: 2 years
- Range: 1-10 years
- Client secret expiration period
- **Note**: Plan to renew before expiration

**Skip Azure Roles Assignment**
- ☑ Check to skip role assignments
- Only check if roles assigned manually
- **Recommended**: Leave unchecked for auto-configuration

#### Step 3: Execute Setup

1. Click **"Launch Setup"**
2. **If PowerShell window visible**:
   - You'll be prompted to sign in to Azure
   - Use Global Administrator credentials
   - Consent to required permissions
3. **Wait for completion** (typically 2-5 minutes)
4. Watch for success notification

#### Step 4: Verify Credentials

After successful setup:

**Credential Files Created**:
```
C:\DiscoveryData\{CompanyName}\AppReg\
├── App-Cred-Summary.json          # Application details
├── App-ClientSecret-Encrypted.txt # Encrypted secret (DPAPI)
└── App-Registration-Log.txt       # Execution log
```

**Auto-Import to Target Profile**:
- A new target profile is automatically created
- Company name matches your input
- Azure credentials populated
- Client secret encrypted for security

**Verification Steps**:
1. Go to **Profile Management** → **Target Profiles**
2. Find your company profile
3. Verify fields populated:
   - ✓ Company Name
   - ✓ Tenant ID
   - ✓ Client ID
   - ✓ Client Secret (shows as [encrypted:...])
   - ✓ Domain

### Manual Credential Import

If auto-import failed or you have existing credentials:

1. Open **Profile Management** → **Target Profiles**
2. Click **"Add Target Profile"**
3. Fill in Azure credentials manually:
   - Tenant ID: From Azure Portal → Azure Active Directory
   - Client ID: From App Registrations
   - Client Secret: From app's Certificates & secrets
4. Click **"Save"**

### Permissions Required

The app registration requires these Microsoft Graph permissions:

| Permission | Type | Reason |
|------------|------|--------|
| User.Read.All | Application | Read all user profiles |
| Group.Read.All | Application | Read all groups |
| Directory.Read.All | Application | Read directory data |
| Mail.Read | Delegated | Access user mailboxes (for migration) |
| Calendars.Read | Delegated | Access calendars (for migration) |

**Note**: Global Administrator consent is required for application permissions.

---

## Profile Management

Profiles organize your source (on-premises) and target (cloud) environments.

### Source Profiles

**Source profiles** represent your on-premises Active Directory environment.

#### Auto-Discovery

UserMandA automatically discovers profiles from:
```
C:\DiscoveryData\
├── Company1\
│   └── Raw\           # CSV data files
├── Company2\
│   └── Raw\
└── ...
```

#### Selecting Active Source Profile

1. Click the **profile dropdown** in the header
2. Select your organization
3. Data reloads automatically
4. All views now show selected profile's data

#### Creating Manual Source Profile

If auto-discovery doesn't find your profile:

1. Go to **Profile Management** → **Source Profiles**
2. Click **"Create Source Profile"**
3. Fill in details:
   - **Company Name**: Your organization
   - **Data Path**: Path to CSV data folder
   - **Description**: Optional notes
4. Click **"Save"**

### Target Profiles

**Target profiles** represent your migration destination (typically Azure AD).

#### Creating Target Profile

1. Go to **Profile Management** → **Target Profiles**
2. Click **"Add Target Profile"**
3. Fill in Azure AD details:

**Basic Information**:
- **Company Name**: Target organization name
- **Domain**: Azure AD domain (e.g., contoso.onmicrosoft.com)

**Azure Credentials** (from App Registration):
- **Tenant ID**: Azure AD tenant identifier
- **Client ID**: App registration application ID
- **Client Secret**: App client secret (will be encrypted)

4. Click **"Save"**

**Security Note**: Client secrets are encrypted using Windows DPAPI (Data Protection API). They can only be decrypted by the same user account on the same machine.

#### Editing Target Profile

1. Select the profile
2. Click **"Edit"**
3. Modify fields (secret will be re-encrypted if changed)
4. Click **"Save"**

#### Deleting Target Profile

1. Select the profile
2. Click **"Delete"**
3. Confirm deletion
4. Encrypted credentials are securely removed

---

## Connection Testing (T-000)

Connection Testing validates your environment connectivity before migration. This implements the **T-000 pattern** for comprehensive environment detection.

### When to Use Connection Testing

- **Before Migration**: Ensure all services are accessible
- **Troubleshooting**: Diagnose connectivity issues
- **Validation**: Verify credentials and permissions
- **Capacity Planning**: Test response times under load

### Opening Connection Test Dialog

1. Navigate to **Dashboard** or **Settings**
2. Click **"Test Connections"** button
3. Connection Testing dialog opens

### Test Modes

#### Individual Service Tests

Test each service independently.

**Active Directory Test**
1. Select **"Individual Service Tests"**
2. Enter **Domain Controller**: hostname or IP
3. (Optional) Enter credentials
4. Click **"Test AD"**

**Expected Results**:
- ✓ DNS resolution successful
- ✓ LDAP port 389 accessible
- ✓ Domain information retrieved
- ✓ Capabilities: ActiveDirectory, UserDiscovery, GroupDiscovery

**Exchange Server Test**
1. Enter **Exchange Server URL**:
   ```
   https://mail.contoso.com/ews/exchange.asmx
   ```
2. Enter credentials (if required)
3. Click **"Test Exchange"**

**Expected Results**:
- ✓ EWS endpoint responds
- ✓ Exchange version detected
- ✓ Capabilities: MailboxDiscovery, CalendarSync

**Azure AD Test**
1. Enter **Azure credentials**:
   - Tenant ID
   - Client ID
   - Client Secret
2. Click **"Test Azure AD"**

**Expected Results**:
- ✓ OAuth token acquired
- ✓ Microsoft Graph accessible
- ✓ Permissions validated
- ✓ Capabilities: CloudUserDiscovery, TeamsDiscovery

#### Comprehensive Environment Test

Tests all configured services in your migration environment.

**Setup**
1. Select **"Comprehensive Environment Test"**
2. Fill in ALL connection details:
   - Domain Controller (AD)
   - Exchange Server (if applicable)
   - Azure AD credentials (Tenant ID, Client ID, Secret)
   - Optionally: username/password for AD/Exchange

3. Click **"Run Environment Test"**

**What Happens**:
- All services tested in parallel
- Connectivity validated for each
- Response times measured
- Capabilities detected
- Recommendations generated

**Results Interpretation**:

![Environment Test Results](images/env-test-results.png)

**Overall Status**:
- 🟢 **All Tests Passed**: Ready for migration
- 🟡 **Some Tests Failed**: Review failures before proceeding
- 🔴 **All Tests Failed**: Check network/credentials

**Individual Test Results**:
Each service shows:
- Service Type (ActiveDirectory, Exchange, Azure AD)
- Status (✓ Available / ✗ Unavailable)
- Response Time (milliseconds)
- Error details (if failed)

**Detected Capabilities**:
Lists what your environment supports:
- ActiveDirectory
- UserDiscovery
- GroupDiscovery
- MailboxDiscovery
- CloudUserDiscovery
- TeamsDiscovery
- etc.

**Recommendations**:
Actionable suggestions:
- "Enable MFA for enhanced security"
- "Archive old mailboxes before migration"
- "Update Exchange to latest CU"

### Saving Test Results

Test results are automatically saved to:
```
C:\DiscoveryData\{Profile}\Logs\ConnectionTests\
└── test-{timestamp}.json
```

You can review past tests from the **Logs** menu.

---

## PowerShell Module Discovery

Automatically discover and execute PowerShell scripts from your scripts directory.

### Opening Module Discovery

1. Go to **Tools** → **Module Discovery**
2. Module Discovery dialog opens
3. Automatic scan runs (or click **"Refresh"**)

### Understanding Discovered Modules

**Module Information**:
- **Name**: Script filename (e.g., `Get-UserInventory.ps1`)
- **Category**: Discovery, Migration, Utilities, etc.
- **Description**: What the script does
- **Parameters**: Required and optional parameters
- **Dependencies**: Required PowerShell modules
- **Version**: Script version (if specified)
- **Author**: Script author (if specified)

**Viewing Module Details**:
Click on a module to expand and see:
- Full description
- Parameter details (name, type, required, default value)
- Dependencies
- Usage examples

### Searching and Filtering

**Search Bar**:
- Type keywords (e.g., "user", "migration", "mailbox")
- Searches name and description
- Updates results in real-time

**Category Filter**:
- Select from dropdown (Discovery, Migration, etc.)
- Shows only modules in that category
- Combine with search for precise filtering

### Executing a Module

#### Step 1: Select Module
1. Browse or search for the module
2. Click **"Execute"** button
3. Module Execution dialog opens

#### Step 2: Fill Parameters

The dialog shows all module parameters:

**Parameter Types**:
- **String**: Text input
- **Int**: Number input
- **Boolean/Switch**: Checkbox
- **Array**: Multi-line text (one value per line)

**Required Parameters** (marked with *):
- Must be filled before execution
- Execute button disabled until filled

**Optional Parameters**:
- Can be left empty
- Default values shown in placeholder

**Example Parameters**:
```
DomainController* (string): dc01.contoso.com
OutputPath* (string): C:\Temp\output.csv
IncludeDisabled (switch): ☐
MaxResults (int): 1000
```

#### Step 3: Execute

1. Click **"Execute Module"**
2. Progress indicator shows
3. **Real-time output** streams in the dialog:
   ```
   [INFO] Starting user inventory...
   [INFO] Connecting to DC: dc01.contoso.com
   [INFO] Querying Active Directory...
   [INFO] Found 1,247 users
   [INFO] Exporting to CSV...
   [SUCCESS] Export complete: C:\Temp\output.csv
   ```

#### Step 4: Review Results

**Success**:
- ✓ Green success indicator
- Output file location shown
- Open file link available

**Failure**:
- ✗ Red error indicator
- Error message displayed
- Stack trace (if available)
- Retry button enabled

### Module Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Discovery** | Inventory AD objects | Get-UserInventory, Get-GroupMembership |
| **Migration** | Execute migrations | Start-UserMigration, Sync-Mailboxes |
| **Validation** | Pre/post-migration checks | Test-UserMigration, Validate-Permissions |
| **Reporting** | Generate reports | Export-MigrationReport, Get-Statistics |
| **Utilities** | Helper scripts | Convert-Data, Backup-Configuration |

---

## Migration Planning

Plan and organize migrations using wave-based scheduling.

### What is Wave-Based Migration?

Instead of migrating everyone at once, you migrate in **waves**:
- **Wave 1**: Pilot group (e.g., IT team)
- **Wave 2**: Early adopters (e.g., executives)
- **Wave 3**: Department 1 (e.g., Finance)
- **Wave 4**: Department 2 (e.g., Sales)
- etc.

**Benefits**:
- Reduced risk
- Easier troubleshooting
- Better resource management
- User training opportunities

### Creating a Migration Plan

#### Step 1: Open Migration Planning

1. Go to **Migration** → **Planning**
2. Migration Planning dialog opens
3. View existing plans or create new

#### Step 2: Create Plan

1. Click **"Create New Plan"**
2. Fill in plan details:

**Plan Name**: Descriptive name
```
Example: "Q1 2024 Migration"
```

**Description**: Migration objectives
```
Example: "Migrate all users from on-prem AD to Azure AD.
Focus on Finance and Sales departments first."
```

3. Click **"Create Plan"**

#### Step 3: Add Waves

1. In the new plan, click **"Add Wave"**
2. Configure wave:

**Wave Name**:
```
Example: "Wave 1 - IT Pilot"
```

**Description**:
```
Example: "IT department pilot migration to validate process"
```

**Start Date**: When wave begins
```
Example: 2024-03-01
```

**End Date**: Wave completion deadline
```
Example: 2024-03-07
```

**Priority**: Execution order (1 = highest)
```
Example: 1
```

**Dependencies** (Optional):
- Select other waves that must complete first
- Example: Wave 3 depends on Wave 2

3. Click **"Create Wave"**

#### Step 4: Assign Users

1. Select a wave
2. Click **"Assign Users"**
3. User Assignment dialog opens

**Search and Filter**:
- Search by name, email, or department
- Filter by department
- Shows user details (department, title, etc.)

**Select Users**:
- Check boxes next to users
- Or click **"Select All Visible"**
- Shows count of selected users

**Assign**:
- Click **"Assign {N} Users"**
- Users added to wave
- Cannot assign to multiple waves (prevents conflicts)

### Managing Migration Waves

#### Viewing Wave Status

Each wave shows:
- **Name** and **Description**
- **Status Badge**: Planned, In Progress, Completed, Failed
- **Dates**: Start and end dates
- **User Count**: Number of assigned users
- **Dependencies**: Blocking waves

#### Starting a Wave

1. Select wave
2. Click **"Start Wave"**
3. Status changes to "In Progress"
4. Dependent waves remain blocked until completion

#### Completing a Wave

1. After migration tasks complete
2. Click **"Complete Wave"**
3. Status changes to "Completed"
4. Dependent waves now unblocked

#### Wave Timeline View

Visual timeline shows:
- All waves with their date ranges
- Current progress
- Dependencies (arrows between waves)
- Overlapping waves (if any)

### Best Practices for Wave Planning

**1. Start Small**
- Wave 1: 5-10 users (IT team)
- Validate process before scaling

**2. Group by Department**
- Easier communication
- Similar roles/requirements
- Common training

**3. Set Realistic Timelines**
- Allow buffer time
- Consider weekends/holidays
- Plan for issues

**4. Document Lessons Learned**
- After each wave, note issues
- Update process for next wave
- Share with team

**5. User Communication**
- Notify users before their wave
- Provide training resources
- Set expectations

---

## Data Export & Import

Export discovered data to external formats or import data from other sources.

### Export Data

#### Supported Formats
- **CSV**: Excel-compatible, easy to edit
- **JSON**: Full object structure, programmable
- **XLSX**: Native Excel format (coming soon)

#### Exporting Users

1. Navigate to **Users View**
2. Click **"Export"** button
3. Export dialog opens

**Step 1: Select Mode**
- Choose **"Export Data"** (default)

**Step 2: Select Format**
- ⦿ CSV (recommended for Excel)
- ○ JSON (recommended for programming)

**Step 3: Enter Filename**
```
Example: users-export-2024-03-15
```
(File extension added automatically)

**Step 4: Select Fields**

Click fields to export:
- ☑ displayName
- ☑ userPrincipalName
- ☑ mail
- ☑ department
- ☑ jobTitle
- ☑ enabled
- ☐ passwordExpired (uncheck unwanted fields)

**Pro Tip**: Leave all unchecked to export ALL fields

**Step 5: Export Options**
- ☑ **Include column headers** (recommended)
- ☐ **Include metadata** (adds export info at top)

**Step 6: Export**
1. Click **"Export Data"**
2. Choose save location
3. Wait for progress
4. Success notification shows record count and path

**Result**:
```csv
displayName,userPrincipalName,mail,department,jobTitle,enabled
John Doe,jdoe@contoso.com,john.doe@contoso.com,Finance,Manager,True
Jane Smith,jsmith@contoso.com,jane.smith@contoso.com,IT,Director,True
...
```

#### Exporting Groups

1. Navigate to **Groups View**
2. Click **"Export"**
3. Select format and fields
4. Follow same steps as user export

**Common Group Fields**:
- name
- displayName
- groupType (Security, Distribution)
- scope (Global, Universal, DomainLocal)
- memberCount

#### Exporting Computers

1. Navigate to **Computers View**
2. Click **"Export"**
3. Select format and fields

**Common Computer Fields**:
- name
- dns
- domain
- os
- status
- lastLogon

### Import Data

#### Import CSV

1. Click **"Import"** button (in any view)
2. Select **"Import Data"** mode
3. Select format: **CSV**
4. Click **"Import Data"**
5. Choose file from dialog
6. Wait for processing

**Import Validation**:
- Headers validated
- Data types checked
- Duplicate detection
- Required fields verified

**Import Results**:
```
✓ Successfully imported 150 records

⚠ Warnings (3):
- Row 15: Missing email address
- Row 28: Invalid date format
- Row 42: Duplicate userPrincipalName

✗ Errors (1):
- Row 7: Required field 'displayName' is empty
```

**Handling Errors**:
- Errors prevent import of that record
- Warnings allow import but flag issues
- Download error report for detailed review

#### Import JSON

1. Select format: **JSON**
2. Choose JSON file
3. JSON structure validated
4. Records imported

**Expected JSON Structure**:
```json
{
  "metadata": {
    "exportDate": "2024-03-15T10:30:00Z",
    "source": "ContosoAD",
    "recordCount": 150
  },
  "records": [
    {
      "displayName": "John Doe",
      "userPrincipalName": "jdoe@contoso.com",
      "mail": "john.doe@contoso.com",
      ...
    },
    ...
  ]
}
```

### Data Export Best Practices

**1. Regular Backups**
- Export data before major changes
- Store in version control or backup location
- Include timestamp in filename

**2. Selective Exports**
- Export only needed fields
- Reduces file size
- Faster processing
- Easier to review

**3. Validate After Import**
- Review warnings
- Fix errors manually
- Re-import corrected data

**4. Use Metadata**
- Helps track export source
- Documents export date
- Useful for auditing

---

## Error Monitoring

Monitor application errors and logs in real-time.

### Opening Error Dashboard

1. Go to **Tools** → **Error Dashboard**
2. Error Dashboard view opens

### Error Dashboard Tabs

#### Tab 1: Error Reports

**Overview**:
- Lists all error reports
- Filter by resolved/unresolved
- Shows error details and context

**Error Report Details**:
- **Timestamp**: When error occurred
- **Error Type**: Exception type (e.g., ConnectionError)
- **Message**: Error description
- **Context**: Additional information
  - User ID (if applicable)
  - Module name
  - Operation type
- **Stack Trace**: Technical details for debugging

**Resolving Errors**:
1. Select an unresolved error
2. Click **"Resolve"**
3. Enter resolution notes:
   ```
   Example: "Fixed by updating Azure credentials.
            Issue was expired client secret."
   ```
4. Click **"Mark as Resolved"**
5. Error moved to resolved list

**Unresolved Error Count**:
- Badge shows count: `🔴 5 Unresolved Errors`
- Click badge to filter unresolved
- Track error reduction over time

#### Tab 2: System Logs

**Overview**:
- Real-time log stream
- All application events
- Categorized by level and source

**Log Levels**:
| Level | Color | Description |
|-------|-------|-------------|
| DEBUG | Gray | Detailed diagnostic info |
| INFO | Blue | General informational messages |
| WARN | Yellow | Warning messages |
| ERROR | Red | Error messages |
| FATAL | Dark Red | Critical errors |

**Filtering Logs**:

**By Level**:
- Dropdown: All Levels, Debug, Info, Warn, Error, Fatal
- Shows only selected level

**By Category**:
- Categories: PowerShell, IPC, FileSystem, Network, etc.
- Filter to specific subsystem

**Example Filtered View**:
```
Filter: Level = ERROR, Category = PowerShell

[2024-03-15 10:30:15] ERROR PowerShell Script execution failed: Get-UserInventory.ps1
[2024-03-15 10:28:42] ERROR PowerShell Module not found: Microsoft.Graph
```

**Log Table Columns**:
- **Time**: Timestamp (HH:MM:SS)
- **Level**: Color-coded badge
- **Category**: Event source
- **Message**: Log message
- **Context**: Expandable details (click to show)

**Clearing Logs**:
1. Click **"Clear Logs"** button
2. Confirms action
3. Clears in-memory logs (not persisted logs)

### Error Monitoring Features

**Real-Time Updates**:
- New errors appear immediately
- Unresolved count updates live
- Log table auto-scrolls (optionally disable)

**Persistent Logs**:
- Daily log files at: `C:\DiscoveryData\Logs\`
- Rotated at midnight
- Kept for 30 days (configurable)

**Error Reports Storage**:
- Saved to: `C:\DiscoveryData\ErrorReports\`
- JSON format for programmatic access
- Includes full context and stack trace

---

## Best Practices

### Security

**1. Protect Credentials**
- Never share client secrets
- Rotate secrets regularly (before expiration)
- Use service accounts (not personal accounts)
- Enable MFA where possible

**2. DPAPI Limitations**
- Encrypted credentials work only on same machine/user
- Plan for migration to new workstation
- Document credential re-entry process

**3. Least Privilege**
- Use minimum required permissions
- Don't use Global Admin for daily operations
- Create separate app registrations for different tasks

### Performance

**1. Large Datasets**
- Export to CSV for datasets > 10,000 records
- Use filters to reduce data volume
- Schedule heavy operations for off-hours

**2. PowerShell Execution**
- Limit concurrent executions (max 10)
- Monitor memory usage
- Close unused PowerShell sessions

**3. Connection Testing**
- Test during low-traffic periods
- Cache results to avoid repeated tests
- Use individual tests vs. comprehensive for quicker validation

### Data Management

**1. Regular Backups**
- Export critical data weekly
- Version control migration plans
- Backup before major changes

**2. Data Validation**
- Review exported data before external use
- Validate imports before committing
- Cross-check user counts

**3. Documentation**
- Document custom configurations
- Note lessons learned from each wave
- Update procedures based on experience

---

## Troubleshooting

### Common Issues

#### Issue: "Module not found" during App Registration

**Symptoms**:
- PowerShell script fails
- Error: "Microsoft.Graph module not found"

**Solution**:
1. Check PowerShell execution policy:
   ```powershell
   Get-ExecutionPolicy
   ```
2. If "Restricted", change to "RemoteSigned":
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Enable "Auto Install Modules" in App Registration dialog
4. Or manually install:
   ```powershell
   Install-Module Microsoft.Graph -Force
   Install-Module Az.Accounts -Force
   ```

#### Issue: Connection Test Fails for Azure AD

**Symptoms**:
- Azure AD test shows "✗ Unavailable"
- Error: "Unauthorized"

**Solution**:
1. Verify Tenant ID is correct (from Azure Portal)
2. Verify Client ID matches App Registration
3. Verify Client Secret hasn't expired
4. Check App Registration permissions:
   - Go to Azure Portal → App Registrations
   - Select your app
   - Check API Permissions granted
   - Click "Grant admin consent"

#### Issue: Cannot Decrypt Client Secret

**Symptoms**:
- Error: "Failed to decrypt credential"
- Target profile shows "[encrypted:...]" but can't use

**Solution**:
- DPAPI encryption is user/machine specific
- Can only decrypt on same machine with same user
- **Workaround**: Re-enter client secret manually
  1. Edit target profile
  2. Enter new client secret
  3. Save (will re-encrypt for current user)

#### Issue: Module Discovery Finds No Modules

**Symptoms**:
- Module count: 0
- "No modules found"

**Solution**:
1. Check `SCRIPTS_ROOT` environment variable:
   ```powershell
   $env:SCRIPTS_ROOT
   ```
2. If empty, set it:
   ```powershell
   $env:SCRIPTS_ROOT = "D:\Scripts"
   ```
3. Verify directory contains `.ps1` files
4. Check file permissions (read access required)
5. Click **"Refresh"** in Module Discovery dialog

#### Issue: Export Fails with "Access Denied"

**Symptoms**:
- Export button disabled
- Error: "Access denied to target location"

**Solution**:
1. Check write permissions on target folder
2. Try saving to different location (e.g., Desktop)
3. Run application as Administrator (if required)
4. Check disk space availability

#### Issue: Migration Plan Won't Save

**Symptoms**:
- "Save" button does nothing
- No error message

**Solution**:
1. Check all required fields filled:
   - Plan name (cannot be empty)
   - Wave dates (end > start)
2. Ensure no special characters in plan name
3. Check `config/migration-plans/` folder permissions
4. Review Error Dashboard for details

### Getting Help

**Documentation**:
- Architecture: `PROFILE_ARCHITECTURE_DOCUMENTATION.md`
- Integration Testing: `INTEGRATION_TESTING_GUIDE.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`

**Logs**:
- Application Logs: `C:\DiscoveryData\Logs\`
- Error Reports: `C:\DiscoveryData\ErrorReports\`
- PowerShell Logs: `C:\DiscoveryData\{Profile}\Logs\`

**Support**:
- Error Dashboard: Real-time error monitoring
- Log files: Detailed diagnostic information
- Stack traces: For technical support

---

## Appendix

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Migration Plan |
| `Ctrl+E` | Export Data |
| `Ctrl+T` | Test Connections |
| `Ctrl+R` | Refresh Current View |
| `Ctrl+F` | Find/Search |
| `F5` | Reload Profile Data |
| `Ctrl+Q` | Quit Application |

### File Locations

| Type | Location |
|------|----------|
| Source Profiles | `C:\DiscoveryData\{Company}\` |
| Target Profiles | `config/profiles/targets/` |
| Migration Plans | `config/migration-plans/` |
| App Credentials | `C:\DiscoveryData\{Company}\AppReg\` |
| Application Logs | `C:\DiscoveryData\Logs\` |
| Error Reports | `C:\DiscoveryData\ErrorReports\` |
| Connection Test Results | `C:\DiscoveryData\{Profile}\Logs\ConnectionTests\` |

### Glossary

| Term | Definition |
|------|------------|
| **Source Profile** | On-premises Active Directory environment |
| **Target Profile** | Cloud destination (Azure AD) |
| **App Registration** | Azure AD application for API access |
| **Wave** | Group of users migrated together |
| **T-000** | Comprehensive environment testing pattern |
| **DPAPI** | Windows Data Protection API for encryption |
| **IPC** | Inter-Process Communication (between UI and backend) |

---

## Quick Reference Card

### 5-Minute Setup
1. ✓ Launch UserMandA
2. ✓ Select source profile
3. ✓ Setup Azure App Registration
4. ✓ Verify target profile created
5. ✓ Test connections (T-000)
6. ✓ Ready to plan migration!

### Pre-Migration Checklist
- [ ] Source profile selected
- [ ] Azure app registered
- [ ] Target profile created
- [ ] Connection testing passed (T-000)
- [ ] Migration plan created
- [ ] Waves defined
- [ ] Users assigned to waves
- [ ] Communication plan ready
- [ ] Rollback plan documented

### Post-Migration Checklist
- [ ] Users can access Azure AD
- [ ] Mailboxes syncing correctly
- [ ] Teams/SharePoint accessible
- [ ] Permissions verified
- [ ] User training completed
- [ ] Wave marked as "Completed"
- [ ] Lessons learned documented

---

**Version**: 2.0
**Last Updated**: 2024-03-15
**For Support**: See Error Dashboard and log files

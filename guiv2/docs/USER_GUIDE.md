# M&A Discovery Suite GUI v2 - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Application Overview](#application-overview)
4. [Discovery Operations](#discovery-operations)
5. [User Management](#user-management)
6. [Migration Planning](#migration-planning)
7. [Reporting & Analytics](#reporting--analytics)
8. [Settings & Configuration](#settings--configuration)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

## Introduction

The M&A Discovery Suite GUI v2 is a comprehensive tool for managing mergers and acquisitions, providing discovery, user management, migration planning, and reporting capabilities.

### Key Capabilities

- Discover users, groups, and resources across Microsoft 365, Exchange, SharePoint, Teams, and OneDrive
- Plan and execute multi-wave tenant migrations
- Generate executive dashboards and custom reports
- Map resources between source and target tenants
- Monitor migration progress in real-time

## Getting Started

### First Launch

1. Launch the application from the Start Menu or desktop shortcut
2. The application will detect your environment and validate PowerShell modules
3. Configure your source and target profiles in the Settings dialog

### Creating Profiles

Profiles store connection information for source and target tenants.

**To create a new profile:**

1. Click the "Create Profile" button in the sidebar
2. Enter the profile name and connection details:
   - Tenant ID
   - Domain name
   - Connection type (Microsoft 365, Exchange, SharePoint, etc.)
3. Click "Test Connection" to validate
4. Click "Save" to create the profile

**To edit an existing profile:**

1. Select the profile from the dropdown
2. Click "Edit Profile"
3. Update the connection details
4. Click "Save"

**To delete a profile:**

1. Select the profile from the dropdown
2. Click "Delete Profile"
3. Confirm the deletion

### Testing Connections

Before running discovery operations, test your profile connections:

1. Select a profile from the dropdown
2. Click "Test Connection"
3. Wait for the validation to complete
4. Green status indicates success, red indicates failure

## Application Overview

### Main Window

The main window consists of:

- **Sidebar** (left): Navigation, profile selection, and system status
- **Tab Area** (top): Open tabs for different views
- **Content Area** (center): Current view content
- **Status Bar** (bottom): Real-time status updates

### Navigation

The sidebar provides access to all major features:

- **Overview**: Dashboard and quick actions
- **Discovery**: Discovery operations menu
  - Domain Discovery
  - Active Directory
  - Exchange
  - SharePoint
  - Teams
  - OneDrive
  - Applications
- **Users**: User management and filtering
- **Groups**: Group management
- **Migration**: Migration planning and execution
  - Projects
  - Waves
  - Resource Mapping
  - Validation
  - Execution
- **Reports**: Reporting and analytics
  - Executive Dashboard
  - User Analytics
  - Migration Reports
  - Cost Analysis
  - Custom Reports
- **Settings**: Application configuration

### Tabs

The application uses a tabbed interface for multitasking:

- Click a navigation item to open a new tab
- Click the "X" button to close a tab
- Drag tabs to reorder them
- Right-click a tab for additional options

## Discovery Operations

### Domain Discovery

Discover all domains and subdomains in a network.

**To run domain discovery:**

1. Navigate to Discovery > Domain Discovery
2. Enter the network range or domain name
3. Set discovery options:
   - Timeout (seconds)
   - Include subdomains
   - DNS resolution
4. Click "Start Discovery"
5. Monitor progress in real-time
6. Review discovered domains in the results grid

**Exporting results:**

1. Select rows to export (or leave unselected for all)
2. Click "Export"
3. Choose format (CSV, Excel, JSON)
4. Select destination folder
5. Click "Export"

### Active Directory Discovery

Discover users, groups, and organizational units from Active Directory.

**To run AD discovery:**

1. Navigate to Discovery > Active Directory
2. Select source profile
3. Configure discovery scope:
   - Entire forest
   - Specific domain
   - Organizational unit
4. Set filters:
   - User types (enabled, disabled, mailbox users)
   - Group types (security, distribution)
   - Custom LDAP filters
5. Click "Start Discovery"
6. Review results in the data grid

**Advanced filtering:**

- Use the search bar for quick filtering
- Click "Filter" to open the advanced filter panel
- Apply multiple filters simultaneously
- Save filter presets for reuse

### Exchange Discovery

Discover mailboxes, distribution groups, and resources.

**To run Exchange discovery:**

1. Navigate to Discovery > Exchange
2. Select source profile
3. Choose discovery types:
   - User mailboxes
   - Shared mailboxes
   - Room mailboxes
   - Equipment mailboxes
   - Distribution groups
4. Set mailbox size thresholds (optional)
5. Click "Start Discovery"
6. View mailbox sizes, permissions, and settings

### SharePoint Discovery

Discover SharePoint sites, document libraries, and permissions.

**To run SharePoint discovery:**

1. Navigate to Discovery > SharePoint
2. Select source profile
3. Choose discovery scope:
   - All sites
   - Specific site collections
   - Hub sites only
4. Select data to discover:
   - Sites
   - Document libraries
   - Lists
   - Permissions
   - External sharing
5. Click "Start Discovery"
6. Review site structure and permissions

### Teams Discovery

Discover Microsoft Teams, channels, and members.

**To run Teams discovery:**

1. Navigate to Discovery > Teams
2. Select source profile
3. Choose discovery options:
   - Public teams
   - Private teams
   - Team channels
   - Members and owners
   - Guest users
4. Click "Start Discovery"
5. View team structures and membership

### OneDrive Discovery

Discover OneDrive sites and usage.

**To run OneDrive discovery:**

1. Navigate to Discovery > OneDrive
2. Select source profile
3. Set discovery options:
   - Include usage statistics
   - Include sharing links
   - Size thresholds
4. Click "Start Discovery"
5. Review OneDrive sites and storage usage

## User Management

### Viewing Users

The Users view displays all discovered users with advanced filtering and sorting.

**Data grid features:**

- **Virtual scrolling**: Handles 100,000+ users smoothly
- **Column sorting**: Click column headers to sort
- **Column resizing**: Drag column borders to resize
- **Column reordering**: Drag columns to reorder
- **Column visibility**: Click "Columns" to show/hide columns

### Filtering Users

**Quick search:**

1. Type in the search bar
2. Results filter in real-time
3. Search across all visible columns

**Advanced filtering:**

1. Click "Filter" button
2. Add filter conditions:
   - Field selection
   - Operator (equals, contains, greater than, etc.)
   - Value
3. Combine multiple filters with AND/OR logic
4. Click "Apply Filters"

### Exporting Users

1. Select users to export (or leave unselected for all)
2. Click "Export"
3. Choose format:
   - CSV: Comma-separated values
   - Excel: Excel workbook with formatting
   - JSON: JSON array
   - PDF: Formatted PDF table
4. Click "Export"

### Bulk Operations

Perform operations on multiple users:

1. Select users using checkboxes or Ctrl+Click
2. Click "Bulk Operations"
3. Choose operation:
   - Assign licenses
   - Update attributes
   - Move to migration wave
   - Export selected
4. Configure operation settings
5. Click "Execute"

## Migration Planning

### Creating Migration Projects

Migration projects organize migration waves and track progress.

**To create a project:**

1. Navigate to Migration > Projects
2. Click "Create Project"
3. Enter project details:
   - Name
   - Description
   - Source tenant
   - Target tenant
   - Start date
   - End date
4. Click "Create"

### Planning Migration Waves

Migration waves group users and resources for coordinated migration.

**To create a wave:**

1. Navigate to Migration > Waves
2. Select a project
3. Click "Create Wave"
4. Enter wave details:
   - Name
   - Sequence number
   - Scheduled date
   - Dependencies (other waves that must complete first)
5. Assign users to the wave
6. Click "Save"

**Wave dependencies:**

- Waves can depend on other waves completing first
- The system validates dependencies before execution
- Circular dependencies are detected and prevented

### Resource Mapping

Map source resources to target equivalents.

**To map resources:**

1. Navigate to Migration > Resource Mapping
2. Select a migration wave
3. View unmapped resources
4. For each resource:
   - Select the source resource
   - Choose the target resource
   - Review conflicts (if any)
   - Apply mapping
5. Click "Save All Mappings"

**Conflict resolution:**

- The system detects conflicts automatically
- Red indicators show conflict severity
- Click a conflict to view resolution options
- Apply recommended resolutions or create custom mappings

### Migration Validation

Validate migration readiness before execution.

**To run validation:**

1. Navigate to Migration > Validation
2. Select a migration wave
3. Click "Run Validation"
4. Review validation results:
   - Prerequisites check
   - Resource conflicts
   - Permission verification
   - Capacity validation
5. Address any errors or warnings
6. Re-run validation until all checks pass

### Migration Execution

Execute migration after validation passes.

**To execute migration:**

1. Navigate to Migration > Execution
2. Select a validated migration wave
3. Choose execution mode:
   - Dry run (simulation)
   - Full migration
4. Review execution plan
5. Click "Execute"
6. Monitor progress in real-time
7. View logs and error messages

**Rollback:**

If migration fails, you can roll back changes:

1. Click "Rollback" button
2. Review rollback plan
3. Confirm rollback
4. Monitor rollback progress

## Reporting & Analytics

### Executive Dashboard

The Executive Dashboard provides high-level KPIs and trends.

**Key metrics:**

- Total users discovered
- Migration progress
- Resource utilization
- Cost estimates
- Timeline status

**Charts:**

- User distribution by department
- Migration wave progress
- Mailbox size distribution
- License allocation
- Monthly trends

### User Analytics

Analyze user data with advanced visualizations.

**Available analytics:**

- User distribution by location, department, license
- Inactive user detection
- Mailbox size analysis
- External sharing analysis
- Guest user analysis

**Filters:**

- Date range
- Department
- Location
- User type
- License type

### Migration Reports

Track migration progress and issues.

**Available reports:**

- Migration wave status
- User migration status
- Resource migration status
- Error and warning summary
- Timeline tracking

**Exporting reports:**

1. Configure report parameters
2. Click "Export Report"
3. Choose format (PDF, Excel, CSV)
4. Select destination
5. Click "Export"

### Cost Analysis

Estimate migration costs and resource usage.

**Cost components:**

- License costs
- Storage costs
- Bandwidth costs
- Labor costs
- Third-party service costs

**Scenarios:**

- Create cost scenarios
- Compare scenarios
- Adjust assumptions
- Export cost estimates

### Custom Report Builder

Build custom reports with drag-and-drop.

**To build a custom report:**

1. Navigate to Reports > Custom Reports
2. Click "Create Report"
3. Drag fields to the report canvas:
   - Columns
   - Grouping
   - Filters
   - Calculations
4. Configure formatting
5. Preview the report
6. Save as template
7. Export or schedule

### Scheduled Reports

Schedule reports to run automatically.

**To schedule a report:**

1. Navigate to Reports > Scheduled Reports
2. Click "Create Schedule"
3. Select report template
4. Configure schedule:
   - Frequency (daily, weekly, monthly)
   - Time
   - Recipients
   - Format
5. Click "Save Schedule"

## Settings & Configuration

### Application Settings

Configure application behavior and appearance.

**General settings:**

- Theme (light/dark/auto)
- Language
- Date/time format
- Number format
- Timezone

**Performance settings:**

- Data grid page size
- Cache size
- Session timeout
- Auto-refresh interval

**Notification settings:**

- Enable/disable notifications
- Notification sound
- Notification position
- Auto-dismiss timeout

### PowerShell Settings

Configure PowerShell execution.

**Settings:**

- PowerShell executable path
- Execution policy
- Module paths
- Session timeout
- Max concurrent sessions
- Script library path

### Logging Settings

Configure logging behavior.

**Settings:**

- Log level (debug, info, warn, error)
- Log file location
- Max log file size
- Log rotation
- Enable verbose logging

## Keyboard Shortcuts

### Global Shortcuts

- `Ctrl+N`: New tab
- `Ctrl+W`: Close tab
- `Ctrl+Tab`: Next tab
- `Ctrl+Shift+Tab`: Previous tab
- `Ctrl+S`: Save current view
- `Ctrl+R`: Refresh current view
- `Ctrl+F`: Focus search bar
- `Ctrl+P`: Open command palette
- `Ctrl+,`: Open settings
- `F5`: Refresh data
- `F11`: Toggle fullscreen
- `Ctrl+Q`: Quit application

### Data Grid Shortcuts

- `Ctrl+A`: Select all rows
- `Ctrl+C`: Copy selected rows
- `Ctrl+E`: Export selected rows
- `Delete`: Delete selected rows
- `Arrow keys`: Navigate cells
- `Space`: Toggle row selection
- `Page Up/Down`: Scroll page

### Command Palette

Press `Ctrl+P` to open the command palette:

- Quick navigation to any view
- Execute common actions
- Search application features
- Recent commands

## Troubleshooting

### Common Issues

**Issue: Discovery fails with "Access Denied"**

Solution:
1. Verify profile credentials
2. Test connection
3. Check PowerShell module permissions
4. Run application as administrator (if needed)

**Issue: Application is slow with large datasets**

Solution:
1. Enable pagination in settings
2. Reduce data grid page size
3. Clear cache
4. Close unused tabs
5. Restart application

**Issue: Export fails**

Solution:
1. Check disk space
2. Verify write permissions to destination folder
3. Close the destination file if it's open
4. Try a different export format

**Issue: Migration validation fails**

Solution:
1. Review validation errors in detail
2. Check resource mappings
3. Verify target tenant capacity
4. Ensure prerequisites are met
5. Contact support if issues persist

### Logs

Access logs for troubleshooting:

1. Navigate to Settings > Logging
2. Click "Open Log Folder"
3. Review recent log files
4. Filter by log level (error, warn, info, debug)

### Support

For additional support:

- Email: support@example.com
- Documentation: D:/Scripts/UserMandA/guiv2/docs/
- Issue tracker: GitHub repository

## FAQ

**Q: What PowerShell modules are required?**

A: The application requires:
- Microsoft 365 modules (AzureAD, ExchangeOnline, SharePointOnline, Teams)
- Custom modules in the Modules/ directory

**Q: Can I run multiple discoveries simultaneously?**

A: Yes, the application supports parallel discovery operations using PowerShell session pooling.

**Q: How is sensitive data protected?**

A: Credentials are encrypted using Windows DPAPI. Sensitive data is never logged in plain text.

**Q: Can I customize the data grid columns?**

A: Yes, click the "Columns" button to show/hide columns. You can also resize and reorder columns by dragging.

**Q: How do I update the application?**

A: Updates are distributed as new installers. Download and run the installer to upgrade.

**Q: What happens if migration fails mid-wave?**

A: The application supports rollback to the pre-migration state. Review error logs, fix issues, and retry or rollback.

**Q: Can I import data from the old C# application?**

A: Yes, see the [Migration Guide](MIGRATION_GUIDE.md) for details on importing data and settings.

**Q: How much data can the application handle?**

A: The application is tested with 100,000+ users and maintains 60 FPS rendering performance.

**Q: Is there an API for automation?**

A: Yes, the application exposes IPC APIs for automation. See [API Reference](API_REFERENCE.md).

---

For more information, see:
- [Developer Guide](DEVELOPER_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [Architecture](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)

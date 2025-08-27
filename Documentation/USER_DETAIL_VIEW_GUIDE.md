# UserDetailView - User Guide

## Overview

The UserDetailView provides a comprehensive, single-pane-of-glass interface for viewing detailed user information and associated assets within the M&A Discovery Suite. This feature enables IT administrators and migration specialists to quickly understand all aspects of a user's digital footprint across the enterprise.

## Purpose

The UserDetailView addresses the critical need for complete user visibility during M&A integration planning by consolidating information from multiple discovery sources into a unified, actionable interface.

## Key Features

### 9-Tab Comprehensive View
- **Overview:** Resource and service summary with key metrics
- **Devices:** All computers and devices associated with the user
- **Apps:** Applications installed on user's devices
- **Groups:** Security and distribution groups memberships
- **GPOs:** Group Policy Objects affecting the user
- **File Access:** File shares and permissions granted to the user
- **Mailbox:** Exchange mailbox information and statistics
- **Azure Roles:** Cloud role assignments and permissions
- **SQL & Risks:** Database ownership and identified risk factors

### Action Capabilities
- **Add to Migration Wave:** Queue user for batch migration processing
- **Export Snapshot:** Export complete user profile for external analysis
- **Real-time Refresh:** Update data from latest discovery results
- **Cross-tab Navigation:** Seamlessly navigate between related information

## Access Methods

### From Users Grid
1. Navigate to the Users tab in the main application
2. Locate the desired user in the grid
3. Click the "Details" button in the user's row
4. The UserDetailView opens in a new window

### From Search Results
1. Use the global search functionality to find a specific user
2. Click "View Details" from the search results
3. The UserDetailView opens with the selected user's information

## Interface Layout

### Header Section
- **User Name:** Primary display name from Active Directory
- **Subtitle:** Descriptive text about the comprehensive view
- **Action Buttons:** Refresh, Add to Wave, Export, and Close controls

### User Summary Card
A prominent card displaying essential user information across three columns:

#### Column 1: User Information
- Display Name
- User Principal Name (UPN)
- Email Address

#### Column 2: Organization
- Department
- Job Title
- Manager (when available)

#### Column 3: Account Status
- Enabled/Disabled status
- Account creation date
- Last sign-in time (when available)

### Tab Navigation
Nine specialized tabs providing detailed information about different aspects of the user's digital presence:

## Tab Details

### 1. Overview Tab
**Purpose:** Quick summary of user's digital footprint

**Content:**
- Resource counts (groups, devices, applications, file access entries)
- Service counts (mapped drives, Azure roles, SQL databases, risk items)
- High-level metrics for rapid assessment

**Use Cases:**
- Initial user assessment
- Migration complexity evaluation
- Resource dependency overview

### 2. Devices Tab
**Purpose:** All computing devices associated with the user

**Content:**
- Device name and DNS name
- Operating system information
- Organizational Unit (OU) placement
- Primary user assignments

**Use Cases:**
- Hardware migration planning
- Device-specific application dependencies
- Asset inventory and tracking

### 3. Apps Tab
**Purpose:** Applications installed on user's devices

**Content:**
- Application names and sources
- Installation counts across devices
- Publisher information
- Version tracking (when available)

**Use Cases:**
- Software licensing requirements
- Application migration planning
- Compatibility assessment

### 4. Groups Tab
**Purpose:** Security and distribution group memberships

**Content:**
- Group names and types (Security, Distribution)
- Security Identifiers (SIDs)
- Member counts for reference

**Use Cases:**
- Permission inheritance analysis
- Group remapping for target environment
- Security model planning

### 5. GPOs Tab
**Purpose:** Group Policy Object relationships

**Content Split into two sections:**
- **GPO Links:** Policies applied through OU membership
- **GPO Security Filters:** Policies specifically targeting this user

**Content:**
- GPO names and GUIDs
- Enabled/disabled status
- WMI filter information

**Use Cases:**
- Policy migration requirements
- Configuration dependency analysis
- Compliance and security settings

### 6. File Access Tab
**Purpose:** File system permissions and share access

**Content:**
- File paths and UNC paths
- Assigned rights and permissions
- Inherited vs. explicit permissions
- Share vs. NTFS distinction

**Use Cases:**
- File server migration planning
- Permission re-creation requirements
- Data access continuity

### 7. Mailbox Tab
**Purpose:** Exchange mailbox information

**Content:**
- Mailbox GUID for Exchange operations
- Mailbox size in megabytes
- Mailbox type (User, Shared, Resource)
- Additional metadata when available

**Use Cases:**
- Exchange migration sizing
- Mailbox-specific requirements
- Storage capacity planning

### 8. Azure Roles Tab
**Purpose:** Cloud-based role assignments

**Content:**
- Role names and definitions
- Assignment scopes (subscription, resource group, resource)
- Principal Object IDs for tracking

**Use Cases:**
- Cloud permission recreation
- Azure tenant integration
- Role-based access control (RBAC) planning

### 9. SQL & Risks Tab
**Purpose:** Database ownership and risk assessment

**Content Split into two sections:**
- **SQL Databases:** Owned or accessed databases with server and instance information
- **Risk Assessment:** Identified issues, orphaned accounts, or security concerns

**Content:**
- Database server names and instances
- Application hints for business context
- Risk types, severity levels, and recommendations

**Use Cases:**
- Database migration dependencies
- Security risk mitigation
- Business continuity planning

## Action Commands

### Add to Migration Wave
**Purpose:** Queue the user for batch migration processing

**Process:**
1. Click "Add to Wave" button in header
2. System validates user data completeness
3. User is added to the current migration wave queue
4. Confirmation message displayed with wave assignment

**Notes:**
- Currently uses stub implementation for development
- Production version will integrate with full wave management system
- Dependencies are automatically analyzed and included

### Export Snapshot
**Purpose:** Generate comprehensive user profile export

**Process:**
1. Click "Export" button in header
2. System compiles all user data across all tabs
3. Export generated in JSON format with timestamp
4. File saved to user's Documents folder
5. Export path displayed in status message

**Export Content:**
- Complete user profile information
- All tab data with relationships
- Metadata including export timestamp and version
- Migration hints and risk assessments

### Refresh Data
**Purpose:** Update information from latest discovery data

**Process:**
1. Click "Refresh" button in header
2. System queries LogicEngineService for latest data
3. All tabs updated with current information
4. User summary card refreshed
5. Status message confirms successful refresh

**Notes:**
- Automatically triggered when user is first selected
- Can be manually triggered to get latest discovery results
- Preserves current tab selection after refresh

### Close View
**Purpose:** Close the UserDetailView window

**Process:**
1. Click "Close" button in header
2. Window closes and returns focus to parent window
3. No data is saved automatically (use Export if needed)

## Data Sources

### LogicEngineService Integration
The UserDetailView retrieves all information through the LogicEngineService, which consolidates data from multiple CSV discovery sources:

- **Active Directory:** User accounts, groups, organizational units
- **Device Discovery:** Computer inventory, installed applications
- **File System Analysis:** Share permissions, NTFS ACLs, mapped drives
- **Exchange Discovery:** Mailbox information, sizes, types
- **Azure Discovery:** Role assignments, cloud permissions
- **Group Policy Analysis:** GPO links, security filtering
- **SQL Discovery:** Database ownership, application hints
- **Risk Assessment:** Security analysis, orphaned accounts, policy violations

### Real-time Data Loading
- Data loads asynchronously to maintain UI responsiveness
- Loading indicators show progress for each data retrieval operation
- Error handling provides clear feedback for data access issues
- Background threading ensures main UI remains interactive

## Technical Architecture

### MVVM Implementation
- **UserDetailViewModel:** Business logic and data binding
- **UserDetailView:** XAML user interface definition
- **UserDetailWindow:** Container window for modal display
- Clean separation of concerns following MVVM patterns

### Service Dependencies
- **ILogicEngineService:** Primary data access interface
- **IMigrationWaveService:** Wave management operations (stub implementation)
- **IDataExportService:** Export functionality (stub implementation)
- **ILogger:** Structured logging and diagnostics

### Performance Optimizations
- Async data loading prevents UI blocking
- Observable collections for efficient data binding updates
- Resource management with proper disposal patterns
- Memory-efficient object lifecycle management

## Troubleshooting

### Common Issues

#### UserDetailView Won't Open
**Symptoms:** Details button click has no effect
**Solution:** 
- Verify LogicEngineService is loaded and operational
- Check application logs for service initialization errors
- Ensure user has valid SID or UPN identifier

#### Data Not Loading in Tabs
**Symptoms:** Tabs appear empty or show "Loading..." indefinitely
**Solution:**
- Check CSV data availability in discovery directory
- Verify LogicEngineService connectivity
- Review logs for data access permissions

#### Performance Issues
**Symptoms:** Slow loading or UI unresponsiveness
**Solution:**
- Monitor system memory and CPU usage
- Verify network connectivity to discovery data sources
- Check for large datasets that may need optimization

#### Export Function Errors
**Symptoms:** Export button generates errors or fails silently
**Solution:**
- Verify write permissions to Documents folder
- Check available disk space
- Ensure user profile data is completely loaded

### Log Analysis
The UserDetailView generates structured logs for debugging:

**Log Categories:**
- User selection and identification
- Data loading operations and timing
- Service integration success/failure
- Export and action command results

**Log Location:** `C:\enterprisediscovery\Logs\`

## Best Practices

### Performance Optimization
- Use the Export function for offline analysis of large user datasets
- Close UserDetailView windows when not actively needed
- Refresh data only when necessary to minimize server load

### Data Accuracy
- Always refresh data before making migration decisions
- Cross-reference information across multiple tabs for completeness
- Export snapshots for audit trails and compliance documentation

### Migration Planning
- Review all tabs before adding users to migration waves
- Pay special attention to risks and dependencies identified
- Use the overview tab for initial assessment and prioritization

## Integration Points

### Main Application Navigation
- Seamless integration with Users grid view
- Maintains parent window context and state
- Proper modal window management

### LogicEngineService Data Layer
- Real-time access to consolidated discovery data
- Efficient data projection for UI consumption
- Error handling and retry logic for reliability

### Migration Wave Management
- Integration with wave planning and execution systems
- Dependency analysis and conflict detection
- Batch processing optimization

## Future Enhancements

### Planned Features
- Real-time collaboration with multiple administrators
- Advanced filtering and search within tabs
- Customizable export formats (CSV, Excel, PDF)
- Integration with external ticketing systems
- Mobile-responsive design for tablet access

### Extensibility
- Plugin architecture for custom tab additions
- API integration for third-party tools
- Customizable risk assessment rules
- Integration with compliance and audit systems

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-24  
**Applies to:** M&A Discovery Suite v1.0+  
**Support:** Contact technical support for assistance with UserDetailView functionality
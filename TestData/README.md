# M&A Discovery Suite Test Data

This directory contains comprehensive dummy data for testing all views in the M&A Discovery Suite GUI application.

## Data Files Overview

| File | Purpose | Records | Description |
|------|---------|---------|-------------|
| `Infrastructure.csv` | Infrastructure/ComputersView | 33 | Physical and virtual servers, network devices, storage systems |
| `Users.csv` | DomainDiscoveryView/UsersView | 25 | Active Directory users with realistic departments and roles |
| `Applications.csv` | ApplicationsView | 32 | Installed applications with licensing and usage data |
| `Groups.csv` | GroupsView | 30 | Security and distribution groups with membership details |
| `GroupPolicies.csv` | GroupPoliciesView | 25 | Group Policy Objects with settings and linkage information |
| `FileServers.csv` | FileServersView | 30 | File shares across multiple servers with permissions and usage |
| `Databases.csv` | DatabasesView | 30 | SQL Server databases with metadata and backup information |
| `Projects.csv` | ProjectManagementView | 20 | Active projects with timelines, budgets, and progress tracking |
| `Reports.csv` | ReportBuilderView | 20 | Report definitions with various types and categories |
| `Tasks.csv` | TaskSchedulerView | 30 | Scheduled tasks with different frequencies and statuses |
| `SimulationScenarios.csv` | WhatIfSimulationView | 15 | What-if simulation scenarios with parameters |
| `SimulationParameters.csv` | WhatIfSimulationView | 30 | Parameters for simulation scenarios |
| `DependencyNodes.csv` | DependencyGraphView | 30 | Network nodes for dependency visualization |
| `DependencyEdges.csv` | DependencyGraphView | 55 | Relationships between network components |
| `ScriptTemplates.csv` | ScriptEditorView | 7 | PowerShell script templates for common tasks |

## Data Structure Standards

All CSV files follow these conventions:

### Required Columns
- `_DiscoveryTimestamp`: When the data was discovered (ISO 8601 format)
- `_DiscoveryModule`: Which discovery module generated the data
- `_SessionId`: Unique session identifier (format: SES-YYYYMMDD-NNN)

### Data Quality Features
- **Realistic Data**: All entries use realistic names, dates, and values
- **Relationships**: Data is cross-referenced (users belong to groups, applications run on servers)
- **Variety**: Multiple statuses, types, and scenarios for comprehensive testing
- **Edge Cases**: Includes disabled accounts, failed tasks, legacy systems
- **Hierarchical**: Proper organizational structure with managers and departments

## Loading Test Data

### In GUI Application
The GUI should automatically detect and load CSV files from the `TestData` directory when:
1. Real discovery data is not available
2. Demo mode is enabled
3. Testing/development environment is detected

### Manual Import
```powershell
# Import specific data set
$Users = Import-Csv "D:\Scripts\UserMandA\TestData\Users.csv"
$Infrastructure = Import-Csv "D:\Scripts\UserMandA\TestData\Infrastructure.csv"

# Verify data integrity
$Users | Where-Object { $_._DiscoveryTimestamp -eq $null }
```

## Data Scenarios Covered

### User Scenarios
- Active employees across all departments
- Service accounts and system accounts  
- Disabled/test accounts
- Various password expiry states
- Group memberships and roles

### Infrastructure Scenarios
- Production, development, and legacy systems
- Different operating system versions
- Various server roles and functions
- Network devices and storage arrays
- Virtual and physical hardware

### Application Scenarios
- Licensed and free software
- Various risk levels and support status
- Usage patterns and deployment methods
- Legacy applications requiring attention

### Project Scenarios
- Projects in different phases (planning, implementation, completed)
- Various priority levels and risk assessments
- Realistic budgets and timelines
- Team assignments and dependencies

### Security Scenarios
- Group policies with different scopes
- Security groups with appropriate permissions
- Certificate and authentication dependencies
- Network security appliances

## Testing Red Banner Issues

The data is specifically designed to help identify missing columns or binding issues:

### Common Binding Paths Covered
- `DisplayName`, `Name`, `Title` - User identification
- `Status`, `AccountStatus` - Status indicators  
- `LastLogon`, `LastSeen`, `LastModified` - Temporal data
- `Department`, `Category`, `Type` - Classification
- `ProgressPercentage`, `UsageCount` - Metrics
- `Groups`, `Members`, `Dependencies` - Relationships

### Data Validation
- All mandatory columns are populated
- Dates are in consistent formats
- Numeric fields contain valid numbers
- Enumerations use consistent values
- Foreign key relationships are maintained

## Updating Test Data

When adding new views or modifying existing ones:

1. **Analyze XAML bindings** - Check `{Binding PropertyName}` patterns
2. **Add missing columns** - Ensure all bound properties have data
3. **Maintain relationships** - Keep cross-references between data sets
4. **Follow naming conventions** - Use consistent column names
5. **Include edge cases** - Add error conditions and unusual data

## Performance Considerations

The test data is sized for realistic testing:
- Small enough for fast loading during development
- Large enough to test scrolling and virtualization
- Varied enough to test filtering and sorting
- Complex enough to test relationships and dependencies

Total records: ~427 across all data sets
Estimated load time: <2 seconds on typical development hardware
Memory footprint: <10MB when fully loaded

This test data provides comprehensive coverage for all GUI views while maintaining realistic relationships and edge cases that help identify binding issues and missing functionality.
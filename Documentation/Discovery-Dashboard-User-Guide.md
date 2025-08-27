# Discovery Dashboard User Guide

## Overview

The Discovery Dashboard is a centralized interface for managing and executing all discovery modules in the M&A Discovery Suite. It provides an intuitive tile-based interface where each tile represents a specific discovery module that can be executed individually or in bulk.

## Getting Started

### Accessing the Dashboard
1. Launch the M&A Discovery Suite application
2. Click on the **"Discovery"** tab in the left navigation menu
3. The Discovery Dashboard will load automatically, showing all available discovery modules

### Dashboard Layout
The dashboard consists of several key areas:

#### Header Section
- **Total Module Count**: Shows the number of available discovery modules
- **Quick Statistics**: Displays running, completed, and failed module counts
- **Data Summary**: Shows current data counts (Users, Infrastructure, Applications, Groups, Databases, Mailboxes)

#### Filter Controls
- **Category Filter**: Dropdown to filter modules by category (Identity, Infrastructure, Cloud, Security, etc.)
- **Search Box**: Text input to search modules by name, description, or module ID
- **Bulk Actions**: Buttons for running multiple modules at once

#### Module Tiles
Each module is displayed as a tile containing:
- **Module Icon**: Visual identifier for the module type
- **Module Name**: Display name of the discovery module
- **Description**: Brief explanation of what the module discovers
- **Category Badge**: Shows the module's category classification
- **Status Indicator**: Current execution status (Ready, Running, Completed, Failed)
- **Progress Bar**: Shows execution progress when running
- **Run Button**: Starts the individual module execution

## Available Discovery Modules

### Identity & Access Management
- **Active Directory Discovery**: On-premises AD users, groups, computers, OUs
- **Azure AD Discovery**: Cloud identity and access management
- **Entra ID App Discovery**: Enterprise application registrations
- **Multi-Domain Forest Discovery**: Complex AD topologies across domains
- **External Identity Discovery**: Third-party identity systems integration

### Cloud Infrastructure
- **Azure Resource Discovery**: Azure cloud infrastructure and services
- **Container Orchestration**: Docker containers and Kubernetes clusters
- **Multi-Cloud Discovery Engine**: Cross-cloud platform discovery

### Collaboration & Productivity
- **Exchange Discovery**: Email systems, mailboxes, and distribution lists
- **Microsoft Teams Discovery**: Teams, channels, and collaboration data
- **SharePoint Discovery**: Document libraries and collaboration sites
- **Power Platform Discovery**: Power Apps, Power BI, and Power Automate

### Security & Compliance
- **Security Infrastructure Discovery**: Security appliances and tools
- **Security Group Analysis**: Permission and access analysis
- **Certificate Discovery**: PKI infrastructure and certificate management
- **Palo Alto Networks Discovery**: Firewall and security policies
- **Threat Detection Engine**: Security threat analysis
- **Group Policy Discovery**: Windows Group Policy analysis

### Infrastructure & Systems
- **Network Infrastructure**: Network devices, topology, and configuration
- **Physical Server Discovery**: Hardware inventory and specifications
- **VMware Discovery**: Virtual infrastructure and resource allocation
- **File Server Discovery**: File shares, permissions, and storage
- **Storage Array Discovery**: SAN/NAS systems and storage allocation
- **Backup & Recovery Discovery**: Backup systems and recovery procedures

### Data & Applications
- **SQL Server Discovery**: Database servers, instances, and databases
- **Database Schema Discovery**: Database structure and relationships
- **Application Discovery**: Installed applications and software inventory
- **Application Dependencies**: Integration and dependency mapping
- **Data Classification**: Data sensitivity and classification analysis
- **Data Governance**: Metadata management and data lineage
- **Licensing Discovery**: Software licensing compliance analysis

### Operations & Management
- **Intune Discovery**: Mobile device management and policies
- **Scheduled Task Discovery**: Automated tasks and job scheduling
- **Printer Discovery**: Print infrastructure and device management

## Using the Dashboard

### Running Individual Modules

1. **Locate the Module**: Use the category filter or search box to find the specific module
2. **Check Prerequisites**: Ensure the module is enabled (indicated by the tile being active)
3. **Click Run Discovery**: Press the "Run Discovery" button on the module tile
4. **Monitor Progress**: Watch the progress bar and status updates
5. **View Results**: Check the data counts update after completion

### Bulk Operations

#### Run All Enabled Modules
- Click the **"Run All Enabled"** button to execute all active modules sequentially
- This will start modules with a 2-second delay between each to prevent system overload
- Monitor the overall progress in the status message area

#### Run by Category
1. Select a specific category from the dropdown filter
2. Click **"Run Category"** to execute all enabled modules in that category
3. Useful for focused discovery sessions (e.g., only Identity modules)

#### Stop Running Modules
- Click **"Stop All Running"** to request termination of currently executing modules
- Note: Modules may take time to respond to stop requests

### Filtering and Search

#### Category Filtering
- Use the category dropdown to show only modules from specific areas
- Categories include: Identity, Infrastructure, Cloud, Security, Collaboration, Data, Operations
- Select "All" to show all modules

#### Text Search
- Type in the search box to filter modules by:
  - Module display name
  - Description text
  - Module ID
- Search is case-insensitive and matches partial text

### Status Monitoring

#### Module Status Indicators
- **Ready**: Module is idle and available for execution
- **Running**: Module is currently executing (shows progress bar)
- **Completed**: Module finished successfully (green indicator)
- **Failed**: Module encountered an error (red indicator)
- **Stopping**: Module is in the process of stopping

#### Data Count Updates
After successful module execution, the dashboard automatically updates:
- **Users Count**: Total discovered user accounts
- **Infrastructure Count**: Total discovered computers and devices
- **Applications Count**: Total discovered applications
- **Groups Count**: Total discovered security and distribution groups
- **Databases Count**: Total discovered database instances
- **Mailboxes Count**: Total discovered email mailboxes

## Best Practices

### Planning Discovery Sessions
1. **Start Small**: Begin with core modules (Active Directory, Azure AD) before specialized ones
2. **Category-Based Approach**: Run related modules together (all Identity, then Infrastructure)
3. **Monitor Resources**: Watch system performance during bulk operations
4. **Staged Execution**: Use category filtering for controlled, staged discovery

### Troubleshooting
1. **Check Module Status**: Failed modules show error indicators
2. **Review Logs**: Check the application logs for detailed error information
3. **Verify Credentials**: Ensure proper authentication for target systems
4. **Retry Failed Modules**: Individual modules can be re-run after fixing issues

### Performance Optimization
1. **Avoid Overwhelming**: Don't run too many modules simultaneously
2. **Use Bulk Operations**: Leverage built-in delays in bulk execution
3. **Monitor Data Output**: Check CSV file generation in real-time
4. **Regular Refresh**: Allow data counts to update between runs

## Data Output

### CSV File Generation
Each module generates CSV files in the following location:
```
C:\discoverydata\[ProfileName]\Raw\
```

### Common Output Files
- **Users.csv**: User account information
- **Groups.csv**: Security and distribution groups
- **Computers.csv**: Infrastructure and device inventory
- **Applications.csv**: Software and application data
- **Databases.csv**: Database server and instance information
- **FileServers.csv**: File server and share information

### Data Refresh
- Dashboard counts update automatically after module completion
- Manual refresh can be triggered by re-opening the Discovery tab
- CSV files are timestamped for version tracking

## Keyboard Shortcuts

While in the Discovery Dashboard:
- **Ctrl+F**: Focus search box
- **Escape**: Clear current search
- **Enter**: Execute search when typing
- **Tab**: Navigate between controls

## Advanced Features

### Custom Module Configuration
- Module settings can be modified in `ModuleRegistry.json`
- Enable/disable modules by changing the `enabled` property
- Customize display names and descriptions
- Adjust module categories for better organization

### Logging and Monitoring
- All module executions are logged with timestamps
- Detailed execution logs available in the Logs directory
- Performance metrics tracked for optimization
- Error details captured for troubleshooting

### Integration Points
- PowerShell module execution through universal launcher
- Automatic data loading and count updates
- Real-time status synchronization
- Event-driven UI updates

## Support and Troubleshooting

### Common Issues

**Module Won't Start**
- Verify module is enabled in the registry
- Check that required credentials are configured
- Ensure PowerShell execution policy allows module scripts

**No Data Appearing**
- Confirm module completed successfully (green status)
- Check CSV file generation in the Raw data directory
- Verify data path configuration

**Performance Issues**
- Reduce number of concurrent modules
- Monitor system resource usage
- Use category-based execution instead of "Run All"

### Getting Help
- Check the application logs for detailed error information
- Review module-specific documentation
- Contact support with specific error messages and log excerpts

---

## Conclusion

The Discovery Dashboard provides a powerful, user-friendly interface for managing complex discovery operations. By following this guide and leveraging the filtering, bulk operations, and monitoring features, users can efficiently conduct comprehensive M&A discovery assessments with real-time visibility into progress and results.

For additional information or advanced configuration options, refer to the technical documentation or contact the development team.
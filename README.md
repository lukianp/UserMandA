M&A Discovery Suite v4.0 - Enhanced Modular Architecture
A comprehensive PowerShell-based solution for enterprise M&A environment discovery, analysis, and migration planning. This enhanced modular architecture provides intelligent data collection, correlation, and migration wave generation with advanced error handling and visual feedback.

🚀 Key Features
Enhanced Capabilities
🔐 Automated App Registration & Secure Credential Management - Streamlined Azure AD setup with Setup-AppRegistration.ps1 and DPAPI encryption.

🌐 Multi-Service Discovery - Comprehensive data collection from Active Directory, Microsoft Graph (Azure AD, Devices, Licenses, OneDrive, App Proxies), Exchange Online, Intune, GPOs, and External Identities.

📊 Intelligent Wave Generation - Configurable migration wave planning (e.g., by department or complexity).

🎯 User Profile & Complexity Analysis - Automated user migration complexity scoring and detailed profile building.

📈 Data Quality Validation - Built-in checks and reporting for discovered data.

🔄 Robust Connectivity & Error Handling - EnhancedConnectionManager.psm1 with retry logic and graceful degradation.

📝 Visual Progress Tracking & Logging - EnhancedLogging.psm1 for clear, emoji-enhanced console output and detailed file logs.

📄 Flexible Export Options - Output to CSV, JSON, and dedicated "Company Control Sheet" CSVs via CompanyControlSheetExporter.psm1.

📍 Location Independence - Run from any directory with automatic path resolution via Set-SuiteEnvironment.ps1.

🔍 Enhanced GPO Discovery - Robust XML parsing with EnhancedGPODiscovery.psm1.

✅ Comprehensive Validation - Validate-Installation.ps1 and DiscoverySuiteModuleCheck.ps1 for environment readiness.

🏗️ Architecture Overview
Modular Design
1 Core Orchestrator (MandA-Orchestrator.ps1) - Central execution engine.

Specialized Modules - Grouped by function (Authentication, Connectivity, Discovery, Processing, Export, Utilities).

Configuration-Driven - Behavior controlled via default-config.json.

Script-Based Setup & Launch - QuickStart.ps1 for easy execution and Setup-AppRegistration.ps1 for initial Azure AD configuration.

📁 Project Structure (Reflecting Actual Scripts)
M&A Discovery Suite/
├── Core/
│   └── MandA-Orchestrator.ps1              # Main execution engine
├── Modules/
│   ├── Authentication/
│   │   ├── Authentication.psm1             # Handles auth flow
│   │   └── CredentialManagement.psm1       # Secure credential storage
│   ├── Connectivity/
│   │   ├── ConnectionManager.psm1          # Basic connection logic (may be superseded)
│   │   └── EnhancedConnectionManager.psm1  # Advanced connection handling
│   ├── Discovery/
│   │   ├── ActiveDirectoryDiscovery.psm1   # On-prem AD data
│   │   ├── GraphDiscovery.psm1             # Azure AD, Graph API data
│   │   ├── ExchangeDiscovery.psm1        # Exchange Online data (details depend on implementation)
│   │   ├── AzureDiscovery.psm1           # Azure Resource data (details depend on implementation)
│   │   ├── IntuneDiscovery.psm1          # Intune data (details depend on implementation)
│   │   ├── GPODiscovery.psm1               # Basic GPO discovery
│   │   ├── EnhancedGPODiscovery.psm1     # Improved GPO XML parsing
│   │   └── ExternalIdentityDiscovery.psm1# For external identities/federation (details depend on implementation)
│   ├── Processing/
│   │   ├── DataAggregation.psm1          # Merges data from various sources
│   │   ├── UserProfileBuilder.psm1       # Creates detailed user profiles and complexity scores
│   │   ├── WaveGeneration.psm1           # Generates migration waves
│   │   └── DataValidation.psm1           # Validates data quality
│   ├── Export/
│   │   ├── CSVExport.psm1                # Standard CSV exports
│   │   ├── JSONExport.psm1               # Standard JSON exports
│   │   ├── ExcelExport.psm1              # For Excel formatted reports (if ImportExcel is used)
│   │   └── CompanyControlSheetExporter.psm1 # 🆕 Exports data to multiple Company Control Sheet CSVs
│   └── Utilities/
│       ├── Logging.psm1                  # Basic logging (may be superseded)
│       ├── EnhancedLogging.psm1          # Visual logging with emojis
│       ├── ErrorHandling.psm1            # Standardized error handling, retry logic
│       ├── ValidationHelpers.psm1        # Prerequisite checks, config validation
│       ├── ProgressTracking.psm1         # Progress bar functions
│       └── FileOperations.psm1           # Filesystem operations, CSV import/export helpers
├── Configuration/
│   └── default-config.json               # Default and primary configuration file
├── Scripts/
│   ├── QuickStart.ps1                    # Menu-driven launcher for common operations
│   ├── Setup-AppRegistration.ps1         # Azure AD App Registration and credential setup
│   ├── Set-SuiteEnvironment.ps1          # Sets up location-independent environment variables
│   ├── Validate-Installation.ps1         # Validates suite installation and prerequisites
│   ├── DiscoverySuiteModuleCheck.ps1     # Checks for required PowerShell modules
│   └── Test-AppRegistrationSyntax.ps1    # Utility to test Setup-AppRegistration.ps1 syntax
├── Documentation/
│   ├── CREDENTIALS_SETUP_GUIDE.md        # (Assumed to exist, link if needed)
│   ├── MandA_Discovery_Architecture_Plan.md # (Internal planning doc)
│   ├── Complete_MandA_Discovery_Implementation.md # (Internal implementation doc)
│   └── Server-Setup-Guide.md             # (Internal setup guide)
├── Deploy-ToServer.ps1                   # Script to deploy suite to a server
├── Unblock-AllFiles.ps1                  # Unblocks downloaded PowerShell files
└── README.md                             # This file

🚀 Quick Start Guide
🔐 IMPORTANT: Credentials Setup (Required First Step)
Before running any discovery operations, you MUST set up Azure AD App Registration and encrypted credentials using the provided script.

# Navigate to the Scripts directory within your M&A Discovery Suite folder
cd .\Scripts\

# Run the app registration setup script.
# You will be prompted for your Tenant ID.
# This script will guide you through creating or using an existing Azure AD App Registration
# and will securely store the necessary credentials.
.\Setup-AppRegistration.ps1

For detailed instructions, refer to Setup-AppRegistration.ps1 comments or CREDENTIALS_SETUP_GUIDE.md (if available).

Prerequisites
Required Software
✅ PowerShell 5.1 or higher (PowerShell 7+ recommended)

✅ .NET Framework 4.7.2 or higher (usually included with modern Windows)

✅ Internet connectivity to Microsoft services (Graph, Azure, Exchange Online)

Required PowerShell Modules
Run the DiscoverySuiteModuleCheck.ps1 script to verify and assist with installing necessary modules. This script attempts to install/update modules from the PowerShell Gallery.

# From the Scripts directory
.\DiscoverySuiteModuleCheck.ps1 -AutoFix

Key modules include (but are not limited to):

Microsoft.Graph.* (Authentication, Users, Groups, Applications, Identity.DirectoryManagement, etc.)

ExchangeOnlineManagement

Az.Accounts, Az.Resources (if Azure discovery is enabled)

ActiveDirectory (RSAT tool, for on-premises AD - install via Windows Features)

GroupPolicy (RSAT tool, for GPO discovery - install via Windows Features)

ImportExcel (Optional, for .xlsx export functionality if ExcelExport.psm1 is used)

Installation Validation
After setup and module checks, run the installation validator:

# From the Scripts directory
.\Validate-Installation.ps1

This script checks: PowerShell version, module structure, core components, module availability, network connectivity, configuration file validity, and orchestrator syntax.

Basic Usage (Using QuickStart.ps1)
The QuickStart.ps1 script provides a menu-driven interface for common operations.

# Navigate to the Scripts directory
cd .\Scripts\

# Launch QuickStart
.\QuickStart.ps1

QuickStart Menu Options Typically Include:

[0] Invoke App Registration Setup

[1] Invoke Orchestrator: Discovery Only

[2] Invoke Orchestrator: Discovery & Processing

[3] Invoke Orchestrator: Processing Only

[4] Invoke Orchestrator: Processing & Export

[5] Invoke Orchestrator: Validate Configuration Only

Advanced Usage (Directly calling MandA-Orchestrator.ps1)
For more granular control, you can call the orchestrator directly from the Core directory. Ensure Set-SuiteEnvironment.ps1 has been sourced in your session or by a calling script like QuickStart.ps1.

Full discovery, processing, and export:

# From the Core directory
.\MandA-Orchestrator.ps1 -Mode Full -ConfigurationFile "..\Configuration\default-config.json"

Discovery only:

.\MandA-Orchestrator.ps1 -Mode Discovery

Processing only (assumes raw data exists):

.\MandA-Orchestrator.ps1 -Mode Processing

Export only (assumes processed data exists):

.\MandA-Orchestrator.ps1 -Mode Export

Validate configuration (no operations run):

.\MandA-Orchestrator.ps1 -ValidateOnly

Override output path and force reprocessing:

.\MandA-Orchestrator.ps1 -Mode Full -OutputPath "D:\M&A_ProjectOutput" -Force

⚙️ Configuration (Configuration/default-config.json)
The suite's behavior is primarily controlled by default-config.json. Key sections include:

metadata: Information about the configuration file.

environment: Paths, logging levels, domain controller.

outputPath: Default .\Output (relative to Suite Root)

logLevel: INFO, DEBUG, WARN, ERROR

authentication: Credential store path, auth methods.

credentialStorePath: Default .\Credentials\credentials.config (relative to outputPath)

discovery: Enabled sources (e.g., ActiveDirectory, Graph, Exchange, GPO), batch sizes, skip existing files.

processing: Wave generation parameters, complexity thresholds.

export: Enabled formats (e.g., CSV, JSON, CompanyControlSheet), PowerApps optimization.

performance: Memory thresholds, progress update intervals.

graphAPI: API version, page size, specific fields to select for Graph queries.

exchangeOnline: Settings for Exchange Online discovery.

azure: Filters for Azure resource discovery.

Refer to the default-config.json file itself for all available options and their descriptions.

🔐 Authentication Setup (via Setup-AppRegistration.ps1)
The Scripts\Setup-AppRegistration.ps1 script is crucial for the initial setup.

It creates or helps you use an existing Azure AD Application Registration.

Permissions Configured: The script requests a comprehensive set of Microsoft Graph API permissions necessary for discovery across Azure AD, Exchange (via Graph), SharePoint (via Graph), Teams (via Graph), Intune, Devices, and more. These include:

User.Read.All, Group.Read.All, Device.Read.All, Application.Read.All, Directory.Read.All, Organization.Read.All

AuditLog.Read.All, SignIn.Read.All

DeviceManagementManagedDevices.Read.All, DeviceManagementConfiguration.Read.All, DeviceManagementApps.Read.All, DeviceManagementServiceConfig.Read.All

Policy.Read.All, Reports.Read.All

Sites.Read.All, Files.Read.All

Team.ReadBasic.All, TeamMember.Read.All, Channel.ReadBasic.All

MailboxSettings.Read, Mail.ReadBasic.All

LicenseAssignment.Read.All

And potentially higher privilege ones like Directory.ReadWrite.All if intended for migration actions (use with caution).

Roles Assigned:

Azure AD Roles (e.g., Cloud Application Administrator, Directory Readers) to the Service Principal.

Azure RM Role (Reader) on subscriptions for Azure resource discovery.

Credential Storage: Securely saves the Client ID, Tenant ID, and Client Secret (encrypted) to the path specified in default-config.json (e.g., Output\Credentials\credentials.config).

📊 Discovery Sources & Outputs
Data Sources (based on enabled modules)
Source

Key Modules Involved

Typical Data Collected

Active Directory

ActiveDirectoryDiscovery.psm1

Users, Groups, Computers, OUs, Group Memberships, basic attributes.

Microsoft Graph

GraphDiscovery.psm1

Azure AD Users, Groups, Devices, Applications, Service Principals, Licenses, Conditional Access Policies, Sign-in logs, Organization Info, OneDrive/SharePoint/Teams metadata (via Graph).

Exchange Online

ExchangeDiscovery.psm1, EnhancedConnectionManager.psm1

Mailboxes (User, Shared, Room, Equipment), Distribution Lists, Mailbox Sizes, Last Logon, Basic Permissions, Mobile Devices (EAS). Some data also via Graph (MailboxSettings).

Azure Resources

AzureDiscovery.psm1

Subscriptions, Resource Groups, VMs, VNETs, Storage Accounts (requires Reader role on subscriptions).

Intune

IntuneDiscovery.psm1, GraphDiscovery.psm1

Managed Devices, Compliance Policies, Configuration Profiles, Mobile Apps (via Graph Device Management APIs).

Group Policy

GPODiscovery.psm1, EnhancedGPODiscovery.psm1

GPO settings, Drive Mappings, Printer Mappings, Folder Redirection, Logon Scripts, Windows Firewall rules from GPOs.

External Identity

ExternalIdentityDiscovery.psm1, GraphDiscovery.psm1

Guest Users, B2B collaboration settings, Tenant Federation settings.

Processing Outputs (typically in Output/Processed/)
Output

Description

Example File(s)

User Profiles

Comprehensive user data with complexity scores

UserProfiles.csv

Migration Waves

Grouped users for phased migration

MigrationWaves.csv

Complexity Analysis

Breakdown of user migration complexity factors

ComplexityAnalysis.csv

Data Quality Report

Validation results and identified data issues

DataQualityReport.csv

Aggregated Data

Intermediate merged data sets (used for profiles)

(Internal, or raw data in Output/Raw/)

Export Outputs (typically in Output/Exported/ or Output/CompanyControlSheetCSVs/)
Standard Exports (CSVExport.psm1, JSONExport.psm1):

User Lists, Group Lists, Device Lists, Application Lists, etc. in CSV/JSON.

Migration Wave details.

Complexity reports.

Company Control Sheet Exports (CompanyControlSheetExporter.psm1):
Generates a series of detailed CSV files, for example:

Company_Control_Sheet.xlsx - User_List.csv

Company_Control_Sheet.xlsx - IP_Details.csv

Company_Control_Sheet.xlsx - Current_Hardware_Asset_List.csv

Company_Control_Sheet.xlsx - Current_Software_Asset_List.csv

Company_Control_Sheet.xlsx - Current_Laptop_Application_List.csv

Company_Control_Sheet.xlsx - Current_VDI_Application_List.csv

Company_Control_Sheet.xlsx - Server_Specifications.csv

Company_Control_Sheet.xlsx - Server_App_Target.csv

Company_Control_Sheet.xlsx - Server_Data_Source_Target.csv

Company_Control_Sheet.xlsx - FW Rules.csv

Company_Control_Sheet.xlsx - UAT_Group.csv

Company_Control_Sheet.xlsx - Exchange_Discovery.csv

Company_Control_Sheet.xlsx - ExchangePermissions.csv

Company_Control_Sheet.xlsx - Email_Connected_Mobile_List.csv

Company_Control_Sheet.xlsx - Master_Group_List.csv

Company_Control_Sheet.xlsx - Group_Memberships_List.csv

Company_Control_Sheet.xlsx - 3rd Party Vendors.csv
(Actual content depends on discovered data)

🎯 Migration Planning Features
User Profile Building & Complexity Scoring
The UserProfileBuilder.psm1 module aggregates data for each user from various sources.

Calculates a Migration Complexity Score based on factors like:

Account status, last logon, password age.

Mailbox size, archive status, litigation hold.

Number and type of assigned licenses.

Device associations and compliance.

Group memberships (critical groups).

Application usage/assignments.

Categorizes users (e.g., Simple, Standard, Complex, High Risk) based on score.

Migration Wave Generation
The WaveGeneration.psm1 module creates migration waves.

Strategies (configurable in default-config.json):

Department-Based: Groups users by their department to maintain team cohesion.

Complexity-Based: Groups users by their calculated migration complexity to balance technical effort per wave.

Considers maxWaveSize from configuration.

Outputs wave assignments for planning.

✨ Enhanced Suite Features
Visual Logging System (EnhancedLogging.psm1)
Emoji indicators for different log levels (🚀, ✅, ⚠️, ❌, 🔄, 📊, 🎯, 🔍, 🔧).

Color-coded console output for readability.

Timestamped and detailed file logging.

Connection Management (EnhancedConnectionManager.psm1)
Centralized handling of connections to Graph, Azure, Exchange Online.

Retry logic for transient connection issues.

Support for different authentication methods (Service Principal primary).

Graceful handling if a service connection fails, allowing other parts of the suite to proceed if possible.

GPO Discovery (EnhancedGPODiscovery.psm1)
Robust parsing of GPO backup XML files.

Handles XML namespaces and potential malformations.

Extracts key settings like drive maps, printer maps, folder redirection, logon scripts, and firewall rules.

🛠️ Troubleshooting
Common Issues & Solutions
Authentication Failures / Credential Issues:

Ensure Setup-AppRegistration.ps1 was run successfully.

Verify the credential file exists at the path specified in default-config.json (e.g., Output\Credentials\credentials.config).

Check if the client secret for the App Registration has expired in Azure AD.

Re-run Setup-AppRegistration.ps1 if unsure, possibly with the -UseExistingApp and -ExistingClientId parameters if you want to refresh credentials for an existing app.

Module Not Found Errors:

Run Scripts\DiscoverySuiteModuleCheck.ps1 -AutoFix.

Ensure RSAT tools (ActiveDirectory, GroupPolicy) are installed via Windows Features if on-premises discovery is needed.

Access Denied / Insufficient Permissions during Discovery:

Verify the Azure AD App Registration has all necessary API permissions granted (and admin consented) as outlined in Setup-AppRegistration.ps1.

For Azure resource discovery, ensure the Service Principal has the Reader role on the target subscriptions.

For Exchange Online, ensure appropriate Exchange admin roles or Exchange.ManageAsApp permission is granted.

Script Execution Policy Issues:

Run Unblock-AllFiles.ps1 from the suite's root directory.

If issues persist, you may need to adjust PowerShell execution policy: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser (or LocalMachine if run as admin). Use with caution.

Configuration Errors:

Validate default-config.json syntax (e.g., using a JSON validator).

Ensure paths in the configuration are correct relative to the suite's root or are absolute paths.

Log Locations
Main Orchestrator Logs: [OutputPath]\Logs\MandA_Discovery_[Timestamp].log

App Registration Logs: MandADiscovery_Registration_Log.txt (in the directory where Setup-AppRegistration.ps1 was run).

Progress Metrics: [OutputPath]\Logs\ProgressMetrics_[Timestamp].json

Raw Discovered Data: [OutputPath]\Raw\

Processed Data: [OutputPath]\Processed\

Exported Reports: [OutputPath]\Exported\ and [OutputPath]\CompanyControlSheetCSVs\

📈 Performance Optimization

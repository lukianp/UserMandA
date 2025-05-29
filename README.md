M&A Discovery Suite v4.0 - Enhanced Modular Architecture
A comprehensive PowerShell-based solution for enterprise M&A environment discovery, analysis, and migration planning. This enhanced modular architecture provides intelligent data collection, correlation, and migration wave generation with advanced error handling and visual feedback.

🚀 Key Features
Enhanced Capabilities
🔐 **Automated App Registration & Secure Credential Management** - Streamlined Azure AD setup with `Setup-AppRegistration.ps1` using Windows DPAPI encryption for credentials. Supports using existing App Registrations.

🌐 **Multi-Service Discovery** - Comprehensive data collection from Active Directory, Microsoft Graph (Azure AD Users, Groups, Devices, Applications, Service Principals, Licenses, Conditional Access Policies, Sign-in logs, Organization Info, OneDrive/SharePoint/Teams metadata), Exchange Online, Azure Resources, Intune (Devices, Policies, Apps via Graph), Group Policies (GPOs), and External Identities.

📊 **Intelligent Wave Generation** - Configurable migration wave planning based on criteria like department or complexity, controlled via `default-config.json`.

🎯 **User Profile & Complexity Analysis** - Automated calculation of user migration complexity scores and building of detailed user profiles.

📈 **Data Quality Validation** - Built-in checks and reporting for discovered data integrity.

🔄 **Robust Connectivity & Error Handling** - `EnhancedConnectionManager.psm1` provides centralized and resilient connection handling with retry logic and graceful degradation for various services.

📝 **Visual Progress Tracking & Logging** - `EnhancedLogging.psm1` offers clear, emoji-enhanced console output and detailed, structured file logs. Progress is tracked via `ProgressTracking.psm1`.

📄 **Flexible Export Options** - Outputs to CSV, JSON. Specialized exports like "Company Control Sheets" are generated via `CompanyControlSheetExporter.psm1`. PowerApps optimized JSON is also an option.

📍 **Location Independence** - Designed to run from any directory with automatic path resolution managed by `Set-SuiteEnvironment.ps1`.

🔍 **Enhanced GPO Discovery** - Robust XML parsing of GPO backups, including handling for namespaces and malformed files, via `EnhancedGPODiscovery.psm1`.

✅ **Comprehensive Validation** - `Validate-Installation.ps1` for overall suite readiness and `DiscoverySuiteModuleCheck.ps1` for PowerShell module dependencies and auto-fixing capabilities.

🏗️ Architecture Overview
Modular Design
* **Core Orchestrator** (`Core/MandA-Orchestrator.ps1`) - Central execution engine, dynamically loads modules based on configuration and operational mode.
* **Specialized Modules** - Grouped by function: Authentication, Connectivity, Discovery, Processing, Export, and Utilities.
* **Configuration-Driven** - Behavior extensively controlled via `Configuration/default-config.json`.
* **Script-Based Setup & Launch** - `Scripts/QuickStart.ps1` for user-friendly menu-driven execution and `Scripts/Setup-AppRegistration.ps1` for initial Azure AD configuration.

📁 Project Structure
M&A Discovery Suite/
├── Core/
│   └── MandA-Orchestrator.ps1              # Main execution engine, manages discovery, processing, export phases
├── Modules/
│   ├── Authentication/
│   │   ├── Authentication.psm1             # Handles authentication flow, token management
│   │   └── CredentialManagement.psm1       # Secure credential storage using DPAPI
│   ├── Connectivity/
│   │   ├── ConnectionManager.psm1          # Basic connection logic (likely superseded by Enhanced)
│   │   └── EnhancedConnectionManager.psm1  # Advanced, resilient connection handling for Graph, Azure, Exchange
│   ├── Discovery/
│   │   ├── ActiveDirectoryDiscovery.psm1   # On-premises AD data (Users, Groups, Computers, OUs)
│   │   ├── GraphDiscovery.psm1             # Azure AD & Microsoft Graph data (Users, Groups, Apps, Devices, Licenses etc.)
│   │   ├── ExchangeDiscovery.psm1          # Exchange Online data (Mailboxes, DGs, Permissions)
│   │   ├── AzureDiscovery.psm1             # Azure Resource Manager data (VMs, VNETs, Storage - based on config)
│   │   ├── IntuneDiscovery.psm1            # Intune data (Managed Devices, Policies, Apps - via Graph)
│   │   ├── GPODiscovery.psm1               # Basic GPO discovery
│   │   ├── EnhancedGPODiscovery.psm1       # Improved GPO XML parsing for Drive Maps, Printers, etc.
│   │   └── ExternalIdentityDiscovery.psm1  # Guest Users, B2B settings, Federation info
│   ├── Processing/
│   │   ├── DataAggregation.psm1            # Merges data from various discovery sources
│   │   ├── UserProfileBuilder.psm1         # Creates detailed user profiles and calculates migration complexity scores
│   │   ├── WaveGeneration.psm1             # Generates migration waves based on configured strategies
│   │   └── DataValidation.psm1             # Validates data quality and generates reports
│   ├── Export/
│   │   ├── CSVExport.psm1                  # Standard CSV exports for profiles, waves, etc.
│   │   ├── JSONExport.psm1                 # Standard and PowerApps-optimized JSON exports
│   │   ├── ExcelExport.psm1                # For Excel formatted reports (requires ImportExcel module)
│   │   └── CompanyControlSheetExporter.psm1# Exports data to multiple Company Control Sheet CSVs
│   └── Utilities/
│       ├── Logging.psm1                    # Basic logging (likely superseded by Enhanced)
│       ├── EnhancedLogging.psm1            # Visual logging with emojis, structured file logs
│       ├── ErrorHandling.psm1              # Standardized error handling, retry logic, prerequisite checks
│       ├── ValidationHelpers.psm1          # Config validation, module checks, helper functions
│       ├── ProgressTracking.psm1           # Progress bar functions and metrics collection
│       └── FileOperations.psm1             # Filesystem operations, CSV import/export helpers, cleanup
├── Configuration/
│   └── default-config.json                 # Primary configuration file for all suite behavior
├── Scripts/
│   ├── QuickStart.ps1                      # Menu-driven launcher for common operations
│   ├── Setup-AppRegistration.ps1           # Azure AD App Registration and credential setup
│   ├── Set-SuiteEnvironment.ps1            # Sets up location-independent environment variables (sourced by QuickStart)
│   ├── Validate-Installation.ps1           # Validates suite installation and prerequisites
│   ├── DiscoverySuiteModuleCheck.ps1       # Checks for required PowerShell modules, with auto-fix capability
│   └── Test-AppRegistrationSyntax.ps1      # Utility to test Setup-AppRegistration.ps1 syntax
├── Documentation/                          # Contains detailed planning, implementation, and setup guides
│   ├── Complete_MandA_Discovery_Implementation.md
│   ├── MandA_Discovery_Architecture_Plan.md
│   └── Server-Setup-Guide.md
│   └── (Other specific guides like CREDENTIALS_SETUP_GUIDE.md if present)
├── Deploy-ToServer.ps1                     # Script to deploy suite to a server location
├── Unblock-AllFiles.ps1                    # Unblocks downloaded PowerShell files to prevent security warnings
└── README.md                               # This file

🚀 Quick Start Guide
🔐 **IMPORTANT: Credentials Setup (Required First Step)**
Before running any discovery operations, you MUST set up Azure AD App Registration and encrypted credentials using the provided script.

```powershell
# Navigate to the Scripts directory within your M&A Discovery Suite folder
cd .\Scripts\

# Run the app registration setup script.
# You might be prompted for your Tenant ID if it cannot be detected.
# This script will guide you through creating or using an existing Azure AD App Registration
# and will securely store the necessary credentials.
.\Setup-AppRegistration.ps1

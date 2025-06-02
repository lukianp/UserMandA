# M&A Discovery Suite v5.0 - Enhanced Modular Architecture

A comprehensive, enterprise-ready PowerShell solution for M&A environment discovery, analysis, and migration planning. This modular architecture provides intelligent data collection, correlation, and migration wave generation with a focus on robust error handling, location independence, and a user-friendly, company-centric workflow.

---

## 🚀 Key Features

* **Company-Centric Profiles**: All outputs, logs, and credentials are automatically organized into company-specific profile directories, allowing you to manage multiple M&A projects concurrently from a single deployment.
* **Menu-Driven Quick Start**: A user-friendly `QuickStart.ps1` menu to guide users through all necessary steps, from setup to execution.
* **Automated App Registration**: The `Setup-AppRegistration.ps1` script (run from the Quick Start menu) automates the creation and configuration of the required Azure AD App Registration for each company.
* **Secure Credential Management**: Automatically encrypts and stores credentials securely within the company's profile directory using Windows DPAPI.
* **Comprehensive Discovery**: Collects data from a wide array of sources, including Active Directory, Microsoft Graph (Azure AD, Intune), Exchange Online, GPOs, File Servers, and more.
* **Intelligent Processing**: Aggregates data from all sources, builds detailed user profiles, calculates migration complexity scores, and generates logical migration waves.
* **Flexible Export Options**: Generates multiple report formats, including standard CSVs, JSON files, and specialized exports optimized for PowerApps and a "Company Control Sheet."
* **Location Independence**: The suite can be run from any directory thanks to the `Set-SuiteEnvironment.ps1` script, which dynamically resolves all necessary paths.
* **Robust Validation & Error Handling**: Includes a `Validate-Installation.ps1` script and a `DiscoverySuiteModuleCheck.ps1` utility to ensure all dependencies are met. The core orchestrator features enhanced error handling and retry logic.

---

## 🏗️ Architecture Overview

The suite is orchestrated by `Core\MandA-Orchestrator.ps1`, which acts as the central engine. It operates in distinct, configurable phases: **Discovery**, **Processing**, and **Export**. The entire workflow is initiated and managed through the `QuickStart.ps1` script, which ensures the correct environment is set for a specified company before calling the orchestrator.

Of course. Here is the updated README.md and the concise summary of the discovery functions based on the provided files.

README.md
Markdown

# M&A Discovery Suite v5.0 - Enhanced Modular Architecture

A comprehensive, enterprise-ready PowerShell solution for M&A environment discovery, analysis, and migration planning. This modular architecture provides intelligent data collection, correlation, and migration wave generation with a focus on robust error handling, location independence, and a user-friendly, company-centric workflow.

---

## 🚀 Key Features

* **Company-Centric Profiles**: All outputs, logs, and credentials are automatically organized into company-specific profile directories, allowing you to manage multiple M&A projects concurrently from a single deployment.
* **Menu-Driven Quick Start**: A user-friendly `QuickStart.ps1` menu to guide users through all necessary steps, from setup to execution.
* **Automated App Registration**: The `Setup-AppRegistration.ps1` script (run from the Quick Start menu) automates the creation and configuration of the required Azure AD App Registration for each company.
* **Secure Credential Management**: Automatically encrypts and stores credentials securely within the company's profile directory using Windows DPAPI.
* **Comprehensive Discovery**: Collects data from a wide array of sources, including Active Directory, Microsoft Graph (Azure AD, Intune), Exchange Online, GPOs, File Servers, and more.
* **Intelligent Processing**: Aggregates data from all sources, builds detailed user profiles, calculates migration complexity scores, and generates logical migration waves.
* **Flexible Export Options**: Generates multiple report formats, including standard CSVs, JSON files, and specialized exports optimized for PowerApps and a "Company Control Sheet."
* **Location Independence**: The suite can be run from any directory thanks to the `Set-SuiteEnvironment.ps1` script, which dynamically resolves all necessary paths.
* **Robust Validation & Error Handling**: Includes a `Validate-Installation.ps1` script and a `DiscoverySuiteModuleCheck.ps1` utility to ensure all dependencies are met. The core orchestrator features enhanced error handling and retry logic.

---

## 🏗️ Architecture Overview

The suite is orchestrated by `Core\MandA-Orchestrator.ps1`, which acts as the central engine. It operates in distinct, configurable phases: **Discovery**, **Processing**, and **Export**. The entire workflow is initiated and managed through the `QuickStart.ps1` script, which ensures the correct environment is set for a specified company before calling the orchestrator.

+---------------------+      +---------------------------+      +--------------------------+
|  QuickStart.ps1     |----->|  Set-SuiteEnvironment.ps1 |----->|  Core/MandA-Orchestrator |
| (User Menu)         |      | (Sets Company Context)    |      | (Main Engine)            |
+---------------------+      +---------------------------+      +--------------------------+
|
|
.-------------------------------------------------------------------'
|
▼
+---------------------------------------------------------------------------------+
|                                     PHASES                                      |
+----------------------+---------------------------+------------------------------+
|   1. DISCOVERY       |     2. PROCESSING         |      3. EXPORT               |
|  (Discovery Modules) |   (Processing Modules)    |    (Export Modules)          |
+----------------------+---------------------------+------------------------------+


---

## 📁 Project Structure

The project is organized into functional directories, ensuring modularity and maintainability.

M&A Discovery Suite/
├── Core/
│   └── MandA-Orchestrator.ps1              # Main execution engine for all phases
├── Configuration/
│   ├── default-config.json                 # Primary configuration file for all suite behavior
│   └── config.schema.json                  # Schema for validating the configuration
├── Modules/
│   ├── Authentication/                     # Handles authentication and credential management
│   ├── Connectivity/                       # Manages connections to services (Graph, Azure, etc.)
│   ├── Discovery/                          # Modules for collecting data from various sources
│   ├── Processing/                         # Modules for data aggregation, analysis, and wave generation
│   ├── Export/                             # Modules for generating reports and exports
│   └── Utilities/                          # Helper modules for logging, error handling, etc.
├── Scripts/
│   ├── QuickStart.ps1                      # USER-FACING: Menu-driven launcher for all operations
│   ├── Setup-AppRegistration.ps1           # Automates Azure AD App setup for a company
│   ├── Set-SuiteEnvironment.ps1            # Sets up location-independent environment for a company
│   ├── Validate-Installation.ps1           # Validates suite installation and prerequisites
│   └── DiscoverySuiteModuleCheck.ps1       # Checks for required PowerShell modules
├── Documentation/
│   └── (Detailed architecture, setup, and implementation guides)
├── Deploy-ToServer.ps1                     # Script to deploy the entire suite to a server
├── Unblock-AllFiles.ps1                    # Unblocks downloaded PowerShell files
└── README.md                               # This file


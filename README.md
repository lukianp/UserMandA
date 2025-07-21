 Overview

UserMandA is a robust and powerful PowerShell-based orchestration suite 🌐 designed for seamless automation of user and environment discovery, data aggregation, validation, and export processes—primarily within Azure ☁️ and Active Directory 🔑 ecosystems.

📁 Directory Structure

🛠️ Core Components

📂 Modules/: Essential PowerShell modules for authentication, discovery, data processing, utility functions, and export capabilities.

🔐 Authentication: Handles authentication sessions, credentials, and session management.

🔎 Discovery: Modular scripts for Azure, Active Directory, SharePoint, SQL Server, Exchange, Teams, and more.

⚙️ Processing: Validates and aggregates data, creates user profiles, and manages workflows.

📤 Export: Exports discovery results to CSV, Excel, JSON, and PowerApps formats.

🧰 Utilities: Utilities for error handling, logging, caching, and tracking progress.

📜 Scripts

🚀 QuickStart.ps1: Quickly initializes the UserMandA suite.

🎯 MandA-Orchestrator.ps1: Main orchestrator for executing discovery and data processing workflows.

✅ Set-SuiteEnvironment.ps1: Prepares and validates your working environment.

⚙️ Configuration

📄 default-config.json: Default configuration settings.

📑 config.schema.json: Schema outlining required configuration structures.

🚦 Getting Started

✅ Ensure prerequisites: PowerShell 5.1+, Azure and Active Directory permissions.

📥 Clone the repository.

🚀 Initialize and validate your environment with:

.\QuickStart.ps1

🔄 Technical Workflow

🔧 Initialization: Run Set-SuiteEnvironment.ps1.

🔑 Authentication: Authenticate using AuthSession.psm1.

🕵️ Discovery: Execute modules like AzureDiscovery.psm1, ActiveDirectoryDiscovery.psm1.

📊 Data Processing: Aggregate (DataAggregation.psm1), validate (DataValidation.psm1), and build profiles (UserProfileBuilder.psm1).

📂 Exporting: Export results using modules (CSV, JSON, Excel).

🛠️ Utilities: Leverage logging, error handling, and validation utilities.

💡 Advanced Features

📈 Enhanced Logging & Monitoring: Real-time error logging with EnhancedLogging.psm1 and analysis via LogAnalyzer.psm1.

🚄 Runspace & Performance Optimization: Optimized runspace management and variable scoping.

✅ Validation Framework: Comprehensive validation of modules, authentication contexts, and scripts.

📚 Documentation

Detailed guides and documentation are in the Documentation/ folder 📂, covering authentication architecture, module validation, and more.

🧪 Validation and Testing

Robust testing ensures reliability, with detailed JSON and CSV reports in ValidationResults/.

🤝 Support & Contributions

For enhancements, bug reports 🐞, or contributions, please follow the standard GitHub workflow with issues and pull requests. 🙌✨

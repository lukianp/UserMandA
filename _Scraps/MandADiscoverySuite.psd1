# Author: Lukian Poleschtschuk
}
# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Initial version - any future changes require version increment

@{
    # Script module or binary module file associated with this manifest
    RootModule = 'QuickStart.ps1'
    
    # Version number of this module
    ModuleVersion = '6.0.0'
    
    # ID used to uniquely identify this module
    GUID = 'a4f7d3e2-8b9c-4d5e-9f1a-2b3c4d5e6f7a'
    
    # Author of this module
    Author = 'M&A Discovery Suite Team'
    
    # Company or vendor of this module
    CompanyName = 'Your Company'
    
    # Copyright statement for this module
    Copyright = '(c) 2025. All rights reserved.'
    
    # Description of the functionality provided by this module
    Description = 'Comprehensive M&A Discovery Suite for Azure and On-Premises environments'
    
    # Minimum version of the Windows PowerShell engine required by this module
    PowerShellVersion = '5.1'
    
    # Modules that must be imported into the global environment prior to importing this module
    RequiredModules = @()
    
    # Script files (.ps1) that are run in the caller's environment prior to importing this module
    ScriptsToProcess = @(
        'Scripts\Set-SuiteEnvironment.ps1'
    )
    
    # Functions to export from this module
    FunctionsToExport = @()
    
    # Cmdlets to export from this module
    CmdletsToExport = @()
    
    # Variables to export from this module
    VariablesToExport = @()
    
    # Aliases to export from this module
    AliasesToExport = @()
    
    # Private data to pass to the module specified in RootModule/ModuleToProcess
    PrivateData = @{
        PSData = @{
            # Tags applied to this module
            Tags = @('M&A', 'Discovery', 'Azure', 'ActiveDirectory', 'Migration')
            
            # A URL to the license for this module
            LicenseUri = ''
            
            # A URL to the main website for this project
            ProjectUri = ''
            
            # ReleaseNotes of this module
            ReleaseNotes = @'
Version 6.0.0:
- Complete rewrite of QuickStart and Orchestrator
- Improved error handling and logging
- Fixed UTF-8 BOM issues
- Better module dependency management
'@
        }
    }
}
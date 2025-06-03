<#
.SYNOPSIS
    Sets up environment variables and paths for M&A Discovery Suite.
    It prioritizes a provided -SuiteRoot parameter, then a default path (C:\UserMigration),
    and finally auto-detects based on its own location if the others are invalid.
.DESCRIPTION
    Creates location-independent environment setup for the M&A Discovery Suite
    that can be sourced by other scripts to ensure consistent path handling.
    Validates the integrity of the determined SuiteRoot by checking for essential subdirectories.
.PARAMETER SuiteRoot
    Optional. Explicitly defines the root path of the M&A Discovery Suite.
    If provided, this path will be used and validated.
.EXAMPLE
    . .\Scripts\Set-SuiteEnvironment.ps1
    # Attempts to use C:\UserMigration, then auto-detects if C:\UserMigration is not a valid suite location.

.EXAMPLE
    . .\Scripts\Set-SuiteEnvironment.ps1 -SuiteRoot "D:\CustomPath\UserMandA"
    # Uses D:\CustomPath\UserMandA as the SuiteRoot after validation.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot # Renamed to avoid confusion with the internal $SuiteRoot variable
)

# Function to test if a given path contains the core M&A Discovery Suite structure
function Test-MandASuiteStructure {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PathToTest
    )
    $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
    if (-not (Test-Path $PathToTest -PathType Container)) {
        Write-Verbose "Test-MandASuiteStructure: Provided path '$PathToTest' does not exist or is not a directory."
        return $false
    }
    foreach ($subDir in $requiredSubDirs) {
        $fullSubDirPath = Join-Path $PathToTest $subDir
        if (-not (Test-Path $fullSubDirPath -PathType Container)) {
            Write-Verbose "Test-MandASuiteStructure: Required subdirectory '$subDir' not found in '$PathToTest'."
            return $false # Structure is incomplete
        }
    }
    Write-Verbose "Test-MandASuiteStructure: Path '$PathToTest' contains all required subdirectories."
    return $true # Structure is complete
}

# --- Determine SuiteRoot ---
$SuiteRoot = $null
$determinedBy = "" # For logging how SuiteRoot was determined

if (-not [string]::IsNullOrWhiteSpace($ProvidedSuiteRoot)) {
    # 1. Use -SuiteRoot parameter if provided
    Write-Verbose "Attempting to use provided SuiteRoot: '$ProvidedSuiteRoot'."
    if (Test-MandASuiteStructure -PathToTest $ProvidedSuiteRoot) {
        $SuiteRoot = $ProvidedSuiteRoot
        $determinedBy = "parameter input ('$ProvidedSuiteRoot')"
    } else {
        throw "Error: The provided SuiteRoot parameter '$ProvidedSuiteRoot' does not exist or does not contain the required M&A Discovery Suite structure (Core, Modules, Scripts, Configuration folders)."
    }
} else {
    # 2. Try the default preferred path: C:\UserMigration
    $defaultPreferredPath = "C:\UserMigration"
    Write-Verbose "No SuiteRoot parameter provided. Attempting to use default preferred path: '$defaultPreferredPath'."
    if (Test-MandASuiteStructure -PathToTest $defaultPreferredPath) {
        $SuiteRoot = $defaultPreferredPath
        $determinedBy = "default preferred path ('$defaultPreferredPath')"
    } else {
        Write-Warning "Default preferred path '$defaultPreferredPath' is not a valid M&A Discovery Suite location (missing required subdirectories or path does not exist)."
        
        # 3. Fallback to auto-detection based on script location
        $autoDetectedPath = ""
        try {
            # $PSScriptRoot is the directory where this script (Set-SuiteEnvironment.ps1) resides.
            # The parent of the 'Scripts' directory is the SuiteRoot.
            if ($PSScriptRoot) {
                 $autoDetectedPath = Split-Path $PSScriptRoot -Parent
            } else {
                # Fallback if $PSScriptRoot is not available (e.g., running a snippet in ISE without saving)
                # This is less reliable and assumes a certain CWD.
                $autoDetectedPath = Split-Path (Get-Location).Path -Parent
                Write-Warning "\$PSScriptRoot was not available. Attempting to auto-detect SuiteRoot based on current working directory's parent: '$autoDetectedPath'. This might be unreliable."
            }
           
            Write-Verbose "Attempting to auto-detect SuiteRoot based on script location: '$autoDetectedPath'."
            if (Test-MandASuiteStructure -PathToTest $autoDetectedPath) {
                $SuiteRoot = $autoDetectedPath
                $determinedBy = "auto-detection relative to script location ('$autoDetectedPath')"
            } else {
                throw "Error: Auto-detection failed. The path '$autoDetectedPath' (derived from script location) does not contain the required M&A Discovery Suite structure. Please ensure the suite is correctly placed or provide the -SuiteRoot parameter."
            }
        } catch {
            throw "CRITICAL Error: Could not determine a valid SuiteRoot. Tried default path '$defaultPreferredPath' and auto-detection. Last auto-detected attempt was '$autoDetectedPath'. Please ensure the M&A Discovery Suite files are correctly structured and accessible, or specify the -SuiteRoot parameter. Original error: $($_.Exception.Message)"
        }
    }
}

# Final validation of the determined SuiteRoot
if ([string]::IsNullOrWhiteSpace($SuiteRoot) -or (-not (Test-Path $SuiteRoot -PathType Container))) {
    throw "CRITICAL Error: Failed to establish a valid M&A Discovery SuiteRoot. The determined path '$SuiteRoot' is invalid or could not be resolved."
}

# --- Set Global Variables for the Suite ---
# These variables will be available in the scope that dot-sources this script.

$global:MandASuiteRoot = $SuiteRoot
$global:MandACorePath = Join-Path $SuiteRoot "Core"
$global:MandAConfigPath = Join-Path $SuiteRoot "Configuration"
$global:MandAScriptsPath = Join-Path $SuiteRoot "Scripts" # This script itself is in here
$global:MandAModulesPath = Join-Path $SuiteRoot "Modules"
$global:MandADocumentationPath = Join-Path $SuiteRoot "Documentation" # Added for completeness

# Module-specific paths (subdirectories under Modules)
$global:MandAAuthModulesPath = Join-Path $global:MandAModulesPath "Authentication"
$global:MandAConnectivityModulesPath = Join-Path $global:MandAModulesPath "Connectivity"
$global:MandADiscoveryModulesPath = Join-Path $global:MandAModulesPath "Discovery"
$global:MandAProcessingModulesPath = Join-Path $global:MandAModulesPath "Processing"
$global:MandAExportModulesPath = Join-Path $global:MandAModulesPath "Export"
$global:MandAUtilitiesModulesPath = Join-Path $global:MandAModulesPath "Utilities"

# Key file paths for easy reference by other scripts
$global:MandAOrchestratorPath = Join-Path $global:MandACorePath "MandA-Orchestrator.ps1"
$global:MandADefaultConfigPath = Join-Path $global:MandAConfigPath "default-config.json"
$global:MandAQuickStartPath = Join-Path $global:MandAScriptsPath "QuickStart.ps1"
$global:MandAValidationScriptPath = Join-Path $global:MandAScriptsPath "Validate-Installation.ps1"
$global:MandAAppRegScriptPath = Join-Path $global:MandAScriptsPath "Setup-AppRegistration.ps1"


# --- Helper Functions Exported to Global Scope (Optional) ---
# These functions can be called by scripts that dot-source this environment setup.

function Get-MandAModulePath {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("Authentication", "Connectivity", "Discovery", "Processing", "Export", "Utilities")]
        [string]$Category,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName # Should be the filename without .psm1 extension
    )
    
    $categoryPath = ""
    switch ($Category) {
        "Authentication" { $categoryPath = $global:MandAAuthModulesPath }
        "Connectivity" { $categoryPath = $global:MandAConnectivityModulesPath }
        "Discovery" { $categoryPath = $global:MandADiscoveryModulesPath }
        "Processing" { $categoryPath = $global:MandAProcessingModulesPath }
        "Export" { $categoryPath = $global:MandAExportModulesPath }
        "Utilities" { $categoryPath = $global:MandAUtilitiesModulesPath }
        default { throw "Invalid module category: $Category" }
    }
    
    $moduleFilePath = Join-Path $categoryPath "$ModuleName.psm1"
    if (-not (Test-Path $moduleFilePath -PathType Leaf)) {
        Write-Warning "Module file '$ModuleName.psm1' not found in category '$Category' at '$moduleFilePath'."
        return $null
    }
    return $moduleFilePath
}
Export-ModuleMember -Function Get-MandAModulePath # Makes this function available

function Resolve-MandAConfigPath {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigFile # Can be a relative path (to SuiteRoot) or an absolute path
    )
    
    if ([System.IO.Path]::IsPathRooted($ConfigFile)) {
        if (Test-Path $ConfigFile -PathType Leaf) {
            return $ConfigFile
        } else {
            throw "Absolute configuration file path does not exist: '$ConfigFile'"
        }
    } else {
        $resolvedPath = Join-Path $global:MandASuiteRoot $ConfigFile
        if (Test-Path $resolvedPath -PathType Leaf) {
            return $resolvedPath
        } else {
            throw "Relative configuration file path '$ConfigFile' (resolved to '$resolvedPath') does not exist within SuiteRoot."
        }
    }
}
Export-ModuleMember -Function Resolve-MandAConfigPath # Makes this function available

# --- Display Setup Information ---
Write-Host "M&A Discovery Suite Environment Setup Initialized" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "SuiteRoot determined by: $determinedBy" -ForegroundColor DarkGray
Write-Host "Suite Root Path      : $($global:MandASuiteRoot)" -ForegroundColor Green
Write-Host "Core Path            : $($global:MandACorePath)" -ForegroundColor Gray
Write-Host "Modules Path         : $($global:MandAModulesPath)" -ForegroundColor Gray
Write-Host "Scripts Path         : $($global:MandAScriptsPath)" -ForegroundColor Gray
Write-Host "Configuration Path   : $($global:MandAConfigPath)" -ForegroundColor Gray
Write-Host "Documentation Path   : $($global:MandADocumentationPath)" -ForegroundColor Gray
Write-Host ""
Write-Host "Global environment variables for M&A Discovery Suite have been set." -ForegroundColor Green
Write-Host "You can now use variables like `$global:MandASuiteRoot, `$global:MandAOrchestratorPath`, etc." -ForegroundColor White
Write-Host "Helper functions like Get-MandAModulePath and Resolve-MandAConfigPath are available." -ForegroundColor White
Write-Host ""

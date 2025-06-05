#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Validation Helper Functions.
    Provides common functions for validating configurations, prerequisites, data formats,
    and includes a robust PSCustomObject-to-Hashtable converter.
.NOTES
    Author: Lukian Poleschtschuk & Gemini
    Version: 1.2.5 (Added Test-DiscoveryPrerequisites stub, context usage refined)
    Created: 2025-06-03
    Last Modified: 2025-06-05
#>

# This module uses $global:_MandALoadingContext for its own module-scope initialization if needed.
# Exported functions should accept $Context or $Configuration parameters for logging and operations.

# --- Internal Helper for Logging Fallback ---
# This internal logger uses $global:MandA if available, otherwise basic Write-Host.
# It's for use by functions WITHIN this module.
function _ValidationLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [MandAContext]$FunctionContext = $null # Context passed to the public function
    )
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        # Prefer context passed to the function, fallback to global, then to config from global
        $effectiveContext = $FunctionContext
        if ($null -eq $effectiveContext -and $global:MandA) {
            $effectiveContext = $global:MandA 
        }
        
        try {
            # Write-MandALog expects a -Context parameter which should be the MandAContext object
            # or a hashtable configuration if MandAContext is not available.
            if ($effectiveContext -is [PSCustomObject] -or $effectiveContext -is [hashtable]) { # Check if it's a simple context/config
                 Write-MandALog -Message $Message -Level $Level -Component "ValidationHelpers" -Configuration $effectiveContext
            } elseif ($effectiveContext -is [MandAContext]) {
                 Write-MandALog -Message $Message -Level $Level -Component "ValidationHelpers" -Context $effectiveContext
            } else {
                # Fallback if context is not the expected type, try using global config if available
                if ($global:MandA -and $global:MandA.Config) {
                    Write-MandALog -Message $Message -Level $Level -Component "ValidationHelpers" -Configuration $global:MandA.Config
                } else {
                     Write-Host "[$Level] (ValidationHelpers - Write-MandALog: No suitable config) $Message"
                }
            }
        } catch {
            Write-Host "[$Level] (ValidationHelpers - Write-MandALog Call Failed: $($_.Exception.Message)) $Message"
        }
    } else {
        Write-Host "[$Level] (ValidationHelpers - Write-MandALog not found) $Message"
    }
}


# --- Public Functions ---

# Note: ConvertTo-HashtableRecursiveInternal was renamed to ConvertTo-HashtableRecursive
# and made global in the orchestrator or Set-SuiteEnvironment. If it's needed here internally,
# it should be aliased or called as global:ConvertTo-HashtableRecursive.
# For simplicity, assuming it's globally available if this module needs it.
# If this module is self-contained, it would define its own version.

function Test-Prerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context, # Pass the full context for logging and path access
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnly # Though this switch's direct utility here might be limited
    )
    _ValidationLog -Message "Validating system prerequisites..." -Level "INFO" -FunctionContext $Context
    $allChecksPass = $true
    
    if ($PSVersionTable.PSVersion.Major -lt 5 -or ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        _ValidationLog -Message "PowerShell version 5.1 or higher is required. Current version: $($PSVersionTable.PSVersion.ToString())" -Level "ERROR" -FunctionContext $Context
        $allChecksPass = $false
    } else {
        _ValidationLog -Message "PowerShell version check passed: $($PSVersionTable.PSVersion.ToString())" -Level "DEBUG" -FunctionContext $Context
    }

    if ($null -eq $Context.Paths.SuiteRoot -or -not (Test-Path $Context.Paths.SuiteRoot -PathType Container)) {
        _ValidationLog -Message "Context.Paths.SuiteRoot is not set or invalid: '$($Context.Paths.SuiteRoot)'." -Level "ERROR" -FunctionContext $Context
        $allChecksPass = $false
    } else {
        _ValidationLog -Message "Suite Root Path check passed: $($Context.Paths.SuiteRoot)" -Level "DEBUG" -FunctionContext $Context
    }
    
    # Use resolved CompanyProfileRoot from Context for output path check
    $companyProfileOutputPath = $Context.Paths.CompanyProfileRoot 
    if ([string]::IsNullOrWhiteSpace($companyProfileOutputPath)) {
         _ValidationLog -Message "Context.Paths.CompanyProfileRoot is not defined. Skipping write access check for primary output." -Level "WARN" -FunctionContext $Context
    } else {
        if (-not (Test-DirectoryWriteAccess -DirectoryPath $companyProfileOutputPath -Context $Context)) {
            _ValidationLog -Message "Write access check failed for primary output path: '$companyProfileOutputPath'." -Level "ERROR" -FunctionContext $Context
            $allChecksPass = $false
        } else {
            _ValidationLog -Message "Output path write access check passed for '$companyProfileOutputPath'." -Level "DEBUG" -FunctionContext $Context
        }
    }

    if ($allChecksPass) {
        _ValidationLog -Message "All prerequisites validated successfully" -Level "SUCCESS" -FunctionContext $Context
    } else {
        _ValidationLog -Message "One or more prerequisite checks failed." -Level "ERROR" -FunctionContext $Context
    }
    return $allChecksPass
}

function Test-DiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context
    )
    _ValidationLog -Message "Validating Discovery Phase prerequisites..." -Level "INFO" -FunctionContext $Context
    $issues = [System.Collections.Generic.List[string]]::new()

    # 1. Check global environment (already done by orchestrator before calling this)
    if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
        $issues.Add("Global environment `$global:MandA` is not initialized by Set-SuiteEnvironment.ps1.")
    }

    # 2. Check MandAContext object passed to this function
    if ($null -eq $Context) {
        $issues.Add("MandAContext object is null.")
    } else {
        if ($null -eq $Context.Paths) {
            $issues.Add("Context.Paths is null.")
        } else {
            $criticalPaths = @('Modules', 'Discovery', 'RawDataOutput', 'Utilities', 'LogOutput')
            foreach ($pathKey in $criticalPaths) {
                if (-not $Context.Paths.ContainsKey($pathKey)) {
                    $issues.Add("Context.Paths is missing key: '$pathKey'.")
                } elseif ([string]::IsNullOrWhiteSpace($Context.Paths[$pathKey])) {
                    $issues.Add("Context.Paths.'$pathKey' is empty or whitespace.")
                } elseif (-not (Test-Path $Context.Paths[$pathKey])) {
                     # For output paths, they are created by Initialize-MandAEnvironment.
                     # For module paths, their existence is critical.
                    if ($pathKey -in @('Modules', 'Discovery', 'Utilities')) {
                        $issues.Add("Critical path for '$pathKey' does not exist: '$($Context.Paths[$pathKey])'.")
                    }
                }
            }
        }
        if ($null -eq $Context.Config) {
            $issues.Add("Context.Config is null.")
        } else {
            if (-not ($Context.Config.discovery -and $Context.Config.discovery.enabledSources -is [array])) {
                $issues.Add("Context.Config.discovery.enabledSources is missing or not an array.")
            }
        }
        if ($null -eq $Context.ErrorCollector) {
             $issues.Add("Context.ErrorCollector is null.")
        }
    }
    
    # 3. Check RawDataOutput directory write access
    if ($Context -and $Context.Paths -and $Context.Paths.RawDataOutput) {
        if (-not (Test-DirectoryWriteAccess -DirectoryPath $Context.Paths.RawDataOutput -Context $Context)) {
            $issues.Add("Cannot write to RawDataOutput directory: '$($Context.Paths.RawDataOutput)'. Check permissions.")
        }
    }

    # 4. Check if core authentication and connection functions are available
    # This assumes Authentication and Connectivity modules are loaded by Initialize-MandAEnvironment before this check.
    $requiredAuthFunctions = @("Initialize-MandAAuthentication", "Initialize-AllConnections")
    foreach ($funcName in $requiredAuthFunctions) {
        if (-not (Get-Command $funcName -ErrorAction SilentlyContinue)) {
            $issues.Add("Required authentication/connection function '$funcName' not found. Ensure relevant modules (Authentication, Connectivity) are loaded.")
        }
    }
    
    if ($issues.Count -gt 0) {
        _ValidationLog -Message "[CRITICAL] Discovery Prerequisites Failed:" -Level "ERROR" -FunctionContext $Context
        foreach ($issue in $issues) {
            _ValidationLog -Message "  - $issue" -Level "ERROR" -FunctionContext $Context
        }
        return $false
    }
    _ValidationLog -Message "Discovery prerequisites passed." -Level "SUCCESS" -FunctionContext $Context
    return $true
}


function Get-RequiredModules { # This function might be less critical if modules are loaded by orchestrator
    [CmdletBinding()] param( [Parameter(Mandatory=$true)] [hashtable]$Configuration, [Parameter(Mandatory=$true)] [string]$Mode, [Parameter(Mandatory=$false)][MandAContext]$Context = $null )
    _ValidationLog -Message "Determining required modules for Mode: $Mode" -Level "DEBUG" -FunctionContext $Context
    # ... (implementation as before, but use _ValidationLog with $Context)
    return @() # Placeholder
}

function Test-GuidFormat { param( [string]$InputString ); return $InputString -match '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' }
function Test-EmailFormat { param( [string]$EmailAddress ); return $EmailAddress -match '^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$' }
function Test-UPNFormat { param( [string]$UserPrincipalName ); return Test-EmailFormat -EmailAddress $UserPrincipalName }

function Test-ConfigurationFile {
    [CmdletBinding()] param( [string]$ConfigurationPath, [MandAContext]$Context = $null) # Allow passing context for logging
    try {
        if (-not (Test-Path $ConfigurationPath -PathType Leaf)) { _ValidationLog -Message "Config file not found: $ConfigurationPath" -Level "ERROR" -FunctionContext $Context; return $false }
        $configObject = Get-Content $ConfigurationPath -Raw | ConvertFrom-Json -EA Stop
        # Assuming ConvertTo-HashtableRecursiveInternal is available globally or defined in this module
        $configHashtable = ConvertTo-HashtableRecursiveInternal -obj $configObject 

        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        foreach ($section in $requiredSections) {
            if (-not $configHashtable.ContainsKey($section)) { # Adjusted for hashtable
                _ValidationLog -Message "Missing section: '$section' in $ConfigurationPath" -Level "ERROR" -FunctionContext $Context; return $false
            }
        }
        if (-not $configHashtable.environment.ContainsKey('outputPath') -or [string]::IsNullOrWhiteSpace($configHashtable.environment.outputPath)) { _ValidationLog -Message "Missing: environment.outputPath" -Level "ERROR" -FunctionContext $Context; return $false }
        if (-not $configHashtable.discovery.ContainsKey('enabledSources') -or ($configHashtable.discovery.enabledSources -isnot [array]) -or $configHashtable.discovery.enabledSources.Count -eq 0) { _ValidationLog -Message "'discovery.enabledSources' must be non-empty array." -Level "ERROR" -FunctionContext $Context; return $false }
        _ValidationLog -Message "Config file '$ConfigurationPath' basic structure OK." -Level "SUCCESS" -FunctionContext $Context; return $true
    } catch { _ValidationLog -Message "Config file validation failed for '$ConfigurationPath': $($_.Exception.Message)" -Level "ERROR" -FunctionContext $Context; return $false }
}

function Test-DirectoryWriteAccess {
    [CmdletBinding()] param( [string]$DirectoryPath, [MandAContext]$Context = $null ) # Allow passing context for logging
    try {
        if (-not (Test-Path $DirectoryPath -PathType Container)) {
            _ValidationLog -Message "Directory '$DirectoryPath' does not exist. Attempting to create." -Level "INFO" -FunctionContext $Context
            New-Item -Path $DirectoryPath -ItemType Directory -Force -EA Stop | Out-Null
            _ValidationLog -Message "Directory '$DirectoryPath' created." -Level "SUCCESS" -FunctionContext $Context
        }
        $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
        Set-Content -Path $testFile -Value "test_$(Get-Date)" -Encoding UTF8 -EA Stop
        if (Test-Path $testFile -PathType Leaf) { Remove-Item $testFile -Force -EA SilentlyContinue; return $true } 
        else { _ValidationLog -Message "Failed to create test file in $DirectoryPath." -Level "ERROR" -FunctionContext $Context; return $false }
    } catch { _ValidationLog -Message "Dir write access test failed for '$DirectoryPath': $($_.Exception.Message)" -Level "ERROR" -FunctionContext $Context; return $false }
}

# Test-ModuleAvailability, Test-NetworkConnectivity, Test-DataQuality, Export-ValidationReport can remain similar
# but ensure they use _ValidationLog -FunctionContext $Context if they need to log and accept $Context as a parameter.

# Add HashtableContains to the type data for hashtables if not already present
# This needs to be done carefully if multiple modules try to do it.
# Best placed in a module that's guaranteed to load once, very early, or by Set-SuiteEnvironment.ps1.
# For now, keep it here but add a guard.
if (-not ([hashtable]::new().PSObject.Methods.Name -contains 'HashtableContains')) {
    try {
        Update-TypeData -TypeName System.Collections.Hashtable -MemberName HashtableContains -MemberType ScriptMethod -Value { param([string]$Key) return $this.ContainsKey($Key) } -Force
        Write-Host "[DEBUG] (ValidationHelpers) Added 'HashtableContains' method to System.Collections.Hashtable." -ForegroundColor Gray
    } catch {
        Write-Warning "[WARN] (ValidationHelpers) Error adding 'HashtableContains' method: $($_.Exception.Message)"
    }
}

Export-ModuleMember -Function Test-Prerequisites, Test-DiscoveryPrerequisites, Get-RequiredModules, Test-GuidFormat, Test-EmailFormat, Test-UPNFormat, Test-ConfigurationFile, Test-DirectoryWriteAccess #, Test-ModuleAvailability, Test-NetworkConnectivity, Test-DataQuality, Export-ValidationReport

Write-Host "ValidationHelpers.psm1 (v1.2.5) loaded." -ForegroundColor DarkCyan

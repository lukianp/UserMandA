#Requires -Version 5.1
<#
.SYNOPSIS
    Universal Discovery Module Launcher for M&A Discovery Suite

.DESCRIPTION
    This script dynamically loads and executes any discovery module with proper company profile context.

.PARAMETER ModuleName
    Name of the discovery module to execute (e.g., "IntuneDiscovery", "AzureDiscovery")

.PARAMETER CompanyName
    Name of the company profile to use for discovery

.PARAMETER TenantId
    Azure AD Tenant ID (optional)

.PARAMETER ClientId
    Azure AD Client ID (optional)

.PARAMETER ClientSecret
    Azure AD Client Secret (optional)

.EXAMPLE
    .\DiscoveryModuleLauncher.ps1 -ModuleName "IntuneDiscovery" -CompanyName "Contoso"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$ModuleName,
    
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$TenantId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientSecret
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

try {
    Write-Host "=== $ModuleName Discovery ===" -ForegroundColor Cyan
    Write-Host "Company: $CompanyName" -ForegroundColor White
    Write-Host "Starting discovery..." -ForegroundColor Yellow
    Write-Host ""
    
    # Get script root path
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $RootPath = Split-Path -Parent $ScriptRoot
    $ModulesPath = Join-Path $RootPath "Modules"
    
    # Import required modules
    Write-Host "Loading modules..." -ForegroundColor Yellow
    Import-Module (Join-Path $ModulesPath "Core\ClassDefinitions.psm1") -Force -ErrorAction SilentlyContinue
    Import-Module (Join-Path $ModulesPath "Core\CompanyProfileManager.psm1") -Force -ErrorAction SilentlyContinue
    Import-Module (Join-Path $ModulesPath "Core\CredentialLoader.psm1") -Force -ErrorAction SilentlyContinue
    Import-Module (Join-Path $ModulesPath "Authentication\SessionManager.psm1") -Force -ErrorAction SilentlyContinue
    Import-Module (Join-Path $ModulesPath "Authentication\AuthenticationService.psm1") -Force -ErrorAction SilentlyContinue
    Import-Module (Join-Path $ModulesPath "Discovery\$ModuleName.psm1") -Force
    
    # Initialize company profile
    Write-Host "Initializing company profile..." -ForegroundColor Yellow
    $profileManager = Get-CompanyProfileManager -CompanyName $CompanyName
    $profilePaths = $profileManager.GetProfilePaths()
    
    # Create discovery context
    $context = @{
        Paths = @{
            RawDataOutput = $profilePaths.Raw
        }
        CompanyName = $CompanyName
        DiscoverySession = [guid]::NewGuid().ToString()
    }
    # Hint to modules to avoid doing their own CSV export
    $context.DisableInternalExport = $true
    
    Write-Host "Discovery context created:" -ForegroundColor Green
    Write-Host "Path: $($context.Paths.RawDataOutput)" -ForegroundColor Gray
    Write-Host "Session: $($context.DiscoverySession)" -ForegroundColor Gray
    Write-Host ""
    
    # Load credentials from company profile
    Write-Host "Loading credentials..." -ForegroundColor Yellow
    try {
        $credentials = Get-CompanyCredentials -CompanyName $CompanyName
        Write-Host "Credentials loaded successfully" -ForegroundColor Green
        
        # Test credential expiry
        $expiryCheck = Test-CredentialExpiry -Credentials $credentials
        if (-not $expiryCheck.Valid) {
            throw "Credential validation failed: $($expiryCheck.Message)"
        }
        if ($expiryCheck.ContainsKey('Warning') -and $expiryCheck.Warning) {
            Write-Warning $expiryCheck.Message
        }
    }
    catch {
        Write-Host "Failed to load credentials from profile, falling back to parameters..." -ForegroundColor Yellow
        $credentials = @{
            TenantId = $TenantId
            ClientId = $ClientId
            ClientSecret = $ClientSecret
        }
    }
    
    # Create configuration
    $configuration = @{
        TenantId = $credentials.TenantId
        ClientId = $credentials.ClientId
        ClientSecret = $credentials.ClientSecret
        CompanyName = $CompanyName
    }
    
    # Display configuration (without secrets)
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "Tenant ID: $($credentials.TenantId -replace '.', '*')" -ForegroundColor Gray
    Write-Host "Client ID: $($credentials.ClientId -replace '.', '*')" -ForegroundColor Gray
    Write-Host ""
    
    # Initialize authentication service
    Write-Host "Initializing authentication..." -ForegroundColor Yellow
    
    # Re-import AuthenticationService to ensure functions are available
    Import-Module (Join-Path $ModulesPath "Authentication\AuthenticationService.psm1") -Force
    
    try {
        $authResult = Initialize-AuthenticationService -Configuration $configuration
        # Access hashtable keys safely to avoid StrictMode property issues
        $authSuccess = $null
        $authSessionId = $null
        if ($authResult -is [hashtable]) {
            $authSuccess = $authResult['Success']
            $authSessionId = $authResult['SessionId']
        } else {
            # Fallback to property access if not a hashtable
            $authSuccess = try { $authResult.Success } catch { $null }
            $authSessionId = try { $authResult.SessionId } catch { $null }
        }

        if (-not $authSuccess) {
            $authError = if ($authResult -is [hashtable]) { $authResult['Error'] } else { try { $authResult.Error } catch { $null } }
            throw "Authentication initialization failed: $authError"
        }
        Write-Host "Authentication initialized successfully" -ForegroundColor Green
        
        # Update context with authenticated session ID
        $context.DiscoverySession = $authSessionId
    } catch {
        Write-Host "Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
    
    # Execute discovery based on module name
    $functionName = "Invoke-$ModuleName"
    
    Write-Host "Starting $ModuleName discovery..." -ForegroundColor Cyan
    Write-Host ""
    
    # Call the discovery function
    $discoveryResult = & $functionName -Configuration $configuration -Context $context -SessionId $context.DiscoverySession

    # Normalize/guard discovery result shape to avoid property access errors under StrictMode
    # - Some modules may accidentally emit extra pipeline items (arrays)
    # - Some modules may return PSCustomObject without expected properties
    if ($null -ne $discoveryResult -and ($discoveryResult -is [System.Collections.IEnumerable]) -and -not ($discoveryResult -is [string])) {
        # Convert enumerable to array and try to pick the most relevant object
        $drArray = @($discoveryResult)
        # Prefer the first object that looks like a DiscoveryResult (by type or by presence of 'Success')
        $drCandidate = $drArray | Where-Object { $_ -is [DiscoveryResult] } | Select-Object -First 1
        if (-not $drCandidate) {
            $drCandidate = $drArray | Where-Object { $_.PSObject -and $_.PSObject.Properties['Success'] } | Select-Object -First 1
        }
        if ($drCandidate) { $discoveryResult = $drCandidate }
    }
    
    # Process and save discovery data (safe property access under StrictMode)
    $drPsObj = if ($null -ne $discoveryResult) { $discoveryResult.PSObject } else { $null }
    $propSuccess = if ($drPsObj) { $drPsObj.Properties['Success'] } else { $null }
    $propData = if ($drPsObj) { $drPsObj.Properties['Data'] } else { $null }

    if ($propSuccess -and $propSuccess.Value -and $propData -and $propData.Value) {
        Write-Host "Processing and saving discovery data..." -ForegroundColor Yellow
        
        # Import the Export-DiscoveryResults function
        Import-Module (Join-Path $ModulesPath "Discovery\DiscoveryBase.psm1") -Force
        
        # Process each data group and save as CSV
        $totalExported = 0
        foreach ($dataGroup in $propData.Value) {
            if ($dataGroup.Group -and $dataGroup.Group.Count -gt 0) {
                $fileName = "$($dataGroup.Name).csv"
                $exported = Export-DiscoveryResults -Data $dataGroup.Group -FileName $fileName -OutputPath $context.Paths.RawDataOutput -ModuleName $ModuleName -SessionId $context.DiscoverySession
                if ($exported) {
                    Write-Host "[OK] Saved $($dataGroup.Group.Count) $($dataGroup.Name) records to $fileName" -ForegroundColor Green
                    $totalExported += $dataGroup.Group.Count
                } else {
                    Write-Host "[ERROR] Failed to save $($dataGroup.Name) data" -ForegroundColor Red
                }
            }
        }
        
        Write-Host "Successfully exported $totalExported total records to CSV files" -ForegroundColor Green
        Write-Host ""
    }
    
    # Display results
    Write-Host ""
    Write-Host "=== Discovery Results ===" -ForegroundColor Cyan
    
    # Display results (safe property access)
    $propRecordCount = if ($drPsObj) { $drPsObj.Properties['RecordCount'] } else { $null }
    $propErrors = if ($drPsObj) { $drPsObj.Properties['Errors'] } else { $null }
    $propWarnings = if ($drPsObj) { $drPsObj.Properties['Warnings'] } else { $null }

    if ($propSuccess -and $propSuccess.Value) {
        Write-Host "Status: SUCCESS" -ForegroundColor Green
        $totalRecordsDisplay = $null
        $propMetadata = if ($drPsObj) { $drPsObj.Properties['Metadata'] } else { $null }
        if ($propMetadata -and $propMetadata.Value -and ($propMetadata.Value.ContainsKey('TotalRecords'))) {
            $totalRecordsDisplay = $propMetadata.Value['TotalRecords']
        } elseif ($propRecordCount -and $propRecordCount.Value) {
            $totalRecordsDisplay = $propRecordCount.Value
        }
        if ($null -ne $totalRecordsDisplay) {
            Write-Host "Total Records: $totalRecordsDisplay" -ForegroundColor White
        }
    } elseif ($propErrors -and $propErrors.Value -and $propErrors.Value.Count -gt 0) {
        Write-Host "Status: FAILED" -ForegroundColor Red
        Write-Host "Error Count: $($propErrors.Value.Count)" -ForegroundColor Red
        $warningCount = if ($propWarnings -and $propWarnings.Value) { $propWarnings.Value.Count } else { 0 }
        Write-Host "Warning Count: $warningCount" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Errors:" -ForegroundColor Red
        foreach ($errorItem in $propErrors.Value) {
            Write-Host "  $($errorItem.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Status: NO DATA" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== Discovery Complete ===" -ForegroundColor Cyan
    Write-Host "You can now refresh the GUI to see the discovered data." -ForegroundColor White
    Write-Host "Script completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to close this window..." -ForegroundColor White
    Read-Host

} catch {
    Write-Host ""
    Write-Host "=== Discovery Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Script completed with errors!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to close this window..." -ForegroundColor White
    Read-Host
    exit 1
}

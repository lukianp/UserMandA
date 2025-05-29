<#
.SYNOPSIS
    Validation helpers for M&A Discovery Suite
.DESCRIPTION
    Provides input validation and data quality checks
#>


function Get-RequiredModules {
    param([hashtable]$Configuration, [string]$Mode)
    $suiteRoot = if ($global:MandASuiteRoot) { $global:MandASuiteRoot } else { "C:\UserMigration" }
    $baseModules = @(
        "Modules\Utilities\EnhancedLogging.psm1",
        "Modules\Utilities\ErrorHandling.psm1", 
        "Modules\Utilities\ValidationHelpers.psm1",
        "Modules\Utilities\FileOperations.psm1",
        "Modules\Utilities\ProgressTracking.psm1",
        "Modules\Authentication\Authentication.psm1",
        "Modules\Connectivity\EnhancedConnectionManager.psm1"
    )
    return $baseModules | ForEach-Object { Join-Path $suiteRoot $_ }
}





function Test-GuidFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$InputString
    )
    
    $guidPattern = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return $InputString -match $guidPattern
}

function Test-EmailFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$EmailAddress
    )
    
    $emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return $EmailAddress -match $emailPattern
}

function Test-UPNFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$UserPrincipalName
    )
    
    # UPN format: user@domain.com
    return Test-EmailFormat -EmailAddress $UserPrincipalName
}

function Test-ConfigurationFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigurationPath
    )
    
    try {
        if (-not (Test-Path $ConfigurationPath)) {
            Write-MandALog "Configuration file not found: $ConfigurationPath" -Level "ERROR"
            return $false
        }
        
        $config = Get-Content $ConfigurationPath | ConvertFrom-Json -AsHashtable -ErrorAction Stop
        
        # Validate required sections
        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        foreach ($section in $requiredSections) {
            if (-not $config.ContainsKey($section)) {
                Write-MandALog "Missing required configuration section: $section" -Level "ERROR"
                return $false
            }
        }
        
        # Validate environment section
        $envConfig = $config.environment
        if (-not $envConfig.outputPath) {
            Write-MandALog "Missing required configuration: environment.outputPath" -Level "ERROR"
            return $false
        }
        
        if (-not $envConfig.logLevel) {
            Write-MandALog "Missing required configuration: environment.logLevel" -Level "ERROR"
            return $false
        }
        
        # Validate discovery section
        $discoveryConfig = $config.discovery
        if (-not $discoveryConfig.enabledSources -or $discoveryConfig.enabledSources.Count -eq 0) {
            Write-MandALog "No discovery sources enabled in configuration" -Level "ERROR"
            return $false
        }
        
        Write-MandALog "Configuration file validation passed" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Configuration file validation failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-DirectoryWriteAccess {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath
    )
    
    try {
        # Create directory if it doesn't exist
        if (-not (Test-Path $DirectoryPath)) {
            New-Item -Path $DirectoryPath -ItemType Directory -Force | Out-Null
        }
        
        # Test write access by creating a temporary file
        $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -Force -ErrorAction SilentlyContinue
        
        return $true
        
    } catch {
        Write-MandALog "Directory write access test failed for $DirectoryPath`: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-ModuleAvailability {
    param(
        [Parameter(Mandatory=$true)]
        [array]$ModuleNames
    )
    
    $missingModules = @()
    
    foreach ($moduleName in $ModuleNames) {
        if (-not (Get-Module -ListAvailable -Name $moduleName)) {
            $missingModules += $moduleName
        }
    }
    
    if ($missingModules.Count -gt 0) {
        Write-MandALog "Missing required modules: $($missingModules -join ', ')" -Level "ERROR"
        return $false
    }
    
    return $true
}

function Test-NetworkConnectivity {
    param(
        [Parameter(Mandatory=$true)]
        [array]$Endpoints
    )
    
    $failedEndpoints = @()
    
    foreach ($endpoint in $Endpoints) {
        try {
            $result = Test-NetConnection -ComputerName $endpoint -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
            if (-not $result) {
                $failedEndpoints += $endpoint
            }
        } catch {
            $failedEndpoints += $endpoint
        }
    }
    
    if ($failedEndpoints.Count -gt 0) {
        Write-MandALog "Network connectivity failed for: $($failedEndpoints -join ', ')" -Level "ERROR"
        return $false
    }
    
    return $true
}

function Test-DataQuality {
    param(
        [Parameter(Mandatory=$true)]
        [array]$Data,
        
        [Parameter(Mandatory=$true)]
        [array]$RequiredFields,
        
        [Parameter(Mandatory=$false)]
        [string]$DataType = "Records"
    )
    
    try {
        Write-MandALog "Performing data quality validation for $DataType" -Level "INFO"
        
        if ($Data.Count -eq 0) {
            Write-MandALog "No $DataType found for validation" -Level "WARN"
            return @{
                IsValid = $true
                TotalRecords = 0
                ValidRecords = 0
                InvalidRecords = 0
                Issues = @()
            }
        }
        
        $validRecords = 0
        $invalidRecords = 0
        $issues = @()
        
        foreach ($record in $Data) {
            $recordValid = $true
            $recordIssues = @()
            
            # Check required fields
            foreach ($field in $RequiredFields) {
                if (-not $record.$field -or [string]::IsNullOrWhiteSpace($record.$field)) {
                    $recordValid = $false
                    $recordIssues += "Missing required field: $field"
                }
            }
            
            # Validate specific field formats
            if ($record.UserPrincipalName -and -not (Test-UPNFormat -UserPrincipalName $record.UserPrincipalName)) {
                $recordValid = $false
                $recordIssues += "Invalid UPN format: $($record.UserPrincipalName)"
            }
            
            if ($record.Mail -and -not (Test-EmailFormat -EmailAddress $record.Mail)) {
                $recordValid = $false
                $recordIssues += "Invalid email format: $($record.Mail)"
            }
            
            if ($recordValid) {
                $validRecords++
            } else {
                $invalidRecords++
                $issues += @{
                    Record = $record
                    Issues = $recordIssues
                }
            }
        }
        
        $qualityScore = if ($Data.Count -gt 0) { ($validRecords / $Data.Count) * 100 } else { 100 }
        
        Write-MandALog "$DataType quality validation completed" -Level "SUCCESS"
        Write-MandALog "Total Records: $($Data.Count)" -Level "INFO"
        Write-MandALog "Valid Records: $validRecords" -Level "INFO"
        Write-MandALog "Invalid Records: $invalidRecords" -Level "INFO"
        Write-MandALog "Quality Score: $([math]::Round($qualityScore, 2))%" -Level "INFO"
        
        if ($invalidRecords -gt 0) {
            Write-MandALog "Data quality issues found. Review the validation report." -Level "WARN"
        }
        
        return @{
            IsValid = ($qualityScore -ge 90)
            TotalRecords = $Data.Count
            ValidRecords = $validRecords
            InvalidRecords = $invalidRecords
            QualityScore = $qualityScore
            Issues = $issues
        }
        
    } catch {
        Write-MandALog "Data quality validation failed: $($_.Exception.Message)" -Level "ERROR"
        return @{
            IsValid = $false
            TotalRecords = 0
            ValidRecords = 0
            InvalidRecords = 0
            QualityScore = 0
            Issues = @("Validation process failed: $($_.Exception.Message)")
        }
    }
}

function Export-ValidationReport {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ValidationResults,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [string]$ReportName = "ValidationReport"
    )
    
    try {
        $reportFile = Join-Path $OutputPath "$ReportName`_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
        
        $reportData = @()
        
        foreach ($issue in $ValidationResults.Issues) {
            foreach ($issueDetail in $issue.Issues) {
                $reportData += [PSCustomObject]@{
                    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    RecordIdentifier = if ($issue.Record.UserPrincipalName) { $issue.Record.UserPrincipalName } elseif ($issue.Record.DisplayName) { $issue.Record.DisplayName } else { "Unknown" }
                    Issue = $issueDetail
                    RecordData = ($issue.Record | ConvertTo-Json -Compress)
                }
            }
        }
        
        if ($reportData.Count -gt 0) {
            $reportData | Export-Csv -Path $reportFile -NoTypeInformation -Encoding UTF8
            Write-MandALog "Validation report exported: $reportFile" -Level "SUCCESS"
        }
        
        return $reportFile
        
    } catch {
        Write-MandALog "Failed to export validation report: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Get-RequiredModules',
    'Test-GuidFormat',
    'Test-EmailFormat',
    'Test-UPNFormat',
    'Test-ConfigurationFile',
    'Test-DirectoryWriteAccess',
    'Test-ModuleAvailability',
    'Test-NetworkConnectivity',
    'Test-DataQuality',
    'Export-ValidationReport'
)

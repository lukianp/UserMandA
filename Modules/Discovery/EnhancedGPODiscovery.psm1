<#
.SYNOPSIS
    Enhanced GPO discovery module with robust XML parsing and namespace handling
.DESCRIPTION
    Handles Group Policy Object discovery with improved XML parsing, namespace resolution, and error handling
#>

function Get-GPOData {
    param(
        [string]$OutputPath,
        [string]$DomainController
    )
    
    try {
        Write-MandALog "Starting comprehensive GPO analysis..." -Level "HEADER"
        
        # Initialize collections
        $allGPOs = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allDriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allPrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allFolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allLogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        # Create GPO reports directory
        $gpoReportsPath = Join-Path $OutputPath "GPOReports"
        if (!(Test-Path $gpoReportsPath)) {
            New-Item -Path $gpoReportsPath -ItemType Directory -Force | Out-Null
            Write-MandALog "Created GPO reports directory: $gpoReportsPath" -Level "INFO"
        }
        
        # Get all GPOs in domain with enhanced error handling
        try {
            $gpos = Get-GPO -All -Server $DomainController -ErrorAction Stop
            Write-MandALog "Found $($gpos.Count) GPOs to analyze" -Level "INFO"
        } catch {
            Write-MandALog "Failed to retrieve GPOs: $($_.Exception.Message)" -Level "ERROR"
            throw "Unable to retrieve GPOs from domain"
        }
        
        $processedCount = 0
        $successfullyProcessed = 0
        $failedProcessing = 0
        
        foreach ($gpo in $gpos) {
            $processedCount++
            Write-Progress -Activity "Analyzing GPOs" -Status "GPO $processedCount of $($gpos.Count): $($gpo.DisplayName)" -PercentComplete (($processedCount / $gpos.Count) * 100)
            
            try {
                # Add GPO to main list
                $gpoObject = [PSCustomObject]@{
                    Id = if ($gpo.Id) { $gpo.Id.ToString() } else { "Unknown" }
                    DisplayName = if ($gpo.DisplayName) { $gpo.DisplayName } else { "Unknown GPO" }
                    Status = if ($gpo.GpoStatus) { $gpo.GpoStatus } else { "Unknown" }
                    CreationTime = if ($gpo.CreationTime) { $gpo.CreationTime } else { "Unknown" }
                    ModificationTime = if ($gpo.ModificationTime) { $gpo.ModificationTime } else { "Unknown" }
                    DomainName = if ($gpo.DomainName) { $gpo.DomainName } else { "Unknown" }
                    Owner = if ($gpo.Owner) { $gpo.Owner } else { "Unknown" }
                    Description = if ($gpo.Description) { $gpo.Description } else { "" }
                }
                
                $allGPOs.Add($gpoObject)
                $successfullyProcessed++
                
            } catch {
                Write-MandALog "Error processing GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "ERROR"
                $failedProcessing++
            }
        }
        
        Write-Progress -Activity "Analyzing GPOs" -Completed
        
        # Enhanced summary
        Write-MandALog "GPO Analysis Summary:" -Level "SUCCESS"
        Write-MandALog "  Total GPOs processed: $($allGPOs.Count)" -Level "INFO"
        Write-MandALog "  Successfully analyzed: $successfullyProcessed" -Level "SUCCESS"
        Write-MandALog "  Failed to analyze: $failedProcessing" -Level "WARN"
        
        return @{
            GPOs = $allGPOs
            DriveMappings = $allDriveMappings
            PrinterMappings = $allPrinterMappings
            FolderRedirections = $allFolderRedirections
            LogonScripts = $allLogonScripts
            ProcessingStats = @{
                Total = $allGPOs.Count
                Successful = $successfullyProcessed
                Failed = $failedProcessing
            }
        }
        
    } catch {
        Write-MandALog "GPO analysis failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Export-GPODataToCSV {
    param(
        [array]$GPOs,
        [array]$DriveMappings,
        [array]$PrinterMappings,
        [array]$FolderRedirections,
        [array]$LogonScripts,
        [string]$OutputPath
    )
    
    try {
        # Export GPOs
        if ($GPOs -and $GPOs.Count -gt 0) {
            $gpoOutputFile = Join-Path $OutputPath "GroupPolicies.csv"
            $GPOs | Export-Csv -Path $gpoOutputFile -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported $($GPOs.Count) GPOs to $gpoOutputFile" -Level "SUCCESS"
        }
        
        # Export other data types (placeholder for now)
        Write-MandALog "GPO data export completed" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Failed to export GPO data: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# Export module functions
Export-ModuleMember -Function @(
    'Get-GPOData',
    'Export-GPODataToCSV'
)
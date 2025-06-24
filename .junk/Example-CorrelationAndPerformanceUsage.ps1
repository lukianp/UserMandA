# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Example script demonstrating how to integrate enhanced correlation tracking 
    and performance metrics into existing M&A Discovery Suite operations.
.DESCRIPTION
    This script shows practical examples of how to use the new correlation tracking
    and performance metrics features in real discovery operations.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-09
#>

# Import required modules
Import-Module "$PSScriptRoot\..\Modules\Utilities\EnhancedLogging.psm1" -Force

function Invoke-UserDiscoveryWithTracking {
    <#
    .SYNOPSIS
        Example function showing correlation tracking in user discovery operations.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$TenantId,
        
        [Parameter(Mandatory=$false)]
        [string]$CorrelationId
    )
    
    # Generate correlation ID if not provided
    if ([string]::IsNullOrWhiteSpace($CorrelationId)) {
        $CorrelationId = New-CorrelationId
    }
    
    Write-MandALog -Message "Starting user discovery for tenant: $TenantId" -Level "INFO" -Component "UserDiscovery" -CorrelationId $CorrelationId
    
    # Start performance tracking for the entire operation
    Start-PerformanceTimer -OperationName "UserDiscovery_$TenantId" -CorrelationId $CorrelationId
    
    try {
        # Phase 1: Authentication
        Write-MandALog -Message "Phase 1: Authenticating to tenant" -Level "INFO" -Component "UserDiscovery" -CorrelationId $CorrelationId
        Start-PerformanceTimer -OperationName "Authentication" -CorrelationId $CorrelationId
        
        # Simulate authentication
        Start-Sleep -Milliseconds 500
        
        Stop-PerformanceTimer -OperationName "Authentication" -CorrelationId $CorrelationId
        Write-MandALog -Message "Authentication completed successfully" -Level "SUCCESS" -Component "UserDiscovery" -CorrelationId $CorrelationId
        
        # Phase 2: User enumeration
        Write-MandALog -Message "Phase 2: Enumerating users" -Level "INFO" -Component "UserDiscovery" -CorrelationId $CorrelationId
        Start-PerformanceTimer -OperationName "UserEnumeration" -CorrelationId $CorrelationId
        
        # Simulate user enumeration
        $userCount = Get-Random -Minimum 50 -Maximum 500
        Start-Sleep -Milliseconds (Get-Random -Minimum 200 -Maximum 800)
        
        Stop-PerformanceTimer -OperationName "UserEnumeration" -CorrelationId $CorrelationId
        
        $enumerationData = @{
            UsersFound = $userCount
            TenantId = $TenantId
            EnumerationMethod = "Graph API"
        }
        
        Write-MandALog -Message "User enumeration completed" -Level "SUCCESS" -Component "UserDiscovery" -CorrelationId $CorrelationId -StructuredData $enumerationData
        
        # Phase 3: User details collection
        Write-MandALog -Message "Phase 3: Collecting user details" -Level "INFO" -Component "UserDiscovery" -CorrelationId $CorrelationId
        Start-PerformanceTimer -OperationName "UserDetailsCollection" -CorrelationId $CorrelationId
        
        # Simulate user details collection
        Start-Sleep -Milliseconds (Get-Random -Minimum 300 -Maximum 1000)
        
        Stop-PerformanceTimer -OperationName "UserDetailsCollection" -CorrelationId $CorrelationId
        
        $collectionResults = @{
            ProcessedUsers = $userCount
            SuccessfulCollection = $userCount - (Get-Random -Minimum 0 -Maximum 5)
            Errors = Get-Random -Minimum 0 -Maximum 5
            CollectionRate = "$([math]::Round($userCount / 2.5, 0)) users/second"
        }
        
        Write-MandALog -Message "User details collection completed" -Level "SUCCESS" -Component "UserDiscovery" -CorrelationId $CorrelationId -StructuredData $collectionResults
        
        # Return results
        $discoveryResults = @{
            TenantId = $TenantId
            CorrelationId = $CorrelationId
            UserCount = $userCount
            CollectionResults = $collectionResults
            Status = "Completed"
        }
        
        return $discoveryResults
        
    } catch {
        $errorData = @{
            ErrorType = $_.Exception.GetType().Name
            ErrorMessage = $_.Exception.Message
            TenantId = $TenantId
            Phase = "Unknown"
        }
        
        Write-MandALog -Message "User discovery failed: $($_.Exception.Message)" -Level "ERROR" -Component "UserDiscovery" -CorrelationId $CorrelationId -StructuredData $errorData
        throw
    } finally {
        # Always stop the main performance timer
        Stop-PerformanceTimer -OperationName "UserDiscovery_$TenantId" -CorrelationId $CorrelationId
        Write-MandALog -Message "User discovery operation completed for tenant: $TenantId" -Level "INFO" -Component "UserDiscovery" -CorrelationId $CorrelationId
    }
}

function Invoke-MultiTenantDiscoveryWithTracking {
    <#
    .SYNOPSIS
        Example function showing correlation tracking across multiple tenant operations.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$TenantIds
    )
    
    # Generate master correlation ID for the entire multi-tenant operation
    $masterCorrelationId = New-CorrelationId
    
    Write-MandALog -Message "Starting multi-tenant discovery for $($TenantIds.Count) tenants" -Level "HEADER" -Component "MultiTenantDiscovery" -CorrelationId $masterCorrelationId
    
    Start-PerformanceTimer -OperationName "MultiTenantDiscovery" -CorrelationId $masterCorrelationId
    
    $allResults = @()
    $successCount = 0
    $errorCount = 0
    
    foreach ($tenantId in $TenantIds) {
        try {
            # Each tenant gets its own correlation ID, but we log the relationship
            $tenantCorrelationId = New-CorrelationId
            
            $relationshipData = @{
                MasterCorrelationId = $masterCorrelationId
                TenantCorrelationId = $tenantCorrelationId
                TenantId = $tenantId
            }
            
            Write-MandALog -Message "Starting discovery for tenant: $tenantId" -Level "INFO" -Component "MultiTenantDiscovery" -CorrelationId $masterCorrelationId -StructuredData $relationshipData
            
            # Call the single tenant discovery with its own correlation ID
            $result = Invoke-UserDiscoveryWithTracking -TenantId $tenantId -CorrelationId $tenantCorrelationId
            $allResults += $result
            $successCount++
            
            Write-MandALog -Message "Tenant discovery completed successfully: $tenantId" -Level "SUCCESS" -Component "MultiTenantDiscovery" -CorrelationId $masterCorrelationId
            
        } catch {
            $errorCount++
            $errorData = @{
                TenantId = $tenantId
                ErrorMessage = $_.Exception.Message
                MasterCorrelationId = $masterCorrelationId
            }
            
            Write-MandALog -Message "Tenant discovery failed for: $tenantId" -Level "ERROR" -Component "MultiTenantDiscovery" -CorrelationId $masterCorrelationId -StructuredData $errorData
        }
    }
    
    Stop-PerformanceTimer -OperationName "MultiTenantDiscovery" -CorrelationId $masterCorrelationId
    
    $summaryData = @{
        TotalTenants = $TenantIds.Count
        SuccessfulTenants = $successCount
        FailedTenants = $errorCount
        SuccessRate = "$([math]::Round(($successCount / $TenantIds.Count) * 100, 2))%"
        Results = $allResults
    }
    
    Write-MandALog -Message "Multi-tenant discovery completed" -Level "HEADER" -Component "MultiTenantDiscovery" -CorrelationId $masterCorrelationId -StructuredData $summaryData
    
    return $summaryData
}

# Initialize logging
Initialize-Logging

Write-Host "=== Enhanced Correlation and Performance Tracking Examples ===" -ForegroundColor Cyan

# Example 1: Single tenant discovery
Write-Host "`n1. Single Tenant Discovery Example" -ForegroundColor Yellow
$singleResult = Invoke-UserDiscoveryWithTracking -TenantId "contoso.onmicrosoft.com"

# Example 2: Multi-tenant discovery
Write-Host "`n2. Multi-Tenant Discovery Example" -ForegroundColor Yellow
$tenants = @(
    "contoso.onmicrosoft.com",
    "fabrikam.onmicrosoft.com", 
    "adventureworks.onmicrosoft.com"
)

$multiResult = Invoke-MultiTenantDiscoveryWithTracking -TenantIds $tenants

Write-Host "`n=== Examples Completed ===" -ForegroundColor Cyan
Write-Host "Check the log files to see correlation tracking across operations." -ForegroundColor Green
Write-Host "JSON log file: C:\MandADiscovery\Logs\MandA_Discovery_*.json" -ForegroundColor Green
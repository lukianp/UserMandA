# Test script to verify AzureOnly mode filtering
param(
    [switch]$DryRun = $true
)

Write-Host "=== Testing AzureOnly Mode Filtering ===" -ForegroundColor Cyan

# Simulate the configuration
$mockConfig = @{
    discovery = @{
        enabledSources = @(
            "ActiveDirectory",
            "Azure", 
            "GPO",
            "EnvironmentDetection",
            "Exchange",
            "ExternalIdentity", 
            "FileServer",
            "Graph",
            "Intune",
            "Licensing",
            "NetworkInfrastructure",
            "SharePoint",
            "SQLServer",
            "Teams"
        )
    }
}

# Test the filtering logic
$Mode = "AzureOnly"
$enabledSources = $mockConfig.discovery.enabledSources

Write-Host "`nOriginal enabled sources:" -ForegroundColor Yellow
$enabledSources | ForEach-Object { Write-Host "  - $_" }

# Apply AzureOnly filtering
if ($Mode -eq "AzureOnly") {
    # Define Azure-only modules (cloud-based Microsoft services)
    $azureOnlyModules = @("Azure", "Graph", "Intune", "SharePoint", "Teams", "Exchange", "Licensing", "NetworkInfrastructure")
    $filteredSources = $enabledSources | Where-Object { $_ -in $azureOnlyModules }
    
    Write-Host "`nAzure-only modules defined:" -ForegroundColor Green
    $azureOnlyModules | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
    
    Write-Host "`nFiltered sources (will run):" -ForegroundColor Green
    $filteredSources | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
    
    Write-Host "`nExcluded sources (will NOT run):" -ForegroundColor Red
    $excludedSources = $enabledSources | Where-Object { $_ -notin $azureOnlyModules }
    $excludedSources | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    
    Write-Host "`nSummary:" -ForegroundColor Cyan
    Write-Host "  Total enabled sources: $($enabledSources.Count)" -ForegroundColor White
    Write-Host "  Azure-only sources: $($filteredSources.Count)" -ForegroundColor Green
    Write-Host "  Excluded sources: $($excludedSources.Count)" -ForegroundColor Red
    
    # Verify expected Azure modules are included
    $expectedAzureModules = @("Azure", "Graph", "Intune", "SharePoint", "Teams", "Exchange", "Licensing", "NetworkInfrastructure")
    $missingAzureModules = $expectedAzureModules | Where-Object { $_ -notin $filteredSources }
    
    if ($missingAzureModules.Count -eq 0) {
        Write-Host "`n✅ SUCCESS: All expected Azure modules are included" -ForegroundColor Green
    } else {
        Write-Host "`n❌ ERROR: Missing Azure modules:" -ForegroundColor Red
        $missingAzureModules | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
    
    # Verify non-Azure modules are excluded
    $nonAzureModules = @("ActiveDirectory", "GPO", "EnvironmentDetection", "ExternalIdentity", "FileServer", "SQLServer")
    $incorrectlyIncluded = $nonAzureModules | Where-Object { $_ -in $filteredSources }
    
    if ($incorrectlyIncluded.Count -eq 0) {
        Write-Host "✅ SUCCESS: All non-Azure modules are correctly excluded" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Non-Azure modules incorrectly included:" -ForegroundColor Red
        $incorrectlyIncluded | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
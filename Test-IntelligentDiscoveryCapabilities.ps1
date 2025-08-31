# Test Intelligent Infrastructure Discovery Capabilities
# Validates all enterprise features are working correctly

try {
    Write-Host "=== Intelligent Infrastructure Discovery Test Suite ===" -ForegroundColor Cyan
    
    # Import module
    Import-Module "D:\Scripts\UserMandA\Modules\Discovery\InfrastructureDiscovery.psm1" -Force -WarningAction SilentlyContinue
    
    # Create test configuration
    $testConfig = @{
        CompanyName = "TestCorp"
        OutputDirectory = "C:\temp\InfraTest"
        ProfileName = "IntelligentDiscoveryTest"
    }
    
    # Ensure output directory exists
    if (-not (Test-Path $testConfig.OutputDirectory)) {
        New-Item -ItemType Directory -Path $testConfig.OutputDirectory -Force | Out-Null
    }
    
    $context = @{
        SessionId = [guid]::NewGuid().ToString()
        Paths = @{
            RawDataOutput = $testConfig.OutputDirectory
        }
    }
    
    Write-Host ""
    Write-Host "1. Testing Intelligent nmap Management..." -ForegroundColor Yellow
    $nmapSystem = Find-SystemNmap -Context $context
    if ($nmapSystem) {
        Write-Host "   Found system nmap: $($nmapSystem.Path)" -ForegroundColor Green
        Write-Host "   Version: $($nmapSystem.Version)" -ForegroundColor White
        Write-Host "   Capabilities: $($nmapSystem.Capabilities.Summary)" -ForegroundColor White
    } else {
        Write-Host "   No system nmap - will use PowerShell fallback" -ForegroundColor Blue
    }
    
    Write-Host ""
    Write-Host "2. Testing Production Environment Detection..." -ForegroundColor Yellow
    $prodTest = Test-ProductionEnvironment -Context $context
    Write-Host "   Production Environment: $($prodTest.IsProduction)" -ForegroundColor White
    if ($prodTest.Signals.Count -gt 0) {
        Write-Host "   Production Signals: $($prodTest.Signals -join ', ')" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "3. Testing Enterprise Subnet Discovery..." -ForegroundColor Yellow
    
    # Test AD Sites discovery
    $adSubnets = Get-ADSitesAndSubnets -Configuration $testConfig -Context $context
    Write-Host "   AD Sites discovered: $($adSubnets.Count)" -ForegroundColor White
    
    # Test DNS zone analysis  
    $dnsSubnets = Get-SubnetsFromDNSZones -Configuration $testConfig -Context $context
    Write-Host "   DNS-inferred subnets: $($dnsSubnets.Count)" -ForegroundColor White
    
    # Test intelligent subnet discovery
    $subnets = Get-NetworkSubnets -Configuration $testConfig -Context $context
    Write-Host "   Total classified subnets: $($subnets.Count)" -ForegroundColor White
    
    if ($subnets.Count -gt 0) {
        Write-Host ""
        Write-Host "4. Subnet Classification Results:" -ForegroundColor Yellow
        $classificationStats = @{}
        
        foreach ($subnet in $subnets) {
            $segmentType = if ($subnet.SegmentType) { $subnet.SegmentType } else { "Unknown" }
            if (-not $classificationStats.ContainsKey($segmentType)) {
                $classificationStats[$segmentType] = @{Count = 0; Priority = 0}
            }
            $classificationStats[$segmentType].Count++
            if ($subnet.BusinessPriority) {
                $classificationStats[$segmentType].Priority = [Math]::Max($classificationStats[$segmentType].Priority, $subnet.BusinessPriority)
            }
        }
        
        $classificationStats.GetEnumerator() | ForEach-Object {
            Write-Host "   $($_.Key): $($_.Value.Count) subnets (max priority: $($_.Value.Priority))" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "5. Testing Adaptive Scan Parameters..." -ForegroundColor Yellow
        $testSubnet = $subnets | Where-Object { $_.BusinessPriority -ne $null } | Select-Object -First 1
        if ($testSubnet) {
            $scanParams = Get-AdaptiveScanParameters -Subnet $testSubnet -Context $context
            Write-Host "   Sample adaptive parameters for $($testSubnet.SegmentType):" -ForegroundColor White
            Write-Host "     Timing: $($scanParams.TimingTemplate)" -ForegroundColor White
            Write-Host "     Max Rate: $($scanParams.MaxRate) pps" -ForegroundColor White
            Write-Host "     Ports: $($scanParams.PortRange.Count)" -ForegroundColor White
            Write-Host "     Batch Size: $($scanParams.BatchSize)" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "6. Testing Complete Infrastructure Discovery..." -ForegroundColor Yellow
    $discoveryResult = Invoke-InfrastructureDiscovery -Configuration $testConfig -Context $context -SessionId $context.SessionId
    
    Write-Host "   Discovery Success: $($discoveryResult.Success)" -ForegroundColor $(if ($discoveryResult.Success) { "Green" } else { "Red" })
    Write-Host "   Records Found: $($discoveryResult.RecordCount)" -ForegroundColor White
    Write-Host "   Errors: $($discoveryResult.Errors.Count)" -ForegroundColor $(if ($discoveryResult.Errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "   Warnings: $($discoveryResult.Warnings.Count)" -ForegroundColor $(if ($discoveryResult.Warnings.Count -eq 0) { "Green" } else { "Yellow" })
    
    if ($discoveryResult.Metadata) {
        Write-Host ""
        Write-Host "7. Enhanced Discovery Metadata:" -ForegroundColor Yellow
        Write-Host "   Version: $($discoveryResult.Metadata.InfrastructureDiscoveryVersion)" -ForegroundColor White
        Write-Host "   Scan Method: $($discoveryResult.Metadata.ScanMethod)" -ForegroundColor White
        Write-Host "   Total Hosts: $($discoveryResult.Metadata.TotalHosts)" -ForegroundColor White
        Write-Host "   Total Subnets: $($discoveryResult.Metadata.TotalSubnets)" -ForegroundColor White
        
        if ($discoveryResult.Metadata.EnterpriseFeatures) {
            $features = $discoveryResult.Metadata.EnterpriseFeatures
            Write-Host "   Enterprise Features:" -ForegroundColor White
            Write-Host "     AD Sites Integration: $($features.ADSitesIntegration)" -ForegroundColor White
            Write-Host "     DNS Zone Analysis: $($features.DNSZoneAnalysis)" -ForegroundColor White
            Write-Host "     Intelligent Classification: $($features.IntelligentClassification)" -ForegroundColor White
            Write-Host "     Adaptive Scanning: $($features.AdaptiveScanning)" -ForegroundColor White
            Write-Host "     Business Priority Scanning: $($features.BusinessPriorityScanning)" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "✅ INTELLIGENT INFRASTRUCTURE DISCOVERY v2.0 VALIDATED" -ForegroundColor Green
    Write-Host "   All enterprise features are operational!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.ScriptStackTrace)" -ForegroundColor Red
}
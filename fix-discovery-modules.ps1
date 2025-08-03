# -*- coding: utf-8-bom -*-
# Script to fix Discovery modules to use DiscoveryResult class instead of hashtable fallbacks

$discoveryPath = "D:\Scripts\UserMandA\Modules\Discovery"
$filesToFix = @(
    "ApplicationDependencyMapping.psm1",
    "BackupRecoveryDiscovery.psm1", 
    "CertificateDiscovery.psm1",
    "DatabaseSchemaDiscovery.psm1",
    "DataClassificationDiscovery.psm1",
    "EnvironmentDetectionDiscovery.psm1",
    "ExternalIdentityDiscovery.psm1",
    "GPODiscovery.psm1",
    "LicensingDiscovery.psm1",
    "MultiDomainForestDiscovery.psm1",
    "NetworkInfrastructureDiscovery.psm1",
    "PaloAltoDiscovery.psm1",
    "PhysicalServerDiscovery.psm1",
    "PrinterDiscovery.psm1",
    "ScheduledTaskDiscovery.psm1",
    "SecurityGroupAnalysis.psm1",
    "SQLServerDiscovery.psm1",
    "StorageArrayDiscovery.psm1",
    "VirtualizationDiscovery.psm1",
    "WebServerConfigDiscovery.psm1"
)

foreach ($file in $filesToFix) {
    $filePath = Join-Path $discoveryPath $file
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        # Read the file content
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Extract module name from the file name (remove Discovery.psm1 suffix)
        $moduleName = $file -replace "Discovery\.psm1$", "" -replace "\.psm1$", ""
        
        # Create the log function name based on module name
        $logFunctionName = "Write-${moduleName}Log"
        if ($moduleName -eq "ApplicationDependencyMapping") { $logFunctionName = "Write-AppDepLog" }
        if ($moduleName -eq "BackupRecovery") { $logFunctionName = "Write-BackupLog" }
        if ($moduleName -eq "Certificate") { $logFunctionName = "Write-CertificateLog" }
        if ($moduleName -eq "DatabaseSchema") { $logFunctionName = "Write-DatabaseLog" }
        if ($moduleName -eq "DataClassification") { $logFunctionName = "Write-DataClassLog" }
        if ($moduleName -eq "EnvironmentDetection") { $logFunctionName = "Write-EnvironmentLog" }
        if ($moduleName -eq "ExternalIdentity") { $logFunctionName = "Write-ExternalIdLog" }
        if ($moduleName -eq "GPO") { $logFunctionName = "Write-GPOLog" }
        if ($moduleName -eq "Licensing") { $logFunctionName = "Write-LicensingLog" }
        if ($moduleName -eq "MultiDomainForest") { $logFunctionName = "Write-ForestLog" }
        if ($moduleName -eq "NetworkInfrastructure") { $logFunctionName = "Write-NetworkLog" }
        if ($moduleName -eq "PaloAlto") { $logFunctionName = "Write-PaloAltoLog" }
        if ($moduleName -eq "PhysicalServer") { $logFunctionName = "Write-PhysicalLog" }
        if ($moduleName -eq "Printer") { $logFunctionName = "Write-PrinterLog" }
        if ($moduleName -eq "ScheduledTask") { $logFunctionName = "Write-TaskLog" }
        if ($moduleName -eq "SecurityGroupAnalysis") { $logFunctionName = "Write-SecurityLog" }
        if ($moduleName -eq "SQLServer") { $logFunctionName = "Write-SQLLog" }
        if ($moduleName -eq "StorageArray") { $logFunctionName = "Write-StorageLog" }
        if ($moduleName -eq "Virtualization") { $logFunctionName = "Write-VirtualizationLog" }
        if ($moduleName -eq "WebServerConfig") { $logFunctionName = "Write-WebServerLog" }
        
        # Pattern 1: Look for the fallback hashtable pattern and replace it
        $pattern1 = '(?s)if \(\(\[System\.Management\.Automation\.PSTypeName\]''DiscoveryResult''\)\.Type\) \{.*?\$result = \[DiscoveryResult\]::new\(''[^'']+''.*?\} else \{.*?Complete = \{ \$this\.EndTime = Get-Date \}\.GetNewClosure\(\).*?\}'
        
        if ($content -match $pattern1) {
            Write-Host "  Found Pattern 1 in $file" -ForegroundColor Green
            
            $replacement = @"
# Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "`$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        `$result = [DiscoveryResult]::new('$moduleName')
    } catch {
        $logFunctionName -Level "ERROR" -Message "Failed to load DiscoveryResult class: `$(`$_.Exception.Message)" -Context `$Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }
"@
            
            $content = $content -replace $pattern1, $replacement
        }
        
        # Pattern 2: Simple hashtable without if-else structure
        $pattern2 = '\$result = @\{[^}]*Success[^}]*Complete = \{ \$this\.EndTime = Get-Date \}\.GetNewClosure\(\)[^}]*\}'
        
        if ($content -match $pattern2) {
            Write-Host "  Found Pattern 2 in $file" -ForegroundColor Green
            
            $replacement = @"
# Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "`$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        `$result = [DiscoveryResult]::new('$moduleName')
    } catch {
        $logFunctionName -Level "ERROR" -Message "Failed to load DiscoveryResult class: `$(`$_.Exception.Message)" -Context `$Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }
"@
            
            $content = $content -replace $pattern2, $replacement
        }
        
        # Write the updated content back to the file
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "Discovery module fixes completed!" -ForegroundColor Cyan
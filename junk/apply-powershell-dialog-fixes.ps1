#!/usr/bin/env pwsh
# Systematically apply PowerShellExecutionDialog fixes to all discovery modules
# This script adds the necessary imports, state, and dialog components

$ErrorActionPreference = 'Stop'
$workspaceRoot = "D:\Scripts\UserMandA\guiv2\src\renderer"

# Define modules to fix (View file, Hook file, Module display name)
$modules = @(
    @{View="BackupRecoveryDiscoveryView"; Hook="useBackupRecoveryDiscoveryLogic"; Name="Backup Recovery Discovery"},
    @{View="CertificateAuthorityDiscoveryView"; Hook="useCertificateAuthorityDiscoveryLogic"; Name="Certificate Authority Discovery"},
    @{View="CertificateDiscoveryView"; Hook="useCertificateDiscoveryLogic"; Name="Certificate Discovery"},
    @{View="IdentityGovernanceDiscoveryView"; Hook="useIdentityGovernanceDiscoveryLogic"; Name="Identity Governance Discovery"},
    @{View="PaloAltoDiscoveryView"; Hook="usePaloAltoDiscoveryLogic"; Name="Palo Alto Discovery"},
    @{View="SecurityInfrastructureDiscoveryView"; Hook="useSecurityInfrastructureDiscoveryLogic"; Name="Security Infrastructure Discovery"},
    @{View="VirtualizationDiscoveryView"; Hook="useVirtualizationDiscoveryLogic"; Name="Virtualization Discovery"},
    @{View="GPODiscoveryView"; Hook="useGPODiscoveryLogic"; Name="GPO Discovery"},
    @{View="EnvironmentDetectionView"; Hook="useEnvironmentDetectionLogic"; Name="Environment Detection"}
)

Write-Host "=== PowerShellExecutionDialog Fix Script ===" -ForegroundColor Cyan
Write-Host "Processing $($modules.Count) modules...`n" -ForegroundColor White

$successCount = 0
$failCount = 0

foreach ($module in $modules) {
    $viewFile = Join-Path $workspaceRoot "views\discovery\$($module.View).tsx"
    $hookFile = Join-Path $workspaceRoot "hooks\$($module.Hook).ts"

    Write-Host "[$($module.Name)]" -ForegroundColor Yellow

    # Check if files exist
    if (-not (Test-Path $viewFile)) {
        Write-Host "  [SKIP] View file not found: $viewFile" -ForegroundColor Red
        $failCount++
        continue
    }
    if (-not (Test-Path $hookFile)) {
        Write-Host "  [SKIP] Hook file not found: $hookFile" -ForegroundColor Red
        $failCount++
        continue
    }

    # Fix Hook File
    Write-Host "  Fixing hook file..." -ForegroundColor Gray
    $hookContent = Get-Content $hookFile -Raw -Encoding UTF8

    # Check if already has PowerShellLog import
    if ($hookContent -notmatch "PowerShellLog") {
        # Add PowerShellLog import after other imports
        $hookContent = $hookContent -replace "(import .* from '[^']+';`n)", "`$1import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';`n"

        # Add state after other useState declarations
        $hookContent = $hookContent -replace "(\s+)(const \[isRunning, setIsRunning\] = useState)", "`$1// PowerShell Execution Dialog state`n`$1const [logs, setLogs] = useState<PowerShellLog[]>([]);`n`$1const [showExecutionDialog, setShowExecutionDialog] = useState(false);`n`$1const [isCancelling, setIsCancelling] = useState(false);`n`n`$1const addLog = useCallback((level: PowerShellLog['level'], message: string) => {`n`$1  const timestamp = new Date().toLocaleTimeString();`n`$1  setLogs(prev => [...prev, { timestamp, level, message }]);`n`$1}, []);`n`n`$1const clearLogs = useCallback(() => {`n`$1  setLogs([]);`n`$1}, []);`n`n`$1`$2"

        Set-Content $hookFile -Value $hookContent -Encoding UTF8 -NoNewline
        Write-Host "    [OK] Added PowerShellLog support to hook" -ForegroundColor Green
    } else {
        Write-Host "    [SKIP] Hook already has PowerShellLog support" -ForegroundColor Gray
    }

    # Fix View File
    Write-Host "  Fixing view file..." -ForegroundColor Gray
    $viewContent = Get-Content $viewFile -Raw -Encoding UTF8

    # Check if already has PowerShellExecutionDialog import
    if ($viewContent -notmatch "PowerShellExecutionDialog") {
        # Add import
        $viewContent = $viewContent -replace "(import .* from '[^']+/ProgressBar';)", "`$1`nimport PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';"

        # Add to destructured hook properties
        $viewContent = $viewContent -replace "(\s+)(\} = use\w+Logic\(\);)", "`$1  logs,`n`$1  clearLogs,`n`$1  showExecutionDialog,`n`$1  setShowExecutionDialog,`n`$1  isCancelling,`n`$1`$2"

        # Add dialog before closing </div> tag of main component
        $dialogComponent = @"

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isRunning && setShowExecutionDialog(false)}
        scriptName="$($module.Name)"
        scriptDescription="Running $($module.Name.ToLower())"
        logs={logs}
        isRunning={isRunning}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.overallProgress || progress,
          message: progress.message || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
"@

        # Find the last closing div before export statement
        $viewContent = $viewContent -replace "(\s+)(</div>`n\s+\);`n\s*};`n`n.*export default)", "$dialogComponent`n`$1`$2"

        Set-Content $viewFile -Value $viewContent -Encoding UTF8 -NoNewline
        Write-Host "    [OK] Added PowerShellExecutionDialog to view" -ForegroundColor Green
    } else {
        Write-Host "    [SKIP] View already has PowerShellExecutionDialog" -ForegroundColor Gray
    }

    $successCount++
    Write-Host ""
}

Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "`nDone!" -ForegroundColor Green

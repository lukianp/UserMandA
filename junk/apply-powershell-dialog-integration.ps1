# PowerShell Script to integrate PowerShellExecutionDialog into discovery hooks and views
# This script applies the standard pattern for logs, showExecutionDialog, and isCancelling states

$WorkspaceRoot = "D:\Scripts\UserMandA\guiv2\src\renderer"

# Define hooks to modify (hooks that don't already have PowerShellExecutionDialog)
$HooksToModify = @(
    "$WorkspaceRoot\hooks\useSecurityInfrastructureDiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\useIdentityGovernanceDiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\useCertificateAuthorityDiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\useCertificateDiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\usePaloAltoDiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\useVirtualizationDiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\useGPODiscoveryLogic.ts",
    "$WorkspaceRoot\hooks\useEnvironmentDetectionLogic.ts"
)

function Add-PowerShellDialogImport {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check if already has the import
    if ($content -match "PowerShellLog") {
        Write-Host "  [SKIP] Already has PowerShellLog import" -ForegroundColor Yellow
        return $false
    }

    # Add import after other imports
    if ($content -match "import.*from 'react';") {
        $content = $content -replace "(import.*from 'react';)", "`$1`nimport type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';"
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  [OK] Added PowerShellLog import" -ForegroundColor Green
        return $true
    }

    Write-Host "  [ERROR] Could not find import location" -ForegroundColor Red
    return $false
}

function Add-LogsState {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check if already has logs state
    if ($content -match "PowerShellLog\[\]") {
        Write-Host "  [SKIP] Already has logs state" -ForegroundColor Yellow
        return $false
    }

    # Find currentTokenRef and add states after it
    if ($content -match "const currentTokenRef = useRef<string \| null>\(null\);") {
        $content = $content -replace "(const currentTokenRef = useRef<string \| null>\(null\);)", "`$1`n`n  const [logs, setLogs] = useState<PowerShellLog[]>([]);`n  const [showExecutionDialog, setShowExecutionDialog] = useState(false);`n  const [isCancelling, setIsCancelling] = useState(false);"
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  [OK] Added logs, showExecutionDialog, isCancelling states" -ForegroundColor Green
        return $true
    }

    Write-Host "  [ERROR] Could not find currentTokenRef location" -ForegroundColor Red
    return $false
}

function Add-LogHelpers {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check if already has addLog function
    if ($content -match "const addLog = useCallback") {
        Write-Host "  [SKIP] Already has addLog function" -ForegroundColor Yellow
        return $false
    }

    # Add after state definitions, before event listeners
    if ($content -match "useEffect\(\(\) => \{[\s\S]*?Setting up event listeners") {
        $helperFunctions = @"

  const addLog = useCallback((level: PowerShellLog['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
"@
        $content = $content -replace "(\s+)(// Event listeners.*?useEffect\(\(\) => \{)", "`$1$helperFunctions`n`n`$1`$2"
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  [OK] Added addLog and clearLogs helpers" -ForegroundColor Green
        return $true
    }

    Write-Host "  [ERROR] Could not find event listener location" -ForegroundColor Red
    return $false
}

function Update-StartDiscovery {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check if startDiscovery already has setShowExecutionDialog
    if ($content -match "startDiscovery.*setShowExecutionDialog\(true\)") {
        Write-Host "  [SKIP] startDiscovery already has setShowExecutionDialog" -ForegroundColor Yellow
        return $false
    }

    # Find startDiscovery function and add setShowExecutionDialog(true) at the beginning
    # Look for pattern: const startDiscovery = (useCallback\()?async \(\) => \{
    if ($content -match "(const startDiscovery = (?:useCallback\()?async \(\) => \{[\s\S]*?)(setState\(prev => \(\{)") {
        $content = $content -replace "(const startDiscovery = (?:useCallback\()?async \(\) => \{[\s\S]*?)(setState\(prev => \(\{)", "`$1setShowExecutionDialog(true);`n    `$2"
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  [OK] Added setShowExecutionDialog(true) to startDiscovery" -ForegroundColor Green
        return $true
    }

    Write-Host "  [WARN] Could not find startDiscovery pattern to modify" -ForegroundColor Yellow
    return $false
}

function Update-CancelDiscovery {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check if cancelDiscovery already has isCancelling
    if ($content -match "cancelDiscovery.*setIsCancelling") {
        Write-Host "  [SKIP] cancelDiscovery already has setIsCancelling" -ForegroundColor Yellow
        return $false
    }

    # Find cancelDiscovery function and wrap with setIsCancelling
    if ($content -match "const cancelDiscovery = (?:useCallback\()?async \(\) => \{") {
        # Add setIsCancelling(true) at start
        $content = $content -replace "(const cancelDiscovery = (?:useCallback\()?async \(\) => \{)", "`$1`n    setIsCancelling(true);"

        # Add setIsCancelling(false) before timeout completion
        $content = $content -replace "(setTimeout\(\(\) => \{)", "`$1`n        setIsCancelling(false);"

        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  [OK] Added setIsCancelling wrapping to cancelDiscovery" -ForegroundColor Green
        return $true
    }

    Write-Host "  [WARN] Could not find cancelDiscovery pattern to modify" -ForegroundColor Yellow
    return $false
}

function Update-ReturnStatement {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check if return statement already has showExecutionDialog
    if ($content -match "return \{[\s\S]*?showExecutionDialog") {
        Write-Host "  [SKIP] Return statement already includes PowerShell dialog states" -ForegroundColor Yellow
        return $false
    }

    # Find return statement and add new properties
    # This is tricky - we'll add before the closing brace of the return object
    if ($content -match "(return \{[\s\S]*?)(  \};\s*\};?\s*$)") {
        $addition = ",`n`n    // PowerShell Execution Dialog`n    showExecutionDialog,`n    setShowExecutionDialog,`n    logs,`n    clearLogs,`n    isCancelling"
        $content = $content -replace "(return \{[\s\S]*?)(,?\s*\};?\s*\};?\s*$)", "`$1$addition`n  `$2"
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  [OK] Added PowerShell dialog states to return statement" -ForegroundColor Green
        return $true
    }

    Write-Host "  [ERROR] Could not find return statement pattern" -ForegroundColor Red
    return $false
}

# Process each hook
Write-Host "`n=== Processing Discovery Hooks ===" -ForegroundColor Cyan

foreach ($hookPath in $HooksToModify) {
    if (-not (Test-Path $hookPath)) {
        Write-Host "`n[SKIP] $hookPath - File not found" -ForegroundColor Magenta
        continue
    }

    Write-Host "`n[PROCESSING] $(Split-Path $hookPath -Leaf)" -ForegroundColor Cyan

    Add-PowerShellDialogImport -FilePath $hookPath
    Add-LogsState -FilePath $hookPath
    Add-LogHelpers -FilePath $hookPath
    Update-StartDiscovery -FilePath $hookPath
    Update-CancelDiscovery -FilePath $hookPath
    Update-ReturnStatement -FilePath $hookPath
}

Write-Host "`n=== Hook Processing Complete ===`n" -ForegroundColor Green

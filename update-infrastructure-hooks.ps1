# PowerShell Script to Update Infrastructure Discovery Hooks with PowerShellExecutionDialog Integration
# This script adds isCancelling state and clearLogs function to all infrastructure discovery hooks

$ErrorActionPreference = 'Stop'

$workspaceDir = "D:\Scripts\UserMandA\guiv2\src\renderer\hooks"

$hooksToUpdate = @(
    'useFileSystemDiscoveryLogic.ts',
    'useNetworkDiscoveryLogic.ts',
    'useSQLServerDiscoveryLogic.ts',
    'useVMwareDiscoveryLogic.ts',
    'useHyperVDiscoveryLogic.ts',
    'useWebServerConfigDiscoveryLogic.ts',
    'useDomainDiscoveryLogic.ts',
    'useDNSDHCPDiscoveryLogic.ts',
    'useFileServerDiscoveryLogic.ts',
    'useInfrastructureDiscoveryLogic.ts',
    'useNetworkInfrastructureDiscoveryLogic.ts',
    'usePhysicalServerDiscoveryLogic.ts',
    'usePrinterDiscoveryLogic.ts',
    'useStorageArrayDiscoveryLogic.ts',
    'useScheduledTaskDiscoveryLogic.ts'
)

function Update-DiscoveryHook {
    param(
        [string]$FilePath
    )

    Write-Host "Processing: $FilePath" -ForegroundColor Cyan

    if (-not (Test-Path $FilePath)) {
        Write-Host "  SKIPPED: File not found" -ForegroundColor Yellow
        return
    }

    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8

    # Check if already has isCancelling
    if ($content -match 'const \[isCancelling, setIsCancelling\]') {
        Write-Host "  SKIPPED: Already has isCancelling state" -ForegroundColor Green
        return
    }

    # Check if has PowerShellLog import
    if ($content -notmatch "import type \{ PowerShellLog \}") {
        Write-Host "  SKIPPED: Missing PowerShellLog import - needs manual review" -ForegroundColor Yellow
        return
    }

    $modified = $false

    # Step 1: Add isCancelling to interface if it has one
    if ($content -match '(?s)(export interface \w+Return \{.*?)(\s+// Actions|\s+startDiscovery:)') {
        if ($content -notmatch 'isCancelling: boolean;') {
            $content = $content -replace '(showExecutionDialog: boolean;\s+setShowExecutionDialog: \(show: boolean\) => void;)',
                '$1' + "`n  isCancelling: boolean;`n  clearLogs: () => void;"
            Write-Host "  ✓ Added to interface" -ForegroundColor Green
            $modified = $true
        }
    }

    # Step 2: Add isCancelling state after showExecutionDialog
    if ($content -match 'const \[showExecutionDialog, setShowExecutionDialog\] = useState\(false\);') {
        $content = $content -replace '(const \[showExecutionDialog, setShowExecutionDialog\] = useState\(false\);)',
            '$1' + "`n  const [isCancelling, setIsCancelling] = useState(false);"
        Write-Host "  ✓ Added isCancelling state" -ForegroundColor Green
        $modified = $true
    }

    # Step 3: Add clearLogs function after addLog if it doesn't exist
    if ($content -notmatch 'const clearLogs = useCallback') {
        # Find addLog function and add clearLogs after it
        $content = $content -replace '(const addLog = useCallback\([^}]+\}\);)',
            '$1' + "`n`n  const clearLogs = useCallback(() => {`n    setLogs([]);`n  }, []);"
        Write-Host "  ✓ Added clearLogs function" -ForegroundColor Green
        $modified = $true
    }

    # Step 4: Wrap cancelDiscovery with isCancelling state
    if ($content -match 'const cancelDiscovery = useCallback\(async \(\) => \{') {
        # Add setIsCancelling(true) at the beginning
        $content = $content -replace '(const cancelDiscovery = useCallback\(async \(\) => \{\s+)',
            '$1' + "setIsCancelling(true);`n    "

        # Add setIsCancelling(false) in the timeout
        $content = $content -replace '(setTimeout\(\(\) => \{\s+)(setIsRunning\(false\);)',
            '$1setIsCancelling(false);' + "`n        " + '$2'

        # Add setIsCancelling(false) in catch block
        $content = $content -replace '(catch[^{]+\{[^}]*)(setIsRunning\(false\);)',
            '$1setIsCancelling(false);' + "`n      " + '$2'

        Write-Host "  ✓ Updated cancelDiscovery" -ForegroundColor Green
        $modified = $true
    }

    # Step 5: Add setShowExecutionDialog(true) to startDiscovery if missing
    if ($content -match 'const startDiscovery = useCallback\(async \(\) => \{') {
        if ($content -notmatch 'setShowExecutionDialog\(true\)') {
            $content = $content -replace '(setIsRunning\(true\);)',
                'setShowExecutionDialog(true);' + "`n    " + '$1'
            Write-Host "  ✓ Added setShowExecutionDialog(true) to startDiscovery" -ForegroundColor Green
            $modified = $true
        }
    }

    # Step 6: Add isCancelling and clearLogs to return statement
    if ($content -match 'return \{') {
        # Find the return statement and add our properties
        if ($content -notmatch 'isCancelling,') {
            $content = $content -replace '(showExecutionDialog,\s+setShowExecutionDialog,)',
                '$1' + "`n    isCancelling,`n    clearLogs,"
            Write-Host "  ✓ Added to return statement" -ForegroundColor Green
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  SUCCESS: File updated" -ForegroundColor Green
    } else {
        Write-Host "  NO CHANGES NEEDED" -ForegroundColor Gray
    }
}

# Process each hook
foreach ($hook in $hooksToUpdate) {
    $filePath = Join-Path $workspaceDir $hook
    Update-DiscoveryHook -FilePath $filePath
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Hook update process complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Simple Module Validator - Bypasses regex issues to identify actual module problems
# Focuses on basic syntax validation and interface checking

param(
    [string]$ModulesPath = "Modules",
    [switch]$DetailedReport
)

function Write-ValidatorLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

$script:Issues = @()

function Add-Issue {
    param(
        [string]$Severity,
        [string]$Category,
        [string]$File,
        [string]$Message,
        [string]$Recommendation = ""
    )
    
    $script:Issues += [PSCustomObject]@{
        Severity = $Severity
        Category = $Category
        File = $File
        Message = $Message
        Recommendation = $Recommendation
    }
}

function Test-ModuleSyntax {
    param([string]$FilePath)
    
    Write-ValidatorLog "Testing syntax for $FilePath" "INFO"
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        
        # Basic PowerShell syntax test
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -gt 0) {
            foreach ($error in $parseErrors) {
                Add-Issue -Severity "ERROR" -Category "Syntax" -File $FilePath -Message $error.Message -Recommendation "Fix syntax error before deployment"
            }
            return $false
        }
        
        # Check for basic interface requirements
        Test-ModuleInterface -FilePath $FilePath -Content $content -AST $ast
        
        return $true
        
    } catch {
        Add-Issue -Severity "ERROR" -Category "General" -File $FilePath -Message "Failed to process module: $($_.Exception.Message)" -Recommendation "Check file encoding and accessibility"
        return $false
    }
}

function Test-ModuleInterface {
    param([string]$FilePath, [string]$Content, $AST)
    
    $moduleType = Get-ModuleType -FilePath $FilePath
    
    # Check for Export-ModuleMember statements
    $exportStatements = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Export-ModuleMember"}, $true)
    
    if ($exportStatements.Count -eq 0) {
        Add-Issue -Severity "WARN" -Category "Interface" -File $FilePath -Message "No Export-ModuleMember statement found" -Recommendation "Add Export-ModuleMember to explicitly define module interface"
    }
    
    # Check discovery module requirements
    if ($moduleType -eq "Discovery") {
        $functionDefs = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst]}, $true)
        $functionNames = $functionDefs | ForEach-Object { $_.Name }
        
        $requiredFunctions = @("Invoke-Discovery", "Get-DiscoveryInfo")
        foreach ($required in $requiredFunctions) {
            if ($required -notin $functionNames) {
                Add-Issue -Severity "ERROR" -Category "Interface" -File $FilePath -Message "Discovery module missing required function: $required" -Recommendation "Implement required discovery interface functions"
            }
        }
    }
    
    # Check for error handling
    $functionDefs = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst]}, $true)
    foreach ($func in $functionDefs) {
        $tryBlocks = $func.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst]}, $true)
        if ($tryBlocks.Count -eq 0 -and $func.Body.ToString().Length -gt 500) {
            Add-Issue -Severity "WARN" -Category "ErrorHandling" -File $FilePath -Message "Function '$($func.Name)' lacks error handling" -Recommendation "Add try-catch blocks for robust error handling"
        }
    }
}

function Get-ModuleType {
    param([string]$FilePath)
    
    if ($FilePath -match "\\Discovery\\") { return "Discovery" }
    if ($FilePath -match "\\Processing\\") { return "Processing" }
    if ($FilePath -match "\\Export\\") { return "Export" }
    if ($FilePath -match "\\Utilities\\") { return "Utilities" }
    if ($FilePath -match "\\Authentication\\") { return "Authentication" }
    if ($FilePath -match "\\Connectivity\\") { return "Connectivity" }
    return "Unknown"
}

function Show-ValidationSummary {
    $errorCount = ($script:Issues | Where-Object {$_.Severity -eq "ERROR"}).Count
    $warnCount = ($script:Issues | Where-Object {$_.Severity -eq "WARN"}).Count
    $infoCount = ($script:Issues | Where-Object {$_.Severity -eq "INFO"}).Count
    
    Write-Host "`n" + ("="*80) -ForegroundColor Cyan
    Write-Host "SIMPLE MODULE VALIDATION SUMMARY" -ForegroundColor Cyan
    Write-Host ("="*80) -ForegroundColor Cyan
    
    Write-Host "Total Issues: $($script:Issues.Count)" -ForegroundColor White
    Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
    Write-Host "  Warnings: $warnCount" -ForegroundColor $(if ($warnCount -eq 0) { "Green" } else { "Yellow" })
    Write-Host "  Info: $infoCount" -ForegroundColor Gray
    Write-Host ""
    
    if ($DetailedReport -and $script:Issues.Count -gt 0) {
        Write-Host "DETAILED ISSUES:" -ForegroundColor White
        $script:Issues | Group-Object Category | ForEach-Object {
            Write-Host "`n$($_.Name) Issues:" -ForegroundColor Yellow
            $_.Group | ForEach-Object {
                $color = switch ($_.Severity) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    default { "Gray" }
                }
                Write-Host "  [$($_.Severity)] $([System.IO.Path]::GetFileName($_.File)): $($_.Message)" -ForegroundColor $color
                if ($_.Recommendation) {
                    Write-Host "    → $($_.Recommendation)" -ForegroundColor Gray
                }
            }
        }
    }
    
    if ($errorCount -eq 0) {
        Write-Host "✅ VALIDATION PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ VALIDATION FAILED" -ForegroundColor Red
        Write-Host "$errorCount critical errors must be resolved" -ForegroundColor Red
    }
    
    Write-Host ("="*80) -ForegroundColor Cyan
}

# Main execution
Write-ValidatorLog "Starting simple module validation" "INFO"

# Discover all modules
$allModules = @()
$moduleDirectories = @("Discovery", "Processing", "Export", "Utilities", "Authentication", "Connectivity")

foreach ($dir in $moduleDirectories) {
    $dirPath = Join-Path $ModulesPath $dir
    if (Test-Path $dirPath) {
        $modules = Get-ChildItem -Path $dirPath -Filter "*.psm1" -ErrorAction SilentlyContinue
        $allModules += $modules
    }
}

Write-ValidatorLog "Found $($allModules.Count) modules to validate" "INFO"

# Validate each module
$validatedCount = 0
foreach ($module in $allModules) {
    if (Test-ModuleSyntax -FilePath $module.FullName) {
        $validatedCount++
    }
}

Write-ValidatorLog "Successfully validated $validatedCount of $($allModules.Count) modules" "INFO"

# Show results
Show-ValidationSummary

# Export results
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resultsPath = "ValidationResults"
if (-not (Test-Path $resultsPath)) {
    New-Item -Path $resultsPath -ItemType Directory -Force | Out-Null
}

$csvPath = Join-Path $resultsPath "SimpleValidation_$timestamp.csv"
$script:Issues | Export-Csv $csvPath -NoTypeInformation
Write-ValidatorLog "Results exported to $csvPath" "SUCCESS"

# Return appropriate exit code
if (($script:Issues | Where-Object {$_.Severity -eq "ERROR"}).Count -gt 0) {
    exit 1
} else {
    exit 0
}
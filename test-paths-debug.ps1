# Test script to debug the paths issue
param(
    [string]$CompanyName = "Zedra"
)

$ErrorActionPreference = "Stop"

# Determine Suite Root
$SuiteRoot = $PSScriptRoot
Write-Host "SuiteRoot: $SuiteRoot" -ForegroundColor Green

# Source the environment script
$EnvScriptPath = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
Write-Host "EnvScriptPath: $EnvScriptPath" -ForegroundColor Green

if (Test-Path $EnvScriptPath) {
    Write-Host "Environment script exists" -ForegroundColor Green
    
    # Source the script
    . $EnvScriptPath -CompanyName $CompanyName -ProvidedSuiteRoot $SuiteRoot
    
    # Check if global:MandA was created
    if ($global:MandA) {
        Write-Host "global:MandA exists" -ForegroundColor Green
        Write-Host "Initialized: $($global:MandA.Initialized)" -ForegroundColor Yellow
        
        if ($global:MandA.Paths) {
            Write-Host "Paths object exists" -ForegroundColor Green
            Write-Host "CredentialFile: '$($global:MandA.Paths.CredentialFile)'" -ForegroundColor Yellow
            Write-Host "OrchestratorScript: '$($global:MandA.Paths.OrchestratorScript)'" -ForegroundColor Yellow
            Write-Host "ConfigFile: '$($global:MandA.Paths.ConfigFile)'" -ForegroundColor Yellow
            
            # Check if OrchestratorScript path exists
            if ($global:MandA.Paths.OrchestratorScript) {
                if (Test-Path $global:MandA.Paths.OrchestratorScript) {
                    Write-Host "OrchestratorScript file exists" -ForegroundColor Green
                } else {
                    Write-Host "OrchestratorScript file does NOT exist" -ForegroundColor Red
                }
            } else {
                Write-Host "OrchestratorScript path is NULL or empty" -ForegroundColor Red
            }
        } else {
            Write-Host "Paths object is NULL" -ForegroundColor Red
        }
    } else {
        Write-Host "global:MandA is NULL" -ForegroundColor Red
    }
} else {
    Write-Host "Environment script does NOT exist" -ForegroundColor Red
}
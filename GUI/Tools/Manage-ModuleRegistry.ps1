#Requires -Version 5.1

<#
.SYNOPSIS
    PowerShell wrapper for the Module Registry Manager

.DESCRIPTION
    This script provides easy access to the Module Registry Manager for validating,
    fixing, and maintaining the discovery module registry.

.PARAMETER Command
    The operation to perform: validate, health, generate, merge, fix, list

.PARAMETER RootPath
    The root path where modules are located (default: C:\EnterpriseDiscovery)

.PARAMETER ShowVerbose
    Show detailed output and stack traces

.EXAMPLE
    .\Manage-ModuleRegistry.ps1 -Command validate
    Validates the current registry against the filesystem

.EXAMPLE
    .\Manage-ModuleRegistry.ps1 -Command fix -ShowVerbose
    Auto-fixes all registry issues with detailed output

.EXAMPLE
    .\Manage-ModuleRegistry.ps1 -Command health
    Generates a comprehensive health report
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('validate', 'health', 'generate', 'merge', 'fix', 'list')]
    [string]$Command,
    
    [Parameter(Mandatory = $false)]
    [string]$RootPath = "C:\EnterpriseDiscovery",
    
    [Parameter(Mandatory = $false)]
    [switch]$ShowVerbose
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Colors for output
$Colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error   = 'Red'
    Info    = 'Cyan'
    Header  = 'Magenta'
}

function Write-ColoredText {
    param(
        [string]$Text,
        [string]$Color = 'White'
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Test-Prerequisites {
    param(
        [string]$RootPath
    )
    
    Write-ColoredText "🔍 Checking prerequisites..." -Color Info
    
    # Check if .NET 6 is available
    try {
        $dotnetOutput = & dotnet --version 2>&1
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($dotnetOutput)) {
            throw "dotnet command not found or failed"
        }
        
        # Handle case where version might have extra text
        $versionNumber = $dotnetOutput.ToString().Trim()
        if ($versionNumber -match '(\d+)\.(\d+)\.(\d+)') {
            $majorVersion = [int]$matches[1]  
            if ($majorVersion -lt 6) {
                throw "Requires .NET 6 or later, found version $versionNumber"
            }
        } else {
            throw "Could not parse .NET version: $versionNumber"
        }
        
        Write-ColoredText "✅ .NET $versionNumber detected" -Color Success
    }
    catch {
        Write-ColoredText "❌ .NET 6 runtime required but not found: $($_.Exception.Message)" -Color Error
        Write-ColoredText "Please install .NET 6 runtime from: https://dotnet.microsoft.com/download/dotnet/6.0" -Color Warning
        return $false
    }
    
    # Check if root path exists
    if (!(Test-Path $RootPath)) {
        Write-ColoredText "❌ Root path does not exist: $RootPath" -Color Error
        return $false
    }
    
    Write-ColoredText "✅ Prerequisites check passed" -Color Success
    return $true
}

function Invoke-RegistryManager {
    param(
        [string]$Command,
        [string]$RootPath,
        [bool]$ShowVerbose
    )
    
    Write-ColoredText "🚀 Executing registry manager..." -Color Info
    Write-ColoredText "Command: $Command" -Color Info
    Write-ColoredText "Root Path: $RootPath" -Color Info
    Write-Host ""
    
    # Build command arguments
    $args = @($Command, $RootPath)
    if ($ShowVerbose) {
        $args += "--verbose"
    }
    
    try {
        # Try to use the compiled tool first
        $toolPath = Join-Path $PSScriptRoot "..\bin\Release\net6.0-windows\ModuleRegistryManager.exe"
        
        if (Test-Path $toolPath) {
            Write-ColoredText "Using compiled registry manager..." -Color Info
            & $toolPath @args
        }
        else {
            # Fallback to dotnet run
            Write-ColoredText "Using dotnet run fallback..." -Color Info
            $projectPath = Join-Path $PSScriptRoot "..\MandADiscoverySuite.csproj"
            & dotnet run --project $projectPath --configuration Release -- @args
        }
        
        $exitCode = $LASTEXITCODE
        
        Write-Host ""
        if ($exitCode -eq 0) {
            Write-ColoredText "✅ Operation completed successfully" -Color Success
        }
        else {
            Write-ColoredText "❌ Operation failed with exit code: $exitCode" -Color Error
        }
        
        return $exitCode
    }
    catch {
        Write-ColoredText "❌ Failed to execute registry manager: $($_.Exception.Message)" -Color Error
        return 1
    }
}

function Show-QuickHelp {
    Write-ColoredText "=== M`&A Discovery Suite - Module Registry Manager ===" -Color Header
    Write-Host ""
    Write-ColoredText "This tool helps maintain the foolproof module registry system that ensures" -Color Info
    Write-ColoredText "GUI tiles always correctly link to PowerShell discovery modules." -Color Info
    Write-Host ""
    
    Write-ColoredText "Available Commands:" -Color Header
    Write-Host ""
    Write-Host "  🔍 validate  - Check registry against filesystem"
    Write-Host "  🏥 health    - Generate comprehensive health report"
    Write-Host "  🔧 generate  - Create new registry from modules"
    Write-Host "  🔄 merge     - Add discovered modules to registry"
    Write-Host "  🛠️ fix       - Auto-fix all registry issues (recommended)"
    Write-Host "  📋 list      - Show all registered modules"
    Write-Host ""
    
    Write-ColoredText "Quick Start:" -Color Header
    Write-Host "  1. Run fix command to resolve any issues:"
    Write-ColoredText "     .\Manage-ModuleRegistry.ps1 -Command fix" -Color Info
    Write-Host ""
    Write-Host "  2. Check system health:"
    Write-ColoredText "     .\Manage-ModuleRegistry.ps1 -Command health" -Color Info
    Write-Host ""
    Write-Host "  3. List all available modules:"
    Write-ColoredText "     .\Manage-ModuleRegistry.ps1 -Command list" -Color Info
    Write-Host ""
}

# Main execution
try {
    Write-ColoredText "=== M`&A Discovery Suite - Module Registry Manager ===" -Color Header
    Write-Host ""
    
    # Show help for common commands
    if ($Command -in @('help', '?', 'usage')) {
        Show-QuickHelp
        exit 0
    }
    
    # Check prerequisites
    if (!(Test-Prerequisites -RootPath $RootPath)) {
        exit 1
    }
    
    Write-Host ""
    
    # Execute the requested command
    $exitCode = Invoke-RegistryManager -Command $Command -RootPath $RootPath -ShowVerbose:$ShowVerbose.IsPresent
    
    Write-Host ""
    Write-ColoredText "=== Operation Complete ===" -Color Header
    
    # Provide next steps based on command
    switch ($Command) {
        'validate' {
            if ($exitCode -ne 0) {
                Write-ColoredText "💡 Next step: Run 'fix' command to resolve issues" -Color Warning
            }
        }
        'health' {
            Write-ColoredText "💡 Tip: Run this health check after making module changes" -Color Info
        }
        'fix' {
            if ($exitCode -eq 0) {
                Write-ColoredText "🎉 Registry is now healthy! You can rebuild the GUI application." -Color Success
            }
        }
        'generate' {
            Write-ColoredText "💡 Next step: Validate the new registry with 'validate' command" -Color Info
        }
    }
    
    exit $exitCode
}
catch {
    Write-ColoredText "❌ Unexpected error: $($_.Exception.Message)" -Color Error
    if ($ShowVerbose) {
        Write-ColoredText "Stack trace: $($_.ScriptStackTrace)" -Color Error
    }
    exit 1
}
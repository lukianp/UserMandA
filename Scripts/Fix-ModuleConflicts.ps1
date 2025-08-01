# Fix-ModuleConflicts.ps1
# Resolves Azure PowerShell module conflicts that prevent the M&A Discovery Suite from running
#
# This script addresses the common issue where AzureRM and Az modules conflict,
# or where corrupted module assemblies prevent proper loading.

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$RemoveAzureRM,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colorMap = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Cyan" = [ConsoleColor]::Cyan
        "Magenta" = [ConsoleColor]::Magenta
        "White" = [ConsoleColor]::White
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

function Test-AdminPrivileges {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

Write-ColorOutput "=======================================================================" "Cyan"
Write-ColorOutput "  Azure PowerShell Module Conflict Resolution Tool" "Cyan"
Write-ColorOutput "  Preparing environment for M&A Discovery Suite" "Cyan"
Write-ColorOutput "=======================================================================" "Cyan"

if ($WhatIf) {
    Write-ColorOutput "`n[WHAT-IF MODE] - No changes will be made" "Yellow"
}

# Check admin privileges
$isAdmin = Test-AdminPrivileges
if ($isAdmin) {
    Write-ColorOutput "`nRunning with administrator privileges" "Green"
} else {
    Write-ColorOutput "`nNot running as administrator - some operations may be limited" "Yellow"
}

# Step 1: Unload all conflicting modules
Write-ColorOutput "`n1. Unloading conflicting modules..." "Cyan"

$conflictingPatterns = @("Az.*", "AzureRM.*", "Microsoft.Graph.*", "Azure.*")
$unloadedCount = 0

foreach ($pattern in $conflictingPatterns) {
    $loadedModules = Get-Module -Name $pattern -ErrorAction SilentlyContinue
    foreach ($module in $loadedModules) {
        try {
            if (-not $WhatIf) {
                Remove-Module -Name $module.Name -Force -ErrorAction Stop
            }
            Write-ColorOutput "  Unloaded: $($module.Name) v$($module.Version)" "Green"
            $unloadedCount++
        } catch {
            Write-ColorOutput "  Failed to unload: $($module.Name) - $($_.Exception.Message)" "Red"
        }
    }
}

if ($unloadedCount -eq 0) {
    Write-ColorOutput "  No conflicting modules were loaded" "White"
} else {
    Write-ColorOutput "  Unloaded $unloadedCount modules" "Green"
}

# Step 2: Check for AzureRM modules
Write-ColorOutput "`n2. Checking for AzureRM modules..." "Cyan"

$azureRMModules = Get-Module -ListAvailable -Name "AzureRM*" -ErrorAction SilentlyContinue
if ($azureRMModules) {
    Write-ColorOutput "  Found $($azureRMModules.Count) AzureRM modules" "Yellow"
    Write-ColorOutput "  AzureRM modules can conflict with Az modules" "Yellow"
    
    if ($RemoveAzureRM) {
        Write-ColorOutput "  Removing AzureRM modules..." "Yellow"
        
        foreach ($module in $azureRMModules) {
            try {
                if (-not $WhatIf) {
                    Uninstall-Module -Name $module.Name -AllVersions -Force -ErrorAction Stop
                }
                Write-ColorOutput "    Removed: $($module.Name)" "Green"
            } catch {
                Write-ColorOutput "    Failed to remove: $($module.Name) - $($_.Exception.Message)" "Red"
            }
        }
    } else {
        Write-ColorOutput "  Use -RemoveAzureRM to automatically remove these modules" "White"
        Write-ColorOutput "  Or manually run: Uninstall-AzureRM" "White"
    }
} else {
    Write-ColorOutput "  No AzureRM modules found" "Green"
}

# Step 3: Force garbage collection
Write-ColorOutput "`n3. Releasing module assemblies..." "Cyan"

if (-not $WhatIf) {
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    [System.GC]::Collect()
}

Write-ColorOutput "  Forced garbage collection completed" "Green"

# Step 4: Check PowerShell execution policy
Write-ColorOutput "`n4. Checking PowerShell execution policy..." "Cyan"

$executionPolicy = Get-ExecutionPolicy -Scope CurrentUser
Write-ColorOutput "  Current policy (CurrentUser): $executionPolicy" "White"

if ($executionPolicy -eq "Restricted") {
    Write-ColorOutput "  Execution policy is Restricted - this may prevent module installation" "Yellow"
    Write-ColorOutput "  Consider running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" "White"
} else {
    Write-ColorOutput "  Execution policy allows module installation" "Green"
}

# Step 5: Check PowerShell Gallery trust
Write-ColorOutput "`n5. Checking PowerShell Gallery configuration..." "Cyan"

$psGallery = Get-PSRepository -Name "PSGallery" -ErrorAction SilentlyContinue
if ($psGallery) {
    Write-ColorOutput "  PowerShell Gallery status: $($psGallery.InstallationPolicy)" "White"
    
    if ($psGallery.InstallationPolicy -eq "Untrusted") {
        Write-ColorOutput "  PowerShell Gallery is untrusted - you may see prompts during installation" "White"
        Write-ColorOutput "  To trust: Set-PSRepository -Name 'PSGallery' -InstallationPolicy Trusted" "White"
    } else {
        Write-ColorOutput "  PowerShell Gallery is trusted" "Green"
    }
} else {
    Write-ColorOutput "  PowerShell Gallery repository not found" "Red"
}

# Step 6: Test module installation capability
Write-ColorOutput "`n6. Testing module installation capability..." "Cyan"

try {
    if (-not $WhatIf) {
        # Try to find a simple module to test connectivity
        $testModule = Find-Module -Name "PowerShellGet" -Repository PSGallery -ErrorAction Stop
        Write-ColorOutput "  Can connect to PowerShell Gallery" "Green"
        Write-ColorOutput "  Module installation should work" "Green"
    } else {
        Write-ColorOutput "  [WHAT-IF] Would test PowerShell Gallery connectivity" "Yellow"
    }
} catch {
    Write-ColorOutput "  Cannot connect to PowerShell Gallery: $($_.Exception.Message)" "Red"
    Write-ColorOutput "  Check internet connectivity and proxy settings" "White"
}

# Step 7: Clean up module cache (if admin)
if ($isAdmin) {
    Write-ColorOutput "`n7. Cleaning module cache (Administrator)..." "Cyan"
    
    $modulePaths = @(
        "$env:ProgramFiles\WindowsPowerShell\Modules",
        "$env:ProgramFiles\PowerShell\Modules"
    )
    
    foreach ($path in $modulePaths) {
        if (Test-Path $path) {
            $azModules = Get-ChildItem -Path $path -Directory -Name "Az.*" -ErrorAction SilentlyContinue
            $azureRMModulesInPath = Get-ChildItem -Path $path -Directory -Name "AzureRM*" -ErrorAction SilentlyContinue
            
            if ($azModules -or $azureRMModulesInPath) {
                Write-ColorOutput "  Found modules in: $path" "White"
                
                if ($Force -and -not $WhatIf) {
                    Write-ColorOutput "  Force cleaning conflicting modules..." "Yellow"
                    
                    foreach ($module in $azureRMModulesInPath) {
                        try {
                            $fullPath = Join-Path $path $module
                            Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                            Write-ColorOutput "    Removed: $module" "Green"
                        } catch {
                            Write-ColorOutput "    Failed to remove: $module" "Red"
                        }
                    }
                } else {
                    Write-ColorOutput "  Use -Force to clean these modules" "White"
                }
            }
        }
    }
} else {
    Write-ColorOutput "`n7. Module cache cleaning skipped (requires Administrator)" "Yellow"
}

# Step 8: Recommendations
Write-ColorOutput "`n8. Recommendations:" "Cyan"

Write-ColorOutput "  Before running the M&A Discovery Suite:" "White"
Write-ColorOutput "     1. Close all PowerShell windows" "White"
Write-ColorOutput "     2. Open a new PowerShell session" "White"
Write-ColorOutput "     3. Run the M&A Discovery Suite script" "White"

if ($azureRMModules -and -not $RemoveAzureRM) {
    Write-ColorOutput "`n  IMPORTANT: AzureRM modules detected!" "Yellow"
    Write-ColorOutput "     Consider removing them to prevent conflicts:" "Yellow"
    Write-ColorOutput "     .\Fix-ModuleConflicts.ps1 -RemoveAzureRM" "Yellow"
}

Write-ColorOutput "`n  If problems persist:" "White"
Write-ColorOutput "     1. Run this script with -Force (as Administrator)" "White"
Write-ColorOutput "     2. Restart PowerShell completely" "White"
Write-ColorOutput "     3. Consider using PowerShell 7+ instead of 5.1" "White"

# Summary
Write-ColorOutput "`n=======================================================================" "Cyan"
if ($WhatIf) {
    Write-ColorOutput "  Module conflict analysis completed (What-If mode)" "Cyan"
} else {
    Write-ColorOutput "  Module conflict resolution completed" "Green"
}
Write-ColorOutput "  Ready to run M&A Discovery Suite" "Green"
Write-ColorOutput "=======================================================================" "Cyan"
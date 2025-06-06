# Test script for connection initialization
param(
    [string]$CompanyName = "Zedra"
)

Write-Host "Testing Connection Initialization Fix" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Initialize environment
try {
    Write-Host "1. Initializing environment..." -ForegroundColor Yellow
    . ".\Scripts\Set-SuiteEnvironment.ps1" -ProvidedSuiteRoot $PWD -CompanyName $CompanyName
    Write-Host "   Environment initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to initialize environment: $_" -ForegroundColor Red
    exit 1
}

# Load authentication modules
try {
    Write-Host "2. Loading authentication and utility modules..." -ForegroundColor Yellow
    Import-Module ".\Modules\Authentication\Authentication.psm1" -Force
    Import-Module ".\Modules\Authentication\CredentialManagement.psm1" -Force
    Import-Module ".\Modules\Utilities\ProgressDisplay.psm1" -Force
    Write-Host "   Authentication and utility modules loaded" -ForegroundColor Green
} catch {
    Write-Host "   Failed to load modules: $_" -ForegroundColor Red
    exit 1
}

# Test authentication initialization
try {
    Write-Host "3. Testing authentication initialization..." -ForegroundColor Yellow
    $authResult = Initialize-MandAAuthentication -Configuration $global:MandA.Config
    if ($authResult -and $authResult.Authenticated) {
        Write-Host "   Authentication successful" -ForegroundColor Green
        
        # Get authentication context
        try {
            $authContext = Get-AuthenticationContext
            if ($authContext) {
                Write-Host "   Authentication method: $($authContext.AuthenticationMethod)" -ForegroundColor Gray
                Write-Host "   Tenant ID: $($authContext.TenantId)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   Warning: Could not get authentication context: $_" -ForegroundColor Yellow
            # Use the auth result instead
            $authContext = $authResult
        }
    } else {
        Write-Host "   Authentication failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   Authentication error: $_" -ForegroundColor Red
    exit 1
}

# Test connection initialization
try {
    Write-Host "4. Testing connection initialization..." -ForegroundColor Yellow
    
    # Create mock progress functions to handle missing dependencies
    if (-not (Get-Command Write-ProgressHeader -ErrorAction SilentlyContinue)) {
        function global:Write-ProgressHeader {
            param([string]$Message, [string]$SubMessage = "")
            Write-Host "   [PROGRESS] $Message" -ForegroundColor Cyan
            if ($SubMessage) { Write-Host "   [PROGRESS] $SubMessage" -ForegroundColor Gray }
        }
        Write-Host "   Created mock Write-ProgressHeader function" -ForegroundColor Yellow
    }
    
    if (-not (Get-Command Write-ProgressStep -ErrorAction SilentlyContinue)) {
        function global:Write-ProgressStep {
            param([string]$Message, [string]$Status = "Processing")
            Write-Host "   [STEP] $Message - $Status" -ForegroundColor Gray
        }
        Write-Host "   Created mock Write-ProgressStep function" -ForegroundColor Yellow
    }
    
    if (-not (Get-Command Show-ConnectionStatus -ErrorAction SilentlyContinue)) {
        function global:Show-ConnectionStatus {
            param([string]$Service, [bool]$Connected, [string]$Details = "")
            $status = if ($Connected) { "✅ CONNECTED" } else { "❌ FAILED" }
            $color = if ($Connected) { "Green" } else { "Red" }
            Write-Host "   [STATUS] $Service`: $status" -ForegroundColor $color
            if ($Details) { Write-Host "   [DETAILS] $Details" -ForegroundColor Gray }
        }
        Write-Host "   Created mock Show-ConnectionStatus function" -ForegroundColor Yellow
    }
    
    # Load EnhancedConnectionManager first
    $connMgrPath = Join-Path $global:MandA.Paths.Connectivity "EnhancedConnectionManager.psm1"
    if (Test-Path $connMgrPath) {
        Import-Module $connMgrPath -Force
        Write-Host "   Loaded EnhancedConnectionManager module" -ForegroundColor Green
    } else {
        Write-Host "   EnhancedConnectionManager module not found at: $connMgrPath" -ForegroundColor Red
        exit 1
    }
    
    # Check if Initialize-AllConnections function exists now
    if (Get-Command Initialize-AllConnections -ErrorAction SilentlyContinue) {
        Write-Host "   Initialize-AllConnections function found" -ForegroundColor Green
        
        # Initialize connections
        Write-Host "   Initializing service connections..." -ForegroundColor Yellow
        Write-Host "   This will test if the credentials are valid and can establish connections..." -ForegroundColor Gray
        
        $connections = Initialize-AllConnections -Configuration $global:MandA.Config -AuthContext $authContext
        
        # Display results
        Write-Host "`n   Connection Test Results:" -ForegroundColor Cyan
        Write-Host "   ========================" -ForegroundColor Cyan
        
        $successCount = 0
        $totalCount = 0
        
        foreach ($service in $connections.Keys) {
            $totalCount++
            $status = $connections[$service]
            $connected = if ($status -is [bool]) { $status } else { $status.Connected }
            
            $color = if ($connected) { "Green" } else { "Red" }
            $statusText = if ($connected) { "SUCCESS" } else { "FAILED" }
            
            Write-Host "     [$statusText] $service" -ForegroundColor $color
            
            if ($connected) {
                $successCount++
                if ($status -isnot [bool] -and $status.Details) {
                    Write-Host "       Details: $($status.Details)" -ForegroundColor Gray
                }
            } else {
                if ($status -isnot [bool] -and $status.Error) {
                    Write-Host "       Error: $($status.Error)" -ForegroundColor Red
                }
                if ($status -isnot [bool] -and $status.Details) {
                    Write-Host "       Details: $($status.Details)" -ForegroundColor Yellow
                }
            }
        }
        
        Write-Host "`n   Summary: $successCount/$totalCount connections successful" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } elseif ($successCount -gt 0) { "Yellow" } else { "Red" })
        
        if ($successCount -gt 0) {
            Write-Host "   ✅ Credentials are valid and working for $successCount service(s)" -ForegroundColor Green
        }
        
        if ($successCount -lt $totalCount) {
            Write-Host "   ⚠️  Some connections failed - this may be due to service configuration or permissions" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "   Initialize-AllConnections function not found!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "   Connection initialization error: $_" -ForegroundColor Red
    Write-Host "   Exception: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This may indicate credential or configuration issues" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nConnection initialization test completed successfully!" -ForegroundColor Green
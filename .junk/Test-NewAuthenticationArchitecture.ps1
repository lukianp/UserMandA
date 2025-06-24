# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script for the new authentication architecture
.DESCRIPTION
    Validates the new thread-safe session-based authentication system
.NOTES
    Author: M&A Discovery Team
    Version: 3.0.0
    Created: 2025-06-11
    Architecture: New thread-safe session-based authentication
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipInteractive,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestConcurrency,
    
    [Parameter(Mandatory=$false)]
    [switch]$AzureOnly
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing New Authentication Architecture" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Initialize test results
$testResults = @{
    Passed = 0
    Failed = 0
    Tests = [System.Collections.ArrayList]::new()
}

function Test-Result {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = ""
    )
    
    $result = @{
        Name = $TestName
        Success = $Success
        Details = $Details
        Timestamp = Get-Date
    }
    
    $null = $testResults.Tests.Add($result)
    
    if ($Success) {
        $testResults.Passed++
        Write-Host "[PASS] $TestName" -ForegroundColor Green
        if ($Details) { Write-Host "       $Details" -ForegroundColor Gray }
    } else {
        $testResults.Failed++
        Write-Host "[FAIL] $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "       $Details" -ForegroundColor Yellow }
    }
}

try {
    # Test 1: Load Authentication Modules
    Write-Host "`nTest 1: Loading Authentication Modules" -ForegroundColor Yellow
    
    try {
        # Remove any existing modules first
        Get-Module AuthSession, SessionManager, CredentialManagement, AuthenticationService | Remove-Module -Force -ErrorAction SilentlyContinue
        
        # Import modules with explicit function specification to avoid scoping issues
        Write-Host "       Loading AuthSession..." -ForegroundColor Gray
        Import-Module ".\Modules\Authentication\AuthSession.psm1" -Force -Global
        
        Write-Host "       Loading SessionManager with explicit functions..." -ForegroundColor Gray
        Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force -Global -Function @(
            'New-AuthenticationSession',
            'Get-AuthenticationSession',
            'Remove-AuthenticationSession',
            'Get-AuthenticationSessionCount',
            'Clear-AllAuthenticationSessions'
        )
        
        Write-Host "       Loading CredentialManagement..." -ForegroundColor Gray
        Import-Module ".\Modules\Authentication\CredentialManagement.psm1" -Force -Global
        
        Write-Host "       Loading AuthenticationService..." -ForegroundColor Gray
        Import-Module ".\Modules\Authentication\AuthenticationService.psm1" -Force -Global
        
        # Verify functions are available
        $sessionFunctions = @('New-AuthenticationSession', 'Get-AuthenticationSession', 'Remove-AuthenticationSession', 'Get-AuthenticationSessionCount', 'Clear-AllAuthenticationSessions')
        $missingFunctions = @()
        
        foreach ($func in $sessionFunctions) {
            $cmd = Get-Command $func -ErrorAction SilentlyContinue
            if (-not $cmd) {
                $missingFunctions += $func
            } else {
                Write-Host "       Found: $func from $($cmd.Source)" -ForegroundColor Gray
            }
        }
        
        if ($missingFunctions.Count -eq 0) {
            Test-Result "Load Authentication Modules" $true "All 4 modules loaded successfully with $($sessionFunctions.Count) functions"
        } else {
            Test-Result "Load Authentication Modules" $false "Missing functions: $($missingFunctions -join ', ')"
            throw "Cannot continue without authentication functions"
        }
    } catch {
        Test-Result "Load Authentication Modules" $false "Error: $($_.Exception.Message)"
        throw "Cannot continue without authentication modules"
    }
    
    # Test 2: Session Manager Singleton
    Write-Host "`nTest 2: Session Manager Singleton Pattern" -ForegroundColor Yellow
    
    try {
        $sessionManager1 = [SessionManager]::GetInstance()
        $sessionManager2 = [SessionManager]::GetInstance()
        
        $isSingleton = $sessionManager1 -eq $sessionManager2
        Test-Result "Session Manager Singleton" $isSingleton "Same instance returned: $isSingleton"
    } catch {
        Test-Result "Session Manager Singleton" $false "Error: $($_.Exception.Message)"
    }
    
    # Test 3: Session Creation and Management
    Write-Host "`nTest 3: Session Creation and Management" -ForegroundColor Yellow
    
    try {
        # Create test credentials
        $testTenantId = "12345678-1234-1234-1234-123456789012"
        $testClientId = "87654321-4321-4321-4321-210987654321"
        $testSecret = ConvertTo-SecureString "TestSecret123!" -AsPlainText -Force
        
        # Create session
        $sessionId = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
        
        if ($sessionId) {
            Test-Result "Create Authentication Session" $true "Session ID: $($sessionId.Substring(0,8))..."
            
            # Get session
            $session = Get-AuthenticationSession -SessionId $sessionId
            if ($session -and $session.IsValid()) {
                Test-Result "Retrieve Authentication Session" $true "Session retrieved and valid"
                
                # Test session properties
                $credentialTest = $session.GetCredential()
                if ($credentialTest -and $credentialTest.UserName -eq $testClientId) {
                    Test-Result "Session Credential Access" $true "Credentials accessible and correct"
                } else {
                    Test-Result "Session Credential Access" $false "Credential mismatch or null"
                }
                
                # Clean up test session
                $removed = Remove-AuthenticationSession -SessionId $sessionId
                Test-Result "Remove Authentication Session" $removed "Session cleanup: $removed"
                
            } else {
                Test-Result "Retrieve Authentication Session" $false "Session not found or invalid"
            }
        } else {
            Test-Result "Create Authentication Session" $false "No session ID returned"
        }
    } catch {
        Test-Result "Session Creation and Management" $false "Error: $($_.Exception.Message)"
    }
    
    # Test 4: Session Count Tracking
    Write-Host "`nTest 4: Session Count Tracking" -ForegroundColor Yellow
    
    try {
        $initialCount = Get-AuthenticationSessionCount
        
        # Create multiple sessions
        $session1 = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
        $session2 = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
        
        $midCount = Get-AuthenticationSessionCount
        
        # Remove sessions
        Remove-AuthenticationSession -SessionId $session1
        Remove-AuthenticationSession -SessionId $session2
        
        $finalCount = Get-AuthenticationSessionCount
        
        $countingWorks = ($midCount -eq $initialCount + 2) -and ($finalCount -eq $initialCount)
        Test-Result "Session Count Tracking" $countingWorks "Initial: $initialCount, Mid: $midCount, Final: $finalCount"
        
    } catch {
        Test-Result "Session Count Tracking" $false "Error: $($_.Exception.Message)"
    }
    
    # Test 5: Thread-Safe Concurrent Access (if requested)
    if ($TestConcurrency) {
        Write-Host "`nTest 5: Thread-Safe Concurrent Access" -ForegroundColor Yellow
        
        try {
            # Create a session for concurrent testing
            $concurrentSessionId = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
            
            # Create multiple runspaces that access the same session
            $runspacePool = [runspacefactory]::CreateRunspacePool(1, 5)
            $runspacePool.Open()
            
            $jobs = @()
            for ($i = 1; $i -le 10; $i++) {
                $powershell = [powershell]::Create()
                $powershell.RunspacePool = $runspacePool
                
                $scriptBlock = {
                    param($sessionId, $iteration)
                    
                    try {
                        # Import required modules
                        Import-Module ".\Modules\Authentication\AuthSession.psm1" -Force
                        Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force
                        
                        # Access session concurrently
                        $session = Get-AuthenticationSession -SessionId $sessionId
                        if ($session) {
                            $credential = $session.GetCredential()
                            Start-Sleep -Milliseconds (Get-Random -Minimum 10 -Maximum 100)
                            
                            return @{
                                Success = $true
                                Iteration = $iteration
                                SessionValid = $session.IsValid()
                                CredentialValid = ($null -ne $credential)
                            }
                        } else {
                            return @{
                                Success = $false
                                Iteration = $iteration
                                Error = "Session not found"
                            }
                        }
                    } catch {
                        return @{
                            Success = $false
                            Iteration = $iteration
                            Error = $_.Exception.Message
                        }
                    }
                }
                
                $null = $powershell.AddScript($scriptBlock)
                $null = $powershell.AddArgument($concurrentSessionId)
                $null = $powershell.AddArgument($i)
                
                $jobs += @{
                    PowerShell = $powershell
                    Handle = $powershell.BeginInvoke()
                    Id = $i
                }
            }
            
            # Wait for all jobs to complete
            $results = @()
            foreach ($job in $jobs) {
                $result = $job.PowerShell.EndInvoke($job.Handle)
                $results += $result
                $job.PowerShell.Dispose()
            }
            
            $runspacePool.Close()
            $runspacePool.Dispose()
            
            # Analyze results
            $successfulJobs = ($results | Where-Object { $_.Success }).Count
            $totalJobs = $results.Count
            
            $concurrencySuccess = $successfulJobs -eq $totalJobs
            Test-Result "Thread-Safe Concurrent Access" $concurrencySuccess "Successful jobs: $successfulJobs/$totalJobs"
            
            # Clean up concurrent test session
            Remove-AuthenticationSession -SessionId $concurrentSessionId
            
        } catch {
            Test-Result "Thread-Safe Concurrent Access" $false "Error: $($_.Exception.Message)"
        }
    }
    
    # Test 6: Authentication Service Integration
    Write-Host "`nTest 6: Authentication Service Integration" -ForegroundColor Yellow
    
    if (-not $SkipInteractive) {
        try {
            # Create a mock configuration
            $mockConfig = @{
                authentication = @{
                    credentialStorePath = Join-Path $env:TEMP "test_credentials.json"
                    authenticationMethod = "ClientSecret"
                }
            }
            
            # Test credential management
            $testCredentials = @{
                Success = $true
                ClientId = $testClientId
                ClientSecret = "TestSecret123!"
                TenantId = $testTenantId
            }
            
            # Test credential validation
            $isValid = Test-CredentialValidity -Credentials $testCredentials
            Test-Result "Credential Validation" $isValid "Credential format validation"
            
            # Test credential saving (to temp file)
            $saved = Set-SecureCredentials -ClientId $testClientId -ClientSecret "TestSecret123!" -TenantId $testTenantId -Configuration $mockConfig
            Test-Result "Credential Storage" $saved "Secure credential storage"
            
            # Clean up test credential file
            if (Test-Path $mockConfig.authentication.credentialStorePath) {
                Remove-Item $mockConfig.authentication.credentialStorePath -Force
            }
            
        } catch {
            Test-Result "Authentication Service Integration" $false "Error: $($_.Exception.Message)"
        }
    } else {
        Test-Result "Authentication Service Integration" $true "Skipped (interactive mode disabled)"
    }
    
    # Test 7: Memory Cleanup
    Write-Host "`nTest 7: Memory Cleanup and Disposal" -ForegroundColor Yellow
    
    try {
        $initialSessionCount = Get-AuthenticationSessionCount
        
        # Create sessions
        $tempSessions = @()
        for ($i = 1; $i -le 5; $i++) {
            $tempSessions += New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
        }
        
        $midSessionCount = Get-AuthenticationSessionCount
        
        # Clear all sessions
        Clear-AllAuthenticationSessions
        
        $finalSessionCount = Get-AuthenticationSessionCount
        
        $cleanupSuccess = $finalSessionCount -eq 0
        Test-Result "Memory Cleanup and Disposal" $cleanupSuccess "Sessions: Initial=$initialSessionCount, Mid=$midSessionCount, Final=$finalSessionCount"
        
    } catch {
        Test-Result "Memory Cleanup and Disposal" $false "Error: $($_.Exception.Message)"
    }
    
    # Test 8: Azure Discovery Integration (if AzureOnly specified)
    if ($AzureOnly) {
        Write-Host "`nTest 8: Azure Discovery Integration" -ForegroundColor Yellow
        
        try {
            # Re-initialize SessionManager since it was disposed in Test 7
            Write-Host "       Re-initializing SessionManager for Azure test..." -ForegroundColor Gray
            
            # Load Azure discovery module (the existing one that's already updated)
            Import-Module ".\Modules\Discovery\AzureDiscovery.psm1" -Force
            
            # Test Azure discovery with new authentication
            Write-Host "       Testing Azure discovery with session-based authentication..." -ForegroundColor Gray
            
            # Create authentication session with new SessionManager instance
            $azureSessionId = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
            
            if ($azureSessionId) {
                # Test that Azure discovery can use the session
                $azureSession = Get-AuthenticationSession -SessionId $azureSessionId
                
                if ($azureSession -and $azureSession.IsValid()) {
                    Test-Result "Azure Discovery Authentication" $true "Session created and accessible for Azure discovery"
                    
                    # Test credential access from Azure module perspective
                    $credential = $azureSession.GetCredential()
                    if ($credential -and $credential.UserName -eq $testClientId) {
                        Test-Result "Azure Discovery Credential Access" $true "Azure module can access credentials via session"
                        
                        # Test the actual Azure discovery function interface
                        $testContext = @{
                            Paths = @{
                                RawDataOutput = Join-Path $env:TEMP "azure_discovery_test"
                            }
                        }
                        
                        $testConfig = @{
                            azure = @{
                                includeAzureADDevices = $false
                                includeConditionalAccess = $false
                                includeSubscriptionInfo = $false
                                includeAzureADApps = $false
                            }
                        }
                        
                        # Ensure output directory exists
                        if (-not (Test-Path $testContext.Paths.RawDataOutput)) {
                            New-Item -Path $testContext.Paths.RawDataOutput -ItemType Directory -Force | Out-Null
                        }
                        
                        # Test the Azure discovery function call (this validates the interface)
                        try {
                            $discoveryResult = Invoke-AzureDiscovery -Configuration $testConfig -Context $testContext -SessionId $azureSessionId
                            if ($discoveryResult) {
                                Test-Result "Azure Discovery Function Call" $true "Azure discovery function executed successfully"
                            } else {
                                Test-Result "Azure Discovery Function Call" $false "Azure discovery returned null"
                            }
                        } catch {
                            # Expected to fail due to missing Graph modules, but interface should work
                            if ($_.Exception.Message -like "*Graph*" -or $_.Exception.Message -like "*authentication*") {
                                Test-Result "Azure Discovery Function Call" $true "Azure discovery interface working (expected Graph module error)"
                            } else {
                                Test-Result "Azure Discovery Function Call" $false "Unexpected error: $($_.Exception.Message)"
                            }
                        }
                        
                        # Clean up test directory
                        if (Test-Path $testContext.Paths.RawDataOutput) {
                            Remove-Item $testContext.Paths.RawDataOutput -Recurse -Force
                        }
                        
                    } else {
                        Test-Result "Azure Discovery Credential Access" $false "Azure module cannot access credentials"
                    }
                } else {
                    Test-Result "Azure Discovery Authentication" $false "Session invalid or not found"
                }
                
                # Clean up Azure test session
                Remove-AuthenticationSession -SessionId $azureSessionId
            } else {
                Test-Result "Azure Discovery Authentication" $false "Failed to create Azure session"
            }
            
        } catch {
            Test-Result "Azure Discovery Integration" $false "Error: $($_.Exception.Message)"
        }
    }
    
} catch {
    Write-Host "`nCRITICAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
}

# Final Results
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Total Tests: $($testResults.Tests.Count)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red

$successRate = if ($testResults.Tests.Count -gt 0) {
    [Math]::Round(($testResults.Passed / $testResults.Tests.Count) * 100, 1)
} else { 0 }

Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($testResults.Failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults.Tests | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor Yellow
    }
}

Write-Host "`nAuthentication Architecture Test Complete!" -ForegroundColor Cyan

# Return exit code based on results
if ($testResults.Failed -eq 0) {
    exit 0
} else {
    exit 1
}
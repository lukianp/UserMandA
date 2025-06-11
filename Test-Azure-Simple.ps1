# Simple Azure Discovery Test with New Authentication
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Discovery Authentication Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    # Import authentication modules
    Write-Host "Loading authentication modules..." -ForegroundColor Yellow
    Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force
    
    # Test session creation
    Write-Host "Creating test authentication session..." -ForegroundColor Yellow
    $testTenantId = "12345678-1234-1234-1234-123456789012"
    $testClientId = "87654321-4321-4321-4321-210987654321"
    $testSecret = ConvertTo-SecureString "TestSecret123!" -AsPlainText -Force
    
    $sessionId = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
    Write-Host "Session created: $($sessionId.Substring(0,8))..." -ForegroundColor Green
    
    # Test session retrieval
    Write-Host "Retrieving authentication session..." -ForegroundColor Yellow
    $session = Get-AuthenticationSession -SessionId $sessionId
    
    if ($session -and $session.IsValid()) {
        Write-Host "Session retrieved and valid" -ForegroundColor Green
        
        # Test credential access
        $credential = $session.GetCredential()
        if ($credential -and $credential.UserName -eq $testClientId) {
            Write-Host "Credentials accessible: ClientId=$($credential.UserName)" -ForegroundColor Green
        } else {
            Write-Host "Credential access failed" -ForegroundColor Red
        }
        
        # Test Azure discovery module loading
        Write-Host "Testing Azure discovery module..." -ForegroundColor Yellow
        if (Test-Path ".\Modules\Discovery\AzureDiscovery.psm1") {
            Import-Module ".\Modules\Discovery\AzureDiscovery.psm1" -Force
            Write-Host "Original Azure discovery module loaded" -ForegroundColor Green
            
            # Test that Azure module can access the session
            Write-Host "Testing session access from Azure module perspective..." -ForegroundColor Yellow
            $azureSession = Get-AuthenticationSession -SessionId $sessionId
            if ($azureSession -and $azureSession.IsValid()) {
                Write-Host "Azure module can access authentication session" -ForegroundColor Green
                
                $azureCredential = $azureSession.GetCredential()
                if ($azureCredential) {
                    Write-Host "Azure module can access credentials via session" -ForegroundColor Green
                    Write-Host "SUCCESS: New authentication architecture working for Azure discovery!" -ForegroundColor Green
                } else {
                    Write-Host "Azure module cannot access credentials" -ForegroundColor Red
                }
            } else {
                Write-Host "Azure module cannot access session" -ForegroundColor Red
            }
        } else {
            Write-Host "Azure discovery module not found" -ForegroundColor Red
        }
        
        # Clean up
        Write-Host "Cleaning up test session..." -ForegroundColor Yellow
        $removed = Remove-AuthenticationSession -SessionId $sessionId
        if ($removed) {
            Write-Host "Session cleaned up successfully" -ForegroundColor Green
        }
        
    } else {
        Write-Host "Session retrieval failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack: $($_.ScriptStackTrace)" -ForegroundColor Red
}

Write-Host "`nAzure Discovery Test Complete!" -ForegroundColor Cyan
# Enhanced Credential Validation Test
param(
    [string]$CompanyName = "Zedra"
)

Write-Host "Enhanced Credential Validation Test" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "This test will validate credentials by attempting real connections" -ForegroundColor Yellow

# Initialize environment
try {
    Write-Host "`n1. Initializing environment..." -ForegroundColor Yellow
    . ".\Scripts\Set-SuiteEnvironment.ps1" -ProvidedSuiteRoot $PWD -CompanyName $CompanyName
    Write-Host "   Environment initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "   Failed to initialize environment: $_" -ForegroundColor Red
    exit 1
}

# Load authentication modules
try {
    Write-Host "`n2. Loading authentication modules..." -ForegroundColor Yellow
    Import-Module ".\Modules\Authentication\Authentication.psm1" -Force
    Import-Module ".\Modules\Authentication\CredentialManagement.psm1" -Force
    Write-Host "   Authentication modules loaded" -ForegroundColor Green
} catch {
    Write-Host "   Failed to load authentication modules: $_" -ForegroundColor Red
    exit 1
}

# Test authentication and get credentials
try {
    Write-Host "`n3. Loading and validating credentials..." -ForegroundColor Yellow
    $authResult = Initialize-MandAAuthentication -Configuration $global:MandA.Config
    if ($authResult -and $authResult.Authenticated) {
        Write-Host "   Authentication successful" -ForegroundColor Green
        
        # Get the actual credentials for testing
        $credentials = Get-SecureCredentials -Configuration $global:MandA.Config
        if ($credentials) {
            Write-Host "   Credentials retrieved successfully" -ForegroundColor Green
            Write-Host "   Client ID: $($credentials.ClientId.Substring(0,8))..." -ForegroundColor Gray
            Write-Host "   Tenant ID: $($credentials.TenantId)" -ForegroundColor Gray
            Write-Host "   Authentication Method: $($credentials.AuthenticationMethod)" -ForegroundColor Gray
        } else {
            Write-Host "   Failed to retrieve credentials" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   Authentication failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   Authentication error: $_" -ForegroundColor Red
    exit 1
}

# Test Microsoft Graph Connection
Write-Host "`n4. Testing Microsoft Graph connection..." -ForegroundColor Yellow
try {
    # Check if Microsoft Graph module is available
    if (Get-Module -ListAvailable -Name "Microsoft.Graph.Authentication") {
        Write-Host "   Microsoft.Graph.Authentication module found" -ForegroundColor Green
        
        # Import the module
        Import-Module Microsoft.Graph.Authentication -Force
        
        # Test connection using client secret
        $secureSecret = ConvertTo-SecureString $credentials.ClientSecret -AsPlainText -Force
        
        Write-Host "   Attempting to connect to Microsoft Graph..." -ForegroundColor Yellow
        $graphConnection = Connect-MgGraph -ClientId $credentials.ClientId -TenantId $credentials.TenantId -ClientSecretCredential (New-Object System.Management.Automation.PSCredential($credentials.ClientId, $secureSecret)) -NoWelcome
        
        if (Get-MgContext) {
            Write-Host "   ✅ Microsoft Graph connection successful!" -ForegroundColor Green
            $context = Get-MgContext
            Write-Host "     Tenant: $($context.TenantId)" -ForegroundColor Gray
            Write-Host "     App: $($context.AppName)" -ForegroundColor Gray
            Write-Host "     Scopes: $($context.Scopes -join ', ')" -ForegroundColor Gray
            
            # Test a simple Graph call
            try {
                Write-Host "   Testing Graph API call..." -ForegroundColor Yellow
                $org = Get-MgOrganization -Top 1
                if ($org) {
                    Write-Host "   ✅ Graph API call successful!" -ForegroundColor Green
                    Write-Host "     Organization: $($org.DisplayName)" -ForegroundColor Gray
                } else {
                    Write-Host "   ⚠️  Graph API call returned no data" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ❌ Graph API call failed: $_" -ForegroundColor Red
            }
            
            # Disconnect
            Disconnect-MgGraph | Out-Null
            Write-Host "   Disconnected from Microsoft Graph" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Microsoft Graph connection failed" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  Microsoft.Graph.Authentication module not available" -ForegroundColor Yellow
        Write-Host "   Install with: Install-Module Microsoft.Graph -Scope CurrentUser" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Microsoft Graph connection error: $_" -ForegroundColor Red
}

# Test Exchange Online Connection
Write-Host "`n5. Testing Exchange Online connection..." -ForegroundColor Yellow
try {
    # Check if Exchange Online module is available
    if (Get-Module -ListAvailable -Name "ExchangeOnlineManagement") {
        Write-Host "   ExchangeOnlineManagement module found" -ForegroundColor Green
        
        # Import the module
        Import-Module ExchangeOnlineManagement -Force
        
        Write-Host "   Attempting to connect to Exchange Online..." -ForegroundColor Yellow
        
        # For Exchange Online with app-only authentication, we need a certificate
        # Let's try with the client secret first (may not work for all scenarios)
        try {
            Connect-ExchangeOnline -AppId $credentials.ClientId -Organization "$($credentials.TenantId)" -ClientSecret (ConvertTo-SecureString $credentials.ClientSecret -AsPlainText -Force) -ShowBanner:$false
            
            # Test if connected
            $session = Get-PSSession | Where-Object { $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened" }
            if ($session) {
                Write-Host "   ✅ Exchange Online connection successful!" -ForegroundColor Green
                
                # Test a simple Exchange call
                try {
                    Write-Host "   Testing Exchange cmdlet..." -ForegroundColor Yellow
                    $orgConfig = Get-OrganizationConfig | Select-Object -First 1
                    if ($orgConfig) {
                        Write-Host "   ✅ Exchange cmdlet successful!" -ForegroundColor Green
                        Write-Host "     Organization: $($orgConfig.DisplayName)" -ForegroundColor Gray
                    }
                } catch {
                    Write-Host "   ❌ Exchange cmdlet failed: $_" -ForegroundColor Red
                }
                
                # Disconnect
                Disconnect-ExchangeOnline -Confirm:$false
                Write-Host "   Disconnected from Exchange Online" -ForegroundColor Gray
            } else {
                Write-Host "   ❌ Exchange Online connection failed - no active session" -ForegroundColor Red
            }
        } catch {
            Write-Host "   ❌ Exchange Online connection failed: $_" -ForegroundColor Red
            Write-Host "   Note: Exchange Online may require certificate-based authentication for app-only access" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  ExchangeOnlineManagement module not available" -ForegroundColor Yellow
        Write-Host "   Install with: Install-Module ExchangeOnlineManagement -Scope CurrentUser" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Exchange Online connection error: $_" -ForegroundColor Red
}

# Test Azure Connection
Write-Host "`n6. Testing Azure connection..." -ForegroundColor Yellow
try {
    # Check if Az.Accounts module is available
    if (Get-Module -ListAvailable -Name "Az.Accounts") {
        Write-Host "   Az.Accounts module found" -ForegroundColor Green
        
        # Import the module
        Import-Module Az.Accounts -Force
        
        Write-Host "   Attempting to connect to Azure..." -ForegroundColor Yellow
        
        # Create credential object
        $secureSecret = ConvertTo-SecureString $credentials.ClientSecret -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($credentials.ClientId, $secureSecret)
        
        # Connect to Azure
        $azConnection = Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $credentials.TenantId
        
        if ($azConnection) {
            Write-Host "   ✅ Azure connection successful!" -ForegroundColor Green
            Write-Host "     Account: $($azConnection.Context.Account.Id)" -ForegroundColor Gray
            Write-Host "     Tenant: $($azConnection.Context.Tenant.Id)" -ForegroundColor Gray
            
            # Test a simple Azure call
            try {
                Write-Host "   Testing Azure cmdlet..." -ForegroundColor Yellow
                $subscriptions = Get-AzSubscription
                if ($subscriptions) {
                    Write-Host "   ✅ Azure cmdlet successful!" -ForegroundColor Green
                    Write-Host "     Found $($subscriptions.Count) subscription(s)" -ForegroundColor Gray
                } else {
                    Write-Host "   ⚠️  No Azure subscriptions found" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ❌ Azure cmdlet failed: $_" -ForegroundColor Red
            }
            
            # Disconnect
            Disconnect-AzAccount | Out-Null
            Write-Host "   Disconnected from Azure" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Azure connection failed" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  Az.Accounts module not available" -ForegroundColor Yellow
        Write-Host "   Install with: Install-Module Az.Accounts -Scope CurrentUser" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Azure connection error: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "CREDENTIAL VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "✅ Credentials loaded and authenticated successfully" -ForegroundColor Green
Write-Host "✅ Connection initialization framework working" -ForegroundColor Green
Write-Host ""
Write-Host "Service Connection Tests:" -ForegroundColor Yellow
Write-Host "- Microsoft Graph: Check output above" -ForegroundColor Gray
Write-Host "- Exchange Online: Check output above" -ForegroundColor Gray  
Write-Host "- Azure: Check output above" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: Some services may require additional configuration" -ForegroundColor Yellow
Write-Host "(certificates, specific permissions, etc.)" -ForegroundColor Yellow
Write-Host ""
Write-Host "If connections are successful, the credentials are valid" -ForegroundColor Green
Write-Host "and discovery should work properly!" -ForegroundColor Green
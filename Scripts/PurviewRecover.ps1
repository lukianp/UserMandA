#Requires -Version 5.1
<#
.SYNOPSIS
    Recovers emails from Microsoft Purview using CSV file with message IDs and sender addresses
.DESCRIPTION
    This script imports a CSV file containing bluebayaddress and messageid columns,
    searches for these emails in Microsoft Purview, and exports them with rate limiting
.PARAMETER CsvPath
    Path to CSV file (default: C:\scripts\email_list.csv)
.EXAMPLE
    .\Recover-PurviewEmails.ps1
#>

[CmdletBinding()]
param(
    [Parameter()]
    [string]$CsvPath = "C:\scripts\email_list.csv"
)

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Ensure TLS 1.2 is enabled for secure connections
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Global variables for rate limiting
$script:ApiCallCount = 0
$script:ApiCallStartTime = Get-Date
$script:MaxApiCallsPerHour = 100  # Adjust based on your tenant limits
$script:MaxApiCallsPerMinute = 10

# Initialize script variables
$script:LogFilePath = $null

# Function to handle API rate limiting
function Invoke-RateLimitedAction {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [scriptblock]$Action,
        
        [Parameter()]
        [string]$ActionDescription = "API call"
    )
    
    # Check minute rate limit
    $currentTime = Get-Date
    $timeSinceStart = $currentTime - $script:ApiCallStartTime
    
    if ($timeSinceStart.TotalMinutes -lt 1) {
        if ($script:ApiCallCount -ge $script:MaxApiCallsPerMinute) {
            $waitTime = 60 - $timeSinceStart.TotalSeconds
            Write-Host "Rate limit reached. Waiting $([Math]::Round($waitTime)) seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds $waitTime
            $script:ApiCallCount = 0
            $script:ApiCallStartTime = Get-Date
        }
    } else {
        $script:ApiCallCount = 0
        $script:ApiCallStartTime = Get-Date
    }
    
    # Execute the action
    try {
        Write-Verbose "Executing: $ActionDescription"
        $result = & $Action
        $script:ApiCallCount++
        return $result
    }
    catch {
        Write-Error "Failed to execute $ActionDescription : $_"
        throw
    }
}

# Function to write log entries
function Write-LogEntry {
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [Parameter()]
        [ValidateSet('Info', 'Warning', 'Error', 'Success')]
        [string]$Level = 'Info'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp [$Level] $Message"
    
    # Write to console with color
    switch ($Level) {
        'Info'    { Write-Host $logEntry -ForegroundColor White }
        'Warning' { Write-Host $logEntry -ForegroundColor Yellow }
        'Error'   { Write-Host $logEntry -ForegroundColor Red }
        'Success' { Write-Host $logEntry -ForegroundColor Green }
    }
    
    # Write to log file if path is defined
    if ($script:LogFilePath) {
        $logEntry | Out-File -FilePath $script:LogFilePath -Append -Encoding UTF8
    }
}

# Function to test module availability and install if needed
function Ensure-RequiredModules {
    $requiredModules = @('ExchangeOnlineManagement')
    
    foreach ($module in $requiredModules) {
        $installedModule = Get-Module -ListAvailable -Name $module | Sort-Object Version -Descending | Select-Object -First 1
        
        if (!$installedModule) {
            Write-Host "Module '$module' not found. Installing..." -ForegroundColor Yellow
            try {
                Install-Module -Name $module -Force -AllowClobber -Scope CurrentUser
                Write-Host "Module '$module' installed successfully." -ForegroundColor Green
            }
            catch {
                Write-Error "Failed to install module '$module'. Please install manually."
                exit 1
            }
        } else {
            # Check if module is reasonably current (version 3.0 or higher for ExchangeOnlineManagement)
            if ($module -eq 'ExchangeOnlineManagement' -and $installedModule.Version.Major -lt 3) {
                Write-Host "Module '$module' version $($installedModule.Version) is outdated. Updating..." -ForegroundColor Yellow
                try {
                    Update-Module -Name $module -Force
                    Write-Host "Module '$module' updated successfully." -ForegroundColor Green
                }
                catch {
                    Write-Host "Could not update module automatically. Current version may work but consider updating manually." -ForegroundColor Yellow
                }
            }
        }
        Import-Module $module -Force
    }
}

# Function to get interactive input
function Get-InteractiveSetup {
    Write-Host "`n=== Purview Email Recovery Setup ===" -ForegroundColor Cyan
    
    # Get authentication method
    Write-Host "`nSelect authentication method:" -ForegroundColor Yellow
    Write-Host "1. Standard authentication (username/password)"
    Write-Host "2. Multi-Factor Authentication (MFA)"
    
    do {
        $authChoice = Read-Host "Enter your choice (1-2)"
    } while ($authChoice -notmatch '^[1-2]$')
    
    if ($authChoice -eq '1') {
        # Get admin credentials
        Write-Host "`nPlease enter your admin credentials for Microsoft 365:" -ForegroundColor Yellow
        $script:AdminCredential = Get-Credential -Message "Enter admin username (e.g., admin@yourdomain.com)"
        $script:UseMFA = $false
    } else {
        # Get username only for MFA
        $adminUser = Read-Host "`nEnter your admin username (e.g., admin@yourdomain.com)"
        $script:AdminCredential = New-Object System.Management.Automation.PSCredential($adminUser, (ConvertTo-SecureString "dummy" -AsPlainText -Force))
        $script:UseMFA = $true
    }
    
    # Get export format preference
    Write-Host "`nSelect export format:" -ForegroundColor Yellow
    Write-Host "1. PST file (single file for all emails)"
    Write-Host "2. Individual MSG files"
    Write-Host "3. Individual EML files"
    
    do {
        $formatChoice = Read-Host "Enter your choice (1-3)"
    } while ($formatChoice -notmatch '^[1-3]$')
    
    switch ($formatChoice) {
        '1' { $script:ExportFormat = 'PST' }
        '2' { $script:ExportFormat = 'MSG' }
        '3' { $script:ExportFormat = 'EML' }
    }
    
    # Get export path
    $defaultExportPath = "C:\scripts\RecoveredEmails"
    $exportPath = Read-Host "Enter export path (default: $defaultExportPath)"
    if ([string]::IsNullOrWhiteSpace($exportPath)) {
        $exportPath = $defaultExportPath
    }
    $script:ExportPath = $exportPath
    
    # Get search scope
    Write-Host "`nSelect search scope:" -ForegroundColor Yellow
    Write-Host "1. All mailboxes"
    Write-Host "2. Specific mailboxes (you'll provide a list)"
    
    do {
        $scopeChoice = Read-Host "Enter your choice (1-2)"
    } while ($scopeChoice -notmatch '^[1-2]$')
    
    if ($scopeChoice -eq '2') {
        $mailboxList = Read-Host "Enter mailbox addresses separated by commas"
        $script:SearchScope = $mailboxList -split ',' | ForEach-Object { $_.Trim() }
    } else {
        $script:SearchScope = 'All'
    }
    
    # Confirm settings
    Write-Host "`n=== Configuration Summary ===" -ForegroundColor Cyan
    Write-Host "Admin User: $($script:AdminCredential.UserName)"
    Write-Host "Authentication: $(if ($script:UseMFA) { 'Multi-Factor Authentication' } else { 'Standard' })"
    Write-Host "Export Format: $script:ExportFormat"
    Write-Host "Export Path: $script:ExportPath"
    Write-Host "Search Scope: $(if ($script:SearchScope -eq 'All') { 'All mailboxes' } else { $script:SearchScope -join ', ' })"
    
    $confirm = Read-Host "`nProceed with these settings? (Y/N)"
    if ($confirm -ne 'Y') {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit 0
    }
}

# Function to connect to Security & Compliance Center
function Connect-ComplianceCenter {
    try {
        Write-LogEntry "Connecting to Security & Compliance Center..." -Level Info
        
        if ($script:UseMFA) {
            Write-LogEntry "Using Multi-Factor Authentication..." -Level Info
            Write-Host "A browser window will open for authentication. Please complete the MFA process." -ForegroundColor Yellow
            
            # For MFA, use interactive login
            Invoke-RateLimitedAction -Action {
                Connect-IPPSSession -UserPrincipalName $script:AdminCredential.UserName -WarningAction SilentlyContinue
            } -ActionDescription "Connect to Compliance Center with MFA"
        } else {
            # Standard credential-based authentication
            Invoke-RateLimitedAction -Action {
                Connect-IPPSSession -Credential $script:AdminCredential -WarningAction SilentlyContinue
            } -ActionDescription "Connect to Compliance Center"
        }
        
        Write-LogEntry "Successfully connected to Security & Compliance Center" -Level Success
        return $true
    }
    catch {
        Write-LogEntry "Failed to connect to Security & Compliance Center: $_" -Level Error
        
        # Provide troubleshooting tips
        Write-Host "`nTroubleshooting tips:" -ForegroundColor Yellow
        Write-Host "1. Ensure you have the correct admin permissions (eDiscovery Manager or higher)"
        Write-Host "2. If using MFA, ensure you completed the authentication in the browser window"
        Write-Host "3. Check your internet connectivity and firewall settings"
        Write-Host "4. Verify your account isn't blocked or restricted"
        Write-Host "5. Try running PowerShell as Administrator"
        Write-Host "6. For GCC High or DoD tenants, use Connect-IPPSSession with -ConnectionUri parameter"
        
        return $false
    }
}

# Function to create and run compliance search
function Search-EmailByMessageId {
    param(
        [Parameter(Mandatory)]
        [string]$MessageId,
        
        [Parameter()]
        [string]$SenderAddress,
        
        [Parameter(Mandatory)]
        [string]$SearchName
    )
    
    # Build search query - handle message IDs with angle brackets
    # Remove angle brackets if present and ensure proper formatting
    $cleanMessageId = $MessageId.Trim('<', '>', ' ')
    
    # Build query with proper syntax for message ID
    $searchQuery = "messageid:`"$cleanMessageId`""
    
    if (![string]::IsNullOrWhiteSpace($SenderAddress)) {
        # Clean sender address too
        $cleanSenderAddress = $SenderAddress.Trim()
        $searchQuery += " AND from:`"$cleanSenderAddress`""
    }
    
    Write-LogEntry "Creating search: $SearchName" -Level Info
    Write-LogEntry "Search query: $searchQuery" -Level Info
    
    try {
        # Create compliance search
        Invoke-RateLimitedAction -Action {
            if ($script:SearchScope -eq 'All') {
                New-ComplianceSearch -Name $SearchName -ExchangeLocation All -SearchQuery $searchQuery -ErrorAction Stop
            } else {
                New-ComplianceSearch -Name $SearchName -ExchangeLocation $script:SearchScope -SearchQuery $searchQuery -ErrorAction Stop
            }
        } -ActionDescription "Create compliance search"
        
        # Start the search
        Invoke-RateLimitedAction -Action {
            Start-ComplianceSearch -Identity $SearchName -ErrorAction Stop
        } -ActionDescription "Start compliance search"
        
        # Wait for search to complete
        $searchComplete = $false
        $attemptCount = 0
        $maxAttempts = 60  # 5 minutes max wait
        
        while (!$searchComplete -and $attemptCount -lt $maxAttempts) {
            Start-Sleep -Seconds 5
            $attemptCount++
            
            $searchStatus = Invoke-RateLimitedAction -Action {
                Get-ComplianceSearch -Identity $SearchName -ErrorAction Stop
            } -ActionDescription "Check search status"
            
            if ($searchStatus.Status -eq "Completed") {
                $searchComplete = $true
            } elseif ($searchStatus.Status -eq "Failed") {
                throw "Search failed: $($searchStatus.ErrorMessage)"
            }
            
            if ($attemptCount % 6 -eq 0) {  # Update every 30 seconds
                Write-LogEntry "Search still running... ($($attemptCount * 5) seconds elapsed)" -Level Info
            }
        }
        
        if (!$searchComplete) {
            throw "Search timed out after 5 minutes"
        }
        
        Write-LogEntry "Search completed. Items found: $($searchStatus.Items)" -Level Success
        return $searchStatus
    }
    catch {
        Write-LogEntry "Search failed: $_" -Level Error
        return $null
    }
}

# Function to export search results
function Export-SearchResults {
    param(
        [Parameter(Mandatory)]
        [string]$SearchName,
        
        [Parameter(Mandatory)]
        [string]$MessageId
    )
    
    try {
        Write-LogEntry "Starting export for search: $SearchName" -Level Info
        
        # Create export action based on format
        if ($script:ExportFormat -eq 'PST') {
            # For PST export, we'll use the compliance export action
            $exportName = "${SearchName}_Export"
            
            Invoke-RateLimitedAction -Action {
                New-ComplianceSearchAction -SearchName $SearchName -Export `
                    -Format FxStream -ErrorAction Stop
            } -ActionDescription "Create PST export action"
            
            # Note: PST download requires additional steps through the UI
            Write-LogEntry "PST export initiated. Use the Security & Compliance Center UI to download." -Level Warning
            
        } else {
            # For individual files, we need to use a different approach
            # Get the search results
            $searchResults = Invoke-RateLimitedAction -Action {
                Get-ComplianceSearch -Identity $SearchName -ErrorAction Stop
            } -ActionDescription "Get search results"
            
            if ($searchResults.Items -gt 0) {
                # Create export directory for this message
                # Clean message ID for use in folder name
                $cleanedMessageId = $MessageId.Replace('<', '').Replace('>', '').Replace('@', '_at_').Replace('.', '_')
                $messageExportPath = Join-Path $script:ExportPath $cleanedMessageId
                if (!(Test-Path $messageExportPath)) {
                    New-Item -ItemType Directory -Path $messageExportPath -Force | Out-Null
                }
                
                # Export action for individual files
                $exportName = "${SearchName}_Export"
                
                Invoke-RateLimitedAction -Action {
                    New-ComplianceSearchAction -SearchName $SearchName -Export `
                        -Format $script:ExportFormat -ErrorAction Stop
                } -ActionDescription "Create file export action"
                
                Write-LogEntry "Export action created. Files will be available for download." -Level Success
            }
        }
        
        return $true
    }
    catch {
        Write-LogEntry "Export failed: $_" -Level Error
        return $false
    }
}

# Main script execution
function Main {
    # Check if CSV exists first (before any logging)
    if (!(Test-Path $CsvPath)) {
        Write-Host "CSV file not found: $CsvPath" -ForegroundColor Red
        exit 1
    }
    
    # Ensure required modules
    Ensure-RequiredModules
    
    # Get interactive setup (this sets $script:ExportPath)
    Get-InteractiveSetup
    
    # Now create export directory after setup
    if (!(Test-Path $script:ExportPath)) {
        New-Item -ItemType Directory -Path $script:ExportPath -Force | Out-Null
    }
    
    # Set up logging after export path is defined
    $script:LogFilePath = Join-Path $script:ExportPath "EmailRecovery_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    Write-LogEntry "Starting Purview Email Recovery Script" -Level Info
    
    # Connect to compliance center
    if (!(Connect-ComplianceCenter)) {
        exit 1
    }
    
    # Import CSV
    try {
        $emails = Import-Csv -Path $CsvPath -ErrorAction Stop
        Write-LogEntry "Imported $($emails.Count) emails from CSV" -Level Info
        
        # Validate CSV has data
        if ($emails.Count -eq 0) {
            throw "CSV file is empty"
        }
        
        # Validate CSV headers - check exact case
        $headers = $emails[0].PSObject.Properties.Name
        $hasMessageId = "MessageId" -in $headers
        $hasBluebayAddress = "BluebayAddress" -in $headers
        
        if (!$hasMessageId) {
            throw "CSV must contain 'MessageId' column (case-sensitive)"
        }
        
        if (!$hasBluebayAddress) {
            Write-LogEntry "Warning: CSV does not contain 'BluebayAddress' column. Searches will use message ID only." -Level Warning
        }
    }
    catch {
        Write-LogEntry "Failed to import CSV: $_" -Level Error
        exit 1
    }
    
    # Process results tracking
    $results = @{
        Total = $emails.Count
        Found = 0
        NotFound = 0
        Exported = 0
        Failed = 0
    }
    
    # Process each email
    $emailCount = 0
    foreach ($email in $emails) {
        $emailCount++
        Write-Host "`n[$emailCount/$($emails.Count)] Processing email..." -ForegroundColor Cyan
        
        $searchName = "Recovery_$(Get-Date -Format 'yyyyMMddHHmmss')_$($emailCount)"
        
        # Access CSV columns - Import-Csv preserves column names as-is
        $messageId = if ($email.MessageId) { $email.MessageId.Trim() } else { "" }
        $senderAddress = if ($email.BluebayAddress) { $email.BluebayAddress.Trim() } else { "" }
        
        # Clean message ID for display
        $displayMessageId = $messageId.Trim('<', '>')
        
        Write-LogEntry "Processing: MessageID=$displayMessageId, Sender=$senderAddress" -Level Info
        
        # Validate email data
        if ([string]::IsNullOrWhiteSpace($messageId)) {
            Write-LogEntry "Skipping row $emailCount - empty message ID" -Level Warning
            $results.Failed++
            continue
        }
        
        # Search for the email
        $searchResult = Search-EmailByMessageId -MessageId $messageId -SenderAddress $senderAddress -SearchName $searchName
        
        if ($searchResult -and $searchResult.Items -gt 0) {
            $results.Found++
            
            # Export the results
            if (Export-SearchResults -SearchName $searchName -MessageId $messageId) {
                $results.Exported++
            } else {
                $results.Failed++
            }
        } else {
            $results.NotFound++
            Write-LogEntry "No items found for MessageID: $messageId" -Level Warning
        }
        
        # Clean up search (optional - you might want to keep for auditing)
        try {
            Start-Sleep -Seconds 2  # Brief pause before cleanup
            Invoke-RateLimitedAction -Action {
                Remove-ComplianceSearch -Identity $searchName -Confirm:$false -ErrorAction SilentlyContinue
            } -ActionDescription "Remove compliance search"
        }
        catch {
            # Non-critical error, just log it
            Write-Verbose "Could not remove search $searchName"
        }
    }
    
    # Display summary
    Write-Host "`n=== Recovery Summary ===" -ForegroundColor Cyan
    Write-Host "Total emails processed: $($results.Total)"
    Write-Host "Emails found: $($results.Found)" -ForegroundColor Green
    Write-Host "Emails not found: $($results.NotFound)" -ForegroundColor Yellow
    Write-Host "Emails exported: $($results.Exported)" -ForegroundColor Green
    Write-Host "Export failures: $($results.Failed)" -ForegroundColor Red
    
    if ($script:LogFilePath) {
        Write-LogEntry "Script completed. Check log file: $script:LogFilePath" -Level Success
    } else {
        Write-LogEntry "Script completed." -Level Success
    }
    
    # Note about PST exports
    if ($script:ExportFormat -eq 'PST') {
        Write-Host "`nIMPORTANT: PST exports must be downloaded through the Security & Compliance Center UI." -ForegroundColor Yellow
        Write-Host "Go to: https://compliance.microsoft.com > Content search > Export tab" -ForegroundColor Yellow
    }
}

# Script entry point
try {
    Main
}
catch {
    # Check if logging is set up before trying to use it
    if ($script:LogFilePath) {
        Write-LogEntry "Unhandled error: $_" -Level Error
    } else {
        Write-Host "Unhandled error: $_" -ForegroundColor Red
    }
    exit 1
}
finally {
    # Disconnect from compliance center
    if (Get-PSSession | Where-Object { $_.ConfigurationName -eq "Microsoft.Exchange" }) {
        Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
    }
}
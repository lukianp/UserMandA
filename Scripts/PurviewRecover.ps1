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

# Global variables for rate limiting
$script:ApiCallCount = 0
$script:ApiCallStartTime = Get-Date
$script:MaxApiCallsPerHour = 100  # Adjust based on your tenant limits
$script:MaxApiCallsPerMinute = 10

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
    
    # Write to log file
    $logEntry | Out-File -FilePath $script:LogFilePath -Append -Encoding UTF8
}

# Function to test module availability and install if needed
function Ensure-RequiredModules {
    $requiredModules = @('ExchangeOnlineManagement')
    
    foreach ($module in $requiredModules) {
        if (!(Get-Module -ListAvailable -Name $module)) {
            Write-Host "Module '$module' not found. Installing..." -ForegroundColor Yellow
            try {
                Install-Module -Name $module -Force -AllowClobber -Scope CurrentUser
                Write-Host "Module '$module' installed successfully." -ForegroundColor Green
            }
            catch {
                Write-Error "Failed to install module '$module'. Please install manually."
                exit 1
            }
        }
        Import-Module $module -Force
    }
}

# Function to get interactive input
function Get-InteractiveSetup {
    Write-Host "`n=== Purview Email Recovery Setup ===" -ForegroundColor Cyan
    
    # Get admin credentials
    Write-Host "`nPlease enter your admin credentials for Microsoft 365:" -ForegroundColor Yellow
    $script:AdminCredential = Get-Credential -Message "Enter admin username (e.g., admin@yourdomain.com)"
    
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
        
        Invoke-RateLimitedAction -Action {
            Connect-IPPSSession -Credential $script:AdminCredential -WarningAction SilentlyContinue
        } -ActionDescription "Connect to Compliance Center"
        
        Write-LogEntry "Successfully connected to Security & Compliance Center" -Level Success
        return $true
    }
    catch {
        Write-LogEntry "Failed to connect to Security & Compliance Center: $_" -Level Error
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
    
    # Build search query
    $searchQuery = "messageid:`"$MessageId`""
    if (![string]::IsNullOrWhiteSpace($SenderAddress)) {
        $searchQuery += " AND from:`"$SenderAddress`""
    }
    
    Write-LogEntry "Creating search: $SearchName with query: $searchQuery" -Level Info
    
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
                $messageExportPath = Join-Path $script:ExportPath $MessageId.Replace('<', '').Replace('>', '')
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
    # Create export directory
    if (!(Test-Path $script:ExportPath)) {
        New-Item -ItemType Directory -Path $script:ExportPath -Force | Out-Null
    }
    
    # Set up logging
    $script:LogFilePath = Join-Path $script:ExportPath "EmailRecovery_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    Write-LogEntry "Starting Purview Email Recovery Script" -Level Info
    
    # Check if CSV exists
    if (!(Test-Path $CsvPath)) {
        Write-LogEntry "CSV file not found: $CsvPath" -Level Error
        exit 1
    }
    
    # Ensure required modules
    Ensure-RequiredModules
    
    # Get interactive setup
    Get-InteractiveSetup
    
    # Connect to compliance center
    if (!(Connect-ComplianceCenter)) {
        exit 1
    }
    
    # Import CSV
    try {
        $emails = Import-Csv -Path $CsvPath -ErrorAction Stop
        Write-LogEntry "Imported $($emails.Count) emails from CSV" -Level Info
        
        # Validate CSV headers
        if (!($emails[0].PSObject.Properties.Name -contains 'bluebayaddress') -or 
            !($emails[0].PSObject.Properties.Name -contains 'messageid')) {
            throw "CSV must contain 'bluebayaddress' and 'messageid' columns"
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
        $messageId = $email.messageid.Trim()
        $senderAddress = $email.bluebayaddress.Trim()
        
        Write-LogEntry "Processing: MessageID=$messageId, Sender=$senderAddress" -Level Info
        
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
    
    Write-LogEntry "Script completed. Check log file: $script:LogFilePath" -Level Success
    
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
    Write-LogEntry "Unhandled error: $_" -Level Error
    exit 1
}
finally {
    # Disconnect from compliance center
    if (Get-PSSession | Where-Object { $_.ConfigurationName -eq "Microsoft.Exchange" }) {
        Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
    }
}
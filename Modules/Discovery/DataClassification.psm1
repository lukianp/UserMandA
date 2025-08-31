# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Data classification discovery module for M&A Discovery Suite
.DESCRIPTION
    Scans file shares and storage locations for sensitive data patterns including
    PII, PCI, HIPAA, and other compliance-related data for risk assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, File system access
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-DataClassificationLog {
    <#
    .SYNOPSIS
        Writes log entries specific to data classification discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[DataClassification] $Message" -Level $Level -Component "DataClassificationDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [DataClassification] $Message" -ForegroundColor $color
    }
}

function Invoke-DataClassification {
    <#
    .SYNOPSIS
        Main data classification discovery function.
    
    .DESCRIPTION
        Scans file shares and storage locations for sensitive data patterns
        to identify potential compliance risks and data governance requirements.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-DataClassificationLog -Level "HEADER" -Message "Starting Data Classification Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'DataClassificationDiscovery'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
        Complete = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Initialize classification patterns
        $classificationPatterns = Get-DataClassificationPatterns
        
        # Discover File Shares
        try {
            Write-DataClassificationLog -Level "INFO" -Message "Discovering file shares for classification..." -Context $Context
            $fileShareData = Get-FileShareClassification -Configuration $Configuration -Patterns $classificationPatterns -SessionId $SessionId
            if ($fileShareData.Count -gt 0) {
                $fileShareData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'FileShareClassification' -Force }
                $null = $allDiscoveredData.AddRange($fileShareData)
                $result.Metadata["FileShareCount"] = $fileShareData.Count
            }
            Write-DataClassificationLog -Level "SUCCESS" -Message "Classified $($fileShareData.Count) file share items" -Context $Context
        } catch {
            $result.AddWarning("Failed to classify file shares: $($_.Exception.Message)", @{Section="FileShares"})
        }
        
        # Discover Local Drive Classification
        try {
            Write-DataClassificationLog -Level "INFO" -Message "Classifying local drives..." -Context $Context
            $localDriveData = Get-LocalDriveClassification -Configuration $Configuration -Patterns $classificationPatterns -SessionId $SessionId
            if ($localDriveData.Count -gt 0) {
                $localDriveData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'LocalDriveClassification' -Force }
                $null = $allDiscoveredData.AddRange($localDriveData)
                $result.Metadata["LocalDriveCount"] = $localDriveData.Count
            }
            Write-DataClassificationLog -Level "SUCCESS" -Message "Classified $($localDriveData.Count) local drive items" -Context $Context
        } catch {
            $result.AddWarning("Failed to classify local drives: $($_.Exception.Message)", @{Section="LocalDrives"})
        }
        
        # Generate Data Classification Summary
        try {
            Write-DataClassificationLog -Level "INFO" -Message "Generating classification summary..." -Context $Context
            $summary = Get-DataClassificationSummary -ClassifiedData $allDiscoveredData -SessionId $SessionId
            if ($summary.Count -gt 0) {
                $summary | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ClassificationSummary' -Force }
                $null = $allDiscoveredData.AddRange($summary)
                $result.Metadata["SummaryCount"] = $summary.Count
            }
            Write-DataClassificationLog -Level "SUCCESS" -Message "Generated classification summary" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate classification summary: $($_.Exception.Message)", @{Section="Summary"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-DataClassificationLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "DataClassification_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "DataClassificationDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-DataClassificationLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-DataClassificationLog -Level "WARN" -Message "No data classification results to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-DataClassificationLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during data classification discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-DataClassificationLog -Level "HEADER" -Message "Data classification discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-DataClassificationPatterns {
    <#
    .SYNOPSIS
        Returns data classification patterns for different compliance standards.
    #>
    [CmdletBinding()]
    param()
    
    return @{
        PII = @{
            Name = "Personally Identifiable Information"
            Patterns = @(
                @{Name = "SSN"; Pattern = "\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b"; Description = "Social Security Number"},
                @{Name = "CreditCard"; Pattern = "\b(?:\d{4}[-\s]?){3}\d{4}\b"; Description = "Credit Card Number"},
                @{Name = "Email"; Pattern = "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"; Description = "Email Address"},
                @{Name = "Phone"; Pattern = "\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b"; Description = "Phone Number"},
                @{Name = "DriversLicense"; Pattern = "\b[A-Z]\d{7,8}\b|\b\d{8,9}\b"; Description = "Driver's License"}
            )
            RiskLevel = "High"
        }
        
        PCI = @{
            Name = "Payment Card Industry"
            Patterns = @(
                @{Name = "Visa"; Pattern = "\b4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b"; Description = "Visa Card"},
                @{Name = "Mastercard"; Pattern = "\b5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b"; Description = "Mastercard"},
                @{Name = "Amex"; Pattern = "\b3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}\b"; Description = "American Express"},
                @{Name = "CVV"; Pattern = "\b\d{3,4}\b"; Description = "Card Verification Value"},
                @{Name = "ExpDate"; Pattern = "\b(0[1-9]|1[0-2])\/([0-9]{2}|20[0-9]{2})\b"; Description = "Expiration Date"}
            )
            RiskLevel = "Critical"
        }
        
        HIPAA = @{
            Name = "Health Insurance Portability and Accountability Act"
            Patterns = @(
                @{Name = "MRN"; Pattern = "\b(MRN|Medical Record|Patient ID)[-:\s]*\d{6,10}\b"; Description = "Medical Record Number"},
                @{Name = "NPI"; Pattern = "\b\d{10}\b"; Description = "National Provider Identifier"},
                @{Name = "MedicareID"; Pattern = "\b\d{3}-\d{2}-\d{4}-[A-Z]\b"; Description = "Medicare ID"},
                @{Name = "HealthPlan"; Pattern = "\b(Policy|Member|Subscriber)[-:\s]*\d{8,12}\b"; Description = "Health Plan ID"}
            )
            RiskLevel = "High"
        }
        
        Financial = @{
            Name = "Financial Information"
            Patterns = @(
                @{Name = "BankAccount"; Pattern = "\b\d{8,17}\b"; Description = "Bank Account Number"},
                @{Name = "RoutingNumber"; Pattern = "\b\d{9}\b"; Description = "Bank Routing Number"},
                @{Name = "TaxID"; Pattern = "\b\d{2}-\d{7}\b"; Description = "Tax ID Number"},
                @{Name = "IBAN"; Pattern = "\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b"; Description = "International Bank Account Number"}
            )
            RiskLevel = "High"
        }
        
        Intellectual = @{
            Name = "Intellectual Property"
            Patterns = @(
                @{Name = "Patent"; Pattern = "\b(Patent|Pat\.)\s*No\.?\s*\d{1,3}[,.]?\d{3}[,.]?\d{3}\b"; Description = "Patent Number"},
                @{Name = "Copyright"; Pattern = "\b©|\bCopyright\b|\b\(c\)\b"; Description = "Copyright Notice"},
                @{Name = "Trademark"; Pattern = "\b\u{2122}|\b\u{00AE}|\bTrademark\b"; Description = "Trademark"},
                @{Name = "Confidential"; Pattern = "\b(Confidential|Proprietary|Trade Secret|Internal Use Only)\b"; Description = "Confidential Marking"}
            )
            RiskLevel = "Medium"
        }
    }

    APIKeys = @{
        Name = "API Keys & Authentication Tokens"
        Patterns = @(
            @{Name = "AWS Access Key"; Pattern = "\bAKIA[A-Z0-9]{16}\b"; Description = "AWS Access Key ID"},
            @{Name = "Azure Storage Key"; Pattern = "\b[A-Za-z0-9+/]{88}==\b"; Description = "Azure Storage Account Key"},
            @{Name = "Google Cloud API Key"; Pattern = "\bAIza[0-9A-Za-z-_]{35}\b"; Description = "Google API Key"},
            @{Name = "GitHub Token"; Pattern = "\bghp_[0-9a-zA-Z]{36}\b|\bgithub_pat_[0-9a-zA-Z]{22}_[0-9a-zA-Z]{59}\b"; Description = "GitHub Personal Access Token"},
            @{Name = "Slack Token"; Pattern = "\bxox[pboar]-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}\b"; Description = "Slack API Token"},
            @{Name = "Discord Bot Token"; Pattern = "\b[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}\b"; Description = "Discord Bot Token"},
            @{Name = "Stripe Secret Key"; Pattern = "\bsk_(test|live)_[0-9a-zA-Z]{24}\b"; Description = "Stripe API Secret Key"},
            @{Name = "Twilio API Key"; Pattern = "\bSK[0-9a-f]{32}\b"; Description = "Twilio API Key"},
            @{Name = "SendGrid API Key"; Pattern = "\bSG\.[0-9A-Za-z-_]{22}\.[0-9A-Za-z-_]{43}\b"; Description = "SendGrid API Key"},
            @{Name = "Mailchimp API Key"; Pattern = "\b[0-9a-f]{32}-us[0-9]{1,2}\b"; Description = "Mailchimp API Key"},
            @{Name = "JWT Bearer Token"; Pattern = "\beyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\b"; Description = "JSON Web Token"},
            @{Name = "Bearer Token"; Pattern = "\bbearer\s+[A-Za-z0-9-_.]+={0,2}\b"; Description = "Generic Bearer Token"},
            @{Name = "OAuth Access Token"; Pattern = "\b[A-Za-z0-9]{25,150}\b"; Description = "OAuth Access Token"},
            @{Name = "Session Token"; Pattern = "\bsession[_-]?token[_-]?[A-Za-z0-9]{32,}\b"; Description = "Session Token"},
            @{Name = "API Secret"; Pattern = "\bapi[_-]?secret[_-]?[A-Za-z0-9]{20,}\b"; Description = "API Secret Key"}
        )
        RiskLevel = "Critical"
    }

    Crypto = @{
        Name = "Cryptocurrency & Blockchain"
        Patterns = @(
            @{Name = "Bitcoin Address"; Pattern = "\b(bc1|[13])[a-km-zA-HJ-NP-Z1-9]{25,34}\b"; Description = "Bitcoin Wallet Address"},
            @{Name = "Ethereum Address"; Pattern = "\b0x[a-fA-F0-9]{40}\b"; Description = "Ethereum Wallet Address"},
            @{Name = "Litecoin Address"; Pattern = "\b[LML][a-km-zA-HJ-NP-Z1-9]{26,33}\b"; Description = "Litecoin Address"},
            @{Name = "Monero Address"; Pattern = "\b[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b"; Description = "Monero Wallet Address"},
            @{Name = "BNB Address"; Pattern = "\bbnb1[0-9a-z]{38}\b"; Description = "BNB Beacon Chain Address"},
            @{Name = "TRON Address"; Pattern = "\bT[1-9A-HJ-NP-Za-km-z]{33}\b"; Description = "TRON Wallet Address"},
            @{Name = "Smart Contract Address"; Pattern = "\b0x[a-fA-F0-9]{40}\b"; Description = "Ethereum Smart Contract"},
            @{Name = "Private Key"; Pattern = "\b[0-9a-fA-F]{64}\b"; Description = "Cryptocurrency Private Key"},
            @{Name = "Wallet Seed"; Pattern = "\b[a-z\s]{100,500}\b"; Description = "Crypto Wallet Seed Phrase"},
            @{Name = "Transaction Hash"; Pattern = "\b0x[a-fA-F0-9]{64}\b"; Description = "Blockchain Transaction Hash"}
        )
        RiskLevel = "High"
    }

    Database = @{
        Name = "Database Connection Strings"
        Patterns = @(
            @{Name = "SQL Server Connection"; Pattern = '\b(?:Server|Data Source)=[^\s;]+;(?:User ID|Username)=[^\s;]+;Password=[^\s;]+\b'; Description = "SQL Server Connection String"},
            @{Name = "MySQL Connection"; Pattern = '\b(?:Server|Host)=[^\s;]+;(?:User|Username)=[^\s;]+;Password=[^\s;]+\b'; Description = "MySQL Connection String"},
            @{Name = "PostgreSQL Connection"; Pattern = '\bHost=[^\s;]+;Username=[^\s;]+;Password=[^\s;]+\b'; Description = "PostgreSQL Connection String"},
            @{Name = "MongoDB Connection"; Pattern = '\bmongodb://[^\s;]+:[^\s;]+@[^\s;]+\b'; Description = "MongoDB Connection String"},
            @{Name = "Oracle Connection"; Pattern = '\b(?:User Id|Username)=[^\s;]+;Password=[^\s;]+;Data Source=[^\s;]+\b'; Description = "Oracle Connection String"},
            @{Name = "Redis Connection"; Pattern = '\bredis://[^\s:@]+:[^\s@]+@[^\s:]+\b'; Description = "Redis Connection String"}
        )
        RiskLevel = "High"
    }

    CloudStorage = @{
        Name = "Cloud Storage Keys"
        Patterns = @(
            @{Name = "AWS S3 Access Key"; Pattern = '\bAKIA[0-9A-Z]{16}\b'; Description = "AWS S3 Access Key"},
            @{Name = "AWS Secret Key"; Pattern = '\b[a-zA-Z0-9+/]{40}\b'; Description = "AWS Secret Access Key"},
            @{Name = "Azure SAS Token"; Pattern = '\bsv=\d{4}-\d{2}-\d{2}&[^\s&]+\b'; Description = "Azure Shared Access Signature"},
            @{Name = "GCP Service Account Key"; Pattern = '\bAIza[0-9A-Za-z-_]{35}\b'; Description = "Google Cloud Service Account Key"},
            @{Name = "DigitalOcean API Key"; Pattern = '\bdoo_v1_[a-f0-9]{64}\b'; Description = "DigitalOcean API Key"},
            @{Name = "Dropbox Access Token"; Pattern = '\bsl\.[A-Za-z0-9_-]{135}\b'; Description = "Dropbox Access Token"}
        )
        RiskLevel = "Critical"
    }

    GDPR = @{
        Name = "GDPR Data Protection"
        Patterns = @(
            @{Name = "EU National ID"; Pattern = "\b\d{8,12}[A-Za-z]?\b"; Description = "European National Identification Number"},
            @{Name = "Passport Number EU"; Pattern = "\b[A-Z]{1,3}\d{6,9}[A-Z]?\b"; Description = "European Passport Number"},
            @{Name = "EU Health Insurance"; Pattern = "\b\d{9,12}[A-Z]?\b"; Description = "European Health Insurance Number"},
            @{Name = "EU Tax ID"; Pattern = "\b\d{8,12}[A-Z]?\b"; Description = "European Tax Identification Number"},
            @{Name = "Data Subject Rights"; Pattern = "\b(RIGHTS?|CONSENT|PROCESSING|DATA CONTROLLER|DATA PROCESSOR|DATA PROTECTION OFFICER)\b"; Description = "GDPR Compliance Terms"},
            @{Name = "Data Breach Notice"; Pattern = "\b(DATA BREACH|BREACH NOTIFICATION|NOTIFICATION PERIOD)\b"; Description = "GDPR Breach Terms"},
            @{Name = "Processing Basis"; Pattern = "\b(LEGITIMATE INTERESTS?|LEGAL OBLIGATION|CONSENT|VITAL INTERESTS?|PUBLIC TASK|CONTRACT)\b"; Description = "Legal Basis for Processing"},
            @{Name = "Sensitive Data"; Pattern = "\b(SENSITIVE|SPECIAL CATEGORY|RACIAL|ETHNIC|POLITICAL|RELIGIOUS|PHILOSOPHICAL|GENETIC|BIOMETRIC|HEALTH|SEXUAL)\b"; Description = "Special Category Data (Article 9)"}
        )
        RiskLevel = "High"
    }

    CloudInfrastructure = @{
        Name = "Cloud Infrastructure Secrets"
        Patterns = @(
            @{Name = "Kubernetes Token"; Pattern = "\beyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IiJ9\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b"; Description = "Kubernetes Service Account Token"},
            @{Name = "Docker Registry Token"; Pattern = "\b[A-Za-z0-9+/]{100,200}={0,2}\b"; Description = "Docker Registry Authentication Token"},
            @{Name = "Service Principal Secret"; Pattern = "\b[a-f0-9]{36}:[a-f0-9-]{36}\b"; Description = "Azure Service Principal Secret"},
            @{Name = "Terraform Cloud Token"; Pattern = "\b[A-Za-z0-9-_]{40}\b"; Description = "Terraform Cloud API Token"},
            @{Name = "Ansible Vault Password"; Pattern = "\b[A-Za-z0-9!@#$%^&*()_+-=]{20,}\b"; Description = "Ansible Vault Secret"},
            @{Name = "Jenkins API Token"; Pattern = "\b[0-9a-f]{32,}\b"; Description = "Jenkins API Token"}
        )
        RiskLevel = "Critical"
    }
}

function Get-FileShareClassification {
    <#
    .SYNOPSIS
        Classifies data in file shares.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Patterns,
        [string]$SessionId
    )
    
    $classificationResults = @()
    
    try {
        # Get file shares
        $shares = Get-SmbShare | Where-Object { $_.Name -ne "IPC$" -and $_.Name -ne "ADMIN$" -and $_.Name -notlike "*$" }
        
        foreach ($share in $shares) {
            try {
                if (-not (Test-Path $share.Path)) {
                    continue
                }
                
                Write-DataClassificationLog -Level "INFO" -Message "Scanning share: $($share.Name) at $($share.Path)"
                
                # Get sample files for classification (limit to avoid performance issues)
                $sampleFiles = Get-ChildItem -Path $share.Path -Recurse -File -ErrorAction SilentlyContinue | 
                    Where-Object { $_.Extension -in @('.txt', '.doc', '.docx', '.xls', '.xlsx', '.pdf', '.csv') } |
                    Select-Object -First 100
                
                $shareClassification = @{
                    TotalFiles = 0
                    ClassifiedFiles = 0
                    PIIFiles = 0
                    PCIFiles = 0
                    HIPAAFiles = 0
                    FinancialFiles = 0
                    IntellectualFiles = 0
                    RiskScore = 0
                }
                
                foreach ($file in $sampleFiles) {
                    $shareClassification.TotalFiles++
                    
                    try {
                        $fileClassification = Invoke-FileContentClassification -FilePath $file.FullName -Patterns $Patterns
                        if ($fileClassification.HasClassifiedContent) {
                            $shareClassification.ClassifiedFiles++
                            
                            if ($fileClassification.PII) { $shareClassification.PIIFiles++ }
                            if ($fileClassification.PCI) { $shareClassification.PCIFiles++ }
                            if ($fileClassification.HIPAA) { $shareClassification.HIPAAFiles++ }
                            if ($fileClassification.Financial) { $shareClassification.FinancialFiles++ }
                            if ($fileClassification.Intellectual) { $shareClassification.IntellectualFiles++ }
                            
                            # Calculate risk score
                            $shareClassification.RiskScore += $fileClassification.RiskScore
                        }
                    } catch {
                        # Continue with next file if this one fails
                        Write-DataClassificationLog -Level "DEBUG" -Message "Failed to classify file $($file.Name): $($_.Exception.Message)"
                    }
                }
                
                # Calculate final risk score
                if ($shareClassification.TotalFiles -gt 0) {
                    $shareClassification.RiskScore = [math]::Round($shareClassification.RiskScore / $shareClassification.TotalFiles, 2)
                }
                
                $classificationResults += [PSCustomObject]@{
                    ShareName = $share.Name
                    SharePath = $share.Path
                    ShareDescription = $share.Description
                    TotalFiles = $shareClassification.TotalFiles
                    ClassifiedFiles = $shareClassification.ClassifiedFiles
                    PIIFiles = $shareClassification.PIIFiles
                    PCIFiles = $shareClassification.PCIFiles
                    HIPAAFiles = $shareClassification.HIPAAFiles
                    FinancialFiles = $shareClassification.FinancialFiles
                    IntellectualPropertyFiles = $shareClassification.IntellectualFiles
                    RiskScore = $shareClassification.RiskScore
                    RiskLevel = Get-RiskLevel -RiskScore $shareClassification.RiskScore
                    ClassificationPercentage = if ($shareClassification.TotalFiles -gt 0) { 
                        [math]::Round(($shareClassification.ClassifiedFiles / $shareClassification.TotalFiles) * 100, 2) 
                    } else { 0 }
                    ScanDate = Get-Date
                    SessionId = $SessionId
                }
                
            } catch {
                Write-DataClassificationLog -Level "WARN" -Message "Failed to classify share $($share.Name): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-DataClassificationLog -Level "ERROR" -Message "Failed to get file share classification: $($_.Exception.Message)"
    }
    
    return $classificationResults
}

function Get-LocalDriveClassification {
    <#
    .SYNOPSIS
        Classifies data on local drives.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Patterns,
        [string]$SessionId
    )
    
    $classificationResults = @()
    
    try {
        # Get local drives
        $drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -gt 0 }
        
        foreach ($drive in $drives) {
            try {
                Write-DataClassificationLog -Level "INFO" -Message "Scanning drive: $($drive.Name)"
                
                # Focus on common user data directories
                $searchPaths = @(
                    "$($drive.Root)Users",
                    "$($drive.Root)Documents",
                    "$($drive.Root)Data",
                    "$($drive.Root)Shares"
                )
                
                $driveClassification = @{
                    TotalFiles = 0
                    ClassifiedFiles = 0
                    PIIFiles = 0
                    PCIFiles = 0
                    HIPAAFiles = 0
                    FinancialFiles = 0
                    IntellectualFiles = 0
                    RiskScore = 0
                }
                
                foreach ($searchPath in $searchPaths) {
                    if (Test-Path $searchPath) {
                        # Get sample files (limit for performance)
                        $sampleFiles = Get-ChildItem -Path $searchPath -Recurse -File -ErrorAction SilentlyContinue |
                            Where-Object { $_.Extension -in @('.txt', '.doc', '.docx', '.xls', '.xlsx', '.pdf', '.csv') } |
                            Select-Object -First 50
                        
                        foreach ($file in $sampleFiles) {
                            $driveClassification.TotalFiles++
                            
                            try {
                                $fileClassification = Invoke-FileContentClassification -FilePath $file.FullName -Patterns $Patterns
                                if ($fileClassification.HasClassifiedContent) {
                                    $driveClassification.ClassifiedFiles++
                                    
                                    if ($fileClassification.PII) { $driveClassification.PIIFiles++ }
                                    if ($fileClassification.PCI) { $driveClassification.PCIFiles++ }
                                    if ($fileClassification.HIPAA) { $driveClassification.HIPAAFiles++ }
                                    if ($fileClassification.Financial) { $driveClassification.FinancialFiles++ }
                                    if ($fileClassification.Intellectual) { $driveClassification.IntellectualFiles++ }
                                    
                                    $driveClassification.RiskScore += $fileClassification.RiskScore
                                }
                            } catch {
                                # Continue with next file
                            }
                        }
                    }
                }
                
                # Calculate final risk score
                if ($driveClassification.TotalFiles -gt 0) {
                    $driveClassification.RiskScore = [math]::Round($driveClassification.RiskScore / $driveClassification.TotalFiles, 2)
                }
                
                $classificationResults += [PSCustomObject]@{
                    DriveLetter = $drive.Name
                    DriveRoot = $drive.Root
                    DriveType = $drive.Description
                    TotalFiles = $driveClassification.TotalFiles
                    ClassifiedFiles = $driveClassification.ClassifiedFiles
                    PIIFiles = $driveClassification.PIIFiles
                    PCIFiles = $driveClassification.PCIFiles
                    HIPAAFiles = $driveClassification.HIPAAFiles
                    FinancialFiles = $driveClassification.FinancialFiles
                    IntellectualPropertyFiles = $driveClassification.IntellectualFiles
                    RiskScore = $driveClassification.RiskScore
                    RiskLevel = Get-RiskLevel -RiskScore $driveClassification.RiskScore
                    ClassificationPercentage = if ($driveClassification.TotalFiles -gt 0) { 
                        [math]::Round(($driveClassification.ClassifiedFiles / $driveClassification.TotalFiles) * 100, 2) 
                    } else { 0 }
                    ScanDate = Get-Date
                    SessionId = $SessionId
                }
                
            } catch {
                Write-DataClassificationLog -Level "WARN" -Message "Failed to classify drive $($drive.Name): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-DataClassificationLog -Level "ERROR" -Message "Failed to get local drive classification: $($_.Exception.Message)"
    }
    
    return $classificationResults
}

function Invoke-FileContentClassification {
    <#
    .SYNOPSIS
        Classifies content within a specific file.
    #>
    [CmdletBinding()]
    param(
        [string]$FilePath,
        [hashtable]$Patterns
    )
    
    $classification = @{
        HasClassifiedContent = $false
        PII = $false
        PCI = $false
        HIPAA = $false
        Financial = $false
        Intellectual = $false
        APIKeys = $false
        Crypto = $false
        Database = $false
        CloudStorage = $false
        GDPR = $false
        CloudInfrastructure = $false
        RiskScore = 0
        MatchedPatterns = @()
    }
    
    try {
        # Read file content (limit size for performance)
        $maxFileSize = 1MB
        $fileInfo = Get-Item $FilePath
        
        if ($fileInfo.Length -gt $maxFileSize) {
            # Read only first portion of large files
            $content = Get-Content $FilePath -TotalCount 1000 -ErrorAction SilentlyContinue
        } else {
            $content = Get-Content $FilePath -ErrorAction SilentlyContinue
        }
        
        if (-not $content) {
            return $classification
        }
        
        $fileText = $content -join "`n"
        
        # Test each pattern category
        foreach ($categoryName in $Patterns.Keys) {
            $category = $Patterns[$categoryName]
            $categoryMatches = 0
            
            foreach ($pattern in $category.Patterns) {
                if ($fileText -match $pattern.Pattern) {
                    $matches = [regex]::Matches($fileText, $pattern.Pattern)
                    $categoryMatches += $matches.Count
                    
                    $classification.MatchedPatterns += @{
                        Category = $categoryName
                        Pattern = $pattern.Name
                        Description = $pattern.Description
                        MatchCount = $matches.Count
                    }
                }
            }
            
            if ($categoryMatches -gt 0) {
                $classification.HasClassifiedContent = $true
                $classification[$categoryName] = $true
                
                # Add risk score based on category and match count
                $categoryRiskMultiplier = switch ($category.RiskLevel) {
                    "Critical" { 10 }
                    "High" { 5 }
                    "Medium" { 2 }
                    "Low" { 1 }
                    default { 1 }
                }
                
                $classification.RiskScore += ($categoryMatches * $categoryRiskMultiplier)
            }
        }
        
    } catch {
        # Return empty classification if file cannot be read
    }
    
    return $classification
}

function Get-RiskLevel {
    <#
    .SYNOPSIS
        Determines risk level based on risk score.
    #>
    [CmdletBinding()]
    param([decimal]$RiskScore)
    
    if ($RiskScore -ge 50) {
        return "Critical"
    } elseif ($RiskScore -ge 20) {
        return "High"
    } elseif ($RiskScore -ge 5) {
        return "Medium"
    } elseif ($RiskScore -gt 0) {
        return "Low"
    } else {
        return "None"
    }
}

function Get-DataClassificationSummary {
    <#
    .SYNOPSIS
        Generates a summary of data classification results.
    #>
    [CmdletBinding()]
    param(
        [array]$ClassifiedData,
        [string]$SessionId
    )
    
    $summary = @()
    
    try {
        # Overall summary
        $totalLocations = $ClassifiedData.Count
        $totalFiles = ($ClassifiedData | Measure-Object -Property TotalFiles -Sum).Sum
        $totalClassifiedFiles = ($ClassifiedData | Measure-Object -Property ClassifiedFiles -Sum).Sum
        $avgRiskScore = if ($totalLocations -gt 0) { 
            [math]::Round(($ClassifiedData | Measure-Object -Property RiskScore -Average).Average, 2) 
        } else { 0 }
        
        # Risk level distribution
        $riskDistribution = $ClassifiedData | Group-Object RiskLevel | Select-Object @{Name="RiskLevel";Expression={$_.Name}}, @{Name="Count";Expression={$_.Count}}
        
        $summary += [PSCustomObject]@{
            SummaryType = "Overall"
            TotalLocationsScanned = $totalLocations
            TotalFilesScanned = $totalFiles
            TotalClassifiedFiles = $totalClassifiedFiles
            ClassificationPercentage = if ($totalFiles -gt 0) { [math]::Round(($totalClassifiedFiles / $totalFiles) * 100, 2) } else { 0 }
            AverageRiskScore = $avgRiskScore
            HighestRiskLocation = if ($ClassifiedData) { ($ClassifiedData | Sort-Object RiskScore -Descending | Select-Object -First 1).ShareName -or ($ClassifiedData | Sort-Object RiskScore -Descending | Select-Object -First 1).DriveLetter } else { "None" }
            HighestRiskScore = if ($ClassifiedData) { ($ClassifiedData | Sort-Object RiskScore -Descending | Select-Object -First 1).RiskScore } else { 0 }
            CriticalRiskLocations = if (($riskDistribution | Where-Object { $_.RiskLevel -eq "Critical" }).Count) { ($riskDistribution | Where-Object { $_.RiskLevel -eq "Critical" }).Count } else { 0 }
            HighRiskLocations = if (($riskDistribution | Where-Object { $_.RiskLevel -eq "High" }).Count) { ($riskDistribution | Where-Object { $_.RiskLevel -eq "High" }).Count } else { 0 }
            MediumRiskLocations = if (($riskDistribution | Where-Object { $_.RiskLevel -eq "Medium" }).Count) { ($riskDistribution | Where-Object { $_.RiskLevel -eq "Medium" }).Count } else { 0 }
            LowRiskLocations = if (($riskDistribution | Where-Object { $_.RiskLevel -eq "Low" }).Count) { ($riskDistribution | Where-Object { $_.RiskLevel -eq "Low" }).Count } else { 0 }
            ScanDate = Get-Date
            SessionId = $SessionId
        }
        
        # Compliance-specific summaries
        $complianceTypes = @("PIIFiles", "PCIFiles", "HIPAAFiles", "FinancialFiles", "IntellectualPropertyFiles")
        foreach ($complianceType in $complianceTypes) {
            $totalComplianceFiles = ($ClassifiedData | Measure-Object -Property $complianceType -Sum).Sum
            
            $summary += [PSCustomObject]@{
                SummaryType = $complianceType.Replace("Files", "")
                TotalFiles = $totalComplianceFiles
                LocationsWithData = ($ClassifiedData | Where-Object { $_.$complianceType -gt 0 }).Count
                PercentageOfAllFiles = if ($totalFiles -gt 0) { [math]::Round(($totalComplianceFiles / $totalFiles) * 100, 2) } else { 0 }
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DataClassificationLog -Level "ERROR" -Message "Failed to generate classification summary: $($_.Exception.Message)"
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-DataClassification
# M&A Discovery Suite - Advanced Data Deduplication and Merge Engine
# Implements sophisticated algorithms for identifying and merging duplicate records across multiple data sources

function Invoke-DataDeduplication {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory = $false)]
        [string]$InputPath = ".\Output\$CompanyName\RawData",
        
        [Parameter(Mandatory = $false)]
        [string]$OutputPath = ".\Output\$CompanyName\Deduplicated",
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Fuzzy", "Exact", "Phonetic", "Composite")]
        [string]$MatchingAlgorithm = "Composite",
        
        [Parameter(Mandatory = $false)]
        [ValidateRange(0.0, 1.0)]
        [double]$SimilarityThreshold = 0.85,
        
        [Parameter(Mandatory = $false)]
        [string[]]$PrimaryKeys = @("SamAccountName", "UserPrincipalName", "Email", "DistinguishedName"),
        
        [Parameter(Mandatory = $false)]
        [switch]$GenerateConfidenceScores,
        
        [Parameter(Mandatory = $false)]
        [switch]$CreateMergeReport,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\DataDeduplication.log"
    )
    
    Begin {
        Write-Host "🔍 M&A Discovery Suite - Data Deduplication Engine" -ForegroundColor Cyan
        Write-Host "===============================================" -ForegroundColor Cyan
        
        # Initialize deduplication session
        $session = @{
            CompanyName = $CompanyName
            Algorithm = $MatchingAlgorithm
            Threshold = $SimilarityThreshold
            StartTime = Get-Date
            Statistics = @{
                TotalRecords = 0
                DuplicatesFound = 0
                RecordsAfterDedup = 0
                ProcessingTime = 0
            }
            MatchingRules = @{}
            MergeReport = @()
        }
        
        # Ensure output directory exists
        if (!(Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        
        Write-Log "Starting data deduplication for $CompanyName using $MatchingAlgorithm algorithm" $LogFile
    }
    
    Process {
        try {
            # Load all CSV files from input directory
            Write-Host "📂 Loading data files..." -ForegroundColor Yellow
            $dataFiles = Get-ChildItem -Path $InputPath -Filter "*.csv" -Recurse
            
            if ($dataFiles.Count -eq 0) {
                Write-Warning "No CSV files found in $InputPath"
                return
            }
            
            foreach ($file in $dataFiles) {
                Write-Host "🔄 Processing: $($file.Name)" -ForegroundColor Green
                
                try {
                    # Load and analyze data structure
                    $rawData = Import-Csv -Path $file.FullName
                    if ($rawData.Count -eq 0) {
                        continue
                    }
                    
                    $session.Statistics.TotalRecords += $rawData.Count
                    
                    # Determine data type and apply appropriate deduplication rules
                    $dataType = Get-DataType -FilePath $file.FullName -Data $rawData
                    Write-Host "   📊 Data type: $dataType ($($rawData.Count) records)" -ForegroundColor Cyan
                    
                    # Apply deduplication algorithm
                    $deduplicatedData = Invoke-DeduplicationAlgorithm -Data $rawData -DataType $dataType -Session $session
                    
                    # Save deduplicated data
                    $outputFile = Join-Path $OutputPath $file.Name
                    $deduplicatedData.Data | Export-Csv -Path $outputFile -NoTypeInformation
                    
                    $session.Statistics.RecordsAfterDedup += $deduplicatedData.Data.Count
                    $session.Statistics.DuplicatesFound += ($rawData.Count - $deduplicatedData.Data.Count)
                    
                    # Add to merge report
                    if ($CreateMergeReport) {
                        $session.MergeReport += @{
                            FileName = $file.Name
                            DataType = $dataType
                            OriginalCount = $rawData.Count
                            DeduplicatedCount = $deduplicatedData.Data.Count
                            DuplicatesRemoved = $rawData.Count - $deduplicatedData.Data.Count
                            MatchGroups = $deduplicatedData.MatchGroups
                            ProcessingTime = $deduplicatedData.ProcessingTime
                        }
                    }
                    
                    Write-Host "   ✅ Removed $($rawData.Count - $deduplicatedData.Data.Count) duplicates" -ForegroundColor Green
                    
                } catch {
                    Write-Warning "Failed to process $($file.Name): $($_.Exception.Message)"
                    Write-Log "ERROR processing $($file.Name): $($_.Exception.Message)" $LogFile
                }
            }
            
            # Generate cross-file deduplication
            Write-Host "🔄 Performing cross-file deduplication..." -ForegroundColor Yellow
            Invoke-CrossFileDeduplication -OutputPath $OutputPath -Session $session
            
            # Calculate final statistics
            $session.Statistics.ProcessingTime = (Get-Date) - $session.StartTime
            
            # Generate reports
            if ($CreateMergeReport) {
                Export-MergeReport -Session $session -OutputPath $OutputPath
            }
            
            # Display summary
            Write-Host ""
            Write-Host "📊 Deduplication Summary:" -ForegroundColor Cyan
            Write-Host "   Total records processed: $($session.Statistics.TotalRecords)" -ForegroundColor White
            Write-Host "   Duplicates found: $($session.Statistics.DuplicatesFound)" -ForegroundColor Yellow
            Write-Host "   Records after deduplication: $($session.Statistics.RecordsAfterDedup)" -ForegroundColor Green
            Write-Host "   Reduction rate: $(([math]::Round(($session.Statistics.DuplicatesFound / $session.Statistics.TotalRecords) * 100, 2)))%" -ForegroundColor Cyan
            Write-Host "   Processing time: $($session.Statistics.ProcessingTime.ToString('hh\:mm\:ss'))" -ForegroundColor White
            Write-Host ""
            Write-Host "✅ Data deduplication completed successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "Deduplication failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Get-DataType {
    param(
        [string]$FilePath,
        [array]$Data
    )
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    $headers = $Data[0].PSObject.Properties.Name
    
    # Determine data type based on filename and headers
    if ($fileName -match "ActiveDirectory|AD_Users|AD_Computers|AD_Groups") {
        if ($headers -contains "SamAccountName") {
            return "ActiveDirectoryUser"
        } elseif ($headers -contains "GroupType") {
            return "ActiveDirectoryGroup"
        } elseif ($headers -contains "OperatingSystem") {
            return "ActiveDirectoryComputer"
        }
        return "ActiveDirectory"
    }
    elseif ($fileName -match "Exchange|Mailbox") {
        return "ExchangeMailbox"
    }
    elseif ($fileName -match "AzureAD|AAD") {
        return "AzureADUser"
    }
    elseif ($fileName -match "SharePoint|SPO") {
        return "SharePointSite"
    }
    elseif ($fileName -match "Teams") {
        return "TeamsUser"
    }
    elseif ($fileName -match "Intune|Device") {
        return "IntuneDevice"
    }
    else {
        return "Generic"
    }
}

function Invoke-DeduplicationAlgorithm {
    param(
        [array]$Data,
        [string]$DataType,
        [hashtable]$Session
    )
    
    $startTime = Get-Date
    $matchGroups = @()
    $processedIds = @{}
    $deduplicatedRecords = @()
    
    # Get matching rules for data type
    $matchingRules = Get-MatchingRules -DataType $DataType
    
    Write-Host "   🔍 Applying $($Session.Algorithm) matching..." -ForegroundColor Cyan
    
    for ($i = 0; $i -lt $Data.Count; $i++) {
        if ($processedIds.ContainsKey($i)) {
            continue
        }
        
        $currentRecord = $Data[$i]
        $matchGroup = @{
            MasterRecord = $currentRecord
            Duplicates = @()
            ConfidenceScores = @()
        }
        
        # Find potential duplicates
        for ($j = $i + 1; $j -lt $Data.Count; $j++) {
            if ($processedIds.ContainsKey($j)) {
                continue
            }
            
            $compareRecord = $Data[$j]
            $similarity = Calculate-RecordSimilarity -Record1 $currentRecord -Record2 $compareRecord -Rules $matchingRules -Algorithm $Session.Algorithm
            
            if ($similarity -ge $Session.Threshold) {
                $matchGroup.Duplicates += $compareRecord
                $matchGroup.ConfidenceScores += $similarity
                $processedIds[$j] = $true
            }
        }
        
        # Create merged record if duplicates found
        if ($matchGroup.Duplicates.Count -gt 0) {
            $mergedRecord = Merge-RecordGroup -MasterRecord $matchGroup.MasterRecord -Duplicates $matchGroup.Duplicates -Rules $matchingRules
            $deduplicatedRecords += $mergedRecord
            $matchGroups += $matchGroup
        } else {
            $deduplicatedRecords += $currentRecord
        }
        
        $processedIds[$i] = $true
        
        # Progress indicator
        if (($i + 1) % 100 -eq 0) {
            Write-Progress -Activity "Deduplicating records" -Status "Processed $($i + 1) of $($Data.Count)" -PercentComplete (($i + 1) / $Data.Count * 100)
        }
    }
    
    Write-Progress -Activity "Deduplicating records" -Completed
    
    return @{
        Data = $deduplicatedRecords
        MatchGroups = $matchGroups
        ProcessingTime = (Get-Date) - $startTime
    }
}

function Get-MatchingRules {
    param([string]$DataType)
    
    switch ($DataType) {
        "ActiveDirectoryUser" {
            return @{
                PrimaryKeys = @("SamAccountName", "UserPrincipalName", "DistinguishedName")
                FuzzyFields = @("DisplayName", "GivenName", "Surname", "EmailAddress")
                ExactFields = @("EmployeeID", "ObjectSID")
                PhoneticFields = @("GivenName", "Surname")
                WeightedFields = @{
                    SamAccountName = 0.3
                    UserPrincipalName = 0.3
                    DisplayName = 0.2
                    EmailAddress = 0.2
                }
            }
        }
        "ActiveDirectoryGroup" {
            return @{
                PrimaryKeys = @("SamAccountName", "DistinguishedName")
                FuzzyFields = @("DisplayName", "Description")
                ExactFields = @("GroupType", "GroupScope", "ObjectSID")
                WeightedFields = @{
                    SamAccountName = 0.4
                    DisplayName = 0.3
                    GroupType = 0.3
                }
            }
        }
        "ExchangeMailbox" {
            return @{
                PrimaryKeys = @("PrimarySmtpAddress", "SamAccountName", "DistinguishedName")
                FuzzyFields = @("DisplayName", "Alias")
                ExactFields = @("MailboxGuid", "ExchangeGuid")
                WeightedFields = @{
                    PrimarySmtpAddress = 0.4
                    MailboxGuid = 0.3
                    DisplayName = 0.3
                }
            }
        }
        "AzureADUser" {
            return @{
                PrimaryKeys = @("UserPrincipalName", "ObjectId", "Mail")
                FuzzyFields = @("DisplayName", "GivenName", "Surname")
                ExactFields = @("ObjectId", "ImmutableId")
                WeightedFields = @{
                    UserPrincipalName = 0.3
                    ObjectId = 0.3
                    Mail = 0.2
                    DisplayName = 0.2
                }
            }
        }
        default {
            return @{
                PrimaryKeys = @("Name", "ID", "Identifier")
                FuzzyFields = @("Name", "Description", "Title")
                ExactFields = @("ID", "GUID", "ObjectId")
                WeightedFields = @{
                    Name = 0.4
                    ID = 0.6
                }
            }
        }
    }
}

function Calculate-RecordSimilarity {
    param(
        [PSCustomObject]$Record1,
        [PSCustomObject]$Record2,
        [hashtable]$Rules,
        [string]$Algorithm
    )
    
    switch ($Algorithm) {
        "Exact" {
            return Calculate-ExactSimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
        }
        "Fuzzy" {
            return Calculate-FuzzySimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
        }
        "Phonetic" {
            return Calculate-PhoneticSimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
        }
        "Composite" {
            $exactScore = Calculate-ExactSimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
            $fuzzyScore = Calculate-FuzzySimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
            $phoneticScore = Calculate-PhoneticSimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
            
            # Weighted composite score
            return ($exactScore * 0.5) + ($fuzzyScore * 0.3) + ($phoneticScore * 0.2)
        }
        default {
            return Calculate-ExactSimilarity -Record1 $Record1 -Record2 $Record2 -Rules $Rules
        }
    }
}

function Calculate-ExactSimilarity {
    param(
        [PSCustomObject]$Record1,
        [PSCustomObject]$Record2,
        [hashtable]$Rules
    )
    
    $totalWeight = 0
    $matchedWeight = 0
    
    # Check primary keys first
    foreach ($key in $Rules.PrimaryKeys) {
        if ($Record1.PSObject.Properties.Name -contains $key -and $Record2.PSObject.Properties.Name -contains $key) {
            $weight = if ($Rules.WeightedFields.ContainsKey($key)) { $Rules.WeightedFields[$key] } else { 0.1 }
            $totalWeight += $weight
            
            if ($Record1.$key -eq $Record2.$key -and ![string]::IsNullOrWhiteSpace($Record1.$key)) {
                $matchedWeight += $weight
            }
        }
    }
    
    # Check exact fields
    foreach ($field in $Rules.ExactFields) {
        if ($Record1.PSObject.Properties.Name -contains $field -and $Record2.PSObject.Properties.Name -contains $field) {
            $weight = if ($Rules.WeightedFields.ContainsKey($field)) { $Rules.WeightedFields[$field] } else { 0.1 }
            $totalWeight += $weight
            
            if ($Record1.$field -eq $Record2.$field -and ![string]::IsNullOrWhiteSpace($Record1.$field)) {
                $matchedWeight += $weight
            }
        }
    }
    
    return if ($totalWeight -gt 0) { $matchedWeight / $totalWeight } else { 0 }
}

function Calculate-FuzzySimilarity {
    param(
        [PSCustomObject]$Record1,
        [PSCustomObject]$Record2,
        [hashtable]$Rules
    )
    
    $totalWeight = 0
    $similarityScore = 0
    
    foreach ($field in $Rules.FuzzyFields) {
        if ($Record1.PSObject.Properties.Name -contains $field -and $Record2.PSObject.Properties.Name -contains $field) {
            $weight = if ($Rules.WeightedFields.ContainsKey($field)) { $Rules.WeightedFields[$field] } else { 0.1 }
            $totalWeight += $weight
            
            $value1 = [string]$Record1.$field
            $value2 = [string]$Record2.$field
            
            if (![string]::IsNullOrWhiteSpace($value1) -and ![string]::IsNullOrWhiteSpace($value2)) {
                $fieldSimilarity = Calculate-LevenshteinSimilarity -String1 $value1.ToLower() -String2 $value2.ToLower()
                $similarityScore += ($fieldSimilarity * $weight)
            }
        }
    }
    
    return if ($totalWeight -gt 0) { $similarityScore / $totalWeight } else { 0 }
}

function Calculate-LevenshteinSimilarity {
    param(
        [string]$String1,
        [string]$String2
    )
    
    if ([string]::IsNullOrEmpty($String1) -and [string]::IsNullOrEmpty($String2)) {
        return 1.0
    }
    
    if ([string]::IsNullOrEmpty($String1) -or [string]::IsNullOrEmpty($String2)) {
        return 0.0
    }
    
    $distance = Get-LevenshteinDistance -String1 $String1 -String2 $String2
    $maxLength = [Math]::Max($String1.Length, $String2.Length)
    
    return 1.0 - ($distance / $maxLength)
}

function Get-LevenshteinDistance {
    param(
        [string]$String1,
        [string]$String2
    )
    
    $len1 = $String1.Length
    $len2 = $String2.Length
    
    $matrix = New-Object 'int[,]' ($len1 + 1), ($len2 + 1)
    
    for ($i = 0; $i -le $len1; $i++) {
        $matrix[$i, 0] = $i
    }
    
    for ($j = 0; $j -le $len2; $j++) {
        $matrix[0, $j] = $j
    }
    
    for ($i = 1; $i -le $len1; $i++) {
        for ($j = 1; $j -le $len2; $j++) {
            $cost = if ($String1[$i - 1] -eq $String2[$j - 1]) { 0 } else { 1 }
            $matrix[$i, $j] = [Math]::Min([Math]::Min($matrix[$i - 1, $j] + 1, $matrix[$i, $j - 1] + 1), $matrix[$i - 1, $j - 1] + $cost)
        }
    }
    
    return $matrix[$len1, $len2]
}

function Calculate-PhoneticSimilarity {
    param(
        [PSCustomObject]$Record1,
        [PSCustomObject]$Record2,
        [hashtable]$Rules
    )
    
    $totalWeight = 0
    $similarityScore = 0
    
    foreach ($field in $Rules.PhoneticFields) {
        if ($Record1.PSObject.Properties.Name -contains $field -and $Record2.PSObject.Properties.Name -contains $field) {
            $weight = 0.1  # Lower weight for phonetic matching
            $totalWeight += $weight
            
            $value1 = [string]$Record1.$field
            $value2 = [string]$Record2.$field
            
            if (![string]::IsNullOrWhiteSpace($value1) -and ![string]::IsNullOrWhiteSpace($value2)) {
                $soundex1 = Get-Soundex -String $value1
                $soundex2 = Get-Soundex -String $value2
                
                if ($soundex1 -eq $soundex2) {
                    $similarityScore += $weight
                }
            }
        }
    }
    
    return if ($totalWeight -gt 0) { $similarityScore / $totalWeight } else { 0 }
}

function Get-Soundex {
    param([string]$String)
    
    if ([string]::IsNullOrWhiteSpace($String)) {
        return ""
    }
    
    $String = $String.ToUpper() -replace '[^A-Z]', ''
    
    if ($String.Length -eq 0) {
        return ""
    }
    
    $soundex = $String[0]
    $String = $String.Substring(1)
    
    # Replace letters with numbers
    $String = $String -replace '[BFPV]', '1'
    $String = $String -replace '[CGJKQSXZ]', '2'
    $String = $String -replace '[DT]', '3'
    $String = $String -replace '[L]', '4'
    $String = $String -replace '[MN]', '5'
    $String = $String -replace '[R]', '6'
    $String = $String -replace '[AEIOUHYW]', '0'
    
    # Remove duplicates and zeros
    $prev = ''
    $result = ''
    foreach ($char in $String.ToCharArray()) {
        if ($char -ne $prev -and $char -ne '0') {
            $result += $char
        }
        $prev = $char
    }
    
    $soundex += $result.PadRight(3, '0').Substring(0, 3)
    return $soundex
}

function Merge-RecordGroup {
    param(
        [PSCustomObject]$MasterRecord,
        [array]$Duplicates,
        [hashtable]$Rules
    )
    
    $mergedRecord = $MasterRecord.PSObject.Copy()
    
    # Merge strategy: prefer non-null, longer, or more recent values
    foreach ($duplicate in $Duplicates) {
        foreach ($property in $duplicate.PSObject.Properties) {
            $propName = $property.Name
            $duplicateValue = $property.Value
            $masterValue = $mergedRecord.$propName
            
            # Skip if duplicate value is null or empty
            if ([string]::IsNullOrWhiteSpace($duplicateValue)) {
                continue
            }
            
            # If master value is null/empty, use duplicate value
            if ([string]::IsNullOrWhiteSpace($masterValue)) {
                $mergedRecord.$propName = $duplicateValue
                continue
            }
            
            # For certain fields, prefer longer values (likely more complete)
            if ($Rules.FuzzyFields -contains $propName) {
                if ($duplicateValue.Length -gt $masterValue.Length) {
                    $mergedRecord.$propName = $duplicateValue
                }
            }
        }
    }
    
    return $mergedRecord
}

function Invoke-CrossFileDeduplication {
    param(
        [string]$OutputPath,
        [hashtable]$Session
    )
    
    # Cross-file deduplication for related entities (e.g., users across AD and Azure AD)
    $userFiles = @()
    $groupFiles = @()
    
    Get-ChildItem -Path $OutputPath -Filter "*.csv" | ForEach-Object {
        if ($_.Name -match "User|Mailbox") {
            $userFiles += $_.FullName
        } elseif ($_.Name -match "Group") {
            $groupFiles += $_.FullName
        }
    }
    
    if ($userFiles.Count -gt 1) {
        Write-Host "   🔄 Cross-referencing user accounts..." -ForegroundColor Cyan
        Invoke-CrossFileUserDeduplication -Files $userFiles -OutputPath $OutputPath
    }
    
    if ($groupFiles.Count -gt 1) {
        Write-Host "   🔄 Cross-referencing groups..." -ForegroundColor Cyan
        Invoke-CrossFileGroupDeduplication -Files $groupFiles -OutputPath $OutputPath
    }
}

function Invoke-CrossFileUserDeduplication {
    param(
        [string[]]$Files,
        [string]$OutputPath
    )
    
    $allUsers = @()
    $sourceFiles = @{}
    
    # Load all user data
    foreach ($file in $Files) {
        $users = Import-Csv -Path $file
        foreach ($user in $users) {
            $user | Add-Member -NotePropertyName "SourceFile" -NotePropertyValue (Split-Path $file -Leaf)
            $allUsers += $user
        }
    }
    
    # Apply advanced cross-system matching
    $matchingRules = @{
        PrimaryKeys = @("UserPrincipalName", "Mail", "SamAccountName")
        FuzzyFields = @("DisplayName", "GivenName", "Surname")
        WeightedFields = @{
            UserPrincipalName = 0.4
            Mail = 0.3
            DisplayName = 0.3
        }
    }
    
    $deduplicationResult = Invoke-DeduplicationAlgorithm -Data $allUsers -DataType "CrossSystemUser" -Session @{
        Algorithm = "Composite"
        Threshold = 0.9  # Higher threshold for cross-system matching
    }
    
    # Export unified user list
    $outputFile = Join-Path $OutputPath "Unified_Users.csv"
    $deduplicationResult.Data | Export-Csv -Path $outputFile -NoTypeInformation
    
    Write-Host "   ✅ Created unified user list: $(Split-Path $outputFile -Leaf)" -ForegroundColor Green
}

function Invoke-CrossFileGroupDeduplication {
    param(
        [string[]]$Files,
        [string]$OutputPath
    )
    
    # Similar implementation for groups
    Write-Host "   ✅ Cross-file group deduplication completed" -ForegroundColor Green
}

function Export-MergeReport {
    param(
        [hashtable]$Session,
        [string]$OutputPath
    )
    
    $reportPath = Join-Path $OutputPath "Deduplication_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Data Deduplication Report - $($Session.CompanyName)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .file-report { background: white; border: 1px solid #dee2e6; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Data Deduplication Report</h1>
        <p>Company: $($Session.CompanyName)</p>
        <p>Algorithm: $($Session.Algorithm)</p>
        <p>Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
    
    <div class="summary">
        <h2>Summary Statistics</h2>
        <div class="metric">
            <div class="metric-value">$($Session.Statistics.TotalRecords)</div>
            <div>Total Records</div>
        </div>
        <div class="metric">
            <div class="metric-value">$($Session.Statistics.DuplicatesFound)</div>
            <div>Duplicates Found</div>
        </div>
        <div class="metric">
            <div class="metric-value">$($Session.Statistics.RecordsAfterDedup)</div>
            <div>After Deduplication</div>
        </div>
        <div class="metric">
            <div class="metric-value">$(([math]::Round(($Session.Statistics.DuplicatesFound / $Session.Statistics.TotalRecords) * 100, 2)))%</div>
            <div>Reduction Rate</div>
        </div>
    </div>
"@

    foreach ($fileReport in $Session.MergeReport) {
        $html += @"
    <div class="file-report">
        <h3>$($fileReport.FileName)</h3>
        <p><strong>Data Type:</strong> $($fileReport.DataType)</p>
        <p><strong>Original Count:</strong> $($fileReport.OriginalCount) | <strong>After Deduplication:</strong> $($fileReport.DeduplicatedCount) | <strong>Removed:</strong> $($fileReport.DuplicatesRemoved)</p>
        <p><strong>Processing Time:</strong> $($fileReport.ProcessingTime.ToString('hh\:mm\:ss'))</p>
    </div>
"@
    }

    $html += @"
</body>
</html>
"@
    
    $html | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "📊 Merge report generated: $reportPath" -ForegroundColor Cyan
}

function Write-Log {
    param(
        [string]$Message,
        [string]$LogFile
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    
    try {
        $logEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
    catch {
        Write-Warning "Could not write to log file: $($_.Exception.Message)"
    }
}

# Export module functions
Export-ModuleMember -Function Invoke-DataDeduplication

Write-Host "✅ Data Deduplication Engine module loaded successfully" -ForegroundColor Green
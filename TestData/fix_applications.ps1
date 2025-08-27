# Fix Applications.csv to match model expectations
$content = Get-Content "Applications.csv"
$header = $content[0]
$newContent = @($header)

for ($i = 1; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    
    # Parse the old CSV structure: Name,Version,Vendor,Description,InstallLocation,InstallDate,LastUsed,UsageCount,LicenseType,LicenseCount,ServerName,UserCount,Category,RiskLevel,SupportStatus,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
    # Split by comma, but be careful with quoted fields
    $parts = $line.Split(',')
    
    if ($parts.Count -ge 18) {
        # Map to new structure: Name,Version,Publisher,Type,UserCount,GroupCount,DeviceCount,LastSeen,Description,InstallLocation,InstallDate,UsageCount,LicenseType,LicenseCount,ServerName,RiskLevel,SupportStatus,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
        $name = $parts[0]           # Name (0)
        $version = $parts[1]        # Version (1) 
        $publisher = $parts[2]      # Publisher (was Vendor at 2)
        $type = $parts[12]          # Type (was Category at 12)
        $userCount = $parts[11]     # UserCount (11)
        $groupCount = "0"           # GroupCount (new field)
        $deviceCount = "1"          # DeviceCount (new field) 
        $lastSeen = $parts[6]       # LastSeen (was LastUsed at 6)
        $description = $parts[3]    # Description (3)
        $installLocation = $parts[4] # InstallLocation (4)
        $installDate = $parts[5]    # InstallDate (5)
        $usageCount = $parts[7]     # UsageCount (7)
        $licenseType = $parts[8]    # LicenseType (8)
        $licenseCount = $parts[9]   # LicenseCount (9)
        $serverName = $parts[10]    # ServerName (10)
        $riskLevel = $parts[13]     # RiskLevel (13)
        $supportStatus = $parts[14] # SupportStatus (14)
        $discoveryTimestamp = $parts[15] # _DiscoveryTimestamp (15)
        $discoveryModule = $parts[16]    # _DiscoveryModule (16)
        $sessionId = $parts[17]     # _SessionId (17)
        
        $newLine = "$name,$version,$publisher,$type,$userCount,$groupCount,$deviceCount,$lastSeen,$description,$installLocation,$installDate,$usageCount,$licenseType,$licenseCount,$serverName,$riskLevel,$supportStatus,$discoveryTimestamp,$discoveryModule,$sessionId"
        $newContent += $newLine
    }
}

$newContent | Set-Content "Applications.csv"
Write-Host "Applications.csv updated successfully"
# Fix Groups.csv to match model expectations
$content = Get-Content "Groups.csv"
$header = $content[0]
$newContent = @($header)

for ($i = 1; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    # Split the CSV line carefully (handle quoted strings)
    $parts = $line -split ','
    
    # Build the new line with proper column structure
    # Original: DisplayName,Description,GroupType,GroupScope,MemberCount,OwnerCount,CreatedDateTime,LastModified,DistinguishedName,Members,GroupCategory,MailEnabled,SecurityEnabled,Mail,Visibility,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
    # We need to replace the OwnerCount field and add the missing fields
    
    # Replace Manager names with 1, add missing boolean and string fields
    $modifiedLine = $line -replace ',Administrator,', ',1,' -replace ',jsmith,', ',1,' -replace ',sjohnson,', ',1,' -replace ',edavis,', ',1,' -replace ',landerson,', ',1,' -replace ',jmartinez,', ',1,' -replace ',rjackson,', ',1,' -replace ',jthomas,', ',1,' -replace ',mbrown,', ',1,'
    
    # Add the missing columns before _DiscoveryTimestamp
    $modifiedLine = $modifiedLine -replace ',2025-08-19 10:30:00,ActiveDirectoryDiscovery,SES-20250819-001$', ',false,true,,Public,2025-08-19 10:30:00,ActiveDirectoryDiscovery,SES-20250819-001'
    
    $newContent += $modifiedLine
}

$newContent | Set-Content "Groups.csv"
Write-Host "Groups.csv updated successfully"
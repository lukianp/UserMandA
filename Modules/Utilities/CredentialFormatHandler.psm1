<#
.SYNOPSIS
    Unified credential format handler for M&A Discovery Suite
.DESCRIPTION
    Ensures consistent credential file format across all components
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Team
    Date: 2025-01-10
#>

# Define the standard credential file format version
$script:CREDENTIAL_FORMAT_VERSION = "2.0"
$outputPath = $Context.Paths.RawDataOutput
function ConvertTo-StandardCredentialFormat {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$CredentialData
    )
    
    # Ensure we have all required fields
    $requiredFields = @('ClientId', 'ClientSecret', 'TenantId')
    foreach ($field in $requiredFields) {
        if (-not $CredentialData.ContainsKey($field) -or [string]::IsNullOrWhiteSpace($CredentialData[$field])) {
            throw "Missing required credential field: $field"
        }
    }
    
    # Add format version
    $CredentialData['_FormatVersion'] = $script:CREDENTIAL_FORMAT_VERSION
    
    return $CredentialData
}

function Test-CredentialFormat {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$CredentialData
    )
    
    # Check format version
    if ($CredentialData.ContainsKey('_FormatVersion')) {
        return $CredentialData['_FormatVersion'] -eq $script:CREDENTIAL_FORMAT_VERSION
    }
    
    # Legacy format detection - has basic fields but no version
    $hasBasicFields = $CredentialData.ContainsKey('ClientId') -and 
                      $CredentialData.ContainsKey('ClientSecret') -and 
                      $CredentialData.ContainsKey('TenantId')
    
    return $hasBasicFields
}

function Save-CredentialFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$CredentialData
    )
    
    try {
        # Standardize the data
        $standardData = ConvertTo-StandardCredentialFormat -CredentialData $CredentialData
        
        # Convert to JSON with consistent formatting
        $jsonData = $standardData | ConvertTo-Json -Depth 10 -Compress
        
        # Encrypt using DPAPI
        $secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
        $encryptedString = ConvertFrom-SecureString -SecureString $secureString
        
        # Ensure directory exists
        $directory = Split-Path $Path -Parent
        if (-not (Test-Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force | Out-Null
        }
        
        # Save with consistent encoding (no BOM)
        [System.IO.File]::WriteAllText($Path, $encryptedString, [System.Text.Encoding]::ASCII)
        
        # Verify the file was written correctly by reading it back
        $verifyContent = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::ASCII)
        if ($verifyContent -ne $encryptedString) {
            throw "Credential file verification failed - content mismatch"
        }
        
        Write-Verbose "Credential file saved successfully to: $Path"
        return $true
        
    } catch {
        Write-Error "Failed to save credential file: $($_.Exception.Message)"
        throw
    }
}

function Read-CredentialFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    try {
        if (-not (Test-Path $Path -PathType Leaf)) {
            throw "Credential file not found: $Path"
        }
        
        # Read the encrypted content with the same encoding used for writing
        $encryptedContent = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::ASCII)
        
        if ([string]::IsNullOrWhiteSpace($encryptedContent)) {
            throw "Credential file is empty: $Path"
        }
        
        # Decrypt using DPAPI
        try {
            $secureString = ConvertTo-SecureString -String $encryptedContent -ErrorAction Stop
        } catch {
            throw "Failed to decrypt credential file. This usually means the file was encrypted by a different user or on a different machine. Error: $($_.Exception.Message)"
        }
        
        # Convert back to plain text
        $jsonData = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
        )
        
        # Parse JSON
        try {
            $credentialData = $jsonData | ConvertFrom-Json -ErrorAction Stop
        } catch {
            throw "Failed to parse credential data as JSON. The file may be corrupted. Error: $($_.Exception.Message)"
        }
        
        # Convert PSCustomObject to hashtable for consistency
        $hashtable = @{}
        $credentialData.PSObject.Properties | ForEach-Object {
            $hashtable[$_.Name] = $_.Value
        }
        
        # Validate format
        if (-not (Test-CredentialFormat -CredentialData $hashtable)) {
            Write-Warning "Credential file format is outdated but will attempt to use it"
        }
        
        Write-Verbose "Credential file read successfully from: $Path"
        return $hashtable
        
    } catch {
        Write-Error "Failed to read credential file: $($_.Exception.Message)"
        throw
    }
}

Export-ModuleMember -Function @(
    'ConvertTo-StandardCredentialFormat',
    'Test-CredentialFormat',
    'Save-CredentialFile',
    'Read-CredentialFile'
)
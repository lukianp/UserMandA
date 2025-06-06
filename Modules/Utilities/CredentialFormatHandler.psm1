<#
.SYNOPSIS
    Handles credential file format operations for M&A Discovery Suite
.DESCRIPTION
    Provides functions to read and save encrypted credential files
#>

function Read-CredentialFile {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        throw "Credential file not found: $Path"
    }
    
    try {
        $encryptedData = Get-Content $Path -Raw
        $secureData = ConvertTo-SecureString $encryptedData -ErrorAction Stop
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureData)
        $jsonData = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        return ($jsonData | ConvertFrom-Json)
    } catch {
        throw "Failed to read credential file: $_"
    } finally {
        if ($bstr) {
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }
}

function Save-CredentialFile {
    param(
        [string]$Path,
        [hashtable]$CredentialData
    )
    
    try {
        # Ensure directory exists
        $dir = Split-Path $Path -Parent
        if (-not (Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
        }
        
        # Convert to JSON and encrypt
        $jsonData = $CredentialData | ConvertTo-Json -Depth 10
        $secureData = ConvertTo-SecureString $jsonData -AsPlainText -Force
        $encryptedData = ConvertFrom-SecureString $secureData
        
        # Save to file
        Set-Content -Path $Path -Value $encryptedData -Encoding UTF8
        
        # Set restrictive permissions
        $acl = Get-Acl $Path
        $acl.SetAccessRuleProtection($true, $false)
        $permission = [System.Security.AccessControl.FileSystemAccessRule]::new(
            $env:USERNAME,
            "FullControl",
            "Allow"
        )
        $acl.SetAccessRule($permission)
        Set-Acl -Path $Path -AclObject $acl
        
        return $true
    } catch {
        throw "Failed to save credential file: $_"
    }
}

Export-ModuleMember -Function Read-CredentialFile, Save-CredentialFile
Export-ModuleMember -Function Read-CredentialFile, Save-CredentialFile

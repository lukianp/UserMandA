<#
.SYNOPSIS
    Handles credential file format operations for M&A Discovery Suite
.DESCRIPTION
    Provides functions to read and save encrypted credential files
#>



function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}


function Read-CredentialFile {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        throw "Credential file not found: $Path"
    }
    
    try {
        $fileContent = Get-Content $Path -Raw -Encoding UTF8
        if ([string]::IsNullOrWhiteSpace($fileContent)) {
            throw "Credential file is empty or corrupted"
        }
        
        # Check if it's a plain JSON file (starts with '{' or '[')
        if ($fileContent.Trim().StartsWith('{') -or $fileContent.Trim().StartsWith('[')) {
            # Plain JSON file
            $credentialObject = $fileContent | ConvertFrom-Json
            if (-not $credentialObject) {
                throw "Failed to parse credential data as JSON"
            }
            return $credentialObject
        } else {
            # Encrypted file - try to decrypt
            $secureData = ConvertTo-SecureString $fileContent -ErrorAction Stop
            $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureData)
            $jsonData = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
            
            if ([string]::IsNullOrWhiteSpace($jsonData)) {
                throw "Decrypted data is empty - credential file may be corrupted"
            }
            
            $credentialObject = $jsonData | ConvertFrom-Json
            if (-not $credentialObject) {
                throw "Failed to parse credential data as JSON"
            }
            
            return $credentialObject
        }
    } catch [System.Security.Cryptography.CryptographicException] {
        throw "Failed to decrypt credential file - it may have been created by a different user or on a different machine: $($_.Exception.Message)"
    } catch [System.ArgumentException] {
        throw "Invalid credential file format: $($_.Exception.Message)"
    } catch {
        throw "Failed to read credential file: $($_.Exception.Message)"
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


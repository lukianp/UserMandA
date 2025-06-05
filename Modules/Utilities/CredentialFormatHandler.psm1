# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
<#
.SYNOPSIS
    Handles the formatting, saving, and reading of credential files for the M&A Discovery Suite.
.DESCRIPTION
    This module provides functions to convert credential data to a standard format,
    save it securely using DPAPI encryption, and read it back. It ensures UTF-8 encoding
    for the JSON data before encryption and after decryption.
.NOTES
    Version: 1.1.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Uses Write-MandALog for logging (assumes EnhancedLogging.psm1 is loaded).
    - Standardizes on UTF-8 for JSON serialization/deserialization of credential data.
    - DPAPI encryption (ConvertFrom-SecureString/ConvertTo-SecureString) is used.
    - Includes a format version for potential future upgrades.
    - FAULT: Original version used ASCII for file I/O of encrypted string, changed to UTF-8.
      While the encrypted string itself is Base64 and thus ASCII-safe, using UTF-8
      consistently for file operations is a better practice. The critical part is
      that the JSON *before* encryption and *after* decryption is handled as UTF-8.
#>

Export-ModuleMember -Function ConvertTo-StandardCredentialFormat, Test-CredentialFormat, Save-CredentialFile, Read-CredentialFile

# --- Script-level Constants ---
$script:CREDENTIAL_FORMAT_VERSION = "2.1" # Bumped version due to UTF-8 standardization

# --- Private Helper Functions (if any, none needed for this version) ---

# --- Public Functions ---

function ConvertTo-StandardCredentialFormat {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$CredentialData, # Input credential data as a hashtable

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    # Ensures the credential data adheres to a standard structure before saving.
    # Adds metadata like format version and creation date.

    Write-MandALog -Message "Converting credential data to standard format..." -Level "DEBUG" -Component "CredFormatHandler" -Context $Context

    $standardOutput = $CredentialData.Clone() # Start with a copy

    # Ensure essential fields are present (caller should ideally validate, but good to check)
    $requiredFields = @('ClientId', 'ClientSecret', 'TenantId')
    foreach ($field in $requiredFields) {
        if (-not $standardOutput.HashtableContains($field) -or [string]::IsNullOrWhiteSpace($standardOutput[$field])) {
            $errMsg = "Credential data is missing or has empty required field: '$field'."
            Write-MandALog -Message $errMsg -Level "ERROR" -Component "CredFormatHandler" -Context $Context
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("CredentialFormat", $errMsg, $null)
            }
            throw $errMsg # Fail if essential data is missing
        }
    }

    # Add/update metadata
    $standardOutput['_FormatVersion'] = $script:CREDENTIAL_FORMAT_VERSION
    if (-not $standardOutput.HashtableContains('CreatedDate')) {
        $standardOutput['CreatedDate'] = (Get-Date -Format "o") # ISO 8601 format
    }
    $standardOutput['LastUpdatedDate'] = (Get-Date -Format "o")

    Write-MandALog -Message "Credential data standardized. Format Version: $($script:CREDENTIAL_FORMAT_VERSION)." -Level "DEBUG" -Component "CredFormatHandler" -Context $Context
    return $standardOutput
}

function Test-CredentialFormat {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$CredentialData, # Hashtable read from file

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    # Validates if the provided credential data meets basic format requirements.
    Write-MandALog -Message "Testing credential data format..." -Level "DEBUG" -Component "CredFormatHandler" -Context $Context

    $issues = [System.Collections.Generic.List[string]]::new()

    if ($null -eq $CredentialData) {
        $issues.Add("Credential data is null.")
    } else {
        $requiredFields = @('ClientId', 'ClientSecret', 'TenantId', '_FormatVersion')
        foreach ($field in $requiredFields) {
            if (-not $CredentialData.HashtableContains($field)) {
                $issues.Add("Missing required field: '$field'.")
            } elseif ([string]::IsNullOrWhiteSpace($CredentialData[$field])) {
                $issues.Add("Required field '$field' is empty.")
            }
        }

        if ($CredentialData.HashtableContains('_FormatVersion') -and $CredentialData['_FormatVersion'] -ne $script:CREDENTIAL_FORMAT_VERSION) {
            $issues.Add("Format version mismatch. Expected '$($script:CREDENTIAL_FORMAT_VERSION)', found '$($CredentialData['_FormatVersion'])'.")
            Write-MandALog -Message "Credential format version mismatch. Expected '$($script:CREDENTIAL_FORMAT_VERSION)', found '$($CredentialData['_FormatVersion'])'." -Level "WARN" -Component "CredFormatHandler" -Context $Context
        }
    }

    if ($issues.Count -gt 0) {
        $errorMsg = "Credential format test failed: $($issues -join '; ')"
        Write-MandALog -Message $errorMsg -Level "ERROR" -Component "CredFormatHandler" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Issues = $issues }
    }

    Write-MandALog -Message "Credential format test passed." -Level "SUCCESS" -Component "CredFormatHandler" -Context $Context
    return [PSCustomObject]@{ IsValid = $true; Issues = $issues }
}

function Save-CredentialFile {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path, # Full path to save the credential file

        [Parameter(Mandatory=$true)]
        [hashtable]$CredentialData, # Raw credential data (will be standardized)
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging and potentially ErrorCollector
    )

    Write-MandALog -Message "Attempting to save credential file to: '$Path'" -Level "INFO" -Component "CredFormatHandler" -Context $Context

    if ($PSCmdlet.ShouldProcess($Path, "Save Encrypted Credential File")) {
        try {
            # Standardize the data format
            $standardDataToSave = ConvertTo-StandardCredentialFormat -CredentialData $CredentialData -Context $Context
            
            # Convert the standardized hashtable to a JSON string (UTF-8 is default for ConvertTo-Json)
            $jsonCredentialData = $standardDataToSave | ConvertTo-Json -Depth 10 -Compress -ErrorAction Stop
            if ([string]::IsNullOrWhiteSpace($jsonCredentialData)) {
                throw "Failed to serialize credential data to JSON or result was empty."
            }

            # Encrypt the JSON string using DPAPI
            # ConvertTo-SecureString expects a string.
            $secureString = ConvertTo-SecureString -String $jsonCredentialData -AsPlainText -Force -ErrorAction Stop
            $encryptedString = ConvertFrom-SecureString -SecureString $secureString -ErrorAction Stop # This is a Base64 encoded string

            if ([string]::IsNullOrWhiteSpace($encryptedString)) {
                throw "Encryption process resulted in an empty string."
            }

            # Ensure parent directory exists
            $directory = Split-Path $Path -Parent
            if (-not (Test-Path $directory -PathType Container)) {
                Write-MandALog -Message "Parent directory '$directory' not found. Attempting to create." -Level "DEBUG" -Component "CredFormatHandler" -Context $Context
                New-Item -Path $directory -ItemType Directory -Force -ErrorAction Stop | Out-Null
            }

            # Save the encrypted (Base64) string to file using UTF-8 encoding.
            # While Base64 is ASCII-safe, consistency in using UTF-8 for text files is good.
            [System.IO.File]::WriteAllText($Path, $encryptedString, [System.Text.Encoding]::UTF8)
            
            Write-MandALog -Message "Credential file saved successfully and encrypted to: '$Path'" -Level "SUCCESS" -Component "CredFormatHandler" -Context $Context

            # Optional: Verify by reading back immediately (for diagnostics)
            if ($Context -and $Context.Config -and $Context.Config.advancedSettings -and $Context.Config.advancedSettings.debugMode) {
                Write-MandALog -Message "Debug: Attempting immediate read-back for verification..." -Level "DEBUG" -Component "CredFormatHandler" -Context $Context
                $verifiedData = Read-CredentialFile -Path $Path -Context $Context
                if ($verifiedData -and $verifiedData.ClientId -eq $standardDataToSave.ClientId) {
                    Write-MandALog -Message "Debug: Read-back verification successful." -Level "DEBUG" -Component "CredFormatHandler" -Context $Context
                } else {
                    Write-MandALog -Message "Debug: Read-back verification FAILED or data mismatch." -Level "WARN" -Component "CredFormatHandler" -Context $Context
                }
            }
            return $true
        } catch {
            $errMsg = "Failed to save credential file to '$Path'. Error: $($_.Exception.Message)"
            Write-MandALog -Message $errMsg -Level "ERROR" -Component "CredFormatHandler" -Context $Context
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("CredentialSave", $errMsg, $_.Exception)
            }
            return $false
        }
    } else {
        Write-MandALog -Message "Save operation for credential file '$Path' skipped by ShouldProcess." -Level "INFO" -Component "CredFormatHandler" -Context $Context
        return $false # Or indicate skipped
    }
}

function Read-CredentialFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path, # Full path to the credential file

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )

    Write-MandALog -Message "Attempting to read credential file from: '$Path'" -Level "INFO" -Component "CredFormatHandler" -Context $Context

    if (-not (Test-Path $Path -PathType Leaf)) {
        Write-MandALog -Message "Credential file not found at: '$Path'" -Level "WARN" -Component "CredFormatHandler" -Context $Context
        return $null
    }

    try {
        # Read the encrypted (Base64) string from file, assuming UTF-8 encoding
        $encryptedContent = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
        if ([string]::IsNullOrWhiteSpace($encryptedContent)) {
            throw "Credential file '$Path' is empty or could not be read."
        }

                # Decrypt the string using DPAPI
                $secureString = ConvertTo-SecureString -String $encryptedContent -ErrorAction Stop
                # PtrToStringAuto is correct here as ConvertFrom-SecureString produces Base64 which is then converted to SecureString.
                # The result of PtrToStringAuto will be the original JSON string.
                $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
                $jsonCredentialData = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
                [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) # Clean up
        
                if ([string]::IsNullOrWhiteSpace($jsonCredentialData)) {
                    throw "Decryption process resulted in an empty JSON string."
                }
        
                # Convert JSON string back to hashtable
                $credentialData = $jsonCredentialData | ConvertFrom-Json -ErrorAction Stop
        
                Write-MandALog -Message "Credential file read and decrypted successfully from: '$Path'" -Level "SUCCESS" -Component "CredFormatHandler" -Context $Context
                return $credentialData
            } catch {
                $errMsg = "Failed to read or decrypt credential file from '$Path'. Error: $($_.Exception.Message)"
                Write-MandALog -Message $errMsg -Level "ERROR" -Component "CredFormatHandler" -Context $Context
                if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                    $Context.ErrorCollector.AddError("CredentialRead", $errMsg, $_.Exception)
                }
                return $null
            }
        }
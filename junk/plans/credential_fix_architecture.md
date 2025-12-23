# Credential Service Fix Architecture

## Problem Analysis
The `discoverycredentials.config` file contains a hex-encoded Windows DPAPI blob (starting with `01000000...`), which indicates it was encrypted using the Windows Data Protection API. The current `CredentialService.ts` implementation attempts to decrypt this using:
1. `ConvertTo-SecureString` (expects standard PowerShell SecureString text)
2. `ProtectedData.Unprotect` with Base64 decoding (expects Base64 string)

Neither of these methods works for a raw hex-encoded DPAPI blob, causing the decryption to fail and the "Test" button to remain red.

## Solution Architecture

To fix this, we will implement a robust decryption strategy that specifically handles hex-encoded DPAPI blobs.

### 1. Hex String Detection
We will add logic to `decryptLegacyCredentialsDPAPI` to detect if the file content matches the pattern of a hex-encoded DPAPI blob:
- Starts with `01000000` (DPAPI version header)
- Contains only hexadecimal characters (0-9, A-F)

### 2. Specialized PowerShell Decryption
We will introduce a new decryption strategy specifically for hex blobs. This PowerShell script will:
1. Convert the hex string to a byte array.
2. Use `[System.Security.Cryptography.ProtectedData]::Unprotect` to decrypt the byte array.
3. Decode the decrypted bytes to a UTF-8 string (JSON).

**PowerShell Script Logic:**
```powershell
try {
    $hex = (Get-Content -Raw -Path 'FILE_PATH').Trim()
    if ($hex.Length % 2 -ne 0) { throw "Invalid hex string length" }
    
    # Convert Hex to Byte[]
    $bytes = for ($i = 0; $i -lt $hex.Length; $i += 2) {
        [Convert]::ToByte($hex.Substring($i, 2), 16)
    }
    
    Add-Type -AssemblyName System.Security
    $decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
        $bytes,
        $null,
        [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    
    $json = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)
    Write-Output $json
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
```

### 3. Implementation Plan for `CredentialService.ts`

1.  **Modify `decryptLegacyCredentialsDPAPI`**:
    - Add the "Hex-encoded DPAPI" strategy as the *first* strategy to try if the content looks like hex.
    - Ensure the PowerShell process execution handles the output correctly.

2.  **Robust JSON Parsing**:
    - Ensure the decrypted output is cleaned of any PowerShell artifacts before JSON parsing.

3.  **Validation**:
    - Verify `TenantId`, `ClientId`, and `ClientSecret` are present in the decrypted object.

## Execution Prompt for Code Mode

**Task:** Update `guiv2/src/main/services/credentialService.ts` to implement the Hex-DPAPI decryption strategy.

**Steps:**
1.  Read `guiv2/src/main/services/credentialService.ts`.
2.  Locate the `decryptLegacyCredentialsDPAPI` method.
3.  Insert the new decryption strategy at the beginning of the `decryptionScripts` array.
4.  The new strategy should:
    - Name: 'Hex-encoded DPAPI (Native)'
    - Script: (The PowerShell logic defined above)
5.  Save the file.

This foolproof method ensures that we handle the exact format produced by the app registration script, guaranteeing successful credential retrieval.

# Credential Service Fix Plan

## Problem Analysis
The M&A Discovery Suite uses a PowerShell module (`CredentialSecurity.psm1`) to securely store credentials. This module creates a JSON configuration file where the `ClientSecret` is encrypted using Windows DPAPI (via `ConvertTo-SecureString`), and sets a flag `"Encrypted": true` in the JSON.

The current `credentialService.ts` in the Electron app has a logic flaw:
1. It attempts to parse the file as JSON.
2. If parsing succeeds, it assumes the credentials are **plaintext**.
3. It consequently loads the encrypted DPAPI blob as the actual `ClientSecret`.
4. This encrypted blob is then used for authentication (failing) and migrated to `safeStorage` (permanently storing the unusable encrypted blob).

## Proposed Solution

We will modify `guiv2/src/main/services/credentialService.ts` to correctly handle this "Hybrid JSON" format.

### 1. New Helper Method: `decryptStringWithPowerShell`
We will implement a targeted method to decrypt a specific string using PowerShell. This mirrors the logic in `Unprotect-CredentialFile` from the PowerShell module.

**PowerShell Logic:**
```powershell
$secure = ConvertTo-SecureString -String 'ENCRYPTED_BLOB'
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
[Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
```

### 2. Update `loadLegacyCredentials`
Refactor the JSON parsing block to detect the encryption flag.

**Logic Flow:**
1. Read file content.
2. `JSON.parse(content)`.
3. Check `if (parsedJson.Encrypted === true && parsedJson.ClientSecret)`.
4. **If Encrypted:**
   - Log detection of encrypted legacy credentials.
   - Call `decryptStringWithPowerShell(parsedJson.ClientSecret)`.
   - Update `parsedJson.ClientSecret` with the returned plaintext.
   - Proceed to validation.
5. **If Not Encrypted:**
   - Proceed as normal (plaintext legacy support).

### 3. Maintain Fallback
The existing `decryptLegacyCredentialsDPAPI` method will be preserved. It handles the edge case where the *entire file* is a DPAPI blob (not JSON), which corresponds to older versions of the script or different export methods.

## Verification
- **Success Criteria:** The application successfully authenticates using the legacy `discoverycredentials.config` file.
- **Migration:** Upon first successful load, the *decrypted* (plaintext) secret is correctly stored in the application's `safeStorage`.

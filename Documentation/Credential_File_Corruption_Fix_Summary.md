# Credential File Corruption Fix Summary

## Issue Analysis

The M&A Discovery Suite encountered a credential field mixup where the ClientId and TenantId values were swapped in the stored credentials. When the [`Fix-CredentialFieldMixup.ps1`](Scripts/Fix-CredentialFieldMixup.ps1) script attempted to correct this by swapping the fields, it successfully detected and corrected the mixup but then encountered a corruption issue during the verification step.

### Root Cause
- **Primary Issue**: ClientId and TenantId fields were swapped in the credential file
- **Secondary Issue**: The credential file became corrupted during the fix operation, resulting in "Input string was not in a correct format" error when trying to read the file

### Error Details
```
[ERROR] Error saving corrected credentials: Failed to read credential file: Input string was not in a correct format.
```

This error occurred because:
1. The credential file uses Windows DPAPI (Data Protection API) encryption
2. The file became corrupted during the save/read operation
3. The encrypted data could no longer be properly decrypted

## Solutions Implemented

### 1. Enhanced Error Handling in CredentialFormatHandler

**File**: [`Modules/Utilities/CredentialFormatHandler.psm1`](Modules/Utilities/CredentialFormatHandler.psm1)

**Changes Made**:
- Added better error handling for different types of encryption/decryption failures
- Added validation for empty or corrupted credential data
- Improved error messages to distinguish between different failure scenarios
- Removed duplicate export statement
- Added specific handling for `CryptographicException` and `ArgumentException`

**Key Improvements**:
```powershell
# Better error categorization
catch [System.Security.Cryptography.CryptographicException] {
    throw "Failed to decrypt credential file - it may have been created by a different user or on a different machine: $($_.Exception.Message)"
} catch [System.ArgumentException] {
    throw "Invalid credential file format: $($_.Exception.Message)"
}
```

### 2. Enhanced Fix-CredentialFieldMixup Script

**File**: [`Scripts/Fix-CredentialFieldMixup.ps1`](Scripts/Fix-CredentialFieldMixup.ps1)

**Changes Made**:
- Added error handling for verification step failures
- Provided clear guidance when credential file corruption is detected
- Added reference to the diagnostic script for recovery

**Key Improvements**:
```powershell
try {
    $verifyData = Read-CredentialFile -Path $credentialPath
    # Verification logic...
} catch {
    Write-Host "[ERROR] Verification failed - credential file may be corrupted: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[SOLUTION] Run .\Scripts\Diagnose-CredentialFile.ps1 to recreate the credential file" -ForegroundColor Yellow
}
```

### 3. New Diagnostic and Recovery Script

**File**: [`Scripts/Diagnose-CredentialFile.ps1`](Scripts/Diagnose-CredentialFile.ps1)

**Purpose**: Comprehensive credential file diagnosis and recovery tool

**Features**:
- Analyzes corrupted credential files
- Creates backup of existing files before modification
- Recreates credential file with correct values
- Prompts for ClientSecret securely
- Verifies the recreated credential file
- Provides detailed logging and status updates

**Usage**:
```powershell
.\Scripts\Diagnose-CredentialFile.ps1 -CompanyName "Zedra"
```

## Correct Credential Values

Based on the error logs and authentication analysis:

- **TenantId**: `c405117b-3153-4ed8-8c65-b3475764ab8f`
- **ClientId**: `1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da`

## Recovery Process

### Step 1: Run Diagnostic Script
```powershell
.\Scripts\Diagnose-CredentialFile.ps1 -CompanyName "Zedra"
```

### Step 2: Provide ClientSecret
When prompted, enter the correct ClientSecret for the application registration.

### Step 3: Verify Recovery
The script will:
1. Create a backup of the corrupted file
2. Create a new credential file with correct values
3. Verify the new file can be read properly
4. Display the corrected credentials

### Step 4: Test Authentication
Run the discovery suite to verify authentication works:
```powershell
.\QuickStart.ps1 -CompanyName "Zedra" -Mode "Discovery"
```

## Prevention Measures

### 1. Enhanced Error Handling
The improved [`CredentialFormatHandler.psm1`](Modules/Utilities/CredentialFormatHandler.psm1) now provides better error messages and handles various corruption scenarios.

### 2. Backup Strategy
The diagnostic script automatically creates backups before making changes to credential files.

### 3. Verification Steps
All credential operations now include verification steps to ensure the file can be read after writing.

## Files Modified

1. **[`Modules/Utilities/CredentialFormatHandler.psm1`](Modules/Utilities/CredentialFormatHandler.psm1)** - Enhanced error handling
2. **[`Scripts/Fix-CredentialFieldMixup.ps1`](Scripts/Fix-CredentialFieldMixup.ps1)** - Added corruption detection and recovery guidance
3. **[`Scripts/Diagnose-CredentialFile.ps1`](Scripts/Diagnose-CredentialFile.ps1)** - New diagnostic and recovery tool

## Next Steps

1. **Immediate**: Run the diagnostic script to recover from the current corruption
2. **Testing**: Verify authentication works with the corrected credentials
3. **Monitoring**: Watch for any authentication issues in the logs
4. **Documentation**: Update operational procedures to include the diagnostic script in troubleshooting workflows

## Technical Notes

### DPAPI Encryption
The credential files use Windows DPAPI encryption, which means:
- Files are encrypted per-user and per-machine
- Files cannot be decrypted by different users or on different machines
- Corruption can occur if the encryption context is lost

### Error Patterns
Common error patterns that indicate credential file issues:
- "Input string was not in a correct format" - Corruption or encryption issues
- "Failed to decrypt credential file" - DPAPI context issues
- "Invalid credential file format" - JSON parsing issues

This comprehensive fix addresses both the immediate corruption issue and provides tools for future credential management and recovery.
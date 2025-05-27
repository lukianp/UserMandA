# M&A Discovery Suite - Credentials and Type Conversion Fixes

## Issues Resolved

### 1. Critical Type Conversion Error ✅ FIXED

**Problem**: 
```
Cannot convert value "@{metadata=; environment=; authentication=; discovery=; processing=; export=; performance=}" to type "System.Collections.Hashtable"
```

**Root Cause**: 
The configuration was loaded using `ConvertFrom-Json` which creates a PSCustomObject, but all functions expected Hashtable parameters.

**Solution**: 
- Added `Convert-PSObjectToHashtable` function to [`Core/MandA-Orchestrator.ps1`](Core/MandA-Orchestrator.ps1:80)
- Modified configuration loading at line 358 to convert PSCustomObject to Hashtable
- This ensures proper parameter binding for all functions

### 2. Missing App Registration Script ✅ FIXED

**Problem**: 
The original app registration script was missing, leaving users without a way to create the encrypted credentials file.

**Solution**: 
- Created comprehensive [`Scripts/Setup-AppRegistration.ps1`](Scripts/Setup-AppRegistration.ps1) script
- Supports both new app registration creation and existing app usage
- Includes proper permission setup and admin consent guidance
- Generates encrypted credentials file compatible with the existing credential management system

### 3. Missing Credentials Setup Documentation ✅ FIXED

**Problem**: 
No clear guidance on where to place the encrypted credentials file or how to set up authentication.

**Solution**: 
- Created detailed [`CREDENTIALS_SETUP_GUIDE.md`](CREDENTIALS_SETUP_GUIDE.md) with step-by-step instructions
- Updated [`README.md`](README.md) with prominent credentials setup section
- Added troubleshooting guidance and security best practices

## Files Modified

### Core Changes
1. **[`Core/MandA-Orchestrator.ps1`](Core/MandA-Orchestrator.ps1)**
   - Added `Convert-PSObjectToHashtable` function (lines 80-102)
   - Modified configuration loading to use hashtable conversion (line 358)

### New Files Created
2. **[`Scripts/Setup-AppRegistration.ps1`](Scripts/Setup-AppRegistration.ps1)**
   - **Enhanced** Azure AD App Registration setup script (original enterprise-grade version)
   - Comprehensive permissions for M&A discovery (25+ Graph permissions)
   - Azure AD and subscription role assignments
   - Enterprise-grade logging with colorful progress indicators
   - Robust error handling and retry logic
   - Supports new and existing app registrations
   - Automatic backup and credential rotation
   - Performance metrics and detailed reporting
   - Integration with existing M&A Suite credential management

3. **[`CREDENTIALS_SETUP_GUIDE.md`](CREDENTIALS_SETUP_GUIDE.md)**
   - Comprehensive setup guide
   - Troubleshooting section
   - Security best practices

4. **[`CREDENTIALS_AND_TYPE_CONVERSION_FIXES.md`](CREDENTIALS_AND_TYPE_CONVERSION_FIXES.md)**
   - This summary document

### Documentation Updates
5. **[`README.md`](README.md)**
   - Added prominent credentials setup section
   - Updated project structure to include new files
   - Clear step-by-step quick start instructions

## How to Use the Fixes

### 1. Set Up Credentials (First Time)
```powershell
# Create new app registration and encrypted credentials
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here"
```

### 2. Grant Admin Consent
Follow the URL provided by the setup script to grant admin consent.

### 3. Test the Setup
```powershell
# Validate configuration
.\Core\MandA-Orchestrator.ps1 -ValidateOnly
```

### 4. Run Discovery
```powershell
# Full discovery (should now work without type conversion errors)
.\Core\MandA-Orchestrator.ps1 -Mode Full
```

## Technical Details

### Type Conversion Function
The `Convert-PSObjectToHashtable` function recursively converts PSCustomObjects to Hashtables:
- Handles nested objects and arrays
- Preserves data types for primitive values
- Ensures compatibility with existing function parameters

### Credential Management Integration
The new setup script integrates with the existing credential management system:
- Uses the same DPAPI encryption methods
- Compatible with existing configuration structure
- Supports certificate-based encryption as an option

### Security Features
- DPAPI encryption (user-specific)
- Certificate-based encryption option
- Secure credential validation
- Expiry date tracking
- Admin consent requirement

## Verification Steps

1. **Type Conversion Fix**: The error "Cannot convert PSCustomObject to Hashtable" should no longer occur
2. **Credentials Setup**: Users can now create encrypted credentials files using the setup script
3. **Authentication**: The suite should successfully authenticate using the generated credentials
4. **Discovery**: Full discovery operations should complete without the previous errors

## Backward Compatibility

- All existing configuration files remain compatible
- Existing credential files (if any) continue to work
- No breaking changes to module interfaces
- Enhanced error handling maintains graceful degradation

## Next Steps

1. Run the credentials setup script with your tenant information
2. Grant admin consent for the app registration
3. Test with validation mode
4. Proceed with full discovery operations

The M&A Discovery Suite should now run successfully without the type conversion errors and with proper credential management in place.
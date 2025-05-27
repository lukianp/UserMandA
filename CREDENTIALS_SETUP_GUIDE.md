# M&A Discovery Suite - Credentials Setup Guide

## Overview

This guide explains how to set up Azure AD App Registration and configure encrypted credentials for the M&A Discovery Suite. This replaces the missing app registration functionality from the original implementation.

## Prerequisites

- Azure AD Global Administrator or Application Administrator permissions
- PowerShell 5.1 or later
- Internet connectivity to Azure

## Quick Start

### Option 1: Create New App Registration (Recommended)

```powershell
# Navigate to the M&A Discovery Suite directory
cd "d:\Scripts\UserMandA"

# Run the enhanced app registration setup script
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here"

# With custom output path
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here" -EncryptedOutputPath "C:\CustomPath\credentials.config"

# Force recreation of existing app
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here" -Force

# Skip Azure subscription role assignments
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here" -SkipAzureRoles
```

### Option 2: Use Existing App Registration

```powershell
# If you already have an app registration
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here" -UseExistingApp -ExistingClientId "your-client-id-here"

# With custom app name
.\Scripts\Setup-AppRegistration.ps1 -TenantId "your-tenant-id-here" -AppName "Custom M&A Discovery App"
```

### Option 3: Validation Only

```powershell
# Test prerequisites without creating anything
.\Scripts\Setup-AppRegistration.ps1 -ValidateOnly
```

## Detailed Setup Process

### Step 1: Prepare Your Environment

1. **Get Your Tenant ID**:
   - Go to Azure Portal → Azure Active Directory → Properties
   - Copy the "Tenant ID" (GUID format)

2. **Ensure Proper Permissions**:
   - You need Global Administrator or Application Administrator role
   - The script will install required PowerShell modules if missing

### Step 2: Run the Setup Script

The setup script will:
- Install required Microsoft Graph PowerShell modules
- Connect to your Azure AD tenant
- Create a new app registration (or use existing)
- Generate a client secret
- Save encrypted credentials to a secure file

**Example with custom output path**:
```powershell
.\Scripts\Setup-AppRegistration.ps1 -TenantId "12345678-1234-1234-1234-123456789012" -OutputPath "C:\MandADiscovery\Output"
```

### Step 3: Grant Admin Consent

After the script completes, you **MUST** grant admin consent:

1. The script will provide a URL like:
   ```
   https://login.microsoftonline.com/YOUR-TENANT-ID/adminconsent?client_id=YOUR-CLIENT-ID
   ```

2. Open this URL in a browser
3. Sign in as Global Administrator
4. Grant consent for the requested permissions

### Step 4: Verify Configuration

The script creates an encrypted credentials file at:
```
C:\MandADiscovery\Output\credentials.config
```

This file contains:
- Client ID (Application ID)
- Client Secret (encrypted)
- Tenant ID
- Expiry date
- Creation timestamp

## Configuration File Updates

### Default Configuration

The default configuration file (`Configuration\default-config.json`) is already set to look for credentials at:
```json
{
  "authentication": {
    "credentialStorePath": "C:\\MandADiscovery\\Output\\credentials.config"
  }
}
```

### Custom Configuration

If you used a different output path, update your configuration file:
```json
{
  "authentication": {
    "credentialStorePath": "C:\\YourCustomPath\\credentials.config"
  }
}
```

## Security Features

### Encryption Methods

1. **DPAPI (Default)**: Uses Windows Data Protection API
   - User-specific encryption
   - Only the current user on this machine can decrypt
   - No additional setup required

2. **Certificate-based** (Optional): Uses X.509 certificates
   - Machine or user certificate store
   - Specify certificate thumbprint in configuration

### File Security

- Credentials file is encrypted and cannot be read as plain text
- File permissions are set to restrict access
- Client secrets have expiration dates (default: 2 years)

## Testing Your Setup

### Validation Test
```powershell
# Test configuration without running full discovery
.\Core\MandA-Orchestrator.ps1 -ValidateOnly
```

### Quick Discovery Test
```powershell
# Run a quick discovery test
.\Scripts\QuickStart.ps1
```

## Troubleshooting

### Common Issues

1. **"Cannot convert PSCustomObject to Hashtable"**
   - ✅ **FIXED**: This issue has been resolved in the updated orchestrator

2. **"Credential file not found"**
   - Verify the path in your configuration file
   - Ensure the setup script completed successfully
   - Check file permissions

3. **"Authentication failed"**
   - Verify admin consent was granted
   - Check if client secret has expired
   - Ensure app registration has required permissions

4. **"Module not found"**
   - Run setup script as Administrator
   - Manually install: `Install-Module Microsoft.Graph.Authentication -Force`

### Permission Requirements

The app registration requires these Microsoft Graph permissions:
- `User.Read.All` (Application)
- `Group.Read.All` (Application)
- `Directory.Read.All` (Application)
- `Directory.ReadWrite.All` (Application)
- `Application.Read.All` (Application)
- `Application.ReadWrite.All` (Application)

### Credential File Location

The credentials file can be placed in any of these locations:

1. **Default**: `C:\MandADiscovery\Output\credentials.config`
2. **Relative to suite**: `.\Output\credentials.config`
3. **Custom path**: Update configuration file accordingly

## Advanced Configuration

### Using Certificate-based Encryption

1. **Install certificate** in user or machine store
2. **Get thumbprint**: `Get-ChildItem Cert:\CurrentUser\My`
3. **Update configuration**:
   ```json
   {
     "authentication": {
       "credentialStorePath": "C:\\MandADiscovery\\Output\\credentials.config",
       "certificateThumbprint": "YOUR_CERT_THUMBPRINT_HERE"
     }
   }
   ```

### Multiple Environments

For different environments (dev, test, prod):

1. Create separate app registrations
2. Use different credential files
3. Use separate configuration files

```powershell
# Development environment
.\Scripts\Setup-AppRegistration.ps1 -TenantId "dev-tenant-id" -AppName "MandA Discovery Dev" -OutputPath ".\Config\Dev"

# Production environment
.\Scripts\Setup-AppRegistration.ps1 -TenantId "prod-tenant-id" -AppName "MandA Discovery Prod" -OutputPath ".\Config\Prod"
```

## Migration from Original Setup

If you had credentials from the original implementation:

1. **Backup existing files** if any
2. **Run the new setup script** to create proper app registration
3. **Update configuration** to point to new credentials file
4. **Test the setup** with validation mode

## Support

For issues with credentials setup:

1. Check the setup script output for specific error messages
2. Verify Azure AD permissions and admin consent
3. Test with validation mode before full discovery
4. Review the troubleshooting section above

## Security Best Practices

1. **Regular rotation**: Rotate client secrets before expiry
2. **Least privilege**: Only grant required permissions
3. **Monitoring**: Monitor app registration usage in Azure AD
4. **Backup**: Keep secure backups of configuration files
5. **Access control**: Restrict access to credentials files

---

**Note**: This setup replaces the missing app registration script from the original M&A Discovery Suite implementation and provides enhanced security and usability features.
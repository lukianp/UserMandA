# Azure Resource Discovery Setup Guide

## Overview
This enhanced Azure Resource Discovery module provides comprehensive infrastructure discovery for M&A migration planning using multiple authentication methods to access Azure resources that the Graph API cannot reach.

## Features
- **Multiple Authentication Strategies**: Service Principal, Azure CLI, Managed Identity, Interactive
- **Comprehensive Resource Discovery**: VMs, Storage, Key Vaults, Networks, Databases, Web Apps
- **Migration-Critical Data**: Configurations, dependencies, security settings, access policies
- **Auto-Module Installation**: Automatically installs required Azure PowerShell modules

## Authentication Setup Options

### Option 1: Service Principal (Recommended for Automation)

1. **Create Service Principal in Azure AD:**
   ```bash
   # Using Azure CLI
   az ad sp create-for-rbac --name "MandADiscoveryServicePrincipal" --role "Reader" --scopes "/subscriptions/{subscription-id}"
   ```

2. **Grant Additional Permissions:**
   - **Reader** role on all subscriptions you want to discover
   - **Key Vault Reader** role for Key Vault access
   - **Storage Account Contributor** for storage container enumeration (optional)

3. **Update Credentials File:**
   ```json
   {
     "Azure": {
       "TenantId": "your-tenant-id",
       "ClientId": "your-client-id", 
       "ClientSecret": "your-client-secret"
     }
   }
   ```

### Option 2: Azure CLI Authentication

1. **Install Azure CLI** (if not already installed)
2. **Login to Azure CLI:**
   ```bash
   az login
   az account set --subscription "your-subscription-id"
   ```
3. **Run Discovery:** The module will automatically use CLI tokens

### Option 3: Interactive Authentication

1. **Run with Interactive Flag:**
   ```powershell
   .\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops" -UseInteractive
   ```
2. **Browser Authentication:** Follow browser prompts to authenticate

## Required Azure Permissions

For comprehensive discovery, the authentication principal needs:

### Subscription Level:
- **Reader** - View all resources
- **Security Reader** - Access security configurations

### Resource-Specific:
- **Key Vault Reader** - Access vault policies and metadata
- **Storage Account Key Operator Service Role** - List storage keys (optional)
- **SQL DB Contributor** - Access database configurations (optional)

### Azure AD Level (for enhanced user data):
- **Directory Readers** - Read directory information
- **User.Read.All** - Read user profiles
- **Group.Read.All** - Read group memberships

## Running Enhanced Discovery

### Basic Usage:
```powershell
# Using existing credentials
.\Scripts\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops"

# With specific credentials
.\Scripts\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops" -TenantId "tenant-id" -ClientId "client-id" -ClientSecret "secret"

# Interactive authentication
.\Scripts\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops" -UseInteractive

# Target specific subscription
.\Scripts\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops" -SubscriptionId "subscription-id"
```

## What Gets Discovered

### Azure Infrastructure:
- ✅ **Subscriptions** - All accessible subscriptions
- ✅ **Resource Groups** - Organization and tagging
- ✅ **Virtual Machines** - Sizes, OS, networking, extensions
- ✅ **Storage Accounts** - Types, access policies, containers
- ✅ **Key Vaults** - Policies, secrets count, certificates
- ✅ **Network Security Groups** - Security rules, associations
- ✅ **Virtual Networks** - Subnets, address spaces, DNS
- ✅ **Load Balancers** - Configuration, backend pools
- ✅ **Web Apps** - App Service plans, configurations
- ✅ **SQL Servers** - Databases, versions, security

### Migration-Critical Data:
- **Network Configurations** - For connectivity planning
- **Security Policies** - For compliance requirements  
- **Access Controls** - For permission migration
- **Resource Dependencies** - For migration sequencing
- **Capacity Information** - For sizing new environment
- **Cost Analysis Data** - For budget planning

## Troubleshooting

### Authentication Issues:
1. **Service Principal Errors:**
   - Verify tenant ID, client ID, and secret
   - Check role assignments in Azure Portal
   - Ensure principal has Reader access to subscriptions

2. **Permission Denied:**
   - Add Security Reader role for enhanced data
   - Check subscription access in Azure Portal
   - Verify Key Vault access policies

3. **Module Installation:**
   - Run PowerShell as Administrator if needed
   - Check execution policy: `Set-ExecutionPolicy RemoteSigned`
   - Manual install: `Install-Module Az -Force -AllowClobber`

### Discovery Issues:
1. **No Resources Found:**
   - Verify authentication succeeded
   - Check subscription access
   - Try interactive authentication for testing

2. **Missing Data:**
   - Some resources require additional permissions
   - Check Azure Portal for resource visibility
   - Review authentication principal roles

## Data Output

Discovery data is saved to:
```
C:\DiscoveryData\Profiles\{CompanyName}\Raw\
```

Data includes:
- **Raw JSON files** - Machine-readable resource data
- **CSV exports** - Human-readable summaries  
- **Configuration files** - Resource settings and policies
- **Relationship maps** - Resource dependencies

## Next Steps After Discovery

1. **Review Results** - Use the GUI to browse discovered resources
2. **Export Data** - Generate reports for migration planning
3. **Analyze Dependencies** - Map resource relationships
4. **Plan Migration** - Sequence based on dependencies and criticality
5. **Cost Analysis** - Estimate target environment costs
6. **Security Review** - Plan security control migration

## Security Considerations

- **Credential Storage** - Encrypt credential files using built-in tools
- **Least Privilege** - Use minimum required permissions
- **Audit Trail** - Monitor service principal usage
- **Data Handling** - Secure discovered data appropriately
- **Access Control** - Limit who can run discovery

---

**Need Help?** 
- Check the PowerShell output for detailed error messages
- Review Azure Portal for permission issues
- Test authentication manually using Azure CLI
- Contact your Azure administrator for role assignments
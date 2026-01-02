# RSAT Installation Guide for DNS/DHCP Discovery

## Overview

The DNS/DHCP discovery module requires the **DnsServer** and **DhcpServer** PowerShell modules to discover zones, records, scopes, leases, and advanced configuration. These modules are part of **Remote Server Administration Tools (RSAT)**.

The module will **attempt to auto-install RSAT**, but if that fails, use this guide for manual installation.

---

## Quick Check: Do I Have RSAT Already?

Run this PowerShell command to check:

```powershell
Get-Module -ListAvailable -Name DnsServer, DhcpServer
```

**If you see output**, RSAT is already installed! Discovery will work at 100%.

**If you see nothing**, continue below to install RSAT.

---

## Method 1: PowerShell Installation (Windows 10/11) - RECOMMENDED

**Run PowerShell as Administrator**, then:

### For Windows 10 (version 1809+) and Windows 11:

```powershell
# Check available RSAT capabilities
Get-WindowsCapability -Online -Name 'Rsat.Dns.Tools*'
Get-WindowsCapability -Online -Name 'Rsat.DHCP.Tools*'

# Install DNS RSAT
Add-WindowsCapability -Online -Name 'Rsat.Dns.Tools~~~~0.0.1.0'

# Install DHCP RSAT
Add-WindowsCapability -Online -Name 'Rsat.DHCP.Tools~~~~0.0.1.0'

# Verify installation
Get-Module -ListAvailable -Name DnsServer, DhcpServer
```

**Expected output after verification:**
```
Directory: C:\Windows\system32\WindowsPowerShell\v1.0\Modules

ModuleType Version    Name                                ExportedCommands
---------- -------    ----                                ----------------
Manifest   1.0.0.0    DhcpServer                          {Add-DhcpServer...
Manifest   1.0.0.0    DnsServer                           {Add-DnsServer...
```

---

## Method 2: Windows Settings GUI (Windows 10/11)

1. Open **Settings** (Win + I)
2. Go to **Apps** → **Optional Features**
3. Click **Add a feature**
4. Search for **"RSAT"**
5. Install these two features:
   - **RSAT: DNS Server Tools**
   - **RSAT: DHCP Server Tools**
6. Wait for installation (2-5 minutes)
7. Restart PowerShell and verify:
   ```powershell
   Get-Module -ListAvailable -Name DnsServer, DhcpServer
   ```

---

## Method 3: Server Manager (Windows Server 2016/2019/2022)

**Run PowerShell as Administrator**:

```powershell
# Install both RSAT tools at once
Install-WindowsFeature -Name RSAT-DNS-Server, RSAT-DHCP -IncludeManagementTools

# Verify installation
Get-Module -ListAvailable -Name DnsServer, DhcpServer
```

**OR** use Server Manager GUI:
1. Open **Server Manager**
2. Click **Manage** → **Add Roles and Features**
3. Click **Next** until you reach **Features**
4. Expand **Remote Server Administration Tools** → **Role Administration Tools**
5. Check:
   - **DNS Server Tools** → **DNS Server Module for Windows PowerShell**
   - **DHCP Server Tools** → **DHCP Server Module for Windows PowerShell**
6. Click **Install**

---

## Method 4: Domain Controllers (Already Have RSAT)

If you're running discovery **from a Domain Controller**, the DNS/DHCP modules are **already installed** as part of the DNS/DHCP Server roles.

No additional installation needed - just run discovery!

---

## Troubleshooting

### Issue 1: "Add-WindowsCapability is not recognized"

**Cause**: Older Windows 10 version (pre-1809)

**Solution**: Upgrade to Windows 10 version 1809+ or use the old RSAT MSI installer:
- Download from: https://www.microsoft.com/en-us/download/details.aspx?id=45520
- Install the MSI package
- Restart PowerShell

---

### Issue 2: "Installation failed with error 0x800f0954"

**Cause**: Windows Update blocked or WSUS configuration

**Solution**:
```powershell
# Bypass WSUS and use Windows Update directly
Add-WindowsCapability -Online -Name 'Rsat.Dns.Tools~~~~0.0.1.0' -Source 'https://catalog.update.microsoft.com'
Add-WindowsCapability -Online -Name 'Rsat.DHCP.Tools~~~~0.0.1.0' -Source 'https://catalog.update.microsoft.com'
```

---

### Issue 3: Modules installed but still not detected

**Solution**: Restart PowerShell and re-import:
```powershell
# Close and reopen PowerShell as Administrator
Import-Module DnsServer -Force
Import-Module DhcpServer -Force

# Verify
Get-Module DnsServer, DhcpServer
```

---

### Issue 4: Running on a workstation (not domain-joined)

**Note**: DNS/DHCP discovery is designed for **domain environments**. If you're not domain-joined:

1. You can still install RSAT tools
2. Discovery will be **limited to local network adapter DNS servers**
3. To discover **domain DNS/DHCP infrastructure**, you must:
   - Join the domain, OR
   - Run discovery from a domain-joined machine, OR
   - Configure domain credentials in the profile

---

## What Happens After RSAT Installation?

Once RSAT is installed, the DNS/DHCP discovery module will automatically detect the modules and perform **full discovery**:

### Without RSAT (Limited - 7% Discovery Success):
- ✅ DNS servers from network adapters only
- ❌ No DNS zones
- ❌ No DNS records
- ❌ No DHCP servers, scopes, or leases
- **Result**: 1 CSV file (Network_DNSServers.csv)

### With RSAT (Full - 100% Discovery Success):
- ✅ All DNS servers (DCs with DNS role)
- ✅ DNS zones (primary, secondary, AD-integrated)
- ✅ DNS records (A, AAAA, CNAME, MX, TXT, PTR, etc.)
- ✅ DNS forwarders & conditional forwarders
- ✅ DNS server settings (recursion, cache, etc.)
- ✅ DNS zone aging/scavenging config
- ✅ DHCP servers (authorized in AD)
- ✅ DHCP scopes with utilization stats
- ✅ DHCP leases (active & expired)
- ✅ DHCP reservations
- ✅ DHCP server & scope options
- ✅ DHCP failover relationships
- **Result**: 14 CSV files with complete network infrastructure data

---

## Running Discovery After RSAT Installation

1. **Restart the application** (to reload PowerShell modules)
2. Navigate to **Discovery** → **DNS & DHCP**
3. Click **Start Discovery**
4. Watch the console output - you should see:
   ```
   [DNSDHCP] Checking for required PowerShell modules...
   [DNSDHCP] Module DnsServer is available
   [DNSDHCP] Module DhcpServer is available
   [DNSDHCP] DNS Server module loaded successfully
   [DNSDHCP] DHCP Server module loaded successfully
   [DNSDHCP] Discovering DNS zones...
   [DNSDHCP] Discovered 15 DNS zones
   [DNSDHCP] Discovering DNS records...
   [DNSDHCP] Discovered 2,487 DNS records
   ...
   ```

---

## Need Help?

If you continue to have issues after following this guide:

1. **Check permissions**: Ensure you're running PowerShell **as Administrator**
2. **Check connectivity**: Ensure you can reach domain controllers
3. **Check credentials**: Ensure domain credentials are configured in your profile
4. **Review logs**: Check console output for specific error messages

---

## Summary Commands

```powershell
# Quick install (Windows 10/11)
Add-WindowsCapability -Online -Name 'Rsat.Dns.Tools~~~~0.0.1.0'
Add-WindowsCapability -Online -Name 'Rsat.DHCP.Tools~~~~0.0.1.0'

# Quick install (Windows Server)
Install-WindowsFeature -Name RSAT-DNS-Server, RSAT-DHCP

# Verify
Get-Module -ListAvailable -Name DnsServer, DhcpServer

# Import modules
Import-Module DnsServer, DhcpServer

# Test DNS module
Get-Command -Module DnsServer | Select-Object -First 5

# Test DHCP module
Get-Command -Module DhcpServer | Select-Object -First 5
```

---

**Last Updated**: 2026-01-02
**Module Version**: DNSDHCPDiscovery v2.1.0

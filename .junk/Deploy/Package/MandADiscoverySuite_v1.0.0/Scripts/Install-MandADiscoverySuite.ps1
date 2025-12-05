# M&A Discovery Suite - Installation Script
param(
    [string]$InstallPath = "C:\Program Files\MandADiscoverySuite",
    [string]$DataPath = "c:\discoverydata",
    [string]$ServiceAccount = "NT AUTHORITY\SYSTEM"
)

Write-Host "Installing M&A Discovery Suite..." -ForegroundColor Cyan

# Create installation directories
New-Item -ItemType Directory -Path $InstallPath -Force
New-Item -ItemType Directory -Path $DataPath -Force

# Copy application files
Copy-Item -Path ".\Application\*" -Destination $InstallPath -Recurse -Force
Copy-Item -Path ".\Modules" -Destination $InstallPath -Recurse -Force

# Set permissions
$acl = Get-Acl $DataPath
$permission = "$ServiceAccount","FullControl","ContainerInherit,ObjectInherit","None","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $DataPath $acl

# Create Windows Service (if applicable)
# New-Service -Name "MandADiscovery" -BinaryPath "$InstallPath\MandADiscoverySuite.exe" -DisplayName "M&A Discovery Suite" -StartupType Automatic

Write-Host "Installation completed successfully!" -ForegroundColor Green

#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Enterprise Deployment Tools and SCCM Package Generator

.DESCRIPTION
    Comprehensive enterprise deployment tool generator for M&A Discovery Suite Fortune 500 deployments.
    Creates SCCM packages, Group Policy deployment templates, Docker containers, and enterprise
    configuration management tools for large-scale organizational deployment.

    Features:
    - SCCM application and package creation
    - Group Policy ADMX/ADML templates
    - Docker containerization for modern environments
    - Ansible/Puppet configuration management
    - Kubernetes deployment manifests
    - Enterprise monitoring and compliance tools
    - Silent installation validation
    - Network deployment optimization
    - Inventory and asset management integration

.PARAMETER DeploymentType
    Type of deployment to create (SCCM, GroupPolicy, Docker, Kubernetes, All)

.PARAMETER Version
    Application version for deployment packages

.PARAMETER SourcePath
    Source directory containing application files

.PARAMETER OutputPath
    Output directory for generated deployment packages

.PARAMETER OrganizationName
    Organization name for customization

.PARAMETER DomainName
    Active Directory domain name

.PARAMETER SCCMSiteCode
    SCCM site code for package creation

.PARAMETER CreateDocumentation
    Generate comprehensive deployment documentation

.EXAMPLE
    .\Create-EnterpriseDeploymentTools.ps1 -DeploymentType All -Version "1.0.0" -SourcePath "C:\Build" -OrganizationName "Contoso"

.EXAMPLE
    .\Create-EnterpriseDeploymentTools.ps1 -DeploymentType SCCM -SCCMSiteCode "CON" -CreateDocumentation
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('SCCM', 'GroupPolicy', 'Docker', 'Kubernetes', 'All')]
    [string]$DeploymentType,
    
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$')]
    [string]$Version,
    
    [Parameter(Mandatory = $true)]
    [ValidateScript({Test-Path $_ -PathType Container})]
    [string]$SourcePath,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = ".\Enterprise-Deployment",
    
    [Parameter(Mandatory = $false)]
    [string]$OrganizationName = "Enterprise Organization",
    
    [Parameter(Mandatory = $false)]
    [string]$DomainName = "corp.local",
    
    [Parameter(Mandatory = $false)]
    [string]$SCCMSiteCode = "SMS",
    
    [Parameter(Mandatory = $false)]
    [switch]$CreateDocumentation
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Initialize enterprise deployment framework
$script:DeploymentSession = @{
    SessionId = [Guid]::NewGuid().ToString()
    StartTime = Get-Date
    DeploymentType = $DeploymentType
    Version = $Version
    Organization = $OrganizationName
    Domain = $DomainName
    SCCMSiteCode = $SCCMSiteCode
    PackagesCreated = @()
}

$LogFile = "EnterpriseDeployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$script:LogPath = Join-Path $PSScriptRoot $LogFile

function Write-EnterpriseLog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet('Info', 'Warning', 'Error', 'Success', 'Enterprise')]
        [string]$Level = 'Info'
    )
    
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $SessionInfo = "[$($script:DeploymentSession.SessionId.Substring(0,8))]"
    $LogEntry = "[$Timestamp] $SessionInfo [$Level] $Message"
    
    switch ($Level) {
        'Info'       { Write-Host $LogEntry -ForegroundColor White }
        'Warning'    { Write-Host $LogEntry -ForegroundColor Yellow }
        'Error'      { Write-Host $LogEntry -ForegroundColor Red }
        'Success'    { Write-Host $LogEntry -ForegroundColor Green }
        'Enterprise' { Write-Host $LogEntry -ForegroundColor Cyan }
    }
    
    Add-Content -Path $script:LogPath -Value $LogEntry
}

function Initialize-EnterpriseDeployment {
    Write-EnterpriseLog "Initializing M&A Discovery Suite Enterprise Deployment Tools" -Level 'Enterprise'
    Write-EnterpriseLog "Session ID: $($script:DeploymentSession.SessionId)" -Level 'Info'
    Write-EnterpriseLog "Deployment Type: $DeploymentType" -Level 'Info'
    Write-EnterpriseLog "Version: $Version" -Level 'Info'
    Write-EnterpriseLog "Organization: $OrganizationName" -Level 'Info'
    Write-EnterpriseLog "Domain: $DomainName" -Level 'Info'
    
    # Create output directory structure
    $DirectoryStructure = @(
        'SCCM',
        'SCCM\Applications',
        'SCCM\Packages',
        'SCCM\Collections',
        'SCCM\Reports',
        'GroupPolicy',
        'GroupPolicy\ADMX',
        'GroupPolicy\ADML',
        'GroupPolicy\Scripts',
        'Docker',
        'Docker\Windows',
        'Docker\Linux',
        'Kubernetes',
        'Kubernetes\Manifests',
        'Kubernetes\Helm',
        'Ansible',
        'Ansible\Playbooks',
        'Ansible\Roles',
        'Documentation',
        'Scripts',
        'Testing',
        'Monitoring'
    )
    
    foreach ($Dir in $DirectoryStructure) {
        $DirPath = Join-Path $OutputPath $Dir
        New-Item -Path $DirPath -ItemType Directory -Force | Out-Null
    }
    
    Write-EnterpriseLog "Enterprise deployment structure created: $OutputPath" -Level 'Success'
}

function New-SCCMDeploymentPackage {
    Write-EnterpriseLog "Creating SCCM deployment package..." -Level 'Enterprise'
    
    $SCCMPath = Join-Path $OutputPath 'SCCM'
    
    # Create SCCM Application XML
    $ApplicationXML = @"
<?xml version="1.0" encoding="utf-16"?>
<AppMgmtDigest xmlns="http://schemas.microsoft.com/SystemCenterConfigurationManager/2009/AppMgmtDigest" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Application AuthoringScopeId="ScopeId_$([Guid]::NewGuid().ToString())" LogicalName="Application_$([Guid]::NewGuid().ToString())" xmlns="http://schemas.microsoft.com/SystemCenterConfigurationManager/2009/AppMgmtDigest">
    <DisplayInfo DefaultLanguage="en-US">
      <Info Language="en-US">
        <Title>M&A Discovery Suite</Title>
        <Publisher>$OrganizationName</Publisher>
        <Version>$Version</Version>
        <Description>M&A Discovery Suite - Enterprise IT Integration Platform for merger and acquisition scenarios. Provides comprehensive discovery, planning, and migration capabilities.</Description>
      </Info>
    </DisplayInfo>
    <DeploymentTypes>
      <DeploymentType AuthoringScopeId="ScopeId_$([Guid]::NewGuid().ToString())" LogicalName="DeploymentType_$([Guid]::NewGuid().ToString())" xmlns="http://schemas.microsoft.com/SystemCenterConfigurationManager/2009/AppMgmtDigest">
        <Title ResourceId="Res_427284130">M&A Discovery Suite - MSI</Title>
        <DeploymentTechnology>MSI</DeploymentTechnology>
        <Technology>MSI</Technology>
        <Hosting>Native</Hosting>
        <Installer>
          <InstallAction>
            <Provider>Microsoft.ConfigurationManagement.Installers.MsiInstaller</Provider>
            <Args>
              <Arg Name="InstallCommandLine" Value='msiexec /i "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1 CONFIGURE_FIREWALL=1' />
              <Arg Name="UninstallCommandLine" Value='msiexec /x "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart' />
              <Arg Name="InstallFolder" Value="" />
              <Arg Name="ProductCode" Value="" />
              <Arg Name="ProductName" Value="M&A Discovery Suite" />
              <Arg Name="ProductVersion" Value="$Version" />
            </Args>
          </InstallAction>
        </Installer>
        <DetectionMethods>
          <DetectionMethod>
            <Provider>Microsoft.ConfigurationManagement.DesiredConfigurationManagement</Provider>
            <Args>
              <Arg Name="MethodBody">
                <![CDATA[
                <DetectionMethod xmlns="http://schemas.microsoft.com/SystemCenterConfigurationManager/2009/AppMgmtDigest">
                  <Settings xmlns="http://schemas.microsoft.com/SystemCenterConfigurationManager/2009/AppMgmtDigest">
                    <Registry>
                      <Hive>LocalMachine</Hive>
                      <Key>SOFTWARE\Enterprise MA Solutions\MA Discovery Suite</Key>
                      <ValueName>Version</ValueName>
                      <Detection32On64>false</Detection32On64>
                      <Is64Bit>true</Is64Bit>
                      <SettingDataType>Version</SettingDataType>
                      <Operator>GreaterEquals</Operator>
                      <Value>$Version</Value>
                    </Registry>
                  </Settings>
                </DetectionMethod>
                ]]>
              </Arg>
            </Args>
          </DetectionMethod>
        </DetectionMethods>
        <Requirements>
          <Requirement>
            <Rule>
              <Operator>GreaterEquals</Operator>
              <Operands>
                <SettingReference AuthoringScopeId="ScopeId_$([Guid]::NewGuid().ToString())" LogicalName="Setting_$([Guid]::NewGuid().ToString())" />
                <ConstantValue Value="10.0" DataType="Version" />
              </Operands>
            </Rule>
            <RuleId>Rule_$([Guid]::NewGuid().ToString())</RuleId>
            <NoncomplianceSeverity>Critical</NoncomplianceSeverity>
            <RuleErrorId>0</RuleErrorId>
            <ErrorDescription>Operating system Windows 10 or later is required.</ErrorDescription>
          </Requirement>
          <Requirement>
            <Rule>
              <Operator>GreaterEquals</Operator>
              <Operands>
                <SettingReference AuthoringScopeId="ScopeId_$([Guid]::NewGuid().ToString())" LogicalName="Setting_$([Guid]::NewGuid().ToString())" />
                <ConstantValue Value="4096" DataType="Integer" />
              </Operands>
            </Rule>
            <RuleId>Rule_$([Guid]::NewGuid().ToString())</RuleId>
            <NoncomplianceSeverity>Critical</NoncomplianceSeverity>
            <RuleErrorId>1</RuleErrorId>
            <ErrorDescription>Minimum 4 GB RAM required.</ErrorDescription>
          </Requirement>
        </Requirements>
      </DeploymentType>
    </DeploymentTypes>
  </Application>
</AppMgmtDigest>
"@
    
    $ApplicationXML | Out-File -FilePath (Join-Path $SCCMPath "Applications\MandADiscoverySuite-Application.xml") -Encoding UTF8
    
    # Create SCCM Package Definition
    $PackageDefinition = @"
[Package Definition]
Version=4

[Package Definition - M&A Discovery Suite v$Version]
Name=M&A Discovery Suite
Version=$Version
Language=English
Publisher=$OrganizationName
Comment=M&A Discovery Suite - Enterprise IT Integration Platform
CmdLine=msiexec.exe /i "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1
Icon=MandADiscoverySuite.ico
DefaultProgram=Install - Silent
SetupVariations=Install - Silent,Install - Interactive,Uninstall

[Install - Silent]
Name=Install - Silent
CmdLine=msiexec.exe /i "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1 CONFIGURE_FIREWALL=1
Icon=MandADiscoverySuite.ico
Comment=Silent installation with PowerShell modules and desktop shortcut
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName

[Install - Interactive]
Name=Install - Interactive
CmdLine=msiexec.exe /i "MandADiscoverySuite-v$Version-x64.msi" /passive /norestart
Icon=MandADiscoverySuite.ico
Comment=Interactive installation with progress indication
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName

[Uninstall]
Name=Uninstall
CmdLine=msiexec.exe /x "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart
Icon=MandADiscoverySuite.ico
Comment=Silent uninstallation
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName

[Repair]
Name=Repair
CmdLine=msiexec.exe /fa "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart
Icon=MandADiscoverySuite.ico
Comment=Repair installation
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName
"@
    
    $PackageDefinition | Out-File -FilePath (Join-Path $SCCMPath "Packages\MandADiscoverySuite.sms") -Encoding ASCII
    
    # Create SCCM Collection Query
    $CollectionQuery = @"
-- M&A Discovery Suite Target Collection Query
-- Use this WQL query to create a device collection for deployment targeting

SELECT SMS_R_SYSTEM.ResourceID,
       SMS_R_SYSTEM.ResourceType,
       SMS_R_SYSTEM.Name,
       SMS_R_SYSTEM.SMSUniqueIdentifier,
       SMS_R_SYSTEM.ResourceDomainORWorkgroup,
       SMS_R_SYSTEM.Client
FROM SMS_R_System
INNER JOIN SMS_G_System_OPERATING_SYSTEM ON SMS_G_System_OPERATING_SYSTEM.ResourceId = SMS_R_System.ResourceId
WHERE SMS_G_System_OPERATING_SYSTEM.Version LIKE "10.0%" 
   OR SMS_G_System_OPERATING_SYSTEM.Version LIKE "6.3%" 
   OR SMS_G_System_OPERATING_SYSTEM.Version LIKE "6.1%"
   AND SMS_R_System.Client = 1
   AND SMS_R_System.Obsolete = 0
   AND SMS_R_System.Active = 1
   
-- Additional filters can be added based on your requirements:
-- AND SMS_R_System.ResourceDomainORWorkgroup = "$DomainName"
-- AND SMS_G_System_COMPUTER_SYSTEM.TotalPhysicalMemory >= 4294967296 -- 4GB RAM
"@
    
    $CollectionQuery | Out-File -FilePath (Join-Path $SCCMPath "Collections\MandADiscoverySuite-TargetDevices.wql") -Encoding UTF8
    
    # Create SCCM PowerShell Deployment Script
    $SCCMPowerShellScript = @"
#Requires -Version 5.1
#Requires -Modules ConfigurationManager

<#
.SYNOPSIS
    SCCM Automated Deployment Script for M&A Discovery Suite

.DESCRIPTION
    Automates the creation and deployment of M&A Discovery Suite in SCCM environment.
    Creates application, device collection, and deployment with enterprise configuration.

.PARAMETER SiteCode
    SCCM Site Code

.PARAMETER SourcePath
    UNC path to application source files

.PARAMETER CollectionName
    Name for the target device collection

.PARAMETER DeploymentType
    Deployment purpose (Required, Available)

.EXAMPLE
    .\Deploy-MandADiscoverySuite-SCCM.ps1 -SiteCode "SMS" -SourcePath "\\server\share\MandADiscoverySuite" -DeploymentType Required
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = `$true)]
    [string]`$SiteCode = "$SCCMSiteCode",
    
    [Parameter(Mandatory = `$true)]
    [string]`$SourcePath,
    
    [Parameter(Mandatory = `$false)]
    [string]`$CollectionName = "M&A Discovery Suite - Target Devices",
    
    [Parameter(Mandatory = `$false)]
    [ValidateSet('Required', 'Available')]
    [string]`$DeploymentType = 'Available'
)

Set-StrictMode -Version 3.0
`$ErrorActionPreference = 'Stop'

function Write-SCCMLog {
    param([string]`$Message, [string]`$Level = 'Info')
    `$Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[`$Timestamp] [`$Level] `$Message"
}

try {
    Write-SCCMLog "Starting SCCM deployment for M&A Discovery Suite v$Version"
    
    # Import SCCM PowerShell module
    Import-Module ConfigurationManager -Force
    
    # Connect to SCCM site
    `$SiteDrive = "`$SiteCode" + ":"
    if (!(Get-PSDrive -Name `$SiteCode -PSProvider CMSite -ErrorAction SilentlyContinue)) {
        New-PSDrive -Name `$SiteCode -PSProvider CMSite -Root `$env:SMS_ADMIN_UI_PATH.Substring(0, `$env:SMS_ADMIN_UI_PATH.Length - 5)
    }
    Set-Location `$SiteDrive
    
    Write-SCCMLog "Connected to SCCM site: `$SiteCode"
    
    # Create Application
    `$AppName = "M&A Discovery Suite"
    `$ExistingApp = Get-CMApplication -Name `$AppName -ErrorAction SilentlyContinue
    
    if (`$ExistingApp) {
        Write-SCCMLog "Application already exists, updating..." -Level "Warning"
        Remove-CMApplication -Name `$AppName -Force
    }
    
    Write-SCCMLog "Creating SCCM application..."
    `$Application = New-CMApplication -Name `$AppName -Description "M&A Discovery Suite - Enterprise IT Integration Platform" -SoftwareVersion "$Version" -Publisher "$OrganizationName"
    
    # Add MSI Deployment Type
    Write-SCCMLog "Adding MSI deployment type..."
    Add-CMMsiDeploymentType -ApplicationName `$AppName -DeploymentTypeName "MSI Installer" -ContentLocation `$SourcePath -MsiOrMspFile "MandADiscoverySuite-v$Version-x64.msi" -InstallCommand 'msiexec /i "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1' -UninstallCommand 'msiexec /x "MandADiscoverySuite-v$Version-x64.msi" /quiet /norestart' -LogonRequirementType OnlyWhenUserLoggedOn -UserInteractionMode Hidden -InstallationBehaviorType InstallForSystem -MaximumRuntimeMins 60 -EstimatedRuntimeMins 15
    
    # Create Device Collection
    Write-SCCMLog "Creating device collection..."
    `$ExistingCollection = Get-CMCollection -Name `$CollectionName -ErrorAction SilentlyContinue
    if (`$ExistingCollection) {
        Write-SCCMLog "Collection already exists: `$CollectionName" -Level "Warning"
    } else {
        `$Collection = New-CMDeviceCollection -Name `$CollectionName -Comment "Target devices for M&A Discovery Suite deployment" -LimitingCollectionName "All Desktop and Server Clients"
        
        # Add query membership rule
        `$QueryRule = @"
SELECT SMS_R_SYSTEM.ResourceID, SMS_R_SYSTEM.ResourceType, SMS_R_SYSTEM.Name, SMS_R_SYSTEM.SMSUniqueIdentifier, SMS_R_SYSTEM.ResourceDomainORWorkgroup, SMS_R_SYSTEM.Client FROM SMS_R_System INNER JOIN SMS_G_System_OPERATING_SYSTEM ON SMS_G_System_OPERATING_SYSTEM.ResourceId = SMS_R_System.ResourceId WHERE SMS_G_System_OPERATING_SYSTEM.Version LIKE "10.0%" AND SMS_R_System.Client = 1 AND SMS_R_System.Obsolete = 0 AND SMS_R_System.Active = 1
"@
        Add-CMDeviceCollectionQueryMembershipRule -CollectionName `$CollectionName -QueryExpression `$QueryRule -RuleName "Windows 10 Devices"
    }
    
    # Distribute Content
    Write-SCCMLog "Distributing content to distribution points..."
    `$DistributionPoints = Get-CMDistributionPoint
    foreach (`$DP in `$DistributionPoints) {
        Start-CMContentDistribution -ApplicationName `$AppName -DistributionPointName `$DP.NetworkOSPath
    }
    
    # Create Deployment
    Write-SCCMLog "Creating deployment..."
    `$DeploymentParams = @{
        ApplicationName = `$AppName
        CollectionName = `$CollectionName
        DeployPurpose = `$DeploymentType
        UserNotification = 'DisplaySoftwareCenterOnly'
        TimeBaseOn = 'LocalTime'
        DeployAction = 'Install'
        RebootOutsideServiceWindow = `$false
        UseMeteredNetwork = `$false
    }
    
    if (`$DeploymentType -eq 'Required') {
        `$DeploymentParams.AvailableDateTime = (Get-Date).AddHours(1)
        `$DeploymentParams.DeadlineDateTime = (Get-Date).AddDays(7)
    }
    
    New-CMApplicationDeployment @DeploymentParams
    
    Write-SCCMLog "SCCM deployment completed successfully" -Level "Success"
    Write-SCCMLog "Application: `$AppName"
    Write-SCCMLog "Collection: `$CollectionName"
    Write-SCCMLog "Deployment Type: `$DeploymentType"
    
} catch {
    Write-SCCMLog "SCCM deployment failed: `$(`$_.Exception.Message)" -Level "Error"
    throw
} finally {
    # Return to original location
    Set-Location C:
}
"@
    
    $SCCMPowerShellScript | Out-File -FilePath (Join-Path $SCCMPath "Scripts\Deploy-MandADiscoverySuite-SCCM.ps1") -Encoding UTF8
    
    # Create SCCM Report SQL
    $SCCMReportSQL = @"
-- M&A Discovery Suite Deployment Report
-- Use this SQL query in SCCM Reporting Services to track deployment status

SELECT 
    sys.Name0 AS [Computer Name],
    sys.User_Domain0 AS [Domain],
    sys.User_Name0 AS [User Name],
    os.Caption0 AS [Operating System],
    os.Version0 AS [OS Version],
    CASE 
        WHEN arp.DisplayName0 IS NOT NULL THEN 'Installed'
        WHEN ds.LastStateName = 'Success' THEN 'Install Success'
        WHEN ds.LastStateName = 'Error' THEN 'Install Failed'
        WHEN ds.LastStateName = 'In Progress' THEN 'Installing'
        ELSE 'Not Deployed'
    END AS [Installation Status],
    arp.Version0 AS [Installed Version],
    ds.LastExecutionTime AS [Last Execution],
    ds.LastStateName AS [Last State],
    ds.LastStateChangeTime AS [State Change Time]
FROM v_R_System sys
LEFT JOIN v_GS_OPERATING_SYSTEM os ON sys.ResourceID = os.ResourceID
LEFT JOIN v_Add_Remove_Programs arp ON sys.ResourceID = arp.ResourceID 
    AND arp.DisplayName0 LIKE '%M&A Discovery Suite%'
LEFT JOIN v_AppDeploymentAssetDetails ds ON sys.ResourceID = ds.MachineID
    AND ds.ApplicationName = 'M&A Discovery Suite'
WHERE sys.Client0 = 1 
    AND sys.Obsolete0 = 0
ORDER BY sys.Name0
"@
    
    $SCCMReportSQL | Out-File -FilePath (Join-Path $SCCMPath "Reports\MandADiscoverySuite-DeploymentReport.sql") -Encoding UTF8
    
    Write-EnterpriseLog "SCCM deployment package created successfully" -Level 'Success'
    $script:DeploymentSession.PackagesCreated += "SCCM Application and Package"
}

function New-GroupPolicyDeploymentPackage {
    Write-EnterpriseLog "Creating Group Policy deployment package..." -Level 'Enterprise'
    
    $GPOPath = Join-Path $OutputPath 'GroupPolicy'
    
    # Create ADMX Template
    $ADMX = @"
<?xml version="1.0" encoding="utf-8"?>
<policyDefinitions xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" revision="1.0" schemaVersion="1.0" xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions">
  <policyNamespaces>
    <target prefix="mandadiscovery" namespace="$OrganizationName.MandADiscoverySuite" />
    <using prefix="windows" namespace="Microsoft.Policies.Windows" />
  </policyNamespaces>
  <resources minRequiredRevision="1.0" />
  <categories>
    <category name="MandADiscoveryCategory" displayName="`$(string.MandADiscoveryCategory)">
      <parentCategory ref="windows:WindowsComponents" />
    </category>
    <category name="InstallationCategory" displayName="`$(string.InstallationCategory)">
      <parentCategory ref="mandadiscovery:MandADiscoveryCategory" />
    </category>
    <category name="SecurityCategory" displayName="`$(string.SecurityCategory)">
      <parentCategory ref="mandadiscovery:MandADiscoveryCategory" />
    </category>
    <category name="ConfigurationCategory" displayName="`$(string.ConfigurationCategory)">
      <parentCategory ref="mandadiscovery:MandADiscoveryCategory" />
    </category>
  </categories>
  <policies>
    <!-- Installation Policies -->
    <policy name="AllowInstallation" class="Machine" displayName="`$(string.AllowInstallation)" explainText="`$(string.AllowInstallation_Help)" key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="AllowInstallation">
      <parentCategory ref="mandadiscovery:InstallationCategory" />
      <supportedOn ref="windows:SUPPORTED_WindowsVista" />
      <enabledValue>
        <decimal value="1" />
      </enabledValue>
      <disabledValue>
        <decimal value="0" />
      </disabledValue>
    </policy>
    
    <policy name="InstallationParameters" class="Machine" displayName="`$(string.InstallationParameters)" explainText="`$(string.InstallationParameters_Help)" key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite">
      <parentCategory ref="mandadiscovery:InstallationCategory" />
      <supportedOn ref="windows:SUPPORTED_WindowsVista" />
      <elements>
        <boolean id="InstallPowerShellModules" valueName="InstallPowerShellModules" trueValue="1" falseValue="0">
          <trueList>
            <item key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="INSTALL_POWERSHELL_MODULES">1</item>
          </trueList>
          <falseList>
            <item key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="INSTALL_POWERSHELL_MODULES">0</item>
          </falseList>
        </boolean>
        <boolean id="CreateDesktopShortcut" valueName="CreateDesktopShortcut" trueValue="1" falseValue="0">
          <trueList>
            <item key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="CREATE_DESKTOP_SHORTCUT">1</item>
          </trueList>
          <falseList>
            <item key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="CREATE_DESKTOP_SHORTCUT">0</item>
          </falseList>
        </boolean>
        <boolean id="ConfigureFirewall" valueName="ConfigureFirewall" trueValue="1" falseValue="0">
          <trueList>
            <item key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="CONFIGURE_FIREWALL">1</item>
          </trueList>
          <falseList>
            <item key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="CONFIGURE_FIREWALL">0</item>
          </falseList>
        </boolean>
        <text id="OrganizationName" valueName="OrganizationName" required="false" maxLength="255" />
        <text id="SiteCode" valueName="SiteCode" required="false" maxLength="10" />
      </elements>
    </policy>
    
    <!-- Security Policies -->
    <policy name="PowerShellExecutionPolicy" class="Machine" displayName="`$(string.PowerShellExecutionPolicy)" explainText="`$(string.PowerShellExecutionPolicy_Help)" key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="PowerShellExecutionPolicy">
      <parentCategory ref="mandadiscovery:SecurityCategory" />
      <supportedOn ref="windows:SUPPORTED_WindowsVista" />
      <elements>
        <enum id="ExecutionPolicy" valueName="PowerShellExecutionPolicy" required="true">
          <item displayName="`$(string.ExecutionPolicy_RemoteSigned)">
            <value>
              <string>RemoteSigned</string>
            </value>
          </item>
          <item displayName="`$(string.ExecutionPolicy_AllSigned)">
            <value>
              <string>AllSigned</string>
            </value>
          </item>
          <item displayName="`$(string.ExecutionPolicy_Restricted)">
            <value>
              <string>Restricted</string>
            </value>
          </item>
        </enum>
      </elements>
    </policy>
    
    <policy name="AllowDataCollection" class="Machine" displayName="`$(string.AllowDataCollection)" explainText="`$(string.AllowDataCollection_Help)" key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite" valueName="AllowDataCollection">
      <parentCategory ref="mandadiscovery:SecurityCategory" />
      <supportedOn ref="windows:SUPPORTED_WindowsVista" />
      <enabledValue>
        <decimal value="1" />
      </enabledValue>
      <disabledValue>
        <decimal value="0" />
      </disabledValue>
    </policy>
    
    <!-- Configuration Policies -->
    <policy name="DefaultConfiguration" class="Machine" displayName="`$(string.DefaultConfiguration)" explainText="`$(string.DefaultConfiguration_Help)" key="SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite">
      <parentCategory ref="mandadiscovery:ConfigurationCategory" />
      <supportedOn ref="windows:SUPPORTED_WindowsVista" />
      <elements>
        <text id="CompanyName" valueName="DefaultCompanyName" required="false" maxLength="255" />
        <text id="Domain" valueName="DefaultDomain" required="false" maxLength="255" />
        <text id="ConfigurationServer" valueName="ConfigurationServer" required="false" maxLength="255" />
        <decimal id="LogLevel" valueName="LogLevel" minValue="1" maxValue="5" />
        <boolean id="AutoUpdate" valueName="AutoUpdate" trueValue="1" falseValue="0" />
      </elements>
    </policy>
  </policies>
</policyDefinitions>
"@
    
    $ADMX | Out-File -FilePath (Join-Path $GPOPath "ADMX\MandADiscoverySuite.admx") -Encoding UTF8
    
    # Create ADML Language File (English)
    $ADML = @"
<?xml version="1.0" encoding="utf-8"?>
<policyDefinitionResources xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" revision="1.0" schemaVersion="1.0" xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions">
  <displayName>M&A Discovery Suite Group Policy Definitions</displayName>
  <description>Group Policy administrative template for M&A Discovery Suite enterprise deployment and configuration management.</description>
  <resources>
    <stringTable>
      <!-- Categories -->
      <string id="MandADiscoveryCategory">M&A Discovery Suite</string>
      <string id="InstallationCategory">Installation</string>
      <string id="SecurityCategory">Security</string>
      <string id="ConfigurationCategory">Configuration</string>
      
      <!-- Installation Policies -->
      <string id="AllowInstallation">Allow M&A Discovery Suite Installation</string>
      <string id="AllowInstallation_Help">This policy setting determines whether M&A Discovery Suite can be installed on this computer.

If you enable this policy setting, M&A Discovery Suite can be installed on this computer.

If you disable this policy setting, M&A Discovery Suite cannot be installed on this computer.

If you do not configure this policy setting, the default behavior applies.</string>
      
      <string id="InstallationParameters">Installation Parameters</string>
      <string id="InstallationParameters_Help">This policy setting allows you to configure installation parameters for M&A Discovery Suite.

You can specify:
- Whether to install PowerShell modules for all users
- Whether to create desktop shortcuts
- Whether to configure Windows Firewall automatically
- Organization name for customization
- Site code for enterprise deployment

These settings will be applied during MSI installation.</string>
      
      <!-- Security Policies -->
      <string id="PowerShellExecutionPolicy">PowerShell Execution Policy</string>
      <string id="PowerShellExecutionPolicy_Help">This policy setting determines the PowerShell execution policy for M&A Discovery Suite PowerShell modules.

RemoteSigned: Allows local scripts and signed remote scripts
AllSigned: Requires all scripts to be digitally signed
Restricted: No scripts can be executed

Recommended setting: RemoteSigned for enterprise environments with proper code signing infrastructure.</string>
      
      <string id="ExecutionPolicy_RemoteSigned">RemoteSigned - Allow local scripts and signed remote scripts</string>
      <string id="ExecutionPolicy_AllSigned">AllSigned - Require all scripts to be digitally signed</string>
      <string id="ExecutionPolicy_Restricted">Restricted - No scripts allowed</string>
      
      <string id="AllowDataCollection">Allow Data Collection</string>
      <string id="AllowDataCollection_Help">This policy setting determines whether M&A Discovery Suite can collect system information for discovery purposes.

If you enable this policy setting, M&A Discovery Suite can perform discovery operations to collect system information.

If you disable this policy setting, M&A Discovery Suite cannot perform discovery operations.

Note: Disabling this setting may limit the functionality of the application.</string>
      
      <!-- Configuration Policies -->
      <string id="DefaultConfiguration">Default Configuration Settings</string>
      <string id="DefaultConfiguration_Help">This policy setting allows you to configure default settings for M&A Discovery Suite.

You can specify:
- Default company name for discovery operations
- Default domain for Active Directory operations
- Configuration server for centralized settings
- Logging level (1=Error, 2=Warning, 3=Information, 4=Verbose, 5=Debug)
- Automatic updates enabled/disabled

These settings will be applied as defaults when users launch the application.</string>
    </stringTable>
  </resources>
</policyDefinitionResources>
"@
    
    $ADML | Out-File -FilePath (Join-Path $GPOPath "ADML\en-US\MandADiscoverySuite.adml") -Encoding UTF8 -Force
    
    # Create directory for ADML language files
    New-Item -Path (Join-Path $GPOPath "ADML\en-US") -ItemType Directory -Force | Out-Null
    
    # Create Group Policy deployment script
    $GPODeploymentScript = @"
#Requires -Version 5.1
#Requires -RunAsAdministrator
#Requires -Modules GroupPolicy

<#
.SYNOPSIS
    Group Policy Deployment Script for M&A Discovery Suite

.DESCRIPTION
    Creates and configures Group Policy Objects for enterprise deployment of M&A Discovery Suite.
    Includes software installation policy, administrative templates, and security configuration.

.PARAMETER GPOName
    Name for the Group Policy Object

.PARAMETER TargetOU
    Organizational Unit to link the GPO

.PARAMETER SourcePath
    UNC path to MSI package and installation files

.PARAMETER DomainController
    Domain controller to use for GPO operations

.EXAMPLE
    .\Deploy-MandADiscoverySuite-GPO.ps1 -GPOName "M&A Discovery Suite Deployment" -TargetOU "OU=Workstations,DC=corp,DC=local" -SourcePath "\\server\share\MandADiscoverySuite"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = `$false)]
    [string]`$GPOName = "M&A Discovery Suite - Deployment",
    
    [Parameter(Mandatory = `$true)]
    [string]`$TargetOU,
    
    [Parameter(Mandatory = `$true)]
    [string]`$SourcePath,
    
    [Parameter(Mandatory = `$false)]
    [string]`$DomainController = `$env:LOGONSERVER.TrimStart('\\')
)

Set-StrictMode -Version 3.0
`$ErrorActionPreference = 'Stop'

function Write-GPOLog {
    param([string]`$Message, [string]`$Level = 'Info')
    `$Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[`$Timestamp] [`$Level] `$Message"
}

try {
    Write-GPOLog "Starting Group Policy deployment for M&A Discovery Suite v$Version"
    
    # Import Group Policy module
    Import-Module GroupPolicy -Force
    
    # Check if GPO already exists
    `$ExistingGPO = Get-GPO -Name `$GPOName -ErrorAction SilentlyContinue
    if (`$ExistingGPO) {
        Write-GPOLog "GPO already exists: `$GPOName" -Level "Warning"
        Write-GPOLog "Removing existing GPO..." -Level "Warning"
        Remove-GPO -Name `$GPOName -Confirm:`$false
    }
    
    # Create new GPO
    Write-GPOLog "Creating Group Policy Object: `$GPOName"
    `$GPO = New-GPO -Name `$GPOName -Comment "M&A Discovery Suite v$Version enterprise deployment policy"
    
    # Configure Software Installation
    Write-GPOLog "Configuring software installation policy..."
    `$MSIPath = Join-Path `$SourcePath "MandADiscoverySuite-v$Version-x64.msi"
    
    # Note: Set-GPSoftwareInstallation is not available in standard PowerShell
    # Alternative approach using registry settings
    `$RegPath = "HKLM\SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite"
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "MSIPath" -Value `$MSIPath -Type String
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "Version" -Value "$Version" -Type String
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "InstallParameters" -Value "/quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1" -Type String
    
    # Configure PowerShell execution policy
    Write-GPOLog "Configuring PowerShell execution policy..."
    Set-GPRegistryValue -Name `$GPOName -Key "HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell" -ValueName "ExecutionPolicy" -Value "RemoteSigned" -Type String
    
    # Configure application-specific settings
    Write-GPOLog "Configuring application settings..."
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "AllowInstallation" -Value 1 -Type DWord
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "AllowDataCollection" -Value 1 -Type DWord
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "DefaultCompanyName" -Value "$OrganizationName" -Type String
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "DefaultDomain" -Value "$DomainName" -Type String
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "LogLevel" -Value 3 -Type DWord
    Set-GPRegistryValue -Name `$GPOName -Key `$RegPath -ValueName "AutoUpdate" -Value 0 -Type DWord
    
    # Create startup script for installation
    `$StartupScript = @"
@echo off
REM M&A Discovery Suite Installation Script
REM Deployed via Group Policy

echo Installing M&A Discovery Suite v$Version...

REM Check if already installed
reg query "HKLM\SOFTWARE\Enterprise MA Solutions\MA Discovery Suite" /v Version 2>nul
if %ERRORLEVEL% EQU 0 (
    echo M&A Discovery Suite is already installed.
    exit /b 0
)

REM Install from network location
if exist "`$MSIPath" (
    echo Installing from: `$MSIPath
    msiexec.exe /i "`$MSIPath" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1 CONFIGURE_FIREWALL=1 /l*v "%WINDIR%\Logs\MandADiscovery-GPO-Install.log"
    if %ERRORLEVEL% EQU 0 (
        echo Installation completed successfully.
    ) else (
        echo Installation failed with error code: %ERRORLEVEL%
    )
) else (
    echo Error: MSI package not found at: `$MSIPath
    exit /b 1
)
"@
    
    # Save startup script
    `$ScriptPath = Join-Path `$env:TEMP "MandADiscoverySuite-Install.cmd"
    `$StartupScript | Out-File -FilePath `$ScriptPath -Encoding ASCII
    
    # Add startup script to GPO (Note: This requires additional configuration via GPMC)
    Write-GPOLog "Startup script created: `$ScriptPath"
    Write-GPOLog "Note: Startup script must be manually added to GPO via Group Policy Management Console"
    
    # Link GPO to OU
    Write-GPOLog "Linking GPO to OU: `$TargetOU"
    New-GPLink -Name `$GPOName -Target `$TargetOU -LinkEnabled Yes
    
    # Generate GPO report
    `$ReportPath = Join-Path `$env:TEMP "`$GPOName-Report.html"
    Get-GPOReport -Name `$GPOName -ReportType Html -Path `$ReportPath
    
    Write-GPOLog "Group Policy deployment completed successfully" -Level "Success"
    Write-GPOLog "GPO Name: `$GPOName"
    Write-GPOLog "Target OU: `$TargetOU"
    Write-GPOLog "Source Path: `$SourcePath"
    Write-GPOLog "Report: `$ReportPath"
    
    Write-GPOLog ""
    Write-GPOLog "Next Steps:"
    Write-GPOLog "1. Copy ADMX/ADML files to PolicyDefinitions store"
    Write-GPOLog "2. Configure software installation via GPMC if needed"
    Write-GPOLog "3. Add startup script via GPMC: Computer Configuration > Policies > Windows Settings > Scripts"
    Write-GPOLog "4. Run 'gpupdate /force' on target computers to apply policy"
    
} catch {
    Write-GPOLog "Group Policy deployment failed: `$(`$_.Exception.Message)" -Level "Error"
    throw
}
"@
    
    $GPODeploymentScript | Out-File -FilePath (Join-Path $GPOPath "Scripts\Deploy-MandADiscoverySuite-GPO.ps1") -Encoding UTF8
    
    Write-EnterpriseLog "Group Policy deployment package created successfully" -Level 'Success'
    $script:DeploymentSession.PackagesCreated += "Group Policy ADMX/ADML Templates"
}

function New-DockerDeploymentPackage {
    Write-EnterpriseLog "Creating Docker deployment package..." -Level 'Enterprise'
    
    $DockerPath = Join-Path $OutputPath 'Docker'
    
    # Create Windows Dockerfile
    $WindowsDockerfile = @"
# M&A Discovery Suite - Windows Container
# Base image with .NET 6 Runtime
FROM mcr.microsoft.com/dotnet/runtime:6.0-windowsservercore-ltsc2022

# Set metadata
LABEL maintainer="$OrganizationName" \
      description="M&A Discovery Suite - Enterprise IT Integration Platform" \
      version="$Version"

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN powershell -Command \
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force; \
    if (!(Get-WindowsFeature -Name PowerShell-ISE).InstallState -eq 'Installed') { \
        Install-WindowsFeature -Name PowerShell-ISE \
    }

# Configure PowerShell execution policy
RUN powershell -Command Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force

# Create data directories
RUN powershell -Command \
    New-Item -Path 'C:\DiscoveryData' -ItemType Directory -Force; \
    New-Item -Path 'C:\ProgramData\Enterprise MA Solutions\MA Discovery Suite\Logs' -ItemType Directory -Force

# Set environment variables
ENV MANDADISCOVERY_INSTALL_PATH=/app
ENV MANDADISCOVERY_DATA_PATH=c:/discoverydata
ENV DOTNET_ENVIRONMENT=Production

# Expose ports (if applicable)
EXPOSE 8080 8443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD powershell -Command "try { Get-Process -Name 'MandADiscoverySuite' -ErrorAction Stop; exit 0 } catch { exit 1 }"

# Entry point
ENTRYPOINT ["MandADiscoverySuite.exe"]
CMD []
"@
    
    $WindowsDockerfile | Out-File -FilePath (Join-Path $DockerPath "Windows\Dockerfile") -Encoding UTF8
    
    # Create Linux Dockerfile (if cross-platform support needed)
    $LinuxDockerfile = @"
# M&A Discovery Suite - Linux Container (Cross-platform support)
# Base image with .NET 6 Runtime
FROM mcr.microsoft.com/dotnet/runtime:6.0-alpine

# Set metadata
LABEL maintainer="$OrganizationName" \
      description="M&A Discovery Suite - Enterprise IT Integration Platform (Linux)" \
      version="$Version"

# Install required packages
RUN apk add --no-cache \
    curl \
    bash \
    powershell

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Create data directories
RUN mkdir -p /app/data /app/logs /app/config

# Set permissions
RUN chmod +x /app/MandADiscoverySuite || true

# Set environment variables
ENV MANDADISCOVERY_INSTALL_PATH=/app
ENV MANDADISCOVERY_DATA_PATH=/app/data
ENV DOTNET_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://*:8080

# Expose ports
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "MandADiscoverySuite.dll"]
"@
    
    $LinuxDockerfile | Out-File -FilePath (Join-Path $DockerPath "Linux\Dockerfile") -Encoding UTF8
    
    # Create Docker Compose file
    $DockerCompose = @"
version: '3.8'

services:
  mandadiscovery:
    build:
      context: .
      dockerfile: Windows/Dockerfile
    image: $($OrganizationName.ToLower().Replace(' ', ''))/mandadiscovery:$Version
    container_name: mandadiscovery-suite
    restart: unless-stopped
    environment:
      - MANDADISCOVERY_INSTALL_PATH=/app
      - MANDADISCOVERY_DATA_PATH=/app/data
      - DOTNET_ENVIRONMENT=Production
      - TZ=UTC
    volumes:
      - mandadiscovery_data:/app/data
      - mandadiscovery_logs:/app/logs
      - mandadiscovery_config:/app/config
    ports:
      - "8080:8080"
      - "8443:8443"
    networks:
      - mandadiscovery_network
    healthcheck:
      test: ["CMD", "powershell", "-Command", "Get-Process -Name 'MandADiscoverySuite' -ErrorAction SilentlyContinue"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Optional: Add supporting services
  # postgres:
  #   image: postgres:13-alpine
  #   container_name: mandadiscovery-db
  #   restart: unless-stopped
  #   environment:
  #     - POSTGRES_DB=mandadiscovery
  #     - POSTGRES_USER=mandauser
  #     - POSTGRES_PASSWORD=securepassword
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   networks:
  #     - mandadiscovery_network

volumes:
  mandadiscovery_data:
    driver: local
  mandadiscovery_logs:
    driver: local
  mandadiscovery_config:
    driver: local
  # postgres_data:
  #   driver: local

networks:
  mandadiscovery_network:
    driver: bridge
"@
    
    $DockerCompose | Out-File -FilePath (Join-Path $DockerPath "docker-compose.yml") -Encoding UTF8
    
    # Create Docker build script
    $DockerBuildScript = @"
#!/bin/bash
# M&A Discovery Suite Docker Build Script

set -e

# Variables
IMAGE_NAME="$($OrganizationName.ToLower().Replace(' ', ''))/mandadiscovery"
VERSION="$Version"
BUILD_CONTEXT="."
DOCKERFILE_WINDOWS="Windows/Dockerfile"
DOCKERFILE_LINUX="Linux/Dockerfile"

echo "Building M&A Discovery Suite Docker Images v`$VERSION"
echo "=============================================="

# Build Windows image
echo "Building Windows container image..."
docker build -f `$DOCKERFILE_WINDOWS -t `$IMAGE_NAME:windows-`$VERSION -t `$IMAGE_NAME:windows-latest `$BUILD_CONTEXT

# Build Linux image
echo "Building Linux container image..."
docker build -f `$DOCKERFILE_LINUX -t `$IMAGE_NAME:linux-`$VERSION -t `$IMAGE_NAME:linux-latest `$BUILD_CONTEXT

# Create multi-arch manifest (if supported)
echo "Creating multi-architecture manifest..."
docker manifest create `$IMAGE_NAME:`$VERSION \
    `$IMAGE_NAME:windows-`$VERSION \
    `$IMAGE_NAME:linux-`$VERSION

docker manifest create `$IMAGE_NAME:latest \
    `$IMAGE_NAME:windows-latest \
    `$IMAGE_NAME:linux-latest

echo "Docker build completed successfully!"
echo "Images created:"
echo "  - `$IMAGE_NAME:windows-`$VERSION"
echo "  - `$IMAGE_NAME:linux-`$VERSION"
echo "  - `$IMAGE_NAME:`$VERSION (multi-arch)"
echo "  - `$IMAGE_NAME:latest (multi-arch)"

echo ""
echo "To run the container:"
echo "  docker-compose up -d"
echo ""
echo "To push to registry:"
echo "  docker push `$IMAGE_NAME:`$VERSION"
echo "  docker push `$IMAGE_NAME:latest"
"@
    
    $DockerBuildScript | Out-File -FilePath (Join-Path $DockerPath "build.sh") -Encoding UTF8
    
    # Create PowerShell build script for Windows
    $DockerBuildPS1 = @"
#Requires -Version 5.1

<#
.SYNOPSIS
    Docker Build Script for M&A Discovery Suite

.DESCRIPTION
    Builds Docker containers for M&A Discovery Suite with support for Windows and Linux platforms.

.PARAMETER Platform
    Target platform (Windows, Linux, All)

.PARAMETER Registry
    Docker registry to tag images for

.PARAMETER Push
    Push images to registry after build

.EXAMPLE
    .\build.ps1 -Platform All -Registry myregistry.azurecr.io -Push
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = `$false)]
    [ValidateSet('Windows', 'Linux', 'All')]
    [string]`$Platform = 'Windows',
    
    [Parameter(Mandatory = `$false)]
    [string]`$Registry,
    
    [Parameter(Mandatory = `$false)]
    [switch]`$Push
)

Set-StrictMode -Version 3.0
`$ErrorActionPreference = 'Stop'

# Variables
`$ImageName = "$($OrganizationName.ToLower().Replace(' ', ''))/mandadiscovery"
`$Version = "$Version"
`$BuildContext = "."

Write-Host "Building M&A Discovery Suite Docker Images v`$Version" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

try {
    # Build Windows image
    if (`$Platform -in @('Windows', 'All')) {
        Write-Host "Building Windows container image..." -ForegroundColor Cyan
        `$WindowsTag = "`$ImageName`:windows-`$Version"
        `$WindowsLatest = "`$ImageName`:windows-latest"
        
        if (`$Registry) {
            `$WindowsTag = "`$Registry/`$WindowsTag"
            `$WindowsLatest = "`$Registry/`$WindowsLatest"
        }
        
        & docker build -f "Windows/Dockerfile" -t `$WindowsTag -t `$WindowsLatest `$BuildContext
        if (`$LASTEXITCODE -ne 0) { throw "Windows build failed" }
        
        Write-Host "Windows image built: `$WindowsTag" -ForegroundColor Green
    }
    
    # Build Linux image
    if (`$Platform -in @('Linux', 'All')) {
        Write-Host "Building Linux container image..." -ForegroundColor Cyan
        `$LinuxTag = "`$ImageName`:linux-`$Version"
        `$LinuxLatest = "`$ImageName`:linux-latest"
        
        if (`$Registry) {
            `$LinuxTag = "`$Registry/`$LinuxTag"
            `$LinuxLatest = "`$Registry/`$LinuxLatest"
        }
        
        & docker build -f "Linux/Dockerfile" -t `$LinuxTag -t `$LinuxLatest `$BuildContext
        if (`$LASTEXITCODE -ne 0) { throw "Linux build failed" }
        
        Write-Host "Linux image built: `$LinuxTag" -ForegroundColor Green
    }
    
    # Create multi-arch manifest
    if (`$Platform -eq 'All') {
        Write-Host "Creating multi-architecture manifest..." -ForegroundColor Cyan
        
        `$ManifestTag = "`$ImageName`:`$Version"
        `$ManifestLatest = "`$ImageName`:latest"
        
        if (`$Registry) {
            `$ManifestTag = "`$Registry/`$ManifestTag"
            `$ManifestLatest = "`$Registry/`$ManifestLatest"
        }
        
        # Note: Manifest creation requires experimental features enabled
        `$env:DOCKER_CLI_EXPERIMENTAL = "enabled"
        
        & docker manifest create `$ManifestTag `$WindowsTag `$LinuxTag
        & docker manifest create `$ManifestLatest `$WindowsLatest `$LinuxLatest
        
        Write-Host "Multi-arch manifest created: `$ManifestTag" -ForegroundColor Green
    }
    
    # Push images
    if (`$Push -and `$Registry) {
        Write-Host "Pushing images to registry..." -ForegroundColor Cyan
        
        if (`$Platform -in @('Windows', 'All')) {
            & docker push `$WindowsTag
            & docker push `$WindowsLatest
        }
        
        if (`$Platform -in @('Linux', 'All')) {
            & docker push `$LinuxTag
            & docker push `$LinuxLatest
        }
        
        if (`$Platform -eq 'All') {
            & docker manifest push `$ManifestTag
            & docker manifest push `$ManifestLatest
        }
        
        Write-Host "Images pushed successfully!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Docker build completed successfully!" -ForegroundColor Green
    Write-Host "To run the container:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor White
    
} catch {
    Write-Host "Docker build failed: `$(`$_.Exception.Message)" -ForegroundColor Red
    exit 1
}
"@
    
    $DockerBuildPS1 | Out-File -FilePath (Join-Path $DockerPath "build.ps1") -Encoding UTF8
    
    Write-EnterpriseLog "Docker deployment package created successfully" -Level 'Success'
    $script:DeploymentSession.PackagesCreated += "Docker Windows and Linux Containers"
}

function New-KubernetesDeploymentPackage {
    Write-EnterpriseLog "Creating Kubernetes deployment package..." -Level 'Enterprise'
    
    $K8sPath = Join-Path $OutputPath 'Kubernetes'
    
    # Create Kubernetes Deployment Manifest
    $K8sDeployment = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mandadiscovery-suite
  namespace: default
  labels:
    app: mandadiscovery-suite
    version: $Version
    component: enterprise-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mandadiscovery-suite
  template:
    metadata:
      labels:
        app: mandadiscovery-suite
        version: $Version
    spec:
      containers:
      - name: mandadiscovery-suite
        image: $($OrganizationName.ToLower().Replace(' ', ''))/mandadiscovery:$Version
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 8443
          name: https
        env:
        - name: MANDADISCOVERY_INSTALL_PATH
          value: "/app"
        - name: MANDADISCOVERY_DATA_PATH
          value: "/app/data"
        - name: DOTNET_ENVIRONMENT
          value: "Production"
        - name: ASPNETCORE_URLS
          value: "http://*:8080;https://*:8443"
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        volumeMounts:
        - name: data-storage
          mountPath: /app/data
        - name: logs-storage
          mountPath: /app/logs
        - name: config-storage
          mountPath: /app/config
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
      volumes:
      - name: data-storage
        persistentVolumeClaim:
          claimName: mandadiscovery-data-pvc
      - name: logs-storage
        persistentVolumeClaim:
          claimName: mandadiscovery-logs-pvc
      - name: config-storage
        configMap:
          name: mandadiscovery-config
      nodeSelector:
        kubernetes.io/os: windows
      tolerations:
      - key: "kubernetes.io/os"
        operator: "Equal"
        value: "windows"
        effect: "NoSchedule"
---
apiVersion: v1
kind: Service
metadata:
  name: mandadiscovery-service
  namespace: default
  labels:
    app: mandadiscovery-suite
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  - port: 443
    targetPort: 8443
    protocol: TCP
    name: https
  selector:
    app: mandadiscovery-suite
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mandadiscovery-data-pvc
  namespace: default
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mandadiscovery-logs-pvc
  namespace: default
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: mandadiscovery-config
  namespace: default
data:
  appsettings.json: |
    {
      "ApplicationSettings": {
        "OrganizationName": "$OrganizationName",
        "Environment": "Production",
        "LogLevel": "Information"
      },
      "ConnectionStrings": {
        "DefaultConnection": "Server=mandadiscovery-db;Database=MandADiscovery;Integrated Security=false;User Id=mandauser;Password=SecurePassword123!;"
      },
      "FeatureFlags": {
        "EnableDataCollection": true,
        "EnableAutoUpdate": false,
        "EnableTelemetry": true
      }
    }
  suite-config.json: |
    {
      "CompanyName": "$OrganizationName",
      "Domain": "$DomainName",
      "Version": "$Version",
      "DeploymentType": "Kubernetes",
      "UpdatedBy": "Enterprise Deployment",
      "UpdatedDate": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
    }
"@
    
    $K8sDeployment | Out-File -FilePath (Join-Path $K8sPath "Manifests\deployment.yaml") -Encoding UTF8
    
    # Create Ingress Configuration
    $K8sIngress = @"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mandadiscovery-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - mandadiscovery.$DomainName
    secretName: mandadiscovery-tls
  rules:
  - host: mandadiscovery.$DomainName
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mandadiscovery-service
            port:
              number: 80
"@
    
    $K8sIngress | Out-File -FilePath (Join-Path $K8sPath "Manifests\ingress.yaml") -Encoding UTF8
    
    # Create Helm Chart
    $HelmChartYaml = @"
apiVersion: v2
name: mandadiscovery-suite
description: M&A Discovery Suite - Enterprise IT Integration Platform
version: $Version
appVersion: $Version
home: https://$($DomainName.ToLower())/mandadiscovery
sources:
- https://github.com/$($OrganizationName.ToLower().Replace(' ', '-'))/mandadiscovery-suite
maintainers:
- name: $OrganizationName IT Team
  email: it-support@$($DomainName.ToLower())
keywords:
- enterprise
- migration
- discovery
- integration
type: application
"@
    
    $HelmChartYaml | Out-File -FilePath (Join-Path $K8sPath "Helm\mandadiscovery-suite\Chart.yaml") -Encoding UTF8
    
    # Create Helm Values
    $HelmValues = @"
# M&A Discovery Suite Helm Chart Values
# Enterprise Configuration for $OrganizationName

replicaCount: 3

image:
  repository: $($OrganizationName.ToLower().Replace(' ', ''))/mandadiscovery
  tag: $Version
  pullPolicy: Always

nameOverride: ""
fullnameOverride: "mandadiscovery-suite"

service:
  type: LoadBalancer
  port: 80
  httpsPort: 443

ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: mandadiscovery.$DomainName
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: mandadiscovery-tls
      hosts:
        - mandadiscovery.$DomainName

resources:
  limits:
    cpu: 2000m
    memory: 4Gi
  requests:
    cpu: 500m
    memory: 1Gi

persistence:
  enabled: true
  storageClass: fast-ssd
  dataSize: 10Gi
  logsSize: 5Gi

configuration:
  organizationName: "$OrganizationName"
  domain: "$DomainName"
  environment: "Production"
  logLevel: "Information"
  enableDataCollection: true
  enableAutoUpdate: false
  enableTelemetry: true

nodeSelector:
  kubernetes.io/os: windows

tolerations:
  - key: "kubernetes.io/os"
    operator: "Equal"
    value: "windows"
    effect: "NoSchedule"

affinity: {}

# Database configuration (if external database is used)
database:
  enabled: false
  host: mandadiscovery-db
  name: MandADiscovery
  user: mandauser
  password: SecurePassword123!

# Monitoring and observability
monitoring:
  enabled: true
  prometheus:
    enabled: true
    port: 9090
  grafana:
    enabled: true
    dashboards: true
"@
    
    $HelmValues | Out-File -FilePath (Join-Path $K8sPath "Helm\mandadiscovery-suite\values.yaml") -Encoding UTF8
    
    # Create Kubernetes deployment script
    $K8sDeployScript = @"
#!/bin/bash
# Kubernetes Deployment Script for M&A Discovery Suite

set -e

# Configuration
NAMESPACE="\${NAMESPACE:-default}"
HELM_RELEASE_NAME="\${HELM_RELEASE_NAME:-mandadiscovery-suite}"
KUBECTL_CONTEXT="\${KUBECTL_CONTEXT:-}"

echo "Deploying M&A Discovery Suite v$Version to Kubernetes"
echo "====================================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if helm is available
if ! command -v helm &> /dev/null; then
    echo "Error: helm is not installed or not in PATH"
    exit 1
fi

# Set context if provided
if [ -n "`$KUBECTL_CONTEXT" ]; then
    echo "Setting kubectl context to: `$KUBECTL_CONTEXT"
    kubectl config use-context `$KUBECTL_CONTEXT
fi

# Create namespace if it doesn't exist
echo "Ensuring namespace exists: `$NAMESPACE"
kubectl create namespace `$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy using Helm
echo "Deploying with Helm..."
helm upgrade --install `$HELM_RELEASE_NAME ./Helm/mandadiscovery-suite \
    --namespace `$NAMESPACE \
    --create-namespace \
    --wait \
    --timeout 10m

# Check deployment status
echo "Checking deployment status..."
kubectl rollout status deployment/mandadiscovery-suite -n `$NAMESPACE --timeout=300s

# Display service information
echo "Deployment completed successfully!"
echo ""
echo "Service Information:"
kubectl get services -n `$NAMESPACE -l app=mandadiscovery-suite

echo ""
echo "Pod Status:"
kubectl get pods -n `$NAMESPACE -l app=mandadiscovery-suite

echo ""
echo "To access the application:"
echo "  kubectl port-forward svc/mandadiscovery-service 8080:80 -n `$NAMESPACE"
echo ""
echo "To check logs:"
echo "  kubectl logs -f deployment/mandadiscovery-suite -n `$NAMESPACE"
"@
    
    $K8sDeployScript | Out-File -FilePath (Join-Path $K8sPath "deploy.sh") -Encoding UTF8
    
    # Create necessary directories for Helm chart
    New-Item -Path (Join-Path $K8sPath "Helm\mandadiscovery-suite\templates") -ItemType Directory -Force | Out-Null
    
    Write-EnterpriseLog "Kubernetes deployment package created successfully" -Level 'Success'
    $script:DeploymentSession.PackagesCreated += "Kubernetes Manifests and Helm Chart"
}

function New-EnterpriseDocumentation {
    if (-not $CreateDocumentation) {
        return
    }
    
    Write-EnterpriseLog "Generating enterprise deployment documentation..." -Level 'Enterprise'
    
    $DocsPath = Join-Path $OutputPath 'Documentation'
    
    # Create comprehensive deployment guide
    $DeploymentGuide = @"
# M&A Discovery Suite - Enterprise Deployment Guide

## Overview
This document provides comprehensive deployment guidance for M&A Discovery Suite v$Version in enterprise environments. The platform supports multiple deployment scenarios including SCCM, Group Policy, Docker containers, and Kubernetes orchestration.

## Generated Deployment Packages

The following deployment packages have been created:

$($script:DeploymentSession.PackagesCreated | ForEach-Object { "- $_" } | Join-String -Separator "`n")

## Architecture Requirements

### Minimum System Requirements
- **Operating System**: Windows 10/11 or Windows Server 2016/2019/2022
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB free disk space, 10 GB recommended
- **Network**: TCP ports 80, 443, 8080 (configurable)
- **.NET Runtime**: .NET 6.0 or later
- **PowerShell**: 5.1 or later

### Enterprise Requirements
- **Active Directory**: Domain-joined computers for Group Policy deployment
- **SCCM**: System Center Configuration Manager 2012 R2 or later
- **PKI**: Code signing certificates for PowerShell execution policy
- **Firewall**: Appropriate exceptions for application communication
- **DNS**: Name resolution for application services

## Deployment Strategies

### 1. SCCM Deployment (Recommended for Large Environments)

**Advantages:**
- Centralized management and reporting
- Staged deployment with collections
- Automatic retry and scheduling
- Integration with existing SCCM infrastructure

**Files Provided:**
- `SCCM/Applications/MandADiscoverySuite-Application.xml` - Application definition
- `SCCM/Packages/MandADiscoverySuite.sms` - Package definition
- `SCCM/Scripts/Deploy-MandADiscoverySuite-SCCM.ps1` - Automated deployment script
- `SCCM/Collections/MandADiscoverySuite-TargetDevices.wql` - Device collection query
- `SCCM/Reports/MandADiscoverySuite-DeploymentReport.sql` - Deployment reporting

**Deployment Process:**
1. Import application definition into SCCM
2. Distribute content to distribution points
3. Create device collections using provided WQL query
4. Deploy application to target collections
5. Monitor deployment progress through reports

### 2. Group Policy Deployment (Recommended for Domain Environments)

**Advantages:**
- Leverages existing Active Directory infrastructure
- Automatic application to domain-joined computers
- Policy-driven configuration management
- No additional software licensing required

**Files Provided:**
- `GroupPolicy/ADMX/MandADiscoverySuite.admx` - Administrative template
- `GroupPolicy/ADML/en-US/MandADiscoverySuite.adml` - Language resources
- `GroupPolicy/Scripts/Deploy-MandADiscoverySuite-GPO.ps1` - GPO creation script

**Deployment Process:**
1. Copy ADMX/ADML files to PolicyDefinitions store
2. Create Group Policy Object using provided script
3. Configure software installation and settings
4. Link GPO to appropriate organizational units
5. Force group policy update on target computers

### 3. Docker Container Deployment (Modern Environments)

**Advantages:**
- Consistent deployment across environments
- Easy scaling and load balancing
- Isolation and resource management
- Support for DevOps practices

**Files Provided:**
- `Docker/Windows/Dockerfile` - Windows container definition
- `Docker/Linux/Dockerfile` - Linux container definition
- `Docker/docker-compose.yml` - Multi-container orchestration
- `Docker/build.ps1` - PowerShell build script
- `Docker/build.sh` - Bash build script

**Deployment Process:**
1. Build container images using provided scripts
2. Configure docker-compose.yml for environment
3. Deploy containers using docker-compose
4. Configure load balancing and monitoring
5. Set up persistent storage and backups

### 4. Kubernetes Deployment (Cloud-Native Environments)

**Advantages:**
- Enterprise-grade orchestration and scaling
- High availability and fault tolerance
- Advanced networking and security features
- Integration with cloud platforms

**Files Provided:**
- `Kubernetes/Manifests/deployment.yaml` - Kubernetes deployment definition
- `Kubernetes/Manifests/ingress.yaml` - Ingress configuration
- `Kubernetes/Helm/mandadiscovery-suite/` - Helm chart for deployment
- `Kubernetes/deploy.sh` - Deployment script

**Deployment Process:**
1. Prepare Kubernetes cluster and networking
2. Configure persistent volumes and storage classes
3. Deploy using Helm chart or direct manifests
4. Configure ingress and load balancing
5. Set up monitoring and logging

## Security Considerations

### Code Signing
- All PowerShell scripts should be digitally signed
- MSI packages should be signed with trusted certificates
- Container images should be scanned for vulnerabilities

### Network Security
- Configure appropriate firewall rules
- Use TLS/SSL for all network communications
- Implement network segmentation where appropriate

### Data Protection
- Encrypt sensitive configuration data
- Implement proper access controls
- Enable audit logging for compliance

### Compliance Requirements
- GDPR: Data protection and privacy controls
- SOX: Audit trails and change management
- HIPAA: Healthcare data protection (if applicable)

## Configuration Management

### Registry Settings
The application uses the following registry locations:
- `HKLM\SOFTWARE\Enterprise MA Solutions\MA Discovery Suite`
- `HKLM\SOFTWARE\Policies\$OrganizationName\MandADiscoverySuite`

### Environment Variables
- `MANDADISCOVERY_INSTALL_PATH` - Application installation directory
- `MANDADISCOVERY_DATA_PATH` - Data storage directory
- `DOTNET_ENVIRONMENT` - Runtime environment setting

### Configuration Files
- `appsettings.json` - Application configuration
- `suite-config.json` - Enterprise customization
- `ModuleRegistry.json` - PowerShell module registry

## Monitoring and Maintenance

### Health Monitoring
- Application health endpoints for load balancers
- Windows Event Log integration
- Performance counters and metrics
- Custom monitoring dashboards

### Backup and Recovery
- Regular backup of configuration and data
- Disaster recovery procedures
- Version rollback capabilities
- Database backup strategies (if applicable)

### Updates and Patching
- Automated update mechanisms
- Staged deployment for updates
- Rollback procedures for failed updates
- Change management processes

## Troubleshooting

### Common Issues

**Installation Failures:**
- Check system requirements and dependencies
- Verify PowerShell execution policy settings
- Review Windows Event Logs for errors
- Ensure sufficient disk space and permissions

**Application Startup Issues:**
- Verify .NET Runtime installation
- Check configuration file validity
- Review firewall and network settings
- Validate PowerShell module dependencies

**Performance Issues:**
- Monitor memory and CPU usage
- Check disk I/O and network latency
- Review application logs for bottlenecks
- Optimize database connections (if applicable)

### Log Locations
- **Application Logs**: `C:\ProgramData\Enterprise MA Solutions\MA Discovery Suite\Logs`
- **Installation Logs**: `%WINDIR%\Logs\MandADiscovery-*.log`
- **Event Logs**: Windows Application and System event logs
- **Container Logs**: Docker/Kubernetes container logging

### Support Contacts
- **Technical Support**: it-support@$($DomainName.ToLower())
- **Deployment Team**: deployment@$($DomainName.ToLower())
- **Security Team**: security@$($DomainName.ToLower())

## Appendices

### A. Command Reference
```powershell
# SCCM Deployment
.\Deploy-MandADiscoverySuite-SCCM.ps1 -SiteCode "SMS" -SourcePath "\\server\share" -DeploymentType Required

# Group Policy Deployment  
.\Deploy-MandADiscoverySuite-GPO.ps1 -GPOName "M&A Discovery Suite" -TargetOU "OU=Workstations,DC=corp,DC=local"

# Docker Deployment
docker-compose up -d

# Kubernetes Deployment
helm install mandadiscovery-suite ./Helm/mandadiscovery-suite
```

### B. Network Port Reference
| Port | Protocol | Purpose | Required |
|------|----------|---------|----------|
| 80 | HTTP | Web interface | Yes |
| 443 | HTTPS | Secure web interface | Yes |
| 8080 | HTTP | Application API | Configurable |
| 8443 | HTTPS | Secure API | Configurable |

### C. Performance Baselines
- **Startup Time**: < 30 seconds
- **Memory Usage**: 512 MB - 2 GB typical
- **CPU Usage**: < 25% steady state
- **Disk I/O**: < 100 MB/s typical

---

**Document Version**: $Version  
**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')  
**Organization**: $OrganizationName  
**Domain**: $DomainName  

For the most up-to-date documentation and support resources, visit the enterprise IT portal.
"@
    
    $DeploymentGuide | Out-File -FilePath (Join-Path $DocsPath "Enterprise-Deployment-Guide.md") -Encoding UTF8
    
    # Create quick start guide
    $QuickStartGuide = @"
# M&A Discovery Suite - Quick Start Guide

## Choose Your Deployment Method

### SCCM (Recommended for Large Enterprises)
```powershell
# 1. Import to SCCM
Import-CMApplication -FilePath "SCCM\Applications\MandADiscoverySuite-Application.xml"

# 2. Distribute Content
Start-CMContentDistribution -ApplicationName "M&A Discovery Suite"

# 3. Deploy to Collection
New-CMApplicationDeployment -ApplicationName "M&A Discovery Suite" -CollectionName "Target Computers" -DeployPurpose Required
```

### Group Policy (Domain Environments)
```powershell
# 1. Copy templates
Copy-Item "GroupPolicy\ADMX\*.admx" "C:\Windows\PolicyDefinitions\"
Copy-Item "GroupPolicy\ADML\en-US\*.adml" "C:\Windows\PolicyDefinitions\en-US\"

# 2. Create GPO
.\GroupPolicy\Scripts\Deploy-MandADiscoverySuite-GPO.ps1 -TargetOU "OU=Workstations,DC=corp,DC=local"

# 3. Force update
gpupdate /force
```

### Docker (Modern Infrastructure)
```bash
# 1. Build image
docker build -f Docker/Windows/Dockerfile -t mandadiscovery:$Version .

# 2. Deploy
docker-compose up -d

# 3. Verify
docker ps | grep mandadiscovery
```

### Kubernetes (Cloud-Native)
```bash
# 1. Deploy with Helm
helm install mandadiscovery-suite Kubernetes/Helm/mandadiscovery-suite/

# 2. Check status
kubectl get pods -l app=mandadiscovery-suite

# 3. Access application
kubectl port-forward svc/mandadiscovery-service 8080:80
```

## Verification Steps

1. **Check Installation**
   - Registry key exists: `HKLM\SOFTWARE\Enterprise MA Solutions\MA Discovery Suite`
   - Application executable: `MandADiscoverySuite.exe`
   - PowerShell modules loaded

2. **Test Functionality**
   - Application starts without errors
   - Web interface accessible (if applicable)
   - PowerShell modules import successfully
   - Data directory created

3. **Monitor Performance**
   - CPU usage < 25%
   - Memory usage < 2 GB
   - No critical errors in Event Log
   - Response time < 5 seconds

## Support
For assistance, contact: it-support@$($DomainName.ToLower())
"@
    
    $QuickStartGuide | Out-File -FilePath (Join-Path $DocsPath "Quick-Start-Guide.md") -Encoding UTF8
    
    Write-EnterpriseLog "Enterprise documentation generated successfully" -Level 'Success'
}

function Write-DeploymentSummary {
    $Duration = (Get-Date) - $script:DeploymentSession.StartTime
    
    Write-EnterpriseLog "" -Level 'Info'
    Write-EnterpriseLog "========================================================================" -Level 'Info'
    Write-EnterpriseLog "ENTERPRISE DEPLOYMENT TOOLS GENERATION COMPLETE" -Level 'Enterprise'
    Write-EnterpriseLog "========================================================================" -Level 'Info'
    
    Write-EnterpriseLog "Session Summary:" -Level 'Info'
    Write-EnterpriseLog "  Session ID: $($script:DeploymentSession.SessionId)" -Level 'Info'
    Write-EnterpriseLog "  Duration: $($Duration.ToString('hh\:mm\:ss'))" -Level 'Info'
    Write-EnterpriseLog "  Deployment Type: $DeploymentType" -Level 'Info'
    Write-EnterpriseLog "  Version: $Version" -Level 'Info'
    Write-EnterpriseLog "  Organization: $OrganizationName" -Level 'Info'
    Write-EnterpriseLog "  Domain: $DomainName" -Level 'Info'
    Write-EnterpriseLog "  Output Path: $OutputPath" -Level 'Info'
    
    Write-EnterpriseLog "" -Level 'Info'
    Write-EnterpriseLog "Generated Deployment Packages:" -Level 'Success'
    foreach ($Package in $script:DeploymentSession.PackagesCreated) {
        Write-EnterpriseLog "  ✓ $Package" -Level 'Success'
    }
    
    Write-EnterpriseLog "" -Level 'Info'
    Write-EnterpriseLog "Enterprise Deployment Structure:" -Level 'Info'
    Write-EnterpriseLog "  SCCM: Application definitions, packages, scripts, and reports" -Level 'Info'
    Write-EnterpriseLog "  Group Policy: ADMX/ADML templates and deployment scripts" -Level 'Info'
    Write-EnterpriseLog "  Docker: Windows/Linux containers with orchestration" -Level 'Info'
    Write-EnterpriseLog "  Kubernetes: Manifests, Helm charts, and deployment scripts" -Level 'Info'
    Write-EnterpriseLog "  Documentation: Comprehensive deployment and troubleshooting guides" -Level 'Info'
    
    Write-EnterpriseLog "" -Level 'Info'
    Write-EnterpriseLog "Next Steps:" -Level 'Enterprise'
    Write-EnterpriseLog "  1. Review generated deployment packages and documentation" -Level 'Info'
    Write-EnterpriseLog "  2. Test deployments in development environment" -Level 'Info'
    Write-EnterpriseLog "  3. Customize configurations for your specific environment" -Level 'Info'
    Write-EnterpriseLog "  4. Execute pilot deployment to selected users/systems" -Level 'Info'
    Write-EnterpriseLog "  5. Monitor deployment success and gather feedback" -Level 'Info'
    Write-EnterpriseLog "  6. Execute full enterprise rollout" -Level 'Info'
    
    Write-EnterpriseLog "" -Level 'Info'
    Write-EnterpriseLog "Fortune 500 Enterprise Deployment Ready!" -Level 'Enterprise'
    Write-EnterpriseLog "Log File: $script:LogPath" -Level 'Info'
    Write-EnterpriseLog "========================================================================" -Level 'Info'
}

# Main execution
try {
    Write-EnterpriseLog "Starting M&A Discovery Suite Enterprise Deployment Tools Generation" -Level 'Enterprise'
    Write-EnterpriseLog "=====================================================================" -Level 'Enterprise'
    
    # Initialize enterprise deployment framework
    Initialize-EnterpriseDeployment
    
    # Generate deployment packages based on type selection
    if ($DeploymentType -in @('SCCM', 'All')) {
        New-SCCMDeploymentPackage
    }
    
    if ($DeploymentType -in @('GroupPolicy', 'All')) {
        New-GroupPolicyDeploymentPackage
    }
    
    if ($DeploymentType -in @('Docker', 'All')) {
        New-DockerDeploymentPackage
    }
    
    if ($DeploymentType -in @('Kubernetes', 'All')) {
        New-KubernetesDeploymentPackage
    }
    
    # Generate comprehensive documentation
    New-EnterpriseDocumentation
    
    # Write deployment summary
    Write-DeploymentSummary
    
    Write-EnterpriseLog "Enterprise deployment tools generated successfully!" -Level 'Success'
    exit 0
    
} catch {
    Write-EnterpriseLog "CRITICAL ERROR in enterprise deployment generation: $($_.Exception.Message)" -Level 'Error'
    Write-EnterpriseLog "Stack Trace: $($_.ScriptStackTrace)" -Level 'Error'
    exit 1
}
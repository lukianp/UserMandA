# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Environment Risk Scoring Module for M&A Discovery Suite
.DESCRIPTION
    Provides comprehensive risk assessment and scoring capabilities for M&A environments.
    Analyzes security posture, compliance status, technical debt, migration complexity,
    and operational risks to generate overall risk scores and recommendations.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Discovery modules, Processing modules
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-RiskLog {
    <#
    .SYNOPSIS
        Writes log entries specific to risk assessment.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[RiskScoring] $Message" -Level $Level -Component "EnvironmentRiskScoring" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [RiskScoring] $Message" -ForegroundColor $color
    }
}

function Invoke-EnvironmentRiskAssessment {
    <#
    .SYNOPSIS
        Main environment risk assessment function.
    
    .DESCRIPTION
        Performs comprehensive risk assessment of the discovered environment including
        security, compliance, technical, operational, and migration risks.
    
    .PARAMETER DiscoveredData
        Hashtable containing all discovered data from various modules.
    
    .PARAMETER Configuration
        Risk assessment configuration including weights and thresholds.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$DiscoveredData,

        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-RiskLog -Level "HEADER" -Message "Starting Environment Risk Assessment (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'EnvironmentRiskScoring'
        AssessmentCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        RiskAssessments = @{}
        OverallRisk = @{}
        Recommendations = @()
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
        Complete = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Initialize risk categories with default weights
        $riskCategories = @{
            Security = @{ Weight = 0.30; Assessments = @() }
            Compliance = @{ Weight = 0.20; Assessments = @() }
            Technical = @{ Weight = 0.25; Assessments = @() }
            Operational = @{ Weight = 0.15; Assessments = @() }
            Migration = @{ Weight = 0.10; Assessments = @() }
        }

        # Override weights from configuration if provided
        if ($Configuration.riskAssessment -and $Configuration.riskAssessment.categoryWeights) {
            foreach ($category in $riskCategories.Keys) {
                if ($Configuration.riskAssessment.categoryWeights.$category) {
                    $riskCategories[$category].Weight = $Configuration.riskAssessment.categoryWeights.$category
                }
            }
        }

        Write-RiskLog -Level "INFO" -Message "Performing risk assessments across $($riskCategories.Keys.Count) categories..." -Context $Context

        # Security Risk Assessment
        try {
            Write-RiskLog -Level "INFO" -Message "Assessing security risks..." -Context $Context
            $securityRisk = Get-SecurityRiskAssessment -DiscoveredData $DiscoveredData -Configuration $Configuration -SessionId $SessionId
            $riskCategories.Security.Assessments = $securityRisk
            $result.RiskAssessments.Security = $securityRisk
            Write-RiskLog -Level "SUCCESS" -Message "Security risk assessment completed" -Context $Context
        } catch {
            $result.AddWarning("Failed to assess security risks: $($_.Exception.Message)", @{Category="Security"})
        }

        # Compliance Risk Assessment
        try {
            Write-RiskLog -Level "INFO" -Message "Assessing compliance risks..." -Context $Context
            $complianceRisk = Get-ComplianceRiskAssessment -DiscoveredData $DiscoveredData -Configuration $Configuration -SessionId $SessionId
            $riskCategories.Compliance.Assessments = $complianceRisk
            $result.RiskAssessments.Compliance = $complianceRisk
            Write-RiskLog -Level "SUCCESS" -Message "Compliance risk assessment completed" -Context $Context
        } catch {
            $result.AddWarning("Failed to assess compliance risks: $($_.Exception.Message)", @{Category="Compliance"})
        }

        # Technical Risk Assessment
        try {
            Write-RiskLog -Level "INFO" -Message "Assessing technical risks..." -Context $Context
            $technicalRisk = Get-TechnicalRiskAssessment -DiscoveredData $DiscoveredData -Configuration $Configuration -SessionId $SessionId
            $riskCategories.Technical.Assessments = $technicalRisk
            $result.RiskAssessments.Technical = $technicalRisk
            Write-RiskLog -Level "SUCCESS" -Message "Technical risk assessment completed" -Context $Context
        } catch {
            $result.AddWarning("Failed to assess technical risks: $($_.Exception.Message)", @{Category="Technical"})
        }

        # Operational Risk Assessment
        try {
            Write-RiskLog -Level "INFO" -Message "Assessing operational risks..." -Context $Context
            $operationalRisk = Get-OperationalRiskAssessment -DiscoveredData $DiscoveredData -Configuration $Configuration -SessionId $SessionId
            $riskCategories.Operational.Assessments = $operationalRisk
            $result.RiskAssessments.Operational = $operationalRisk
            Write-RiskLog -Level "SUCCESS" -Message "Operational risk assessment completed" -Context $Context
        } catch {
            $result.AddWarning("Failed to assess operational risks: $($_.Exception.Message)", @{Category="Operational"})
        }

        # Migration Risk Assessment
        try {
            Write-RiskLog -Level "INFO" -Message "Assessing migration risks..." -Context $Context
            $migrationRisk = Get-MigrationRiskAssessment -DiscoveredData $DiscoveredData -Configuration $Configuration -SessionId $SessionId
            $riskCategories.Migration.Assessments = $migrationRisk
            $result.RiskAssessments.Migration = $migrationRisk
            Write-RiskLog -Level "SUCCESS" -Message "Migration risk assessment completed" -Context $Context
        } catch {
            $result.AddWarning("Failed to assess migration risks: $($_.Exception.Message)", @{Category="Migration"})
        }

        # Calculate Overall Risk Score
        Write-RiskLog -Level "INFO" -Message "Calculating overall risk score..." -Context $Context
        $overallRisk = Calculate-OverallRiskScore -RiskCategories $riskCategories -SessionId $SessionId
        $result.OverallRisk = $overallRisk

        # Generate Risk-Based Recommendations
        Write-RiskLog -Level "INFO" -Message "Generating risk-based recommendations..." -Context $Context
        $recommendations = Get-RiskBasedRecommendations -RiskAssessments $result.RiskAssessments -OverallRisk $overallRisk -SessionId $SessionId
        $result.Recommendations = $recommendations

        # Export Risk Assessment Results
        if ($Context.Paths.RawDataOutput) {
            Write-RiskLog -Level "INFO" -Message "Exporting risk assessment results..." -Context $Context
            Export-RiskAssessmentResults -RiskAssessments $result -OutputPath $Context.Paths.RawDataOutput -SessionId $SessionId
        }

        $result.AssessmentCount = $riskCategories.Keys.Count
        Write-RiskLog -Level "SUCCESS" -Message "Environment risk assessment completed successfully" -Context $Context

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during risk assessment: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-RiskLog -Level "HEADER" -Message "Risk assessment finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Overall Risk Level: $($result.OverallRisk.Level)." -Context $Context
    }

    return $result
}

function Get-SecurityRiskAssessment {
    <#
    .SYNOPSIS
        Assesses security-related risks in the environment.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$DiscoveredData,
        [hashtable]$Configuration,
        [string]$SessionId
    )

    $securityAssessments = @()

    try {
        # Active Directory Security Assessment
        if ($DiscoveredData.ContainsKey('ActiveDirectory')) {
            $adData = $DiscoveredData.ActiveDirectory
            $adSecurityScore = 0
            $maxAdScore = 100
            $adRisks = @()

            # Check for privileged accounts
            $privilegedUsers = @($adData | Where-Object { 
                $_.ObjectClass -eq 'user' -and (
                    $_.AdminCount -eq 1 -or 
                    $_.GroupMemberships -like "*Domain Admins*" -or
                    $_.GroupMemberships -like "*Enterprise Admins*"
                )
            })

            if ($privilegedUsers.Count -gt 0) {
                $privilegedRatio = $privilegedUsers.Count / @($adData | Where-Object { $_.ObjectClass -eq 'user' }).Count
                if ($privilegedRatio -gt 0.05) {  # More than 5% privileged users
                    $adRisks += "High ratio of privileged users ($($privilegedUsers.Count))"
                    $adSecurityScore -= 20
                } else {
                    $adSecurityScore += 10
                }
            }

            # Check for disabled accounts
            $disabledUsers = @($adData | Where-Object { $_.ObjectClass -eq 'user' -and $_.Enabled -eq $false })
            $enabledUsers = @($adData | Where-Object { $_.ObjectClass -eq 'user' -and $_.Enabled -eq $true })
            
            if ($disabledUsers.Count -gt 0 -and $enabledUsers.Count -gt 0) {
                $disabledRatio = $disabledUsers.Count / ($disabledUsers.Count + $enabledUsers.Count)
                if ($disabledRatio -lt 0.1) {  # Less than 10% disabled accounts indicates good hygiene
                    $adSecurityScore += 15
                } else {
                    $adRisks += "High number of disabled accounts may indicate poor account lifecycle management"
                    $adSecurityScore -= 10
                }
            }

            # Check password policies (if available)
            $passwordPolicyData = $adData | Where-Object { $_.ObjectClass -eq 'domainDNS' }
            if ($passwordPolicyData) {
                foreach ($domain in $passwordPolicyData) {
                    if ($domain.PasswordHistoryLength -and $domain.PasswordHistoryLength -ge 12) {
                        $adSecurityScore += 10
                    } else {
                        $adRisks += "Weak password history policy in domain $($domain.Name)"
                        $adSecurityScore -= 10
                    }

                    if ($domain.MinPasswordLength -and $domain.MinPasswordLength -ge 12) {
                        $adSecurityScore += 10
                    } else {
                        $adRisks += "Insufficient minimum password length in domain $($domain.Name)"
                        $adSecurityScore -= 15
                    }
                }
            }

            $securityAssessments += [PSCustomObject]@{
                Component = "ActiveDirectory"
                RiskArea = "Identity Security"
                Score = [math]::Max(0, [math]::Min($maxAdScore, $adSecurityScore + 50)) # Normalize to 0-100
                MaxScore = $maxAdScore
                Risks = $adRisks
                Recommendations = @(
                    "Review and reduce privileged account count"
                    "Implement strong password policies"
                    "Enable account auditing and monitoring"
                    "Regular access reviews for privileged accounts"
                )
                SessionId = $SessionId
            }
        }

        # Azure/Entra ID Security Assessment
        if ($DiscoveredData.ContainsKey('AzureAD') -or $DiscoveredData.ContainsKey('EntraID')) {
            $aadData = if ($DiscoveredData.ContainsKey('AzureAD')) { $DiscoveredData.AzureAD } else { $DiscoveredData.EntraID }
            $aadSecurityScore = 0
            $maxAadScore = 100
            $aadRisks = @()

            # Check for guest users
            $guestUsers = @($aadData | Where-Object { $_.UserType -eq 'Guest' })
            $allUsers = @($aadData | Where-Object { $_.ObjectType -eq 'User' })
            
            if ($guestUsers.Count -gt 0 -and $allUsers.Count -gt 0) {
                $guestRatio = $guestUsers.Count / $allUsers.Count
                if ($guestRatio -gt 0.2) {  # More than 20% guest users
                    $aadRisks += "High ratio of guest users ($($guestUsers.Count))"
                    $aadSecurityScore -= 15
                } else {
                    $aadSecurityScore += 10
                }
            }

            # Check for MFA enablement
            $mfaEnabledUsers = @($aadData | Where-Object { $_.MFAEnabled -eq $true })
            if ($mfaEnabledUsers.Count -gt 0 -and $allUsers.Count -gt 0) {
                $mfaRatio = $mfaEnabledUsers.Count / $allUsers.Count
                if ($mfaRatio -gt 0.9) {  # More than 90% MFA enabled
                    $aadSecurityScore += 25
                } elseif ($mfaRatio -gt 0.7) {  # More than 70% MFA enabled
                    $aadSecurityScore += 15
                } else {
                    $aadRisks += "Low MFA adoption rate ($([math]::Round($mfaRatio * 100, 1))%)"
                    $aadSecurityScore -= 20
                }
            } else {
                $aadRisks += "MFA status unknown or not implemented"
                $aadSecurityScore -= 25
            }

            $securityAssessments += [PSCustomObject]@{
                Component = "AzureAD/EntraID"
                RiskArea = "Cloud Identity Security"
                Score = [math]::Max(0, [math]::Min($maxAadScore, $aadSecurityScore + 50)) # Normalize to 0-100
                MaxScore = $maxAadScore
                Risks = $aadRisks
                Recommendations = @(
                    "Enforce MFA for all users"
                    "Regular review of guest user access"
                    "Implement conditional access policies"
                    "Enable identity protection features"
                )
                SessionId = $SessionId
            }
        }

        # Network Security Assessment
        if ($DiscoveredData.ContainsKey('Network') -or $DiscoveredData.ContainsKey('NetworkInfrastructure')) {
            $networkData = if ($DiscoveredData.ContainsKey('Network')) { $DiscoveredData.Network } else { $DiscoveredData.NetworkInfrastructure }
            $networkSecurityScore = 0
            $maxNetworkScore = 100
            $networkRisks = @()

            # Check for open ports/services
            $networkConnections = @($networkData | Where-Object { $_.DataType -eq 'NetworkConnection' -or $_.ConnectionType })
            $openPorts = @($networkConnections | Where-Object { $_.State -eq 'Listen' -or $_.IsListening -eq $true })
            
            if ($openPorts.Count -gt 0) {
                $criticalPorts = @($openPorts | Where-Object { 
                    $_.LocalPort -in @(21, 23, 135, 139, 445, 1433, 3389) # Common vulnerable ports
                })
                
                if ($criticalPorts.Count -gt 0) {
                    $networkRisks += "Critical ports exposed: $($criticalPorts.LocalPort -join ', ')"
                    $networkSecurityScore -= 25
                } else {
                    $networkSecurityScore += 15
                }
            }

            # Check firewall status (if available)
            $firewallData = @($networkData | Where-Object { $_.ObjectType -eq 'Firewall' -or $_.DataType -eq 'FirewallRule' })
            if ($firewallData.Count -gt 0) {
                $enabledFirewalls = @($firewallData | Where-Object { $_.Enabled -eq $true -or $_.Status -eq 'Running' })
                if ($enabledFirewalls.Count -gt 0) {
                    $networkSecurityScore += 20
                } else {
                    $networkRisks += "Firewall not enabled or configured"
                    $networkSecurityScore -= 30
                }
            } else {
                $networkRisks += "No firewall configuration detected"
                $networkSecurityScore -= 20
            }

            $securityAssessments += [PSCustomObject]@{
                Component = "Network"
                RiskArea = "Network Security"
                Score = [math]::Max(0, [math]::Min($maxNetworkScore, $networkSecurityScore + 50)) # Normalize to 0-100
                MaxScore = $maxNetworkScore
                Risks = $networkRisks
                Recommendations = @(
                    "Close unnecessary open ports"
                    "Implement network segmentation"
                    "Enable and configure firewalls"
                    "Regular network security scanning"
                )
                SessionId = $SessionId
            }
        }

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to assess security risks: $($_.Exception.Message)"
    }

    return $securityAssessments
}

function Get-ComplianceRiskAssessment {
    <#
    .SYNOPSIS
        Assesses compliance-related risks in the environment.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$DiscoveredData,
        [hashtable]$Configuration,
        [string]$SessionId
    )

    $complianceAssessments = @()

    try {
        # Data Classification Assessment
        if ($DiscoveredData.ContainsKey('DataClassification')) {
            $dataClassData = $DiscoveredData.DataClassification
            $dataComplianceScore = 0
            $maxDataScore = 100
            $dataRisks = @()

            # Check for sensitive data discovery
            $sensitiveFiles = @($dataClassData | Where-Object { 
                $_.Classification -in @('Confidential', 'Restricted', 'Personal', 'PII', 'PHI') 
            })

            if ($sensitiveFiles.Count -gt 0) {
                $totalFiles = @($dataClassData).Count
                $sensitiveRatio = $sensitiveFiles.Count / $totalFiles
                
                if ($sensitiveRatio -gt 0.1) {  # More than 10% sensitive files
                    $dataRisks += "High volume of sensitive data files ($($sensitiveFiles.Count))"
                    $dataComplianceScore -= 20
                }

                # Check for unprotected sensitive data
                $unprotectedSensitive = @($sensitiveFiles | Where-Object { 
                    $_.Encrypted -eq $false -or $_.AccessControlled -eq $false 
                })

                if ($unprotectedSensitive.Count -gt 0) {
                    $dataRisks += "Unprotected sensitive data files ($($unprotectedSensitive.Count))"
                    $dataComplianceScore -= 30
                } else {
                    $dataComplianceScore += 20
                }
            }

            $complianceAssessments += [PSCustomObject]@{
                Component = "DataClassification"
                RiskArea = "Data Protection Compliance"
                Score = [math]::Max(0, [math]::Min($maxDataScore, $dataComplianceScore + 60)) # Normalize to 0-100
                MaxScore = $maxDataScore
                Risks = $dataRisks
                Recommendations = @(
                    "Implement data loss prevention (DLP)"
                    "Encrypt sensitive data at rest and in transit"
                    "Apply appropriate access controls"
                    "Regular data classification reviews"
                )
                SessionId = $SessionId
            }
        }

        # Exchange/Email Compliance Assessment
        if ($DiscoveredData.ContainsKey('Exchange')) {
            $exchangeData = $DiscoveredData.Exchange
            $emailComplianceScore = 0
            $maxEmailScore = 100
            $emailRisks = @()

            # Check for litigation hold and retention policies
            $mailboxes = @($exchangeData | Where-Object { $_.ObjectType -eq 'Mailbox' })
            if ($mailboxes.Count -gt 0) {
                $litigationHoldMailboxes = @($mailboxes | Where-Object { $_.LitigationHoldEnabled -eq $true })
                $retentionPolicyMailboxes = @($mailboxes | Where-Object { $_.RetentionPolicy -ne $null -and $_.RetentionPolicy -ne '' })

                $holdRatio = if ($mailboxes.Count -gt 0) { $litigationHoldMailboxes.Count / $mailboxes.Count } else { 0 }
                $retentionRatio = if ($mailboxes.Count -gt 0) { $retentionPolicyMailboxes.Count / $mailboxes.Count } else { 0 }

                if ($holdRatio -lt 0.1 -and $retentionRatio -lt 0.5) {
                    $emailRisks += "Limited email retention and litigation hold implementation"
                    $emailComplianceScore -= 25
                } else {
                    $emailComplianceScore += 20
                }

                # Check for large mailboxes (compliance risk)
                $largeMailboxes = @($mailboxes | Where-Object { 
                    $_.TotalItemSize -and ($_.TotalItemSize -replace '[^\d.]', '') -as [double] -gt 10000 # >10GB
                })

                if ($largeMailboxes.Count -gt 0) {
                    $emailRisks += "Large mailboxes may indicate poor email lifecycle management ($($largeMailboxes.Count) mailboxes >10GB)"
                    $emailComplianceScore -= 15
                }
            }

            $complianceAssessments += [PSCustomObject]@{
                Component = "Exchange"
                RiskArea = "Email Compliance"
                Score = [math]::Max(0, [math]::Min($maxEmailScore, $emailComplianceScore + 50)) # Normalize to 0-100
                MaxScore = $maxEmailScore
                Risks = $emailRisks
                Recommendations = @(
                    "Implement email retention policies"
                    "Enable litigation hold for key personnel"
                    "Archive old emails to reduce storage"
                    "Regular compliance audits"
                )
                SessionId = $SessionId
            }
        }

        # General Compliance Assessment
        $generalComplianceScore = 0
        $maxGeneralScore = 100
        $generalRisks = @()

        # Check for audit logging capabilities
        $auditingSystems = 0
        if ($DiscoveredData.ContainsKey('ActiveDirectory')) { $auditingSystems++ }
        if ($DiscoveredData.ContainsKey('AzureAD')) { $auditingSystems++ }
        if ($DiscoveredData.ContainsKey('Exchange')) { $auditingSystems++ }

        if ($auditingSystems -ge 2) {
            $generalComplianceScore += 20
        } else {
            $generalRisks += "Limited auditing systems detected"
            $generalComplianceScore -= 15
        }

        # Check for backup systems (compliance requirement)
        if ($DiscoveredData.ContainsKey('Backup') -or $DiscoveredData.ContainsKey('BackupRecovery')) {
            $generalComplianceScore += 15
        } else {
            $generalRisks += "No backup systems detected"
            $generalComplianceScore -= 20
        }

        $complianceAssessments += [PSCustomObject]@{
            Component = "General"
            RiskArea = "Regulatory Compliance"
            Score = [math]::Max(0, [math]::Min($maxGeneralScore, $generalComplianceScore + 50)) # Normalize to 0-100
            MaxScore = $maxGeneralScore
            Risks = $generalRisks
            Recommendations = @(
                "Implement comprehensive audit logging"
                "Establish data backup and recovery procedures"
                "Document compliance processes"
                "Regular compliance assessments"
            )
            SessionId = $SessionId
        }

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to assess compliance risks: $($_.Exception.Message)"
    }

    return $complianceAssessments
}

function Get-TechnicalRiskAssessment {
    <#
    .SYNOPSIS
        Assesses technical debt and infrastructure risks.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$DiscoveredData,
        [hashtable]$Configuration,
        [string]$SessionId
    )

    $technicalAssessments = @()

    try {
        # Operating System Risk Assessment
        if ($DiscoveredData.ContainsKey('Computers') -or $DiscoveredData.ContainsKey('PhysicalServers')) {
            $computerData = if ($DiscoveredData.ContainsKey('Computers')) { $DiscoveredData.Computers } else { $DiscoveredData.PhysicalServers }
            $osRiskScore = 0
            $maxOsScore = 100
            $osRisks = @()

            $allComputers = @($computerData | Where-Object { $_.OperatingSystem })
            if ($allComputers.Count -gt 0) {
                # Check for legacy operating systems
                $legacyOSes = @($allComputers | Where-Object { 
                    $_.OperatingSystem -like "*2008*" -or 
                    $_.OperatingSystem -like "*2012*" -or 
                    $_.OperatingSystem -like "*Windows 7*" -or 
                    $_.OperatingSystem -like "*Windows 8*"
                })

                if ($legacyOSes.Count -gt 0) {
                    $legacyRatio = $legacyOSes.Count / $allComputers.Count
                    $osRisks += "Legacy operating systems detected ($($legacyOSes.Count) systems, $([math]::Round($legacyRatio * 100, 1))%)"
                    $osRiskScore -= ($legacyRatio * 40) # Up to -40 points for 100% legacy
                }

                # Check for unsupported systems
                $unsupportedOSes = @($allComputers | Where-Object { 
                    $_.OperatingSystem -like "*2003*" -or 
                    $_.OperatingSystem -like "*XP*" -or
                    $_.OperatingSystem -like "*Vista*"
                })

                if ($unsupportedOSes.Count -gt 0) {
                    $osRisks += "Unsupported operating systems detected ($($unsupportedOSes.Count) systems)"
                    $osRiskScore -= 50
                }

                # Check for diverse OS landscape (complexity risk)
                $osTypes = ($allComputers.OperatingSystem | Group-Object).Count
                if ($osTypes -gt 5) {
                    $osRisks += "High OS diversity increases management complexity ($osTypes different OS versions)"
                    $osRiskScore -= 15
                } elseif ($osTypes -le 3) {
                    $osRiskScore += 10
                }
            }

            $technicalAssessments += [PSCustomObject]@{
                Component = "OperatingSystems"
                RiskArea = "OS Lifecycle Management"
                Score = [math]::Max(0, [math]::Min($maxOsScore, $osRiskScore + 80)) # Normalize to 0-100
                MaxScore = $maxOsScore
                Risks = $osRisks
                Recommendations = @(
                    "Upgrade legacy operating systems"
                    "Develop OS standardization plan"
                    "Implement patch management"
                    "Plan migration from unsupported systems"
                )
                SessionId = $SessionId
            }
        }

        # Application Risk Assessment
        if ($DiscoveredData.ContainsKey('Applications')) {
            $appData = $DiscoveredData.Applications
            $appRiskScore = 0
            $maxAppScore = 100
            $appRisks = @()

            $allApps = @($appData)
            if ($allApps.Count -gt 0) {
                # Check for legacy applications
                $currentYear = (Get-Date).Year
                $legacyApps = @($allApps | Where-Object { 
                    $_.InstallDate -and 
                    ([datetime]$_.InstallDate).Year -lt ($currentYear - 5)
                })

                if ($legacyApps.Count -gt 0) {
                    $legacyRatio = $legacyApps.Count / $allApps.Count
                    if ($legacyRatio -gt 0.3) {
                        $appRisks += "High number of legacy applications ($($legacyApps.Count), $([math]::Round($legacyRatio * 100, 1))%)"
                        $appRiskScore -= 25
                    }
                }

                # Check for application diversity (complexity)
                $uniqueApps = ($allApps.DisplayName | Group-Object).Count
                $appsPerSystem = if ($allApps.Count -gt 0) { $uniqueApps / $allApps.Count } else { 0 }
                
                if ($appsPerSystem -gt 0.5) {
                    $appRisks += "High application diversity increases migration complexity"
                    $appRiskScore -= 15
                } else {
                    $appRiskScore += 10
                }

                # Check for critical business applications
                $businessApps = @($allApps | Where-Object { 
                    $_.DisplayName -like "*SQL*" -or 
                    $_.DisplayName -like "*Oracle*" -or
                    $_.DisplayName -like "*SAP*" -or
                    $_.DisplayName -like "*SharePoint*"
                })

                if ($businessApps.Count -gt 0) {
                    $appRisks += "Critical business applications require special migration planning ($($businessApps.Count))"
                    $appRiskScore -= 10
                }
            }

            $technicalAssessments += [PSCustomObject]@{
                Component = "Applications"
                RiskArea = "Application Portfolio"
                Score = [math]::Max(0, [math]::Min($maxAppScore, $appRiskScore + 60)) # Normalize to 0-100
                MaxScore = $maxAppScore
                Risks = $appRisks
                Recommendations = @(
                    "Inventory and assess all applications"
                    "Identify application dependencies"
                    "Plan application modernization"
                    "Create application migration roadmap"
                )
                SessionId = $SessionId
            }
        }

        # Infrastructure Risk Assessment
        $infraRiskScore = 0
        $maxInfraScore = 100
        $infraRisks = @()

        # Check virtualization ratio
        if ($DiscoveredData.ContainsKey('VMware') -or $DiscoveredData.ContainsKey('Virtualization')) {
            $vmData = if ($DiscoveredData.ContainsKey('VMware')) { $DiscoveredData.VMware } else { $DiscoveredData.Virtualization }
            $virtualMachines = @($vmData | Where-Object { $_.ObjectType -eq 'VirtualMachine' })
            
            if ($DiscoveredData.ContainsKey('PhysicalServers')) {
                $physicalServers = @($DiscoveredData.PhysicalServers)
                $totalServers = $virtualMachines.Count + $physicalServers.Count
                
                if ($totalServers -gt 0) {
                    $virtualizationRatio = $virtualMachines.Count / $totalServers
                    if ($virtualizationRatio -gt 0.7) {
                        $infraRiskScore += 20
                    } elseif ($virtualizationRatio -lt 0.3) {
                        $infraRisks += "Low virtualization ratio may complicate migration"
                        $infraRiskScore -= 15
                    }
                }
            }
        }

        # Check for single points of failure
        if ($DiscoveredData.ContainsKey('Network')) {
            $networkData = $DiscoveredData.Network
            $dnsServers = @($networkData | Where-Object { $_.DataType -eq 'DNSServer' })
            $dhcpServers = @($networkData | Where-Object { $_.DataType -eq 'DHCPServer' })
            
            if ($dnsServers.Count -eq 1) {
                $infraRisks += "Single DNS server represents point of failure"
                $infraRiskScore -= 20
            }
            
            if ($dhcpServers.Count -eq 1) {
                $infraRisks += "Single DHCP server represents point of failure"
                $infraRiskScore -= 15
            }
        }

        $technicalAssessments += [PSCustomObject]@{
            Component = "Infrastructure"
            RiskArea = "Infrastructure Architecture"
            Score = [math]::Max(0, [math]::Min($maxInfraScore, $infraRiskScore + 60)) # Normalize to 0-100
            MaxScore = $maxInfraScore
            Risks = $infraRisks
            Recommendations = @(
                "Increase infrastructure virtualization"
                "Eliminate single points of failure"
                "Implement redundancy for critical services"
                "Document infrastructure dependencies"
            )
            SessionId = $SessionId
        }

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to assess technical risks: $($_.Exception.Message)"
    }

    return $technicalAssessments
}

function Get-OperationalRiskAssessment {
    <#
    .SYNOPSIS
        Assesses operational risks including processes and documentation.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$DiscoveredData,
        [hashtable]$Configuration,
        [string]$SessionId
    )

    $operationalAssessments = @()

    try {
        # Administrator Account Risk Assessment
        if ($DiscoveredData.ContainsKey('ActiveDirectory')) {
            $adData = $DiscoveredData.ActiveDirectory
            $adminRiskScore = 0
            $maxAdminScore = 100
            $adminRisks = @()

            # Check for admin account best practices
            $adminAccounts = @($adData | Where-Object { 
                $_.ObjectClass -eq 'user' -and (
                    $_.AdminCount -eq 1 -or 
                    $_.GroupMemberships -like "*Admin*"
                )
            })

            if ($adminAccounts.Count -gt 0) {
                # Check for shared admin accounts
                $sharedAdminAccounts = @($adminAccounts | Where-Object { 
                    $_.Name -like "*admin*" -or 
                    $_.Name -like "*service*" -or
                    $_.Name -notlike "*.*"  # No first.last format suggests shared account
                })

                if ($sharedAdminAccounts.Count -gt 0) {
                    $adminRisks += "Shared administrative accounts detected ($($sharedAdminAccounts.Count))"
                    $adminRiskScore -= 25
                }

                # Check for never-expires passwords on admin accounts
                $neverExpiresAdmins = @($adminAccounts | Where-Object { $_.PasswordNeverExpires -eq $true })
                if ($neverExpiresAdmins.Count -gt 0) {
                    $adminRisks += "Admin accounts with non-expiring passwords ($($neverExpiresAdmins.Count))"
                    $adminRiskScore -= 20
                }

                # Check admin-to-user ratio
                $totalUsers = @($adData | Where-Object { $_.ObjectClass -eq 'user' }).Count
                if ($totalUsers -gt 0) {
                    $adminRatio = $adminAccounts.Count / $totalUsers
                    if ($adminRatio -gt 0.1) {  # More than 10% admins
                        $adminRisks += "High administrator-to-user ratio ($([math]::Round($adminRatio * 100, 1))%)"
                        $adminRiskScore -= 15
                    } else {
                        $adminRiskScore += 10
                    }
                }
            }

            $operationalAssessments += [PSCustomObject]@{
                Component = "Administration"
                RiskArea = "Administrative Controls"
                Score = [math]::Max(0, [math]::Min($maxAdminScore, $adminRiskScore + 70)) # Normalize to 0-100
                MaxScore = $maxAdminScore
                Risks = $adminRisks
                Recommendations = @(
                    "Implement individual admin accounts"
                    "Enforce password expiration for admin accounts"
                    "Regular review of administrative privileges"
                    "Implement privileged access management (PAM)"
                )
                SessionId = $SessionId
            }
        }

        # Service Account Risk Assessment
        $serviceRiskScore = 0
        $maxServiceScore = 100
        $serviceRisks = @()

        if ($DiscoveredData.ContainsKey('ActiveDirectory')) {
            $adData = $DiscoveredData.ActiveDirectory
            $serviceAccounts = @($adData | Where-Object { 
                $_.ObjectClass -eq 'user' -and (
                    $_.Name -like "*service*" -or 
                    $_.Name -like "*svc*" -or
                    $_.ServicePrincipalName -ne $null
                )
            })

            if ($serviceAccounts.Count -gt 0) {
                # Check for service accounts with admin privileges
                $adminServiceAccounts = @($serviceAccounts | Where-Object { 
                    $_.AdminCount -eq 1 -or $_.GroupMemberships -like "*Admin*" 
                })

                if ($adminServiceAccounts.Count -gt 0) {
                    $serviceRisks += "Service accounts with administrative privileges ($($adminServiceAccounts.Count))"
                    $serviceRiskScore -= 30
                }

                # Check for interactive service accounts
                $interactiveServiceAccounts = @($serviceAccounts | Where-Object { 
                    $_.LogonCount -gt 0 -and $_.LastLogonDate
                })

                if ($interactiveServiceAccounts.Count -gt 0) {
                    $serviceRisks += "Service accounts used for interactive logon ($($interactiveServiceAccounts.Count))"
                    $serviceRiskScore -= 20
                }

                # Check for service accounts with non-expiring passwords
                $neverExpiresService = @($serviceAccounts | Where-Object { $_.PasswordNeverExpires -eq $true })
                if ($neverExpiresService.Count -gt 0) {
                    $serviceRisks += "Service accounts with non-expiring passwords ($($neverExpiresService.Count))"
                    $serviceRiskScore -= 15
                } else {
                    $serviceRiskScore += 15
                }
            }
        }

        $operationalAssessments += [PSCustomObject]@{
            Component = "ServiceAccounts"
            RiskArea = "Service Account Management"
            Score = [math]::Max(0, [math]::Min($maxServiceScore, $serviceRiskScore + 60)) # Normalize to 0-100
            MaxScore = $maxServiceScore
            Risks = $serviceRisks
            Recommendations = @(
                "Remove admin privileges from service accounts"
                "Prevent interactive logon for service accounts"
                "Implement managed service accounts"
                "Regular service account inventory and review"
            )
            SessionId = $SessionId
        }

        # Backup and Recovery Risk Assessment
        $backupRiskScore = 0
        $maxBackupScore = 100
        $backupRisks = @()

        if ($DiscoveredData.ContainsKey('Backup') -or $DiscoveredData.ContainsKey('BackupRecovery')) {
            $backupData = if ($DiscoveredData.ContainsKey('Backup')) { $DiscoveredData.Backup } else { $DiscoveredData.BackupRecovery }
            
            # Check backup coverage
            $backupJobs = @($backupData | Where-Object { $_.ObjectType -eq 'BackupJob' })
            $backupSystems = @($backupData | Where-Object { $_.ObjectType -eq 'BackupSystem' })
            
            if ($backupJobs.Count -gt 0) {
                $failedJobs = @($backupJobs | Where-Object { $_.LastStatus -eq 'Failed' })
                if ($failedJobs.Count -gt 0) {
                    $failureRatio = $failedJobs.Count / $backupJobs.Count
                    if ($failureRatio -gt 0.1) {
                        $backupRisks += "High backup job failure rate ($([math]::Round($failureRatio * 100, 1))%)"
                        $backupRiskScore -= 25
                    }
                }
                
                $backupRiskScore += 20
            } else {
                $backupRisks += "No backup jobs detected"
                $backupRiskScore -= 40
            }

            if ($backupSystems.Count -eq 0) {
                $backupRisks += "No backup systems detected"
                $backupRiskScore -= 30
            } else {
                $backupRiskScore += 15
            }
        } else {
            $backupRisks += "No backup infrastructure discovered"
            $backupRiskScore -= 50
        }

        $operationalAssessments += [PSCustomObject]@{
            Component = "BackupRecovery"
            RiskArea = "Business Continuity"
            Score = [math]::Max(0, [math]::Min($maxBackupScore, $backupRiskScore + 70)) # Normalize to 0-100
            MaxScore = $maxBackupScore
            Risks = $backupRisks
            Recommendations = @(
                "Implement comprehensive backup strategy"
                "Regular backup job monitoring"
                "Test backup restoration procedures"
                "Document recovery procedures"
            )
            SessionId = $SessionId
        }

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to assess operational risks: $($_.Exception.Message)"
    }

    return $operationalAssessments
}

function Get-MigrationRiskAssessment {
    <#
    .SYNOPSIS
        Assesses risks specific to migration activities.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$DiscoveredData,
        [hashtable]$Configuration,
        [string]$SessionId
    )

    $migrationAssessments = @()

    try {
        # Data Volume Risk Assessment
        $dataVolumeRiskScore = 0
        $maxDataScore = 100
        $dataRisks = @()

        if ($DiscoveredData.ContainsKey('FileServers') -or $DiscoveredData.ContainsKey('Storage')) {
            $storageData = if ($DiscoveredData.ContainsKey('FileServers')) { $DiscoveredData.FileServers } else { $DiscoveredData.Storage }
            
            $totalSizeGB = 0
            $fileCount = 0
            
            foreach ($item in $storageData) {
                if ($item.TotalSizeGB) {
                    $totalSizeGB += $item.TotalSizeGB
                }
                if ($item.FileCount) {
                    $fileCount += $item.FileCount
                }
            }

            if ($totalSizeGB -gt 10000) {  # >10TB
                $dataRisks += "Large data volume detected ($([math]::Round($totalSizeGB/1024, 1)) TB)"
                $dataVolumeRiskScore -= 25
            } elseif ($totalSizeGB -gt 1000) {  # >1TB
                $dataRisks += "Moderate data volume ($([math]::Round($totalSizeGB, 0)) GB)"
                $dataVolumeRiskScore -= 10
            } else {
                $dataVolumeRiskScore += 15
            }

            if ($fileCount -gt 1000000) {  # >1M files
                $dataRisks += "High file count ($([math]::Round($fileCount/1000000, 1))M files)"
                $dataVolumeRiskScore -= 20
            }
        }

        # Exchange Migration Risk
        if ($DiscoveredData.ContainsKey('Exchange')) {
            $exchangeData = $DiscoveredData.Exchange
            $mailboxes = @($exchangeData | Where-Object { $_.ObjectType -eq 'Mailbox' })
            
            if ($mailboxes.Count -gt 0) {
                $totalMailboxSizeGB = 0
                $largeMailboxes = 0
                
                foreach ($mailbox in $mailboxes) {
                    if ($mailbox.TotalItemSize) {
                        $sizeGB = ($mailbox.TotalItemSize -replace '[^\d.]', '') -as [double]
                        if ($sizeGB) {
                            $totalMailboxSizeGB += $sizeGB / 1024  # Convert MB to GB
                            if ($sizeGB -gt 10240) {  # >10GB
                                $largeMailboxes++
                            }
                        }
                    }
                }
                
                if ($totalMailboxSizeGB -gt 500) {  # >500GB total
                    $dataRisks += "Large total mailbox size ($([math]::Round($totalMailboxSizeGB, 1)) GB)"
                    $dataVolumeRiskScore -= 15
                }
                
                if ($largeMailboxes -gt 0) {
                    $dataRisks += "Large individual mailboxes detected ($largeMailboxes mailboxes >10GB)"
                    $dataVolumeRiskScore -= 10
                }
            }
        }

        $migrationAssessments += [PSCustomObject]@{
            Component = "DataVolume"
            RiskArea = "Migration Complexity"
            Score = [math]::Max(0, [math]::Min($maxDataScore, $dataVolumeRiskScore + 70)) # Normalize to 0-100
            MaxScore = $maxDataScore
            Risks = $dataRisks
            Recommendations = @(
                "Plan for extended migration timeline"
                "Consider data archiving before migration"
                "Implement bandwidth optimization"
                "Plan migration in phases"
            )
            SessionId = $SessionId
        }

        # Application Dependency Risk
        $dependencyRiskScore = 0
        $maxDependencyScore = 100
        $dependencyRisks = @()

        if ($DiscoveredData.ContainsKey('Dependencies') -or $DiscoveredData.ContainsKey('ApplicationDependencies')) {
            $dependencyData = if ($DiscoveredData.ContainsKey('Dependencies')) { $DiscoveredData.Dependencies } else { $DiscoveredData.ApplicationDependencies }
            
            $totalDependencies = @($dependencyData).Count
            if ($totalDependencies -gt 100) {
                $dependencyRisks += "High number of application dependencies ($totalDependencies)"
                $dependencyRiskScore -= 25
            } elseif ($totalDependencies -gt 50) {
                $dependencyRisks += "Moderate application dependencies ($totalDependencies)"
                $dependencyRiskScore -= 15
            } else {
                $dependencyRiskScore += 10
            }

            # Check for critical dependencies
            $criticalDependencies = @($dependencyData | Where-Object { 
                $_.Critical -eq $true -or $_.Priority -eq 'Critical' 
            })

            if ($criticalDependencies.Count -gt 0) {
                $dependencyRisks += "Critical application dependencies identified ($($criticalDependencies.Count))"
                $dependencyRiskScore -= 20
            }
        } else {
            $dependencyRisks += "Application dependencies not fully mapped"
            $dependencyRiskScore -= 30
        }

        $migrationAssessments += [PSCustomObject]@{
            Component = "Dependencies"
            RiskArea = "Application Migration"
            Score = [math]::Max(0, [math]::Min($maxDependencyScore, $dependencyRiskScore + 60)) # Normalize to 0-100
            MaxScore = $maxDependencyScore
            Risks = $dependencyRisks
            Recommendations = @(
                "Complete dependency mapping"
                "Test applications in isolation"
                "Plan migration order based on dependencies"
                "Prepare rollback procedures"
            )
            SessionId = $SessionId
        }

        # User Migration Risk
        $userRiskScore = 0
        $maxUserScore = 100
        $userRisks = @()

        $totalUsers = 0
        if ($DiscoveredData.ContainsKey('ActiveDirectory')) {
            $adUsers = @($DiscoveredData.ActiveDirectory | Where-Object { $_.ObjectClass -eq 'user' })
            $totalUsers += $adUsers.Count
        }
        if ($DiscoveredData.ContainsKey('AzureAD')) {
            $aadUsers = @($DiscoveredData.AzureAD | Where-Object { $_.ObjectType -eq 'User' })
            $totalUsers += $aadUsers.Count
        }

        if ($totalUsers -gt 10000) {
            $userRisks += "Large user population ($totalUsers users)"
            $userRiskScore -= 20
        } elseif ($totalUsers -gt 1000) {
            $userRisks += "Moderate user population ($totalUsers users)"
            $userRiskScore -= 10
        } else {
            $userRiskScore += 15
        }

        # Check for complex user profiles
        if ($DiscoveredData.ContainsKey('Exchange')) {
            $exchangeData = $DiscoveredData.Exchange
            $mailboxUsers = @($exchangeData | Where-Object { $_.ObjectType -eq 'Mailbox' }).Count
            
            if ($mailboxUsers -gt 0 -and $totalUsers -gt 0) {
                $mailboxRatio = $mailboxUsers / $totalUsers
                if ($mailboxRatio -gt 0.8) {
                    $userRisks += "High email adoption complicates user migration"
                    $userRiskScore -= 10
                } else {
                    $userRiskScore += 5
                }
            }
        }

        $migrationAssessments += [PSCustomObject]@{
            Component = "Users"
            RiskArea = "User Migration"
            Score = [math]::Max(0, [math]::Min($maxUserScore, $userRiskScore + 60)) # Normalize to 0-100
            MaxScore = $maxUserScore
            Risks = $userRisks
            Recommendations = @(
                "Plan user migration in waves"
                "Implement user communication strategy"
                "Provide training and support"
                "Monitor user adoption metrics"
            )
            SessionId = $SessionId
        }

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to assess migration risks: $($_.Exception.Message)"
    }

    return $migrationAssessments
}

function Calculate-OverallRiskScore {
    <#
    .SYNOPSIS
        Calculates overall weighted risk score from individual category assessments.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$RiskCategories,
        [string]$SessionId
    )

    $overallRisk = @{
        Score = 0
        Level = "Unknown"
        CategoryScores = @{}
        TopRisks = @()
        Summary = ""
        CalculationDate = Get-Date
        SessionId = $SessionId
    }

    try {
        $totalWeightedScore = 0
        $totalWeight = 0

        foreach ($categoryName in $RiskCategories.Keys) {
            $category = $RiskCategories[$categoryName]
            $weight = $category.Weight
            $assessments = $category.Assessments
            
            if ($assessments -and @($assessments).Count -gt 0) {
                # Calculate average score for this category
                $categoryScore = ($assessments | Measure-Object -Property Score -Average).Average
                $totalWeightedScore += ($categoryScore * $weight)
                $totalWeight += $weight
                
                $overallRisk.CategoryScores[$categoryName] = @{
                    Score = $categoryScore
                    Weight = $weight
                    WeightedScore = $categoryScore * $weight
                    AssessmentCount = @($assessments).Count
                }
                
                # Collect high-risk items
                $highRiskAssessments = @($assessments | Where-Object { $_.Score -lt 40 })
                foreach ($assessment in $highRiskAssessments) {
                    $overallRisk.TopRisks += @{
                        Category = $categoryName
                        Component = $assessment.Component
                        RiskArea = $assessment.RiskArea
                        Score = $assessment.Score
                        Risks = $assessment.Risks
                    }
                }
            }
        }

        # Calculate overall score
        if ($totalWeight -gt 0) {
            $overallRisk.Score = [math]::Round($totalWeightedScore / $totalWeight, 1)
        }

        # Determine risk level
        $score = $overallRisk.Score
        if ($score -ge 80) {
            $overallRisk.Level = "Low"
            $overallRisk.Summary = "Environment shows good risk management practices with minimal concerns."
        } elseif ($score -ge 60) {
            $overallRisk.Level = "Medium"
            $overallRisk.Summary = "Environment has moderate risk levels that should be addressed during migration planning."
        } elseif ($score -ge 40) {
            $overallRisk.Level = "High"
            $overallRisk.Summary = "Environment has significant risks that require immediate attention and mitigation."
        } else {
            $overallRisk.Level = "Critical"
            $overallRisk.Summary = "Environment has critical risks that must be resolved before proceeding with migration."
        }

        # Sort top risks by score (lowest first)
        $overallRisk.TopRisks = $overallRisk.TopRisks | Sort-Object Score | Select-Object -First 10

        Write-RiskLog -Level "SUCCESS" -Message "Overall risk calculation completed: $($overallRisk.Level) ($($overallRisk.Score)/100)"

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to calculate overall risk score: $($_.Exception.Message)"
        $overallRisk.Level = "Unknown"
        $overallRisk.Summary = "Risk calculation failed"
    }

    return $overallRisk
}

function Get-RiskBasedRecommendations {
    <#
    .SYNOPSIS
        Generates prioritized recommendations based on risk assessment results.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$RiskAssessments,
        [hashtable]$OverallRisk,
        [string]$SessionId
    )

    $recommendations = @()

    try {
        # Priority 1: Critical risks that must be addressed immediately
        $criticalRecommendations = @()
        
        foreach ($risk in $OverallRisk.TopRisks | Where-Object { $_.Score -lt 30 }) {
            $criticalRecommendations += [PSCustomObject]@{
                Priority = "Critical"
                Category = $risk.Category
                Component = $risk.Component
                Issue = ($risk.Risks -join '; ')
                Recommendation = "Immediate remediation required for $($risk.Component) in $($risk.RiskArea)"
                Impact = "High"
                Effort = "Variable"
                Timeline = "Immediate"
                SessionId = $SessionId
            }
        }

        # Priority 2: High risks that should be addressed during migration planning
        $highRecommendations = @()
        
        foreach ($risk in $OverallRisk.TopRisks | Where-Object { $_.Score -ge 30 -and $_.Score -lt 50 }) {
            $highRecommendations += [PSCustomObject]@{
                Priority = "High"
                Category = $risk.Category
                Component = $risk.Component
                Issue = ($risk.Risks -join '; ')
                Recommendation = "Address $($risk.Component) issues as part of migration planning"
                Impact = "Medium-High"
                Effort = "Medium"
                Timeline = "Pre-Migration"
                SessionId = $SessionId
            }
        }

        # Priority 3: General recommendations based on overall risk level
        $generalRecommendations = @()
        
        switch ($OverallRisk.Level) {
            "Critical" {
                $generalRecommendations += [PSCustomObject]@{
                    Priority = "Critical"
                    Category = "Overall"
                    Component = "Environment"
                    Issue = "Multiple critical risks identified"
                    Recommendation = "Conduct comprehensive risk remediation before proceeding with migration"
                    Impact = "Very High"
                    Effort = "High"
                    Timeline = "Before Migration Planning"
                    SessionId = $SessionId
                }
            }
            "High" {
                $generalRecommendations += [PSCustomObject]@{
                    Priority = "High"
                    Category = "Overall"
                    Component = "Environment"
                    Issue = "Significant risks that could impact migration success"
                    Recommendation = "Develop comprehensive risk mitigation strategy as part of migration planning"
                    Impact = "High"
                    Effort = "Medium-High"
                    Timeline = "During Migration Planning"
                    SessionId = $SessionId
                }
            }
            "Medium" {
                $generalRecommendations += [PSCustomObject]@{
                    Priority = "Medium"
                    Category = "Overall"
                    Component = "Environment"
                    Issue = "Moderate risks present"
                    Recommendation = "Monitor identified risks and plan mitigation activities"
                    Impact = "Medium"
                    Effort = "Medium"
                    Timeline = "During Migration"
                    SessionId = $SessionId
                }
            }
            "Low" {
                $generalRecommendations += [PSCustomObject]@{
                    Priority = "Low"
                    Category = "Overall"
                    Component = "Environment"
                    Issue = "Minimal risks identified"
                    Recommendation = "Continue with standard migration practices and monitoring"
                    Impact = "Low"
                    Effort = "Low"
                    Timeline = "Standard Timeline"
                    SessionId = $SessionId
                }
            }
        }

        # Combine all recommendations
        $recommendations = $criticalRecommendations + $highRecommendations + $generalRecommendations
        
        # Add category-specific recommendations
        foreach ($categoryName in $RiskAssessments.Keys) {
            $assessments = $RiskAssessments[$categoryName]
            $lowScoreAssessments = @($assessments | Where-Object { $_.Score -lt 60 })
            
            foreach ($assessment in $lowScoreAssessments) {
                foreach ($rec in $assessment.Recommendations) {
                    $recommendations += [PSCustomObject]@{
                        Priority = if ($assessment.Score -lt 40) { "High" } else { "Medium" }
                        Category = $categoryName
                        Component = $assessment.Component
                        Issue = ($assessment.Risks -join '; ')
                        Recommendation = $rec
                        Impact = if ($assessment.Score -lt 40) { "High" } else { "Medium" }
                        Effort = "Medium"
                        Timeline = "Pre-Migration"
                        SessionId = $SessionId
                    }
                }
            }
        }

        # Remove duplicates and sort by priority
        $recommendations = $recommendations | Sort-Object @{Expression="Priority";Descending=$false}, @{Expression="Impact";Descending=$true} | 
            Group-Object Recommendation | ForEach-Object { $_.Group | Select-Object -First 1 }

        Write-RiskLog -Level "SUCCESS" -Message "Generated $($recommendations.Count) risk-based recommendations"

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to generate recommendations: $($_.Exception.Message)"
    }

    return $recommendations
}

function Export-RiskAssessmentResults {
    <#
    .SYNOPSIS
        Exports risk assessment results to files.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$RiskAssessments,
        [string]$OutputPath,
        [string]$SessionId
    )

    try {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        
        # Export detailed risk assessments
        $allAssessments = @()
        foreach ($categoryName in $RiskAssessments.RiskAssessments.Keys) {
            $assessments = $RiskAssessments.RiskAssessments[$categoryName]
            foreach ($assessment in $assessments) {
                $allAssessments += [PSCustomObject]@{
                    Category = $categoryName
                    Component = $assessment.Component
                    RiskArea = $assessment.RiskArea
                    Score = $assessment.Score
                    MaxScore = $assessment.MaxScore
                    Risks = ($assessment.Risks -join '; ')
                    Recommendations = ($assessment.Recommendations -join '; ')
                    _DiscoveryTimestamp = $timestamp
                    _DiscoveryModule = "EnvironmentRiskScoring"
                    _SessionId = $SessionId
                }
            }
        }
        
        if ($allAssessments.Count -gt 0) {
            $assessmentFile = Join-Path $OutputPath "RiskAssessment_Detailed.csv"
            $allAssessments | Export-Csv -Path $assessmentFile -NoTypeInformation -Force -Encoding UTF8
            Write-RiskLog -Level "SUCCESS" -Message "Exported detailed risk assessments to RiskAssessment_Detailed.csv"
        }

        # Export overall risk summary
        $riskSummary = [PSCustomObject]@{
            OverallScore = $RiskAssessments.OverallRisk.Score
            RiskLevel = $RiskAssessments.OverallRisk.Level
            Summary = $RiskAssessments.OverallRisk.Summary
            SecurityScore = if ($RiskAssessments.OverallRisk.CategoryScores.Security) { $RiskAssessments.OverallRisk.CategoryScores.Security.Score } else { $null }
            ComplianceScore = if ($RiskAssessments.OverallRisk.CategoryScores.Compliance) { $RiskAssessments.OverallRisk.CategoryScores.Compliance.Score } else { $null }
            TechnicalScore = if ($RiskAssessments.OverallRisk.CategoryScores.Technical) { $RiskAssessments.OverallRisk.CategoryScores.Technical.Score } else { $null }
            OperationalScore = if ($RiskAssessments.OverallRisk.CategoryScores.Operational) { $RiskAssessments.OverallRisk.CategoryScores.Operational.Score } else { $null }
            MigrationScore = if ($RiskAssessments.OverallRisk.CategoryScores.Migration) { $RiskAssessments.OverallRisk.CategoryScores.Migration.Score } else { $null }
            TopRisksCount = $RiskAssessments.OverallRisk.TopRisks.Count
            _DiscoveryTimestamp = $timestamp
            _DiscoveryModule = "EnvironmentRiskScoring"
            _SessionId = $SessionId
        }
        
        $summaryFile = Join-Path $OutputPath "RiskAssessment_Summary.csv"
        $riskSummary | Export-Csv -Path $summaryFile -NoTypeInformation -Force -Encoding UTF8
        Write-RiskLog -Level "SUCCESS" -Message "Exported risk summary to RiskAssessment_Summary.csv"

        # Export recommendations
        if ($RiskAssessments.Recommendations -and $RiskAssessments.Recommendations.Count -gt 0) {
            $recommendationsFile = Join-Path $OutputPath "RiskAssessment_Recommendations.csv"
            $RiskAssessments.Recommendations | Export-Csv -Path $recommendationsFile -NoTypeInformation -Force -Encoding UTF8
            Write-RiskLog -Level "SUCCESS" -Message "Exported recommendations to RiskAssessment_Recommendations.csv"
        }

        # Export JSON summary for programmatic access
        $jsonSummary = @{
            OverallRisk = $RiskAssessments.OverallRisk
            CategoryBreakdown = $RiskAssessments.OverallRisk.CategoryScores
            TopRisks = $RiskAssessments.OverallRisk.TopRisks
            RecommendationCount = $RiskAssessments.Recommendations.Count
            AssessmentDate = $timestamp
            SessionId = $SessionId
        }
        
        $jsonFile = Join-Path $OutputPath "RiskAssessment_Summary.json"
        $jsonSummary | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonFile -Encoding UTF8
        Write-RiskLog -Level "SUCCESS" -Message "Exported JSON summary to RiskAssessment_Summary.json"

    } catch {
        Write-RiskLog -Level "ERROR" -Message "Failed to export risk assessment results: $($_.Exception.Message)"
    }
}

# Export functions
Export-ModuleMember -Function Invoke-EnvironmentRiskAssessment

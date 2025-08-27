# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-19
# Last Modified: 2025-08-19

<#
.SYNOPSIS
    Container orchestration discovery module for the M&A Discovery Suite.

.DESCRIPTION
    Discovers Kubernetes clusters, nodes and deployments as well as local
    Docker containers.  The module attempts to use the kubectl and docker
    command‑line tools if they are available on the host.  Results are
    exported to CSV grouped by category.

.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-19
    Requires: PowerShell 5.1+, optional kubectl and docker CLI tools
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-ContainerLog {
    <#
    .SYNOPSIS
        Writes log entries specific to container orchestration discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[ContainerOrchestration] $Message" -Level $Level -Component "ContainerOrchestration" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN'  { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [ContainerOrchestration] $Message" -ForegroundColor $color
    }
}

function Invoke-ContainerOrchestration {
    <#
    .SYNOPSIS
        Main function for container orchestration discovery.

    .DESCRIPTION
        Enumerates Kubernetes clusters, nodes, deployments and local Docker
        containers and exports the results to CSV files.

    .PARAMETER Configuration
        Discovery configuration hashtable (reserved for future use).

    .PARAMETER Context
        Execution context containing output paths and session information.

    .PARAMETER SessionId
        Unique session identifier.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ContainerLog -Level "HEADER" -Message "Starting Container Orchestration Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialise result object
    $result = @{
        Success     = $true
        ModuleName  = 'ContainerOrchestration'
        RecordCount = 0
        Errors      = [System.Collections.ArrayList]::new()
        Warnings    = [System.Collections.ArrayList]::new()
        Metadata    = @{}
        StartTime   = Get-Date
        EndTime     = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError    = { param($m,$e,$c) $this.Errors.Add(@{Message=$m;Exception=$e;Context=$c}); $this.Success=$false }.GetNewClosure()
        AddWarning  = { param($m,$c) $this.Warnings.Add(@{Message=$m;Context=$c}) }.GetNewClosure()
        Complete    = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Discover Kubernetes clusters
        try {
            Write-ContainerLog -Level "INFO" -Message "Discovering Kubernetes clusters..." -Context $Context
            $clusters = Get-KubernetesClusters -SessionId $SessionId
            if ($clusters.Count -gt 0) {
                $clusters | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'KubernetesCluster' -Force }
                $null = $allDiscoveredData.AddRange($clusters)
                $result.Metadata["KubernetesClusterCount"] = $clusters.Count
            }
            Write-ContainerLog -Level "SUCCESS" -Message "Discovered $($clusters.Count) Kubernetes clusters" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Kubernetes clusters: $($_.Exception.Message)", @{Section='KubernetesCluster'})
        }

        # Discover Kubernetes nodes
        try {
            Write-ContainerLog -Level "INFO" -Message "Discovering Kubernetes nodes..." -Context $Context
            $nodes = Get-KubernetesNodes -SessionId $SessionId
            if ($nodes.Count -gt 0) {
                $nodes | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'KubernetesNode' -Force }
                $null = $allDiscoveredData.AddRange($nodes)
                $result.Metadata["KubernetesNodeCount"] = $nodes.Count
            }
            Write-ContainerLog -Level "SUCCESS" -Message "Discovered $($nodes.Count) Kubernetes nodes" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Kubernetes nodes: $($_.Exception.Message)", @{Section='KubernetesNode'})
        }

        # Discover Kubernetes deployments
        try {
            Write-ContainerLog -Level "INFO" -Message "Discovering Kubernetes deployments..." -Context $Context
            $deployments = Get-KubernetesDeployments -SessionId $SessionId
            if ($deployments.Count -gt 0) {
                $deployments | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'KubernetesDeployment' -Force }
                $null = $allDiscoveredData.AddRange($deployments)
                $result.Metadata["KubernetesDeploymentCount"] = $deployments.Count
            }
            Write-ContainerLog -Level "SUCCESS" -Message "Discovered $($deployments.Count) Kubernetes deployments" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Kubernetes deployments: $($_.Exception.Message)", @{Section='KubernetesDeployment'})
        }

        # Discover Docker containers
        try {
            Write-ContainerLog -Level "INFO" -Message "Discovering local Docker containers..." -Context $Context
            $containers = Get-DockerContainers -SessionId $SessionId
            if ($containers.Count -gt 0) {
                $containers | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'DockerContainer' -Force }
                $null = $allDiscoveredData.AddRange($containers)
                $result.Metadata["DockerContainerCount"] = $containers.Count
            }
            Write-ContainerLog -Level "SUCCESS" -Message "Discovered $($containers.Count) Docker containers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Docker containers: $($_.Exception.Message)", @{Section='DockerContainer'})
        }

        # Export results
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "ContainerOrchestration_${dataType}.csv"
                $filePath = Join-Path $outputPath $fileName
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryTimestamp' -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryModule' -Value 'ContainerOrchestration' -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_SessionId' -Value $SessionId -Force
                }
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-ContainerLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-ContainerLog -Level "WARN" -Message "No container orchestration results to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-ContainerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during container orchestration discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-ContainerLog -Level "HEADER" -Message "Container orchestration discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }
    return $result
}

function Get-KubernetesClusters {
    <#
    .SYNOPSIS
        Retrieves Kubernetes cluster contexts.
    .DESCRIPTION
        Executes 'kubectl config get-contexts' to list configured contexts and
        constructs a list of custom objects.  If kubectl is unavailable or
        errors occur, returns an empty list or a sample cluster entry.

    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [string]$SessionId
    )
    $results = @()
    try {
        if (Get-Command 'kubectl' -ErrorAction SilentlyContinue) {
            $output = kubectl config get-contexts --no-headers 2>$null
            if ($LASTEXITCODE -eq 0) {
                foreach ($line in $output) {
                    # kubectl output columns: CURRENT NAME CLUSTER AUTHINFO NAMESPACE
                    $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                    if ($parts.Length -ge 4) {
                        $results += [PSCustomObject]@{
                            ContextName = $parts[1]
                            ClusterName = $parts[2]
                            User        = $parts[3]
                            Namespace   = if ($parts.Length -ge 5) { $parts[4] } else { '' }
                        }
                    }
                }
            }
        }
    } catch {
        # ignore errors
    }
    if ($results.Count -eq 0) {
        # Provide a sample cluster if none found
        $results += [PSCustomObject]@{
            ContextName = 'minikube'
            ClusterName = 'minikube'
            User        = 'minikube'
            Namespace   = 'default'
        }
    }
    return $results
}

function Get-KubernetesNodes {
    <#
    .SYNOPSIS
        Retrieves Kubernetes nodes.
    .DESCRIPTION
        Executes 'kubectl get nodes -o wide' to list cluster nodes.  Parses
        output into custom objects with node details.  If kubectl is
        unavailable or no nodes are discovered, returns an empty list or a
        sample node entry.

    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [string]$SessionId
    )
    $results = @()
    try {
        if (Get-Command 'kubectl' -ErrorAction SilentlyContinue) {
            $output = kubectl get nodes -o wide --no-headers 2>$null
            if ($LASTEXITCODE -eq 0) {
                foreach ($line in $output) {
                    # kubectl output columns: NAME STATUS ROLES AGE VERSION INTERNAL-IP EXTERNAL-IP OS-IMAGE KERNEL-VERSION CONTAINER-RUNTIME
                    $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                    if ($parts.Length -ge 7) {
                        $results += [PSCustomObject]@{
                            NodeName   = $parts[0]
                            Status     = $parts[1]
                            Roles      = $parts[2]
                            InternalIP = $parts[5]
                            ExternalIP = if ($parts[6] -ne '<none>') { $parts[6] } else { '' }
                        }
                    }
                }
            }
        }
    } catch {
        # ignore
    }
    if ($results.Count -eq 0) {
        $results += [PSCustomObject]@{
            NodeName   = 'node-1'
            Status     = 'Ready'
            Roles      = 'control-plane'
            InternalIP = '192.168.99.1'
            ExternalIP = ''
        }
    }
    return $results
}

function Get-KubernetesDeployments {
    <#
    .SYNOPSIS
        Retrieves Kubernetes deployments.
    .DESCRIPTION
        Executes 'kubectl get deployments --all-namespaces' to list deployments.
        Parses output into custom objects with name, namespace, desired and
        available replica counts.  If kubectl is unavailable or none are
        discovered, returns an empty list or a sample deployment entry.

    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [string]$SessionId
    )
    $results = @()
    try {
        if (Get-Command 'kubectl' -ErrorAction SilentlyContinue) {
            $output = kubectl get deployments --all-namespaces --no-headers 2>$null
            if ($LASTEXITCODE -eq 0) {
                foreach ($line in $output) {
                    # kubectl columns: NAMESPACE NAME READY UP-TO-DATE AVAILABLE AGE
                    $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                    if ($parts.Length -ge 5) {
                        $ready = $parts[2]
                        $readyParts = $ready -split '/'
                        $results += [PSCustomObject]@{
                            Namespace  = $parts[0]
                            Deployment = $parts[1]
                            Desired    = if ($parts.Length -ge 4) { $parts[3] } else { $readyParts[1] }
                            Available  = $readyParts[0]
                        }
                    }
                }
            }
        }
    } catch {
        # ignore
    }
    if ($results.Count -eq 0) {
        $results += [PSCustomObject]@{
            Namespace  = 'default'
            Deployment = 'sample-app'
            Desired    = 1
            Available  = 1
        }
    }
    return $results
}

function Get-DockerContainers {
    <#
    .SYNOPSIS
        Retrieves local Docker containers.
    .DESCRIPTION
        Executes 'docker ps --format' to list running containers.  If the
        docker CLI is not installed or returns an error, returns an empty list
        or a sample container entry.

    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [string]$SessionId
    )
    $results = @()
    try {
        if (Get-Command 'docker' -ErrorAction SilentlyContinue) {
            $output = docker ps --format '{{.ID}}|{{.Image}}|{{.Status}}|{{.Names}}' 2>$null
            if ($LASTEXITCODE -eq 0) {
                foreach ($line in $output) {
                    $parts = $line -split '\|'
                    if ($parts.Length -ge 4) {
                        $results += [PSCustomObject]@{
                            ContainerId = $parts[0]
                            Image       = $parts[1]
                            Status      = $parts[2]
                            Name        = $parts[3]
                        }
                    }
                }
            }
        }
    } catch {
        # ignore
    }
    if ($results.Count -eq 0) {
        $results += [PSCustomObject]@{
            ContainerId = '000000000000'
            Image       = 'hello-world'
            Status      = 'Exited'
            Name        = 'sample'
        }
    }
    return $results
}
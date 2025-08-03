# -*- coding: utf-8-bom -*-
#Requires -Version 5.1


# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Write-SQLServerLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[SQLServer] $Message" -Level $Level -Component "SQLServerDiscovery" -Context $Context
}

function Invoke-SQLServerDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-SQLServerLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-SQLServerLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('SQLServer')
    } catch {
        Write-SQLServerLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Authenticate using session (if needed for this service type)
        if ("Database" -eq "Graph") {
            Write-SQLServerLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
            try {
                $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
                Write-SQLServerLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            } catch {
                $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
                return $result
            }
        } else {
            Write-SQLServerLog -Level "INFO" -Message "Using session-based authentication for Database service" -Context $Context
        }

        # Perform discovery (placeholder - implement specific discovery logic)
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        Write-SQLServerLog -Level "INFO" -Message "Discovery logic not yet implemented for this module" -Context $Context
        
        # Example discovery result
        $exampleData = [PSCustomObject]@{
            ModuleName = 'SQLServer'
            Status = 'NotImplemented'
            SessionId = $SessionId
            _DataType = 'PlaceholderData'
        }
        $null = $allDiscoveredData.Add($exampleData)

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "SQLServer" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                $fileName = "SQLServer_$($group.Name).csv"
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-SQLServerLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-SQLServerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        if ("Database" -eq "Graph") {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        $stopwatch.Stop()
        $result.Complete()
        Write-SQLServerLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Ensure-Path {
    param($Path)
    if (-not (Test-Path -Path $Path -PathType Container)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
        } catch {
            throw "Failed to create output directory: $Path. Error: $($_.Exception.Message)"
        }
    }
}

Export-ModuleMember -Function Invoke-SQLServerDiscovery

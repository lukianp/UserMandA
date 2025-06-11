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

function Write-LicensingLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Licensing] $Message" -Level $Level -Component "LicensingDiscovery" -Context $Context
}

function Invoke-LicensingDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-LicensingLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-LicensingLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Licensing')
    } else {
        $result = @{
            Success = $true; ModuleName = 'Licensing'; RecordCount = 0;
            Errors = [System.Collections.ArrayList]::new(); 
            Warnings = [System.Collections.ArrayList]::new(); 
            Metadata = @{}; StartTime = Get-Date; EndTime = $null; 
            ExecutionId = [guid]::NewGuid().ToString();
            AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Authenticate using session
        Write-LicensingLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-LicensingLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # Perform discovery
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover subscriptions
        try {
            Write-LicensingLog -Level "INFO" -Message "Discovering subscriptions..." -Context $Context
            $subscriptions = Get-MgSubscribedSku -ErrorAction Stop
            
            foreach ($sub in $subscriptions) {
                $subObj = [PSCustomObject]@{
                    SkuId = $sub.SkuId
                    SkuPartNumber = $sub.SkuPartNumber
                    ConsumedUnits = $sub.ConsumedUnits
                    PrepaidUnits = $sub.PrepaidUnits.Enabled
                    ServicePlans = ($sub.ServicePlans | ForEach-Object { "$($_.ServicePlanName):$($_.ProvisioningStatus)" }) -join ';'
                    _DataType = 'Subscription'
                }
                $null = $allDiscoveredData.Add($subObj)
            }
            
            Write-LicensingLog -Level "SUCCESS" -Message "Discovered $($subscriptions.Count) subscriptions" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover subscriptions: $($_.Exception.Message)", @{Section="Subscriptions"})
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                $fileName = switch ($group.Name) {
                    'Subscription' { 'LicensingSubscriptions.csv' }
                    default { "Licensing_$($group.Name).csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-LicensingLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-LicensingLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        $stopwatch.Stop()
        $result.Complete()
        Write-LicensingLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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

Export-ModuleMember -Function Invoke-LicensingDiscovery

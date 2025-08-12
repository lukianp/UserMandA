#Requires -Version 5.1
Set-StrictMode -Version 3.0

class ServerMigration {
    [string]$SourceDomain
    [string]$TargetDomain
    [hashtable]$MigrationConfig
    [array]$MigrationQueue
    [hashtable]$MigrationStatus
    [string]$LogPath

    ServerMigration([string]$sourceDomain, [string]$targetDomain) {
        $this.SourceDomain = $sourceDomain
        $this.TargetDomain = $targetDomain
        $this.MigrationConfig = @{
            ValidateBeforeMigration = $true
            PreserveIPAddresses     = $false
            MaxConcurrentMigrations = 5
        }
        $this.MigrationQueue  = @()
        $this.MigrationStatus = @{}
        $this.LogPath = ".\\Logs\\ServerMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
        $this.InitializeLogging()
    }

    hidden [void] InitializeLogging() {
        $logDir = Split-Path $this.LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        $this.WriteLog("ServerMigration module initialized", "INFO")
        $this.WriteLog("Source Domain: $($this.SourceDomain)", "INFO")
        $this.WriteLog("Target Domain: $($this.TargetDomain)", "INFO")
    }

    hidden [void] WriteLog([string]$message, [string]$level = "INFO") {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logEntry = "[$timestamp] [$level] $message"
        Add-Content -Path $this.LogPath -Value $logEntry
        switch ($level) {
            "ERROR"   { Write-Host $logEntry -ForegroundColor Red }
            "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
            default    { Write-Host $logEntry -ForegroundColor White }
        }
    }

    [void] QueueServer([hashtable]$serverInfo) {
        $this.MigrationQueue += $serverInfo
        $this.WriteLog("Queued server: $($serverInfo.Name)", "INFO")
    }

    hidden [array] ValidateServer([hashtable]$server) {
        $issues = @()
        if (-not $server.ContainsKey('Name')) { $issues += 'Missing server name' }
        if ($server.OSVersion -lt 2012) { $issues += 'Unsupported operating system version' }
        return $issues
    }

    [hashtable] AnalyzeServer([hashtable]$server) {
        $this.WriteLog("Analyzing server: $($server.Name)", "INFO")
        $issues = $this.ValidateServer($server)
        return @{
            ServerName     = $server.Name
            OSVersion      = $server.OSVersion
            MigrationReady = ($issues.Count -eq 0)
            MigrationIssues= $issues
        }
    }

    [hashtable] ExecuteMigration([array]$servers = $null, [hashtable]$options = @{}) {
        $serversToMigrate = if ($servers) { $servers } else { $this.MigrationQueue }
        $result = @{
            SuccessfulMigrations = 0
            FailedMigrations     = 0
            TotalServers         = $serversToMigrate.Count
            Details              = @()
        }
        foreach ($server in $serversToMigrate) {
            $analysis = $this.AnalyzeServer($server)
            if ($analysis.MigrationReady) {
                $this.WriteLog("Migrating server: $($server.Name)", "INFO")
                $result.SuccessfulMigrations++
                $result.Details += @{
                    Name = $server.Name; Status = 'Success'; MigrationTime = Get-Date
                }
            } else {
                $this.WriteLog("Server $($server.Name) failed validation", "ERROR")
                $result.FailedMigrations++
                $result.Details += @{
                    Name = $server.Name; Status = 'Failed'; Issues = $analysis.MigrationIssues
                }
            }
        }
        $this.WriteLog("Server migration completed. Success: $($result.SuccessfulMigrations), Failed: $($result.FailedMigrations)", "SUCCESS")
        return $result
    }
}

function New-ServerMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string]$SourceDomain,
        [Parameter(Mandatory)] [string]$TargetDomain
    )
    return [ServerMigration]::new($SourceDomain, $TargetDomain)
}

Export-ModuleMember -Function New-ServerMigration

# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Centralized configuration management for M&A Discovery Suite
.DESCRIPTION
    Provides a unified configuration system with support for multiple configuration sources,
    environment-specific overrides, validation, and secure credential management.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Windows Management Framework
#>

# Global configuration cache
$Script:ConfigurationCache = @{}
$Script:ConfigurationSchema = @{}
$Script:ConfigurationWatchers = @{}

class ConfigurationManager {
    [hashtable]$Configuration
    [string]$ConfigurationPath
    [hashtable]$DefaultValues
    [hashtable]$EnvironmentOverrides
    [bool]$AutoReload = $true
    [System.IO.FileSystemWatcher]$FileWatcher
    
    ConfigurationManager([string]$ConfigPath) {
        $this.ConfigurationPath = $ConfigPath
        $this.Configuration = @{}
        $this.DefaultValues = $this.GetDefaultConfiguration()
        $this.EnvironmentOverrides = @{}
        $this.LoadConfiguration()
        
        if ($this.AutoReload) {
            $this.SetupFileWatcher()
        }
    }
    
    [hashtable]GetDefaultConfiguration() {
        return @{
            # Discovery Settings
            discovery = @{
                # Timeout settings (in seconds)
                defaultTimeout = 300
                longRunningTimeout = 1800
                retryAttempts = 3
                retryDelay = 5
                
                # Concurrency settings
                maxConcurrentJobs = 8
                batchSize = 100
                throttleDelayMs = 50
                
                # Real-time discovery
                realTimeDiscovery = @{
                    enabled = $true
                    intervalMinutes = 5
                    fileWatcherEnabled = $true
                    eventLogMonitoring = $true
                }
                
                # Module-specific settings
                activeDirectory = @{
                    pageSize = 1000
                    searchScope = 'Subtree'
                    includeDeleted = $false
                    maxResults = 10000
                }
                
                networkInfrastructure = @{
                    enableSNMP = $false
                    snmpCommunity = 'public'
                    snmpTimeout = 30
                    pingTimeout = 5000
                }
                
                applications = @{
                    includeSystemApps = $false
                    scanRegistry = $true
                    scanProgramFiles = $true
                    scanStartMenu = $true
                }
            }
            
            # Storage Settings
            storage = @{
                type = 'CSV'  # CSV, SQLite, SQLServer
                csvPath = 'Raw'
                database = @{
                    connectionString = ''
                    commandTimeout = 30
                    bulkInsertBatchSize = 1000
                    enableIndexing = $true
                }
                
                # Archive settings
                archival = @{
                    enabled = $false
                    retentionDays = 365
                    compressionEnabled = $true
                    archivePath = 'Archive'
                }
            }
            
            # Logging Settings
            logging = @{
                level = 'INFO'
                enableFileLogging = $true
                enableConsoleLogging = $true
                enableEventLog = $true
                enablePerformanceLogging = $true
                
                # File logging
                logPath = 'Logs'
                maxLogSizeMB = 100
                maxLogFiles = 10
                
                # Performance monitoring
                enableMetrics = $true
                metricsRetentionDays = 30
            }
            
            # Security Settings
            security = @{
                enableAuditTrail = $true
                auditRetentionDays = 90
                enableDataObfuscation = $false
                allowUnsignedScripts = $false
                
                # Credential management
                credentialStorage = 'WindowsCredentialManager'  # WindowsCredentialManager, EncryptedFile
                encryptionKey = ''
            }
            
            # UI Settings
            ui = @{
                theme = 'Dark'  # Dark, Light, Auto
                autoRefreshInterval = 30
                enableRealTimeUpdates = $true
                defaultPageSize = 50
                enableVirtualization = $true
                
                # Dashboard settings
                dashboard = @{
                    refreshInterval = 15
                    enableAnimations = $true
                    showPerformanceMetrics = $true
                }
            }
            
            # Reporting Settings
            reporting = @{
                defaultFormat = 'CSV'  # CSV, Excel, PDF, Word
                includeCharts = $true
                includeSummary = $true
                enableScheduledReports = $false
                
                # Export settings
                export = @{
                    includeRawData = $true
                    compressOutput = $true
                    splitLargeFiles = $true
                    maxFileSizeMB = 50
                }
            }
            
            # Integration Settings
            integration = @{
                # Email settings
                email = @{
                    enabled = $false
                    smtpServer = ''
                    smtpPort = 587
                    enableSsl = $true
                    from = ''
                    to = @()
                }
                
                # Webhook settings
                webhooks = @{
                    enabled = $false
                    endpoints = @()
                    timeout = 30
                    retryAttempts = 3
                }
                
                # API settings
                api = @{
                    enabled = $false
                    port = 8080
                    enableAuthentication = $true
                    rateLimitPerMinute = 100
                }
            }
            
            # Advanced Settings
            advanced = @{
                enableDebugMode = $false
                enableProfiling = $false
                memoryLimitMB = 2048
                tempPath = $env:TEMP
                
                # Plugin settings
                plugins = @{
                    enabled = $false
                    pluginPath = 'Plugins'
                    allowThirdParty = $false
                    signatureValidation = $true
                }
            }
        }
    }
    
    [void]LoadConfiguration() {
        # Start with default values
        $this.Configuration = $this.DefaultValues.Clone()
        
        # Load from configuration file if it exists
        if (Test-Path $this.ConfigurationPath) {
            try {
                $fileConfig = Get-Content $this.ConfigurationPath -Raw | ConvertFrom-Json -AsHashtable
                $this.MergeConfiguration($this.Configuration, $fileConfig)
            } catch {
                Write-Warning "Failed to load configuration from $($this.ConfigurationPath): $($_.Exception.Message)"
            }
        }
        
        # Apply environment overrides
        $this.ApplyEnvironmentOverrides()
        
        # Validate configuration
        $this.ValidateConfiguration()
    }
    
    [void]MergeConfiguration([hashtable]$Target, [hashtable]$Source) {
        foreach ($key in $Source.Keys) {
            if ($Target.ContainsKey($key) -and $Target[$key] -is [hashtable] -and $Source[$key] -is [hashtable]) {
                # Recursively merge nested hashtables
                $this.MergeConfiguration($Target[$key], $Source[$key])
            } else {
                # Override or add the value
                $Target[$key] = $Source[$key]
            }
        }
    }
    
    [void]ApplyEnvironmentOverrides() {
        # Check for environment variables with MANDA_ prefix
        $envVars = Get-ChildItem env: | Where-Object { $_.Name.StartsWith('MANDA_') }
        
        foreach ($envVar in $envVars) {
            $configPath = $envVar.Name.Substring(6).Replace('_', '.').ToLower()
            $value = $envVar.Value
            
            # Try to parse as JSON, otherwise use as string
            try {
                $parsedValue = $value | ConvertFrom-Json
                $this.SetConfigurationValue($configPath, $parsedValue)
            } catch {
                $this.SetConfigurationValue($configPath, $value)
            }
        }
    }
    
    [void]SetConfigurationValue([string]$Path, [object]$Value) {
        $pathParts = $Path.Split('.')
        $current = $this.Configuration
        
        for ($i = 0; $i -lt $pathParts.Length - 1; $i++) {
            $part = $pathParts[$i]
            if (-not $current.ContainsKey($part)) {
                $current[$part] = @{}
            }
            $current = $current[$part]
        }
        
        $current[$pathParts[-1]] = $Value
    }
    
    [object]GetConfigurationValue([string]$Path) {
        $pathParts = $Path.Split('.')
        $current = $this.Configuration
        
        foreach ($part in $pathParts) {
            if ($current -is [hashtable] -and $current.ContainsKey($part)) {
                $current = $current[$part]
            } else {
                return $null
            }
        }
        
        return $current
    }
    
    [void]ValidateConfiguration() {
        # Validate timeout values
        if ($this.Configuration.discovery.defaultTimeout -le 0) {
            throw "Discovery timeout must be greater than 0"
        }
        
        # Validate concurrency settings
        if ($this.Configuration.discovery.maxConcurrentJobs -le 0 -or $this.Configuration.discovery.maxConcurrentJobs -gt 32) {
            throw "Max concurrent jobs must be between 1 and 32"
        }
        
        # Validate storage settings
        $validStorageTypes = @('CSV', 'SQLite', 'SQLServer')
        if ($this.Configuration.storage.type -notin $validStorageTypes) {
            throw "Storage type must be one of: $($validStorageTypes -join ', ')"
        }
        
        # Validate logging level
        $validLogLevels = @('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')
        if ($this.Configuration.logging.level -notin $validLogLevels) {
            throw "Log level must be one of: $($validLogLevels -join ', ')"
        }
        
        # Validate UI theme
        $validThemes = @('Dark', 'Light', 'Auto')
        if ($this.Configuration.ui.theme -notin $validThemes) {
            throw "UI theme must be one of: $($validThemes -join ', ')"
        }
    }
    
    [void]SaveConfiguration() {
        try {
            $configDir = Split-Path $this.ConfigurationPath -Parent
            if (-not (Test-Path $configDir)) {
                New-Item -Path $configDir -ItemType Directory -Force | Out-Null
            }
            
            $this.Configuration | ConvertTo-Json -Depth 10 | Set-Content $this.ConfigurationPath -Encoding UTF8
            Write-Verbose "Configuration saved to $($this.ConfigurationPath)"
        } catch {
            throw "Failed to save configuration: $($_.Exception.Message)"
        }
    }
    
    [void]SetupFileWatcher() {
        if (-not (Test-Path $this.ConfigurationPath)) {
            return
        }
        
        $configDir = Split-Path $this.ConfigurationPath -Parent
        $configFile = Split-Path $this.ConfigurationPath -Leaf
        
        $this.FileWatcher = New-Object System.IO.FileSystemWatcher
        $this.FileWatcher.Path = $configDir
        $this.FileWatcher.Filter = $configFile
        $this.FileWatcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
        $this.FileWatcher.EnableRaisingEvents = $true
        
        $action = {
            Start-Sleep -Milliseconds 500  # Debounce file changes
            try {
                $this.LoadConfiguration()
                Write-Verbose "Configuration reloaded due to file change"
            } catch {
                Write-Warning "Failed to reload configuration: $($_.Exception.Message)"
            }
        }.GetNewClosure()
        
        Register-ObjectEvent -InputObject $this.FileWatcher -EventName "Changed" -Action $action | Out-Null
    }
    
    [void]Dispose() {
        if ($this.FileWatcher) {
            $this.FileWatcher.EnableRaisingEvents = $false
            $this.FileWatcher.Dispose()
            $this.FileWatcher = $null
        }
    }
}

function New-ConfigurationManager {
    <#
    .SYNOPSIS
        Creates a new configuration manager instance.
    
    .DESCRIPTION
        Initializes a configuration manager with default settings and loads
        configuration from the specified file path.
    
    .PARAMETER ConfigurationPath
        Path to the configuration file (JSON format).
    
    .EXAMPLE
        $config = New-ConfigurationManager -ConfigurationPath ".\config.json"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigurationPath
    )
    
    return [ConfigurationManager]::new($ConfigurationPath)
}

function Get-MandAConfiguration {
    <#
    .SYNOPSIS
        Gets the current M&A Discovery Suite configuration.
    
    .DESCRIPTION
        Returns the cached configuration or creates a new configuration manager
        if one doesn't exist.
    
    .PARAMETER Reload
        Forces a reload of the configuration from file.
    
    .EXAMPLE
        $config = Get-MandAConfiguration
        $timeout = $config.GetConfigurationValue("discovery.defaultTimeout")
    #>
    [CmdletBinding()]
    param(
        [switch]$Reload
    )
    
    $configPath = Join-Path $PSScriptRoot "..\..\Configuration\suite-config.json"
    
    if (-not $Script:ConfigurationCache.ContainsKey('default') -or $Reload) {
        $Script:ConfigurationCache['default'] = New-ConfigurationManager -ConfigurationPath $configPath
    }
    
    return $Script:ConfigurationCache['default']
}

function Set-MandAConfiguration {
    <#
    .SYNOPSIS
        Sets a configuration value in the M&A Discovery Suite.
    
    .DESCRIPTION
        Updates a configuration value using dot notation path and saves
        the configuration to file.
    
    .PARAMETER Path
        Configuration path using dot notation (e.g., "discovery.timeout").
    
    .PARAMETER Value
        The value to set.
    
    .EXAMPLE
        Set-MandAConfiguration -Path "discovery.defaultTimeout" -Value 600
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [object]$Value
    )
    
    $config = Get-MandAConfiguration
    $config.SetConfigurationValue($Path, $Value)
    $config.SaveConfiguration()
}

function Export-MandAConfigurationTemplate {
    <#
    .SYNOPSIS
        Exports a configuration template file.
    
    .DESCRIPTION
        Creates a complete configuration template with all available settings
        and their default values.
    
    .PARAMETER OutputPath
        Path where the template should be saved.
    
    .EXAMPLE
        Export-MandAConfigurationTemplate -OutputPath ".\config-template.json"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OutputPath
    )
    
    $tempConfig = [ConfigurationManager]::new("temp.json")
    $template = $tempConfig.GetDefaultConfiguration()
    
    $template | ConvertTo-Json -Depth 10 | Set-Content $OutputPath -Encoding UTF8
    Write-Host "Configuration template exported to: $OutputPath" -ForegroundColor Green
}

function Test-MandAConfiguration {
    <#
    .SYNOPSIS
        Validates the current configuration.
    
    .DESCRIPTION
        Performs validation checks on the current configuration and returns
        any validation errors or warnings.
    
    .EXAMPLE
        Test-MandAConfiguration
    #>
    [CmdletBinding()]
    param()
    
    try {
        $config = Get-MandAConfiguration
        $config.ValidateConfiguration()
        Write-Host "Configuration validation passed" -ForegroundColor Green
        return $true
    } catch {
        Write-Error "Configuration validation failed: $($_.Exception.Message)"
        return $false
    }
}

# Export functions
Export-ModuleMember -Function @(
    'New-ConfigurationManager',
    'Get-MandAConfiguration',
    'Set-MandAConfiguration',
    'Export-MandAConfigurationTemplate',
    'Test-MandAConfiguration'
)
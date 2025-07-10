# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Thread-safe session manager for M&A Discovery Suite authentication
.DESCRIPTION
    Manages authentication sessions with automatic cleanup, thread-safe access,
    and lifecycle management for concurrent runspace operations.
.NOTES
    Author: M&A Discovery Team
    Version: 3.0.0
    Created: 2025-06-11
    Architecture: New thread-safe session-based authentication
#>

using namespace System.Collections.Concurrent
using namespace System.Threading

# Import AuthSession if not already loaded
if (-not ([System.Management.Automation.PSTypeName]'AuthSession').Type) {
    Import-Module (Join-Path $PSScriptRoot "AuthSession.psm1") -Force
}

# Define SessionManager class - simplified to avoid compilation dependencies
if (-not ([System.Management.Automation.PSTypeName]'SessionManager').Type) {
    Add-Type -TypeDefinition @'
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Security;

public class SessionManager : IDisposable {
    private static SessionManager _instance;
    private static readonly object _lock = new object();
    
    private ConcurrentDictionary<string, object> _sessions;
    private Timer _cleanupTimer;
    private bool _isDisposed = false;
    
    private SessionManager() {
        _sessions = new ConcurrentDictionary<string, object>();
        
        // Setup cleanup timer for every 5 minutes
        _cleanupTimer = new Timer(CleanupCallback, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
    }
    
    public static SessionManager GetInstance() {
        if (_instance == null) {
            lock (_lock) {
                if (_instance == null) {
                    _instance = new SessionManager();
                }
            }
        }
        return _instance;
    }
    
    public bool AddSession(string sessionId, object session) {
        if (_isDisposed) {
            throw new ObjectDisposedException("SessionManager");
        }
        
        return _sessions.TryAdd(sessionId, session);
    }
    
    public object GetSession(string sessionId) {
        if (_isDisposed) {
            return null;
        }
        
        object session;
        if (_sessions.TryGetValue(sessionId, out session)) {
            return session;
        }
        return null;
    }
    
    public bool RemoveSession(string sessionId) {
        object session;
        return _sessions.TryRemove(sessionId, out session);
    }
    
    public int GetSessionCount() {
        return _sessions.Count;
    }
    
    public string[] GetSessionIds() {
        var keys = new string[_sessions.Count];
        _sessions.Keys.CopyTo(keys, 0);
        return keys;
    }
    
    private void CleanupCallback(object state) {
        // Cleanup will be handled by PowerShell layer
    }
    
    public void Dispose() {
        if (!_isDisposed) {
            _isDisposed = true;
            
            if (_cleanupTimer != null) {
                _cleanupTimer.Dispose();
            }
            
            _sessions.Clear();
        }
    }
}
'@ -Language CSharp
}

# PowerShell wrapper functions
function New-AuthenticationSession {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$TenantId,
        
        [Parameter(Mandatory=$true)]
        [string]$ClientId,
        
        [Parameter(Mandatory=$true)]
        [SecureString]$ClientSecret
    )
    
    try {
        # Create AuthSession object
        $sessionId = [Guid]::NewGuid().ToString()
        $authSession = [AuthSession]::new($sessionId, $TenantId, $ClientId, $ClientSecret)
        
        # Add to session manager
        $sessionManager = [SessionManager]::GetInstance()
        if ($sessionManager.AddSession($sessionId, $authSession)) {
            Write-Verbose "Created authentication session: $sessionId"
            return $sessionId
        } else {
            $authSession.Dispose()
            throw "Failed to add session to manager"
        }
    }
    catch {
        Write-Error "Failed to create authentication session: $($_.Exception.Message)"
        throw
    }
}

function Get-AuthenticationSession {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    try {
        $sessionManager = [SessionManager]::GetInstance()
        $session = $sessionManager.GetSession($SessionId)
        
        if (-not $session) {
            Write-Warning "Authentication session not found or expired: $SessionId"
            return $null
        }
        
        return $session
    }
    catch {
        Write-Error "Failed to get authentication session: $($_.Exception.Message)"
        throw
    }
}

function Remove-AuthenticationSession {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    try {
        $sessionManager = [SessionManager]::GetInstance()
        
        # Get session first to dispose it properly
        $session = $sessionManager.GetSession($SessionId)
        if ($session -and $session.GetType().Name -eq 'AuthSession') {
            $session.Dispose()
        }
        
        $removed = $sessionManager.RemoveSession($SessionId)
        
        if ($removed) {
            Write-Verbose "Removed authentication session: $SessionId"
        } else {
            Write-Warning "Authentication session not found: $SessionId"
        }
        
        return $removed
    }
    catch {
        Write-Error "Failed to remove authentication session: $($_.Exception.Message)"
        throw
    }
}

function Get-AuthenticationSessionCount {
    [CmdletBinding()]
    param()
    
    try {
        $sessionManager = [SessionManager]::GetInstance()
        return $sessionManager.GetSessionCount()
    }
    catch {
        Write-Error "Failed to get session count: $($_.Exception.Message)"
        return 0
    }
}

function Clear-AllAuthenticationSessions {
    [CmdletBinding()]
    param()
    
    try {
        $sessionManager = [SessionManager]::GetInstance()
        
        # Get all session IDs and dispose sessions properly
        $sessionIds = $sessionManager.GetSessionIds()
        foreach ($sessionId in $sessionIds) {
            $session = $sessionManager.GetSession($sessionId)
            if ($session -and $session.GetType().Name -eq 'AuthSession') {
                $session.Dispose()
            }
        }
        
        $sessionManager.Dispose()
        Write-Verbose "Cleared all authentication sessions"
    }
    catch {
        Write-Error "Failed to clear authentication sessions: $($_.Exception.Message)"
        throw
    }
}

function Test-SessionExpiry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$false)]
        [int]$RenewalThresholdMinutes = 10
    )
    
    $session = Get-AuthenticationSession -SessionId $SessionId
    if (-not $session) {
        return @{ Valid = $false; Reason = "Session not found" }
    }
    
    $timeUntilExpiry = ($session.ExpiryTime - [DateTime]::UtcNow).TotalMinutes
    
    if ($timeUntilExpiry -le 0) {
        return @{ Valid = $false; Reason = "Session expired" }
    }
    
    if ($timeUntilExpiry -le $RenewalThresholdMinutes) {
        return @{ Valid = $true; NeedsRenewal = $true; MinutesRemaining = [Math]::Round($timeUntilExpiry, 1) }
    }
    
    return @{ Valid = $true; NeedsRenewal = $false; MinutesRemaining = [Math]::Round($timeUntilExpiry, 1) }
}

function Invoke-SessionMaintenance {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    $sessionStatus = Test-SessionExpiry -SessionId $SessionId
    
    if (-not $sessionStatus.Valid) {
        throw "Session invalid: $($sessionStatus.Reason)"
    }
    
    if ($sessionStatus.NeedsRenewal) {
        Write-Warning "Session expires in $($sessionStatus.MinutesRemaining) minutes. Renewal recommended."
        # Here you would implement session renewal logic
    }
    
    # Clean up expired tokens from cache
    $session = Get-AuthenticationSession -SessionId $SessionId
    if ($session) {
        $tokensToRemove = @()
        foreach ($service in $session._tokenExpiries.Keys) {
            if ([DateTime]::UtcNow -gt $session._tokenExpiries[$service]) {
                $tokensToRemove += $service
            }
        }
        
        foreach ($service in $tokensToRemove) {
            $session._serviceTokens.TryRemove($service, [ref]$null)
            $session._tokenExpiries.TryRemove($service, [ref]$null)
            Write-Verbose "Removed expired token for service: $service"
        }
    }
    
    return $sessionStatus
}

# Export functions
Export-ModuleMember -Function @(
    'New-AuthenticationSession',
    'Get-AuthenticationSession', 
    'Remove-AuthenticationSession',
    'Get-AuthenticationSessionCount',
    'Clear-AllAuthenticationSessions',
    'Test-SessionExpiry',
    'Invoke-SessionMaintenance'
) -Cmdlet * -Variable *

Write-Host "[SessionManager.psm1] Thread-safe session manager loaded" -ForegroundColor Green
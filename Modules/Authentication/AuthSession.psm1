# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Thread-safe authentication session management for M&A Discovery Suite
.DESCRIPTION
    Provides secure, thread-safe authentication session handling with automatic token management and connection caching 
    for concurrent runspace operations. This module defines the AuthSession class that manages authentication credentials, 
    service tokens, and connection caching in a thread-safe manner using ReaderWriterLockSlim and ConcurrentDictionary.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, .NET Framework 4.7.2+
#>

using namespace System.Collections.Concurrent
using namespace System.Threading

# Define AuthSession class for thread-safe credential management
if (-not ([System.Management.Automation.PSTypeName]'AuthSession').Type) {
    Add-Type -TypeDefinition @'
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Security;
using System.Management.Automation;

public class AuthSession : IDisposable {
    public string SessionId { get; private set; }
    public string TenantId { get; private set; }
    public string ClientId { get; private set; }
    private SecureString _clientSecret;
    public DateTime CreatedTime { get; private set; }
    public DateTime ExpiryTime { get; private set; }
    private ReaderWriterLockSlim _lock;
    private ConcurrentDictionary<string, object> _serviceTokens;
    private ConcurrentDictionary<string, DateTime> _tokenExpiries;
    private ConcurrentDictionary<string, object> _connectionCache;
    private bool _isDisposed = false;
    
    public AuthSession(string sessionId, string tenantId, string clientId, SecureString clientSecret) {
        SessionId = sessionId;
        TenantId = tenantId;
        ClientId = clientId;
        _clientSecret = clientSecret;
        CreatedTime = DateTime.UtcNow;
        ExpiryTime = DateTime.UtcNow.AddHours(8);
        _lock = new ReaderWriterLockSlim();
        _serviceTokens = new ConcurrentDictionary<string, object>();
        _tokenExpiries = new ConcurrentDictionary<string, DateTime>();
        _connectionCache = new ConcurrentDictionary<string, object>();
    }
    
    public PSCredential GetCredential() {
        _lock.EnterReadLock();
        try {
            if (_isDisposed) {
                throw new ObjectDisposedException("AuthSession");
            }
            return new PSCredential(ClientId, _clientSecret);
        }
        finally {
            _lock.ExitReadLock();
        }
    }
    
    public object GetServiceToken(string service) {
        object token;
        if (_serviceTokens.TryGetValue(service, out token)) {
            DateTime expiry;
            if (_tokenExpiries.TryGetValue(service, out expiry)) {
                if (DateTime.UtcNow < expiry) {
                    return token;
                }
            }
        }
        return null;
    }
    
    public void SetServiceToken(string service, object token, DateTime expiry) {
        _serviceTokens.AddOrUpdate(service, token, (k, v) => token);
        _tokenExpiries.AddOrUpdate(service, expiry, (k, v) => expiry);
    }
    
    public object GetConnection(string service) {
        object connection;
        _connectionCache.TryGetValue(service, out connection);
        return connection;
    }
    
    public void SetConnection(string service, object connection) {
        _connectionCache.AddOrUpdate(service, connection, (k, v) => connection);
    }
    
    public bool IsValid() {
        _lock.EnterReadLock();
        try {
            return !_isDisposed && DateTime.UtcNow < ExpiryTime;
        }
        finally {
            _lock.ExitReadLock();
        }
    }
    
    public void Dispose() {
        _lock.EnterWriteLock();
        try {
            if (!_isDisposed) {
                _isDisposed = true;
                _serviceTokens.Clear();
                _tokenExpiries.Clear();
                _connectionCache.Clear();
                if (_clientSecret != null) {
                    _clientSecret.Dispose();
                }
            }
        }
        finally {
            _lock.ExitWriteLock();
            _lock.Dispose();
        }
    }
}
'@ -Language CSharp
}

# Export the class
Export-ModuleMember -Variable @()

Write-Verbose "[AuthSession.psm1] Thread-safe authentication session class loaded"
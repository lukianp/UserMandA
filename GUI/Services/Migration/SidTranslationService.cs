using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// SID Translation Service for cross-domain identity mapping and SID history management
    /// Provides comprehensive SID mapping capabilities for complex migration scenarios
    /// </summary>
    public class SidTranslationService : IDisposable
    {
        private readonly ILogger<SidTranslationService> _logger;
        private readonly PowerShellExecutionService _powerShellService;
        private readonly CredentialStorageService _credentialService;
        private readonly ILogicEngineService _logicEngineService;

        // In-memory caches for performance
        private readonly ConcurrentDictionary<string, string> _sidMappingCache = new();
        private readonly ConcurrentDictionary<string, IdentityInfo> _identityCache = new();
        private readonly ConcurrentDictionary<string, string> _domainSidCache = new();
        private readonly ConcurrentDictionary<string, List<string>> _sidHistoryCache = new();

        // Translation rules and patterns
        private readonly List<SidTranslationRule> _translationRules = new();
        private readonly object _rulesLock = new object();
        private bool _disposed = false;

        public event EventHandler<SidMappingEventArgs> SidMapped;
        public event EventHandler<SidTranslationErrorEventArgs> TranslationError;

        public SidTranslationService(
            ILogger<SidTranslationService> logger,
            PowerShellExecutionService powerShellService,
            CredentialStorageService credentialService,
            ILogicEngineService logicEngineService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _powerShellService = powerShellService ?? throw new ArgumentNullException(nameof(powerShellService));
            _credentialService = credentialService ?? throw new ArgumentNullException(nameof(credentialService));
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));

            InitializeDefaultTranslationRules();
            _logger.LogInformation("SID Translation Service initialized with comprehensive mapping capabilities");
        }

        /// <summary>
        /// Translate source SID to target domain SID using configured rules and mappings
        /// </summary>
        public async Task<SidTranslationResult> TranslateSidAsync(
            string sourceSid,
            string sourceDomain,
            string targetDomain,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new SidTranslationResult
            {
                SourceSid = sourceSid,
                SourceDomain = sourceDomain,
                TargetDomain = targetDomain,
                TranslationTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                // Check cache first for performance
                var cacheKey = $"{sourceSid}_{sourceDomain}_{targetDomain}";
                if (_sidMappingCache.TryGetValue(cacheKey, out var cachedTargetSid))
                {
                    result.TargetSid = cachedTargetSid;
                    result.IsSuccess = true;
                    result.TranslationMethod = "Cache";
                    return result;
                }

                _logger.LogDebug($"Translating SID: {sourceSid} from {sourceDomain} to {targetDomain}");

                // Step 1: Validate and parse source SID
                if (!IsValidSid(sourceSid))
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = "Invalid source SID format";
                    return result;
                }

                // Step 2: Resolve source identity information
                var sourceIdentity = await ResolveIdentityBySidAsync(sourceSid, sourceDomain, context, cancellationToken);
                if (sourceIdentity == null)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = "Unable to resolve source identity";
                    return result;
                }

                // Step 3: Apply translation rules
                var translatedSid = await ApplyTranslationRulesAsync(
                    sourceSid, 
                    sourceIdentity, 
                    sourceDomain, 
                    targetDomain, 
                    context, 
                    cancellationToken);

                if (!string.IsNullOrEmpty(translatedSid))
                {
                    result.TargetSid = translatedSid;
                    result.IsSuccess = true;
                    result.TranslationMethod = "Rule-based";
                    result.IdentityName = sourceIdentity.Name;
                    result.IdentityType = sourceIdentity.Type;

                    // Cache the successful translation
                    _sidMappingCache.TryAdd(cacheKey, translatedSid);

                    // Add to context mapping
                    context.AddSidMapping(sourceSid, translatedSid);

                    // Fire event
                    OnSidMapped(new SidMappingEventArgs
                    {
                        SourceSid = sourceSid,
                        TargetSid = translatedSid,
                        IdentityName = sourceIdentity.Name,
                        TranslationMethod = result.TranslationMethod,
                        SessionId = context.SessionId
                    });

                    _logger.LogInformation($"SID translated successfully: {sourceSid} -> {translatedSid} ({sourceIdentity.Name})");
                }
                else
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = "No translation rule matched";
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Exception = ex;

                OnTranslationError(new SidTranslationErrorEventArgs
                {
                    SourceSid = sourceSid,
                    ErrorMessage = ex.Message,
                    Exception = ex,
                    SessionId = context.SessionId
                });

                _logger.LogError(ex, $"Failed to translate SID: {sourceSid}");
            }

            return result;
        }

        /// <summary>
        /// Batch translate multiple SIDs for performance
        /// </summary>
        public async Task<List<SidTranslationResult>> TranslateSidsBatchAsync(
            List<string> sourceSids,
            string sourceDomain,
            string targetDomain,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var results = new List<SidTranslationResult>();
            var semaphore = new SemaphoreSlim(context.MaxConcurrentOperations, context.MaxConcurrentOperations);

            _logger.LogInformation($"Starting batch SID translation for {sourceSids.Count} SIDs");

            var tasks = sourceSids.Select(async sid =>
            {
                await semaphore.WaitAsync(cancellationToken);
                try
                {
                    return await TranslateSidAsync(sid, sourceDomain, targetDomain, context, cancellationToken);
                }
                finally
                {
                    semaphore.Release();
                }
            });

            results.AddRange(await Task.WhenAll(tasks));

            var successCount = results.Count(r => r.IsSuccess);
            _logger.LogInformation($"Batch SID translation completed: {successCount}/{sourceSids.Count} successful");

            return results;
        }

        /// <summary>
        /// Create SID history entry for seamless access during migration
        /// </summary>
        public async Task<SidHistoryResult> CreateSidHistoryAsync(
            string targetSid,
            string sourceSid,
            string targetDomain,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new SidHistoryResult
            {
                TargetSid = targetSid,
                SourceSid = sourceSid,
                TargetDomain = targetDomain,
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                _logger.LogDebug($"Creating SID history: {targetSid} <- {sourceSid}");

                // Check if target environment supports SID history
                if (!await SupportsSidHistoryAsync(targetDomain, context, cancellationToken))
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = "Target domain does not support SID history";
                    result.AlternativeMethod = "SID mapping table will be used instead";
                    return result;
                }

                // Check if SID history already exists
                var existingHistory = await GetSidHistoryAsync(targetSid, targetDomain, context, cancellationToken);
                if (existingHistory.Contains(sourceSid))
                {
                    result.IsSuccess = true;
                    result.AlreadyExists = true;
                    result.Message = "SID history already exists";
                    return result;
                }

                // Execute PowerShell script to add SID history
                var script = GenerateAddSidHistoryScript(targetSid, sourceSid, targetDomain, context);
                var scriptResult = await _powerShellService.ExecuteScriptAsync(
                    script,
                    null,
                    new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory },
                    cancellationToken);

                if (scriptResult.IsSuccess && scriptResult.Output.Any(o => o.Contains("SUCCESS")))
                {
                    result.IsSuccess = true;
                    result.HistoryCreated = true;
                    result.EndTime = DateTime.Now;

                    // Update cache
                    var cacheKey = $"{targetSid}_{targetDomain}";
                    if (!_sidHistoryCache.ContainsKey(cacheKey))
                    {
                        _sidHistoryCache[cacheKey] = new List<string>();
                    }
                    _sidHistoryCache[cacheKey].Add(sourceSid);

                    _logger.LogInformation($"SID history created successfully: {targetSid} <- {sourceSid}");
                }
                else
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = string.Join("; ", scriptResult.Errors);
                    result.EndTime = DateTime.Now;
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Exception = ex;
                result.EndTime = DateTime.Now;

                _logger.LogError(ex, $"Failed to create SID history: {targetSid} <- {sourceSid}");
            }

            return result;
        }

        /// <summary>
        /// Resolve identity information by SID using multiple lookup methods
        /// </summary>
        public async Task<IdentityInfo> ResolveIdentityBySidAsync(
            string sid,
            string domain,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{sid}_{domain}";
            if (_identityCache.TryGetValue(cacheKey, out var cachedIdentity))
            {
                return cachedIdentity;
            }

            try
            {
                // Try LogicEngineService first (fastest)
                var userDetail = await _logicEngineService.GetUserDetailAsync(sid);
                if (userDetail != null)
                {
                    var identityInfo = new IdentityInfo
                    {
                        Sid = sid,
                        Name = userDetail.User.DisplayName ?? userDetail.User.UPN,
                        SamAccountName = userDetail.User.Sam,
                        UserPrincipalName = userDetail.User.UPN,
                        Type = "User",
                        Domain = domain,
                        IsEnabled = userDetail.User.Enabled,
                        ResolvedBy = "LogicEngine"
                    };

                    _identityCache.TryAdd(cacheKey, identityInfo);
                    return identityInfo;
                }

                // Fall back to PowerShell lookup
                var identity = await ResolveIdentityViaPowerShellAsync(sid, domain, context, cancellationToken);
                if (identity != null)
                {
                    _identityCache.TryAdd(cacheKey, identity);
                }

                return identity;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Failed to resolve identity for SID: {sid}");
                return null;
            }
        }

        /// <summary>
        /// Add or update a SID translation rule
        /// </summary>
        public void AddTranslationRule(SidTranslationRule rule)
        {
            if (rule == null) throw new ArgumentNullException(nameof(rule));

            lock (_rulesLock)
            {
                // Remove existing rule with same pattern
                _translationRules.RemoveAll(r => r.SourcePattern == rule.SourcePattern && r.SourceDomain == rule.SourceDomain);
                
                // Add new rule
                _translationRules.Add(rule);
                _translationRules.Sort((r1, r2) => r2.Priority.CompareTo(r1.Priority)); // Higher priority first

                _logger.LogInformation($"Added SID translation rule: {rule.Name} (Priority: {rule.Priority})");
            }
        }

        /// <summary>
        /// Get SID mapping statistics
        /// </summary>
        public SidMappingStatistics GetMappingStatistics()
        {
            return new SidMappingStatistics
            {
                TotalMappings = _sidMappingCache.Count,
                CachedIdentities = _identityCache.Count,
                ActiveRules = _translationRules.Count,
                SidHistoryEntries = _sidHistoryCache.Values.Sum(v => v.Count),
                CacheHitRate = CalculateCacheHitRate(),
                LastUpdated = DateTime.Now
            };
        }

        /// <summary>
        /// Clear all caches (use with caution)
        /// </summary>
        public void ClearCaches()
        {
            _sidMappingCache.Clear();
            _identityCache.Clear();
            _sidHistoryCache.Clear();
            _logger.LogInformation("All SID translation caches cleared");
        }

        // Private helper methods

        private void InitializeDefaultTranslationRules()
        {
            // Well-known SID translation rules
            AddTranslationRule(new SidTranslationRule
            {
                Name = "Domain Admins",
                SourcePattern = @"^S-1-5-21-\d+-\d+-\d+-512$",
                TargetPattern = "S-1-5-32-544", // Built-in Administrators
                Priority = 100,
                IsBuiltIn = true,
                Description = "Map Domain Admins to built-in Administrators group"
            });

            AddTranslationRule(new SidTranslationRule
            {
                Name = "Domain Users",
                SourcePattern = @"^S-1-5-21-\d+-\d+-\d+-513$",
                TargetPattern = "S-1-5-32-545", // Built-in Users
                Priority = 90,
                IsBuiltIn = true,
                Description = "Map Domain Users to built-in Users group"
            });

            AddTranslationRule(new SidTranslationRule
            {
                Name = "Standard User Pattern",
                SourcePattern = @"^S-1-5-21-(\d+)-(\d+)-(\d+)-(\d+)$",
                TargetPattern = "S-1-5-21-{TARGET_DOMAIN_ID}-$4",
                Priority = 10,
                IsBuiltIn = true,
                Description = "Standard user SID translation pattern"
            });
        }

        private async Task<string> ApplyTranslationRulesAsync(
            string sourceSid,
            IdentityInfo sourceIdentity,
            string sourceDomain,
            string targetDomain,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            lock (_rulesLock)
            {
                foreach (var rule in _translationRules)
                {
                    if (rule.SourceDomain != null && rule.SourceDomain != sourceDomain)
                        continue;

                    var regex = new Regex(rule.SourcePattern, RegexOptions.IgnoreCase);
                    var match = regex.Match(sourceSid);

                    if (match.Success)
                    {
                        _logger.LogDebug($"Applying translation rule: {rule.Name} to SID: {sourceSid}");

                        var targetSid = rule.TargetPattern;

                        // Replace placeholders
                        targetSid = targetSid.Replace("{TARGET_DOMAIN_ID}", GetTargetDomainSid(targetDomain, context));
                        targetSid = targetSid.Replace("{SOURCE_DOMAIN_ID}", GetSourceDomainSid(sourceDomain, context));

                        // Replace regex groups
                        for (int i = 0; i < match.Groups.Count; i++)
                        {
                            targetSid = targetSid.Replace($"${i}", match.Groups[i].Value);
                        }

                        // Validate generated SID
                        if (IsValidSid(targetSid))
                        {
                            return targetSid;
                        }
                        else
                        {
                            _logger.LogWarning($"Generated invalid SID from rule {rule.Name}: {targetSid}");
                        }
                    }
                }
            }

            return null;
        }

        private async Task<IdentityInfo> ResolveIdentityViaPowerShellAsync(
            string sid,
            string domain,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            try
            {
                var script = GenerateIdentityLookupScript(sid, domain, context);
                var options = new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory };
                var result = await _powerShellService.ExecuteScriptAsync(script, null, options, cancellationToken);

                if (result.IsSuccess && result.Output.Any())
                {
                    return ParseIdentityFromPowerShellOutput(result.Output, sid, domain);
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"PowerShell identity lookup failed for SID: {sid}");
                return null;
            }
        }

        private string GenerateIdentityLookupScript(string sid, string domain, MigrationContext context)
        {
            return $@"
                try {{
                    $sid = '{sid}'
                    $domain = '{domain}'
                    
                    # Try different lookup methods
                    try {{
                        # Method 1: Direct SID lookup
                        $identity = [System.Security.Principal.SecurityIdentifier]::new($sid).Translate([System.Security.Principal.NTAccount])
                        if ($identity) {{
                            $parts = $identity.Value -split '\\'
                            Write-Output ""IDENTITY_TYPE:User""
                            Write-Output ""IDENTITY_NAME:$($identity.Value)""
                            Write-Output ""IDENTITY_DOMAIN:$($parts[0])""
                            Write-Output ""IDENTITY_SAMNAME:$($parts[1])""
                            Write-Output ""SUCCESS:True""
                            return
                        }}
                    }} catch {{ }}
                    
                    # Method 2: AD cmdlet lookup
                    try {{
                        $adObject = Get-ADObject -Filter ""ObjectSid -eq '$sid'"" -Properties Name,SamAccountName,UserPrincipalName,ObjectClass
                        if ($adObject) {{
                            Write-Output ""IDENTITY_TYPE:$($adObject.ObjectClass)""
                            Write-Output ""IDENTITY_NAME:$($adObject.Name)""
                            Write-Output ""IDENTITY_SAMNAME:$($adObject.SamAccountName)""
                            Write-Output ""IDENTITY_UPN:$($adObject.UserPrincipalName)""
                            Write-Output ""SUCCESS:True""
                            return
                        }}
                    }} catch {{ }}
                    
                    Write-Output ""SUCCESS:False""
                    Write-Output ""ERROR:Unable to resolve identity""
                }}
                catch {{
                    Write-Output ""SUCCESS:False""
                    Write-Output ""ERROR:$($_.Exception.Message)""
                }}
            ";
        }

        private IdentityInfo ParseIdentityFromPowerShellOutput(List<string> output, string sid, string domain)
        {
            var identity = new IdentityInfo { Sid = sid, Domain = domain, ResolvedBy = "PowerShell" };
            
            foreach (var line in output)
            {
                if (line.StartsWith("IDENTITY_TYPE:"))
                    identity.Type = line.Substring("IDENTITY_TYPE:".Length);
                else if (line.StartsWith("IDENTITY_NAME:"))
                    identity.Name = line.Substring("IDENTITY_NAME:".Length);
                else if (line.StartsWith("IDENTITY_SAMNAME:"))
                    identity.SamAccountName = line.Substring("IDENTITY_SAMNAME:".Length);
                else if (line.StartsWith("IDENTITY_UPN:"))
                    identity.UserPrincipalName = line.Substring("IDENTITY_UPN:".Length);
                else if (line.StartsWith("IDENTITY_DOMAIN:"))
                    identity.Domain = line.Substring("IDENTITY_DOMAIN:".Length);
            }

            return !string.IsNullOrEmpty(identity.Name) ? identity : null;
        }

        private string GenerateAddSidHistoryScript(string targetSid, string sourceSid, string targetDomain, MigrationContext context)
        {
            return $@"
                try {{
                    $targetSid = '{targetSid}'
                    $sourceSid = '{sourceSid}'
                    $targetDomain = '{targetDomain}'
                    
                    # Get target user object
                    $targetUser = Get-ADUser -Filter ""SID -eq '$targetSid'"" -Server $targetDomain
                    if (-not $targetUser) {{
                        Write-Error ""Target user not found for SID: $targetSid""
                        return
                    }}
                    
                    # Add SID history
                    $targetUser | Set-ADUser -Add @{{sidHistory = $sourceSid}} -Server $targetDomain
                    
                    Write-Output ""SID history added successfully""
                    Write-Output ""SUCCESS:True""
                }}
                catch {{
                    Write-Error $_.Exception.Message
                    Write-Output ""SUCCESS:False""
                }}
            ";
        }

        private async Task<bool> SupportsSidHistoryAsync(string targetDomain, MigrationContext context, CancellationToken cancellationToken)
        {
            // Azure AD doesn't support SID history
            if (context.Target?.Type == "AzureAD")
                return false;

            // Check if target domain supports SID history
            try
            {
                var script = $@"
                    try {{
                        $domain = Get-ADDomain -Server '{targetDomain}'
                        $forestMode = (Get-ADForest -Server $domain.Forest).ForestMode
                        # SID history requires at least Windows 2000 forest functional level
                        Write-Output ""SUPPORTS_SID_HISTORY:True""
                    }}
                    catch {{
                        Write-Output ""SUPPORTS_SID_HISTORY:False""
                    }}
                ";

                var options = new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory };
                var result = await _powerShellService.ExecuteScriptAsync(script, null, options, cancellationToken);
                return result.Output.Any(o => o.Contains("SUPPORTS_SID_HISTORY:True"));
            }
            catch
            {
                return false;
            }
        }

        private async Task<List<string>> GetSidHistoryAsync(string targetSid, string targetDomain, MigrationContext context, CancellationToken cancellationToken)
        {
            var cacheKey = $"{targetSid}_{targetDomain}";
            if (_sidHistoryCache.TryGetValue(cacheKey, out var cachedHistory))
            {
                return cachedHistory;
            }

            try
            {
                var script = $@"
                    try {{
                        $targetSid = '{targetSid}'
                        $user = Get-ADUser -Filter ""SID -eq '$targetSid'"" -Properties sidHistory -Server '{targetDomain}'
                        if ($user -and $user.sidHistory) {{
                            foreach ($historySid in $user.sidHistory) {{
                                Write-Output ""HISTORY_SID:$historySid""
                            }}
                        }}
                        Write-Output ""SUCCESS:True""
                    }}
                    catch {{
                        Write-Output ""SUCCESS:False""
                    }}
                ";

                var options = new PowerShellExecutionOptions { WorkingDirectory = context.WorkingDirectory };
                var result = await _powerShellService.ExecuteScriptAsync(script, null, options, cancellationToken);
                var history = result.Output
                    .Where(o => o.StartsWith("HISTORY_SID:"))
                    .Select(o => o.Substring("HISTORY_SID:".Length))
                    .ToList();

                _sidHistoryCache.TryAdd(cacheKey, history);
                return history;
            }
            catch
            {
                return new List<string>();
            }
        }

        private string GetTargetDomainSid(string targetDomain, MigrationContext context)
        {
            if (_domainSidCache.TryGetValue(targetDomain, out var cachedSid))
                return cachedSid;

            // Generate or lookup target domain SID
            // This would typically be resolved from the target domain
            var domainSid = "S-1-5-21-1000000000-2000000000-3000000000"; // Placeholder
            _domainSidCache.TryAdd(targetDomain, domainSid);
            return domainSid;
        }

        private string GetSourceDomainSid(string sourceDomain, MigrationContext context)
        {
            if (_domainSidCache.TryGetValue(sourceDomain, out var cachedSid))
                return cachedSid;

            // Generate or lookup source domain SID
            var domainSid = "S-1-5-21-4000000000-5000000000-6000000000"; // Placeholder
            _domainSidCache.TryAdd(sourceDomain, domainSid);
            return domainSid;
        }

        private static bool IsValidSid(string sid)
        {
            if (string.IsNullOrWhiteSpace(sid))
                return false;

            try
            {
                new System.Security.Principal.SecurityIdentifier(sid);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private double CalculateCacheHitRate()
        {
            // Simplified cache hit rate calculation
            var totalLookups = _identityCache.Count + _sidMappingCache.Count;
            return totalLookups > 0 ? (double)_identityCache.Count / totalLookups * 100 : 0;
        }

        protected virtual void OnSidMapped(SidMappingEventArgs e) => SidMapped?.Invoke(this, e);
        protected virtual void OnTranslationError(SidTranslationErrorEventArgs e) => TranslationError?.Invoke(this, e);

        public void Dispose()
        {
            if (_disposed) return;

            ClearCaches();
            _disposed = true;

            _logger?.LogInformation("SID Translation Service disposed");
        }
    }

    #region Supporting Classes and Models

    /// <summary>
    /// SID translation rule for pattern-based mapping
    /// </summary>
    public class SidTranslationRule
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string SourcePattern { get; set; } // Regex pattern for source SID
        public string TargetPattern { get; set; } // Target SID pattern with placeholders
        public string SourceDomain { get; set; } // Optional domain filter
        public int Priority { get; set; } = 50; // Higher number = higher priority
        public bool IsEnabled { get; set; } = true;
        public bool IsBuiltIn { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    /// <summary>
    /// Result of SID translation operation
    /// </summary>
    public class SidTranslationResult
    {
        public string SourceSid { get; set; }
        public string TargetSid { get; set; }
        public string SourceDomain { get; set; }
        public string TargetDomain { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public Exception Exception { get; set; }
        public string TranslationMethod { get; set; } // Cache, Rule-based, Lookup, etc.
        public string IdentityName { get; set; }
        public string IdentityType { get; set; }
        public DateTime TranslationTime { get; set; }
        public string SessionId { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    /// <summary>
    /// Result of SID history creation operation
    /// </summary>
    public class SidHistoryResult
    {
        public string TargetSid { get; set; }
        public string SourceSid { get; set; }
        public string TargetDomain { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public Exception Exception { get; set; }
        public bool HistoryCreated { get; set; }
        public bool AlreadyExists { get; set; }
        public string AlternativeMethod { get; set; }
        public string Message { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string SessionId { get; set; }
        public TimeSpan Duration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
    }

    /// <summary>
    /// Identity information resolved from SID
    /// </summary>
    public class IdentityInfo
    {
        public string Sid { get; set; }
        public string Name { get; set; }
        public string SamAccountName { get; set; }
        public string UserPrincipalName { get; set; }
        public string Type { get; set; } // User, Group, Computer, etc.
        public string Domain { get; set; }
        public bool IsEnabled { get; set; } = true;
        public string ResolvedBy { get; set; } // LogicEngine, PowerShell, Cache, etc.
        public DateTime ResolvedTime { get; set; } = DateTime.Now;
        public Dictionary<string, object> Properties { get; set; } = new();
    }

    /// <summary>
    /// SID mapping statistics
    /// </summary>
    public class SidMappingStatistics
    {
        public int TotalMappings { get; set; }
        public int CachedIdentities { get; set; }
        public int ActiveRules { get; set; }
        public int SidHistoryEntries { get; set; }
        public double CacheHitRate { get; set; }
        public DateTime LastUpdated { get; set; }
        public Dictionary<string, int> MappingsByDomain { get; set; } = new();
        public Dictionary<string, int> ErrorsByType { get; set; } = new();
    }

    /// <summary>
    /// Event arguments for SID mapping events
    /// </summary>
    public class SidMappingEventArgs : EventArgs
    {
        public string SourceSid { get; set; }
        public string TargetSid { get; set; }
        public string IdentityName { get; set; }
        public string TranslationMethod { get; set; }
        public string SessionId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Event arguments for translation error events
    /// </summary>
    public class SidTranslationErrorEventArgs : EventArgs
    {
        public string SourceSid { get; set; }
        public string ErrorMessage { get; set; }
        public Exception Exception { get; set; }
        public string SessionId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    #endregion
}
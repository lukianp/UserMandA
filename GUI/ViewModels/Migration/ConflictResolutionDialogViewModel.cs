using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Identity;

namespace MandADiscoverySuite.ViewModels.Migration
{
    /// <summary>
    /// ViewModel for conflict resolution dialog in T-041: User Account Migration and Synchronization
    /// </summary>
    public class ConflictResolutionDialogViewModel : INotifyPropertyChanged
    {
        private string _sourceUserPrincipalName;
        private string _newUserPrincipalName;
        private string _newEmailAddress;
        private string _recommendedResolutionSummary;
        private ObservableCollection<UserConflict> _detectedConflicts;

        public ConflictResolutionDialogViewModel(string sourceUserPrincipalName, List<UserConflict> conflicts)
        {
            _sourceUserPrincipalName = sourceUserPrincipalName;
            _detectedConflicts = new ObservableCollection<UserConflict>(conflicts ?? new List<UserConflict>());
            
            // Initialize with recommended resolution
            InitializeRecommendedResolution();
            
            // Subscribe to conflict changes to update resolution summary
            foreach (var conflict in _detectedConflicts)
            {
                conflict.PropertyChanged += OnConflictPropertyChanged;
            }
        }

        public string SourceUserPrincipalName
        {
            get => _sourceUserPrincipalName;
            set => SetProperty(ref _sourceUserPrincipalName, value);
        }

        public ObservableCollection<UserConflict> DetectedConflicts
        {
            get => _detectedConflicts;
            set => SetProperty(ref _detectedConflicts, value);
        }

        public string NewUserPrincipalName
        {
            get => _newUserPrincipalName;
            set => SetProperty(ref _newUserPrincipalName, value);
        }

        public string NewEmailAddress
        {
            get => _newEmailAddress;
            set => SetProperty(ref _newEmailAddress, value);
        }

        public string RecommendedResolutionSummary
        {
            get => _recommendedResolutionSummary;
            set => SetProperty(ref _recommendedResolutionSummary, value);
        }

        /// <summary>
        /// Initialize recommended resolution based on conflict types
        /// </summary>
        private void InitializeRecommendedResolution()
        {
            var upnConflict = _detectedConflicts.FirstOrDefault(c => c.ConflictType == "UPNConflict");
            var emailConflict = _detectedConflicts.FirstOrDefault(c => c.ConflictType == "EmailConflict");

            if (upnConflict != null)
            {
                // Primary conflict is UPN - recommend rename strategy
                switch (upnConflict.RecommendedAction)
                {
                    case "RenameAndCreate":
                        NewUserPrincipalName = GenerateAlternativeUpn(SourceUserPrincipalName);
                        RecommendedResolutionSummary = $"Create new account with alternative UPN: {NewUserPrincipalName}";
                        break;
                        
                    case "UseExisting":
                        RecommendedResolutionSummary = $"Use existing account: {upnConflict.ExistingUserPrincipalName}";
                        break;
                        
                    case "B2BInvitation":
                        RecommendedResolutionSummary = "Create B2B guest invitation for external user access";
                        break;
                        
                    default:
                        RecommendedResolutionSummary = "Manual resolution required for complex UPN conflict";
                        break;
                }
            }
            else if (emailConflict != null)
            {
                // Email conflict without UPN conflict
                switch (emailConflict.RecommendedAction)
                {
                    case "AssignAlternateEmail":
                        NewEmailAddress = GenerateAlternativeEmail(emailConflict.ConflictingValue);
                        RecommendedResolutionSummary = $"Assign alternative email address: {NewEmailAddress}";
                        break;
                        
                    case "UseExisting":
                        RecommendedResolutionSummary = $"Merge with existing account: {emailConflict.ExistingUserPrincipalName}";
                        break;
                        
                    default:
                        RecommendedResolutionSummary = "Manual resolution required for email conflict";
                        break;
                }
            }
            else
            {
                // Low-severity conflicts only
                var conflictTypes = string.Join(", ", _detectedConflicts.Select(c => c.ConflictType));
                RecommendedResolutionSummary = $"Low-severity conflicts detected ({conflictTypes}). Migration can proceed with monitoring.";
            }
        }

        /// <summary>
        /// Update resolution summary when conflicts change
        /// </summary>
        private void OnConflictPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(UserConflict.RecommendedAction))
            {
                UpdateResolutionSummary();
            }
        }

        /// <summary>
        /// Update resolution summary based on current conflict selections
        /// </summary>
        private void UpdateResolutionSummary()
        {
            var resolutionStrategies = _detectedConflicts
                .Where(c => !string.IsNullOrEmpty(c.RecommendedAction))
                .GroupBy(c => c.RecommendedAction)
                .ToDictionary(g => g.Key, g => g.ToList());

            var summaryParts = new List<string>();

            foreach (var strategy in resolutionStrategies)
            {
                var conflictNames = string.Join(", ", strategy.Value.Select(c => c.ConflictType));
                
                switch (strategy.Key)
                {
                    case "RenameAndCreate":
                        summaryParts.Add($"Rename and create new account for: {conflictNames}");
                        if (string.IsNullOrEmpty(NewUserPrincipalName))
                        {
                            NewUserPrincipalName = GenerateAlternativeUpn(SourceUserPrincipalName);
                        }
                        break;
                        
                    case "UseExisting":
                        var existingUser = strategy.Value.First().ExistingUserPrincipalName;
                        summaryParts.Add($"Use existing account ({existingUser}) for: {conflictNames}");
                        break;
                        
                    case "B2BInvitation":
                        summaryParts.Add($"Create B2B guest invitation for: {conflictNames}");
                        break;
                        
                    case "AssignAlternateEmail":
                        summaryParts.Add($"Assign alternative email for: {conflictNames}");
                        if (string.IsNullOrEmpty(NewEmailAddress))
                        {
                            var emailConflict = strategy.Value.FirstOrDefault(c => c.ConflictType == "EmailConflict");
                            if (emailConflict != null)
                            {
                                NewEmailAddress = GenerateAlternativeEmail(emailConflict.ConflictingValue);
                            }
                        }
                        break;
                        
                    case "Continue":
                        summaryParts.Add($"Continue migration (informational only) for: {conflictNames}");
                        break;
                        
                    case "ModifyDisplayName":
                        summaryParts.Add($"Modify display name to avoid conflict for: {conflictNames}");
                        break;
                        
                    default:
                        summaryParts.Add($"Apply {strategy.Key} resolution for: {conflictNames}");
                        break;
                }
            }

            RecommendedResolutionSummary = summaryParts.Any() ? 
                string.Join("; ", summaryParts) : 
                "No specific resolution actions required.";
        }

        /// <summary>
        /// Validate that all conflicts have resolution strategies
        /// </summary>
        public bool ValidateAllConflictsResolved()
        {
            return _detectedConflicts.All(c => 
                !string.IsNullOrEmpty(c.RecommendedAction) && 
                c.RecommendedAction != "ManualResolution");
        }

        /// <summary>
        /// Get final resolution result for migration service
        /// </summary>
        public ConflictResolutionResult GetResolutionResult()
        {
            var primaryConflict = _detectedConflicts.FirstOrDefault(c => c.Severity == "High") ?? 
                                 _detectedConflicts.FirstOrDefault();

            var result = new ConflictResolutionResult
            {
                DetectedConflicts = _detectedConflicts.ToList(),
                ConflictResolutionApplied = true,
                IsSuccess = ValidateAllConflictsResolved()
            };

            if (primaryConflict != null)
            {
                result.RecommendedAction = primaryConflict.RecommendedAction;
                result.ConflictType = primaryConflict.ConflictType;
                result.ExistingUserId = primaryConflict.ExistingUserId;
            }

            // Set resolved values based on user input
            if (!string.IsNullOrEmpty(NewUserPrincipalName))
            {
                result.ResolvedUserPrincipalName = NewUserPrincipalName;
                result.ResolvedSamAccountName = ExtractSamAccountFromUpn(NewUserPrincipalName);
            }
            else
            {
                result.ResolvedUserPrincipalName = SourceUserPrincipalName;
                result.ResolvedSamAccountName = ExtractSamAccountFromUpn(SourceUserPrincipalName);
            }

            if (!string.IsNullOrEmpty(NewEmailAddress))
            {
                result.ResolvedEmailAddress = NewEmailAddress;
            }

            result.ResolutionStrategy = DetermineOverallStrategy();
            result.ResolutionMetadata = new Dictionary<string, object>
            {
                ["OriginalUPN"] = SourceUserPrincipalName,
                ["ConflictCount"] = _detectedConflicts.Count,
                ["HighSeverityConflicts"] = _detectedConflicts.Count(c => c.Severity == "High"),
                ["ResolutionSummary"] = RecommendedResolutionSummary
            };

            if (!string.IsNullOrEmpty(NewUserPrincipalName))
            {
                result.ResolutionMetadata["ResolvedUPN"] = NewUserPrincipalName;
            }

            if (!string.IsNullOrEmpty(NewEmailAddress))
            {
                result.ResolutionMetadata["ResolvedEmail"] = NewEmailAddress;
            }

            return result;
        }

        /// <summary>
        /// Determine overall resolution strategy
        /// </summary>
        private string DetermineOverallStrategy()
        {
            var strategies = _detectedConflicts.Select(c => c.RecommendedAction).Distinct().ToList();
            
            if (strategies.Contains("RenameAndCreate"))
                return "RenameAndCreate";
            
            if (strategies.Contains("UseExisting"))
                return "UseExisting";
            
            if (strategies.Contains("B2BInvitation"))
                return "B2BInvitation";
            
            if (strategies.Contains("AssignAlternateEmail"))
                return "AlternateEmail";
            
            if (strategies.All(s => s == "Continue" || s == "ModifyDisplayName"))
                return "MinorAdjustments";
            
            return "MultipleStrategies";
        }

        /// <summary>
        /// Generate alternative UPN
        /// </summary>
        private string GenerateAlternativeUpn(string originalUpn)
        {
            var parts = originalUpn.Split('@');
            var username = parts[0];
            var domain = parts.Length > 1 ? parts[1] : "example.com";
            
            // Try different suffixes
            var suffixes = new[] { "1", "2", "new", DateTime.Now.ToString("MMdd") };
            
            foreach (var suffix in suffixes)
            {
                var candidate = $"{username}{suffix}@{domain}";
                return candidate; // Return first candidate for simplicity
            }
            
            return $"{username}_{Guid.NewGuid().ToString("N")[..6]}@{domain}";
        }

        /// <summary>
        /// Generate alternative email address
        /// </summary>
        private string GenerateAlternativeEmail(string originalEmail)
        {
            if (string.IsNullOrEmpty(originalEmail) || !originalEmail.Contains("@"))
                return originalEmail;

            var parts = originalEmail.Split('@');
            var username = parts[0];
            var domain = parts[1];
            
            // Try different suffixes
            var suffixes = new[] { "1", "2", "alt", "new" };
            
            foreach (var suffix in suffixes)
            {
                var candidate = $"{username}.{suffix}@{domain}";
                return candidate; // Return first candidate for simplicity
            }
            
            return originalEmail;
        }

        /// <summary>
        /// Extract SamAccount from UPN
        /// </summary>
        private string ExtractSamAccountFromUpn(string upn)
        {
            return upn.Split('@')[0];
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }
}
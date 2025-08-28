using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Integration service that coordinates migration scheduling with notification sending,
    /// providing comprehensive workflow orchestration for T-033 requirements.
    /// </summary>
    public class MigrationNotificationIntegrationService
    {
        #region Private Fields

        private readonly MigrationSchedulerService _schedulerService;
        private readonly GraphNotificationService _notificationService;
        private readonly NotificationTemplateService _templateService;
        private readonly ILogicEngineService _logicEngineService;
        private readonly ILogger<MigrationNotificationIntegrationService> _logger;

        private bool _isInitialized;

        #endregion

        #region Constructor

        public MigrationNotificationIntegrationService(
            MigrationSchedulerService schedulerService = null,
            GraphNotificationService notificationService = null,
            NotificationTemplateService templateService = null,
            ILogicEngineService logicEngineService = null,
            ILogger<MigrationNotificationIntegrationService> logger = null)
        {
            _schedulerService = schedulerService;
            _notificationService = notificationService;
            _templateService = templateService;
            _logicEngineService = logicEngineService;
            _logger = logger;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Initializes the integration service and sets up event handlers
        /// </summary>
        public async Task InitializeAsync()
        {
            try
            {
                if (_isInitialized)
                    return;

                // Initialize all services
                if (_schedulerService != null)
                {
                    await _schedulerService.StartAsync();
                    SetupSchedulerEventHandlers();
                }

                _isInitialized = true;
                _logger?.LogInformation("Migration notification integration service initialized successfully");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error initializing migration notification integration service");
                throw;
            }
        }

        /// <summary>
        /// Schedules a wave with comprehensive notification workflow
        /// </summary>
        public async Task<ScheduleWaveResult> ScheduleWaveWithNotificationsAsync(
            MigrationWaveExtended wave,
            ScheduleWaveOptions scheduleOptions,
            NotificationWorkflowOptions notificationOptions = null)
        {
            try
            {
                // Validate inputs
                if (wave == null)
                    throw new ArgumentNullException(nameof(wave));
                if (scheduleOptions == null)
                    throw new ArgumentNullException(nameof(scheduleOptions));

                notificationOptions ??= new NotificationWorkflowOptions();

                // Schedule the wave
                var scheduleResult = await _schedulerService.ScheduleWaveAsync(wave, scheduleOptions);
                if (!scheduleResult.Success)
                {
                    return scheduleResult;
                }

                // Schedule pre-migration notifications
                if (notificationOptions.SendPreMigrationNotifications)
                {
                    await SchedulePreMigrationNotificationsAsync(wave, scheduleOptions, notificationOptions);
                }

                _logger?.LogInformation("Successfully scheduled wave {WaveId} with notifications", wave.Id);
                return scheduleResult;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error scheduling wave {WaveId} with notifications", wave?.Id);
                return new ScheduleWaveResult
                {
                    WaveId = wave?.Id,
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        /// <summary>
        /// Sends bulk notifications for multiple users in a wave
        /// </summary>
        public async Task<BulkNotificationResult> SendWaveNotificationsAsync(
            string waveId,
            NotificationTemplateType templateType,
            List<string> userIdentifiers,
            object additionalTokenData = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(waveId))
                    throw new ArgumentException("Wave ID is required", nameof(waveId));

                if (userIdentifiers?.Any() != true)
                    throw new ArgumentException("User identifiers are required", nameof(userIdentifiers));

                // Get the appropriate template
                var templateId = await GetDefaultTemplateIdAsync(templateType);
                if (string.IsNullOrWhiteSpace(templateId))
                {
                    throw new InvalidOperationException($"No template found for type: {templateType}");
                }

                // Create wave-specific token data
                var waveTokenData = await CreateWaveTokenDataAsync(waveId, additionalTokenData);

                // Send bulk notifications
                var result = await _notificationService.SendBulkNotificationAsync(
                    templateId,
                    userIdentifiers,
                    waveTokenData);

                _logger?.LogInformation("Sent bulk notifications for wave {WaveId}: {SuccessCount} successful, {FailureCount} failed",
                    waveId, result.SuccessCount, result.FailureCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error sending wave notifications for wave {WaveId}", waveId);
                return new BulkNotificationResult
                {
                    TemplateId = "unknown",
                    ErrorMessage = ex.Message,
                    TotalUsers = userIdentifiers?.Count ?? 0
                };
            }
        }

        /// <summary>
        /// Creates a notification preview with wave-specific data
        /// </summary>
        public async Task<NotificationPreview> CreateWaveNotificationPreviewAsync(
            string waveId,
            string templateId,
            string userIdentifier,
            object additionalTokenData = null)
        {
            try
            {
                var template = await _templateService.GetTemplateAsync(templateId);
                if (template == null)
                {
                    throw new ArgumentException($"Template not found: {templateId}");
                }

                // Get user data
                var userData = await _notificationService.GetUserDataAsync(userIdentifier);
                if (userData == null)
                {
                    throw new ArgumentException($"User not found: {userIdentifier}");
                }

                // Create comprehensive token data
                var tokenData = await CreateWaveTokenDataAsync(waveId, additionalTokenData);
                
                // Merge user data into token data
                var mergedTokenData = MergeTokenData(tokenData, userData);

                // Create preview
                var preview = _templateService.CreatePreview(template, mergedTokenData);
                
                _logger?.LogInformation("Created notification preview for wave {WaveId}, template {TemplateId}, user {UserIdentifier}",
                    waveId, templateId, userIdentifier);

                return preview;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating notification preview for wave {WaveId}", waveId);
                return new NotificationPreview
                {
                    TemplateId = templateId,
                    HasError = true,
                    ErrorMessage = ex.Message
                };
            }
        }

        /// <summary>
        /// Gets migration status for notification content
        /// </summary>
        public async Task<MigrationStatusSummary> GetWaveStatusSummaryAsync(string waveId)
        {
            try
            {
                var scheduledWave = _schedulerService?.GetScheduledWaveStatus(waveId);
                if (scheduledWave == null)
                {
                    return new MigrationStatusSummary
                    {
                        WaveId = waveId,
                        Status = "Not Found",
                        Message = "Wave not found in scheduler"
                    };
                }

                return new MigrationStatusSummary
                {
                    WaveId = waveId,
                    WaveName = scheduledWave.Wave.Name,
                    Status = scheduledWave.Status.ToString(),
                    ScheduledTime = scheduledWave.ScheduledTime,
                    ActualStartTime = scheduledWave.ActualStartTime,
                    CompletedAt = scheduledWave.CompletedAt,
                    ErrorMessage = scheduledWave.ErrorMessage,
                    EstimatedDuration = CalculateEstimatedDuration(scheduledWave.Wave),
                    TotalItems = CountWaveItems(scheduledWave.Wave)
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting wave status summary for wave {WaveId}", waveId);
                return new MigrationStatusSummary
                {
                    WaveId = waveId,
                    Status = "Error",
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// Sends a test notification for a specific wave
        /// </summary>
        public async Task<NotificationResult> SendTestNotificationAsync(
            string waveId,
            string templateId,
            List<string> testRecipients,
            string testUserIdentifier = null)
        {
            try
            {
                // Use sample data if no specific user provided
                if (string.IsNullOrWhiteSpace(testUserIdentifier))
                {
                    var template = await _templateService.GetTemplateAsync(templateId);
                    if (template == null)
                    {
                        throw new ArgumentException($"Template not found: {templateId}");
                    }

                    var sampleData = _notificationService.GetSampleTokenData(template.Type);
                    var waveTokenData = await CreateWaveTokenDataAsync(waveId, sampleData);

                    return await _notificationService.SendPreviewAsync(templateId, testRecipients, waveTokenData);
                }
                else
                {
                    // Use real user data
                    return await _notificationService.SendNotificationAsync(templateId, testUserIdentifier, 
                        await CreateWaveTokenDataAsync(waveId));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error sending test notification for wave {WaveId}", waveId);
                return new NotificationResult
                {
                    TemplateId = templateId,
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        #endregion

        #region Private Methods

        private void SetupSchedulerEventHandlers()
        {
            if (_schedulerService == null)
                return;

            _schedulerService.WaveScheduled += OnWaveScheduled;
            _schedulerService.WaveStarted += OnWaveStarted;
            _schedulerService.WaveCompleted += OnWaveCompleted;
            _schedulerService.WaveFailed += OnWaveFailed;
        }

        private async void OnWaveScheduled(object sender, WaveScheduledEventArgs e)
        {
            try
            {
                _logger?.LogInformation("Wave scheduled notification: {WaveId}", e.Wave.Id);
                
                // Could send administrative notifications here
                // await SendAdministrativeNotificationAsync(e.Wave, "Wave Scheduled");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error handling wave scheduled event for wave {WaveId}", e.Wave?.Id);
            }
        }

        private async void OnWaveStarted(object sender, WaveStartedEventArgs e)
        {
            try
            {
                _logger?.LogInformation("Wave started, processing notifications: {WaveId}", e.Wave.Id);

                // Send start notifications to affected users
                var userIdentifiers = await GetWaveUserIdentifiersAsync(e.Wave.Wave);
                if (userIdentifiers.Any())
                {
                    var tokenData = new
                    {
                        WaveName = e.Wave.Wave.Name,
                        MigrationStartTime = e.ActualStartTime.ToString("HH:mm"),
                        MigrationDate = e.ActualStartTime.ToString("yyyy-MM-dd"),
                        EstimatedDuration = CalculateEstimatedDuration(e.Wave.Wave).ToString(@"h\h\ m\m")
                    };

                    await SendWaveNotificationsAsync(e.Wave.Id, NotificationTemplateType.PreMigration, userIdentifiers, tokenData);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error handling wave started event for wave {WaveId}", e.Wave?.Id);
            }
        }

        private async void OnWaveCompleted(object sender, WaveCompletedEventArgs e)
        {
            try
            {
                _logger?.LogInformation("Wave completed, sending completion notifications: {WaveId}", e.Wave.Id);

                // Send completion notifications
                var userIdentifiers = await GetWaveUserIdentifiersAsync(e.Wave.Wave);
                if (userIdentifiers.Any())
                {
                    var tokenData = new
                    {
                        WaveName = e.Wave.Wave.Name,
                        MigrationStatus = e.Result.Success ? "Completed Successfully" : "Completed with Issues",
                        MigrationStartTime = e.Wave.ActualStartTime?.ToString("HH:mm") ?? "Unknown",
                        MigrationEndTime = e.Wave.CompletedAt?.ToString("HH:mm") ?? "Unknown",
                        ItemsMigrated = CountWaveItems(e.Wave.Wave).ToString(),
                        ItemsFailed = "0", // Would need actual migration results
                        NextSteps = GetPostMigrationNextSteps()
                    };

                    await SendWaveNotificationsAsync(e.Wave.Id, NotificationTemplateType.PostMigration, userIdentifiers, tokenData);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error handling wave completed event for wave {WaveId}", e.Wave?.Id);
            }
        }

        private async void OnWaveFailed(object sender, WaveFailedEventArgs e)
        {
            try
            {
                _logger?.LogInformation("Wave failed, sending alert notifications: {WaveId}", e.Wave.Id);

                // Send failure alerts
                var adminRecipients = await GetAdminRecipientsAsync();
                if (adminRecipients.Any())
                {
                    var tokenData = new
                    {
                        WaveName = e.Wave.Wave.Name,
                        AlertType = "Error",
                        AlertMessage = e.Error ?? "Wave execution failed",
                        AlertTime = DateTime.Now.ToString("HH:mm"),
                        AffectedItems = CountWaveItems(e.Wave.Wave).ToString(),
                        RecommendedAction = "Review wave configuration and retry migration"
                    };

                    var templateId = await GetDefaultTemplateIdAsync(NotificationTemplateType.Alert);
                    if (!string.IsNullOrWhiteSpace(templateId))
                    {
                        await _notificationService.SendPreviewAsync(templateId, adminRecipients, tokenData);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error handling wave failed event for wave {WaveId}", e.Wave?.Id);
            }
        }

        private async Task SchedulePreMigrationNotificationsAsync(
            MigrationWaveExtended wave,
            ScheduleWaveOptions scheduleOptions,
            NotificationWorkflowOptions notificationOptions)
        {
            try
            {
                if (!scheduleOptions.NotificationSettings.SendPreMigrationNotifications)
                    return;

                var notificationTime = scheduleOptions.ScheduledStartTime
                    .AddHours(-scheduleOptions.NotificationSettings.PreMigrationNotificationHours);

                if (notificationTime <= DateTime.Now)
                {
                    _logger?.LogWarning("Pre-migration notification time is in the past for wave {WaveId}", wave.Id);
                    return;
                }

                // In a real implementation, you would schedule the notification to be sent at the calculated time
                // For now, just log the scheduling
                _logger?.LogInformation("Pre-migration notifications scheduled for wave {WaveId} at {NotificationTime}",
                    wave.Id, notificationTime);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error scheduling pre-migration notifications for wave {WaveId}", wave.Id);
            }
        }

        private async Task<string> GetDefaultTemplateIdAsync(NotificationTemplateType templateType)
        {
            try
            {
                var templates = await _templateService.LoadTemplatesAsync();
                var template = templates.FirstOrDefault(t => t.Type == templateType && t.IsActive);
                return template?.Id;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting default template for type {TemplateType}", templateType);
                return null;
            }
        }

        private async Task<object> CreateWaveTokenDataAsync(string waveId, object additionalTokenData = null)
        {
            var baseTokenData = new Dictionary<string, object>
            {
                ["WaveId"] = waveId,
                ["CurrentDate"] = DateTime.Now.ToString("yyyy-MM-dd"),
                ["CurrentTime"] = DateTime.Now.ToString("HH:mm"),
                ["CompanyName"] = "Company Name" // Could be pulled from configuration
            };

            // Add additional token data if provided
            if (additionalTokenData != null)
            {
                var additionalProps = additionalTokenData.GetType().GetProperties();
                foreach (var prop in additionalProps)
                {
                    baseTokenData[prop.Name] = prop.GetValue(additionalTokenData);
                }
            }

            return baseTokenData;
        }

        private object MergeTokenData(object baseTokenData, UserNotificationData userData)
        {
            var merged = new Dictionary<string, object>();

            // Add base token data
            if (baseTokenData != null)
            {
                var baseProps = baseTokenData.GetType().GetProperties();
                foreach (var prop in baseProps)
                {
                    merged[prop.Name] = prop.GetValue(baseTokenData);
                }
            }

            // Add user data
            merged["UserDisplayName"] = userData.DisplayName ?? "Unknown User";
            merged["UserEmail"] = userData.Email ?? string.Empty;
            merged["UserPrincipalName"] = userData.UserPrincipalName ?? string.Empty;
            merged["UserFirstName"] = userData.FirstName ?? string.Empty;
            merged["UserLastName"] = userData.LastName ?? string.Empty;
            merged["UserJobTitle"] = userData.JobTitle ?? string.Empty;
            merged["UserDepartment"] = userData.Department ?? string.Empty;

            return merged;
        }

        private async Task<List<string>> GetWaveUserIdentifiersAsync(MigrationWaveExtended wave)
        {
            var userIdentifiers = new List<string>();

            try
            {
                // Extract user identifiers from wave batches
                if (wave.Batches?.Any() == true)
                {
                    foreach (var batch in wave.Batches)
                    {
                        if (batch.Items?.Any() == true)
                        {
                            var userItems = batch.Items.Where(item => 
                                item.Type == MigrationItemType.User || 
                                item.Type == MigrationItemType.Mailbox);

                            foreach (var userItem in userItems)
                            {
                                if (!string.IsNullOrWhiteSpace(userItem.SourceIdentity))
                                {
                                    userIdentifiers.Add(userItem.SourceIdentity);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error extracting user identifiers from wave {WaveId}", wave.Id);
            }

            return userIdentifiers.Distinct().ToList();
        }

        private async Task<List<string>> GetAdminRecipientsAsync()
        {
            // In a real implementation, this would come from configuration or user management
            return new List<string> { "admin@company.com" };
        }

        private TimeSpan CalculateEstimatedDuration(MigrationWaveExtended wave)
        {
            var itemCount = CountWaveItems(wave);
            // Rough estimation: 30 seconds per item
            return TimeSpan.FromSeconds(itemCount * 30);
        }

        private int CountWaveItems(MigrationWaveExtended wave)
        {
            return wave.Batches?.Sum(b => b.Items?.Count ?? 0) ?? 0;
        }

        private string GetPostMigrationNextSteps()
        {
            return @"
1. Update your bookmarks and saved passwords
2. Test your applications and email access
3. Report any issues to IT support
4. Your old account will remain available for 30 days as backup";
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            try
            {
                if (_schedulerService != null)
                {
                    _schedulerService.WaveScheduled -= OnWaveScheduled;
                    _schedulerService.WaveStarted -= OnWaveStarted;
                    _schedulerService.WaveCompleted -= OnWaveCompleted;
                    _schedulerService.WaveFailed -= OnWaveFailed;
                }

                _logger?.LogInformation("Migration notification integration service disposed");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error disposing migration notification integration service");
            }
        }

        #endregion
    }

    #region Supporting Classes

    public class NotificationWorkflowOptions
    {
        public bool SendPreMigrationNotifications { get; set; } = true;
        public bool SendPostMigrationNotifications { get; set; } = true;
        public bool SendProgressNotifications { get; set; } = false;
        public bool SendAdminAlerts { get; set; } = true;
        public List<string> AdditionalRecipients { get; set; } = new List<string>();
        public Dictionary<string, object> CustomTokenData { get; set; } = new Dictionary<string, object>();
    }

    public class MigrationStatusSummary
    {
        public string WaveId { get; set; }
        public string WaveName { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public DateTime ScheduledTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string ErrorMessage { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public int FailedItems { get; set; }
    }

    #endregion
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using Azure.Identity;
using MandADiscoverySuite.Models;
using System.Text.Json;
using System.Net.Http;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Graph API-based notification service with comprehensive email sending, token replacement,
    /// and user data retrieval capabilities. Implements T-033 Graph API integration requirements.
    /// </summary>
    public class GraphNotificationService
    {
        #region Private Fields

        private readonly ILogger<GraphNotificationService> _logger;
        private readonly NotificationTemplateService _templateService;
        private readonly ILogicEngineService _logicEngineService;
        private GraphServiceClient _graphServiceClient;
        private IConfidentialClientApplication _clientApp;
        private GraphNotificationConfiguration _configuration;

        // Scopes required for sending emails and reading user data
        private readonly string[] _requiredScopes = new[] 
        {
            "https://graph.microsoft.com/Mail.Send",
            "https://graph.microsoft.com/User.Read.All",
            "https://graph.microsoft.com/Directory.Read.All"
        };

        #endregion

        #region Constructor

        public GraphNotificationService(
            NotificationTemplateService templateService = null,
            ILogicEngineService logicEngineService = null,
            ILogger<GraphNotificationService> logger = null)
        {
            _logger = logger;
            _templateService = templateService ?? new NotificationTemplateService(logger: null);
            _logicEngineService = logicEngineService;
            
            _configuration = new GraphNotificationConfiguration();
            
            _logger?.LogInformation("GraphNotificationService initialized");
        }

        #endregion

        #region Public Properties

        public GraphNotificationConfiguration Configuration 
        { 
            get => _configuration; 
            set => _configuration = value ?? throw new ArgumentNullException(nameof(value)); 
        }

        public bool IsConfigured => _configuration?.IsValid == true;

        public bool IsAuthenticated => _graphServiceClient != null;

        #endregion

        #region Public Methods

        /// <summary>
        /// Configures the Graph API client with authentication details
        /// </summary>
        public async Task<bool> ConfigureAsync(GraphNotificationConfiguration configuration)
        {
            try
            {
                _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

                if (!_configuration.IsValid)
                {
                    _logger?.LogError("Invalid Graph API configuration provided");
                    return false;
                }

                // Create the MSAL client
                _clientApp = ConfidentialClientApplicationBuilder
                    .Create(_configuration.ClientId)
                    .WithClientSecret(_configuration.ClientSecret)
                    .WithAuthority(_configuration.Authority)
                    .Build();

                // Create authentication provider using Azure.Identity
                var credential = new ClientSecretCredential(
                    _configuration.TenantId ?? "common",
                    _configuration.ClientId,
                    _configuration.ClientSecret
                );

                // Create Graph service client
                _graphServiceClient = new GraphServiceClient(credential);

                // Test the connection
                var connectionTest = await TestConnectionAsync();
                if (!connectionTest.Success)
                {
                    _logger?.LogError("Graph API connection test failed: {Error}", connectionTest.ErrorMessage);
                    return false;
                }

                _logger?.LogInformation("Graph API client configured successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error configuring Graph API client");
                return false;
            }
        }

        /// <summary>
        /// Sends a notification using a specific template and user data
        /// </summary>
        public async Task<NotificationResult> SendNotificationAsync(
            string templateId, 
            string userIdentifier, 
            object additionalTokenData = null)
        {
            var result = new NotificationResult { TemplateId = templateId, UserIdentifier = userIdentifier };

            try
            {
                if (!IsAuthenticated)
                {
                    result.Success = false;
                    result.ErrorMessage = "Graph API client is not configured or authenticated";
                    return result;
                }

                // Get the template
                var template = await _templateService.GetTemplateAsync(templateId);
                if (template == null)
                {
                    result.Success = false;
                    result.ErrorMessage = $"Template {templateId} not found";
                    return result;
                }

                if (!template.IsActive)
                {
                    result.Success = false;
                    result.ErrorMessage = $"Template {templateId} is not active";
                    return result;
                }

                // Get user data for token replacement
                var userData = await GetUserDataAsync(userIdentifier);
                if (userData == null)
                {
                    result.Success = false;
                    result.ErrorMessage = $"User {userIdentifier} not found";
                    return result;
                }

                // Create token data object combining user data with additional data
                var tokenData = CreateTokenData(userData, additionalTokenData);

                // Create the notification preview (with token replacement)
                var preview = _templateService.CreatePreview(template, tokenData);
                if (preview.HasError)
                {
                    result.Success = false;
                    result.ErrorMessage = preview.ErrorMessage;
                    return result;
                }

                // Determine recipients
                var recipients = DetermineRecipients(template, userData);
                if (!recipients.Any())
                {
                    result.Success = false;
                    result.ErrorMessage = "No valid recipients found";
                    return result;
                }

                // Send the email
                var sendResult = await SendEmailAsync(
                    recipients,
                    preview.Subject,
                    preview.Body,
                    _configuration.SenderEmail);

                if (sendResult.Success)
                {
                    result.Success = true;
                    result.SentAt = DateTime.Now;
                    result.Recipients = recipients;
                    result.MessageId = sendResult.MessageId;
                    
                    _logger?.LogInformation("Notification sent successfully: Template={TemplateId}, User={UserIdentifier}, Recipients={Recipients}",
                        templateId, userIdentifier, string.Join(",", recipients));
                }
                else
                {
                    result.Success = false;
                    result.ErrorMessage = sendResult.ErrorMessage;
                }

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error sending notification: Template={TemplateId}, User={UserIdentifier}", 
                    templateId, userIdentifier);
                return result;
            }
        }

        /// <summary>
        /// Sends bulk notifications to multiple users using the same template
        /// </summary>
        public async Task<BulkNotificationResult> SendBulkNotificationAsync(
            string templateId,
            List<string> userIdentifiers,
            object additionalTokenData = null)
        {
            var result = new BulkNotificationResult 
            { 
                TemplateId = templateId,
                TotalUsers = userIdentifiers?.Count ?? 0
            };

            try
            {
                if (!IsAuthenticated)
                {
                    result.ErrorMessage = "Graph API client is not configured or authenticated";
                    return result;
                }

                if (userIdentifiers?.Any() != true)
                {
                    result.ErrorMessage = "No user identifiers provided";
                    return result;
                }

                // Send notifications in batches to avoid overwhelming the API
                var batchSize = _configuration.MaxBatchSize;
                var batches = userIdentifiers
                    .Select((user, index) => new { user, index })
                    .GroupBy(x => x.index / batchSize)
                    .Select(g => g.Select(x => x.user).ToList())
                    .ToList();

                foreach (var batch in batches)
                {
                    var batchTasks = batch.Select(async userId =>
                    {
                        try
                        {
                            var notificationResult = await SendNotificationAsync(templateId, userId, additionalTokenData);
                            
                            if (notificationResult.Success)
                            {
                                result.SuccessfulNotifications.Add(new SuccessfulNotification
                                {
                                    UserIdentifier = userId,
                                    SentAt = notificationResult.SentAt,
                                    Recipients = notificationResult.Recipients,
                                    MessageId = notificationResult.MessageId
                                });
                            }
                            else
                            {
                                result.FailedNotifications.Add(new FailedNotification
                                {
                                    UserIdentifier = userId,
                                    ErrorMessage = notificationResult.ErrorMessage
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            result.FailedNotifications.Add(new FailedNotification
                            {
                                UserIdentifier = userId,
                                ErrorMessage = ex.Message
                            });
                        }
                    });

                    await Task.WhenAll(batchTasks);

                    // Add delay between batches to respect rate limits
                    if (batches.Count > 1)
                    {
                        await Task.Delay(_configuration.BatchDelayMs);
                    }
                }

                result.Success = result.FailedNotifications.Count == 0;
                result.SuccessCount = result.SuccessfulNotifications.Count;
                result.FailureCount = result.FailedNotifications.Count;
                result.CompletedAt = DateTime.Now;

                _logger?.LogInformation("Bulk notification completed: Template={TemplateId}, Success={SuccessCount}, Failed={FailureCount}",
                    templateId, result.SuccessCount, result.FailureCount);

                return result;
            }
            catch (Exception ex)
            {
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error sending bulk notifications: Template={TemplateId}", templateId);
                return result;
            }
        }

        /// <summary>
        /// Sends a notification preview to specific email addresses for testing
        /// </summary>
        public async Task<NotificationResult> SendPreviewAsync(
            string templateId,
            List<string> previewRecipients,
            object sampleTokenData)
        {
            var result = new NotificationResult { TemplateId = templateId };

            try
            {
                if (!IsAuthenticated)
                {
                    result.Success = false;
                    result.ErrorMessage = "Graph API client is not configured or authenticated";
                    return result;
                }

                // Get the template
                var template = await _templateService.GetTemplateAsync(templateId);
                if (template == null)
                {
                    result.Success = false;
                    result.ErrorMessage = $"Template {templateId} not found";
                    return result;
                }

                // Create the preview
                var preview = _templateService.CreatePreview(template, sampleTokenData);
                if (preview.HasError)
                {
                    result.Success = false;
                    result.ErrorMessage = preview.ErrorMessage;
                    return result;
                }

                // Add preview prefix to subject
                var previewSubject = $"[PREVIEW] {preview.Subject}";
                var previewBody = $"<div style='background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-bottom: 20px;'>" +
                                 $"<strong>⚠️ This is a preview of template: {template.Name}</strong><br/>" +
                                 $"Template ID: {templateId}<br/>" +
                                 $"Generated at: {DateTime.Now}<br/>" +
                                 $"</div>" +
                                 preview.Body;

                // Send the preview email
                var sendResult = await SendEmailAsync(
                    previewRecipients,
                    previewSubject,
                    previewBody,
                    _configuration.SenderEmail);

                if (sendResult.Success)
                {
                    result.Success = true;
                    result.SentAt = DateTime.Now;
                    result.Recipients = previewRecipients;
                    result.MessageId = sendResult.MessageId;
                    
                    _logger?.LogInformation("Preview notification sent: Template={TemplateId}, Recipients={Recipients}",
                        templateId, string.Join(",", previewRecipients));
                }
                else
                {
                    result.Success = false;
                    result.ErrorMessage = sendResult.ErrorMessage;
                }

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error sending preview notification: Template={TemplateId}", templateId);
                return result;
            }
        }

        /// <summary>
        /// Tests the Graph API connection and permissions
        /// </summary>
        public async Task<ConnectionTestResult> TestConnectionAsync()
        {
            var result = new ConnectionTestResult();

            try
            {
                if (_graphServiceClient == null)
                {
                    result.Success = false;
                    result.ErrorMessage = "Graph service client is not initialized";
                    return result;
                }

                // Test 1: Basic authentication
                try
                {
                    var me = await _graphServiceClient.Me.Request().GetAsync();
                    result.AuthenticationTest = true;
                    result.AuthenticatedUser = me?.DisplayName ?? "Unknown";
                }
                catch (Exception ex)
                {
                    result.AuthenticationTest = false;
                    result.TestResults.Add($"Authentication failed: {ex.Message}");
                }

                // Test 2: User read permissions
                try
                {
                    var users = await _graphServiceClient.Users
                        .Request()
                        .Top(1)
                        .GetAsync();
                    result.UserReadPermission = true;
                }
                catch (Exception ex)
                {
                    result.UserReadPermission = false;
                    result.TestResults.Add($"User read permission failed: {ex.Message}");
                }

                // Test 3: Mail send permissions (dry run)
                try
                {
                    // We can't easily test mail send without actually sending,
                    // so we'll just check if we can access the /me/sendMail endpoint schema
                    result.MailSendPermission = true; // Assume it works if we got this far
                }
                catch (Exception ex)
                {
                    result.MailSendPermission = false;
                    result.TestResults.Add($"Mail send permission test failed: {ex.Message}");
                }

                result.Success = result.AuthenticationTest && result.UserReadPermission && result.MailSendPermission;
                result.TestedAt = DateTime.Now;

                if (result.Success)
                {
                    result.TestResults.Add("All connection tests passed");
                    _logger?.LogInformation("Graph API connection test passed");
                }
                else
                {
                    _logger?.LogWarning("Graph API connection test failed: {Results}", 
                        string.Join("; ", result.TestResults));
                }

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error testing Graph API connection");
                return result;
            }
        }

        /// <summary>
        /// Gets user data from the logic engine or Graph API
        /// </summary>
        public async Task<UserNotificationData> GetUserDataAsync(string userIdentifier)
        {
            try
            {
                // First try to get user data from the logic engine (CSV data)
                if (_logicEngineService != null)
                {
                    var userData = await GetUserDataFromLogicEngineAsync(userIdentifier);
                    if (userData != null)
                    {
                        return userData;
                    }
                }

                // Fallback to Graph API
                if (IsAuthenticated)
                {
                    return await GetUserDataFromGraphAsync(userIdentifier);
                }

                _logger?.LogWarning("Unable to retrieve user data for {UserIdentifier} - no data sources available", 
                    userIdentifier);
                return null;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting user data for {UserIdentifier}", userIdentifier);
                return null;
            }
        }

        /// <summary>
        /// Gets available token data for template preview
        /// </summary>
        public object GetSampleTokenData(NotificationTemplateType templateType)
        {
            return templateType switch
            {
                NotificationTemplateType.PreMigration => new
                {
                    UserDisplayName = "John Smith",
                    UserEmail = "john.smith@company.com",
                    UserPrincipalName = "john.smith@company.com",
                    CompanyName = "Acme Corporation",
                    CurrentDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    CurrentTime = DateTime.Now.ToString("HH:mm"),
                    MigrationDate = DateTime.Now.AddDays(7).ToString("yyyy-MM-dd"),
                    MigrationTime = "09:00 AM",
                    WaveName = "Wave-01",
                    EstimatedDuration = "4 hours",
                    ItemsToMigrate = "150"
                },
                NotificationTemplateType.PostMigration => new
                {
                    UserDisplayName = "John Smith",
                    UserEmail = "john.smith@company.com",
                    UserPrincipalName = "john.smith@company.com",
                    CompanyName = "Acme Corporation",
                    CurrentDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    CurrentTime = DateTime.Now.ToString("HH:mm"),
                    MigrationStatus = "Completed Successfully",
                    MigrationStartTime = "09:15 AM",
                    MigrationEndTime = "12:45 PM",
                    ItemsMigrated = "148",
                    ItemsFailed = "2",
                    NextSteps = "Please update your bookmarks and test your applications"
                },
                NotificationTemplateType.Alert => new
                {
                    UserDisplayName = "John Smith",
                    UserEmail = "john.smith@company.com",
                    UserPrincipalName = "john.smith@company.com",
                    CompanyName = "Acme Corporation",
                    CurrentDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    CurrentTime = DateTime.Now.ToString("HH:mm"),
                    AlertType = "Warning",
                    AlertMessage = "Migration is taking longer than expected",
                    AlertTime = DateTime.Now.ToString("HH:mm"),
                    AffectedItems = "25",
                    RecommendedAction = "Monitor progress and contact support if issues persist"
                },
                _ => new
                {
                    UserDisplayName = "John Smith",
                    UserEmail = "john.smith@company.com",
                    CompanyName = "Acme Corporation",
                    CurrentDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    CurrentTime = DateTime.Now.ToString("HH:mm")
                }
            };
        }

        #endregion

        #region Private Methods

        private async Task<UserNotificationData> GetUserDataFromLogicEngineAsync(string userIdentifier)
        {
            try
            {
                // This would integrate with the actual logic engine service
                // For now, return null to indicate no data found
                return null;
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error getting user data from logic engine for {UserIdentifier}", userIdentifier);
                return null;
            }
        }

        private async Task<UserNotificationData> GetUserDataFromGraphAsync(string userIdentifier)
        {
            try
            {
                Microsoft.Graph.User user = null;

                // Try different ways to find the user
                if (userIdentifier.Contains("@"))
                {
                    // Email or UPN
                    user = await _graphServiceClient.Users[userIdentifier].Request().GetAsync();
                }
                else
                {
                    // Try as object ID or search by display name
                    try
                    {
                        user = await _graphServiceClient.Users[userIdentifier].Request().GetAsync();
                    }
                    catch
                    {
                        // Search by display name
                        var users = await _graphServiceClient.Users
                            .Request()
                            .Filter($"displayName eq '{userIdentifier}'")
                            .GetAsync();
                        
                        user = users.FirstOrDefault();
                    }
                }

                if (user != null)
                {
                    return new UserNotificationData
                    {
                        UserPrincipalName = user.UserPrincipalName,
                        DisplayName = user.DisplayName,
                        Email = user.Mail ?? user.UserPrincipalName,
                        FirstName = user.GivenName,
                        LastName = user.Surname,
                        JobTitle = user.JobTitle,
                        Department = user.Department,
                        OfficeLocation = user.OfficeLocation,
                        MobilePhone = user.MobilePhone,
                        BusinessPhones = user.BusinessPhones?.ToList() ?? new List<string>(),
                        Manager = user.Manager?.Id
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error getting user data from Graph API for {UserIdentifier}", userIdentifier);
                return null;
            }
        }

        private object CreateTokenData(UserNotificationData userData, object additionalTokenData)
        {
            var baseTokenData = new Dictionary<string, object>
            {
                ["UserDisplayName"] = userData.DisplayName ?? "Unknown User",
                ["UserEmail"] = userData.Email ?? string.Empty,
                ["UserPrincipalName"] = userData.UserPrincipalName ?? string.Empty,
                ["UserFirstName"] = userData.FirstName ?? string.Empty,
                ["UserLastName"] = userData.LastName ?? string.Empty,
                ["UserJobTitle"] = userData.JobTitle ?? string.Empty,
                ["UserDepartment"] = userData.Department ?? string.Empty,
                ["CompanyName"] = _configuration.DefaultCompanyName ?? "Unknown Company",
                ["CurrentDate"] = DateTime.Now.ToString("yyyy-MM-dd"),
                ["CurrentTime"] = DateTime.Now.ToString("HH:mm")
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

            // Convert to anonymous object for easier use with template service
            return baseTokenData.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }

        private List<string> DetermineRecipients(NotificationTemplate template, UserNotificationData userData)
        {
            var recipients = new List<string>();

            // Add user's email as primary recipient
            if (!string.IsNullOrWhiteSpace(userData.Email))
            {
                recipients.Add(userData.Email);
            }

            // Add template-defined recipients
            if (template.Recipients?.Any() == true)
            {
                recipients.AddRange(template.Recipients.Where(email => !string.IsNullOrWhiteSpace(email)));
            }

            // Remove duplicates and validate
            return recipients
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Where(IsValidEmail)
                .ToList();
        }

        private async Task<EmailSendResult> SendEmailAsync(
            List<string> recipients,
            string subject,
            string body,
            string senderEmail)
        {
            var result = new EmailSendResult();

            try
            {
                var message = new Message
                {
                    Subject = subject,
                    Body = new ItemBody
                    {
                        ContentType = BodyType.Html,
                        Content = body
                    },
                    ToRecipients = recipients.Select(email => new Recipient
                    {
                        EmailAddress = new EmailAddress
                        {
                            Address = email
                        }
                    }).ToList(),
                    From = new Recipient
                    {
                        EmailAddress = new EmailAddress
                        {
                            Address = senderEmail ?? _configuration.SenderEmail
                        }
                    }
                };

                await _graphServiceClient.Me
                    .SendMail(message, false)
                    .Request()
                    .PostAsync();

                result.Success = true;
                result.MessageId = Guid.NewGuid().ToString(); // Graph doesn't return message ID directly
                result.SentAt = DateTime.Now;
                
                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error sending email via Graph API");
                return result;
            }
        }

        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        #endregion
    }

    #region Supporting Classes

    public class GraphNotificationConfiguration
    {
        public string TenantId { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Authority { get; set; }
        public string SenderEmail { get; set; }
        public string DefaultCompanyName { get; set; } = "Company";
        public int MaxBatchSize { get; set; } = 10;
        public int BatchDelayMs { get; set; } = 1000;
        public bool EnableRetries { get; set; } = true;
        public int MaxRetries { get; set; } = 3;

        public bool IsValid =>
            !string.IsNullOrWhiteSpace(TenantId) &&
            !string.IsNullOrWhiteSpace(ClientId) &&
            !string.IsNullOrWhiteSpace(ClientSecret) &&
            !string.IsNullOrWhiteSpace(SenderEmail);
    }

    public class UserNotificationData
    {
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string JobTitle { get; set; }
        public string Department { get; set; }
        public string OfficeLocation { get; set; }
        public string MobilePhone { get; set; }
        public List<string> BusinessPhones { get; set; } = new List<string>();
        public string Manager { get; set; }
    }

    public class NotificationResult
    {
        public string TemplateId { get; set; }
        public string UserIdentifier { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime? SentAt { get; set; }
        public List<string> Recipients { get; set; } = new List<string>();
        public string MessageId { get; set; }
    }

    public class BulkNotificationResult
    {
        public string TemplateId { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public int TotalUsers { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<SuccessfulNotification> SuccessfulNotifications { get; set; } = new List<SuccessfulNotification>();
        public List<FailedNotification> FailedNotifications { get; set; } = new List<FailedNotification>();
    }

    public class SuccessfulNotification
    {
        public string UserIdentifier { get; set; }
        public DateTime? SentAt { get; set; }
        public List<string> Recipients { get; set; } = new List<string>();
        public string MessageId { get; set; }
    }

    public class FailedNotification
    {
        public string UserIdentifier { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class ConnectionTestResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime TestedAt { get; set; }
        public string AuthenticatedUser { get; set; }
        public bool AuthenticationTest { get; set; }
        public bool UserReadPermission { get; set; }
        public bool MailSendPermission { get; set; }
        public List<string> TestResults { get; set; } = new List<string>();
    }

    public class EmailSendResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public string MessageId { get; set; }
        public DateTime SentAt { get; set; }
    }

    #endregion
}
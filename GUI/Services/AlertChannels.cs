using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Mail;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for alert delivery channels
    /// </summary>
    public interface IAlertChannel : IDisposable
    {
        Task SendAlertAsync(AlertEvent alertEvent);
        string ChannelName { get; }
        bool IsEnabled { get; set; }
    }
    
    #region Email Alert Channel
    
    /// <summary>
    /// Email alert delivery channel for enterprise notifications
    /// </summary>
    public class EmailAlertChannel : IAlertChannel
    {
        private readonly EmailAlertConfiguration _config;
        private readonly ILogger _logger;
        
        public string ChannelName => "Email";
        public bool IsEnabled { get; set; } = true;
        
        public EmailAlertChannel(EmailAlertConfiguration config, ILogger logger = null)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _logger = logger;
        }
        
        public async Task SendAlertAsync(AlertEvent alertEvent)
        {
            if (!IsEnabled || _config == null || string.IsNullOrEmpty(_config.SmtpServer))
                return;
                
            try
            {
                var recipients = alertEvent.Level >= AlertLevel.Critical 
                    ? _config.CriticalAlertToAddresses.Count > 0 ? _config.CriticalAlertToAddresses : _config.ToAddresses
                    : _config.ToAddresses;
                    
                if (recipients.Count == 0)
                    return;
                
                using var client = new SmtpClient(_config.SmtpServer, _config.SmtpPort)
                {
                    EnableSsl = _config.UseSSL,
                    Credentials = new System.Net.NetworkCredential(_config.Username, _config.Password)
                };
                
                var subject = $"[{alertEvent.Level}] {alertEvent.Title} - M&A Discovery Suite";
                var body = BuildEmailBody(alertEvent);
                
                var message = new MailMessage
                {
                    From = new MailAddress(_config.FromAddress),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                
                foreach (var recipient in recipients)
                {
                    message.To.Add(recipient);
                }
                
                await client.SendMailAsync(message);
                
                _logger?.LogInformation("Alert email sent to {RecipientCount} recipients", recipients.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to send email alert");
                throw;
            }
        }
        
        private string BuildEmailBody(AlertEvent alertEvent)
        {
            var html = new StringBuilder();
            
            html.AppendLine("<html><body>");
            html.AppendLine("<h2>M&A Discovery Suite Alert</h2>");
            
            // Alert level styling
            var levelColor = alertEvent.Level switch
            {
                AlertLevel.Critical => "#dc3545",
                AlertLevel.Warning => "#ffc107",
                AlertLevel.Emergency => "#6f42c1",
                _ => "#17a2b8"
            };
            
            html.AppendLine($"<div style='background-color: {levelColor}; color: white; padding: 10px; margin: 10px 0; border-radius: 5px;'>");
            html.AppendLine($"<strong>Alert Level: {alertEvent.Level}</strong>");
            html.AppendLine("</div>");
            
            html.AppendLine("<table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse; width: 100%;'>");
            html.AppendLine($"<tr><td><strong>Title:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(alertEvent.Title)}</td></tr>");
            html.AppendLine($"<tr><td><strong>Description:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(alertEvent.Description)}</td></tr>");
            html.AppendLine($"<tr><td><strong>Source:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(alertEvent.Source)}</td></tr>");
            html.AppendLine($"<tr><td><strong>Category:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(alertEvent.Category)}</td></tr>");
            html.AppendLine($"<tr><td><strong>Customer:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(alertEvent.CustomerId)}</td></tr>");
            html.AppendLine($"<tr><td><strong>Timestamp:</strong></td><td>{alertEvent.Timestamp:yyyy-MM-dd HH:mm:ss} UTC</td></tr>");
            
            if (!string.IsNullOrEmpty(alertEvent.Details))
            {
                html.AppendLine($"<tr><td><strong>Details:</strong></td><td><pre>{System.Web.HttpUtility.HtmlEncode(alertEvent.Details)}</pre></td></tr>");
            }
            
            html.AppendLine("</table>");
            
            if (alertEvent.Properties.Count > 0)
            {
                html.AppendLine("<h3>Additional Properties</h3>");
                html.AppendLine("<ul>");
                foreach (var prop in alertEvent.Properties)
                {
                    html.AppendLine($"<li><strong>{System.Web.HttpUtility.HtmlEncode(prop.Key)}:</strong> {System.Web.HttpUtility.HtmlEncode(prop.Value)}</li>");
                }
                html.AppendLine("</ul>");
            }
            
            html.AppendLine("<hr>");
            html.AppendLine("<p><em>This alert was generated automatically by the M&A Discovery Suite Enterprise Monitoring System.</em></p>");
            html.AppendLine("</body></html>");
            
            return html.ToString();
        }
        
        public void Dispose()
        {
            // No resources to dispose for email channel
        }
    }
    
    #endregion
    
    #region Slack Alert Channel
    
    /// <summary>
    /// Slack alert delivery channel for team notifications
    /// </summary>
    public class SlackAlertChannel : IAlertChannel
    {
        private readonly SlackAlertConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger _logger;
        
        public string ChannelName => "Slack";
        public bool IsEnabled { get; set; } = true;
        
        public SlackAlertChannel(SlackAlertConfiguration config, ILogger logger = null)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _logger = logger;
            _httpClient = new HttpClient();
        }
        
        public async Task SendAlertAsync(AlertEvent alertEvent)
        {
            if (!IsEnabled || string.IsNullOrEmpty(_config?.WebhookUrl))
                return;
                
            try
            {
                var message = BuildSlackMessage(alertEvent);
                var json = JsonSerializer.Serialize(message);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync(_config.WebhookUrl, content);
                response.EnsureSuccessStatusCode();
                
                _logger?.LogInformation("Alert sent to Slack channel {Channel}", _config.Channel);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to send Slack alert");
                throw;
            }
        }
        
        private object BuildSlackMessage(AlertEvent alertEvent)
        {
            var color = alertEvent.Level switch
            {
                AlertLevel.Critical => "danger",
                AlertLevel.Warning => "warning",
                AlertLevel.Emergency => "#6f42c1",
                _ => "good"
            };
            
            var fields = new List<object>
            {
                new { title = "Level", value = alertEvent.Level.ToString(), @short = true },
                new { title = "Source", value = alertEvent.Source, @short = true },
                new { title = "Category", value = alertEvent.Category, @short = true },
                new { title = "Customer", value = alertEvent.CustomerId, @short = true },
                new { title = "Timestamp", value = alertEvent.Timestamp.ToString("yyyy-MM-dd HH:mm:ss UTC"), @short = true }
            };
            
            if (!string.IsNullOrEmpty(alertEvent.Details))
            {
                fields.Add(new { title = "Details", value = $"```{alertEvent.Details}```", @short = false });
            }
            
            return new
            {
                channel = _config.Channel,
                username = _config.Username,
                icon_emoji = _config.IconEmoji,
                attachments = new[]
                {
                    new
                    {
                        color = color,
                        title = alertEvent.Title,
                        text = alertEvent.Description,
                        fields = fields,
                        ts = ((DateTimeOffset)alertEvent.Timestamp).ToUnixTimeSeconds()
                    }
                }
            };
        }
        
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
    
    #endregion
    
    #region SIEM Alert Channel
    
    /// <summary>
    /// SIEM integration alert channel for enterprise security monitoring
    /// </summary>
    public class SiemAlertChannel : IAlertChannel
    {
        private readonly SiemAlertConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger _logger;
        
        public string ChannelName => $"SIEM ({_config?.SiemType ?? "Unknown"})";
        public bool IsEnabled { get; set; } = true;
        
        public SiemAlertChannel(SiemAlertConfiguration config, ILogger logger = null)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _logger = logger;
            _httpClient = new HttpClient();
            
            // Configure authentication if provided
            if (!string.IsNullOrEmpty(_config.ApiKey))
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config.ApiKey}");
            }
        }
        
        public async Task SendAlertAsync(AlertEvent alertEvent)
        {
            if (!IsEnabled || string.IsNullOrEmpty(_config?.Endpoint))
                return;
                
            try
            {
                var siemEvent = BuildSiemEvent(alertEvent);
                var json = JsonSerializer.Serialize(siemEvent);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync(_config.Endpoint, content);
                response.EnsureSuccessStatusCode();
                
                _logger?.LogInformation("Alert sent to SIEM system {SiemType}", _config.SiemType);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to send SIEM alert");
                throw;
            }
        }
        
        private object BuildSiemEvent(AlertEvent alertEvent)
        {
            var baseEvent = new Dictionary<string, object>
            {
                ["timestamp"] = alertEvent.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                ["event_id"] = alertEvent.Id,
                ["severity"] = alertEvent.Level.ToString(),
                ["source"] = "M&ADiscoverySuite",
                ["category"] = alertEvent.Category,
                ["title"] = alertEvent.Title,
                ["description"] = alertEvent.Description,
                ["customer_id"] = alertEvent.CustomerId,
                ["source_component"] = alertEvent.Source
            };
            
            if (!string.IsNullOrEmpty(alertEvent.Details))
            {
                baseEvent["details"] = alertEvent.Details;
            }
            
            // Add custom fields from configuration
            foreach (var customField in _config.CustomFields)
            {
                baseEvent[customField.Key] = customField.Value;
            }
            
            // Add alert properties
            foreach (var property in alertEvent.Properties)
            {
                baseEvent[$"custom_{property.Key}"] = property.Value;
            }
            
            return baseEvent;
        }
        
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
    
    #endregion
    
    #region Webhook Alert Channel
    
    /// <summary>
    /// Generic webhook alert channel for custom integrations
    /// </summary>
    public class WebhookAlertChannel : IAlertChannel
    {
        private readonly WebhookAlertConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger _logger;
        
        public string ChannelName => "Webhook";
        public bool IsEnabled { get; set; } = true;
        
        public WebhookAlertChannel(WebhookAlertConfiguration config, ILogger logger = null)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _logger = logger;
            _httpClient = new HttpClient();
            
            // Add custom headers
            foreach (var header in _config.Headers)
            {
                _httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
            }
            
            // Configure authentication
            if (!string.IsNullOrEmpty(_config.AuthenticationScheme) && !string.IsNullOrEmpty(_config.AuthenticationToken))
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"{_config.AuthenticationScheme} {_config.AuthenticationToken}");
            }
        }
        
        public async Task SendAlertAsync(AlertEvent alertEvent)
        {
            if (!IsEnabled || string.IsNullOrEmpty(_config?.Url))
                return;
                
            try
            {
                var payload = new
                {
                    alert = alertEvent,
                    metadata = new
                    {
                        source_system = "M&ADiscoverySuite",
                        version = "1.0",
                        timestamp = DateTimeOffset.UtcNow
                    }
                };
                
                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync(_config.Url, content);
                response.EnsureSuccessStatusCode();
                
                _logger?.LogInformation("Alert sent to webhook endpoint");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to send webhook alert");
                throw;
            }
        }
        
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
    
    #endregion
    
    #region Event Log Alert Channel
    
    /// <summary>
    /// Windows Event Log alert channel for local system integration
    /// </summary>
    public class EventLogAlertChannel : IAlertChannel
    {
        private readonly EventLog _eventLog;
        private readonly ILogger _logger;
        
        public string ChannelName => "Event Log";
        public bool IsEnabled { get; set; } = true;
        
        private const string EventLogSource = "M&A Discovery Suite";
        private const string EventLogName = "Application";
        
        public EventLogAlertChannel(ILogger logger = null)
        {
            _logger = logger;
            
            try
            {
                // Create event source if it doesn't exist
                if (!EventLog.SourceExists(EventLogSource))
                {
                    EventLog.CreateEventSource(EventLogSource, EventLogName);
                }
                
                _eventLog = new EventLog(EventLogName)
                {
                    Source = EventLogSource
                };
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to initialize Event Log alert channel");
            }
        }
        
        public async Task SendAlertAsync(AlertEvent alertEvent)
        {
            if (!IsEnabled || _eventLog == null)
                return;
                
            await Task.Run(() =>
            {
                try
                {
                    var eventType = alertEvent.Level switch
                    {
                        AlertLevel.Critical or AlertLevel.Emergency => EventLogEntryType.Error,
                        AlertLevel.Warning => EventLogEntryType.Warning,
                        _ => EventLogEntryType.Information
                    };
                    
                    var message = $"[{alertEvent.Category}] {alertEvent.Title}\n" +
                                 $"Description: {alertEvent.Description}\n" +
                                 $"Source: {alertEvent.Source}\n" +
                                 $"Customer: {alertEvent.CustomerId}\n" +
                                 $"Timestamp: {alertEvent.Timestamp:yyyy-MM-dd HH:mm:ss}";
                    
                    if (!string.IsNullOrEmpty(alertEvent.Details))
                    {
                        message += $"\nDetails: {alertEvent.Details}";
                    }
                    
                    // Event ID based on alert level
                    var eventId = (int)alertEvent.Level + 1000;
                    
                    _eventLog.WriteEntry(message, eventType, eventId);
                    
                    _logger?.LogInformation("Alert written to Windows Event Log");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to write alert to Event Log");
                    throw;
                }
            });
        }
        
        public void Dispose()
        {
            _eventLog?.Dispose();
        }
    }
    
    #endregion
}
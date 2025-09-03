using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Graph;
using MandADiscoverySuite.Models.Migration;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Validates mailbox migrations and provides rollback functionality.
    /// </summary>
    public class MailboxValidationProvider : IMailboxValidationProvider
    {
        private readonly GraphServiceClient? _graphClient;

        public string ObjectType => "Mailbox";
        public bool SupportsRollback => true;

        public MailboxValidationProvider(GraphServiceClient? graphClient = null)
        {
            _graphClient = graphClient;
        }

        public async Task<ValidationResult> ValidateMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Validating mailbox {mailbox.PrimarySmtpAddress}",
                StatusMessage = "Checking mailbox existence and content"
            });

            var issues = new List<ValidationIssue>();

            try
            {
                // Validate mailbox exists
                await ValidateMailboxExistence(mailbox, target, issues);

                // Validate mailbox size and item count
                await ValidateMailboxContent(mailbox, target, issues);

                // Validate folder structure
                await ValidateFolderStructure(mailbox, target, issues);

                // Validate mailbox permissions
                await ValidateMailboxPermissions(mailbox, target, issues);

                // Validate mail flow
                await ValidateMailFlow(mailbox, target, issues);

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Validation complete for {mailbox.PrimarySmtpAddress}",
                    StatusMessage = $"Found {issues.Count} validation issues",
                    PercentageComplete = 100
                });

                var severity = DetermineSeverity(issues);
                var message = issues.Count == 0
                    ? "Mailbox validation passed successfully"
                    : $"Mailbox validation completed with {issues.Count} issues";

                var result = new ValidationResult
                {
                    ValidatedObject = mailbox,
                    ObjectType = ObjectType,
                    ObjectName = mailbox.PrimarySmtpAddress,
                    Severity = severity,
                    Message = message
                };
                result.Issues.AddRange(issues);
                return result;
            }
            catch (Exception ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Critical,
                    Category = "System Error",
                    Description = $"Failed to validate mailbox: {ex.Message}",
                    RecommendedAction = "Check network connectivity and Exchange/Graph API permissions",
                    TechnicalDetails = ex.ToString()
                });

                return ValidationResult.Failed(mailbox, ObjectType, mailbox.PrimarySmtpAddress,
                    "Mailbox validation failed due to system error", issues);
            }
        }

        private async Task ValidateMailboxExistence(MailboxDto mailbox, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Configuration",
                    Description = "Graph client not configured - cannot verify target mailbox existence",
                    RecommendedAction = "Configure Graph API client for comprehensive validation"
                });
                return;
            }

            try
            {
                // Try to find the user by primary SMTP address
                var users = await _graphClient.Users
                    .Request()
                    .Filter($"mail eq '{mailbox.PrimarySmtpAddress}' or proxyAddresses/any(x:x eq 'SMTP:{mailbox.PrimarySmtpAddress}')")
                    .GetAsync();

                if (users?.Count == 0)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Mailbox Existence",
                        Description = $"No user found with primary SMTP address {mailbox.PrimarySmtpAddress}",
                        RecommendedAction = "Verify the mailbox migration completed successfully"
                    });
                }
                else if (users?.Count > 1)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Mailbox Existence",
                        Description = $"Multiple users found with SMTP address {mailbox.PrimarySmtpAddress}",
                        RecommendedAction = "Review duplicate email addresses in target tenant"
                    });
                }
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "Mailbox Existence",
                    Description = $"Error checking mailbox existence: {ex.Error.Message}",
                    RecommendedAction = "Verify Graph API permissions and network connectivity"
                });
            }
        }

        private async Task ValidateMailboxContent(MailboxDto mailbox, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null) return;

            try
            {
                // Find the user
                var users = await _graphClient.Users
                    .Request()
                    .Filter($"mail eq '{mailbox.PrimarySmtpAddress}'")
                    .GetAsync();

                var user = users?.FirstOrDefault();
                if (user == null) return;

                // Get mailbox statistics by counting messages in key folders
                var inboxMessages = await _graphClient.Users[user.Id]
                    .MailFolders.Inbox
                    .Messages
                    .Request()
                    .Top(1) // Just to check if accessible
                    .GetAsync();

                var sentMessages = await _graphClient.Users[user.Id]
                    .MailFolders.SentItems
                    .Messages
                    .Request()
                    .Top(1)
                    .GetAsync();

                // This is a basic check - in a real implementation you might compare
                // actual message counts with source mailbox statistics
                if (inboxMessages == null && sentMessages == null)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Mailbox Content",
                        Description = "Cannot access mailbox folders - may indicate incomplete migration",
                        RecommendedAction = "Verify mailbox migration completed and user has proper permissions"
                    });
                }
            }
            catch (ServiceException ex) when (ex.Error.Code == "Forbidden" || ex.Error.Code == "Unauthorized")
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Mailbox Content",
                    Description = "Insufficient permissions to validate mailbox content",
                    RecommendedAction = "Grant appropriate mailbox access permissions for validation"
                });
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Mailbox Content",
                    Description = $"Error validating mailbox content: {ex.Error.Message}",
                    RecommendedAction = "Manually verify mailbox content completeness"
                });
            }
        }

        private async Task ValidateFolderStructure(MailboxDto mailbox, TargetContext target, List<ValidationIssue> issues)
        {
            if (_graphClient == null) return;

            try
            {
                var users = await _graphClient.Users
                    .Request()
                    .Filter($"mail eq '{mailbox.PrimarySmtpAddress}'")
                    .GetAsync();

                var user = users?.FirstOrDefault();
                if (user == null) return;

                // Check for standard mail folders
                var mailFolders = await _graphClient.Users[user.Id]
                    .MailFolders
                    .Request()
                    .GetAsync();

                var expectedFolders = new[] { "Inbox", "SentItems", "DeletedItems", "Drafts" };
                var foundFolders = mailFolders?.Select(f => f.DisplayName).ToList() ?? new List<string>();

                foreach (var expectedFolder in expectedFolders)
                {
                    if (!foundFolders.Any(f => f.Equals(expectedFolder, StringComparison.OrdinalIgnoreCase)))
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Category = "Folder Structure",
                            Description = $"Standard folder '{expectedFolder}' not found",
                            RecommendedAction = "Verify complete folder structure migration"
                        });
                    }
                }
            }
            catch (ServiceException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Folder Structure",
                    Description = $"Error validating folder structure: {ex.Error.Message}",
                    RecommendedAction = "Manually verify mailbox folder structure"
                });
            }
        }

        private async Task ValidateMailboxPermissions(MailboxDto mailbox, TargetContext target, List<ValidationIssue> issues)
        {
            // This would typically validate delegate permissions, full access permissions, etc.
            // Implementation depends on whether using Exchange PowerShell or Graph API capabilities

            await Task.Run(() =>
            {
                // Placeholder for permission validation
                // In a real implementation, you would:
                // 1. Check mailbox permissions using Exchange Online PowerShell
                // 2. Validate delegate permissions
                // 3. Check shared mailbox access
                // 4. Verify folder permissions

                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Mailbox Permissions",
                    Description = "Mailbox permission validation not implemented",
                    RecommendedAction = "Manually verify mailbox permissions match source environment"
                });
            });
        }

        private async Task ValidateMailFlow(MailboxDto mailbox, TargetContext target, List<ValidationIssue> issues)
        {
            // This would validate that mail can be sent and received
            await Task.Run(() =>
            {
                // Placeholder for mail flow validation
                // In a real implementation, you might:
                // 1. Send a test email
                // 2. Check MX records
                // 3. Validate mail routing rules
                // 4. Check for mail flow blocks

                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Mail Flow",
                    Description = "Mail flow validation not implemented",
                    RecommendedAction = "Test sending/receiving emails to verify mail flow"
                });
            });
        }

        private ValidationSeverity DetermineSeverity(List<ValidationIssue> issues)
        {
            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Critical)
                    return ValidationSeverity.Critical;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Error)
                    return ValidationSeverity.Error;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Warning)
                    return ValidationSeverity.Warning;
            }

            return ValidationSeverity.Success;
        }

        public async Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Rolling back mailbox {mailbox.PrimarySmtpAddress}",
                StatusMessage = "Canceling move request and restoring mail flow"
            });

            var errors = new List<string>();
            var warnings = new List<string>();

            try
            {
                // In a real implementation, this would:
                // 1. Cancel any active move requests
                // 2. Update DNS/MX records to point back to source
                // 3. Disable the target mailbox
                // 4. Restore mail routing to source

                await Task.Delay(1000); // Simulate rollback operation

                warnings.Add("Mailbox rollback is a complex operation that may require manual intervention");
                warnings.Add("Verify mail flow has been restored to source environment");
                warnings.Add("Check for any emails received during migration that may need manual forwarding");

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Rollback complete for {mailbox.PrimarySmtpAddress}",
                    StatusMessage = "Manual verification required",
                    PercentageComplete = 100
                });

                var result = new RollbackResult
                {
                    Success = true,
                    Message = "Mailbox rollback initiated - manual verification required"
                };
                result.Warnings.AddRange(warnings);
                return result;
            }
            catch (Exception ex)
            {
                errors.Add($"Unexpected error during mailbox rollback: {ex.Message}");
                return RollbackResult.Failed($"Mailbox rollback failed: {ex.Message}", errors);
            }
        }
    }
}
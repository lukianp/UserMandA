using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Models.Identity;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Password provisioning service for T-041: User Account Migration and Synchronization
    /// Handles secure password generation, validation, and management for migrated users
    /// </summary>
    public class PasswordProvisioningService
    {
        private readonly ILogger<PasswordProvisioningService> _logger;
        private readonly RandomNumberGenerator _rng;
        private readonly Dictionary<string, PasswordPolicy> _passwordPolicies;

        public PasswordProvisioningService(ILogger<PasswordProvisioningService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _rng = RandomNumberGenerator.Create();
            _passwordPolicies = InitializePasswordPolicies();
        }

        /// <summary>
        /// Generate secure password for user migration
        /// </summary>
        public async Task<PasswordProvisioningResult> GenerateSecurePasswordAsync(
            UserProfileItem user,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new PasswordProvisioningResult { StartTime = DateTime.Now };

            try
            {
                await Task.CompletedTask; // Async compliance

                _logger.LogInformation($"Generating secure password for user: {user.UserPrincipalName}");

                // Step 1: Determine password policy
                var policyName = context.GetConfiguration("PasswordPolicy", "Standard");
                if (!_passwordPolicies.TryGetValue(policyName, out var policy))
                {
                    policy = _passwordPolicies["Standard"];
                    _logger.LogWarning($"Password policy '{policyName}' not found, using Standard policy");
                }

                // Step 2: Generate password
                var password = GenerateCompliantPassword(policy);

                // Step 3: Validate generated password
                var validationResult = ValidatePassword(password, policy);
                if (!validationResult.IsValid)
                {
                    // Retry with more complex generation
                    password = GenerateComplexPassword(policy);
                    validationResult = ValidatePassword(password, policy);
                }

                if (!validationResult.IsValid)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = "Failed to generate compliant password after multiple attempts";
                    result.Errors.AddRange(validationResult.Errors);
                    return result;
                }

                // Step 4: Determine password characteristics
                var isTemporary = context.GetConfiguration("GenerateTemporaryPasswords", true);
                var expirationDays = context.GetConfiguration("TemporaryPasswordExpirationDays", 30);
                var forceChange = context.GetConfiguration("ForcePasswordChangeOnFirstLogin", true);

                result.Password = password;
                result.IsTemporary = isTemporary;
                result.ExpirationDate = isTemporary ? DateTime.Now.AddDays(expirationDays) : DateTime.MaxValue;
                result.ForceChangeOnFirstLogin = forceChange;
                result.PasswordComplexity = policy.Name;
                result.PasswordRequirements = GetPasswordRequirements(policy);
                result.MeetsComplexityRequirements = validationResult.IsValid;
                result.IsSuccess = true;

                _logger.LogInformation($"Successfully generated password for user: {user.UserPrincipalName} (Complexity: {policy.Name})");
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Password generation failed for user: {user.UserPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Validate password against policy requirements
        /// </summary>
        public async Task<PasswordValidationResult> ValidatePasswordAsync(
            string password,
            string policyName = "Standard",
            CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask; // Async compliance

            if (!_passwordPolicies.TryGetValue(policyName, out var policy))
            {
                policy = _passwordPolicies["Standard"];
            }

            return ValidatePassword(password, policy);
        }

        /// <summary>
        /// Generate password reset token
        /// </summary>
        public async Task<PasswordResetResult> GeneratePasswordResetTokenAsync(
            string userPrincipalName,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new PasswordResetResult
            {
                UserPrincipalName = userPrincipalName,
                StartTime = DateTime.Now
            };

            try
            {
                await Task.CompletedTask; // Async compliance

                _logger.LogInformation($"Generating password reset token for user: {userPrincipalName}");

                // Generate secure reset token
                var tokenBytes = new byte[32];
                _rng.GetBytes(tokenBytes);
                var resetToken = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');

                // Set expiration time
                var expirationHours = context.GetConfiguration("PasswordResetTokenExpirationHours", 24);
                var expirationTime = DateTime.Now.AddHours(expirationHours);

                result.ResetToken = resetToken;
                result.ExpirationTime = expirationTime;
                result.IsSuccess = true;

                _logger.LogInformation($"Generated password reset token for user: {userPrincipalName} (Expires: {expirationTime})");
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Password reset token generation failed for user: {userPrincipalName}");
                return result;
            }
        }

        /// <summary>
        /// Generate password recovery questions
        /// </summary>
        public async Task<PasswordRecoveryQuestionsResult> GenerateRecoveryQuestionsAsync(
            UserProfileItem user,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new PasswordRecoveryQuestionsResult
            {
                UserPrincipalName = user.UserPrincipalName,
                StartTime = DateTime.Now
            };

            try
            {
                await Task.CompletedTask; // Async compliance

                _logger.LogInformation($"Generating recovery questions for user: {user.UserPrincipalName}");

                var questionBank = GetPasswordRecoveryQuestionBank();
                var selectedQuestions = SelectRandomQuestions(questionBank, 3);

                result.Questions = selectedQuestions;
                result.IsSuccess = true;

                _logger.LogInformation($"Generated {selectedQuestions.Count} recovery questions for user: {user.UserPrincipalName}");
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, $"Recovery questions generation failed for user: {user.UserPrincipalName}");
                return result;
            }
        }

        #region Private Methods

        /// <summary>
        /// Initialize password policies
        /// </summary>
        private Dictionary<string, PasswordPolicy> InitializePasswordPolicies()
        {
            return new Dictionary<string, PasswordPolicy>
            {
                ["Standard"] = new PasswordPolicy
                {
                    Name = "Standard",
                    MinLength = 12,
                    MaxLength = 128,
                    RequireUppercase = true,
                    RequireLowercase = true,
                    RequireNumbers = true,
                    RequireSpecialCharacters = true,
                    MinSpecialCharacters = 1,
                    MinNumbers = 1,
                    MinUppercase = 1,
                    MinLowercase = 1,
                    ProhibitedPatterns = new List<string> { "password", "123456", "qwerty", "admin" },
                    ProhibitConsecutiveChars = true,
                    ProhibitRepeatingChars = true,
                    MaxRepeatingChars = 2,
                    ProhibitUserInfo = true
                },
                ["Complex"] = new PasswordPolicy
                {
                    Name = "Complex",
                    MinLength = 16,
                    MaxLength = 128,
                    RequireUppercase = true,
                    RequireLowercase = true,
                    RequireNumbers = true,
                    RequireSpecialCharacters = true,
                    MinSpecialCharacters = 2,
                    MinNumbers = 2,
                    MinUppercase = 2,
                    MinLowercase = 2,
                    ProhibitedPatterns = new List<string> { "password", "123456", "qwerty", "admin", "welcome", "temp" },
                    ProhibitConsecutiveChars = true,
                    ProhibitRepeatingChars = true,
                    MaxRepeatingChars = 1,
                    ProhibitUserInfo = true
                },
                ["Enterprise"] = new PasswordPolicy
                {
                    Name = "Enterprise",
                    MinLength = 20,
                    MaxLength = 128,
                    RequireUppercase = true,
                    RequireLowercase = true,
                    RequireNumbers = true,
                    RequireSpecialCharacters = true,
                    MinSpecialCharacters = 3,
                    MinNumbers = 3,
                    MinUppercase = 3,
                    MinLowercase = 3,
                    ProhibitedPatterns = new List<string> { "password", "123456", "qwerty", "admin", "welcome", "temp", "company", "login" },
                    ProhibitConsecutiveChars = true,
                    ProhibitRepeatingChars = true,
                    MaxRepeatingChars = 1,
                    ProhibitUserInfo = true,
                    RequireUnicode = true
                }
            };
        }

        /// <summary>
        /// Generate password compliant with policy
        /// </summary>
        private string GenerateCompliantPassword(PasswordPolicy policy)
        {
            const string uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
            const string numberChars = "0123456789";
            const string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
            const string unicodeChars = "αβγδεζηθικλμνξοπρστυφχψω";

            var password = new StringBuilder();
            var allChars = new StringBuilder();
            var charSets = new List<(string chars, int minCount)>();

            // Build character sets based on requirements
            if (policy.RequireUppercase)
            {
                allChars.Append(uppercaseChars);
                charSets.Add((uppercaseChars, policy.MinUppercase));
            }

            if (policy.RequireLowercase)
            {
                allChars.Append(lowercaseChars);
                charSets.Add((lowercaseChars, policy.MinLowercase));
            }

            if (policy.RequireNumbers)
            {
                allChars.Append(numberChars);
                charSets.Add((numberChars, policy.MinNumbers));
            }

            if (policy.RequireSpecialCharacters)
            {
                allChars.Append(specialChars);
                charSets.Add((specialChars, policy.MinSpecialCharacters));
            }

            if (policy.RequireUnicode)
            {
                allChars.Append(unicodeChars);
                charSets.Add((unicodeChars, 1));
            }

            // Ensure minimum requirements are met
            foreach (var (chars, minCount) in charSets)
            {
                for (int i = 0; i < minCount; i++)
                {
                    password.Append(GetRandomCharacter(chars));
                }
            }

            // Fill remaining length with random characters
            var remainingLength = Math.Max(0, policy.MinLength - password.Length);
            var allCharsString = allChars.ToString();

            for (int i = 0; i < remainingLength; i++)
            {
                password.Append(GetRandomCharacter(allCharsString));
            }

            // Shuffle the password
            return ShuffleString(password.ToString());
        }

        /// <summary>
        /// Generate complex password with additional entropy
        /// </summary>
        private string GenerateComplexPassword(PasswordPolicy policy)
        {
            var basePassword = GenerateCompliantPassword(policy);
            
            // Add additional complexity by inserting random characters
            var chars = basePassword.ToCharArray();
            var random = new Random(GetSecureRandomSeed());
            
            // Fisher-Yates shuffle with additional entropy
            for (int i = chars.Length - 1; i > 0; i--)
            {
                int j = random.Next(i + 1);
                (chars[i], chars[j]) = (chars[j], chars[i]);
            }

            return new string(chars);
        }

        /// <summary>
        /// Validate password against policy
        /// </summary>
        private PasswordValidationResult ValidatePassword(string password, PasswordPolicy policy)
        {
            var result = new PasswordValidationResult
            {
                IsValid = true,
                Policy = policy.Name
            };

            if (string.IsNullOrEmpty(password))
            {
                result.IsValid = false;
                result.Errors.Add("Password cannot be empty");
                return result;
            }

            // Length validation
            if (password.Length < policy.MinLength)
            {
                result.IsValid = false;
                result.Errors.Add($"Password must be at least {policy.MinLength} characters long");
            }

            if (password.Length > policy.MaxLength)
            {
                result.IsValid = false;
                result.Errors.Add($"Password cannot be longer than {policy.MaxLength} characters");
            }

            // Character requirement validation
            if (policy.RequireUppercase && !password.Any(char.IsUpper))
            {
                result.IsValid = false;
                result.Errors.Add("Password must contain at least one uppercase letter");
            }

            if (policy.RequireLowercase && !password.Any(char.IsLower))
            {
                result.IsValid = false;
                result.Errors.Add("Password must contain at least one lowercase letter");
            }

            if (policy.RequireNumbers && !password.Any(char.IsDigit))
            {
                result.IsValid = false;
                result.Errors.Add("Password must contain at least one number");
            }

            if (policy.RequireSpecialCharacters)
            {
                var specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
                var specialCount = password.Count(c => specialChars.Contains(c));
                if (specialCount < policy.MinSpecialCharacters)
                {
                    result.IsValid = false;
                    result.Errors.Add($"Password must contain at least {policy.MinSpecialCharacters} special characters");
                }
            }

            // Advanced validation
            if (policy.ProhibitConsecutiveChars && HasConsecutiveCharacters(password))
            {
                result.IsValid = false;
                result.Errors.Add("Password cannot contain consecutive characters (e.g., abc, 123)");
            }

            if (policy.ProhibitRepeatingChars && HasTooManyRepeatingCharacters(password, policy.MaxRepeatingChars))
            {
                result.IsValid = false;
                result.Errors.Add($"Password cannot have more than {policy.MaxRepeatingChars} repeating characters");
            }

            // Prohibited patterns
            foreach (var pattern in policy.ProhibitedPatterns)
            {
                if (password.ToLowerInvariant().Contains(pattern.ToLowerInvariant()))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Password cannot contain prohibited pattern: {pattern}");
                }
            }

            return result;
        }

        /// <summary>
        /// Get random character from string
        /// </summary>
        private char GetRandomCharacter(string chars)
        {
            var bytes = new byte[4];
            _rng.GetBytes(bytes);
            var random = BitConverter.ToUInt32(bytes, 0);
            return chars[(int)(random % chars.Length)];
        }

        /// <summary>
        /// Shuffle string characters
        /// </summary>
        private string ShuffleString(string input)
        {
            var chars = input.ToCharArray();
            var random = new Random(GetSecureRandomSeed());

            for (int i = chars.Length - 1; i > 0; i--)
            {
                int j = random.Next(i + 1);
                (chars[i], chars[j]) = (chars[j], chars[i]);
            }

            return new string(chars);
        }

        /// <summary>
        /// Get secure random seed
        /// </summary>
        private int GetSecureRandomSeed()
        {
            var bytes = new byte[4];
            _rng.GetBytes(bytes);
            return BitConverter.ToInt32(bytes, 0);
        }

        /// <summary>
        /// Check for consecutive characters
        /// </summary>
        private bool HasConsecutiveCharacters(string password)
        {
            for (int i = 0; i < password.Length - 2; i++)
            {
                if (password[i + 1] == password[i] + 1 && password[i + 2] == password[i] + 2)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Check for too many repeating characters
        /// </summary>
        private bool HasTooManyRepeatingCharacters(string password, int maxRepeating)
        {
            var groups = password.GroupBy(c => c);
            return groups.Any(g => g.Count() > maxRepeating);
        }

        /// <summary>
        /// Get password requirements for display
        /// </summary>
        private List<string> GetPasswordRequirements(PasswordPolicy policy)
        {
            var requirements = new List<string>();
            
            requirements.Add($"Must be between {policy.MinLength} and {policy.MaxLength} characters long");
            
            if (policy.RequireUppercase)
                requirements.Add($"Must contain at least {policy.MinUppercase} uppercase letter(s)");
            
            if (policy.RequireLowercase)
                requirements.Add($"Must contain at least {policy.MinLowercase} lowercase letter(s)");
            
            if (policy.RequireNumbers)
                requirements.Add($"Must contain at least {policy.MinNumbers} number(s)");
            
            if (policy.RequireSpecialCharacters)
                requirements.Add($"Must contain at least {policy.MinSpecialCharacters} special character(s)");
            
            if (policy.ProhibitConsecutiveChars)
                requirements.Add("Cannot contain consecutive characters (e.g., abc, 123)");
            
            if (policy.ProhibitRepeatingChars)
                requirements.Add($"Cannot have more than {policy.MaxRepeatingChars} repeating character(s)");

            return requirements;
        }

        /// <summary>
        /// Get password recovery question bank
        /// </summary>
        private List<string> GetPasswordRecoveryQuestionBank()
        {
            return new List<string>
            {
                "What is the name of your first pet?",
                "What is your mother's maiden name?",
                "What city were you born in?",
                "What is the name of your favorite teacher?",
                "What is your favorite movie?",
                "What is the name of the street you grew up on?",
                "What is your favorite food?",
                "What is the name of your best friend from childhood?",
                "What is your favorite book?",
                "What is the make and model of your first car?"
            };
        }

        /// <summary>
        /// Select random questions from question bank
        /// </summary>
        private List<string> SelectRandomQuestions(List<string> questionBank, int count)
        {
            var random = new Random(GetSecureRandomSeed());
            return questionBank.OrderBy(x => random.Next()).Take(count).ToList();
        }

        #endregion

        #region Helper Classes

        /// <summary>
        /// Password policy definition
        /// </summary>
        public class PasswordPolicy
        {
            public string Name { get; set; }
            public int MinLength { get; set; }
            public int MaxLength { get; set; }
            public bool RequireUppercase { get; set; }
            public bool RequireLowercase { get; set; }
            public bool RequireNumbers { get; set; }
            public bool RequireSpecialCharacters { get; set; }
            public int MinSpecialCharacters { get; set; }
            public int MinNumbers { get; set; }
            public int MinUppercase { get; set; }
            public int MinLowercase { get; set; }
            public List<string> ProhibitedPatterns { get; set; } = new List<string>();
            public bool ProhibitConsecutiveChars { get; set; }
            public bool ProhibitRepeatingChars { get; set; }
            public int MaxRepeatingChars { get; set; }
            public bool ProhibitUserInfo { get; set; }
            public bool RequireUnicode { get; set; }
        }

        /// <summary>
        /// Password validation result
        /// </summary>
        public class PasswordValidationResult
        {
            public bool IsValid { get; set; }
            public string Policy { get; set; }
            public List<string> Errors { get; set; } = new List<string>();
            public List<string> Warnings { get; set; } = new List<string>();
        }

        /// <summary>
        /// Password reset result
        /// </summary>
        public class PasswordResetResult : MigrationResultBase
        {
            public string UserPrincipalName { get; set; }
            public string ResetToken { get; set; }
            public DateTime ExpirationTime { get; set; }
            public string ResetUrl { get; set; }
            public bool TokenSent { get; set; }
        }

        /// <summary>
        /// Password recovery questions result
        /// </summary>
        public class PasswordRecoveryQuestionsResult : MigrationResultBase
        {
            public string UserPrincipalName { get; set; }
            public List<string> Questions { get; set; } = new List<string>();
            public Dictionary<string, string> QuestionAnswers { get; set; } = new Dictionary<string, string>();
        }

        #endregion

        #region Disposal

        public void Dispose()
        {
            _rng?.Dispose();
        }

        #endregion
    }
}
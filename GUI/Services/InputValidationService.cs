using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.IO;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Centralized input validation service for consistent validation across the application
    /// </summary>
    public class InputValidationService
    {
        private static InputValidationService _instance;
        private static readonly object _lock = new object();

        /// <summary>
        /// Gets the singleton instance of InputValidationService
        /// </summary>
        public static InputValidationService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new InputValidationService();
                    }
                }
                return _instance;
            }
        }

        private InputValidationService() { }

        #region Company Profile Validation

        /// <summary>
        /// Validates a company profile name
        /// </summary>
        public ValidationResult ValidateCompanyName(string name)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(name))
            {
                result.AddError("Company name cannot be empty");
                return result;
            }

            name = name.Trim();

            if (name.Length < 2)
            {
                result.AddError("Company name must be at least 2 characters long");
            }

            if (name.Length > 100)
            {
                result.AddError("Company name cannot exceed 100 characters");
            }

            // Check for invalid file system characters
            char[] invalidChars = Path.GetInvalidFileNameChars().Union(new[] { '<', '>', '"', '|', '?', '*' }).ToArray();
            if (name.Any(c => invalidChars.Contains(c)))
            {
                result.AddError("Company name contains invalid characters");
            }

            // Check for reserved names
            string[] reservedNames = { "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9" };
            if (reservedNames.Contains(name.ToUpper()))
            {
                result.AddError("Company name cannot be a reserved system name");
            }

            // Check for starting/ending with spaces or dots
            if (name.StartsWith(" ") || name.EndsWith(" ") || name.StartsWith(".") || name.EndsWith("."))
            {
                result.AddError("Company name cannot start or end with spaces or dots");
            }

            if (result.IsValid)
            {
                result.AddInfo($"Valid company name ({name.Length} characters)");
            }

            return result;
        }

        /// <summary>
        /// Validates a tenant ID
        /// </summary>
        public ValidationResult ValidateTenantId(string tenantId)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(tenantId))
            {
                result.AddInfo("Tenant ID is optional");
                return result;
            }

            tenantId = tenantId.Trim();

            if (!Guid.TryParse(tenantId, out _))
            {
                result.AddError("Tenant ID must be a valid GUID format");
            }
            else
            {
                result.AddInfo("Valid tenant ID format");
            }

            return result;
        }

        /// <summary>
        /// Validates a domain controller name
        /// </summary>
        public ValidationResult ValidateDomainController(string domainController)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(domainController))
            {
                result.AddInfo("Domain controller is optional");
                return result;
            }

            domainController = domainController.Trim();

            // Basic domain name validation
            if (!domainController.Contains('.'))
            {
                result.AddWarning("Domain controller should be a fully qualified domain name");
            }

            if (domainController.Length > 253)
            {
                result.AddError("Domain controller name is too long");
            }

            // Check for valid characters
            if (!Regex.IsMatch(domainController, @"^[a-zA-Z0-9\-\.]+$"))
            {
                result.AddError("Domain controller contains invalid characters");
            }

            // Check for proper formatting
            if (domainController.StartsWith(".") || domainController.EndsWith(".") ||
                domainController.StartsWith("-") || domainController.EndsWith("-") ||
                domainController.Contains("..") || domainController.Contains("--"))
            {
                result.AddError("Domain controller has invalid formatting");
            }

            if (result.IsValid)
            {
                result.AddInfo("Valid domain controller format");
            }

            return result;
        }

        #endregion

        #region Network and Path Validation

        /// <summary>
        /// Validates a file path
        /// </summary>
        public ValidationResult ValidateFilePath(string filePath, bool mustExist = false)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(filePath))
            {
                result.AddError("File path cannot be empty");
                return result;
            }

            filePath = filePath.Trim();

            try
            {
                var fullPath = Path.GetFullPath(filePath);
                
                if (mustExist && !File.Exists(fullPath))
                {
                    result.AddError("File does not exist");
                }
                else if (!mustExist)
                {
                    var directory = Path.GetDirectoryName(fullPath);
                    if (!Directory.Exists(directory))
                    {
                        result.AddWarning("Parent directory does not exist");
                    }
                }

                if (result.IsValid)
                {
                    result.AddInfo("Valid file path");
                }
            }
            catch (Exception ex)
            {
                result.AddError($"Invalid file path: {ex.Message}");
            }

            return result;
        }

        /// <summary>
        /// Validates a directory path
        /// </summary>
        public ValidationResult ValidateDirectoryPath(string directoryPath, bool mustExist = false)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(directoryPath))
            {
                result.AddError("Directory path cannot be empty");
                return result;
            }

            directoryPath = directoryPath.Trim();

            try
            {
                var fullPath = Path.GetFullPath(directoryPath);
                
                if (mustExist && !Directory.Exists(fullPath))
                {
                    result.AddError("Directory does not exist");
                }

                if (result.IsValid)
                {
                    result.AddInfo("Valid directory path");
                }
            }
            catch (Exception ex)
            {
                result.AddError($"Invalid directory path: {ex.Message}");
            }

            return result;
        }

        /// <summary>
        /// Validates a network range (CIDR notation)
        /// </summary>
        public ValidationResult ValidateNetworkRange(string networkRange)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(networkRange))
            {
                result.AddError("Network range cannot be empty");
                return result;
            }

            networkRange = networkRange.Trim();

            // Support multiple formats: CIDR, IP range, single IP
            var formats = networkRange.Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var format in formats)
            {
                var range = format.Trim();
                
                if (IsCidrNotation(range))
                {
                    if (!ValidateCidrNotation(range))
                    {
                        result.AddError($"Invalid CIDR notation: {range}");
                    }
                }
                else if (IsIpRange(range))
                {
                    if (!ValidateIpRange(range))
                    {
                        result.AddError($"Invalid IP range: {range}");
                    }
                }
                else if (IsIpAddress(range))
                {
                    if (!ValidateIpAddress(range))
                    {
                        result.AddError($"Invalid IP address: {range}");
                    }
                }
                else
                {
                    result.AddError($"Unrecognized network format: {range}");
                }
            }

            if (result.IsValid)
            {
                result.AddInfo($"Valid network range(s) - {formats.Length} entries");
            }

            return result;
        }

        #endregion

        #region Numeric Validation

        /// <summary>
        /// Validates a timeout value
        /// </summary>
        public ValidationResult ValidateTimeout(string timeoutStr, int min = 1, int max = 3600)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(timeoutStr))
            {
                result.AddError("Timeout cannot be empty");
                return result;
            }

            if (!int.TryParse(timeoutStr.Trim(), out int timeout))
            {
                result.AddError("Timeout must be a valid number");
                return result;
            }

            if (timeout < min)
            {
                result.AddError($"Timeout must be at least {min} seconds");
            }
            else if (timeout > max)
            {
                result.AddError($"Timeout cannot exceed {max} seconds");
            }
            else
            {
                result.AddInfo($"Valid timeout: {timeout} seconds");
            }

            return result;
        }

        /// <summary>
        /// Validates a thread count
        /// </summary>
        public ValidationResult ValidateThreadCount(string threadsStr, int min = 1, int max = 100)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(threadsStr))
            {
                result.AddError("Thread count cannot be empty");
                return result;
            }

            if (!int.TryParse(threadsStr.Trim(), out int threads))
            {
                result.AddError("Thread count must be a valid number");
                return result;
            }

            if (threads < min)
            {
                result.AddError($"Thread count must be at least {min}");
            }
            else if (threads > max)
            {
                result.AddError($"Thread count cannot exceed {max}");
            }
            else
            {
                result.AddInfo($"Valid thread count: {threads}");
            }

            return result;
        }

        #endregion

        #region Text Input Validation

        /// <summary>
        /// Validates search text input
        /// </summary>
        public ValidationResult ValidateSearchText(string searchText, int maxLength = 100)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(searchText))
            {
                result.AddInfo("Search text is empty - will show all results");
                return result;
            }

            searchText = searchText.Trim();

            if (searchText.Length > maxLength)
            {
                result.AddError($"Search text cannot exceed {maxLength} characters");
            }

            // Check for potentially problematic characters
            if (searchText.Any(c => char.IsControl(c) && c != '\t'))
            {
                result.AddWarning("Search text contains control characters");
            }

            if (result.IsValid)
            {
                result.AddInfo($"Valid search text ({searchText.Length} characters)");
            }

            return result;
        }

        /// <summary>
        /// Validates a description field
        /// </summary>
        public ValidationResult ValidateDescription(string description, int maxLength = 500)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(description))
            {
                result.AddInfo("Description is optional");
                return result;
            }

            description = description.Trim();

            if (description.Length > maxLength)
            {
                result.AddError($"Description cannot exceed {maxLength} characters");
            }

            if (result.IsValid)
            {
                result.AddInfo($"Valid description ({description.Length} characters)");
            }

            return result;
        }

        #endregion

        #region Helper Methods

        private bool IsCidrNotation(string input)
        {
            return input.Contains('/');
        }

        private bool IsIpRange(string input)
        {
            return input.Contains('-');
        }

        private bool IsIpAddress(string input)
        {
            return System.Net.IPAddress.TryParse(input, out _);
        }

        private bool ValidateCidrNotation(string cidr)
        {
            var parts = cidr.Split('/');
            if (parts.Length != 2) return false;

            if (!System.Net.IPAddress.TryParse(parts[0], out _)) return false;
            if (!int.TryParse(parts[1], out int prefix)) return false;

            return prefix >= 0 && prefix <= 32;
        }

        private bool ValidateIpRange(string range)
        {
            var parts = range.Split('-');
            if (parts.Length != 2) return false;

            return System.Net.IPAddress.TryParse(parts[0].Trim(), out _) &&
                   System.Net.IPAddress.TryParse(parts[1].Trim(), out _);
        }

        private bool ValidateIpAddress(string ip)
        {
            return System.Net.IPAddress.TryParse(ip, out _);
        }

        #endregion
    }


    #region User Information Validation Extensions

    /// <summary>
    /// Extension methods for user information validation
    /// </summary>
    public static class UserValidationExtensions
    {
        /// <summary>
        /// Validates an email address format
        /// </summary>
        public static ValidationResult ValidateEmail(this InputValidationService service, string email, bool required = true)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(email))
            {
                if (required)
                {
                    result.AddError("Email address is required");
                }
                else
                {
                    result.AddInfo("Email is optional");
                }
                return result;
            }

            // Basic email regex pattern
            var emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            if (!Regex.IsMatch(email, emailPattern))
            {
                result.AddError("Please enter a valid email address (e.g., user@domain.com)");
                return result;
            }

            // Additional checks
            if (email.Length > 254)
            {
                result.AddError("Email address is too long (maximum 254 characters)");
                return result;
            }

            if (email.Contains(".."))
            {
                result.AddError("Email address cannot contain consecutive dots");
                return result;
            }

            result.AddInfo("Email format is valid");
            return result;
        }

        /// <summary>
        /// Validates a phone number
        /// </summary>
        public static ValidationResult ValidatePhoneNumber(this InputValidationService service, string phoneNumber, bool required = false)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                if (required)
                {
                    result.AddError("Phone number is required");
                }
                else
                {
                    result.AddInfo("Phone number is optional");
                }
                return result;
            }

            // Remove all non-digit characters for validation
            var digitsOnly = Regex.Replace(phoneNumber, @"[^\d]", "");

            if (digitsOnly.Length < 7)
            {
                result.AddError("Phone number must contain at least 7 digits");
                return result;
            }

            if (digitsOnly.Length > 15)
            {
                result.AddError("Phone number cannot exceed 15 digits");
                return result;
            }

            // Check for valid international format patterns
            var phonePatterns = new[]
            {
                @"^\+?[1-9]\d{6,14}$",                    // International format
                @"^\([0-9]{3}\)\s?[0-9]{3}-?[0-9]{4}$",  // US format (xxx) xxx-xxxx
                @"^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$",       // US format xxx-xxx-xxxx
                @"^[0-9]{10,11}$",                        // Simple 10-11 digit
                @"^0[0-9]{9,10}$"                         // UK format starting with 0
            };

            bool isValidFormat = phonePatterns.Any(pattern => Regex.IsMatch(phoneNumber, pattern));
            
            if (!isValidFormat)
            {
                result.AddWarning("Phone number format may be invalid. Please use formats like: +1234567890, (123) 456-7890, or 123-456-7890");
            }
            else
            {
                result.AddInfo("Phone number format is valid");
            }

            return result;
        }

        /// <summary>
        /// Validates a person's name (first name, last name, etc.)
        /// </summary>
        public static ValidationResult ValidateName(this InputValidationService service, string name, string fieldName = "Name", bool required = true)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(name))
            {
                if (required)
                {
                    result.AddError($"{fieldName} is required");
                }
                else
                {
                    result.AddInfo($"{fieldName} is optional");
                }
                return result;
            }

            name = name.Trim();

            if (name.Length < 1)
            {
                result.AddError($"{fieldName} cannot be empty");
                return result;
            }

            if (name.Length > 50)
            {
                result.AddError($"{fieldName} cannot exceed 50 characters");
                return result;
            }

            // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
            if (!Regex.IsMatch(name, @"^[a-zA-Z\s\-'\.]+$"))
            {
                result.AddError($"{fieldName} can only contain letters, spaces, hyphens, and apostrophes");
                return result;
            }

            // Check for reasonable patterns
            if (Regex.IsMatch(name, @"^\s|\s$"))
            {
                result.AddWarning($"{fieldName} has leading or trailing spaces");
            }

            if (Regex.IsMatch(name, @"\s{2,}"))
            {
                result.AddWarning($"{fieldName} contains multiple consecutive spaces");
            }

            result.AddInfo($"{fieldName} is valid");
            return result;
        }

        /// <summary>
        /// Validates a username or user principal name
        /// </summary>
        public static ValidationResult ValidateUsername(this InputValidationService service, string username, bool required = true)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(username))
            {
                if (required)
                {
                    result.AddError("Username is required");
                }
                else
                {
                    result.AddInfo("Username is optional");
                }
                return result;
            }

            username = username.Trim();

            if (username.Length < 3)
            {
                result.AddError("Username must be at least 3 characters long");
                return result;
            }

            if (username.Length > 64)
            {
                result.AddError("Username cannot exceed 64 characters");
                return result;
            }

            // Check if it's an email format (UPN)
            if (username.Contains("@"))
            {
                return service.ValidateEmail(username, required);
            }

            // Check for valid username characters
            if (!Regex.IsMatch(username, @"^[a-zA-Z0-9._-]+$"))
            {
                result.AddError("Username can only contain letters, numbers, dots, underscores, and hyphens");
                return result;
            }

            // Username shouldn't start or end with special characters
            if (Regex.IsMatch(username, @"^[._-]|[._-]$"))
            {
                result.AddError("Username cannot start or end with dots, underscores, or hyphens");
                return result;
            }

            result.AddInfo("Username is valid");
            return result;
        }
    }

    #endregion
}
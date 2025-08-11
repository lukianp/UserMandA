using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for sanitizing and cleaning user input data
    /// </summary>
    public class DataSanitizationService
    {
        private static DataSanitizationService _instance;
        private static readonly object _lock = new object();
        
        // Common SQL injection patterns
        private static readonly string[] SqlInjectionPatterns = 
        {
            @"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FROM|WHERE|ORDER BY|GROUP BY|HAVING|INTO|JOIN|INNER|LEFT|RIGHT|OUTER)\b)",
            @"(--|#|/\*|\*/|@@|@)",
            @"(\bOR\b.{1,10}=.{1,10}(\bOR\b|\bAND\b))",
            @"(\bWHERE\b.{1,10}=)",
            @"('|"";|[\x00\n\r\x1a])"
        };
        
        // Common XSS patterns
        private static readonly string[] XssPatterns = 
        {
            @"<script[^>]*>.*?</script>",
            @"<iframe[^>]*>.*?</iframe>",
            @"javascript\s*:",
            @"on\w+\s*=",
            @"<object[^>]*>.*?</object>",
            @"<embed[^>]*>.*?</embed>",
            @"<applet[^>]*>.*?</applet>"
        };

        /// <summary>
        /// Gets the singleton instance of DataSanitizationService
        /// </summary>
        public static DataSanitizationService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new DataSanitizationService();
                    }
                }
                return _instance;
            }
        }

        private DataSanitizationService() { }

        #region Text Sanitization

        /// <summary>
        /// Sanitizes general text input by removing potentially harmful content
        /// </summary>
        public string SanitizeText(string input, SanitizationLevel level = SanitizationLevel.Standard)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            string sanitized = input;

            switch (level)
            {
                case SanitizationLevel.Minimal:
                    sanitized = RemoveControlCharacters(sanitized);
                    break;
                    
                case SanitizationLevel.Standard:
                    sanitized = RemoveControlCharacters(sanitized);
                    sanitized = RemoveHtmlTags(sanitized);
                    sanitized = NormalizeWhitespace(sanitized);
                    break;
                    
                case SanitizationLevel.Strict:
                    sanitized = RemoveControlCharacters(sanitized);
                    sanitized = RemoveHtmlTags(sanitized);
                    sanitized = RemoveScriptContent(sanitized);
                    sanitized = RemoveSqlPatterns(sanitized);
                    sanitized = NormalizeWhitespace(sanitized);
                    sanitized = RemoveNonPrintableCharacters(sanitized);
                    break;
            }

            return sanitized.Trim();
        }

        /// <summary>
        /// Sanitizes file names to ensure they are safe for the file system
        /// </summary>
        public string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return "unnamed";

            // Remove invalid file name characters
            string sanitized = Regex.Replace(fileName, @"[<>:""/\\|?*]", "_");
            
            // Remove control characters
            sanitized = RemoveControlCharacters(sanitized);
            
            // Remove leading/trailing dots and spaces
            sanitized = sanitized.Trim('.', ' ');
            
            // Ensure it's not a reserved name
            string[] reservedNames = { "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", 
                                     "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", 
                                     "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9" };
            
            string nameWithoutExtension = System.IO.Path.GetFileNameWithoutExtension(sanitized);
            if (reservedNames.Contains(nameWithoutExtension.ToUpper()))
            {
                sanitized = "_" + sanitized;
            }
            
            // Limit length
            if (sanitized.Length > 255)
            {
                string extension = System.IO.Path.GetExtension(sanitized);
                int maxNameLength = 255 - extension.Length;
                sanitized = sanitized.Substring(0, maxNameLength) + extension;
            }
            
            return string.IsNullOrWhiteSpace(sanitized) ? "unnamed" : sanitized;
        }

        /// <summary>
        /// Sanitizes path input to prevent directory traversal attacks
        /// </summary>
        public string SanitizePath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return string.Empty;

            // Remove directory traversal sequences
            string sanitized = Regex.Replace(path, @"\.\.[\\/]", "");
            sanitized = Regex.Replace(sanitized, @"\.\.\\", "");
            sanitized = Regex.Replace(sanitized, @"\.\./", "");
            
            // Remove redundant path separators
            sanitized = Regex.Replace(sanitized, @"[\\/]+", System.IO.Path.DirectorySeparatorChar.ToString());
            
            // Remove control characters
            sanitized = RemoveControlCharacters(sanitized);
            
            try
            {
                // Get the full path to normalize it
                sanitized = System.IO.Path.GetFullPath(sanitized);
            }
            catch
            {
                // If path is invalid, return empty
                return string.Empty;
            }
            
            return sanitized;
        }

        #endregion

        #region SQL Injection Prevention

        /// <summary>
        /// Sanitizes input to prevent SQL injection
        /// </summary>
        public string SanitizeForSql(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            string sanitized = input;
            
            // Remove SQL keywords and patterns
            sanitized = RemoveSqlPatterns(sanitized);
            
            // Escape single quotes
            sanitized = sanitized.Replace("'", "''");
            
            // Remove semicolons that could terminate statements
            sanitized = sanitized.Replace(";", "");
            
            // Remove comment indicators
            sanitized = Regex.Replace(sanitized, @"(--|#|\/\*|\*\/)", "");
            
            return sanitized;
        }

        /// <summary>
        /// Checks if input contains potential SQL injection patterns
        /// </summary>
        public bool ContainsSqlInjectionPattern(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            string upperInput = input.ToUpper();
            
            foreach (var pattern in SqlInjectionPatterns)
            {
                if (Regex.IsMatch(upperInput, pattern, RegexOptions.IgnoreCase))
                    return true;
            }
            
            return false;
        }

        #endregion

        #region XSS Prevention

        /// <summary>
        /// Sanitizes input to prevent XSS attacks
        /// </summary>
        public string SanitizeForHtml(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            // HTML encode the input manually
            string sanitized = input
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&#x27;");
            
            // Additional sanitization for common XSS vectors
            sanitized = RemoveScriptContent(sanitized);
            
            return sanitized;
        }

        /// <summary>
        /// Checks if input contains potential XSS patterns
        /// </summary>
        public bool ContainsXssPattern(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            foreach (var pattern in XssPatterns)
            {
                if (Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase))
                    return true;
            }
            
            return false;
        }

        #endregion

        #region Email and URL Sanitization

        /// <summary>
        /// Sanitizes email addresses
        /// </summary>
        public string SanitizeEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return string.Empty;

            // Remove whitespace
            email = email.Trim();
            
            // Convert to lowercase
            email = email.ToLowerInvariant();
            
            // Remove any HTML tags
            email = RemoveHtmlTags(email);
            
            // Remove control characters
            email = RemoveControlCharacters(email);
            
            // Basic email validation
            if (!Regex.IsMatch(email, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"))
                return string.Empty;
            
            return email;
        }

        /// <summary>
        /// Sanitizes URLs
        /// </summary>
        public string SanitizeUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return string.Empty;

            // Remove whitespace
            url = url.Trim();
            
            // Remove control characters
            url = RemoveControlCharacters(url);
            
            // Remove javascript: and data: protocols
            url = Regex.Replace(url, @"^(javascript|data):", "", RegexOptions.IgnoreCase);
            
            // Ensure it starts with http:// or https://
            if (!url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) && 
                !url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                url = "https://" + url;
            }
            
            try
            {
                // Validate URL format
                var uri = new Uri(url);
                return uri.ToString();
            }
            catch
            {
                return string.Empty;
            }
        }

        #endregion

        #region Numeric Sanitization

        /// <summary>
        /// Sanitizes numeric input
        /// </summary>
        public string SanitizeNumeric(string input, bool allowDecimal = false, bool allowNegative = false)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "0";

            string pattern = allowNegative ? @"[^0-9\-" : @"[^0-9";
            if (allowDecimal)
                pattern += @"\.";
            pattern += "]";
            
            string sanitized = Regex.Replace(input, pattern, "");
            
            // Ensure only one decimal point
            if (allowDecimal && sanitized.Count(c => c == '.') > 1)
            {
                int firstDecimal = sanitized.IndexOf('.');
                sanitized = sanitized.Substring(0, firstDecimal + 1) + 
                          sanitized.Substring(firstDecimal + 1).Replace(".", "");
            }
            
            // Ensure negative sign is only at the beginning
            if (allowNegative && sanitized.Contains('-'))
            {
                sanitized = sanitized.Replace("-", "");
                if (input.TrimStart().StartsWith("-"))
                    sanitized = "-" + sanitized;
            }
            
            return string.IsNullOrEmpty(sanitized) ? "0" : sanitized;
        }

        #endregion

        #region Helper Methods

        private string RemoveControlCharacters(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            // Remove all control characters except tab, newline, and carriage return
            return Regex.Replace(input, @"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "");
        }

        private string RemoveNonPrintableCharacters(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            // Keep only printable ASCII and common Unicode characters
            return Regex.Replace(input, @"[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]", "");
        }

        private string RemoveHtmlTags(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            // Remove HTML tags
            return Regex.Replace(input, @"<[^>]*>", "");
        }

        private string RemoveScriptContent(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            // Remove script tags and content
            string sanitized = Regex.Replace(input, @"<script[^>]*>.*?</script>", "", 
                                            RegexOptions.IgnoreCase | RegexOptions.Singleline);
            
            // Remove javascript: protocol
            sanitized = Regex.Replace(sanitized, @"javascript\s*:", "", RegexOptions.IgnoreCase);
            
            // Remove event handlers
            sanitized = Regex.Replace(sanitized, @"on\w+\s*=\s*[""][^""]*[""]", "", RegexOptions.IgnoreCase);
            sanitized = Regex.Replace(sanitized, @"on\w+\s*=\s*['][^']*[']", "", RegexOptions.IgnoreCase);
            
            return sanitized;
        }

        private string RemoveSqlPatterns(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            string sanitized = input;
            
            // Remove common SQL keywords when they appear to be injection attempts
            foreach (var pattern in SqlInjectionPatterns)
            {
                sanitized = Regex.Replace(sanitized, pattern, "", RegexOptions.IgnoreCase);
            }
            
            return sanitized;
        }

        private string NormalizeWhitespace(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            // Replace multiple spaces with single space
            string sanitized = Regex.Replace(input, @"\s+", " ");
            
            // Remove leading/trailing whitespace
            return sanitized.Trim();
        }

        #endregion
    }

    /// <summary>
    /// Sanitization level for text input
    /// </summary>
    public enum SanitizationLevel
    {
        /// <summary>
        /// Minimal sanitization - only removes control characters
        /// </summary>
        Minimal,
        
        /// <summary>
        /// Standard sanitization - removes control characters, HTML tags, normalizes whitespace
        /// </summary>
        Standard,
        
        /// <summary>
        /// Strict sanitization - removes all potentially harmful content
        /// </summary>
        Strict
    }
}
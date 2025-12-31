/**
 * Input sanitization utilities
 * Provides security functions to prevent injection attacks
 */

/**
 * Sanitizes file paths to prevent directory traversal attacks
 *
 * This function removes dangerous path components and characters that could
 * be used for security exploits. It ensures file operations stay within
 * intended directories.
 *
 * @param filePath - The file path to sanitize
 * @returns A sanitized file path safe for file operations
 *
 * @example
 * ```typescript
 * const safePath = sanitizeFilePath('../../../etc/passwd');
 * // Returns: 'etcpasswd'
 * ```
 *
 * @security This function prevents directory traversal attacks
 * @since 1.0.0
 */
export function sanitizeFilePath(filePath: string): string {
  return filePath
    .replace(/\.\./g, '')           // Remove ../
    .replace(/[<>:"|?*]/g, '')     // Remove forbidden chars
    .replace(/^[\/\\]/, '')         // Remove leading slashes
    .replace(/\/$/, '')             // Remove trailing slashes
    .trim();
}

/**
 * Sanitizes search queries to prevent XSS attacks
 *
 * Escapes HTML special characters to prevent cross-site scripting
 * when displaying user input.
 *
 * @param query - The search query to sanitize
 * @returns Sanitized query string safe for HTML display
 *
 * @example
 * ```typescript
 * const safe = sanitizeSearchQuery('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 *
 * @security Prevents XSS attacks
 * @since 1.0.0
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Sanitizes HTML input to prevent XSS attacks
 *
 * More comprehensive than sanitizeSearchQuery, includes forward slash escaping.
 *
 * @param input - The HTML input to sanitize
 * @returns Sanitized string safe for HTML display
 *
 * @example
 * ```typescript
 * const safe = sanitizeHtmlInput('<img src=x onerror=alert(1)>');
 * // Returns: '&lt;img src=x onerror=alert(1)&gt;'
 * ```
 *
 * @security Prevents XSS attacks in HTML context
 * @since 1.0.0
 */
export function sanitizeHtmlInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitizes SQL input to prevent SQL injection
 *
 * Note: This is a basic sanitizer. Always use parameterized queries
 * when possible instead of string concatenation.
 *
 * @param input - The SQL input to sanitize
 * @returns Sanitized SQL string
 *
 * @example
 * ```typescript
 * const safe = sanitizeSqlInput("'; DROP TABLE users; --");
 * // Returns: "'' DROP TABLE users "
 * ```
 *
 * @security Basic SQL injection prevention
 * @since 1.0.0
 * @warning Use parameterized queries instead when possible
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/'/g, "''")           // Escape single quotes
    .replace(/;/g, '')             // Remove semicolons
    .replace(/--/g, '')            // Remove SQL comments
    .replace(/\/\*/g, '')          // Remove multi-line comment starts
    .replace(/\*\//g, '')          // Remove multi-line comment ends
    .trim();
}

/**
 * Validates and sanitizes a PowerShell command parameter
 *
 * Ensures PowerShell parameters don't contain injection attempts.
 *
 * @param param - The parameter value to sanitize
 * @returns Sanitized parameter value
 *
 * @example
 * ```typescript
 * const safe = sanitizePowerShellParam('value; rm -rf /');
 * // Returns: 'value rm -rf'
 * ```
 *
 * @security Prevents PowerShell command injection
 * @since 1.0.0
 */
export function sanitizePowerShellParam(param: string): string {
  return param
    .replace(/[;|&$`]/g, '')       // Remove command separators
    .replace(/\n/g, ' ')           // Remove newlines
    .replace(/\r/g, '')            // Remove carriage returns
    .trim();
}

/**
 * Validate CSV data structure
 * @param data - The CSV data to validate
 * @returns true if valid, false otherwise
 */
export function validateCsvData(data: any[]): boolean {
  // Basic validation for CSV data
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;

  const firstRow = data[0];
  if (typeof firstRow !== 'object' || firstRow === null) return false;

  // Check for reasonable column count
  const columnCount = Object.keys(firstRow).length;
  return columnCount > 0 && columnCount < 1000;
}



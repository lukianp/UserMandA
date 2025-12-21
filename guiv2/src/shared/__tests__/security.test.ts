/**
 * Unit tests for security utilities
 * Tests input sanitization and validation functions
 */

import {
  sanitizeFilePath,
  sanitizeSearchQuery,
  sanitizeHtmlInput,
  sanitizeSqlInput,
  sanitizePowerShellParam,
  validateCsvData,
} from '../security';

describe('Security Utilities', () => {
  describe('sanitizeFilePath', () => {
    test('removes directory traversal attempts', () => {
      expect(sanitizeFilePath('../../../etc/passwd')).toBe('etcpasswd');
      expect(sanitizeFilePath('..\\..\\windows\\system32')).toBe('windowssystem32');
      expect(sanitizeFilePath('../../sensitive/file.txt')).toBe('sensitivefile.txt');
    });

    test('removes forbidden Windows characters', () => {
      expect(sanitizeFilePath('file<name>.txt')).toBe('filename.txt');
      expect(sanitizeFilePath('file"name".txt')).toBe('filename.txt');
      expect(sanitizeFilePath('file:name.txt')).toBe('filename.txt');
      expect(sanitizeFilePath('file|name.txt')).toBe('filename.txt');
      expect(sanitizeFilePath('file?name.txt')).toBe('filename.txt');
      expect(sanitizeFilePath('file*name.txt')).toBe('filename.txt');
    });

    test('removes leading slashes', () => {
      expect(sanitizeFilePath('/etc/passwd')).toBe('etcpasswd');
      expect(sanitizeFilePath('\\windows\\system32')).toBe('windowssystem32');
    });

    test('removes trailing slashes', () => {
      expect(sanitizeFilePath('directory/')).toBe('directory');
      expect(sanitizeFilePath('directory\\')).toBe('directory');
    });

    test('handles normal paths correctly', () => {
      expect(sanitizeFilePath('data/discovery/file.csv')).toBe('data/discovery/file.csv');
      expect(sanitizeFilePath('reports/2024/report.pdf')).toBe('reports/2024/report.pdf');
    });

    test('trims whitespace', () => {
      expect(sanitizeFilePath('  file.txt  ')).toBe('file.txt');
    });

    test('handles empty strings', () => {
      expect(sanitizeFilePath('')).toBe('');
      expect(sanitizeFilePath('   ')).toBe('');
    });
  });

  describe('sanitizeSearchQuery', () => {
    test('escapes HTML special characters', () => {
      expect(sanitizeSearchQuery('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('escapes single quotes', () => {
      expect(sanitizeSearchQuery("O'Reilly")).toBe("O&#x27;Reilly");
    });

    test('escapes double quotes', () => {
      expect(sanitizeSearchQuery('Say "hello"')).toBe('Say &quot;hello&quot;');
    });

    test('escapes angle brackets', () => {
      expect(sanitizeSearchQuery('<div>')).toBe('&lt;div&gt;');
    });

    test('handles normal text correctly', () => {
      expect(sanitizeSearchQuery('normal search text')).toBe('normal search text');
    });

    test('trims whitespace', () => {
      expect(sanitizeSearchQuery('  search term  ')).toBe('search term');
    });

    test('handles empty strings', () => {
      expect(sanitizeSearchQuery('')).toBe('');
    });
  });

  describe('sanitizeHtmlInput', () => {
    test('escapes HTML injection attempts', () => {
      expect(sanitizeHtmlInput('<img src=x onerror=alert(1)>'))
        .toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    test('escapes forward slashes', () => {
      expect(sanitizeHtmlInput('</script>')).toBe('&lt;&#x2F;script&gt;');
    });

    test('escapes all special characters', () => {
      const input = '<script src="/evil.js">';
      const output = sanitizeHtmlInput(input);
      expect(output).toBe('&lt;script src=&quot;&#x2F;evil.js&quot;&gt;');
    });

    test('handles normal text', () => {
      expect(sanitizeHtmlInput('Hello World')).toBe('Hello World');
    });

    test('trims whitespace', () => {
      expect(sanitizeHtmlInput('  text  ')).toBe('text');
    });
  });

  describe('sanitizeSqlInput', () => {
    test('escapes single quotes', () => {
      expect(sanitizeSqlInput("O'Reilly")).toBe("O''Reilly");
    });

    test('removes semicolons', () => {
      expect(sanitizeSqlInput('value;')).toBe('value');
    });

    test('removes SQL comments', () => {
      expect(sanitizeSqlInput('value -- comment')).toBe('value  comment');
      expect(sanitizeSqlInput('value /* comment */')).toBe('value  comment ');
    });

    test('prevents SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const output = sanitizeSqlInput(input);
      expect(output).toBe("'' DROP TABLE users ");
      expect(output).not.toContain(';');
      expect(output).not.toContain('--');
    });

    test('handles union-based injection', () => {
      const input = "' UNION SELECT * FROM passwords; --";
      const output = sanitizeSqlInput(input);
      expect(output).not.toContain(';');
      expect(output).not.toContain('--');
    });

    test('handles normal text', () => {
      expect(sanitizeSqlInput('normal text')).toBe('normal text');
    });

    test('trims whitespace', () => {
      expect(sanitizeSqlInput('  value  ')).toBe('value');
    });
  });

  describe('sanitizePowerShellParam', () => {
    test('removes command separators', () => {
      expect(sanitizePowerShellParam('value; rm -rf /')).toBe('value rm -rf /');
      expect(sanitizePowerShellParam('value | evil')).toBe('value  evil');
      expect(sanitizePowerShellParam('value & evil')).toBe('value  evil');
    });

    test('removes dollar signs', () => {
      expect(sanitizePowerShellParam('$variable')).toBe('variable');
    });

    test('removes backticks', () => {
      expect(sanitizePowerShellParam('value`command')).toBe('valuecommand');
    });

    test('removes newlines and carriage returns', () => {
      expect(sanitizePowerShellParam('line1\nline2')).toBe('line1 line2');
      expect(sanitizePowerShellParam('line1\r\nline2')).toBe('line1 line2');
    });

    test('prevents command injection', () => {
      const input = 'value; Remove-Item -Path C:\\ -Recurse';
      const output = sanitizePowerShellParam(input);
      expect(output).not.toContain(';');
      expect(output).not.toContain('$');
    });

    test('handles normal parameters', () => {
      expect(sanitizePowerShellParam('normal-value-123')).toBe('normal-value-123');
    });

    test('trims whitespace', () => {
      expect(sanitizePowerShellParam('  value  ')).toBe('value');
    });
  });

  describe('validateCsvData', () => {
    test('accepts valid CSV data', () => {
      const validData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      expect(validateCsvData(validData)).toBe(true);
    });

    test('accepts empty arrays', () => {
      expect(validateCsvData([])).toBe(true);
    });

    test('rejects non-arrays', () => {
      expect(validateCsvData({} as any)).toBe(false);
      expect(validateCsvData('not an array' as any)).toBe(false);
      expect(validateCsvData(null as any)).toBe(false);
      expect(validateCsvData(undefined as any)).toBe(false);
    });

    test('rejects arrays with non-object elements', () => {
      expect(validateCsvData([1, 2, 3] as any)).toBe(false);
      expect(validateCsvData(['a', 'b', 'c'] as any)).toBe(false);
      expect(validateCsvData([null] as any)).toBe(false);
    });

    test('rejects data with too many columns', () => {
      const tooManyColumns: any = {};
      for (let i = 0; i < 1001; i++) {
        tooManyColumns[`col${i}`] = 'value';
      }
      expect(validateCsvData([tooManyColumns])).toBe(false);
    });

    test('rejects data with zero columns', () => {
      expect(validateCsvData([{}])).toBe(false);
    });

    test('accepts data within column limits', () => {
      const validColumns: any = {};
      for (let i = 0; i < 100; i++) {
        validColumns[`col${i}`] = 'value';
      }
      expect(validateCsvData([validColumns])).toBe(true);
    });
  });

  describe('Edge Cases and Integration', () => {
    test('handles multi-attack vectors', () => {
      const maliciousInput = '../../../<script>alert("xss")</script>';
      const sanitizedPath = sanitizeFilePath(maliciousInput);
      const sanitizedHtml = sanitizeHtmlInput(maliciousInput);

      expect(sanitizedPath).not.toContain('../');
      expect(sanitizedPath).not.toContain('<script>');
      expect(sanitizedHtml).not.toContain('<script>');
    });

    test('handles unicode characters', () => {
      expect(sanitizeSearchQuery('café')).toBe('café');
      expect(sanitizeFilePath('文件.txt')).toBe('文件.txt');
    });

    test('handles very long inputs', () => {
      const longInput = 'a'.repeat(10000);
      expect(sanitizeSearchQuery(longInput)).toBe(longInput);
      expect(sanitizeFilePath(longInput)).toBe(longInput);
    });

    test('chaining sanitizers works correctly', () => {
      let value = '../../../<script>alert(1)</script>';
      value = sanitizeFilePath(value);
      value = sanitizeHtmlInput(value);

      expect(value).not.toContain('../');
      expect(value).not.toContain('<script>');
    });
  });
});

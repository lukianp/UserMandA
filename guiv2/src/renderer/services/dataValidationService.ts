/**
 * Data Validation Service
 * Comprehensive validation rules engine with field-level and cross-field validation
 */

/**
 * Validation rule types
 */
export type ValidationRuleType =
  | 'required'
  | 'format'
  | 'range'
  | 'length'
  | 'pattern'
  | 'custom'
  | 'email'
  | 'url'
  | 'phone'
  | 'date'
  | 'numeric'
  | 'alpha'
  | 'alphanumeric'
  | 'enum'
  | 'unique';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation rule
 */
export interface ValidationRule {
  type: ValidationRuleType;
  field: string;
  message?: string;
  severity?: ValidationSeverity;
  params?: any;
  validator?: (value: any, row?: any, data?: any[]) => boolean;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: ValidationSeverity;
  row?: number;
  value?: any;
  rule: ValidationRuleType;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

/**
 * Cross-field validation rule
 */
export interface CrossFieldRule {
  fields: string[];
  message: string;
  severity?: ValidationSeverity;
  validator: (values: Record<string, any>, row?: any) => boolean;
}

/**
 * Validation rule template
 */
export interface ValidationTemplate {
  id: string;
  name: string;
  description: string;
  rules: ValidationRule[];
  crossFieldRules?: CrossFieldRule[];
}

/**
 * Data Validation Service
 */
export class DataValidationService {
  private static instance: DataValidationService;
  private templates: Map<string, ValidationTemplate> = new Map();

  private constructor() {
    this.initializeCommonTemplates();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  /**
   * Validate a single value against a rule
   * @param value Value to validate
   * @param rule Validation rule
   * @param row Optional complete row data
   * @param data Optional complete dataset
   * @returns Validation error or null if valid
   */
  validateValue(
    value: any,
    rule: ValidationRule,
    row?: any,
    data?: any[]
  ): ValidationError | null {
    const isValid = this.checkRule(value, rule, row, data);

    if (!isValid) {
      return {
        field: rule.field,
        message: rule.message || this.getDefaultMessage(rule),
        severity: rule.severity || 'error',
        value,
        rule: rule.type,
      };
    }

    return null;
  }

  /**
   * Validate a single row against multiple rules
   * @param row Row data
   * @param rules Validation rules
   * @param data Optional complete dataset
   * @returns Validation result
   */
  validateRow(row: any, rules: ValidationRule[], data?: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    for (const rule of rules) {
      const value = row[rule.field];
      const error = this.validateValue(value, rule, row, data);

      if (error) {
        switch (error.severity) {
          case 'error':
            errors.push(error);
            break;
          case 'warning':
            warnings.push(error);
            break;
          case 'info':
            infos.push(error);
            break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
      errorCount: errors.length,
      warningCount: warnings.length,
      infoCount: infos.length,
    };
  }

  /**
   * Validate entire dataset
   * @param data Dataset to validate
   * @param rules Validation rules
   * @param crossFieldRules Optional cross-field validation rules
   * @returns Validation result with row numbers
   */
  validateDataset(
    data: any[],
    rules: ValidationRule[],
    crossFieldRules?: CrossFieldRule[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    // Validate each row
    data.forEach((row, index) => {
      const rowResult = this.validateRow(row, rules, data);

      // Add row numbers to errors
      rowResult.errors.forEach((err) => errors.push({ ...err, row: index }));
      rowResult.warnings.forEach((err) => warnings.push({ ...err, row: index }));
      rowResult.infos.forEach((err) => infos.push({ ...err, row: index }));

      // Validate cross-field rules
      if (crossFieldRules) {
        for (const crossRule of crossFieldRules) {
          const values: Record<string, any> = {};
          for (const field of crossRule.fields) {
            values[field] = row[field];
          }

          const isValid = crossRule.validator(values, row);

          if (!isValid) {
            const error: ValidationError = {
              field: crossRule.fields.join(', '),
              message: crossRule.message,
              severity: crossRule.severity || 'error',
              row: index,
              rule: 'custom',
            };

            switch (error.severity) {
              case 'error':
                errors.push(error);
                break;
              case 'warning':
                warnings.push(error);
                break;
              case 'info':
                infos.push(error);
                break;
            }
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
      errorCount: errors.length,
      warningCount: warnings.length,
      infoCount: infos.length,
    };
  }

  /**
   * Validate using a template
   * @param data Dataset to validate
   * @param templateId Template ID
   * @returns Validation result
   */
  validateWithTemplate(data: any[], templateId: string): ValidationResult {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Validation template not found: ${templateId}`);
    }

    return this.validateDataset(data, template.rules, template.crossFieldRules);
  }

  /**
   * Add validation template
   * @param template Validation template
   */
  addTemplate(template: ValidationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get validation template
   * @param templateId Template ID
   * @returns Template or undefined
   */
  getTemplate(templateId: string): ValidationTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getTemplates(): ValidationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Check a rule against a value
   */
  private checkRule(value: any, rule: ValidationRule, row?: any, data?: any[]): boolean {
    // Custom validator
    if (rule.validator) {
      return rule.validator(value, row, data);
    }

    switch (rule.type) {
      case 'required':
        return this.isRequired(value);

      case 'format':
        return this.checkFormat(value, rule.params?.format);

      case 'range':
        return this.checkRange(value, rule.params?.min, rule.params?.max);

      case 'length':
        return this.checkLength(value, rule.params?.min, rule.params?.max);

      case 'pattern':
        return this.checkPattern(value, rule.params?.pattern);

      case 'email':
        return this.isEmail(value);

      case 'url':
        return this.isUrl(value);

      case 'phone':
        return this.isPhone(value);

      case 'date':
        return this.isDate(value);

      case 'numeric':
        return this.isNumeric(value);

      case 'alpha':
        return this.isAlpha(value);

      case 'alphanumeric':
        return this.isAlphanumeric(value);

      case 'enum':
        return this.isEnum(value, rule.params?.values);

      case 'unique':
        return this.isUnique(value, rule.field, data);

      default:
        return true;
    }
  }

  /**
   * Validation rule implementations
   */

  private isRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private checkFormat(value: any, format: string): boolean {
    if (!this.isRequired(value)) return true;

    const formats: Record<string, RegExp> = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      phone: /^\+?[\d\s\-().]+$/,
      date: /^\d{4}-\d{2}-\d{2}$/,
      time: /^\d{2}:\d{2}(:\d{2})?$/,
      datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
    };

    const regex = formats[format];
    return regex ? regex.test(String(value)) : true;
  }

  private checkRange(value: any, min?: number, max?: number): boolean {
    if (!this.isRequired(value)) return true;

    const num = Number(value);
    if (isNaN(num)) return false;

    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;

    return true;
  }

  private checkLength(value: any, min?: number, max?: number): boolean {
    if (!this.isRequired(value)) return true;

    const length = String(value).length;

    if (min !== undefined && length < min) return false;
    if (max !== undefined && length > max) return false;

    return true;
  }

  private checkPattern(value: any, pattern: string | RegExp): boolean {
    if (!this.isRequired(value)) return true;

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(String(value));
  }

  private isEmail(value: any): boolean {
    if (!this.isRequired(value)) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
  }

  private isUrl(value: any): boolean {
    if (!this.isRequired(value)) return true;
    try {
      new URL(String(value));
      return true;
    } catch {
      return false;
    }
  }

  private isPhone(value: any): boolean {
    if (!this.isRequired(value)) return true;
    return /^\+?[\d\s\-().]{10,}$/.test(String(value));
  }

  private isDate(value: any): boolean {
    if (!this.isRequired(value)) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private isNumeric(value: any): boolean {
    if (!this.isRequired(value)) return true;
    return !isNaN(Number(value));
  }

  private isAlpha(value: any): boolean {
    if (!this.isRequired(value)) return true;
    return /^[a-zA-Z]+$/.test(String(value));
  }

  private isAlphanumeric(value: any): boolean {
    if (!this.isRequired(value)) return true;
    return /^[a-zA-Z0-9]+$/.test(String(value));
  }

  private isEnum(value: any, values: any[]): boolean {
    if (!this.isRequired(value)) return true;
    return values.includes(value);
  }

  private isUnique(value: any, field: string, data?: any[]): boolean {
    if (!this.isRequired(value) || !data) return true;

    const occurrences = data.filter((row) => row[field] === value).length;
    return occurrences <= 1;
  }

  /**
   * Get default error message for rule
   */
  private getDefaultMessage(rule: ValidationRule): string {
    const field = rule.field;

    switch (rule.type) {
      case 'required':
        return `${field} is required`;

      case 'format':
        return `${field} has invalid format`;

      case 'range':
        return `${field} must be between ${rule.params?.min} and ${rule.params?.max}`;

      case 'length':
        return `${field} length must be between ${rule.params?.min} and ${rule.params?.max}`;

      case 'pattern':
        return `${field} does not match required pattern`;

      case 'email':
        return `${field} must be a valid email address`;

      case 'url':
        return `${field} must be a valid URL`;

      case 'phone':
        return `${field} must be a valid phone number`;

      case 'date':
        return `${field} must be a valid date`;

      case 'numeric':
        return `${field} must be numeric`;

      case 'alpha':
        return `${field} must contain only letters`;

      case 'alphanumeric':
        return `${field} must contain only letters and numbers`;

      case 'enum':
        return `${field} must be one of: ${rule.params?.values?.join(', ')}`;

      case 'unique':
        return `${field} must be unique`;

      case 'custom':
        return `${field} validation failed`;

      default:
        return `${field} is invalid`;
    }
  }

  /**
   * Initialize common validation templates
   */
  private initializeCommonTemplates(): void {
    // User data template
    this.addTemplate({
      id: 'user-data',
      name: 'User Data Validation',
      description: 'Standard validation for user discovery data',
      rules: [
        { type: 'required', field: 'UserPrincipalName' },
        { type: 'email', field: 'UserPrincipalName' },
        { type: 'required', field: 'DisplayName' },
        { type: 'email', field: 'EmailAddress', severity: 'warning' },
      ],
    });

    // Group data template
    this.addTemplate({
      id: 'group-data',
      name: 'Group Data Validation',
      description: 'Standard validation for group discovery data',
      rules: [
        { type: 'required', field: 'GroupId' },
        { type: 'required', field: 'DisplayName' },
        { type: 'email', field: 'EmailAddress', severity: 'warning' },
      ],
    });

    // Migration batch template
    this.addTemplate({
      id: 'migration-batch',
      name: 'Migration Batch Validation',
      description: 'Validation for migration batch data',
      rules: [
        { type: 'required', field: 'SourceId' },
        { type: 'required', field: 'TargetId' },
        { type: 'required', field: 'MigrationType' },
        { type: 'enum', field: 'MigrationType', params: { values: ['mailbox', 'archive', 'onedrive', 'sharepoint'] } },
      ],
    });
  }

  /**
   * Create a validation report
   * @param result Validation result
   * @returns Formatted report
   */
  createReport(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push('=== Validation Report ===');
    lines.push(`Valid: ${result.valid ? 'Yes' : 'No'}`);
    lines.push(`Errors: ${result.errorCount}`);
    lines.push(`Warnings: ${result.warningCount}`);
    lines.push(`Info: ${result.infoCount}`);
    lines.push('');

    if (result.errors.length > 0) {
      lines.push('ERRORS:');
      for (const error of result.errors) {
        lines.push(`  Row ${error.row ?? 'N/A'}: ${error.field} - ${error.message}`);
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('WARNINGS:');
      for (const warning of result.warnings) {
        lines.push(`  Row ${warning.row ?? 'N/A'}: ${warning.field} - ${warning.message}`);
      }
      lines.push('');
    }

    if (result.infos.length > 0) {
      lines.push('INFO:');
      for (const info of result.infos) {
        lines.push(`  Row ${info.row ?? 'N/A'}: ${info.field} - ${info.message}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

export default DataValidationService.getInstance();



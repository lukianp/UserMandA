/**
 * Validation Service
 * Data validation and business rules
 */

interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

class ValidationService {
  /**
   * Validate required field
   */
  required(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Validate email format
   */
  email(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  /**
   * Validate minimum length
   */
  minLength(value: string, min: number): boolean {
    return value && value.length >= min;
  }

  /**
   * Validate maximum length
   */
  maxLength(value: string, max: number): boolean {
    return value && value.length <= max;
  }

  /**
   * Validate number range
   */
  range(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate pattern
   */
  pattern(value: string, regex: RegExp): boolean {
    return regex.test(value);
  }

  /**
   * Validate object against rules
   */
  validate(data: Record<string, any>, rules: ValidationRule[]): ValidationResult {
    const errors: Record<string, string[]> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      if (!rule.validator(value)) {
        if (!errors[rule.field]) {
          errors[rule.field] = [];
        }
        errors[rule.field].push(rule.message);
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default new ValidationService();

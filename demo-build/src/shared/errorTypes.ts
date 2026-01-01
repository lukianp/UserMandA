/**
 * Standardized error response types
 * Provides consistent error handling across the application
 */

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a standardized error response
 * @param error - Error message or Error object
 * @param code - Optional error code
 * @returns ErrorResponse
 */
export function createErrorResponse(error: string | Error, code?: string): ErrorResponse {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    code,
  };
}

/**
 * Create a standardized success response
 * @param data - Response data
 * @returns SuccessResponse<T>
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}



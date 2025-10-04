/**
 * Error Handling Service
 * Global error handling and reporting
 */

interface ErrorReport {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  context?: string;
  userAgent: string;
  url: string;
}

class ErrorHandlingService {
  private errors: ErrorReport[] = [];

  initialize(): void {
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.captureError(event.error, 'Global Error');
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.captureError(event.reason, 'Unhandled Promise Rejection');
  }

  captureError(error: Error, context?: string): void {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(report);
    console.error('[ErrorHandlingService]', report);

    // Could send to error tracking service (Sentry, etc.)
  }

  getErrors(): ErrorReport[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export default new ErrorHandlingService();

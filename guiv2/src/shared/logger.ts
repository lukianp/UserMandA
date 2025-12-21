/**
 * Production-ready logging framework
 * Provides structured logging with environment-aware filtering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (!this.isDevelopment && level === 'debug') return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}] ${message}`, context || '');
    }

    // Send to main process for persistent logging
    if (typeof window !== 'undefined' && window.electron?.logMessage) {
      window.electron.logMessage(entry);
    }
  }
}

export const logger = new Logger();

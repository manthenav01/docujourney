// Centralized logging service for production debugging in Vercel
import { NextRequest } from 'next/server';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  environment?: string;
  timestamp?: string;
  traceId?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  data?: Record<string, any>;
}

class Logger {
  private readonly environment: string;
  private readonly logLevel: LogLevel;

  constructor() {
    this.environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || this.getDefaultLogLevel();
  }

  private getDefaultLogLevel(): LogLevel {
    switch (this.environment) {
      case 'production':
        return 'warn';
      case 'preview':
        return 'info';
      default:
        return 'debug';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    return levels[level] <= levels[this.logLevel];
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const traceId = entry.context?.traceId || this.generateTraceId();
    
    const logObject = {
      timestamp,
      level: entry.level.toUpperCase(),
      message: entry.message,
      traceId,
      environment: this.environment,
      ...entry.context,
      ...(entry.data && { data: entry.data }),
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
    };

    return JSON.stringify(logObject);
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formattedLog = this.formatLog(entry);
    
    // Use appropriate console method for Vercel logging
    switch (entry.level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
    }
  }

  error(message: string, error?: Error, context?: LogContext, data?: Record<string, any>): void {
    this.log({ level: 'error', message, error, context, data });
  }

  warn(message: string, context?: LogContext, data?: Record<string, any>): void {
    this.log({ level: 'warn', message, context, data });
  }

  info(message: string, context?: LogContext, data?: Record<string, any>): void {
    this.log({ level: 'info', message, context, data });
  }

  debug(message: string, context?: LogContext, data?: Record<string, any>): void {
    this.log({ level: 'debug', message, context, data });
  }

  // Helper methods for common logging patterns
  logRequest(req: NextRequest, context?: Partial<LogContext>): LogContext {
    const requestContext: LogContext = {
      requestId: req.headers.get('x-vercel-id') || this.generateTraceId(),
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      timestamp: new Date().toISOString(),
      ...context,
    };

    this.info('Incoming request', requestContext);
    return requestContext;
  }

  logResponse(context: LogContext, statusCode: number, duration: number, data?: Record<string, any>): void {
    const responseContext: LogContext = {
      ...context,
      statusCode,
      duration,
    };

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log({
      level,
      message: `Request completed`,
      context: responseContext,
      data,
    });
  }

  logApiError(message: string, error: Error, context: LogContext, data?: Record<string, any>): void {
    this.error(`API Error: ${message}`, error, {
      ...context,
      apiError: true,
    }, data);
  }

  logSlowQuery(queryName: string, duration: number, context?: LogContext): void {
    if (duration > 5000) { // Log queries slower than 5 seconds
      this.warn(`Slow query detected: ${queryName}`, {
        ...context,
        slowQuery: true,
        queryDuration: duration,
      });
    }
  }

  logBigQueryError(queryName: string, error: Error, context?: LogContext): void {
    this.error(`BigQuery Error: ${queryName}`, error, {
      ...context,
      bigQueryError: true,
    });
  }

  // Create a child logger with additional context
  child(additionalContext: LogContext): Logger {
    const childLogger = Object.create(this);
    const originalLog = this.log.bind(this);
    
    childLogger.log = (entry: LogEntry) => {
      const mergedEntry: LogEntry = {
        ...entry,
        context: {
          ...additionalContext,
          ...entry.context,
        },
      };
      originalLog(mergedEntry);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { Logger };
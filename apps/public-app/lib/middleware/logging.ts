// Logging middleware for API routes
import { NextRequest, NextResponse } from 'next/server';
import { logger, LogContext } from '@/lib/logger';

export interface RequestLoggingOptions {
  logBody?: boolean;
  logHeaders?: boolean;
  logQuery?: boolean;
  skipPaths?: string[];
  slowQueryThreshold?: number;
}

const defaultOptions: RequestLoggingOptions = {
  logBody: false,
  logHeaders: false,
  logQuery: true,
  skipPaths: ['/api/health', '/api/ping'],
  slowQueryThreshold: 5000,
};

export function withLogging<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  options: RequestLoggingOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const opts = { ...defaultOptions, ...options };
    
    // Skip logging for certain paths
    const pathname = new URL(req.url).pathname;
    if (opts.skipPaths?.some(path => pathname.includes(path))) {
      return handler(req);
    }

    // Create request context
    const requestContext: LogContext = {
      requestId: req.headers.get('x-vercel-id') || generateRequestId(),
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      timestamp: new Date().toISOString(),
      apiRoute: pathname,
    };

    // Add optional context
    if (opts.logQuery) {
      const searchParams = new URL(req.url).searchParams;
      const queryParams = Object.fromEntries(searchParams.entries());
      if (Object.keys(queryParams).length > 0) {
        requestContext.queryParams = queryParams;
      }
    }

    if (opts.logHeaders) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        // Don't log sensitive headers
        if (!['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });
      requestContext.headers = headers;
    }

    logger.info('API request received', requestContext);

    try {
      // Add body logging if enabled
      if (opts.logBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.text();
          // Try to parse as JSON for better logging
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
            // Remove sensitive fields
            if (typeof parsedBody === 'object' && parsedBody !== null) {
              const sanitizedBody = { ...parsedBody };
              ['password', 'token', 'secret', 'key'].forEach(field => {
                if (field in sanitizedBody) {
                  sanitizedBody[field] = '[REDACTED]';
                }
              });
              requestContext.requestBody = sanitizedBody;
            }
          } catch {
            // Not JSON, log as string (truncated)
            requestContext.requestBody = body.substring(0, 500);
          }
          
          // Create new request with the consumed body
          const newRequest = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: body || undefined,
          });
          req = newRequest;
        } catch (error) {
          logger.warn('Failed to read request body for logging', requestContext, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Execute the handler
      const response = await handler(req);
      
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Log slow queries
      if (duration > (opts.slowQueryThreshold || 5000)) {
        logger.warn(`Slow API request detected`, {
          ...requestContext,
          slowQuery: true,
          duration,
          statusCode,
        });
      }

      // Log response using helper to avoid TS union call issues
      logger.logResponse(
        {
          ...requestContext,
        },
        statusCode,
        duration,
        {
          responseSize: response.headers.get('content-length') || undefined,
        }
      );

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API request failed', error as Error, {
        ...requestContext,
        duration,
        unhandledError: true,
      });

      // Re-throw the error to be handled by the caller
      throw error;
    }
  };
}

// Utility function to generate request ID
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Higher-order function for easy API route wrapping
export function createApiHandler<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  options?: RequestLoggingOptions
) {
  return withLogging(handler, options);
}

// Middleware for Next.js middleware.ts file
export function loggingMiddleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Only log API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return;
  }

  const requestContext = logger.logRequest(request, {
    middleware: true,
  });

  // Add custom headers for request tracking
  const requestHeaders = new Headers(request.headers);
  if (!requestHeaders.has('x-request-id')) {
    requestHeaders.set('x-request-id', requestContext.requestId || generateRequestId());
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
# Production Logging Guide

## Overview
This application now includes comprehensive logging for debugging production errors in Vercel. The logging system is designed to work seamlessly with Vercel's built-in logging infrastructure.

## Components

### 1. Centralized Logger (`lib/logger.ts`)
- **Structured JSON logging** for better parsing in Vercel dashboard
- **Environment-aware log levels** (production: warn+, development: debug+)
- **Correlation IDs** for request tracing
- **Context-rich logs** with metadata like user, IP, timing

### 2. Error Boundaries
- **App Error Boundary** (`app/error.tsx`) - Catches component errors
- **Global Error Handler** (`app/global-error.tsx`) - Catches critical app-wide errors
- Both log errors with full context and provide user-friendly fallbacks

### 3. API Route Logging
- Updated example route (`app/api/h1b-data/route.ts`) with comprehensive logging
- **Request/response logging** with timing and status codes
- **Error logging** with stack traces and environment context
- **Slow query detection** for performance monitoring

### 4. Logging Middleware (`lib/middleware/logging.ts`)
- **Automatic request/response logging** for API routes
- **Request body logging** (configurable, with sensitive data redaction)
- **Performance monitoring** with slow query alerts
- **Easy integration** with existing API routes

## Usage Examples

### Basic Logging
```typescript
import { logger } from '@/lib/logger';

// Info logging
logger.info('User action completed', { userId: '123', action: 'create_document' });

// Error logging with context
logger.error('Database connection failed', error, { 
  userId: '123', 
  operation: 'save_document' 
});

// Debug logging (only shows in development)
logger.debug('Processing request', { requestId: 'abc123' });
```

### API Route Integration
```typescript
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestContext = logger.logRequest(request, {
    apiEndpoint: '/api/your-endpoint',
  });

  try {
    // Your logic here
    const result = await someOperation();
    
    const duration = Date.now() - startTime;
    logger.logResponse(requestContext, 200, duration, { resultCount: result.length });
    
    return NextResponse.json(result);
  } catch (error) {
    logger.logApiError('Operation failed', error as Error, requestContext);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Using Logging Middleware
```typescript
import { createApiHandler } from '@/lib/middleware/logging';

const handler = createApiHandler(async (req: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ success: true });
}, {
  logBody: true,        // Log request body
  logHeaders: false,    // Don't log headers (default)
  slowQueryThreshold: 3000, // Alert for requests > 3s
});

export { handler as GET, handler as POST };
```

## Environment Configuration

### Log Levels by Environment
- **Production** (`LOG_LEVEL=warn`): Only warnings and errors
- **Preview/Staging** (`LOG_LEVEL=info`): Info, warnings, and errors  
- **Development** (`LOG_LEVEL=debug`): All logs including debug

### Setting Up in Vercel
1. Go to your Vercel project settings
2. Add environment variables:
   ```
   LOG_LEVEL=warn  # for production
   LOG_LEVEL=info  # for preview
   ```

## Viewing Logs in Vercel

### 1. Vercel Dashboard
- Go to your project → Functions tab
- Click on any function to see logs
- Use the search and filter options to find specific errors

### 2. Vercel CLI
```bash
# Real-time logs
vercel logs

# Filter by function
vercel logs --function=app/api/h1b-data/route

# Follow logs
vercel logs --follow
```

### 3. Log Structure
All logs are JSON formatted for easy parsing:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "message": "API Error: H1B data API error (dashboard)",
  "traceId": "abc123def456",
  "environment": "production",
  "requestId": "req_789xyz",
  "url": "/api/h1b-data",
  "method": "GET",
  "statusCode": 500,
  "duration": 1250,
  "error": {
    "name": "BigQueryError",
    "message": "Invalid query syntax",
    "stack": "Error: Invalid query syntax\n    at..."
  }
}
```

## Best Practices

### 1. Security
- Sensitive data (passwords, tokens) is automatically redacted
- Personal information should not be logged in production
- Use context fields instead of including data in messages

### 2. Performance
- Debug logs are filtered out in production
- Large objects are truncated automatically
- Slow query detection helps identify performance issues

### 3. Error Context
Always include relevant context when logging errors:
```typescript
logger.error('User operation failed', error, {
  userId,
  operation: 'update_profile',
  requestId,
  userAgent: req.headers['user-agent'],
});
```

### 4. Correlation
Use the `traceId` to follow requests across multiple functions:
```typescript
// All related logs will have the same traceId
const context = logger.logRequest(request);
// ... pass context to other functions
logger.info('Processing step 2', context);
```

## Advanced Features

### 1. Log Drains (Optional)
For advanced logging, you can set up Vercel log drains to external services:
- Datadog
- LogDNA/New Relic
- Splunk
- Custom webhooks

Configure in Vercel project settings under "Log Drains".

### 2. Custom Context
Create child loggers with additional context:
```typescript
const userLogger = logger.child({ userId: '123', feature: 'dashboard' });
userLogger.info('User viewed page'); // Includes userId and feature automatically
```

### 3. Performance Monitoring
The logger automatically tracks:
- Request duration
- Slow queries (>5s by default)
- Error rates by endpoint
- BigQuery performance metrics

## Troubleshooting

### Common Issues
1. **Logs not appearing**: Check LOG_LEVEL environment variable
2. **Missing context**: Ensure logger.logRequest() is called at request start
3. **Truncated logs**: Large objects are automatically truncated for performance

### Debug Mode
In development, set `LOG_LEVEL=debug` to see all logging activity including:
- Request parsing details
- Environment configuration
- BigQuery query execution
- Cache hit/miss information
/**
 * Centralized Logging Utility
 * 
 * Provides structured logging with different log levels
 * Can be extended to integrate with external logging services
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        // In production, you might want to send to error tracking service
        if (this.isProduction) {
          // Example: Send to Sentry, LogRocket, etc.
          // Sentry.captureException(new Error(message), { extra: context });
        }
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API ${method} ${path}`, context);
  }

  /**
   * Log API response
   */
  apiResponse(method: string, path: string, status: number, duration?: number, context?: LogContext) {
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    this.log(level, `API ${method} ${path} ${status}${duration ? ` (${duration}ms)` : ""}`, context);
  }

  /**
   * Log cache operations
   */
  cache(operation: "HIT" | "MISS" | "SET", key: string, context?: LogContext) {
    const emoji = operation === "HIT" ? "✅" : operation === "MISS" ? "🔄" : "💾";
    this.debug(`${emoji} Cache ${operation}: ${key}`, context);
  }

  /**
   * Log Football API operations
   */
  footballApi(operation: string, endpoint: string, context?: LogContext) {
    this.info(`⚽ Football API ${operation}: ${endpoint}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for convenience
export default logger;


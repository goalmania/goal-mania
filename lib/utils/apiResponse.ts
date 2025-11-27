/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formats across all API endpoints
 */

import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    cached?: boolean;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    headers?: Record<string, string>;
    cached?: boolean;
    [key: string]: any;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const {
    message,
    status = 200,
    headers = {},
    cached,
    ...meta
  } = options || {};

  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      ...(cached !== undefined && { cached }),
      ...meta,
    },
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string,
  options?: {
    code?: string;
    status?: number;
    details?: any;
    headers?: Record<string, string>;
  }
): NextResponse<ApiErrorResponse> {
  const {
    code = "INTERNAL_ERROR",
    status = 500,
    details,
    headers = {},
  } = options || {};

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  TIMEOUT: "TIMEOUT",
} as const;


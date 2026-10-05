import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/types/api";

export function apiSuccess<T>(
  data: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>,
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: statusCode });
}

export function apiError(
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_SERVER_ERROR",
  details?: unknown,
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: statusCode });
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    logger.warn(`Handled AppError [${error.code}]: ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details,
    });
    return apiError(error.message, error.statusCode, error.code, error.details);
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    logger.warn("Validation Error", { errors: formattedErrors });
    return apiError(
      "Validation failed for request parameters",
      400,
      "VALIDATION_ERROR",
      formattedErrors,
    );
  }

  logger.error("Unhandled API Error", error);
  return apiError("An internal server error occurred", 500, "INTERNAL_SERVER_ERROR");
}

export const ApiResponse = {
  success: <T>(data: T, statusCode = 200, meta?: Record<string, unknown>) =>
    apiSuccess(data, statusCode, meta),

  badRequest: (message: string, code = "BAD_REQUEST", details?: unknown) =>
    apiError(message, 400, code, details),

  unauthorized: (message = "Authentication required", code = "UNAUTHORIZED") =>
    apiError(message, 401, code),

  forbidden: (message = "Access denied", code = "FORBIDDEN") => apiError(message, 403, code),

  notFound: (message = "Resource not found", code = "NOT_FOUND") => apiError(message, 404, code),

  tooManyRequests: (message = "Too many requests", code = "TOO_MANY_REQUESTS") =>
    apiError(message, 429, code),

  validationError: (message: string, details?: unknown) =>
    apiError(message, 400, "VALIDATION_ERROR", details),

  internalError: (message = "An internal error occurred", code = "INTERNAL_SERVER_ERROR") =>
    apiError(message, 500, code),
};

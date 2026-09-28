import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "./response";
import { logger } from "@/lib/logger";

type ApiHandler<T = unknown> = (
  req: NextRequest,
  context?: Record<string, unknown>,
) => Promise<NextResponse<T>> | NextResponse<T>;

export function withApiHandler<T = unknown>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req: NextRequest, context?: Record<string, unknown>) => {
    const startTime = performance.now();
    const { method, url } = req;

    try {
      logger.info(`API Request started: ${method} ${url}`);
      const response = await handler(req, context);
      const duration = (performance.now() - startTime).toFixed(2);
      logger.info(`API Request completed: ${method} ${url} in ${duration}ms`, {
        status: response.status,
      });
      return response;
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(2);
      logger.error(`API Request failed: ${method} ${url} in ${duration}ms`, error);
      return handleApiError(error) as NextResponse<T>;
    }
  };
}

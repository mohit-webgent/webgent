import { env } from "@/lib/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: number;

  constructor() {
    const configuredLevel = env.LOG_LEVEL || "info";
    this.minLevel = LOG_LEVELS[configuredLevel] ?? 1;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...(meta ? { meta } : {}),
      environment: env.NODE_ENV,
    };
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;
    console.debug(JSON.stringify(this.formatEntry("debug", message, meta)));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;
    console.info(JSON.stringify(this.formatEntry("info", message, meta)));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;
    console.warn(JSON.stringify(this.formatEntry("warn", message, meta)));
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    if (!this.shouldLog("error")) return;
    const errObj =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { raw: error };

    console.error(JSON.stringify(this.formatEntry("error", message, { ...meta, error: errObj })));
  }
}

export const logger = new Logger();

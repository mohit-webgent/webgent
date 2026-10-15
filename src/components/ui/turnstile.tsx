"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          retry?: "auto" | "never";
          "retry-interval"?: number;
          "refresh-expired"?: "auto" | "manual" | "never";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | undefined;
}

export interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode?: string) => void;
  theme?: "dark" | "light" | "auto";
  size?: "normal" | "compact" | "flexible";
  action?: string;
  cData?: string;
  className?: string;
  id?: string;
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );

    if (existingScript) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", (e) => reject(e), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  (
    {
      siteKey,
      onVerify,
      onExpire,
      onError,
      theme = "dark",
      size = "normal",
      action,
      cData,
      className = "",
      id,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const activeSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const isProduction = process.env.NODE_ENV === "production";

    // Stable callback refs to avoid re-rendering widget when callbacks change
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onExpireRef.current = onExpire;
      onErrorRef.current = onError;
    }, [onVerify, onExpire, onError]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
            } catch {
              // Ignore reset errors
            }
          } else if (!isProduction && !activeSiteKey) {
            onVerifyRef.current?.("dev-mock-turnstile-token");
          }
        },
        getResponse: () => {
          if (widgetIdRef.current && window.turnstile) {
            return window.turnstile.getResponse(widgetIdRef.current);
          }
          if (!isProduction && !activeSiteKey) {
            return "dev-mock-turnstile-token";
          }
          return undefined;
        },
      }),
      [isProduction, activeSiteKey],
    );

    useEffect(() => {
      let isMounted = true;

      // Handle unconfigured site key
      if (!activeSiteKey) {
        if (!isProduction) {
          // In local dev without keys, issue mock token for seamless developer workflow
          onVerifyRef.current?.("dev-mock-turnstile-token");
        } else {
          setLoadError("Turnstile site key missing in production. Form submission is disabled.");
        }
        return;
      }

      loadTurnstileScript()
        .then(() => {
          if (!isMounted || !containerRef.current || !window.turnstile) return;

          // Cleanup previous widget instance if present
          if (widgetIdRef.current) {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch { }
            widgetIdRef.current = null;
          }

          try {
            const widgetId = window.turnstile.render(containerRef.current, {
              sitekey: activeSiteKey,
              theme,
              size,
              action,
              cData,
              callback: (token: string) => {
                if (isMounted) {
                  setLoadError(null);
                  onVerifyRef.current?.(token);
                }
              },
              "error-callback": (errorCode?: string) => {
                if (isMounted) {
                  setLoadError("Security check encountered an error. Please retry.");
                  onErrorRef.current?.(errorCode);
                }
              },
              "expired-callback": () => {
                if (isMounted) {
                  onExpireRef.current?.();
                }
              },
            });
            widgetIdRef.current = widgetId;
          } catch (renderErr) {
            if (isMounted) {
              setLoadError("Failed to initialize security verification.");
              onErrorRef.current?.(String(renderErr));
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            setLoadError("Failed to load security verification challenge.");
            onErrorRef.current?.(String(err));
          }
        });

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch { }
          widgetIdRef.current = null;
        }
      };
    }, [activeSiteKey, theme, size, action, cData, isProduction]);

    // When site key is missing in development, render a subtle luxury badge
    if (!activeSiteKey && !isProduction) {
      return (
        <div
          id={id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-neutral-400 select-none ${className}`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Cloudflare Turnstile</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
            Dev Bypass Active
          </span>
        </div>
      );
    }

    // In production with missing key, render fail-closed alert
    if (!activeSiteKey && isProduction) {
      return (
        <div
          id={id}
          className={`p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 ${className}`}
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Security challenge misconfigured. Form submission disabled.</span>
        </div>
      );
    }

    return (
      <div id={id} className={`turnstile-widget-container ${className}`}>
        {loadError && (
          <div className="p-2.5 mb-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}
        <div ref={containerRef} className="inline-block min-h-[65px]" />
      </div>
    );
  },
);

Turnstile.displayName = "Turnstile";

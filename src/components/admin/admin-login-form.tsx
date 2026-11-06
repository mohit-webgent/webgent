"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Shield } from "lucide-react";
import { loginSchema } from "@/lib/validations/auth";

interface AdminLoginFormProps {
  callbackUrl: string;
  initialError: string | null;
}

function describeSignInFailure(error: string, code?: string | null): string {
  if (error !== "CredentialsSignin") {
    // The server failed, for example the database is down. Blaming the password would mislead.
    return "Sign-in is unavailable right now. Please try again in a few minutes.";
  }
  if (code === "account_inactive") {
    return "This account is inactive or suspended. Contact your administrator.";
  }
  if (code === "rate_limited") {
    return "Too many sign-in attempts. Please wait 15 minutes and try again.";
  }
  return "Incorrect email or password.";
}

const inputClassName =
  "block w-full py-3 bg-canvas border border-line rounded-none text-fg placeholder:text-fg-muted text-sm transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent aria-[invalid=true]:border-rose-500/60";

export function AdminLoginForm({ callbackUrl, initialError }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email: email.trim(), password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: validation.data.email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(describeSignInFailure(res.error, res.code));
        setPassword("");
        setLoading(false);
        return;
      }

      // A full page load is required: the admin layout only adds the console around signed-in
      // requests, and a client-side navigation would keep the signed-out layout.
      window.location.assign(new URL(callbackUrl, window.location.origin).href);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-10 sm:px-6">
      <main className="w-full max-w-sm space-y-7">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-none bg-accent/10 text-accent border border-accent/30">
            <Shield className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Sign in to Webgent</h1>
          <p className="text-sm text-fg-muted">Admin console for the Webgent team</p>
        </div>

        <div className="bg-surface border border-line rounded-none p-6 sm:p-7">
          {error && (
            <div
              id="admin-login-error"
              role="alert"
              className="mb-5 p-3 rounded-none bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-fg-soft mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  inputMode="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  aria-invalid={!!error}
                  aria-describedby={error ? "admin-login-error" : undefined}
                  className={`${inputClassName} pl-10 pr-4`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-fg-soft mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "admin-login-error" : undefined}
                  className={`${inputClassName} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-fg-muted hover:text-fg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-accent-fg font-semibold text-sm rounded-none flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to website</span>
        </Link>
      </main>
    </div>
  );
}

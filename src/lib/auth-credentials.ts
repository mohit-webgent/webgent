import crypto from "crypto";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/client-ip";
import { logger } from "@/lib/logger";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP_AND_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 30;
const MAX_ATTEMPTS_PER_EMAIL = 20;

/** Compared against when the account does not exist, so response time does not reveal which emails exist. */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(24).toString("hex"), 10);

export class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive";
}

export class LoginRateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

/**
 * Short value derived from the password hash and stored in the session token.
 * Changing a password changes this value, which ends every existing session for that account.
 */
export function computeSessionFingerprint(passwordHash: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  return crypto.createHmac("sha256", secret).update(passwordHash).digest("hex").slice(0, 32);
}

export async function authorizeCredentials(credentials: unknown, request?: Request) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return null;
  }

  const email = parsed.data.email.toLowerCase();
  const ip = request ? getClientIp(request.headers) : "unknown";
  const pairKey = `login:pair:${ip}:${email}`;

  const limits = await Promise.all([
    checkRateLimit(pairKey, MAX_ATTEMPTS_PER_IP_AND_EMAIL, LOGIN_WINDOW_MS),
    checkRateLimit(`login:ip:${ip}`, MAX_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS),
    checkRateLimit(`login:email:${email}`, MAX_ATTEMPTS_PER_EMAIL, LOGIN_WINDOW_MS),
  ]);

  if (limits.some((limit) => !limit.success)) {
    logger.warn("[Auth] Login rate limit exceeded", { ip });
    throw new LoginRateLimitedError();
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const isPasswordValid = await bcrypt.compare(
    parsed.data.password,
    user?.passwordHash || DUMMY_PASSWORD_HASH,
  );

  if (!user || !user.passwordHash || !isPasswordValid) {
    return null;
  }

  // Checked only after the password, so account status is never revealed to someone without it.
  if (user.status !== UserStatus.ACTIVE) {
    throw new AccountInactiveError();
  }

  await clearRateLimit(pairKey);
  await prisma.user
    .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    .catch(() => {});

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    image: user.avatarUrl,
    sessionFingerprint: computeSessionFingerprint(user.passwordHash),
  };
}

/**
 * Re-reads the account on every authenticated request, so suspensions, role changes, deletions
 * and password changes take effect immediately. Returning null ends the session.
 */
export async function refreshSessionToken(token: JWT): Promise<JWT | null> {
  if (!token.id) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: {
        role: true,
        status: true,
        name: true,
        email: true,
        avatarUrl: true,
        passwordHash: true,
      },
    });

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      token.sessionFingerprint !== computeSessionFingerprint(user.passwordHash)
    ) {
      return null;
    }

    return {
      ...token,
      role: user.role,
      status: user.status,
      name: user.name,
      email: user.email,
      picture: user.avatarUrl,
    };
  } catch (error) {
    // A brief database outage should not sign everyone out. Admin routes need the database anyway.
    logger.warn("[Auth] Could not refresh session from database", { error: String(error) });
    return token;
  }
}

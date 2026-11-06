const DEFAULT_DESTINATION = "/admin";

/**
 * Where to send someone after sign-in. Only pages inside the admin console are allowed, so a crafted
 * login link cannot redirect off-site, and the login page itself is excluded so it cannot loop.
 */
export function resolveAdminCallback(requested: string | null | undefined): string {
  if (!requested || requested.includes("\\")) {
    return DEFAULT_DESTINATION;
  }

  const isConsolePage = /^\/admin(?:[/?#]|$)/.test(requested);
  const isLoginPage = /^\/admin\/login(?:[/?#]|$)/.test(requested);

  return isConsolePage && !isLoginPage ? requested : DEFAULT_DESTINATION;
}

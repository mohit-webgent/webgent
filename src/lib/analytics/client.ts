export type DeviceType = "desktop" | "mobile" | "tablet" | "other";

const SESSION_STORAGE_KEY = "webgent_sid";

export function getSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const localId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (localId && /^[a-zA-Z0-9_-]{4,64}$/.test(localId)) {
      return localId;
    }

    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${SESSION_STORAGE_KEY})=([^;]*)`));
    if (match && match[3] && /^[a-zA-Z0-9_-]{4,64}$/.test(match[3])) {
      localStorage.setItem(SESSION_STORAGE_KEY, match[3]);
      return match[3];
    }

    let newId: string;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      newId = `sid_${crypto.randomUUID()}`;
    } else {
      newId = `sid_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    document.cookie = `${SESSION_STORAGE_KEY}=${newId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    return newId;
  } catch {
    return `sid_fallback_${Date.now()}`;
  }
}

export function getClientDeviceCategory(): DeviceType {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const ua = navigator.userAgent || "";
  if (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(
      ua,
    )
  ) {
    return "tablet";
  }
  if (/(mobi|ipod|phone|iphone|blackberry|opera mini)/i.test(ua) || window.innerWidth < 768) {
    return "mobile";
  }
  return "desktop";
}

function sendPayload(endpoint: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const dataStr = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([dataStr], { type: "application/json" });
      const success = navigator.sendBeacon(endpoint, blob);
      if (success) return;
    } catch {}
  }

  try {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dataStr,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  } catch {}
}

export function trackPageView(path?: string, referrer?: string) {
  if (typeof window === "undefined") return;

  const resolvedPath = path || window.location.pathname;

  if (resolvedPath.startsWith("/admin")) {
    return;
  }

  const payload = {
    path: resolvedPath,
    referrer: referrer !== undefined ? referrer : document.referrer || null,
    sessionId: getSessionId(),
    device: getClientDeviceCategory(),
  };

  sendPayload("/api/analytics/pageview", payload);
}

export function trackEvent(name: string, properties?: Record<string, unknown>, category?: string) {
  if (typeof window === "undefined") return;

  const sanitizedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  const payload = {
    name: sanitizedName,
    category: category || "interaction",
    path: window.location.pathname,
    metadata: properties || null,
    sessionId: getSessionId(),
    device: getClientDeviceCategory(),
  };

  sendPayload("/api/analytics/event", payload);
}

export function trackFormStart(formName: string, metadata?: Record<string, unknown>) {
  trackEvent("FORM_START", { form: formName, ...metadata }, "form");
}

export function trackFormSubmit(formName: string, metadata?: Record<string, unknown>) {
  trackEvent("FORM_SUBMIT", { form: formName, ...metadata }, "form");
}

export function trackDemoClick(projectSlug: string, demoUrl: string) {
  trackEvent("DEMO_CLICK", { project: projectSlug, url: demoUrl }, "conversion");
}

export function trackWhatsAppClick(source: string = "floating_button") {
  trackEvent("WHATSAPP_CLICK", { source }, "conversion");
}

export function trackCtaClick(label: string, destination?: string) {
  trackEvent("CTA_CLICK", { label, destination }, "conversion");
}

export function trackBlogRead(slug: string, title?: string, readTime?: number) {
  trackEvent("BLOG_READ", { slug, title, readTime }, "content");
}

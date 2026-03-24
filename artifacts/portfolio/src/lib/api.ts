const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "");

const PROD_API = "https://api.najmulalam.site";

function getApiBase(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "najmulalam.site" || host === "www.najmulalam.site" || host.endsWith(".pages.dev")) {
      return PROD_API;
    }
  }
  return `${BASE}`;
}

export function apiUrl(path: string): string {
  return `${getApiBase()}/api${path}`;
}

export function adminHeaders(): HeadersInit {
  const token = localStorage.getItem("admin_token") ?? "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { ...adminHeaders(), ...(init?.headers ?? {}) },
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = `${BASE}/admin`;
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

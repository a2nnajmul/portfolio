import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const KV_PATH = join(process.cwd(), ".local", "dev-kv.json");

function ensureDir() {
  const dir = join(process.cwd(), ".local");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function load(): Record<string, string> {
  ensureDir();
  if (!existsSync(KV_PATH)) return {};
  try {
    return JSON.parse(readFileSync(KV_PATH, "utf8"));
  } catch {
    return {};
  }
}

function save(store: Record<string, string>) {
  ensureDir();
  writeFileSync(KV_PATH, JSON.stringify(store, null, 2), "utf8");
}

export const kv = {
  get(key: string): string | null {
    const store = load();
    return store[key] ?? null;
  },
  put(key: string, value: string): void {
    const store = load();
    store[key] = value;
    save(store);
  },
  delete(key: string): void {
    const store = load();
    delete store[key];
    save(store);
  },
};

export function getJson<T>(key: string, fallback: T): T {
  const raw = kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function putJson<T>(key: string, value: T): void {
  kv.put(key, JSON.stringify(value));
}

import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { getJson, putJson } from "./kv.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret(): string | null {
  return process.env["ADMIN_PASSWORD"] ?? null;
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const storedHash = getJson<string | null>("admin_password_hash", null);
  if (storedHash) {
    return verifyPassword(password, storedHash);
  }
  const envPassword = getSecret();
  if (!envPassword) return false;
  return password === envPassword;
}

export function changeAdminPassword(newPassword: string): void {
  putJson("admin_password_hash", hashPassword(newPassword));
}

export function createToken(): string {
  const s = getSecret();
  const storedHash = getJson<string | null>("admin_password_hash", null);
  const secret = storedHash || s;
  if (!secret) throw new Error("ADMIN_PASSWORD not configured");
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const s = getSecret();
  const storedHash = getJson<string | null>("admin_password_hash", null);
  const secret = storedHash || s;
  if (!secret || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expectedSig = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) return false;
  } catch {
    return false;
  }
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAuth(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
): void {
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

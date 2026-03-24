/**
 * Cloudflare Worker — Portfolio API
 * KV namespace: PORTFOLIO_KV (bind in wrangler.toml)
 * Secrets: wrangler secret put RESEND_API_KEY
 *          wrangler secret put ADMIN_PASSWORD
 *          wrangler secret put JWT_SECRET  (optional, falls back to ADMIN_PASSWORD)
 */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders(origin, methods = "GET, POST, PUT, DELETE, OPTIONS") {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function hmacSign(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacVerify(message, sigHex, secret) {
  const expected = await hmacSign(message, secret);
  if (expected.length !== sigHex.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sigHex.charCodeAt(i);
  return diff === 0;
}

async function createToken(env) {
  const secret = env.JWT_SECRET || env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD not configured");
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const sig = await hmacSign(payload, secret);
  return `${payload}.${sig}`;
}

async function verifyToken(token, env) {
  const secret = env.JWT_SECRET || env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!await hmacVerify(payload, sig, secret)) return false;
  try {
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(decoded);
    return typeof exp === "number" && exp > Date.now();
  } catch { return false; }
}

async function getJson(kv, key, fallback) {
  const raw = await kv.get(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function randomId() {
  return crypto.randomUUID();
}

const DEFAULT_PROJECTS = [
  { id: "1", title: "Brand Identity", category: "Branding", description: "Logo and brand identity system for a local business.", imageUrl: "", link: "", gradient: "from-orange-400 to-rose-500", featured: true },
  { id: "2", title: "Mobile UI Design", category: "UI/UX", description: "User interface design for a mobile productivity app.", imageUrl: "", link: "", gradient: "from-blue-500 to-indigo-600", featured: false },
  { id: "3", title: "Creative Flyer", category: "Graphic Design", description: "Event promotional flyer with modern typography.", imageUrl: "", link: "", gradient: "from-emerald-400 to-cyan-500", featured: false },
  { id: "4", title: "Logo Design", category: "Branding", description: "Minimalist logo design for a tech startup.", imageUrl: "", link: "", gradient: "from-purple-500 to-fuchsia-600", featured: false },
  { id: "5", title: "Social Media Post", category: "Marketing", description: "Engaging social media graphics for Instagram campaigns.", imageUrl: "", link: "", gradient: "from-pink-500 to-rose-500", featured: false },
  { id: "6", title: "T-Shirt Design", category: "Merchandise", description: "Custom apparel design with bold graphic elements.", imageUrl: "", link: "", gradient: "from-amber-400 to-orange-500", featured: false },
];
const DEFAULT_EXPERIENCE = [
  { id: "1", company: "Facebook", role: "Ads Marketing", year: "Since 2015", description: "Specialized in social media advertising, campaign management, and content promotion targeting specific demographics to maximize engagement and ROI." },
  { id: "2", company: "YouTube", role: "Web Solution", year: "Since 2015", description: "Provided video content creation strategies and web solution consulting to optimize channel growth and digital presence." },
];
const DEFAULT_ABOUT = { bio: "I am a creative Graphic Designer and a curious student from Bangladesh. I love creating modern and clean designs, tackling challenges, and exploring new technologies. I specialize in logo design, UI/UX, and brand identity." };

async function seedKVIfEmpty(kv) {
  if (!kv) return;
  const [p, e, a] = await Promise.all([kv.get("projects"), kv.get("experience"), kv.get("about")]);
  const writes = [];
  if (!p) writes.push(kv.put("projects", JSON.stringify(DEFAULT_PROJECTS)));
  if (!e) writes.push(kv.put("experience", JSON.stringify(DEFAULT_EXPERIENCE)));
  if (!a) writes.push(kv.put("about", JSON.stringify(DEFAULT_ABOUT)));
  if (!await kv.get("messages")) writes.push(kv.put("messages", JSON.stringify([])));
  await Promise.all(writes);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    let body = null;
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, origin); }
    }

    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const kv = env.PORTFOLIO_KV;

    await seedKVIfEmpty(kv);

    if (path === "/api/contact" && request.method === "POST") {
      const { name, email, message, hp } = body ?? {};
      if (hp && hp.length > 0) return json({ success: true }, 200, origin);
      if (!name || name.trim().length < 2) return json({ success: false, error: "Name is required (minimum 2 characters)" }, 400, origin);
      if (!email || !isValidEmail(email.trim())) return json({ success: false, error: "A valid email address is required" }, 400, origin);
      if (!message || message.trim().length < 10) return json({ success: false, error: "Message is required (minimum 10 characters)" }, 400, origin);
      const sanitized = { name: name.trim().slice(0, 100), email: email.trim().slice(0, 200), message: message.trim().slice(0, 2000) };
      if (kv) {
        const messages = await getJson(kv, "messages", []);
        messages.unshift({ id: randomId(), ...sanitized, createdAt: new Date().toISOString() });
        await kv.put("messages", JSON.stringify(messages));
      }
      if (env.RESEND_API_KEY) {
        try {
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: "Portfolio Contact <onboarding@resend.dev>", to: ["a2nnajmul@gmail.com"], subject: `Portfolio Contact from ${sanitized.name}`, text: `Name: ${sanitized.name}\nEmail: ${sanitized.email}\n\nMessage:\n${sanitized.message}`, reply_to: sanitized.email }),
          });
          if (!r.ok) return json({ success: false, error: "Failed to send email. Please try again." }, 500, origin);
        } catch { return json({ success: false, error: "Failed to send email. Please try again." }, 500, origin); }
      }
      return json({ success: true, message: "Thank you! I'll get back to you soon." }, 200, origin);
    }

    if (path === "/api/projects" && request.method === "GET") {
      const projects = kv ? await getJson(kv, "projects", []) : [];
      return json(projects, 200, origin);
    }

    if (path === "/api/experience" && request.method === "GET") {
      const experience = kv ? await getJson(kv, "experience", []) : [];
      return json(experience, 200, origin);
    }

    if (path === "/api/about" && request.method === "GET") {
      const about = kv ? await getJson(kv, "about", { bio: "" }) : { bio: "" };
      return json(about, 200, origin);
    }

    if (path === "/api/admin/login" && request.method === "POST") {
      const { password } = body ?? {};
      if (!env.ADMIN_PASSWORD) return json({ error: "Admin password not configured" }, 503, origin);
      if (password !== env.ADMIN_PASSWORD) return json({ error: "Invalid password" }, 401, origin);
      const t = await createToken(env);
      return json({ token: t }, 200, origin);
    }

    if (path.startsWith("/api/admin/")) {
      if (!await verifyToken(token, env)) return json({ error: "Unauthorized" }, 401, origin);
      if (!kv) return json({ error: "KV not configured" }, 503, origin);

      if (path === "/api/admin/projects") {
        if (request.method === "GET") return json(await getJson(kv, "projects", []), 200, origin);
        if (request.method === "POST") {
          const projects = await getJson(kv, "projects", []);
          const p = { id: randomId(), title: String(body?.title ?? "").slice(0, 120), category: String(body?.category ?? "").slice(0, 60), description: String(body?.description ?? "").slice(0, 500), imageUrl: String(body?.imageUrl ?? "").slice(0, 500), link: String(body?.link ?? "").slice(0, 500), gradient: String(body?.gradient ?? "from-orange-400 to-rose-500").slice(0, 100), featured: Boolean(body?.featured) };
          projects.push(p);
          await kv.put("projects", JSON.stringify(projects));
          return json(p, 201, origin);
        }
      }

      const projMatch = path.match(/^\/api\/admin\/projects\/(.+)$/);
      if (projMatch) {
        const id = projMatch[1];
        const projects = await getJson(kv, "projects", []);
        const idx = projects.findIndex((p) => p.id === id);
        if (request.method === "PUT") {
          if (idx === -1) return json({ error: "Not found" }, 404, origin);
          projects[idx] = { ...projects[idx], ...body, id };
          await kv.put("projects", JSON.stringify(projects));
          return json(projects[idx], 200, origin);
        }
        if (request.method === "DELETE") {
          if (idx === -1) return json({ error: "Not found" }, 404, origin);
          projects.splice(idx, 1);
          await kv.put("projects", JSON.stringify(projects));
          return json({ success: true }, 200, origin);
        }
      }

      if (path === "/api/admin/experience") {
        if (request.method === "GET") return json(await getJson(kv, "experience", []), 200, origin);
        if (request.method === "PUT") {
          if (!Array.isArray(body)) return json({ error: "Expected array" }, 400, origin);
          await kv.put("experience", JSON.stringify(body));
          return json(body, 200, origin);
        }
      }

      if (path === "/api/admin/about") {
        if (request.method === "GET") return json(await getJson(kv, "about", { bio: "" }), 200, origin);
        if (request.method === "PUT") {
          const updated = { bio: String(body?.bio ?? "").slice(0, 2000) };
          await kv.put("about", JSON.stringify(updated));
          return json(updated, 200, origin);
        }
      }

      if (path === "/api/admin/messages") {
        if (request.method === "GET") return json(await getJson(kv, "messages", []), 200, origin);
      }

      const msgMatch = path.match(/^\/api\/admin\/messages\/(.+)$/);
      if (msgMatch) {
        const id = msgMatch[1];
        if (request.method === "DELETE") {
          const messages = await getJson(kv, "messages", []);
          const filtered = messages.filter((m) => m.id !== id);
          await kv.put("messages", JSON.stringify(filtered));
          return json({ success: true }, 200, origin);
        }
      }
    }

    return json({ error: "Not found" }, 404, origin);
  },
};

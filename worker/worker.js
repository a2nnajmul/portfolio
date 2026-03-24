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

async function sha256Hex(text) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getTokenSecret(kv, env) {
  const storedHash = kv ? await kv.get("admin_password_hash") : null;
  return storedHash || env.JWT_SECRET || env.ADMIN_PASSWORD;
}

async function createToken(kv, env) {
  const secret = await getTokenSecret(kv, env);
  if (!secret) throw new Error("ADMIN_PASSWORD not configured");
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const sig = await hmacSign(payload, secret);
  return `${payload}.${sig}`;
}

async function verifyToken(token, kv, env) {
  const secret = await getTokenSecret(kv, env);
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

async function checkAdminPassword(password, kv, env) {
  const storedHash = kv ? await kv.get("admin_password_hash") : null;
  if (storedHash) {
    const computed = await sha256Hex(password);
    if (computed.length !== storedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
    return diff === 0;
  }
  return password === env.ADMIN_PASSWORD;
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
const DEFAULT_HERO = {
  name: "Najmul Alam",
  greeting: "Hi, I'm",
  title: "Student & Graphic Designer",
  buttonPrimary: "Download CV",
  buttonSecondary: "View Work",
};
const DEFAULT_SKILLS = {
  core: [
    { id: "1", name: "Graphic Design", icon: "Palette", description: "Logo design, branding, flyers, social media" },
    { id: "2", name: "UI/UX Design", icon: "Layout", description: "Modern interfaces, wireframes, prototypes" },
    { id: "3", name: "Adobe Illustrator", icon: "PenTool", description: "Vector graphics, illustrations, icons" },
    { id: "4", name: "Adobe Photoshop", icon: "Image", description: "Photo editing, manipulation, compositing" },
  ],
  technical: ["Windows OS", "Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Google Workspace", "Canva", "Figma"],
};
const DEFAULT_ABOUT_TABS = {
  education: [{ id: "1", title: "SSC (Science)", institution: "Local High School", year: "2020", description: "Completed secondary education with science major." }],
  languages: [{ id: "1", name: "Bengali", level: "Native" }, { id: "2", name: "English", level: "Intermediate" }, { id: "3", name: "Hindi", level: "Basic" }],
  extraCurricular: [{ id: "1", activity: "Freelance Graphic Design", description: "Creating designs for local and international clients." }],
};

async function seedKVIfEmpty(kv) {
  if (!kv) return;
  const keys = ["projects", "experience", "about", "messages", "blog", "content:hero", "content:skills", "content:about-tabs"];
  const values = await Promise.all(keys.map(k => kv.get(k)));
  const writes = [];
  if (!values[0]) writes.push(kv.put("projects", JSON.stringify(DEFAULT_PROJECTS)));
  if (!values[1]) writes.push(kv.put("experience", JSON.stringify(DEFAULT_EXPERIENCE)));
  if (!values[2]) writes.push(kv.put("about", JSON.stringify(DEFAULT_ABOUT)));
  if (!values[3]) writes.push(kv.put("messages", JSON.stringify([])));
  if (!values[4]) writes.push(kv.put("blog", JSON.stringify([])));
  if (!values[5]) writes.push(kv.put("content:hero", JSON.stringify(DEFAULT_HERO)));
  if (!values[6]) writes.push(kv.put("content:skills", JSON.stringify(DEFAULT_SKILLS)));
  if (!values[7]) writes.push(kv.put("content:about-tabs", JSON.stringify(DEFAULT_ABOUT_TABS)));
  await Promise.all(writes);
}

const VALID_CONTENT_SECTIONS = ["hero", "skills", "about-tabs"];

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

    // --- Public routes ---

    if (path === "/api/contact" && request.method === "POST") {
      const { name, email, message, hp } = body ?? {};
      if (hp && hp.length > 0) return json({ success: true }, 200, origin);
      if (!name || name.trim().length < 2) return json({ success: false, error: "Name is required (minimum 2 characters)" }, 400, origin);
      if (!email || !isValidEmail(email.trim())) return json({ success: false, error: "A valid email address is required" }, 400, origin);
      if (!message || message.trim().length < 10) return json({ success: false, error: "Message is required (minimum 10 characters)" }, 400, origin);
      const sanitized = { name: name.trim().slice(0, 100), email: email.trim().slice(0, 200), message: message.trim().slice(0, 2000) };
      if (kv) {
        const messages = await getJson(kv, "messages", []);
        messages.unshift({ id: randomId(), ...sanitized, read: false, createdAt: new Date().toISOString() });
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
      return json(kv ? await getJson(kv, "projects", []) : [], 200, origin);
    }

    if (path === "/api/experience" && request.method === "GET") {
      return json(kv ? await getJson(kv, "experience", []) : [], 200, origin);
    }

    if (path === "/api/about" && request.method === "GET") {
      return json(kv ? await getJson(kv, "about", { bio: "" }) : { bio: "" }, 200, origin);
    }

    if (path === "/api/blog" && request.method === "GET") {
      return json(kv ? await getJson(kv, "blog", []) : [], 200, origin);
    }

    const blogDetailMatch = path.match(/^\/api\/blog\/([^/]+)$/);
    if (blogDetailMatch && request.method === "GET") {
      const posts = kv ? await getJson(kv, "blog", []) : [];
      const post = posts.find((p) => p.id === blogDetailMatch[1]);
      if (!post) return json({ error: "Not found" }, 404, origin);
      return json(post, 200, origin);
    }

    if (path === "/api/cv" && request.method === "GET") {
      return json(kv ? await getJson(kv, "cv", { url: "" }) : { url: "" }, 200, origin);
    }

    const contentPublicMatch = path.match(/^\/api\/content\/([^/]+)$/);
    if (contentPublicMatch && request.method === "GET") {
      const section = contentPublicMatch[1];
      if (!VALID_CONTENT_SECTIONS.includes(section)) return json({ error: "Invalid section" }, 400, origin);
      return json(kv ? await getJson(kv, `content:${section}`, {}) : {}, 200, origin);
    }

    // --- Admin login ---

    if (path === "/api/admin/login" && request.method === "POST") {
      const { password } = body ?? {};
      if (!env.ADMIN_PASSWORD && !(kv && await kv.get("admin_password_hash"))) {
        return json({ error: "Admin password not configured" }, 503, origin);
      }
      if (!password || !await checkAdminPassword(password, kv, env)) {
        return json({ error: "Invalid password" }, 401, origin);
      }
      const t = await createToken(kv, env);
      return json({ token: t }, 200, origin);
    }

    // --- Admin routes (auth required) ---

    if (path.startsWith("/api/admin/")) {
      if (!await verifyToken(token, kv, env)) return json({ error: "Unauthorized" }, 401, origin);
      if (!kv) return json({ error: "KV not configured" }, 503, origin);

      // Projects
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

      // Experience
      if (path === "/api/admin/experience") {
        if (request.method === "GET") return json(await getJson(kv, "experience", []), 200, origin);
        if (request.method === "PUT") {
          if (!Array.isArray(body)) return json({ error: "Expected array" }, 400, origin);
          await kv.put("experience", JSON.stringify(body));
          return json(body, 200, origin);
        }
      }

      // About
      if (path === "/api/admin/about") {
        if (request.method === "GET") return json(await getJson(kv, "about", { bio: "" }), 200, origin);
        if (request.method === "PUT") {
          const updated = { bio: String(body?.bio ?? "").slice(0, 2000) };
          await kv.put("about", JSON.stringify(updated));
          return json(updated, 200, origin);
        }
      }

      // Messages
      if (path === "/api/admin/messages" && request.method === "GET") {
        return json(await getJson(kv, "messages", []), 200, origin);
      }

      const msgReadMatch = path.match(/^\/api\/admin\/messages\/([^/]+)\/read$/);
      if (msgReadMatch && request.method === "PUT") {
        const id = msgReadMatch[1];
        const messages = await getJson(kv, "messages", []);
        const idx = messages.findIndex((m) => m.id === id);
        if (idx === -1) return json({ error: "Not found" }, 404, origin);
        messages[idx] = { ...messages[idx], read: !messages[idx].read };
        await kv.put("messages", JSON.stringify(messages));
        return json(messages[idx], 200, origin);
      }

      const msgMatch = path.match(/^\/api\/admin\/messages\/([^/]+)$/);
      if (msgMatch && request.method === "DELETE") {
        const id = msgMatch[1];
        const messages = await getJson(kv, "messages", []);
        const filtered = messages.filter((m) => m.id !== id);
        if (filtered.length === messages.length) return json({ error: "Not found" }, 404, origin);
        await kv.put("messages", JSON.stringify(filtered));
        return json({ success: true }, 200, origin);
      }

      // Blog
      if (path === "/api/admin/blog") {
        if (request.method === "GET") return json(await getJson(kv, "blog", []), 200, origin);
        if (request.method === "POST") {
          const posts = await getJson(kv, "blog", []);
          const post = {
            id: randomId(),
            title: String(body?.title ?? "").slice(0, 200),
            description: String(body?.description ?? "").slice(0, 500),
            content: String(body?.content ?? "").slice(0, 50000),
            imageUrl: String(body?.imageUrl ?? "").slice(0, 500),
            date: String(body?.date ?? new Date().toISOString().split("T")[0]).slice(0, 20),
            createdAt: new Date().toISOString(),
          };
          posts.unshift(post);
          await kv.put("blog", JSON.stringify(posts));
          return json(post, 201, origin);
        }
      }

      const blogMatch = path.match(/^\/api\/admin\/blog\/([^/]+)$/);
      if (blogMatch) {
        const id = blogMatch[1];
        const posts = await getJson(kv, "blog", []);
        const idx = posts.findIndex((p) => p.id === id);
        if (request.method === "PUT") {
          if (idx === -1) return json({ error: "Not found" }, 404, origin);
          posts[idx] = {
            ...posts[idx],
            title: String(body?.title ?? posts[idx].title).slice(0, 200),
            description: String(body?.description ?? posts[idx].description).slice(0, 500),
            content: String(body?.content ?? posts[idx].content).slice(0, 50000),
            imageUrl: String(body?.imageUrl ?? posts[idx].imageUrl).slice(0, 500),
            date: String(body?.date ?? posts[idx].date).slice(0, 20),
          };
          await kv.put("blog", JSON.stringify(posts));
          return json(posts[idx], 200, origin);
        }
        if (request.method === "DELETE") {
          if (idx === -1) return json({ error: "Not found" }, 404, origin);
          posts.splice(idx, 1);
          await kv.put("blog", JSON.stringify(posts));
          return json({ success: true }, 200, origin);
        }
      }

      // CV
      if (path === "/api/admin/cv") {
        if (request.method === "GET") return json(await getJson(kv, "cv", { url: "" }), 200, origin);
        if (request.method === "PUT") {
          const updated = { url: String(body?.url ?? "").slice(0, 1000) };
          await kv.put("cv", JSON.stringify(updated));
          return json(updated, 200, origin);
        }
      }

      // Content sections
      const contentMatch = path.match(/^\/api\/admin\/content\/([^/]+)$/);
      if (contentMatch) {
        const section = contentMatch[1];
        if (!VALID_CONTENT_SECTIONS.includes(section)) return json({ error: "Invalid section" }, 400, origin);
        if (request.method === "GET") return json(await getJson(kv, `content:${section}`, {}), 200, origin);
        if (request.method === "PUT") {
          if (!body || typeof body !== "object") return json({ error: "Invalid data" }, 400, origin);
          await kv.put(`content:${section}`, JSON.stringify(body));
          return json(body, 200, origin);
        }
      }

      // Password change
      if (path === "/api/admin/password" && request.method === "PUT") {
        const { currentPassword, newPassword } = body ?? {};
        if (!currentPassword || !newPassword) return json({ error: "Current password and new password are required" }, 400, origin);
        if (typeof newPassword !== "string" || newPassword.length < 6) return json({ error: "New password must be at least 6 characters" }, 400, origin);
        if (!await checkAdminPassword(currentPassword, kv, env)) return json({ error: "Current password is incorrect" }, 401, origin);
        const newHash = await sha256Hex(newPassword);
        await kv.put("admin_password_hash", newHash);
        const t = await createToken(kv, env);
        return json({ success: true, token: t }, 200, origin);
      }
    }

    return json({ error: "Not found" }, 404, origin);
  },
};

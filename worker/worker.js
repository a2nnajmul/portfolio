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

const ALLOWED_ORIGINS = [
  "https://najmulalam.site",
  "https://www.najmulalam.site",
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".pages.dev")) return true;
  if (origin.includes("replit.dev") || origin.includes("repl.co")) return true;
  return false;
}

function corsHeaders(origin, methods = "GET, POST, PUT, DELETE, OPTIONS") {
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
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
  backgroundImage: "",
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

function calcReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

const DEFAULT_BLOG = [
  { id: "demo-1", title: "The Art of Minimalist Logo Design", description: "Discover the principles behind creating clean, memorable logos that stand the test of time.", content: "## Why Minimalism Works\n\nIn a world overflowing with visual noise, minimalist logos cut through the clutter. They are instantly recognizable, easily reproducible across media, and timeless.\n\n## Core Principles\n\n- Simplicity: Remove everything that doesn't serve the message\n- Versatility: A great logo works at any size\n- Memorability: Simple shapes are easier to recall\n- Timelessness: Avoid trendy elements\n\n## Tips for Beginners\n\nTest your logo in black and white first. Always design in vector format for scalability.", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80", date: "2026-03-20", tags: ["Logo Design", "Branding"], featured: true, createdAt: "2026-03-20T10:00:00Z" },
  { id: "demo-2", title: "Color Theory for Graphic Designers", description: "Understanding color psychology and how to create harmonious palettes.", content: "## The Power of Color\n\nColor evokes emotions, creates hierarchy, and guides the viewer's eye.\n\n## Color Psychology\n\n- Red: Energy, passion\n- Blue: Trust, calm\n- Green: Growth, nature\n- Orange: Creativity, warmth\n\n## Building a Palette\n\nStart with one primary color. Add a secondary for contrast. Include neutrals for balance.", imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80", date: "2026-03-15", tags: ["Color Theory", "Design Basics"], featured: false, createdAt: "2026-03-15T14:00:00Z" },
  { id: "demo-3", title: "Getting Started with UI/UX Design", description: "A beginner-friendly guide to UI and UX design fundamentals.", content: "## What is UI/UX Design?\n\nUI focuses on visual elements. UX ensures interactions are intuitive.\n\n## The Process\n\n### 1. Research\nUnderstand your users.\n\n### 2. Wireframing\nSketch low-fidelity layouts.\n\n### 3. Prototyping\nBuild interactive mockups.\n\n### 4. Visual Design\nApply color, typography, and imagery.", imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80", date: "2026-03-10", tags: ["UI/UX", "Design"], featured: false, createdAt: "2026-03-10T09:00:00Z" },
  { id: "demo-4", title: "Typography Tips Every Designer Should Know", description: "Essential tips for choosing, pairing, and using fonts effectively.", content: "## Why Typography Matters\n\nTypography communicates mood and affects readability.\n\n## Font Pairing Rules\n\n- Pair serif with sans-serif\n- Limit to 2-3 fonts per project\n- Ensure contrast between heading and body\n\n## Pro Tips\n\nAlways left-align body text. Test at different screen sizes.", imageUrl: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&q=80", date: "2026-03-05", tags: ["Typography", "Fonts"], featured: false, createdAt: "2026-03-05T11:00:00Z" },
  { id: "demo-5", title: "Creating Stunning Social Media Graphics", description: "Design eye-catching social media posts that drive engagement.", content: "## Why Social Media Design Matters\n\nPosts with compelling graphics get more engagement.\n\n## Design Principles\n\n- Bold headlines\n- Limited text\n- Brand consistency\n- High contrast\n\n## Tools\n\nCanva for quick graphics. Photoshop for more control.", imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80", date: "2026-02-28", tags: ["Social Media", "Marketing"], featured: false, createdAt: "2026-02-28T16:00:00Z" },
  { id: "demo-6", title: "From Concept to Client: My Design Workflow", description: "A behind-the-scenes look at my design process from brief to delivery.", content: "## My Design Process\n\n### Discovery\nUnderstand the client's needs.\n\n### Research\nAnalyze competitors and create mood boards.\n\n### Sketching\nStart with pen and paper.\n\n### Digital Execution\nBring concepts to life in Illustrator and Photoshop.\n\n### Delivery\nProvide files in multiple formats with brand guidelines.", imageUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80", date: "2026-02-20", tags: ["Workflow", "Freelance"], featured: true, createdAt: "2026-02-20T08:00:00Z" },
].map(p => ({ ...p, readTime: calcReadTime(p.content) }));

const DEFAULT_ADS = { enabled: false, headScript: "", adSlots: [] };
const DEFAULT_CONTACT = {
  heading: "Get In Touch",
  email: "a2nnajmul@gmail.com",
  phone: "(+880) 1793908183",
  location: "Panchua, Kapasia, 1743\nDhaka, Bangladesh",
  formHeading: "Send Me a Message",
};

async function seedKVIfEmpty(kv) {
  if (!kv) return;
  const keys = ["projects", "experience", "about", "messages", "blog", "content:hero", "content:skills", "content:about-tabs", "content:contact", "settings:ads"];
  const values = await Promise.all(keys.map(k => kv.get(k)));
  const writes = [];
  if (!values[0]) writes.push(kv.put("projects", JSON.stringify(DEFAULT_PROJECTS)));
  if (!values[1]) writes.push(kv.put("experience", JSON.stringify(DEFAULT_EXPERIENCE)));
  if (!values[2]) writes.push(kv.put("about", JSON.stringify(DEFAULT_ABOUT)));
  if (!values[3]) writes.push(kv.put("messages", JSON.stringify([])));
  if (!values[4]) writes.push(kv.put("blog", JSON.stringify(DEFAULT_BLOG)));
  if (!values[5]) writes.push(kv.put("content:hero", JSON.stringify(DEFAULT_HERO)));
  if (!values[6]) writes.push(kv.put("content:skills", JSON.stringify(DEFAULT_SKILLS)));
  if (!values[7]) writes.push(kv.put("content:about-tabs", JSON.stringify(DEFAULT_ABOUT_TABS)));
  if (!values[8]) writes.push(kv.put("content:contact", JSON.stringify(DEFAULT_CONTACT)));
  if (!values[9]) writes.push(kv.put("settings:ads", JSON.stringify(DEFAULT_ADS)));
  await Promise.all(writes);
}

const VALID_CONTENT_SECTIONS = ["hero", "skills", "about-tabs", "contact"];

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

    const blogCommentsMatch = path.match(/^\/api\/blog\/([^/]+)\/comments$/);
    if (blogCommentsMatch && request.method === "GET") {
      const postId = blogCommentsMatch[1];
      return json(kv ? await getJson(kv, `comments:${postId}`, []) : [], 200, origin);
    }
    if (blogCommentsMatch && request.method === "POST") {
      const postId = blogCommentsMatch[1];
      if (!kv) return json({ error: "KV not configured" }, 503, origin);
      const posts = await getJson(kv, "blog", []);
      if (!posts.find((p) => p.id === postId)) return json({ error: "Post not found" }, 404, origin);
      const cName = String(body?.name ?? "").trim();
      const cText = String(body?.text ?? "").trim();
      if (!cName) return json({ error: "Name is required" }, 400, origin);
      if (!cText) return json({ error: "Comment text is required" }, 400, origin);
      const comment = { id: randomId(), name: cName.slice(0, 100), text: cText.slice(0, 2000), createdAt: new Date().toISOString() };
      const comments = await getJson(kv, `comments:${postId}`, []);
      comments.push(comment);
      await kv.put(`comments:${postId}`, JSON.stringify(comments));
      return json(comment, 201, origin);
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

    if (path === "/api/settings/ads" && request.method === "GET") {
      const ads = kv ? await getJson(kv, "settings:ads", { enabled: false, headScript: "", adSlots: [] }) : { enabled: false, headScript: "", adSlots: [] };
      return json({ enabled: ads.enabled, headScript: ads.headScript, adSlots: ads.adSlots || [] }, 200, origin);
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
          const content = String(body?.content ?? "").slice(0, 50000);
          const post = {
            id: randomId(),
            title: String(body?.title ?? "").slice(0, 200),
            description: String(body?.description ?? "").slice(0, 500),
            content,
            imageUrl: String(body?.imageUrl ?? "").slice(0, 500),
            date: String(body?.date ?? new Date().toISOString().split("T")[0]).slice(0, 20),
            createdAt: new Date().toISOString(),
            tags: Array.isArray(body?.tags) ? body.tags.map(t => String(t).slice(0, 50)).slice(0, 10) : [],
            featured: Boolean(body?.featured),
            readTime: calcReadTime(content),
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
          const content = String(body?.content ?? posts[idx].content).slice(0, 50000);
          posts[idx] = {
            ...posts[idx],
            title: String(body?.title ?? posts[idx].title).slice(0, 200),
            description: String(body?.description ?? posts[idx].description).slice(0, 500),
            content,
            imageUrl: String(body?.imageUrl ?? posts[idx].imageUrl).slice(0, 500),
            date: String(body?.date ?? posts[idx].date).slice(0, 20),
            tags: Array.isArray(body?.tags) ? body.tags.map(t => String(t).slice(0, 50)).slice(0, 10) : (posts[idx].tags ?? []),
            featured: body?.featured !== undefined ? Boolean(body.featured) : (posts[idx].featured ?? false),
            readTime: calcReadTime(content),
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

      // Blog comments (admin)
      const adminBlogCommentsMatch = path.match(/^\/api\/admin\/blog\/([^/]+)\/comments$/);
      if (adminBlogCommentsMatch && request.method === "GET") {
        const postId = adminBlogCommentsMatch[1];
        return json(await getJson(kv, `comments:${postId}`, []), 200, origin);
      }

      const adminCommentDeleteMatch = path.match(/^\/api\/admin\/blog\/([^/]+)\/comments\/([^/]+)$/);
      if (adminCommentDeleteMatch && request.method === "DELETE") {
        const postId = adminCommentDeleteMatch[1];
        const commentId = adminCommentDeleteMatch[2];
        const comments = await getJson(kv, `comments:${postId}`, []);
        const filtered = comments.filter((c) => c.id !== commentId);
        if (filtered.length === comments.length) return json({ error: "Comment not found" }, 404, origin);
        await kv.put(`comments:${postId}`, JSON.stringify(filtered));
        return json({ success: true }, 200, origin);
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

      // Ad settings
      if (path === "/api/admin/settings/ads") {
        if (request.method === "GET") return json(await getJson(kv, "settings:ads", { enabled: false, headScript: "", adSlots: [] }), 200, origin);
        if (request.method === "PUT") {
          const adSlots = Array.isArray(body?.adSlots)
            ? body.adSlots.map(s => ({
                id: String(s.id ?? crypto.randomUUID()),
                label: String(s.label ?? "").slice(0, 100),
                position: String(s.position ?? "after-header").slice(0, 50),
                adUnitCode: String(s.adUnitCode ?? "").slice(0, 5000),
              })).slice(0, 10)
            : [];
          const updated = {
            enabled: Boolean(body?.enabled),
            headScript: String(body?.headScript ?? "").slice(0, 5000),
            adSlots,
          };
          await kv.put("settings:ads", JSON.stringify(updated));
          return json(updated, 200, origin);
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

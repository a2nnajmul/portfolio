import { Router, type IRouter, type Request, type Response } from "express";
import { createToken, requireAuth, checkAdminPassword, changeAdminPassword } from "../lib/auth.js";
import { getJson, putJson } from "../lib/kv.js";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  link: string;
  gradient: string;
  featured: boolean;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  year: string;
  description: string;
}

interface About {
  bio: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  date: string;
  createdAt: string;
  tags?: string[];
  featured?: boolean;
  readTime?: string;
}

interface AdSlot {
  id: string;
  label: string;
  position: string;
  adUnitCode: string;
}

interface AdsSettings {
  enabled: boolean;
  headScript: string;
  adSlots: AdSlot[];
}

function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body ?? {};
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword && !getJson<string | null>("admin_password_hash", null)) {
    res.status(503).json({ error: "Admin password not configured" });
    return;
  }
  if (typeof password !== "string" || !checkAdminPassword(password)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ token: createToken() });
});

router.get("/admin/projects", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson<Project[]>("projects", []));
});

router.post("/admin/projects", requireAuth, (req: Request, res: Response) => {
  const projects = getJson<Project[]>("projects", []);
  const body = req.body as Partial<Project>;
  const project: Project = {
    id: randomUUID(),
    title: String(body.title ?? "").slice(0, 120),
    category: String(body.category ?? "").slice(0, 60),
    description: String(body.description ?? "").slice(0, 500),
    imageUrl: String(body.imageUrl ?? "").slice(0, 500),
    link: String(body.link ?? "").slice(0, 500),
    gradient: String(body.gradient ?? "from-orange-400 to-rose-500").slice(0, 100),
    featured: Boolean(body.featured),
  };
  projects.push(project);
  putJson("projects", projects);
  res.status(201).json(project);
});

router.put("/admin/projects/:id", requireAuth, (req: Request, res: Response) => {
  const projects = getJson<Project[]>("projects", []);
  const idx = projects.findIndex((p) => p.id === req.params["id"]);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as Partial<Project>;
  projects[idx] = {
    ...projects[idx],
    title: String(body.title ?? projects[idx].title).slice(0, 120),
    category: String(body.category ?? projects[idx].category).slice(0, 60),
    description: String(body.description ?? projects[idx].description).slice(0, 500),
    imageUrl: String(body.imageUrl ?? projects[idx].imageUrl).slice(0, 500),
    link: String(body.link ?? projects[idx].link).slice(0, 500),
    gradient: String(body.gradient ?? projects[idx].gradient).slice(0, 100),
    featured: body.featured !== undefined ? Boolean(body.featured) : projects[idx].featured,
  };
  putJson("projects", projects);
  res.json(projects[idx]);
});

router.delete("/admin/projects/:id", requireAuth, (req: Request, res: Response) => {
  const projects = getJson<Project[]>("projects", []);
  const filtered = projects.filter((p) => p.id !== req.params["id"]);
  if (filtered.length === projects.length) { res.status(404).json({ error: "Not found" }); return; }
  putJson("projects", filtered);
  res.json({ success: true });
});

router.get("/admin/experience", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson<Experience[]>("experience", []));
});

router.put("/admin/experience", requireAuth, (req: Request, res: Response) => {
  const items = req.body;
  if (!Array.isArray(items)) { res.status(400).json({ error: "Expected array" }); return; }
  const sanitized: Experience[] = items.map((item: Partial<Experience>) => ({
    id: String(item.id ?? randomUUID()),
    company: String(item.company ?? "").slice(0, 100),
    role: String(item.role ?? "").slice(0, 100),
    year: String(item.year ?? "").slice(0, 50),
    description: String(item.description ?? "").slice(0, 1000),
  }));
  putJson("experience", sanitized);
  res.json(sanitized);
});

router.get("/admin/about", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson<About>("about", { bio: "" }));
});

router.put("/admin/about", requireAuth, (req: Request, res: Response) => {
  const { bio } = req.body ?? {};
  const updated: About = { bio: String(bio ?? "").slice(0, 2000) };
  putJson("about", updated);
  res.json(updated);
});

router.get("/admin/messages", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson<Message[]>("messages", []));
});

router.delete("/admin/messages/:id", requireAuth, (req: Request, res: Response) => {
  const messages = getJson<Message[]>("messages", []);
  const filtered = messages.filter((m) => m.id !== req.params["id"]);
  if (filtered.length === messages.length) { res.status(404).json({ error: "Not found" }); return; }
  putJson("messages", filtered);
  res.json({ success: true });
});

router.put("/admin/messages/:id/read", requireAuth, (req: Request, res: Response) => {
  const messages = getJson<Message[]>("messages", []);
  const idx = messages.findIndex((m) => m.id === req.params["id"]);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  messages[idx] = { ...messages[idx], read: !messages[idx].read };
  putJson("messages", messages);
  res.json(messages[idx]);
});

router.get("/admin/blog", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson<BlogPost[]>("blog", []));
});

router.post("/admin/blog", requireAuth, (req: Request, res: Response) => {
  const posts = getJson<BlogPost[]>("blog", []);
  const body = req.body as Partial<BlogPost>;
  const content = String(body.content ?? "").slice(0, 50000);
  const post: BlogPost = {
    id: randomUUID(),
    title: String(body.title ?? "").slice(0, 200),
    description: String(body.description ?? "").slice(0, 500),
    content,
    imageUrl: String(body.imageUrl ?? "").slice(0, 500),
    date: String(body.date ?? new Date().toISOString().split("T")[0]).slice(0, 20),
    createdAt: new Date().toISOString(),
    tags: Array.isArray(body.tags) ? body.tags.map((t: string) => String(t).slice(0, 50)).slice(0, 10) : [],
    featured: Boolean(body.featured),
    readTime: calcReadTime(content),
  };
  posts.unshift(post);
  putJson("blog", posts);
  res.status(201).json(post);
});

router.put("/admin/blog/:id", requireAuth, (req: Request, res: Response) => {
  const posts = getJson<BlogPost[]>("blog", []);
  const idx = posts.findIndex((p) => p.id === req.params["id"]);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as Partial<BlogPost>;
  const content = String(body.content ?? posts[idx].content).slice(0, 50000);
  posts[idx] = {
    ...posts[idx],
    title: String(body.title ?? posts[idx].title).slice(0, 200),
    description: String(body.description ?? posts[idx].description).slice(0, 500),
    content,
    imageUrl: String(body.imageUrl ?? posts[idx].imageUrl).slice(0, 500),
    date: String(body.date ?? posts[idx].date).slice(0, 20),
    tags: Array.isArray(body.tags) ? body.tags.map((t: string) => String(t).slice(0, 50)).slice(0, 10) : (posts[idx].tags ?? []),
    featured: body.featured !== undefined ? Boolean(body.featured) : (posts[idx].featured ?? false),
    readTime: calcReadTime(content),
  };
  putJson("blog", posts);
  res.json(posts[idx]);
});

router.delete("/admin/blog/:id", requireAuth, (req: Request, res: Response) => {
  const posts = getJson<BlogPost[]>("blog", []);
  const filtered = posts.filter((p) => p.id !== req.params["id"]);
  if (filtered.length === posts.length) { res.status(404).json({ error: "Not found" }); return; }
  putJson("blog", filtered);
  res.json({ success: true });
});

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

router.get("/admin/blog/:id/comments", requireAuth, (req: Request, res: Response) => {
  const postId = String(req.params["id"]);
  res.json(getJson<Comment[]>(`comments:${postId}`, []));
});

router.delete("/admin/blog/:postId/comments/:commentId", requireAuth, (req: Request, res: Response) => {
  const postId = String(req.params["postId"]);
  const commentId = String(req.params["commentId"]);
  const comments = getJson<Comment[]>(`comments:${postId}`, []);
  const filtered = comments.filter((c) => c.id !== commentId);
  if (filtered.length === comments.length) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  putJson(`comments:${postId}`, filtered);
  res.json({ success: true });
});

router.get("/admin/cv", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson("cv", { url: "" }));
});

router.put("/admin/cv", requireAuth, (req: Request, res: Response) => {
  const { url } = req.body ?? {};
  const updated = { url: String(url ?? "").slice(0, 1000) };
  putJson("cv", updated);
  res.json(updated);
});

const VALID_CONTENT_SECTIONS = ["hero", "skills", "about-tabs", "contact"];

router.get("/admin/content/:section", requireAuth, (req: Request, res: Response) => {
  const section = String(req.params["section"]);
  if (!VALID_CONTENT_SECTIONS.includes(section)) {
    res.status(400).json({ error: "Invalid section" });
    return;
  }
  res.json(getJson(`content:${section}`, {}));
});

router.put("/admin/content/:section", requireAuth, (req: Request, res: Response) => {
  const section = String(req.params["section"]);
  if (!VALID_CONTENT_SECTIONS.includes(section)) {
    res.status(400).json({ error: "Invalid section" });
    return;
  }
  const data = req.body;
  if (!data || typeof data !== "object") {
    res.status(400).json({ error: "Invalid data" });
    return;
  }
  putJson(`content:${section}`, data);
  res.json(data);
});

router.get("/admin/settings/ads", requireAuth, (_req: Request, res: Response) => {
  res.json(getJson<AdsSettings>("settings:ads", { enabled: false, headScript: "", adSlots: [] }));
});

router.put("/admin/settings/ads", requireAuth, (req: Request, res: Response) => {
  const body = req.body as Partial<AdsSettings>;
  const adSlots: AdSlot[] = Array.isArray(body.adSlots)
    ? body.adSlots.map((s: Partial<AdSlot>) => ({
        id: String(s.id ?? randomUUID()),
        label: String(s.label ?? "").slice(0, 100),
        position: String(s.position ?? "after-header").slice(0, 50),
        adUnitCode: String(s.adUnitCode ?? "").slice(0, 5000),
      })).slice(0, 10)
    : [];
  const updated: AdsSettings = {
    enabled: Boolean(body.enabled),
    headScript: String(body.headScript ?? "").slice(0, 5000),
    adSlots,
  };
  putJson("settings:ads", updated);
  res.json(updated);
});

router.put("/admin/password", requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current password and new password are required" });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }
  if (!checkAdminPassword(currentPassword)) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  changeAdminPassword(newPassword);
  res.json({ success: true, token: createToken() });
});

export default router;

import { Router, type IRouter, type Request, type Response } from "express";
import { createToken, requireAuth } from "../lib/auth.js";
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
}

router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body ?? {};
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword || adminPassword.trim() === "") {
    res.status(503).json({ error: "Admin password not configured" });
    return;
  }
  if (typeof password !== "string" || password !== adminPassword) {
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

export default router;

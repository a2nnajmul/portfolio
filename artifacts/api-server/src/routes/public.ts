import { Router, type IRouter, type Request, type Response } from "express";
import { getJson, putJson } from "../lib/kv.js";
import { randomUUID } from "node:crypto";

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

const router: IRouter = Router();

router.get("/projects", (_req: Request, res: Response) => {
  res.json(getJson("projects", []));
});

router.get("/experience", (_req: Request, res: Response) => {
  res.json(getJson("experience", []));
});

router.get("/about", (_req: Request, res: Response) => {
  res.json(getJson("about", { bio: "" }));
});

router.get("/blog", (_req: Request, res: Response) => {
  res.json(getJson("blog", []));
});

router.get("/blog/:id", (req: Request, res: Response) => {
  const posts = getJson<Array<{ id: string }>>("blog", []);
  const post = posts.find((p) => p.id === req.params["id"]);
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  res.json(post);
});

router.get("/cv", (_req: Request, res: Response) => {
  res.json(getJson("cv", { url: "" }));
});

router.get("/settings/ads", (_req: Request, res: Response) => {
  const ads = getJson<{ enabled: boolean; headScript: string; adSlots: { id: string; label: string; position: string; adUnitCode: string }[] }>("settings:ads", { enabled: false, headScript: "", adSlots: [] });
  res.json({ enabled: ads.enabled, headScript: ads.headScript, adSlots: ads.adSlots });
});

router.get("/content/:section", (req: Request, res: Response) => {
  const section = String(req.params["section"]);
  const validSections = ["hero", "skills", "about-tabs", "contact"];
  if (!validSections.includes(section)) {
    res.status(400).json({ error: "Invalid section" });
    return;
  }
  res.json(getJson(`content:${section}`, {}));
});

router.get("/blog/:id/comments", (req: Request, res: Response) => {
  const postId = String(req.params["id"]);
  res.json(getJson<Comment[]>(`comments:${postId}`, []));
});

router.post("/blog/:id/comments", (req: Request, res: Response) => {
  const postId = String(req.params["id"]);
  const posts = getJson<Array<{ id: string }>>("blog", []);
  if (!posts.find((p) => p.id === postId)) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const { name, text } = req.body ?? {};
  const trimmedName = String(name ?? "").trim();
  const trimmedText = String(text ?? "").trim();
  if (!trimmedName || trimmedName.length < 1) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (!trimmedText || trimmedText.length < 1) {
    res.status(400).json({ error: "Comment text is required" });
    return;
  }
  const comment: Comment = {
    id: randomUUID(),
    name: trimmedName.slice(0, 100),
    text: trimmedText.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  const comments = getJson<Comment[]>(`comments:${postId}`, []);
  comments.push(comment);
  putJson(`comments:${postId}`, comments);
  res.status(201).json(comment);
});

export default router;

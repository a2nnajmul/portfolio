import { Router, type IRouter, type Request, type Response } from "express";
import { getJson } from "../lib/kv.js";

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

router.get("/content/:section", (req: Request, res: Response) => {
  const section = String(req.params["section"]);
  const validSections = ["hero", "skills", "about-tabs"];
  if (!validSections.includes(section)) {
    res.status(400).json({ error: "Invalid section" });
    return;
  }
  res.json(getJson(`content:${section}`, {}));
});

export default router;

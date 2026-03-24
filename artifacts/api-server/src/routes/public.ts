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

export default router;

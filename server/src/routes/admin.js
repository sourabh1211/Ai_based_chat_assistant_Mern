import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { Article } from "../models/Article.js";
import { embedText } from "../services/openai.js";

export const adminRouter = express.Router();
adminRouter.use(adminAuth);

adminRouter.post("/articles", async (req, res) => {
  const { title, slug, body, tags = [] } = req.body || {};
  if (!title || !slug || !body) return res.status(400).json({ error: "title, slug, body required" });

  const { vector, model } = await embedText(`${title}\n\n${body}\n\nTags:${tags.join(",")}`);
  const doc = await Article.create({
    title,
    slug,
    body,
    tags,
    embedding: vector,
    embeddingModel: model
  });

  res.json({ ok: true, article: doc });
});

adminRouter.post("/reindex", async (_req, res) => {
  const articles = await Article.find().lean();
  let updated = 0;

  for (const a of articles) {
    const { vector, model } = await embedText(`${a.title}\n\n${a.body}\n\nTags:${(a.tags || []).join(",")}`);
    await Article.updateOne({ _id: a._id }, { $set: { embedding: vector, embeddingModel: model } });
    updated++;
  }

  res.json({ ok: true, updated });
});

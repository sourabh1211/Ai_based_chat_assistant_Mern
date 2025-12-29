import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Article } from "../models/Article.js";
import { embedText } from "../services/openai.js";

await connectDB(process.env.MONGO_URI);

const articles = await Article.find();
let updated = 0;

for (const a of articles) {
  const { vector, model } = await embedText(`${a.title}\n\n${a.body}\n\nTags:${(a.tags || []).join(",")}`);
  a.embedding = vector;
  a.embeddingModel = model;
  await a.save();
  updated++;
}

console.log("Reindexed:", updated);
process.exit(0);

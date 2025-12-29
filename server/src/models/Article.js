import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    body: { type: String, required: true },
    tags: [{ type: String }],
    embedding: { type: [Number], default: null },
    embeddingModel: { type: String, default: null }
  },
  { timestamps: true }
);

articleSchema.index({ title: "text", body: "text", tags: "text" });

export const Article = mongoose.model("Article", articleSchema);

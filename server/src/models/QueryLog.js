import mongoose from "mongoose";

const queryLogSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", required: true },
    query: { type: String, required: true },
    responseTimeMs: { type: Number, required: true },
    matchedArticleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    model: { type: String, required: true }
  },
  { timestamps: true }
);

queryLogSchema.index({ createdAt: 1 });

export const QueryLog = mongoose.model("QueryLog", queryLogSchema);

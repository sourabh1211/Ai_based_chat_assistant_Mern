import express from "express";
import { ChatSession } from "../models/ChatSession.js";
import { QueryLog } from "../models/QueryLog.js";
import { retrieveArticles, buildKbContext } from "../services/retrieval.js";
import { generateAnswer } from "../services/openai.js";

export const chatRouter = express.Router();

chatRouter.post("/", async (req, res) => {
  const started = Date.now();
  try {
    const { sessionId, message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    let session = null;
    if (sessionId) session = await ChatSession.findById(sessionId);
    if (!session) session = await ChatSession.create({ messages: [] });

    session.messages.push({ role: "user", content: message });

    const articles = await retrieveArticles(message, { limit: 4 });
    const context = buildKbContext(articles);

    const instructions =
  `You are a helpful assistant for a website.\n` +
  `You have access to a Knowledge Base Context.\n` +
  `Rules:\n` +
  `1) If the user's question is about the website/support and the answer is in the context, use the context.\n` +
  `2) If the question is general knowledge (like capitals, math, greetings), answer normally.\n` +
  `3) If the question seems like website/support but the context does not contain the answer, say you don't know and ask to contact support.\n` +
  `4) Keep answers short and clear.\n` +
  `5) If you used context, add a "References" section listing article titles + slugs.\n`;

    const history = session.messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    const input = [
  ...history,
  { role: "user", content: `Knowledge Base Context:\n${context || "(empty)"}\n\nUser Question:\n${message}` }
];


    const { text: answerText, model } = await generateAnswer({ instructions, input });

    session.messages.push({ role: "assistant", content: answerText });
    await session.save();

    const responseTimeMs = Date.now() - started;
    await QueryLog.create({
      sessionId: session._id,
      query: message,
      responseTimeMs,
      matchedArticleIds: articles.map((a) => a._id),
      model
    });

    res.json({
      sessionId: session._id,
      reply: answerText,
      sources: articles.map((a) => ({
        title: a.title,
        slug: a.slug,
        score: a.finalScore
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
});

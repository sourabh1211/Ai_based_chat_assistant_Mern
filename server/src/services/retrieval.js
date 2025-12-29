import { Article } from "../models/Article.js";
import { embedText } from "./openai.js";

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

export async function retrieveArticles(query, { limit = 6 } = {}) {
  const textCandidates = await Article.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" }, title: 1, slug: 1, body: 1, tags: 1, embedding: 1 }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(Math.max(limit, 10))
    .lean();

  const { vector: qVec } = await embedText(query);

  const scored = textCandidates.map((a) => {
    const sim = Array.isArray(a.embedding) ? cosineSimilarity(qVec, a.embedding) : 0;
    const textScore = typeof a.score === "number" ? a.score : 0;
    const finalScore = (0.65 * sim) + (0.35 * (textScore / 10));
    return { ...a, finalScore };
  });

  scored.sort((x, y) => y.finalScore - x.finalScore);
  return scored.slice(0, limit);
}

export function buildKbContext(articles) {
  return articles
    .map((a, i) => {
      const snippet = (a.body || "").slice(0, 700);
      return `# Article ${i + 1}\nTitle: ${a.title}\nSlug: ${a.slug}\nTags: ${(a.tags || []).join(", ")}\nExcerpt:\n${snippet}\n`;
    })
    .join("\n");
}

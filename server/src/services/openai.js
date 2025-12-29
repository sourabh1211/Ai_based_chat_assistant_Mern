const BASE = "https://generativelanguage.googleapis.com/v1beta";

function mustGetKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing in server/.env");
  return key;
}

async function post(path, body) {
  const key = mustGetKey();

  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data?.error?.message || data?.error || "Gemini API error");
  }
  return data;
}

export async function embedText(text) {
  const model = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001";

  const data = await post(`/models/${model}:embedContent`, {
    content: { parts: [{ text }] }
  });

  // Response schema includes embedding.values[]
  const vector = data?.embedding?.values;
  if (!Array.isArray(vector)) throw new Error("Embedding missing in Gemini response");
  return { vector, model };
}

export async function generateAnswer({ instructions, input }) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Convert OpenAI-style messages -> Gemini contents (role: user/model)
  const contents = (input || []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const data = await post(`/models/${model}:generateContent`, {
    system_instruction: { parts: [{ text: instructions }] },
    contents,
    generationConfig: { temperature: 0.2 }
  });

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

  return { text, model };
}

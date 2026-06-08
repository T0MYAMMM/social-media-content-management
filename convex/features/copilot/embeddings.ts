import { v } from "convex/values";
import { action } from "../../_generated/server";

type EmbedResult =
  | { ok: true; embeddings: number[][] }
  | { ok: false; notice: string };

// The ragChunks vector index is fixed at 1024 dims (convex/schema.ts). Both
// providers below MUST emit exactly 1024-dim vectors:
//   - OpenAI text-embedding-3-small (native 1536) supports the `dimensions`
//     param (Matryoshka) → request 1024.
//   - Voyage voyage-3 is natively 1024.
const DIMENSIONS = 1024;
const OPENAI_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_MODEL = "text-embedding-3-small";
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";
const BATCH_SIZE = 100;

/**
 * Embed texts to 1024-dim vectors. Prefers OpenAI (OPENAI_API_KEY), falls back
 * to Voyage (VOYAGE_API_KEY). Key-guarded; degrades gracefully when neither set.
 */
export const embed = action({
  args: {
    texts: v.array(v.string()),
    inputType: v.optional(
      v.union(v.literal("document"), v.literal("query")),
    ),
  },
  handler: async (_ctx, { texts, inputType }): Promise<EmbedResult> => {
    const openaiKey = process.env.OPENAI_API_KEY;
    const voyageKey = process.env.VOYAGE_API_KEY;
    if (!openaiKey && !voyageKey) {
      return {
        ok: false,
        notice:
          "Embeddings not configured — set OPENAI_API_KEY (or VOYAGE_API_KEY) on the Convex deployment to enable retrieval.",
      };
    }
    if (texts.length === 0) return { ok: true, embeddings: [] };

    const provider = openaiKey ? "openai" : "voyage";
    const url = openaiKey ? OPENAI_URL : VOYAGE_URL;
    const key = (openaiKey ?? voyageKey) as string;

    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const body = openaiKey
        ? { input: batch, model: OPENAI_MODEL, dimensions: DIMENSIONS }
        : { input: batch, model: VOYAGE_MODEL, input_type: inputType ?? "document" };
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (err) {
        return { ok: false, notice: `Embeddings request failed: ${String(err)}` };
      }
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        return {
          ok: false,
          notice: `${provider} embeddings error ${res.status}: ${errBody.slice(0, 200)}`,
        };
      }
      const json = (await res.json()) as { data?: { embedding: number[] }[] };
      for (const row of json.data ?? []) embeddings.push(row.embedding);
    }

    return { ok: true, embeddings };
  },
});

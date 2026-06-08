import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

export type RetrievedChunk = {
  id: string;
  sourceType: string;
  text: string;
  score: number;
};

type RetrieveResult =
  | { ok: true; chunks: RetrievedChunk[] }
  | { ok: false; chunks: RetrievedChunk[]; notice: string };

/** Embed the query, vector-search ragChunks, hydrate docs into grounding chunks. */
export const retrieve = action({
  args: { query: v.string(), k: v.optional(v.number()) },
  handler: async (ctx, { query, k }): Promise<RetrieveResult> => {
    const embedded = await ctx.runAction(api.features.copilot.embeddings.embed, {
      texts: [query],
      inputType: "query",
    });
    if (!embedded.ok) {
      return { ok: false, chunks: [], notice: embedded.notice };
    }
    const vector = embedded.embeddings[0];
    if (!vector) return { ok: true, chunks: [] };

    const results = await ctx.vectorSearch("ragChunks", "by_embedding", {
      vector,
      limit: k ?? 6,
    });
    if (results.length === 0) return { ok: true, chunks: [] };

    const scoreById = new Map(results.map((r) => [r._id, r._score]));
    const docs = await ctx.runQuery(api.ragChunks.getByIds, {
      ids: results.map((r) => r._id),
    });

    const chunks: RetrievedChunk[] = docs.map((d) => ({
      id: d._id,
      sourceType: d.sourceType,
      text: d.text,
      score: scoreById.get(d._id) ?? 0,
    }));
    chunks.sort((a, b) => b.score - a.score);

    return { ok: true, chunks };
  },
});

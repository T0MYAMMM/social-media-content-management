import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

type ReindexResult =
  | { ok: true; count: number }
  | { ok: false; notice: string };

/** Rebuild the RAG corpus: gather sources, embed them, upsert each chunk. */
export const reindex = action({
  args: {},
  handler: async (ctx): Promise<ReindexResult> => {
    const sources = await ctx.runQuery(api.ragChunks.gatherSources, {});
    if (sources.length === 0) {
      return { ok: true, count: 0 };
    }

    const embedded = await ctx.runAction(api.features.copilot.embeddings.embed, {
      texts: sources.map((s) => s.text),
      inputType: "document",
    });
    if (!embedded.ok) return { ok: false, notice: embedded.notice };

    let count = 0;
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const embedding = embedded.embeddings[i];
      if (!embedding) continue;
      await ctx.runMutation(api.ragChunks.upsertChunk, {
        sourceType: src.sourceType as
          | "idea"
          | "caption"
          | "post"
          | "profile"
          | "note",
        sourceId: src.sourceId,
        text: src.text,
        embedding,
      });
      count++;
    }

    return { ok: true, count };
  },
});

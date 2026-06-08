import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SOURCE_TYPE = v.union(
  v.literal("idea"),
  v.literal("caption"),
  v.literal("post"),
  v.literal("profile"),
  v.literal("note"),
);

/** Idempotently (re)write the chunks for one source: drop old by_source, insert fresh. */
export const upsertChunk = mutation({
  args: {
    sourceType: SOURCE_TYPE,
    sourceId: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { sourceType, sourceId, text, embedding, metadata }) => {
    const existing = await ctx.db
      .query("ragChunks")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", sourceType).eq("sourceId", sourceId),
      )
      .collect();
    for (const doc of existing) await ctx.db.delete(doc._id);
    return await ctx.db.insert("ragChunks", {
      sourceType,
      sourceId,
      text,
      embedding,
      metadata,
      ts: Date.now(),
    });
  },
});

/** Load chunk docs for a list of ids (used to hydrate citations after vector search). */
export const getByIds = query({
  args: { ids: v.array(v.id("ragChunks")) },
  handler: async (ctx, { ids }) => {
    const docs = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return docs.filter((d): d is NonNullable<typeof d> => d !== null);
  },
});

/** Wipe the whole chunk corpus (before a full reindex). */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ragChunks").collect();
    for (const doc of all) await ctx.db.delete(doc._id);
    return all.length;
  },
});

type Source = { sourceType: string; sourceId: string; text: string };

/** Collect the workspace corpus to embed: ideas, captions, posts, brand profile. */
export const gatherSources = query({
  args: {},
  handler: async (ctx): Promise<Source[]> => {
    const sources: Source[] = [];

    const ideas = await ctx.db.query("contentIdeas").collect();
    for (const idea of ideas) {
      const text = [idea.title, idea.hook, idea.notes]
        .filter(Boolean)
        .join("\n")
        .trim();
      if (text) {
        sources.push({ sourceType: "idea", sourceId: idea._id, text });
      }
    }

    const items = await ctx.db.query("contentItems").collect();
    for (const item of items) {
      const text = [item.title, item.caption].filter(Boolean).join("\n").trim();
      if (text) {
        sources.push({ sourceType: "caption", sourceId: item._id, text });
      }
    }

    const posts = await ctx.db.query("postMetrics").collect();
    for (const post of posts) {
      const text = (post.caption ?? "").trim();
      if (text) {
        sources.push({ sourceType: "post", sourceId: post._id, text });
      }
    }

    const profile = await ctx.db.query("brandProfile").first();
    if (profile) {
      const parts: string[] = [];
      if (profile.brandName) parts.push(`Brand: ${profile.brandName}`);
      if (profile.voice) parts.push(`Voice: ${profile.voice}`);
      if (profile.tone) parts.push(`Tone: ${profile.tone}`);
      if (profile.audience) parts.push(`Audience: ${profile.audience}`);
      if (profile.goals) parts.push(`Goals: ${profile.goals}`);
      if (profile.pillars?.length)
        parts.push(`Pillars: ${profile.pillars.join(", ")}`);
      if (profile.dos?.length) parts.push(`Do: ${profile.dos.join("; ")}`);
      if (profile.donts?.length)
        parts.push(`Don't: ${profile.donts.join("; ")}`);
      const text = parts.join("\n").trim();
      if (text) {
        sources.push({ sourceType: "profile", sourceId: "brand", text });
      }
    }

    return sources;
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { PLATFORM, FORMAT, STAGE } from "./schema";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contentItems")
      .withIndex("by_createdAt")
      .order("desc")
      .take(300);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("contentItems")),
    title: v.string(),
    platform: PLATFORM,
    format: FORMAT,
    caption: v.string(),
    bodyBlocks: v.optional(v.any()),
    mediaAssetIds: v.array(v.string()),
    ideaId: v.optional(v.string()),
    stage: STAGE,
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("contentItems", { ...data, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("contentItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const setStage = mutation({
  args: { id: v.id("contentItems"), stage: STAGE },
  handler: async (ctx, { id, stage }) => {
    const item = await ctx.db.get(id);
    const patch: { stage: typeof stage; publishedAt?: number } = { stage };
    if (stage === "published" && item && !item.publishedAt) {
      patch.publishedAt = Date.now();
    }
    await ctx.db.patch(id, patch);
  },
});

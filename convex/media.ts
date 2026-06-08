import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SOURCE = v.union(
  v.literal("upload"),
  v.literal("google-photos"),
  v.literal("gdrive"),
  v.literal("url"),
  v.literal("unsplash"),
);

const FIELDS = {
  source: SOURCE,
  url: v.string(),
  storageId: v.optional(v.id("_storage")),
  thumbUrl: v.string(),
  width: v.number(),
  height: v.number(),
  alt: v.string(),
  tags: v.array(v.string()),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("mediaAssets")
      .withIndex("by_createdAt")
      .order("desc")
      .take(300);
  },
});

export const create = mutation({
  args: FIELDS,
  handler: async (ctx, data) => {
    return await ctx.db.insert("mediaAssets", { ...data, createdAt: Date.now() });
  },
});

export const upsert = mutation({
  args: { id: v.optional(v.id("mediaAssets")), ...FIELDS },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("mediaAssets", { ...data, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mediaAssets") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { PLATFORM } from "./schema";

const STATUS = v.union(
  v.literal("spark"),
  v.literal("exploring"),
  v.literal("approved"),
  v.literal("archived"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contentIdeas")
      .withIndex("by_createdAt")
      .order("desc")
      .take(300);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("contentIdeas")),
    title: v.string(),
    hook: v.string(),
    notes: v.string(),
    status: STATUS,
    source: v.union(v.literal("ai"), v.literal("manual")),
    platform: v.optional(PLATFORM),
    tags: v.array(v.string()),
    score: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("contentIdeas", { ...data, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("contentIdeas") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const setStatus = mutation({
  args: { id: v.id("contentIdeas"), status: STATUS },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

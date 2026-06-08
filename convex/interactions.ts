import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { PLATFORM } from "./schema";

const TYPE = v.union(
  v.literal("comment"),
  v.literal("mention"),
  v.literal("reply"),
  v.literal("dm"),
);
const SENTIMENT = v.union(v.literal("pos"), v.literal("neu"), v.literal("neg"));
const STATUS = v.union(
  v.literal("unread"),
  v.literal("replied"),
  v.literal("archived"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("interactions").order("desc").take(300);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("interactions")),
    accountId: v.optional(v.id("socialAccounts")),
    platform: PLATFORM,
    type: TYPE,
    author: v.string(),
    authorAvatar: v.optional(v.string()),
    text: v.string(),
    sentiment: v.optional(SENTIMENT),
    status: STATUS,
    externalId: v.optional(v.string()),
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("interactions", data);
  },
});

export const setStatus = mutation({
  args: { id: v.id("interactions"), status: STATUS },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("interactions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

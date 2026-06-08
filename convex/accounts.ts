import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { PLATFORM } from "./schema";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("socialAccounts").order("desc").take(100);
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("socialAccounts")),
    platform: PLATFORM,
    handle: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    followers: v.number(),
    following: v.number(),
    connected: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("socialAccounts", data);
  },
});

export const remove = mutation({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const setConnected = mutation({
  args: { id: v.id("socialAccounts"), connected: v.boolean() },
  handler: async (ctx, { id, connected }) => {
    await ctx.db.patch(id, { connected });
  },
});

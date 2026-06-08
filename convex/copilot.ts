import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("copilotSessions")
      .withIndex("by_startedAt")
      .order("desc")
      .take(100);
  },
});

export const messages = query({
  args: { sessionId: v.id("copilotSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("copilotMessages")
      .withIndex("by_session_ts", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .take(500);
  },
});

export const startSession = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    return await ctx.db.insert("copilotSessions", {
      title,
      startedAt: Date.now(),
    });
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("copilotSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    sources: v.optional(v.array(v.string())),
  },
  handler: async (ctx, data) => {
    return await ctx.db.insert("copilotMessages", { ...data, ts: Date.now() });
  },
});

export const removeSession = mutation({
  args: { id: v.id("copilotSessions") },
  handler: async (ctx, { id }) => {
    const msgs = await ctx.db
      .query("copilotMessages")
      .withIndex("by_session_ts", (q) => q.eq("sessionId", id))
      .collect();
    for (const m of msgs) await ctx.db.delete(m._id);
    await ctx.db.delete(id);
  },
});

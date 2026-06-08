import { query } from "./_generated/server";

export const snapshots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("analyticsSnapshots")
      .order("asc")
      .take(2000);
  },
});

export const metrics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("postMetrics")
      .withIndex("by_ts")
      .order("desc")
      .take(500);
  },
});

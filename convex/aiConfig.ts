import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aiConfig").first();
  },
});

const FIELDS = {
  model: v.optional(v.string()),
  systemOverlay: v.optional(v.string()),
  temperature: v.optional(v.number()),
  retrievalEnabled: v.optional(v.boolean()),
};

export const upsert = mutation({
  args: FIELDS,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");

    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(args)) {
      if (val !== undefined) patch[k] = val;
    }

    const existing = await ctx.db.query("aiConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("aiConfig", patch);
  },
});

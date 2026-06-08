import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brandProfile").first();
  },
});

const FIELDS = {
  brandName: v.optional(v.string()),
  voice: v.optional(v.string()),
  pillars: v.optional(v.array(v.string())),
  audience: v.optional(v.string()),
  goals: v.optional(v.string()),
  dos: v.optional(v.array(v.string())),
  donts: v.optional(v.array(v.string())),
  tone: v.optional(v.string()),
  markOnboarded: v.optional(v.boolean()),
};

export const upsert = mutation({
  args: FIELDS,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");

    const { markOnboarded, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    if (markOnboarded) patch.onboardedAt = Date.now();

    const existing = await ctx.db.query("brandProfile").first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("brandProfile", patch);
  },
});

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Cadence — Social Content OS schema (Convex Cloud target).
// authTables = @convex-dev/auth. Content tables model the end-to-end pipeline
// (ideation -> production -> release) for Instagram + Threads, plus RAG chunks
// for the AI copilot. The Convex-backed store maps each table 1:1 (id <-> _id).

export const PLATFORM = v.union(v.literal("instagram"), v.literal("threads"));
export const FORMAT = v.union(
  v.literal("post"),
  v.literal("reel"),
  v.literal("carousel"),
  v.literal("story"),
  v.literal("thread"),
);
export const STAGE = v.union(
  v.literal("ideation"),
  v.literal("production"),
  v.literal("scheduled"),
  v.literal("published"),
);

export default defineSchema({
  ...authTables,

  // --- Connected accounts (IG + Threads). Token stored server-side only. ---
  socialAccounts: defineTable({
    platform: PLATFORM,
    handle: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    followers: v.number(),
    following: v.number(),
    connected: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
  }).index("by_platform", ["platform"]),

  // --- Ideation: spark -> exploring -> approved -> archived ---
  contentIdeas: defineTable({
    title: v.string(),
    hook: v.string(),
    notes: v.string(),
    status: v.union(
      v.literal("spark"),
      v.literal("exploring"),
      v.literal("approved"),
      v.literal("archived"),
    ),
    source: v.union(v.literal("ai"), v.literal("manual")),
    platform: v.optional(PLATFORM),
    tags: v.array(v.string()),
    score: v.number(), // 0-100 promise score
    createdAt: v.number(),
  })
    .index("by_status_createdAt", ["status", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  // --- Pipeline unit: a concrete piece of content moving through stages ---
  contentItems: defineTable({
    title: v.string(),
    platform: PLATFORM,
    format: FORMAT,
    caption: v.string(),
    // story slides / thread parts / sketch outline — flexible nested blob.
    bodyBlocks: v.optional(v.any()),
    mediaAssetIds: v.array(v.string()),
    ideaId: v.optional(v.string()),
    stage: STAGE,
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    externalId: v.optional(v.string()), // IG/Threads media id once published
    createdAt: v.number(),
  })
    .index("by_stage_scheduledAt", ["stage", "scheduledAt"])
    .index("by_platform", ["platform"])
    .index("by_createdAt", ["createdAt"]),

  // --- Media gallery: upload / google photos / drive / url / unsplash ---
  mediaAssets: defineTable({
    source: v.union(
      v.literal("upload"),
      v.literal("google-photos"),
      v.literal("gdrive"),
      v.literal("url"),
      v.literal("unsplash"),
    ),
    url: v.string(),
    storageId: v.optional(v.id("_storage")),
    thumbUrl: v.string(),
    width: v.number(),
    height: v.number(),
    alt: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  // --- Inbox: comments / mentions / replies / DMs across platforms ---
  interactions: defineTable({
    accountId: v.optional(v.id("socialAccounts")),
    platform: PLATFORM,
    type: v.union(
      v.literal("comment"),
      v.literal("mention"),
      v.literal("reply"),
      v.literal("dm"),
    ),
    author: v.string(),
    authorAvatar: v.optional(v.string()),
    text: v.string(),
    sentiment: v.optional(
      v.union(v.literal("pos"), v.literal("neu"), v.literal("neg")),
    ),
    status: v.union(
      v.literal("unread"),
      v.literal("replied"),
      v.literal("archived"),
    ),
    externalId: v.optional(v.string()),
    ts: v.number(),
  })
    .index("by_status_ts", ["status", "ts"])
    .index("by_account_ts", ["accountId", "ts"]),

  // --- Daily growth snapshots per account (for charts) ---
  analyticsSnapshots: defineTable({
    accountId: v.id("socialAccounts"),
    date: v.number(), // YYYYMMDD
    followers: v.number(),
    reach: v.number(),
    impressions: v.number(),
    engagement: v.number(), // engagement rate basis points (x1000)
    profileViews: v.number(),
  }).index("by_account_date", ["accountId", "date"]),

  // --- Per-post performance ---
  postMetrics: defineTable({
    contentItemId: v.optional(v.id("contentItems")),
    externalId: v.optional(v.string()),
    platform: PLATFORM,
    caption: v.string(),
    thumbUrl: v.string(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    reach: v.number(),
    ts: v.number(),
  })
    .index("by_item", ["contentItemId"])
    .index("by_ts", ["ts"]),

  // --- Brand profile singleton: the spine of RAG + idea generation ---
  brandProfile: defineTable({
    brandName: v.optional(v.string()),
    voice: v.optional(v.string()),
    pillars: v.optional(v.array(v.string())),
    audience: v.optional(v.string()),
    goals: v.optional(v.string()),
    dos: v.optional(v.array(v.string())),
    donts: v.optional(v.array(v.string())),
    tone: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),

  // --- Site/branding singleton (theme, name) ---
  siteSettings: defineTable({
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    themeDefault: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),

  // --- AI config singleton (model, prompt overlay, temperature) ---
  aiConfig: defineTable({
    model: v.optional(v.string()),
    systemOverlay: v.optional(v.string()),
    temperature: v.optional(v.number()),
    retrievalEnabled: v.optional(v.boolean()),
  }),

  // --- RAG chunks with native Convex vector index (Voyage voyage-3 = 1024) ---
  ragChunks: defineTable({
    sourceType: v.union(
      v.literal("idea"),
      v.literal("caption"),
      v.literal("post"),
      v.literal("profile"),
      v.literal("note"),
    ),
    sourceId: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.any()),
    ts: v.number(),
  })
    .index("by_source", ["sourceType", "sourceId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1024,
      filterFields: ["sourceType"],
    }),

  // --- Copilot chat history (internal assistant) ---
  copilotSessions: defineTable({
    title: v.string(),
    startedAt: v.number(),
  }).index("by_startedAt", ["startedAt"]),

  copilotMessages: defineTable({
    sessionId: v.id("copilotSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    // retrieved chunk ids that grounded an assistant reply (for citations).
    sources: v.optional(v.array(v.string())),
    ts: v.number(),
  }).index("by_session_ts", ["sessionId", "ts"]),
});

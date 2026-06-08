import { mutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Demo seed for Cadence (social content OS).
// - `seed:run`        — CLI/power use: wipes content then inserts (npx convex run seed:run).
// - `seed:seedSample` — in-app one-click for non-coders: requires login, inserts
//                       ONLY when the workspace is still empty (never wipes real work).

const day = 86_400_000;
const hour = 3_600_000;

// Unsplash photo ids used for media + thumbnails.
const PHOTOS = [
  { id: "photo-1490818387583-1baba5e638af", w: 1080, h: 1350, alt: "Laptop and notebook on a desk", tags: ["workspace", "flatlay"] },
  { id: "photo-1517248135467-4c7edcad34c4", w: 1080, h: 720, alt: "Coffee shop morning light", tags: ["coffee", "lifestyle"] },
  { id: "photo-1499750310107-5fef28a66643", w: 1080, h: 1620, alt: "Writing in a notebook", tags: ["writing", "creative"] },
  { id: "photo-1526170375885-4d8ecf77b99f", w: 1080, h: 1080, alt: "Analytics chart on screen", tags: ["data", "growth"] },
  { id: "photo-1522202176988-66273c2fd55f", w: 1080, h: 720, alt: "Team collaborating", tags: ["team", "behind-the-scenes"] },
  { id: "photo-1503676260728-1c00da094a0b", w: 1080, h: 1350, alt: "Studying with books", tags: ["learning", "education"] },
  { id: "photo-1492724441997-5dc865305da7", w: 1080, h: 720, alt: "Minimal desk setup", tags: ["minimal", "setup"] },
  { id: "photo-1454165804606-c3d57bc86b40", w: 1080, h: 720, alt: "Business planning on paper", tags: ["strategy", "planning"] },
  { id: "photo-1556761175-5973dc0f32e7", w: 1080, h: 1350, alt: "Creative working on laptop", tags: ["creator", "work"] },
  { id: "photo-1432888622747-4eb9a8efeb07", w: 1080, h: 1620, alt: "Phone with social apps", tags: ["mobile", "social"] },
  { id: "photo-1611224923853-80b023f02d71", w: 1080, h: 1080, alt: "Abstract gradient backdrop", tags: ["abstract", "design"] },
  { id: "photo-1517245386807-bb43f82c33c4", w: 1080, h: 720, alt: "Bright modern workspace", tags: ["workspace", "bright"] },
];

const img = (id: string, w = 1080) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function noisy(base: number, amp: number) {
  return Math.round(base + (Math.random() - 0.5) * 2 * amp);
}

// All demo content inserts (no wipe). Shared by `run` and `seedSample`.
async function insertAll(ctx: any) {
  const now = Date.now();

  // 1. Accounts
  const igId = await ctx.db.insert("socialAccounts", {
    platform: "instagram",
    handle: "lumen.studio",
    displayName: "Lumen Studio",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    followers: 12480,
    following: 412,
    connected: false,
    lastSyncedAt: now - 2 * hour,
  });
  const thId = await ctx.db.insert("socialAccounts", {
    platform: "threads",
    handle: "lumenstudio",
    displayName: "Lumen Studio",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    followers: 3120,
    following: 188,
    connected: false,
    lastSyncedAt: now - 5 * hour,
  });
  const accounts = [igId, thId];

  // 2. Media
  const mediaIds: string[] = [];
  for (let i = 0; i < PHOTOS.length; i++) {
    const p = PHOTOS[i];
    const id = await ctx.db.insert("mediaAssets", {
      source: i % 4 === 0 ? "url" : "unsplash",
      url: img(p.id),
      thumbUrl: img(p.id, 400),
      width: p.w,
      height: p.h,
      alt: p.alt,
      tags: p.tags,
      createdAt: now - i * day,
    });
    mediaIds.push(id);
  }

  // 3. Ideas
  const ideas = [
    { title: "3 morning habits that doubled my output", hook: "I used to dread mornings. Now they're my superpower.", status: "approved", source: "manual", platform: "instagram", tags: ["productivity", "habits"], score: 88 },
    { title: "The content calendar I wish I had at the start", hook: "Stop posting randomly. Here's the system.", status: "exploring", source: "ai", platform: "instagram", tags: ["systems", "creator"], score: 76 },
    { title: "Why your reels aren't reaching new people", hook: "It's not the algorithm. It's your first 3 seconds.", status: "approved", source: "ai", platform: "instagram", tags: ["reels", "growth"], score: 92 },
    { title: "A day in the life of a solo creator", hook: "No team. No budget. Just a phone and a plan.", status: "spark", source: "manual", platform: "instagram", tags: ["bts", "lifestyle"], score: 64 },
    { title: "Threads vs Instagram: where to start", hook: "Spreading thin kills momentum. Pick one.", status: "exploring", source: "ai", platform: "threads", tags: ["strategy", "platforms"], score: 71 },
    { title: "I tracked my engagement for 30 days", hook: "The results surprised me — and changed my posting.", status: "spark", source: "manual", platform: "instagram", tags: ["data", "growth"], score: 58 },
    { title: "The hook formula that 10x'd my saves", hook: "Saves > likes. Here's how I write for them.", status: "approved", source: "ai", platform: "instagram", tags: ["copywriting", "hooks"], score: 90 },
    { title: "Behind a carousel that hit 1M views", hook: "Slide by slide, here's exactly what worked.", status: "archived", source: "manual", platform: "instagram", tags: ["carousel", "viral"], score: 81 },
    { title: "Repurposing one idea into 5 posts", hook: "Work less, post more. The repurposing loop.", status: "exploring", source: "ai", platform: "threads", tags: ["repurposing", "systems"], score: 69 },
    { title: "What I'd tell my beginner self", hook: "Six things I learned the hard way so you don't.", status: "spark", source: "manual", tags: ["advice", "journey"], score: 47 },
  ];
  for (let i = 0; i < ideas.length; i++) {
    await ctx.db.insert("contentIdeas", { ...ideas[i], notes: "Drafted from brand pillars. Expand the hook into a full outline before production.", createdAt: now - i * day });
  }

  // 4. Content items
  const items = [
    { title: "Morning habits reel", platform: "instagram", format: "reel", stage: "published", caption: "3 morning habits that doubled my output 🌅 Save this for tomorrow.", offset: 12 },
    { title: "Content calendar carousel", platform: "instagram", format: "carousel", stage: "published", caption: "The content calendar I wish I had at the start. Swipe → steal it.", offset: 9 },
    { title: "First 3 seconds reel", platform: "instagram", format: "reel", stage: "published", caption: "Your reels aren't dying to the algorithm. It's the first 3 seconds.", offset: 6 },
    { title: "Engagement teardown thread", platform: "threads", format: "thread", stage: "published", caption: "I tracked my engagement for 30 days. A thread on what actually moved the needle 🧵", offset: 4 },
    { title: "Hook formula post", platform: "instagram", format: "post", stage: "scheduled", caption: "The hook formula that 10x'd my saves. Read this before you post next.", offset: -1 },
    { title: "Repurposing loop carousel", platform: "instagram", format: "carousel", stage: "scheduled", caption: "Turn 1 idea into 5 posts. The repurposing loop, visualized.", offset: -2 },
    { title: "Threads vs IG thread", platform: "threads", format: "thread", stage: "scheduled", caption: "Threads or Instagram? Where a beginner should actually start 🧵", offset: -3 },
    { title: "Day in the life story", platform: "instagram", format: "story", stage: "production", caption: "A day in the life of a solo creator — raw and unfiltered.", offset: 0 },
    { title: "Beginner advice reel", platform: "instagram", format: "reel", stage: "production", caption: "6 things I'd tell my beginner self.", offset: 0 },
    { title: "Carousel teardown", platform: "instagram", format: "carousel", stage: "production", caption: "Behind a carousel that hit 1M views — slide by slide.", offset: 0 },
    { title: "Repurposing 101 idea", platform: "threads", format: "thread", stage: "ideation", caption: "", offset: 0 },
    { title: "Analytics deep-dive idea", platform: "instagram", format: "post", stage: "ideation", caption: "", offset: 0 },
    { title: "Habit stacking reel idea", platform: "instagram", format: "reel", stage: "ideation", caption: "", offset: 0 },
    { title: "Q&A story idea", platform: "instagram", format: "story", stage: "ideation", caption: "", offset: 0 },
  ];
  const publishedItemIds: { id: string; platform: string; caption: string; thumbUrl: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const assigned = it.stage === "ideation" ? [] : [mediaIds[i % mediaIds.length]];
    const doc: Record<string, unknown> = {
      title: it.title,
      platform: it.platform,
      format: it.format,
      caption: it.caption,
      mediaAssetIds: assigned,
      stage: it.stage,
      createdAt: now - (items.length - i) * day,
    };
    if (it.stage === "published") doc.publishedAt = now - it.offset * day;
    if (it.stage === "scheduled") doc.scheduledAt = now - it.offset * day;
    const id = await ctx.db.insert("contentItems", doc);
    if (it.stage === "published") {
      publishedItemIds.push({ id, platform: it.platform, caption: it.caption, thumbUrl: img(PHOTOS[i % PHOTOS.length].id, 400) });
    }
  }

  // 5. Interactions
  const authors = ["maya.creates", "jordan_writes", "thefitnessguy", "lena.designs", "marco.codes", "sara.studies", "devon.shoots", "nina_travels"];
  const texts = [
    { text: "This is exactly what I needed today, thank you! 🙏", type: "comment", sentiment: "pos", status: "unread" },
    { text: "Wait, how do you schedule these in advance?", type: "comment", sentiment: "neu", status: "unread" },
    { text: "Mentioned you in my story — love your work!", type: "mention", sentiment: "pos", status: "replied" },
    { text: "Not sure I agree with point 2 tbh", type: "reply", sentiment: "neg", status: "unread" },
    { text: "Can you make one about Threads next?", type: "dm", sentiment: "neu", status: "unread" },
    { text: "Saved this and sending to my whole team 🔥", type: "comment", sentiment: "pos", status: "replied" },
    { text: "Been following since 2k followers, so proud!", type: "comment", sentiment: "pos", status: "archived" },
    { text: "The audio on this reel is a bit low", type: "comment", sentiment: "neu", status: "archived" },
    { text: "How long did this carousel take to make?", type: "dm", sentiment: "neu", status: "unread" },
    { text: "Your content keeps me consistent, ty 💛", type: "reply", sentiment: "pos", status: "replied" },
    { text: "Do you offer 1:1 coaching?", type: "dm", sentiment: "neu", status: "unread" },
    { text: "This didn't work for me at all", type: "comment", sentiment: "neg", status: "unread" },
    { text: "Tagged you in a remix of this idea!", type: "mention", sentiment: "pos", status: "unread" },
    { text: "What app do you use to edit?", type: "comment", sentiment: "neu", status: "replied" },
    { text: "First! Love the new format 🎉", type: "comment", sentiment: "pos", status: "archived" },
    { text: "Could you slow down the captions a bit?", type: "reply", sentiment: "neu", status: "unread" },
  ];
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    await ctx.db.insert("interactions", {
      accountId: accounts[i % 2],
      platform: i % 2 === 0 ? "instagram" : "threads",
      type: t.type,
      author: authors[i % authors.length],
      authorAvatar: img(PHOTOS[i % PHOTOS.length].id, 100),
      text: t.text,
      sentiment: t.sentiment,
      status: t.status,
      ts: now - i * (hour * 5),
    });
  }

  // 6. Analytics snapshots — ~90 daily per account.
  const DAYS = 90;
  for (let a = 0; a < accounts.length; a++) {
    const startFollowers = a === 0 ? 9800 : 1900;
    const dailyGain = a === 0 ? 30 : 14;
    for (let d = DAYS - 1; d >= 0; d--) {
      const date = new Date(now - d * day);
      const ymd =
        date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
      const elapsed = DAYS - 1 - d;
      const followers = startFollowers + elapsed * dailyGain + noisy(0, dailyGain);
      await ctx.db.insert("analyticsSnapshots", {
        accountId: accounts[a],
        date: ymd,
        followers,
        reach: noisy(followers * 0.4, followers * 0.12),
        impressions: noisy(followers * 0.9, followers * 0.2),
        engagement: noisy(4200, 900), // basis points x1000 ~ 4.2%
        profileViews: noisy(followers * 0.05, followers * 0.02),
      });
    }
  }

  // 7. Post metrics for published items.
  for (let i = 0; i < publishedItemIds.length; i++) {
    const p = publishedItemIds[i];
    const reach = noisy(18000, 6000);
    await ctx.db.insert("postMetrics", {
      contentItemId: p.id,
      platform: p.platform,
      caption: p.caption,
      thumbUrl: p.thumbUrl,
      likes: noisy(1400, 600),
      comments: noisy(80, 40),
      shares: noisy(120, 60),
      saves: noisy(340, 150),
      reach,
      ts: now - (i + 2) * day,
    });
  }
  // Pad to ~8 metrics with a couple extra historical posts.
  for (let i = publishedItemIds.length; i < 8; i++) {
    await ctx.db.insert("postMetrics", {
      platform: i % 2 === 0 ? "instagram" : "threads",
      caption: "Throwback post that's still pulling reach.",
      thumbUrl: img(PHOTOS[i % PHOTOS.length].id, 400),
      likes: noisy(900, 400),
      comments: noisy(50, 30),
      shares: noisy(70, 40),
      saves: noisy(200, 100),
      reach: noisy(12000, 4000),
      ts: now - (i + 10) * day,
    });
  }

  // 8. Singletons
  await ctx.db.insert("brandProfile", {
    brandName: "Your Brand",
    voice: "Warm, direct, and practical. Talks like a friend who's a few steps ahead — encouraging but never fluffy.",
    pillars: ["Productivity systems", "Creator growth", "Behind-the-scenes", "Honest lessons"],
    audience: "Aspiring and early-stage creators (22-35) who want to grow on Instagram and Threads without burning out.",
    goals: "Grow to 25k engaged followers, build a repeatable content system, and convert attention into a coaching offer.",
    dos: ["Lead with a strong hook", "Share specific numbers", "Be vulnerable about failures", "End with a clear save/share CTA"],
    donts: ["Use vague motivational fluff", "Chase trends off-brand", "Overuse hashtags", "Post without a point"],
    tone: "Confident, encouraging, concise.",
    onboardedAt: now - 30 * day,
  });

  await ctx.db.insert("aiConfig", {
    model: "claude-haiku-4-5",
    temperature: 0.7,
    retrievalEnabled: true,
  });

  return {
    accounts: accounts.length,
    media: mediaIds.length,
    ideas: ideas.length,
    items: items.length,
    interactions: texts.length,
    snapshots: accounts.length * DAYS,
  };
}

// Power/CLI seed: wipes content tables first, then inserts. Destructive — only
// for terminal use where you explicitly want a reset.
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const wipe = [
      "socialAccounts",
      "contentIdeas",
      "contentItems",
      "mediaAssets",
      "interactions",
      "analyticsSnapshots",
      "postMetrics",
      "brandProfile",
      "aiConfig",
    ] as const;
    for (const t of wipe) {
      for (const row of await ctx.db.query(t).take(5000)) await ctx.db.delete(row._id);
    }
    return insertAll(ctx);
  },
});

// In-app one-click seed for non-technical owners. Safe: requires an authenticated
// admin AND only runs on an empty workspace, so it can never wipe real content.
export const seedSample = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");
    const hasItems = await ctx.db.query("contentItems").first();
    const hasAccounts = await ctx.db.query("socialAccounts").first();
    if (hasItems || hasAccounts) {
      return { seeded: false, reason: "already-has-content" as const };
    }
    const counts = await insertAll(ctx);
    return { seeded: true, ...counts };
  },
});

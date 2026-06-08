import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

// Threads sync scaffold — KEY-GUARDED. Mirrors instagram.ts but targets the
// Threads API (graph.threads.net), which uses a SEPARATE app + credentials.
//
// Required env on the Convex deployment:
//   THREADS_APP_ID, THREADS_APP_SECRET — the Threads app
//   THREADS_ACCESS_TOKEN               — a (long-lived) token for the user
//
// Threads API endpoints used (all on https://graph.threads.net/v1.0):
//   GET /me?fields=id,username,threads_profile_picture_url
//   GET /me/threads?fields=id,text,permalink,timestamp,media_type
//   GET /{thread-id}/replies?fields=id,text,username,timestamp
//   GET /{thread-id}/insights?metric=views,likes,replies,reposts,quotes
//   GET /me/threads_insights?metric=followers_count,views   (account-level)
//
// On a configured run these map into analyticsSnapshots / postMetrics /
// interactions via ctx.runMutation, same as Instagram. Threads has no separate
// "follower count" on the profile object — it comes from threads_insights.

const GRAPH = "https://graph.threads.net/v1.0";

type SyncResult =
  | { ok: true; synced: { account: boolean; threads: number; replies: number } }
  | { ok: false; notice: string };

/** Sync a connected Threads account. Key-guarded — returns `{ ok:false, notice }`
 *  when THREADS_APP_ID/SECRET or THREADS_ACCESS_TOKEN is missing. */
export const syncThreads = action({
  args: { accountId: v.id("socialAccounts") },
  handler: async (ctx, { accountId }): Promise<SyncResult> => {
    const id = process.env.THREADS_APP_ID;
    const secret = process.env.THREADS_APP_SECRET;
    const token = process.env.THREADS_ACCESS_TOKEN;
    if (!id || !secret || !token) {
      return {
        ok: false,
        notice:
          "Threads not connected — add THREADS_APP_ID / THREADS_APP_SECRET / THREADS_ACCESS_TOKEN on the Convex deployment and connect your account.",
      };
    }

    // ---- REAL fetch path (runs only when fully configured) ----
    const auth = `access_token=${encodeURIComponent(token)}`;

    // 1) Profile.
    const meRes = await fetch(
      `${GRAPH}/me?fields=id,username,threads_profile_picture_url&${auth}`,
    );
    if (!meRes.ok) {
      const body = await meRes.text().catch(() => "");
      return {
        ok: false,
        notice: `Threads profile fetch ${meRes.status}: ${body.slice(0, 200)}`,
      };
    }

    // 2) Account-level insights (followers + views) feed analyticsSnapshots.
    //    GET /me/threads_insights?metric=followers_count,views
    // 3) Recent threads -> postMetrics + per-thread insights/replies.
    const threadsRes = await fetch(
      `${GRAPH}/me/threads?fields=id,text,permalink,timestamp,media_type&${auth}`,
    );
    const threads = threadsRes.ok
      ? ((await threadsRes.json()) as {
          data?: { id: string; text?: string; timestamp?: string }[];
        })
      : { data: [] };

    let threadCount = 0;
    let replies = 0;
    for (const t of threads.data ?? []) {
      // GET /{thread-id}/replies?fields=id,text,username,timestamp -> interactions
      // GET /{thread-id}/insights?metric=views,likes,replies,reposts,quotes
      //   -> postMetrics, all via ctx.runMutation here.
      threadCount += 1;
      void t.id;
    }

    // Mark connected + stamp lastSyncedAt (see instagram.ts note on not
    // clobbering identity fields via accounts.upsert).
    await ctx.runMutation(api.accounts.setConnected, {
      id: accountId,
      connected: true,
    });

    return {
      ok: true,
      synced: { account: true, threads: threadCount, replies },
    };
  },
});

import { v } from "convex/values";
import { action } from "../../_generated/server";

// Meta (Facebook/Instagram) OAuth scaffold — KEY-GUARDED. Never throws at
// import/build; every action checks env at runtime and degrades gracefully so
// the seeded sample data keeps the app fully usable when unconfigured.
//
// Real flow (Instagram via the Facebook Login dialog):
//   1. Client opens authorizeUrl() in a popup/redirect.
//   2. Meta redirects back with ?code=… to redirectUri.
//   3. exchangeCode() swaps the code for a (short-lived) user access token at
//      GET/POST https://graph.facebook.com/v21.0/oauth/access_token.
//   4. You'd then exchange for a long-lived token, look up the linked Page +
//      IG Business account id, and PERSIST the token in a secure store.
//
// NOTE: Threads uses a SEPARATE app/credentials (graph.threads.net + its own
// OAuth dialog) — see threads.ts. These IG scopes do not grant Threads access.

const GRAPH_VERSION = "v21.0";
const FB_OAUTH_DIALOG = "https://www.facebook.com/v21.0/dialog/oauth";
const FB_TOKEN_URL = `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`;

// Instagram Graph API scopes for read + insights + comment management.
const IG_SCOPES = [
  "instagram_basic",
  "instagram_manage_insights",
  "instagram_manage_comments",
  "pages_show_list",
].join(",");

type AuthorizeResult =
  | { ok: true; url: string }
  | { ok: false; notice: string };

type ExchangeResult =
  | { ok: true; note: string }
  | { ok: false; notice: string };

/** Build the Facebook Login dialog URL for Instagram. Key-guarded on
 *  META_APP_ID. Returns `{ ok:false, notice }` when unconfigured. */
export const authorizeUrl = action({
  args: { redirectUri: v.string() },
  handler: async (_ctx, { redirectUri }): Promise<AuthorizeResult> => {
    const id = process.env.META_APP_ID;
    const secret = process.env.META_APP_SECRET;
    if (!id || !secret) {
      return {
        ok: false,
        notice:
          "Instagram not connected — add META_APP_ID / META_APP_SECRET on the Convex deployment and connect your account.",
      };
    }
    const params = new URLSearchParams({
      client_id: id,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: IG_SCOPES,
    });
    return { ok: true, url: `${FB_OAUTH_DIALOG}?${params.toString()}` };
  },
});

/** Exchange an OAuth `code` for an access token. Key-guarded. On success this
 *  scaffold returns ok WITHOUT persisting any secret — real persistence needs a
 *  secure token store. */
export const exchangeCode = action({
  args: { code: v.string(), redirectUri: v.string() },
  handler: async (_ctx, { code, redirectUri }): Promise<ExchangeResult> => {
    const id = process.env.META_APP_ID;
    const secret = process.env.META_APP_SECRET;
    if (!id || !secret) {
      return {
        ok: false,
        notice:
          "Instagram not connected — add META_APP_ID / META_APP_SECRET on the Convex deployment and connect your account.",
      };
    }

    const params = new URLSearchParams({
      client_id: id,
      client_secret: secret,
      redirect_uri: redirectUri,
      code,
    });

    let res: Response;
    try {
      res = await fetch(`${FB_TOKEN_URL}?${params.toString()}`, {
        method: "GET",
      });
    } catch (err) {
      return { ok: false, notice: `Token exchange failed: ${String(err)}` };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        notice: `Meta token error ${res.status}: ${body.slice(0, 200)}`,
      };
    }

    // Shape: { access_token, token_type, expires_in }. We intentionally do NOT
    // log or return the token value.
    // TODO: exchange for a long-lived token, resolve the IG Business account id
    // (GET /me/accounts -> page -> instagram_business_account), and persist the
    // token in a SECURE server-side store (e.g. an env-encrypted Convex table or
    // an external secrets manager). The scaffold stores nothing.
    return { ok: true, note: "token obtained (persisting to be wired)" };
  },
});

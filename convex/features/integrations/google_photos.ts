import { v } from "convex/values";
import { action } from "../../_generated/server";

// Google Photos search scaffold — KEY-GUARDED. Returns a normalized photo list
// the image-picker tabs can render: { id, thumb, full, alt }[].
//
// OAuth scope required:  https://www.googleapis.com/auth/photoslibrary.readonly
//
// The Google Photos Library API has no free-text search; it filters by content
// categories / date. We POST to:
//   https://photoslibrary.googleapis.com/v1/mediaItems:search  (Bearer token)
// with a filter and map the returned mediaItems. The thumbnail is the
// baseUrl with a size suffix (=w<width>-h<height>), full is baseUrl=d (download).
//
// Token source: GOOGLE_PHOTOS_ACCESS_TOKEN env (server-held) OR an accessToken
// passed by the caller (e.g. a freshly minted user OAuth token).

const SEARCH_URL =
  "https://photoslibrary.googleapis.com/v1/mediaItems:search";

type Photo = { id: string; thumb: string; full: string; alt: string };
type SearchResult = { ok: boolean; photos: Photo[]; notice?: string };

// Loose mapping of a query term to a Google Photos content category.
const CATEGORY_BY_TERM: Record<string, string> = {
  people: "PEOPLE",
  food: "FOOD",
  travel: "TRAVEL",
  city: "CITYSCAPES",
  nature: "LANDSCAPES",
  animal: "ANIMALS",
  pet: "ANIMALS",
};

/** Search Google Photos. Key-guarded — `{ ok:false, photos:[], notice }` when
 *  no token is available. */
export const search = action({
  args: { query: v.string(), accessToken: v.optional(v.string()) },
  handler: async (_ctx, { query, accessToken }): Promise<SearchResult> => {
    const token = accessToken ?? process.env.GOOGLE_PHOTOS_ACCESS_TOKEN;
    if (!token) {
      return {
        ok: false,
        photos: [],
        notice:
          "Google Photos not connected — add GOOGLE_PHOTOS_ACCESS_TOKEN on the Convex deployment (scope photoslibrary.readonly) and connect your account.",
      };
    }

    // Build a category filter from the query (Library API has no text search).
    const term = query.trim().toLowerCase();
    const category = CATEGORY_BY_TERM[term];
    const body = category
      ? {
          pageSize: 24,
          filters: { contentFilter: { includedContentCategories: [category] } },
        }
      : { pageSize: 24 };

    let res: Response;
    try {
      res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return { ok: false, photos: [], notice: `Google Photos request failed: ${String(err)}` };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        photos: [],
        notice: `Google Photos error ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as {
      mediaItems?: {
        id: string;
        baseUrl: string;
        description?: string;
        filename?: string;
      }[];
    };

    const photos: Photo[] = (json.mediaItems ?? []).map((m) => ({
      id: m.id,
      thumb: `${m.baseUrl}=w300-h300-c`,
      full: `${m.baseUrl}=d`,
      alt: m.description ?? m.filename ?? "Google Photos image",
    }));

    return { ok: true, photos };
  },
});

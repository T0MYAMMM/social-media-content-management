import { v } from "convex/values";
import { action } from "../../_generated/server";

// Google Drive image search scaffold — KEY-GUARDED. Returns a normalized list
// the image-picker tabs can render: { id, thumb, full, alt }[].
//
// OAuth scope required:  https://www.googleapis.com/auth/drive.readonly
//   (or the narrower drive.metadata.readonly + drive.file as appropriate)
//
// We GET the Drive Files API filtering to image mime types + a name match:
//   https://www.googleapis.com/drive/v3/files
//     ?q=mimeType contains 'image/' and name contains '<query>'
//     &fields=files(id,name,thumbnailLink,webContentLink,mimeType)
// Map: thumb = thumbnailLink, full = webContentLink (download URL), alt = name.
//
// Token source: GOOGLE_DRIVE_ACCESS_TOKEN / GOOGLE_PHOTOS_ACCESS_TOKEN env, or
// an accessToken passed by the caller. We treat configuration as present when a
// Google OAuth client is set up (GOOGLE_OAUTH_CLIENT_ID) AND a token exists.

const FILES_URL = "https://www.googleapis.com/drive/v3/files";

type Photo = { id: string; thumb: string; full: string; alt: string };
type SearchResult = { ok: boolean; photos: Photo[]; notice?: string };

/** Search Google Drive for images. Key-guarded — `{ ok:false, photos:[], notice }`
 *  when no token is available. */
export const search = action({
  args: { query: v.string(), accessToken: v.optional(v.string()) },
  handler: async (_ctx, { query, accessToken }): Promise<SearchResult> => {
    const token =
      accessToken ??
      process.env.GOOGLE_DRIVE_ACCESS_TOKEN ??
      process.env.GOOGLE_PHOTOS_ACCESS_TOKEN;
    if (!token) {
      return {
        ok: false,
        photos: [],
        notice:
          "Google Drive not connected — add GOOGLE_OAUTH_CLIENT_ID / a Drive access token on the Convex deployment (scope drive.readonly) and connect your account.",
      };
    }

    // Escape single quotes in the query for the Drive `q` grammar.
    const safe = query.trim().replaceAll("'", "\\'");
    const q = safe
      ? `mimeType contains 'image/' and name contains '${safe}' and trashed = false`
      : `mimeType contains 'image/' and trashed = false`;

    const params = new URLSearchParams({
      q,
      pageSize: "24",
      fields: "files(id,name,thumbnailLink,webContentLink,mimeType)",
    });

    let res: Response;
    try {
      res = await fetch(`${FILES_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      return { ok: false, photos: [], notice: `Google Drive request failed: ${String(err)}` };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        photos: [],
        notice: `Google Drive error ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as {
      files?: {
        id: string;
        name?: string;
        thumbnailLink?: string;
        webContentLink?: string;
      }[];
    };

    const photos: Photo[] = (json.files ?? []).map((f) => ({
      id: f.id,
      thumb: f.thumbnailLink ?? "",
      full: f.webContentLink ?? f.thumbnailLink ?? "",
      alt: f.name ?? "Google Drive image",
    }));

    return { ok: true, photos };
  },
});

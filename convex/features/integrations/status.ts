import { action } from "../../_generated/server";

// Integration status — reports which integrations are CONFIGURED (i.e. have
// their required env present on the Convex deployment). Booleans only; never
// returns secret values. Implemented as an ACTION because process.env is
// reliably available in the Convex Node/action runtime (queries run in a
// restricted environment where env access is not guaranteed).

type Status = {
  instagram: boolean;
  threads: boolean;
  googlePhotos: boolean;
  googleDrive: boolean;
  voyage: boolean;
  openai: boolean;
  anthropic: boolean;
};

/** Return configured/not-configured flags for each integration. */
export const get = action({
  args: {},
  handler: async (): Promise<Status> => ({
    instagram: !!process.env.META_APP_ID,
    threads: !!process.env.THREADS_APP_ID,
    googlePhotos: !!process.env.GOOGLE_PHOTOS_ACCESS_TOKEN,
    googleDrive: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    voyage: !!process.env.VOYAGE_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  }),
});

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as aiConfig from "../aiConfig.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as backup from "../backup.js";
import type * as brandProfile from "../brandProfile.js";
import type * as content from "../content.js";
import type * as copilot from "../copilot.js";
import type * as features_copilot_chat from "../features/copilot/chat.js";
import type * as features_copilot_embeddings from "../features/copilot/embeddings.js";
import type * as features_copilot_generate from "../features/copilot/generate.js";
import type * as features_copilot_indexer from "../features/copilot/indexer.js";
import type * as features_copilot_retrieve from "../features/copilot/retrieve.js";
import type * as features_integrations_google_drive from "../features/integrations/google_drive.js";
import type * as features_integrations_google_photos from "../features/integrations/google_photos.js";
import type * as features_integrations_instagram from "../features/integrations/instagram.js";
import type * as features_integrations_meta_oauth from "../features/integrations/meta_oauth.js";
import type * as features_integrations_status from "../features/integrations/status.js";
import type * as features_integrations_threads from "../features/integrations/threads.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as ideas from "../ideas.js";
import type * as interactions from "../interactions.js";
import type * as media from "../media.js";
import type * as ragChunks from "../ragChunks.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as setup from "../setup.js";
import type * as update from "../update.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  aiConfig: typeof aiConfig;
  analytics: typeof analytics;
  auth: typeof auth;
  backup: typeof backup;
  brandProfile: typeof brandProfile;
  content: typeof content;
  copilot: typeof copilot;
  "features/copilot/chat": typeof features_copilot_chat;
  "features/copilot/embeddings": typeof features_copilot_embeddings;
  "features/copilot/generate": typeof features_copilot_generate;
  "features/copilot/indexer": typeof features_copilot_indexer;
  "features/copilot/retrieve": typeof features_copilot_retrieve;
  "features/integrations/google_drive": typeof features_integrations_google_drive;
  "features/integrations/google_photos": typeof features_integrations_google_photos;
  "features/integrations/instagram": typeof features_integrations_instagram;
  "features/integrations/meta_oauth": typeof features_integrations_meta_oauth;
  "features/integrations/status": typeof features_integrations_status;
  "features/integrations/threads": typeof features_integrations_threads;
  files: typeof files;
  http: typeof http;
  ideas: typeof ideas;
  interactions: typeof interactions;
  media: typeof media;
  ragChunks: typeof ragChunks;
  seed: typeof seed;
  settings: typeof settings;
  setup: typeof setup;
  update: typeof update;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

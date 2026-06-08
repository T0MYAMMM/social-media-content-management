"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  Action,
  AiConfig,
  AnalyticsSnapshot,
  BrandProfile,
  ContentIdea,
  ContentItem,
  Interaction,
  MediaAsset,
  PostMetric,
  SocialAccount,
  State,
} from "./types";

// Convex-backed store. `state` is assembled from live Convex queries; `dispatch`
// routes each action to the matching Convex mutation. id mapping: frontend keys
// by `id` (string), Convex by `_id`. On read we map `_id` -> `id`. On upsert we
// pass `id` only when it's a known Convex id (existing row); a fresh nid inserts.

type Ctx = { state: State; dispatch: (a: Action) => void; ready: boolean; progress: number };
const StoreCtx = React.createContext<Ctx | null>(null);

const withId = <T,>(rows: ReadonlyArray<Record<string, unknown>> | undefined): T[] =>
  ((rows ?? []) as Array<Record<string, unknown>>).map((r) => ({ ...r, id: r._id })) as T[];

const oneWithId = <T,>(row: Record<string, unknown> | null | undefined): T | null =>
  row ? ({ ...row, id: (row as { _id?: string })._id } as T) : null;

function Provider({ children }: { children: React.ReactNode }) {
  const accounts = useQuery(api.accounts.list, {});
  const ideas = useQuery(api.ideas.list, {});
  const items = useQuery(api.content.list, {});
  const media = useQuery(api.media.list, {});
  const interactions = useQuery(api.interactions.list, {});
  const snapshots = useQuery(api.analytics.snapshots, {});
  const metrics = useQuery(api.analytics.metrics, {});
  const brand = useQuery(api.brandProfile.get, {});
  const aiConfig = useQuery(api.aiConfig.get, {});

  const queries = [accounts, ideas, items, media, interactions, snapshots, metrics, brand, aiConfig];
  const ready = queries.every((q) => q !== undefined);
  const progress = Math.round((queries.filter((q) => q !== undefined).length / queries.length) * 100);

  const state = React.useMemo<State>(
    () => ({
      accounts: withId<SocialAccount>(accounts),
      ideas: withId<ContentIdea>(ideas),
      items: withId<ContentItem>(items),
      media: withId<MediaAsset>(media),
      interactions: withId<Interaction>(interactions),
      snapshots: withId<AnalyticsSnapshot>(snapshots),
      metrics: withId<PostMetric>(metrics),
      brand: oneWithId<BrandProfile>(brand),
      aiConfig: oneWithId<AiConfig>(aiConfig),
    }),
    [accounts, ideas, items, media, interactions, snapshots, metrics, brand, aiConfig],
  );

  // ---- mutations ----
  const mAccountUpsert = useMutation(api.accounts.upsert);
  const mAccountRemove = useMutation(api.accounts.remove);
  const mAccountConnected = useMutation(api.accounts.setConnected);
  const mIdeaUpsert = useMutation(api.ideas.upsert);
  const mIdeaRemove = useMutation(api.ideas.remove);
  const mIdeaStatus = useMutation(api.ideas.setStatus);
  const mItemUpsert = useMutation(api.content.upsert);
  const mItemRemove = useMutation(api.content.remove);
  const mItemStage = useMutation(api.content.setStage);
  const mMediaCreate = useMutation(api.media.create);
  const mMediaUpsert = useMutation(api.media.upsert);
  const mMediaRemove = useMutation(api.media.remove);
  const mInteractionUpsert = useMutation(api.interactions.upsert);
  const mInteractionStatus = useMutation(api.interactions.setStatus);
  const mInteractionRemove = useMutation(api.interactions.remove);
  const mBrandUpsert = useMutation(api.brandProfile.upsert);
  const mAiUpsert = useMutation(api.aiConfig.upsert);

  const knownIds = React.useMemo(
    () => ({
      accounts: new Set(state.accounts.map((a) => a.id)),
      ideas: new Set(state.ideas.map((i) => i.id)),
      items: new Set(state.items.map((i) => i.id)),
      media: new Set(state.media.map((m) => m.id)),
      interactions: new Set(state.interactions.map((i) => i.id)),
    }),
    [state],
  );

  const dispatch = React.useCallback(
    (action: Action) => {
      const fail = (e: unknown) => console.error(`[store] ${action.type} failed`, e);
      switch (action.type) {
        case "account.upsert": {
          const { id, ...d } = action.account;
          void (knownIds.accounts.has(id)
            ? mAccountUpsert({ id: id as Id<"socialAccounts">, ...d })
            : mAccountUpsert(d)
          ).catch(fail);
          break;
        }
        case "account.delete":
          void mAccountRemove({ id: action.id as Id<"socialAccounts"> }).catch(fail);
          break;
        case "account.setConnected":
          void mAccountConnected({ id: action.id as Id<"socialAccounts">, connected: action.connected }).catch(fail);
          break;
        case "idea.upsert": {
          const { id, createdAt: _c, ...d } = action.idea;
          void (knownIds.ideas.has(id)
            ? mIdeaUpsert({ id: id as Id<"contentIdeas">, ...d })
            : mIdeaUpsert(d)
          ).catch(fail);
          break;
        }
        case "idea.delete":
          void mIdeaRemove({ id: action.id as Id<"contentIdeas"> }).catch(fail);
          break;
        case "idea.setStatus":
          void mIdeaStatus({ id: action.id as Id<"contentIdeas">, status: action.status }).catch(fail);
          break;
        case "item.upsert": {
          const { id, createdAt: _c, ...d } = action.item;
          void (knownIds.items.has(id)
            ? mItemUpsert({ id: id as Id<"contentItems">, ...d })
            : mItemUpsert(d)
          ).catch(fail);
          break;
        }
        case "item.delete":
          void mItemRemove({ id: action.id as Id<"contentItems"> }).catch(fail);
          break;
        case "item.setStage":
          void mItemStage({ id: action.id as Id<"contentItems">, stage: action.stage }).catch(fail);
          break;
        case "media.create": {
          const { id: _id, createdAt: _c, storageId, ...d } = action.asset;
          void mMediaCreate({ ...d, storageId: storageId as Id<"_storage"> | undefined }).catch(fail);
          break;
        }
        case "media.upsert": {
          const { id, createdAt: _c, storageId, ...d } = action.asset;
          const base = { ...d, storageId: storageId as Id<"_storage"> | undefined };
          void (knownIds.media.has(id)
            ? mMediaUpsert({ id: id as Id<"mediaAssets">, ...base })
            : mMediaUpsert(base)
          ).catch(fail);
          break;
        }
        case "media.delete":
          void mMediaRemove({ id: action.id as Id<"mediaAssets"> }).catch(fail);
          break;
        case "interaction.upsert": {
          const { id, accountId, ...d } = action.interaction;
          const base = { ...d, accountId: accountId as Id<"socialAccounts"> | undefined };
          void (knownIds.interactions.has(id)
            ? mInteractionUpsert({ id: id as Id<"interactions">, ...base })
            : mInteractionUpsert(base)
          ).catch(fail);
          break;
        }
        case "interaction.setStatus":
          void mInteractionStatus({ id: action.id as Id<"interactions">, status: action.status }).catch(fail);
          break;
        case "interaction.delete":
          void mInteractionRemove({ id: action.id as Id<"interactions"> }).catch(fail);
          break;
        case "brand.upsert":
          void mBrandUpsert(action.patch).catch(fail);
          break;
        case "ai.upsert":
          void mAiUpsert(action.patch).catch(fail);
          break;
      }
    },
    [knownIds], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const value = React.useMemo<Ctx>(
    () => ({ state, dispatch, ready, progress }),
    [state, dispatch, ready, progress],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

function useStore() {
  const c = React.useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside <StoreProvider>");
  return c;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

export { useStore };

// ---- Convenience derived selectors ----
export const useAccounts = () => useStore().state.accounts;
export const useIdeas = () => useStore().state.ideas;
export const useItems = () => useStore().state.items;
export const useMedia = () => useStore().state.media;
export const useInteractions = () => useStore().state.interactions;
export const useSnapshots = () => useStore().state.snapshots;
export const useMetrics = () => useStore().state.metrics;
export const useBrand = () => useStore().state.brand;
export const useAiConfig = () => useStore().state.aiConfig;

export function useItemsByStage(stage: ContentItem["stage"]) {
  const { state } = useStore();
  return React.useMemo(() => state.items.filter((i) => i.stage === stage), [state.items, stage]);
}

export function useAccount(id: string | undefined) {
  return useStore().state.accounts.find((a) => a.id === id) ?? null;
}

// Re-export shared utils so existing imports keep working.
export { nid, slugify, fmtDate, rel } from "@/components/templates/_shared/utils";

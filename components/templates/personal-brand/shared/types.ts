// Cadence — domain types shared by console slices. Mirror the Convex schema
// (convex/schema.ts); the store maps each Convex row's _id -> id.

export type Platform = "instagram" | "threads";
export type Format = "post" | "reel" | "carousel" | "story" | "thread";
export type Stage = "ideation" | "production" | "scheduled" | "published";

export type SocialAccount = {
  id: string;
  platform: Platform;
  handle: string;
  displayName: string;
  avatarUrl: string;
  followers: number;
  following: number;
  connected: boolean;
  lastSyncedAt?: number;
};

export type IdeaStatus = "spark" | "exploring" | "approved" | "archived";

export type ContentIdea = {
  id: string;
  title: string;
  hook: string;
  notes: string;
  status: IdeaStatus;
  source: "ai" | "manual";
  platform?: Platform;
  tags: string[];
  score: number;
  createdAt: number;
};

export type ContentItem = {
  id: string;
  title: string;
  platform: Platform;
  format: Format;
  caption: string;
  bodyBlocks?: unknown;
  mediaAssetIds: string[];
  ideaId?: string;
  stage: Stage;
  scheduledAt?: number;
  publishedAt?: number;
  externalId?: string;
  createdAt: number;
};

export type MediaSource = "upload" | "google-photos" | "gdrive" | "url" | "unsplash";

export type MediaAsset = {
  id: string;
  source: MediaSource;
  url: string;
  storageId?: string;
  thumbUrl: string;
  width: number;
  height: number;
  alt: string;
  tags: string[];
  createdAt: number;
};

export type InteractionType = "comment" | "mention" | "reply" | "dm";
export type InteractionStatus = "unread" | "replied" | "archived";
export type Sentiment = "pos" | "neu" | "neg";

export type Interaction = {
  id: string;
  accountId?: string;
  platform: Platform;
  type: InteractionType;
  author: string;
  authorAvatar?: string;
  text: string;
  sentiment?: Sentiment;
  status: InteractionStatus;
  externalId?: string;
  ts: number;
};

export type AnalyticsSnapshot = {
  id: string;
  accountId: string;
  date: number; // YYYYMMDD
  followers: number;
  reach: number;
  impressions: number;
  engagement: number; // basis points (x1000)
  profileViews: number;
};

export type PostMetric = {
  id: string;
  contentItemId?: string;
  externalId?: string;
  platform: Platform;
  caption: string;
  thumbUrl: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  ts: number;
};

export type BrandProfile = {
  id?: string;
  brandName?: string;
  voice?: string;
  pillars?: string[];
  audience?: string;
  goals?: string;
  dos?: string[];
  donts?: string[];
  tone?: string;
  onboardedAt?: number;
};

export type AiConfig = {
  id?: string;
  model?: string;
  systemOverlay?: string;
  temperature?: number;
  retrievalEnabled?: boolean;
};

export type State = {
  accounts: SocialAccount[];
  ideas: ContentIdea[];
  items: ContentItem[];
  media: MediaAsset[];
  interactions: Interaction[];
  snapshots: AnalyticsSnapshot[];
  metrics: PostMetric[];
  brand: BrandProfile | null;
  aiConfig: AiConfig | null;
};

export type Action =
  | { type: "account.upsert"; account: SocialAccount }
  | { type: "account.delete"; id: string }
  | { type: "account.setConnected"; id: string; connected: boolean }
  | { type: "idea.upsert"; idea: ContentIdea }
  | { type: "idea.delete"; id: string }
  | { type: "idea.setStatus"; id: string; status: IdeaStatus }
  | { type: "item.upsert"; item: ContentItem }
  | { type: "item.delete"; id: string }
  | { type: "item.setStage"; id: string; stage: Stage }
  | { type: "media.create"; asset: MediaAsset }
  | { type: "media.upsert"; asset: MediaAsset }
  | { type: "media.delete"; id: string }
  | { type: "interaction.upsert"; interaction: Interaction }
  | { type: "interaction.setStatus"; id: string; status: InteractionStatus }
  | { type: "interaction.delete"; id: string }
  | { type: "brand.upsert"; patch: Partial<BrandProfile> & { markOnboarded?: boolean } }
  | { type: "ai.upsert"; patch: Partial<AiConfig> };

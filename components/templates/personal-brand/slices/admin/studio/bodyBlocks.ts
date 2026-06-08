// Local body-block shapes persisted into ContentItem.bodyBlocks (typed `unknown`
// by the contract). Two editor modes: a lightweight Sketch and a multi-slide Story.

export type Slide = { heading: string; body: string };

export type SketchBlocks = { mode: "sketch"; outline: string };
export type StoryBlocks = { mode: "story"; slides: Slide[] };
export type BodyBlocks = SketchBlocks | StoryBlocks;

export type EditorMode = "sketch" | "story";

/** Narrow the opaque `bodyBlocks` value into our known shapes (best effort). */
export function parseBodyBlocks(raw: unknown): BodyBlocks | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.mode === "sketch") {
    return { mode: "sketch", outline: typeof obj.outline === "string" ? obj.outline : "" };
  }
  if (obj.mode === "story" && Array.isArray(obj.slides)) {
    const slides: Slide[] = obj.slides.map((s) => {
      const so = (s ?? {}) as Record<string, unknown>;
      return {
        heading: typeof so.heading === "string" ? so.heading : "",
        body: typeof so.body === "string" ? so.body : "",
      };
    });
    return { mode: "story", slides };
  }
  return null;
}

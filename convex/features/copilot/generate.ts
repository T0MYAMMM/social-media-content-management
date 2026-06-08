"use node";

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

type GenerateResult =
  | { ok: true; created: number }
  | { ok: false; notice: string };

type GeneratedIdea = {
  title: string;
  hook: string;
  platform?: string;
  tags?: string[];
};

/** Extract a JSON array from a model response that may include prose/fences. */
function extractJsonArray(text: string): unknown[] {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Generate fresh content ideas with Claude, grounded in brand + a few chunks. */
export const generateIdeas = action({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, { count }): Promise<GenerateResult> => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return {
        ok: false,
        notice:
          "AI is not configured — set ANTHROPIC_API_KEY on the Convex deployment.",
      };
    }

    const n = count ?? 5;
    const aiConfig = await ctx.runQuery(api.aiConfig.get, {});
    const profile = await ctx.runQuery(api.brandProfile.get, {});

    let context = "";
    if (process.env.VOYAGE_API_KEY) {
      try {
        const res = await ctx.runAction(api.features.copilot.retrieve.retrieve, {
          query: "fresh content ideas for our brand",
          k: 4,
        });
        if (res.ok && res.chunks.length) {
          context = res.chunks.map((c) => `- ${c.text}`).join("\n");
        }
      } catch {
        // Non-fatal.
      }
    }

    const brandLines: string[] = [];
    if (profile) {
      const p = profile as {
        brandName?: string;
        voice?: string;
        tone?: string;
        audience?: string;
        goals?: string;
        pillars?: string[];
      };
      if (p.brandName) brandLines.push(`Brand: ${p.brandName}`);
      if (p.voice) brandLines.push(`Voice: ${p.voice}`);
      if (p.tone) brandLines.push(`Tone: ${p.tone}`);
      if (p.audience) brandLines.push(`Audience: ${p.audience}`);
      if (p.goals) brandLines.push(`Goals: ${p.goals}`);
      if (p.pillars?.length) brandLines.push(`Pillars: ${p.pillars.join(", ")}`);
    }

    const system =
      "You are Cadence Copilot, a social content strategist for Instagram and Threads. " +
      "Generate fresh, specific, on-brand content ideas. " +
      'Respond ONLY with a JSON array of objects: [{"title": string, "hook": string, "platform": "instagram"|"threads", "tags": string[]}]. ' +
      "No prose, no markdown fences.";

    const prompt = [
      `Generate ${n} fresh content ideas.`,
      brandLines.length ? `\nBrand profile:\n${brandLines.join("\n")}` : "",
      context ? `\nRecent workspace context:\n${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { generateText } = await import("ai");
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const anthropic = createAnthropic({ apiKey: key });

    let text: string;
    try {
      const result = await generateText({
        model: anthropic(aiConfig?.model ?? "claude-haiku-4-5"),
        system,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1200,
        temperature: aiConfig?.temperature ?? 0.8,
      });
      text = result.text;
    } catch (err) {
      return { ok: false, notice: `AI request failed: ${String(err)}` };
    }

    const raw = extractJsonArray(text);
    let created = 0;
    for (const item of raw) {
      if (typeof item !== "object" || item === null) continue;
      const idea = item as GeneratedIdea;
      if (!idea.title) continue;
      const platform =
        idea.platform === "threads" ? "threads" : "instagram";
      await ctx.runMutation(api.ideas.upsert, {
        title: String(idea.title),
        hook: String(idea.hook ?? ""),
        notes: "",
        status: "spark",
        source: "ai",
        platform: platform as "instagram" | "threads",
        tags: Array.isArray(idea.tags) ? idea.tags.map(String) : [],
        score: 50 + Math.floor(Math.random() * 31),
      });
      created++;
    }

    return { ok: true, created };
  },
});

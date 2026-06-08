"use node";

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

type ChatResult =
  | { ok: true; text: string; sources: string[] }
  | { ok: false; notice: string };

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt(
  profile: Record<string, unknown> | null,
  chunks: { text: string }[],
  overlay?: string,
): string {
  const lines: string[] = [
    "You are Cadence Copilot, an expert social content strategist for Instagram and Threads.",
    "You help plan, write, and refine on-brand content. Be concrete, practical, and concise.",
  ];

  if (profile) {
    const p = profile as {
      brandName?: string;
      voice?: string;
      tone?: string;
      audience?: string;
      goals?: string;
      pillars?: string[];
      dos?: string[];
      donts?: string[];
    };
    const brand: string[] = [];
    if (p.brandName) brand.push(`Brand: ${p.brandName}`);
    if (p.voice) brand.push(`Voice: ${p.voice}`);
    if (p.tone) brand.push(`Tone: ${p.tone}`);
    if (p.audience) brand.push(`Audience: ${p.audience}`);
    if (p.goals) brand.push(`Goals: ${p.goals}`);
    if (p.pillars?.length) brand.push(`Content pillars: ${p.pillars.join(", ")}`);
    if (p.dos?.length) brand.push(`Do: ${p.dos.join("; ")}`);
    if (p.donts?.length) brand.push(`Don't: ${p.donts.join("; ")}`);
    if (brand.length) {
      lines.push("", "Brand profile:", ...brand);
    }
  }

  if (chunks.length) {
    lines.push("", "Relevant context from the workspace:");
    for (const c of chunks) lines.push(`- ${c.text}`);
  }

  if (overlay) {
    lines.push("", overlay);
  }

  return lines.join("\n");
}

/** Cadence Copilot chat: optional RAG grounding + Anthropic generation. Key-guarded. */
export const chat = action({
  args: {
    sessionId: v.optional(v.id("copilotSessions")),
    prompt: v.string(),
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, { sessionId, prompt, history }): Promise<ChatResult> => {
    const aiConfig = await ctx.runQuery(api.aiConfig.get, {});
    const profile = await ctx.runQuery(api.brandProfile.get, {});

    const retrievalEnabled = aiConfig?.retrievalEnabled ?? true;

    let chunks: { id: string; text: string }[] = [];
    if (retrievalEnabled && process.env.VOYAGE_API_KEY) {
      try {
        const res = await ctx.runAction(api.features.copilot.retrieve.retrieve, {
          query: prompt,
          k: 6,
        });
        if (res.ok) {
          chunks = res.chunks.map((c) => ({ id: c.id, text: c.text }));
        }
      } catch {
        // Retrieval failure is non-fatal — proceed without grounding.
      }
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return {
        ok: false,
        notice:
          "AI is not configured — set ANTHROPIC_API_KEY on the Convex deployment.",
      };
    }

    const system = buildSystemPrompt(profile, chunks, aiConfig?.systemOverlay);

    const { generateText } = await import("ai");
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const anthropic = createAnthropic({ apiKey: key });

    const messages: HistoryMessage[] = [
      ...(history ?? []),
      { role: "user" as const, content: prompt },
    ];

    let text: string;
    try {
      const result = await generateText({
        model: anthropic(aiConfig?.model ?? "claude-haiku-4-5"),
        system,
        messages,
        maxTokens: 800,
        temperature: aiConfig?.temperature ?? 0.7,
      });
      text = result.text;
    } catch (err) {
      return { ok: false, notice: `AI request failed: ${String(err)}` };
    }

    if (sessionId) {
      await ctx.runMutation(api.copilot.addMessage, {
        sessionId,
        role: "user",
        content: prompt,
      });
      await ctx.runMutation(api.copilot.addMessage, {
        sessionId,
        role: "assistant",
        content: text,
        sources: chunks.map((c) => c.id),
      });
    }

    return { ok: true, text, sources: chunks.map((c) => c.id) };
  },
});

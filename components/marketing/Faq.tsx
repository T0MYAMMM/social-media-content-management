"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, Eyebrow } from "./Section";

const FAQS = [
  {
    q: "Who owns my content and data?",
    a: "You do, entirely. Your ideas, drafts, media, and analytics are yours — export them anytime. We never sell data or train shared models on your content; your brand-voice profile is private to your workspace.",
  },
  {
    q: "Do I need my own Meta developer app?",
    a: "No. Cadence is a registered Meta app, so you simply authorize your Instagram and Threads accounts through standard OAuth. Agencies who prefer their own app credentials can bring them on the Agency plan.",
  },
  {
    q: "What AI model powers the copilot?",
    a: "The copilot pairs a frontier language model with retrieval over your own posts and brand profile (RAG), so suggestions are grounded in what you've actually published rather than generic output. You stay the editor on every draft.",
  },
  {
    q: "Is it only Instagram and Threads?",
    a: "For now, yes — and deliberately so. We'd rather do two platforms exceptionally than ten platforms passably. The pipeline is built to extend, and more networks are on the roadmap.",
  },
  {
    q: "Can the copilot post on its own?",
    a: "Never without you. The copilot drafts and suggests; publishing is always an explicit action you take. Nothing reaches your audience until you approve it.",
  },
  {
    q: "How does scheduling pick times?",
    a: "Cadence suggests slots based on when your audience has historically engaged, pulled from your own account insights. You're free to override any suggestion and post on your own schedule.",
  },
];

export function Faq() {
  return (
    <Section className="reveal">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl">Questions, answered.</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you might want to know before you connect an account.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

import { Hero } from "./Hero";
import { Problem } from "./Problem";
import { Pipeline } from "./Pipeline";
import { Copilot } from "./Copilot";
import { Media } from "./Media";
import { Analytics } from "./Analytics";
import { Integrations } from "./Integrations";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";

/**
 * Cadence marketing landing page — single long editorial page composed from
 * section sub-components. Header + footer are supplied by PublicChrome.
 */
export function MarketingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <Pipeline />
      <Copilot />
      <Media />
      <Analytics />
      <Integrations />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * robots.txt
 *
 * Private surfaces (admin, dashboard, judge portal, auth) are disallowed for
 * everyone. AI answer-engine crawlers are *explicitly* allowed on public content
 * so ORVOX can be cited in ChatGPT, Claude, Gemini, Perplexity, and Copilot
 * answers (GEO). Training-only crawlers are listed separately so this can be
 * tightened later without touching the answer-engine grants.
 */
const PRIVATE_PATHS = ["/admin/", "/dashboard/", "/judge/", "/login", "/signup", "/logout"];

// Crawlers that power live AI answers / citations — allow on public content.
const AI_ANSWER_BOTS = [
  "GPTBot", // OpenAI (ChatGPT browsing + training)
  "OAI-SearchBot", // OpenAI search index
  "ChatGPT-User", // ChatGPT live fetch on user request
  "ClaudeBot", // Anthropic Claude
  "Claude-Web",
  "anthropic-ai",
  "Claude-User",
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // Perplexity live fetch
  "Google-Extended", // Gemini / AI Overviews grounding
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "Bingbot", // Bing + Copilot
  "DuckAssistBot",
  "cohere-ai",
  "CCBot", // Common Crawl (feeds many LLMs)
  "Meta-ExternalAgent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      ...AI_ANSWER_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

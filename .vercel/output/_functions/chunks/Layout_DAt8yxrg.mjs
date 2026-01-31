import { e as createComponent, g as addAttribute, l as renderHead, n as renderSlot, r as renderTemplate, h as createAstro } from './astro/server_CxIlnfDj.mjs';
import 'piccolore';
import 'clsx';
/* empty css                       */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title,
    description = "AI-powered SRT to Video converter. Transform your subtitles into professional storyboards with AI-generated visuals. Free, fast, and SEO-optimized.",
    image = "/og-image.png"
  } = Astro2.props;
  return renderTemplate`<html lang="en" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><!-- SEO Meta Tags --><title>${title}</title><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#4f46e5"><!-- Open Graph --><meta property="og:type" content="website"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(image, "content")}><meta property="og:url"${addAttribute(Astro2.url, "content")}><!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(image, "content")}><!-- Canonical URL --><link rel="canonical"${addAttribute(Astro2.url, "href")}><!-- Sitemap --><link rel="sitemap" href="/sitemap.xml"><link rel="alternate" type="application/rss+xml" title="ViralCut AI" href="/rss.xml"><!-- Preload critical resources --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${renderHead()}</head> <body class="bg-[#0f0f12] text-gray-100 antialiased selection:bg-indigo-500/30"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/malik/Downloads/viralcut-ai---srt-to-video/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };

import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, g as addAttribute, m as maybeRenderHead, u as unescapeHTML } from '../chunks/astro/server_CxIlnfDj.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DAt8yxrg.mjs';
export { renderers } from '../renderers.mjs';

const defaultLang = "en";
const translations = {
  en: {
    "seo.title": "ViralCut AI - Free SRT to Video Storyboard Generator",
    "seo.description": "Transform SRT subtitles into professional AI-generated storyboards. Free, fast, and SEO-optimized video creation tool.",
    "hero.badge": "✨ AI-Powered Video Creation",
    "hero.title": "Turn Subtitles Into",
    "hero.highlight": "Amazing Videos",
    "hero.description": "Transform your SRT subtitles into professional storyboards with AI-generated visuals. Fast, free, and incredibly easy to use.",
    "hero.cta.primary": "Start Creating Free",
    "hero.cta.secondary": "Learn More",
    "features.title": "Powerful Features",
    "features.items": [
      { icon: "🎯", title: "Smart Storyboard", description: "AI automatically generates visual storyboards from your SRT subtitles." },
      { icon: "🎨", title: "Multiple Styles", description: "Choose from various video styles including anime, realistic, oil painting, and more." },
      { icon: "📸", title: "Reference Images", description: "Upload reference images to guide the AI visual style." },
      { icon: "⚡", title: "Fast Generation", description: "Generate multiple images in parallel with intelligent quota management." },
      { icon: "🔒", title: "Privacy First", description: "Your data stays on your device. No server-side storage of your content." },
      { icon: "🌐", title: "Multi-Language", description: "Support for SRT files in any language with AI translation." }
    ],
    "howitworks.title": "How It Works",
    "howitworks.steps": [
      { icon: "📤", title: "Upload SRT File", description: "Simply drag and drop your SRT subtitle file. We support all standard SRT formats." },
      { icon: "✨", title: "AI Generation", description: "Our AI analyzes your script and generates unique visual scenes for each subtitle segment." },
      { icon: "📹", title: "Export Video", description: "Download your storyboard or export as video. Share directly to social media." }
    ],
    "cta.title": "Ready to Create?",
    "cta.description": "Start transforming your subtitles into stunning visuals today. No account required.",
    "cta.button": "Start Creating Now"
  },
  zh: {
    "seo.title": "ViralCut AI - 免费 SRT 转视频分镜生成器",
    "seo.description": "将 SRT 字幕转换为专业的 AI 生成分镜。免费、快速、SEO 优化的视频创作工具。",
    "hero.badge": "✨ AI 驱动的视频创作",
    "hero.title": "将字幕变成",
    "hero.highlight": "精彩视频",
    "hero.description": "将您的 SRT 字幕转换为专业的 AI 生成分镜。快速、免费且易于使用。",
    "hero.cta.primary": "开始免费创作",
    "hero.cta.secondary": "了解更多",
    "features.title": "强大功能",
    "features.items": [
      { icon: "🎯", title: "智能分镜", description: "AI 自动从您的 SRT 字幕生成视觉分镜。" },
      { icon: "🎨", title: "多种风格", description: "从各种视频风格中选择，包括动漫、 realistic、油画等。" },
      { icon: "📸", title: "参考图片", description: "上传参考图片指导 AI 视觉风格。" },
      { icon: "⚡", title: "快速生成", description: "并行生成多张图片，智能配额管理。" },
      { icon: "🔒", title: "隐私优先", description: "您的数据保留在设备上，不进行服务器端存储。" },
      { icon: "🌐", title: "多语言支持", description: "支持任何语言的 SRT 文件，带 AI 翻译。" }
    ],
    "howitworks.title": "使用流程",
    "howitworks.steps": [
      { icon: "📤", title: "上传 SRT 文件", description: "简单拖放您的 SRT 字幕文件。我们支持所有标准 SRT 格式。" },
      { icon: "✨", title: "AI 生成", description: "我们的 AI 分析您的脚本并为每个字幕片段生成独特的视觉场景。" },
      { icon: "📹", title: "导出视频", description: "下载您的分镜或导出为视频。直接分享到社交媒体。" }
    ],
    "cta.title": "准备好创作了吗？",
    "cta.description": "今天就开始将您的字幕转化为令人惊叹的视觉效果。无需注册账户。",
    "cta.button": "立即开始创作"
  }
};
function getLangFromUrl(url) {
  const pathname = url.pathname;
  const langCode = pathname.split("/")[1];
  if (langCode in translations) {
    return langCode;
  }
  return defaultLang;
}
function useTranslations(lang) {
  return function t(key) {
    return translations[lang]?.[key] || translations[defaultLang]?.[key] || key;
  };
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const lang = getLangFromUrl(Astro2.url);
  const t = useTranslations(lang);
  const title = t("seo.title");
  const description = t("seo.description");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(['  <script type="application/ld+json">', "<\/script>  ", '<section class="min-h-screen flex items-center justify-center px-6 py-12"> <div class="max-w-4xl mx-auto text-center"> <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"> <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path> </svg> ', ' </div> <h1 class="text-5xl md:text-6xl font-bold text-white mb-6"> ', ' <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> ', ' </span> </h1> <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"> ', ' </p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/app" class="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all hover:scale-105"> ', ' </a> <a href="#features" class="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-700"> ', ' </a> </div> </div> </section>  <section id="features" class="py-24 px-6 border-t border-gray-800"> <div class="max-w-6xl mx-auto"> <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-16"> ', ' </h2> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"> ', ' </div> </div> </section>  <section class="py-24 px-6 border-t border-gray-800"> <div class="max-w-4xl mx-auto"> <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-16"> ', ' </h2> <div class="space-y-12"> ', ' </div> </div> </section>  <section class="py-24 px-6 border-t border-gray-800"> <div class="max-w-4xl mx-auto text-center"> <h2 class="text-3xl md:text-4xl font-bold text-white mb-6"> ', ' </h2> <p class="text-xl text-gray-400 mb-10"> ', ' </p> <a href="/app" class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all hover:scale-105"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path> </svg> ', ' </a> </div> </section>  <footer class="py-12 px-6 border-t border-gray-800"> <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4"> <div class="flex items-center gap-2"> <div class="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg"> <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path> </svg> </div> <span class="font-bold">ViralCut AI</span> </div> <p class="text-gray-500 text-sm">\n\xA9 2025 ViralCut AI. All rights reserved.\n</p> </div> </footer> '])), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ViralCut AI",
    "description": "AI-powered SRT to Video converter with automatic storyboard generation",
    "url": "https://viralcut.ai",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "AI-powered storyboard generation",
      "SRT subtitle parsing",
      "Multiple video style templates",
      "Reference image analysis",
      "Batch image generation",
      "Export to video"
    ]
  })), maybeRenderHead(), t("hero.badge"), t("hero.title"), t("hero.highlight"), t("hero.description"), t("hero.cta.primary"), t("hero.cta.secondary"), t("features.title"), t("features.items").map((feature) => renderTemplate`<div class="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-all group"> <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <span class="text-2xl">${feature.icon}</span> </div> <h3 class="text-xl font-semibold text-white mb-2">${feature.title}</h3> <p class="text-gray-400">${feature.description}</p> </div>`), t("howitworks.title"), t("howitworks.steps").map((step, index) => renderTemplate`<div${addAttribute(`flex gap-8 items-center ${index % 2 === 1 ? "flex-row-reverse" : ""}`, "class")}> <div class="flex-1"> <div class="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-4"> ${index + 1} </div> <h3 class="text-xl font-semibold text-white mb-2">${step.title}</h3> <p class="text-gray-400">${step.description}</p> </div> <div class="flex-1 bg-gray-900/50 rounded-2xl border border-gray-800 p-6 aspect-video flex items-center justify-center"> <span class="text-4xl">${step.icon}</span> </div> </div>`), t("cta.title"), t("cta.description"), t("cta.button")) })}`;
}, "/Users/malik/Downloads/viralcut-ai---srt-to-video/src/pages/index.astro", void 0);

const $$file = "/Users/malik/Downloads/viralcut-ai---srt-to-video/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

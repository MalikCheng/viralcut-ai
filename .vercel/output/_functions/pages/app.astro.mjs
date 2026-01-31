import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CxIlnfDj.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DAt8yxrg.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$App = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "ViralCut AI - Editor" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "App", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/malik/Downloads/viralcut-ai---srt-to-video/src/App", "client:component-export": "default" })} ` })}`;
}, "/Users/malik/Downloads/viralcut-ai---srt-to-video/src/pages/app.astro", void 0);

const $$file = "/Users/malik/Downloads/viralcut-ai---srt-to-video/src/pages/app.astro";
const $$url = "/app";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$App,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

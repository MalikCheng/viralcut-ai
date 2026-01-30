import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePrerender } from 'vite-plugin-prerender';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // @ts-ignore
    vitePrerender({
      // Required - The path to the vite-outputted app to prerender.
      staticDir: path.resolve('dist'),
      
      // Required - Routes to render.
      // Note: Since we are using Query Params (?lang=zh) instead of Paths (/zh),
      // we only need to prerender the root index. The JS will hydrate the correct language.
      // If you refactor to use React Router with paths (e.g. /zh, /es), add them here.
      routes: ['/'],

      renderer: {
         // Optional: wait for a specific event if your app loads data async
         // renderAfterDocumentEvent: 'custom-render-trigger',
         
         // Wait 2 seconds to ensure React has fully rendered the SeoContent
         renderAfterTime: 2000,
      },
      
      // Minify the resulting HTML
      minify: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        keepClosingSlash: true,
        sortAttributes: true,
      },
    }),
  ],
});
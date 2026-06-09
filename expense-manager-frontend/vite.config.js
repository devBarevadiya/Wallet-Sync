import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // {
    //   name: "html-transform",
    //   transformIndexHtml(html) {
    //     console.log(html);
    //     // Replace title tag
    //     html = html.replace(
    //       /<title>(.*?)<\/title>/,
    //       `<title>Modified Title from Vite</title>`
    //     );

    //     // Replace meta description
    //     html = html.replace(
    //       /<meta name="description" content="(.*?)"/,
    //       `<meta name="description" content="Modified Meta Description from Vite"`
    //     );

    //     // Replace meta image (e.g., og:image)
    //     html = html.replace(
    //       /<meta property="og:image" content="(.*?)"/,
    //       `<meta property="og:image" content="https://example.com/modified-image.jpg"`
    //     );

    //     return html;
    //   },
    // },
    react(),
  ],
  server: {
    ssr: true,
    port: 5175,
  },
});

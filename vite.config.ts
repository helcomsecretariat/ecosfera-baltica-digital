import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { developmentCSP, productionCSP } from "./csp.config";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        const csp = mode === "production" ? productionCSP : developmentCSP;
        return html.replace(
          /<meta http-equiv="Content-Security-Policy".*?>/,
          `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
        );
      },
    },
    {
      name: "remove-html-comments",
      transformIndexHtml(html) {
        return html.replace(/<!--(?!<!)[^[>].*?-->/g, "");
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"], // Force Three.js into a single chunk
        },
      },
    },
  },
}));

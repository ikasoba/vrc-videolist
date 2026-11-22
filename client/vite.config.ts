import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [
    preact({
      prerender: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: [
      { find: "react", replacement: "preact/compat" },
      { find: "react-dom", replacement: "preact/compat" }
    ]
  }
});

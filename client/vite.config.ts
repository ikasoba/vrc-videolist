import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: [
      { find: "react", replacement: "preact/compat" },
      { find: "react-dom", replacement: "preact/compat" }
    ]
  }
});

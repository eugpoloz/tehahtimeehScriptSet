import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "enhanceReactions",
  name: "teh.enhanceReactions",
  emptyOutDir: true,
  globals: { enhanceReactions: "teh" }
});

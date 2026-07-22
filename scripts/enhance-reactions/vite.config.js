import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "enhance-reactions",
  name: "teh.enhanceReactions",
  globals: { enhanceReactions: "teh" }
});

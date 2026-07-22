import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "web-components",
  name: "teh.webComponents",
  emptyOutDir: true,
  globals: { webComponents: "teh" }
});

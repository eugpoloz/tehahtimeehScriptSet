import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "multiaccQuickLogin",
  name: "teh.multiaccQuickLogin",
  emptyOutDir: true,
  globals: { multiaccQuickLogin: "teh" }
});

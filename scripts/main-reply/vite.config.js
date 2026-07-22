import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "main-reply",
  name: "teh",
  emptyOutDir: true,
  globals: { mainReply: "teh" }
});

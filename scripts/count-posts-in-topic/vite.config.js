import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "countPostsInTopic",
  name: "teh.countPostsInTopic",
  emptyOutDir: true,
  globals: { countPostsInTopic: "teh" }
});

import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "count-posts-in-topic",
  name: "teh.countPostsInTopic",
  globals: { countPostsInTopic: "teh" }
});

import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "add-episode-templates",
  name: "teh.addEpisodeTemplates",
  globals: { addEpisodeTemplates: "teh" }
});

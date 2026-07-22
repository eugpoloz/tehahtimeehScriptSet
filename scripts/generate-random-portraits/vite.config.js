import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "generateRandomPortraits",
  name: "teh.generateRandomPortraits",
  emptyOutDir: true,
  globals: { generateRandomPortraits: "teh" }
});

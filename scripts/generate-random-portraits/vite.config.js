import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "generate-random-portraits",
  name: "teh.generateRandomPortraits",
  globals: { generateRandomPortraits: "teh" }
});

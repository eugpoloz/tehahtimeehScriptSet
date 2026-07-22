import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "generateCustomFields",
  name: "teh.generateCustomFields",
  emptyOutDir: true,
  globals: { generateCustomFields: "teh" }
});

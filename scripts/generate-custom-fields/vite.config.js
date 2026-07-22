import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "generate-custom-fields",
  name: "teh.generateCustomFields",
  globals: { generateCustomFields: "teh" }
});

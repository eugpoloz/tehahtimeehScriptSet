import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "html-footer",
  name: "teh",
  globals: { footer: "teh" }
});

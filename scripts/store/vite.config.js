import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "store",
  name: "teh.store",
  globals: { store: "teh" }
});

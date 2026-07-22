import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "multiacc-quick-login",
  name: "teh.multiaccQuickLogin",
  globals: { multiaccQuickLogin: "teh" }
});

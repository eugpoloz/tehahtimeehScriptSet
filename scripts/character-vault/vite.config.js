import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "character-vault",
  name: "teh.characterVault",
  globals: {
    characterVault: "teh"
  }
});

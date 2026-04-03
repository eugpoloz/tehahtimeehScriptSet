import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: ["chrome87", "edge88", "firefox78", "safari14"],
    sourcemap: false,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/bss.js"),
      fileName: (format) => `bss.${format}.js`,
      formats: ["iife"],
      name: "bss"
    },
    oxc: {
      charset: "utf-8"
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});

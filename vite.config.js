import path from "path";
import commonjs from "vite-plugin-commonjs";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    plugins: [commonjs()],
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

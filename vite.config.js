import path from "path";
import commonjs from "vite-plugin-commonjs";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: ["chrome87", "edge88", "firefox78", "safari14"],
    plugins: [commonjs()],
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      mangle: false,
      module: true,
      compress: {
        drop_console: false,
        drop_debugger: false,
        dead_code: true,
        unused: true,
      },
    },
    lib: {
      entry: path.resolve(__dirname, "src/bss.js"),
      fileName: (format) => `bss.${format}.js`,
      formats: ["iife"],
      name: "bss"
    },
    oxc: {
      charset: "utf-8",
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});

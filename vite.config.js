import path from "path";
import { defineConfig, build } from "vite";

const LIB = process.env.LIB ?? "htmlFooter";

// libraries
const libConfig = {
  htmlFooter: {
    entry: "./src/html-footer.js",
    name: "tehFooter"
  },
  mainReply: {
    entry: "./src/main-reply.js",
    name: "tehMainReply"
  }
};

const currentConfig = libConfig[LIB];

export default defineConfig(() => ({
  build: {
    target: ["chrome87", "edge88", "firefox78", "safari14"],
    sourcemap: false,
    minify: false,
    emptyOutDir: false,
    lib: {
      entry: currentConfig.entry,
      name: currentConfig.name,
      fileName: (format, entryName) => `teh.${entryName}.${format}.js`,
      formats: ["iife"]
    },
    oxc: {
      charset: "utf-8"
    },
    rolldownOptions: {
      output: {
        generatedCode: {
          symbols: false
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
}));

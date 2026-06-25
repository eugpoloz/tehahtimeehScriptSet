import path from "path";
import { defineConfig, build } from "vite";

const LIB = process.env.LIB ?? "core";
const NAMESPACE = "teh";

// libraries
const libConfig = {
  core: {
    entry: "./src/core.js",
    emptyOutDir: true
  },
  htmlFooter: {
    entry: "./src/html-footer.js",
    emptyOutDir: false,
    globals: {
      footer: NAMESPACE
    }
  },
  mainReply: {
    entry: "./src/main-reply.js",
    emptyOutDir: false,
    globals: {
      mainReply: NAMESPACE
    }
  },
  generateCustomFields: {
    entry: "./src/features/optional/generateCustomFields.js",
    emptyOutDir: false,
    name: `${NAMESPACE}.generateCustomFields`,
    globals: {
      generateCustomFields: NAMESPACE
    }
  },
  generateRandomPortraits: {
    entry: "./src/features/optional/generateRandomPortraits.js",
    emptyOutDir: false,
    name: `${NAMESPACE}.generateRandomPortraits`,
    globals: {
      generateRandomPortraits: NAMESPACE
    }
  },
  defineWebComponents: {
    entry: "./src/features/optional/defineWebComponents.js",
    emptyOutDir: false,
    name: `${NAMESPACE}.defineWebComponents`,
    globals: {
      defineWebComponents: NAMESPACE
    }
  }
};

const currentConfig = libConfig[LIB];

export default defineConfig(() => ({
  build: {
    target: ["chrome87", "edge88", "firefox78", "safari14"],
    sourcemap: false,
    minify: true,
    emptyOutDir: currentConfig.emptyOutDir,
    lib: {
      entry: currentConfig.entry,
      name: currentConfig.name ?? NAMESPACE,
      fileName: (format, entryName) => `teh.${entryName}.${format}.js`,
      formats: ["iife"]
    },
    oxc: {
      charset: "utf-8"
    },
    rolldownOptions: {
      output: {
        name: currentConfig.name ?? NAMESPACE,
        extend: true,
        globals: currentConfig.globals ?? {},
        generatedCode: {
          symbols: false
        },
        comments: {
          legal: true
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
}));

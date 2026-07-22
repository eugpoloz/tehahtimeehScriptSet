import { defineConfig } from "vite";

export function createIifeConfig({
  entry,
  fileName,
  name = "teh",
  emptyOutDir = true,
  globals = {}
}) {
  return defineConfig({
    build: {
      target: ["chrome87", "edge88", "firefox78", "safari14"],
      sourcemap: false,
      minify: true,
      emptyOutDir,
      lib: {
        entry,
        name,
        fileName: (format) => `teh.${fileName}.${format}.js`,
        formats: ["iife"]
      },
      oxc: {
        charset: "utf-8"
      },
      rolldownOptions: {
        output: {
          name,
          extend: true,
          globals,
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
  });
}

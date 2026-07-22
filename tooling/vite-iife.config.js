import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const monorepoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export function createIifeConfig({
  entry,
  fileName,
  name = "teh",
  emptyOutDir = false,
  globals = {}
}) {
  return defineConfig({
    build: {
      target: ["chrome87", "edge88", "firefox78", "safari14"],
      sourcemap: false,
      minify: true,
      outDir: join(monorepoRoot, "dist"),
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

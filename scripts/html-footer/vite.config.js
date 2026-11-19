import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mergeConfig } from "vite";
import { createIifeConfig } from "../../tooling/vite-iife.config.js";

const require = createRequire(import.meta.url);
const sesRoot = dirname(require.resolve("ses/package.json"));

export default mergeConfig(
  createIifeConfig({
    entry: "./src/index.js",
    fileName: "html-footer",
    name: "teh",
    globals: { footer: "teh" }
  }),
  {
    plugins: [
      {
        name: "post-worker",
        generateBundle() {
          const runtime = join(sesRoot, "dist/ses.umd.min.js");
          const bootstrap = fileURLToPath(
            new URL("./src/helpers/post-worker.js", import.meta.url)
          );
          this.addWatchFile(runtime);
          this.addWatchFile(bootstrap);
          this.emitFile({
            type: "asset",
            fileName: "teh.post-worker.js",
            source:
              readFileSync(runtime, "utf8") +
              ";\n" +
              readFileSync(bootstrap, "utf8")
          });
        }
      }
    ]
  }
);

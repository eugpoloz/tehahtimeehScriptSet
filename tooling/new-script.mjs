#!/usr/bin/env node
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const kebab = process.argv[2]?.trim();

if (!kebab) {
  console.error("Usage: make new-script NAME=my-feature");
  process.exit(1);
}

if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(kebab)) {
  console.error(
    `NAME must be kebab-case (e.g. multiacc-quick-login), got: ${kebab}`
  );
  process.exit(1);
}

const camel = kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const pkgDir = join(root, "scripts", kebab);

try {
  await access(pkgDir);
  console.error(`scripts/${kebab} already exists`);
  process.exit(1);
} catch {
  // ok — does not exist
}

const files = {
  "package.json": `{
  "name": "@teh/${kebab}",
  "version": "0.7.0",
  "license": "MIT",
  "type": "module",
  "main": "../../dist/teh.${kebab}.iife.js",
  "exports": {
    ".": "../../dist/teh.${kebab}.iife.js"
  },
  "scripts": {
    "build": "yarn run -T vite build",
    "dev": "yarn run -T vite build --watch"
  },
  "dependencies": {
    "@teh/utils": "workspace:*"
  }
}
`,
  "vite.config.js": `import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "${kebab}",
  name: "teh.${camel}",
  globals: { ${camel}: "teh" }
});
`,
  "src/index.js": `"use strict";

/**
 * @param {unknown} [config]
 */
function ${camel}(config) {}

export default ${camel};

// config example
//
// teh.${camel}();
`
};

for (const [relativePath, body] of Object.entries(files)) {
  const dest = join(pkgDir, relativePath);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, body);
}

const readmePath = join(root, "README.md");
let readme = await readFile(readmePath, "utf8");

if (!readme.includes(`  ${kebab}/`)) {
  readme = readme.replace(
    /\ntooling\/\n/,
    `\n  ${kebab}/                    # → teh.${kebab}.iife.js\ntooling/\n`
  );
  await writeFile(readmePath, readme);
}

console.log(`Created scripts/${kebab}`);
console.log(`  package: @teh/${kebab}`);
console.log(`  export:  teh.${camel} / teh.${kebab}.iife.js`);
console.log(`  make:    make ${kebab}`);

const install = spawnSync("yarn", ["install"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32"
});

process.exit(install.status ?? 1);

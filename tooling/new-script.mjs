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
  "files": [
    "dist"
  ],
  "main": "./dist/teh.${camel}.iife.js",
  "exports": {
    ".": "./dist/teh.${camel}.iife.js"
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "dependencies": {
    "@teh/utils": "workspace:*"
  },
  "devDependencies": {
    "vite": "^8.1.5"
  }
}
`,
  "vite.config.js": `import { createIifeConfig } from "../../tooling/vite-iife.config.js";

export default createIifeConfig({
  entry: "./src/index.js",
  fileName: "${camel}",
  name: "teh.${camel}",
  emptyOutDir: true,
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

const makefilePath = join(root, "Makefile");
const makefileLines = (await readFile(makefilePath, "utf8")).split("\n");

if (makefileLines.some((line) => line === `${kebab}:`)) {
  console.error(`Makefile already has a '${kebab}' target`);
  process.exit(1);
}

let lastPhonyIdx = -1;
for (let i = 0; i < makefileLines.length; i++) {
  const line = makefileLines[i];
  const inPhony =
    line.startsWith(".PHONY:") ||
    (lastPhonyIdx >= 0 && makefileLines[i - 1]?.endsWith("\\"));

  if (!inPhony) {
    if (lastPhonyIdx >= 0) break;
    continue;
  }

  lastPhonyIdx = i;
  if (!line.endsWith("\\")) break;
}

if (lastPhonyIdx < 0) {
  console.error("Could not find .PHONY in Makefile");
  process.exit(1);
}

const lastPhony = makefileLines[lastPhonyIdx];
if (!lastPhony.endsWith("\\")) {
  makefileLines[lastPhonyIdx] = `${lastPhony} \\`;
}
makefileLines.splice(lastPhonyIdx + 1, 0, `\t${kebab}`);

const buildIdx = makefileLines.findIndex((line) => line.startsWith("build:"));
if (buildIdx < 0) {
  console.error("Could not find build: target in Makefile");
  process.exit(1);
}

makefileLines.splice(
  buildIdx,
  0,
  "",
  `${kebab}:`,
  `\tyarn workspace @teh/${kebab} build`
);
makefileLines[buildIdx + 3] = `${makefileLines[buildIdx + 3]} ${kebab}`;

await writeFile(makefilePath, makefileLines.join("\n"));

const readmePath = join(root, "README.md");
let readme = await readFile(readmePath, "utf8");

if (!readme.includes(`  ${kebab}/`)) {
  readme = readme.replace(
    /\ntooling\/\n/,
    `\n  ${kebab}/                    # → teh.${camel}.iife.js\ntooling/\n`
  );
}

if (!readme.includes(`make ${kebab}\n`)) {
  readme = readme.replace(
    /(make clean\s+#)/,
    `make ${kebab}\nmake clean     #`
  );
}

if (!readme.includes("make new-script")) {
  readme = readme.replace(
    /(make typecheck # [^\n]+\n)/,
    `$1make new-script NAME=my-feature  # scaffold a new scripts/* package\n`
  );
}

await writeFile(readmePath, readme);

console.log(`Created scripts/${kebab}`);
console.log(`  package: @teh/${kebab}`);
console.log(`  export:  teh.${camel} / teh.${camel}.iife.js`);
console.log(`  make:    make ${kebab}`);

const install = spawnSync("yarn", ["install"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32"
});

process.exit(install.status ?? 1);

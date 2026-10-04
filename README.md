# tehahtimeehScriptSet

Browser scripts for mybb/rusff, built as IIFEs in `dist/`.

## Layout

```text
lib/
  utils/                     # shared browser helpers
scripts/
  <script-name>/             # Script package; builds to dist/teh.<script-name>.iife.js
tooling/                     # Repository build and scaffolding tools
```

## Conventions

- Packages live in `scripts/<kebab-case-name>` and contain `package.json`,
  `vite.config.js`, and `src/index.js`.
- Entry points define the public API, initialization, and exports.
- Source modules and feature directories use lowercase kebab-case.
- Put feature code in `src/features`, local helpers in `src/helpers`,
  configuration code in `src/config`, shared JSDoc types in `src/types.js`, and
  shared browser helpers in `lib/utils`.
- A multi-file feature may use a directory with its own `index.js`.
- Create optional directories only when needed.
- Document configuration and usage in the package README.
- Keep source in JavaScript; JSDoc and `checkJs` provide type safety.
- Public APIs use camelCase; bundle filenames remain kebab-case.

## Commands

```bash
make install                 # install dependencies
make build                   # build every script
make build WINDOWS_1251=1    # also emit Windows-1251 copies
make <script>                # build one script, e.g. make html-footer
make typecheck               # check JavaScript and JSDoc types
make format                  # format all supported files, respecting .gitignore
make clean                   # remove dist/
make new-script NAME=my-tool # scaffold scripts/my-tool
```

`make new-script` creates the package, installs workspace dependencies, and
exposes its API under the camel-cased `teh` property. The Makefile and
TypeScript configuration discover packages automatically.

## Image fallback

[`teh.proxyImages()`](scripts/html-footer/README.md#image-proxy-fallback) in
`html-footer` retries failed images through a proxy.

## Character config

Core provides `teh.loadCharacters()`. Start loading in the forum HTML header
after core loads, and keep the returned promise:

```js
teh.charactersPromise = teh.loadCharacters(
  "//forumstatic.ru/files/001c/ab/7e/21393.json?v=2"
);
```

Later consumers need no URL:

```js
const characters = await teh.loadCharacters();
```

The loader stores the supplied URL in `teh.charactersConfigUrl` for subsequent
calls and administrative links. It sets `window.characters` and returns that
same object. It reuses loaded data, shares concurrent requests and allows retry
after failure. Character values must be objects; NPCs may omit `id` and DOB.
Unknown properties are preserved.

Character config must be a `.json` file. Its bytes are decoded with
`TextDecoder("windows-1251")` before parsing. Asset URLs have no timestamps.

Character-vault, store, admin-actions and the character editor use core's loader.
The editor derives its administrative file from `teh.charactersConfigUrl` and
saves/exports plain JSON.

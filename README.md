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
make <script>                # build one script, e.g. make html-footer
make typecheck               # check JavaScript and JSDoc types
make format                  # format the repository
make clean                   # remove dist/
make new-script NAME=my-tool # scaffold scripts/my-tool
```

`make new-script` creates the package, installs workspace dependencies, and
exposes its API under the camel-cased `teh` property. The Makefile and
TypeScript configuration discover packages automatically.

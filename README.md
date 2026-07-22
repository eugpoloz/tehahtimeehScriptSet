# tehahtimeehScriptSet

Yarn workspaces monorepo of forum scripts for mybb/rusff. Each buildable package emits an IIFE that attaches onto `window.teh` (load **`@teh/core` first**).

## Layout

```
lib/
  utils/                     # @teh/utils — shared helpers (source only)
scripts/
  core/                      # @teh/core → teh.core.iife.js
  html-footer/               # @teh/html-footer → teh.html-footer.iife.js
  main-reply/                # @teh/main-reply → teh.main-reply.iife.js
  web-components/            # @teh/web-components → teh.web-components.iife.js
  generate-custom-fields/    # → teh.generateCustomFields.iife.js
  generate-random-portraits/ # → teh.generateRandomPortraits.iife.js
tooling/
  vite-iife.config.js        # shared Vite IIFE factory
```

## Commands

```bash
make install   # yarn install
make build     # build all IIFEs (core first)
make core      # build a single package
make html-footer
make main-reply
make web-components
make generate-custom-fields
make generate-random-portraits
make clean     # remove scripts/*/dist
make typecheck # JSDoc / checkJs via tsc --noEmit
```

Outputs land in each script package's `dist/` folder.

## Type safety (without TypeScript sources)

Sources stay `.js`. Types come from JSDoc + `globals.d.ts`; `make typecheck` runs `tsc --noEmit` (`allowJs` / `checkJs` / `noEmit`).

Currently `tsconfig.json` includes **`lib/**` only** so the check stays green. To opt scripts in later, add `"scripts/**/*.js"` to `include` and fix reported issues gradually (or add `// @ts-check` per file).

# tehahtimeehScriptSet

Yarn workspaces monorepo of forum scripts for mybb/rusff. Each buildable package emits an IIFE that attaches onto `window.teh` (load **`@teh/core` first**).

## Layout

```
lib/
  utils/                     # @teh/utils — shared helpers (source only)
scripts/
  core/                      # @teh/core → teh.core.iife.js
  html-footer/               # → teh.html-footer.iife.js
  main-reply/                # → teh.main-reply.iife.js
  hehedges-specials/         # → teh.hehedges-specials.iife.js
  generate-custom-fields/    # → teh.generate-custom-fields.iife.js
  generate-random-portraits/ # → teh.generate-random-portraits.iife.js
  multiacc-quick-login/      # → teh.multiacc-quick-login.iife.js
  count-posts-in-topic/      # → teh.count-posts-in-topic.iife.js
  enhance-reactions/         # → teh.enhance-reactions.iife.js
  add-episode-templates/     # → teh.add-episode-templates.iife.js
tooling/
  vite-iife.config.js        # shared Vite IIFE factory
  new-script.mjs             # used by `make new-script`
```

## Commands

```bash
make install   # yarn install
make build     # build all IIFEs (core first, then the rest in parallel)
make <script>  # build a single package (e.g. make html-footer)
make clean     # remove root dist/
make typecheck # JSDoc / checkJs via tsc --noEmit
make format    # prettier --write
make new-script NAME=my-feature  # scaffold a new scripts/* package
```

`NAME` must be kebab-case. That creates `scripts/<name>/`, updates the README layout, and runs `yarn install`. Global export is camelCase (`my-feature` → `teh.myFeature`); the dist file is kebab (`teh.my-feature.iife.js`). Makefile targets are discovered from `scripts/*/`.

Outputs land in the root `dist/` folder.

## Type safety (without TypeScript sources)

Sources stay `.js`. Types come from JSDoc plus the root declaration files; `make typecheck` runs `tsc --noEmit` (`allowJs` / `checkJs` / `noEmit`) across shared utilities and every script package.

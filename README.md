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
  character-vault/            # → teh.character-vault.iife.js
  html-header/               # → teh.html-header.iife.js
tooling/
  vite-iife.config.js        # shared Vite IIFE factory
  new-script.mjs             # used by `make new-script`
```

## Script package conventions

Every buildable script is a workspace under `scripts/<kebab-case-name>/` with a `package.json`, a `vite.config.js`, and a `src/index.js` entry point. Keep the entry point focused on the public API, default initialization, and exports.

Add package directories only when the code needs them:

```text
src/
  index.js       # public API and initialization
  features/      # feature-specific behavior
  helpers/       # reusable helpers local to this package
  config/        # substantial static or default configuration
  types.js       # shared JSDoc types for this package
```

Source modules and feature directories use lowercase kebab-case. A feature may be a single file or a directory with its own `index.js` when it spans several modules. Keep broadly reusable browser helpers in `lib/utils`; do not move package-specific helpers there.

Put substantial configuration and usage documentation in the package's `README.md`. Short invocation examples may remain beside the public entry point. Do not create empty convention directories.

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

`NAME` must be kebab-case. That creates `scripts/<name>/` with a thin entry point and `src/features/<name>.js`, updates the README layout, and runs `yarn install`. Global export is camelCase (`my-feature` → `teh.myFeature`); the dist file is kebab (`teh.my-feature.iife.js`). The `tsconfig.json` and Makefile discover new packages automatically.

Outputs land in the root `dist/` folder.

## Type safety (without TypeScript sources)

Sources stay `.js`. Types come from JSDoc plus the root declaration files; `make typecheck` runs `tsc --noEmit` (`allowJs` / `checkJs` / `noEmit`) across shared utilities and every script package.

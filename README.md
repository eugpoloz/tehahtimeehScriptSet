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
```

Outputs land in each script package's `dist/` folder.

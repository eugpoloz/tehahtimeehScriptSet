# tehahtimeehScriptSet

Browser scripts for mybb/rusff, built as IIFEs in `dist/`.

Scripts live in `scripts/<script-name>`, shared helpers in `lib/utils`, and
build tools in `tooling`. Development conventions are in [AGENTS.md](AGENTS.md).

## Commands

```bash
make install                 # install dependencies
make build                   # build every script
make build WINDOWS_1251=1     # also emit Windows-1251 copies
make <script>                # build one script, e.g. make html-footer
make typecheck               # check JavaScript and JSDoc types
make format                  # format all supported files, respecting .gitignore
make clean                   # remove dist/
make new-script NAME=my-tool  # scaffold scripts/my-tool and install dependencies
```

## Forum setup

Load `dist/teh.core.iife.js` before other bundles. Public APIs are exposed through
`window.teh`; see each package's README for initialization and options.

Configure character loading in the forum header after core:

```js
teh.charactersPromise = teh.loadCharacters(
  "//forumstatic.ru/files/001c/ab/7e/21393.json?v=2"
);
```

Consumers then call:

```js
const characters = await teh.loadCharacters();
```

The config must be Windows-1251 JSON. The loader remembers the URL in
`teh.charactersConfigUrl` and returns `window.characters`. Character values are
objects; NPCs may omit `id` and DOB.

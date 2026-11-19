# tehahtimeehScriptSet

Browser scripts for mybb/rusff, built as IIFEs in `dist/`.

Scripts live in `scripts/<script-name>`, shared helpers in `lib/utils`, and
build tools in `tooling`. Development conventions are in [AGENTS.md](AGENTS.md).
The store and character forms share profile-picker markup through
[`@teh/utils`](lib/utils/README.md#profile-pickers).

## Commands

Use Node.js 22.x starting at 22.22.2, 24.x starting at 24.15.0, or 26+ for
the current build dependencies. Enable Corepack to use the Yarn version pinned
in `package.json`.

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

## Post HTML

The HTML footer accepts group IDs in `fullAccessGroupId` for unrestricted access and `scopedAccessGroupId`
for post-local rendering through an SES worker. The build also writes `dist/teh.post-worker.js` for on-demand loading. Full access takes precedence.
Inline scripts can use `teh.post()` in both modes to access block data and render HTML. See the
[configuration and authoring example](scripts/html-footer/README.md#post-html).

## BB quoting

On topic pages with a reply editor, opt in after loading `main-reply`:

```js
teh.enableBbQuoting();
```

The quote button selects its post. A text selection is limited to that post;
if it does not intersect the post, the whole post is quoted. Empty selections
within the post leave the editor unchanged and show a notice. Whole-post quotes
omit nested answer quotes, edit notices, and signatures; selected nested quotes
are retained. Initialization can be called more than once.

The converter preserves common formatting, links, images, lists, quote and code
boxes, abbreviations including forum tooltip text, tables, spoilers, hidden text,
media, video iframes, and forum blocks when their DOM exposes the content.
Other HTML is reduced to readable content where possible; interactive controls
and executable scripts are omitted. The forum's insertion function adds the
result to the existing editor content.

The built-in forum mappings cover `indent`, `hideprofile`, `subject`, `coin`,
`small`, `material`, `tag`, `badge`, `mono`, `iconprofile`, `plashka`, and
`coupon`. The profile and coupon mappings account for their initialized
components. For additional mappings or overrides, supply rules on the first
call:

```js
teh.enableBbQuoting({
  rules: [
    { selector: ".my-badge", tag: "badge", parameter: "data-variant" },
    { selector: ".my-indent", tag: "indent", selfClosing: true },
    {
      selector: ".my-component",
      tag: "example",
      parameter: (element) => element.getAttribute("data-kind"),
      contentSelector: ":scope > .authored-content"
    },
    {
      selector: ".another-component",
      tag: "example",
      serialize: (element, serializeChildren) => {
        const content = element.querySelector(":scope > .content");
        return content ? serializeChildren(content) : null;
      }
    }
  ]
});
```

Rules are matched in order, with the first custom match taking precedence over
built-in rules and ordinary conversion. Nested elements are converted
recursively. `parameter` is an attribute name or a callback; a missing, empty,
or multiline value produces a tag without a parameter. Quotes and numeric
entity sequences in custom-tag parameters are encoded for the forum renderer.
Built-in hide counts and list styles use the unquoted syntax the forum expects. `selfClosing`
emits only an opening tag. `serialize` returns BBCode content, or `null` or
`undefined` to use `contentSelector` (or the element's children). A missing
`contentSelector` target falls back to the element's ordinary children without
the custom wrapper. Use `serializeChildren` in callbacks to respect the user's
selection. Empty content does not produce a paired tag. Later initializer calls
are ignored, including their options.

Rendered HTML cannot reliably recover all original BBCode. Table styles are
limited to width, height, background color and alignment; video URLs may be
converted to embed URLs; spoiler titles lose nested markup. Lazy media content
is recovered from inert stored markup only for whole-post quotes. HTML-in-post
source and transformed components whose source is no longer present cannot
always be recovered. Custom serializers run in the page and should be trusted.

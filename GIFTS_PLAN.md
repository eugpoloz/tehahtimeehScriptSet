This is the implementation handoff for a forum gift shop. It records the planning
conversation and the relevant repository behavior inspected on 2026-09-10. No
feature implementation, scaffold, build, forum publication, or collection update
is authorized by the request that produced this document.

The intended result is a dedicated gifts post in a separate ordering topic,
powered by `scripts/gifts` in `tehahtimeehScriptSet` and styled by a separate
`styles/gifts.css` in the sibling `hehedges-backups` repository. Gifts are purchased
in complete bundles, and each gift has its own recipient. Existing store purchases
keep their current flow.

The user explicitly confirmed these product requirements:

| Requirement              | Meaning                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Catalog and custom gifts | A gift can use a catalog image or an image URL supplied by the buyer.                                                  |
| Mixed bundles            | Three catalog gifts and two custom images can form the same five-gift bundle at the same price.                        |
| Complete bundles         | All gifts in a bundle must be selected before checkout. The discussed example is five gifts for one forum money token. |
| Individual recipients    | Every gift can go to a different character. A single recipient for the whole order would defeat the intended flow.     |
| Vault visibility         | Delivered gifts must appear in `character-vault`, including its character filters.                                     |
| Separate ordering flow   | The user favors separate placement because gift ordering differs from ordinary purchases.                              |
| Planning only for now    | Implementation belongs to a later task.                                                                                |

The following are proposed implementation defaults, not additional requirements
explicitly confirmed by the user. Review them together before starting the first
code milestone; do not silently turn them into broader features.

| Decision              | Proposed first version                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package and placement | A dedicated `scripts/gifts` package and gifts topic, following the direction discussed with the user.                                                                                  |
| Bundle configuration  | One configured bundle size and price per gifts post; start with size `5` and price `1`. Keep these configurable because the original numbers were introduced as an example.            |
| Number of bundles     | One bundle per generated order. Multiple bundles in one checkout are outside the first version.                                                                                        |
| Required gift fields  | Image URL and recipient are required. Message and signature are optional.                                                                                                              |
| Signature             | An editable, single-line signature for each gift, initially the current character name. This is display text, separate from the payer.                                                 |
| Message               | Plain text with supported line breaks. User-entered HTML and BBCode are displayed as text.                                                                                             |
| Duplicate selections  | Repeated images and repeated recipients are allowed. Each slot remains a separate gift.                                                                                                |
| Payer                 | One main profile for the bundle, defaulting to the logged-in character's main profile. Selecting another player's main profile adds the existing store's payment-confirmation wording. |
| Payment methods       | Forum tokens only. Gift coupon eligibility has not been agreed and must not be inherited automatically from the store.                                                                 |
| Custom images         | Already-hosted HTTP(S) image URLs, including protocol-relative URLs where supported by the existing helpers. File uploads and image hosting are outside this version.                  |
| Reply insertion       | Prepare a forum reply for the buyer to submit. Preserve an existing draft by appending the generated order with a blank-line separator.                                                |
| Fulfillment           | Staff processes payment and adds the generated gift records to collection pages, following the current manual workflow.                                                                |
| Draft lifetime        | Keep the bundle in memory while the interface is open or closed. Persistence across reloads is outside this version.                                                                   |

Before implementation, the user also needs to supply or approve the actual
catalog images and category labels, the destination topic/post, and the intended
scope of edits in both repositories. Example URLs below are documentation only.
Asset hosting URLs and a real post ID can be supplied when publication is planned;
their absence does not prevent local implementation with documented placeholders.

The current code provides these starting points:

- `scripts/store/src/features/store.js` contains the catalog, cart, character
  loader, payment handling, and checkout in one large initializer. Its recipient
  and payer selectors both filter to main profiles. Its cart has one recipient,
  adds individual item prices, and supports coupons per item.
- Store checkout writes to `#main-reply`, dispatches a bubbling `input` event,
  clears its cart, and focuses the reply. It does not post automatically, debit
  balances, or persist purchased items.
- Store groups checkout items by type and name. Its payload formatter takes an
  image URL before considering custom fields. Reusing that grouping or formatter
  for gifts would lose the association between image, recipient, and message.
- `scripts/store/src/index.js` automatically initializes the first matching
  source. Its markup uses fixed store IDs. The new interface needs its own
  selectors and IDs, rather than mounting another store instance.
- `scripts/character-vault/src/features/character-vault.js` already renders
  `[data-collection="gift"]` groups. A group's `data-profile` is the exact
  recipient character key; when absent, it defaults to the vault's main
  character. Selecting a character filters gifts to that character.
- `scripts/character-vault/src/helpers/markup.js` currently splits each gift line
  as `image | comment | signature`, validates its image URL, and renders a gift
  with a popover. Existing comments and signatures can contain HTML.
- `scripts/character-vault/src/helpers/character-vault.js` reads collection lines
  through `innerHTML`, removes HTML comments, and splits on physical newlines.
  This matters when designing an escaping scheme.
- `scripts/character-vault/src/features/load-characters.js` and the store each
  load `window.characters` from the same forum script. Their handling of existing
  loader tags differs. The vault's public `teh.loadCharacters()` must remain
  available after extraction.
- `lib/utils` is the existing shared browser utility package. It already exports
  HTML escaping and image URL helpers through `@teh/utils`.
- The actual backed-up store post inspected is
  `hehedges-backups/posts/5805_store.txt`. The store README's `posts/unk_store.txt`
  reference is stale. Consult the real post for forum wrapper and asset-loading
  conventions; do not copy its catalog into the gifts post without direction.

The proposed file boundary is below. Agree on this boundary before code edits.
Create modules when their responsibilities are implemented; do not create empty
future feature directories.

```text
tehahtimeehScriptSet/
  GIFTS_PLAN.md
  lib/utils/
    index.js                         # Export the new shared helpers
    README.md                        # Document their contracts
    src/load-characters.js           # Shared data loading and shared JSDoc types
    src/gift-record.js               # Gift parsing and serialization
  scripts/gifts/
    package.json
    vite.config.js
    README.md
    src/index.js                    # Public API and automatic initialization
    src/constants.js                # Forum character-data URL and local constants
    src/types.js                    # Catalog, slot, and bundle JSDoc types
    src/features/gifts.js           # Initialization and coordination
    src/features/catalog.js         # Catalog/custom image selection
    src/features/bundle.js          # Slot editing, progress, and validation
    src/features/checkout.js        # Review and reply insertion
    src/helpers/catalog.js          # Source markup parsing
    src/helpers/characters.js       # Recipient and payer resolution
    src/helpers/markup.js           # HTML template strings
    src/helpers/checkout.js         # Order grouping and BBCode formatting
  scripts/character-vault/
    src/features/load-characters.js # Preserve public API through a wrapper
    src/types.js                    # Reuse the shared character type
    src/helpers/markup.js           # Consume parsed gift records
    src/features/character-vault.js # Only gift iteration/IDs if needed
    README.md                       # Document gift records and recipient groups
  scripts/store/
    package.json                    # Declare @teh/utils if adopting the loader
    src/features/store.js           # Replace only the duplicate loader
  README.md                         # Document the gifts package and command
  yarn.lock                         # Only changes caused by workspace setup
  dist/                             # Generated through builds only

hehedges-backups/
  styles/gifts.css                   # New purchase interface styling
  posts/<agreed-gifts-post>.txt       # Catalog source, copy, asset references
  styles/style_cs.css                # Only if a shared control is extracted
```

Keep ordinary store behavior intact when replacing its loader. In particular,
preserve its main-profile eligibility checks, default recipient/payer handling,
coupon behavior, and checkout text. Do not split or redesign the store as part of
this work. Existing collection pages do not need a bulk migration.

The shared modules have deliberately narrow responsibilities:

- `load-characters.js`: export a configurable loader that returns the character
  registry and has no UI. The forum script URL belongs at the call site. Preserve
  the existing character data shape in JSDoc, including numeric or string IDs,
  and let the vault reuse that type while retaining its local profile/blog types.
  Reuse `window.characters` when already loaded. Coordinate concurrent loads
  across separately built IIFEs; module-local promise caching alone is
  insufficient because each bundle contains its own utility copy. Use a shared
  script element or browser-level registry keyed by the normalized source URL.
  Exclude a generated cache-busting value from that identity. Retain the
  `windows-1251` script charset, account for existing store/vault loader tags,
  settle failures, and allow a later explicit retry. Do not wait indefinitely for
  a `load` event that already fired or treat a load event without the registry as
  success. Define the shared state and URL-mismatch behavior before coding it.
- `gift-record.js`: export gift parsing and serialization, including a documented
  normalized record type. It must know nothing about prices, bundles, recipients,
  DOM rendering, or forum reply insertion. Recipient identity continues to live
  on the surrounding collection group. Reuse the existing image and HTML
  helpers; verify the limits of the existing URL helper, which currently checks
  a URL prefix rather than complete URL validity.
- `gifts` local helpers: resolve main accounts, validate selected characters,
  parse the catalog, prepare staff routing labels, and format orders. Avoid a new
  shared cart abstraction. Shared JavaScript utilities do not own CSS.

The proposed public API is `teh.gifts(source?)`, where `source` is an optional
source `HTMLElement` and omission selects the first `[data-gifts-source]`.
Loading the bundle should initialize that first source on DOM readiness, matching
the store's convenience. Explicit calls allow initialization after insertion of
post content. Initialization must be idempotent per source, with state and event
handlers attached once. Missing source markup is an early return. A failed data
load should produce a useful Russian status and leave a route to retry.

Load `@teh/core` before gifts so `window.teh` exists. The package must not require
the store or character-vault bundles at runtime. Use the repository's IIFE
scaffold and retain `teh.loadCharacters()` as the vault's wrapper around the
shared loader. `dist/teh.gifts.iife.js` is the generated gift bundle.

For source markup, use a small declarative catalog. This is a proposed contract
to review in the first milestone:

```html
<section
  data-gifts-source
  data-gifts-bundle-size="5"
  data-gifts-bundle-price="1"
  hidden
>
  <div data-gifts-category="Цветы">
    https://example.com/rose.png https://example.com/tulip.png
  </div>
  <div data-gifts-category="Угощения">https://example.com/cake.png</div>
</section>
```

Each nonempty URL line is a catalog choice. Whitespace and HTML comments should
not create items. Category titles are text, not arbitrary generated HTML. Invalid
catalog URLs should be skipped with a useful diagnostic; an empty catalog should
still allow custom-image gifts. Validate bundle size and price as positive safe
integers. Invalid configuration blocks ordering with an explanatory status;
silently guessing a price is inappropriate. Individual catalog entries have no
price because the configured bundle owns the price.

Use these conceptual data records. Exact property names can be finalized with
the source contract, but preserve the ownership boundaries:

| Record           | Fields and responsibility                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog item     | Local ID, category, and image URL. Local IDs need only remain stable during the initialized interface's lifetime.                                                                      |
| Gift slot        | Stable slot ID, image origin (`catalog` or `custom`), optional catalog ID, image URL, recipient character key, message, and signature. An empty slot has no chosen image or recipient. |
| Bundle           | Configured size, fixed price, payer main-profile key, and exactly that many slots.                                                                                                     |
| Collection gift  | Image URL, message, and signature. No bundle price, payer, or catalog dependency.                                                                                                      |
| Collection group | Exact recipient character key in `data-profile`, containing the individual gift records.                                                                                               |

Resolve the recipient from every valid selectable character, including alternate
profiles, using the exact registry key rather than a display translation or an
`@`-prefixed label. Resolve its collection owner from `character.main`, or the
recipient itself for a main profile. The registry inspected does not provide a
collection page handle; do not invent a URL by slugifying a name. Staff output can
identify the owner and recipient by name and use the known numeric profile ID
for a profile link. Invalid or missing referenced main profiles need an explicit
validation result instead of silently routing gifts elsewhere.

Gift record encoding requires a reviewed contract before the serializer is
implemented. Preserve existing records such as:

```html
<div data-collection="gift" data-profile="Character Name">
  https://example.com/rose.png | С днём рождения! | Sender Name
</div>
```

New input needs to round-trip Russian text, ampersands, quotes, angle brackets,
literal `|`, percent signs, and line breaks. Replacing a pipe with `&#124;` is not
by itself a solution: parsing HTML can decode it back into the separator before
the vault reads `innerHTML`. Encoding and rendering must be considered together.

A concrete proposed solution is a marked line format for newly generated gifts:

```text
gift:v1|<percent-encoded image URL>|<percent-encoded message>|<percent-encoded signature>
```

Encode every field independently and keep one physical line per record. An empty
signature remains an empty final field. This prefix is distinguishable from the
HTTP(S) URL at the start of a legacy record. The shared parser would support both
formats, decode marked fields exactly once, validate the decoded URL, and return
an explicit distinction between new plain text and legacy HTML content. New text
is escaped at rendering time, with message line breaks rendered deliberately.
Existing trusted collection HTML retains its display behavior. Malformed marked
records are rejected individually without stopping the collection.

The marked format is a technical proposal, not an already-approved storage
change. Review a real serialized example and its staff editing experience before
adopting it. If the user prefers to keep every record human-readable, agree on a
different unambiguous escaping contract at that milestone. Do not switch to
JSON-only collections, rewrite old pages, or apply HTML entity substitutions that
have not been checked through the actual DOM-reading path.

The interaction sequence should be implemented as follows:

1. Show the configured bundle offer, image catalog, custom-image entry, and the
   fixed number of slots. Use Russian labels consistent with the forum, such as
   `Набор из 5 подарков — 1 [coin]` in post copy and the existing coin icon in
   generated HTML.
2. Let the buyer choose a slot and fill it from the catalog or a custom URL. A
   catalog click can fill the active slot, or the next empty slot when none is
   active. At capacity, require selecting a slot for replacement; do not silently
   overwrite a gift or start another bundle.
3. Show each slot's image preview, recipient selector, message, and signature.
   Replacing the image preserves that slot's recipient and text. Clearing a slot
   removes its gift data and makes the bundle incomplete. Slots must not be
   merged because their images or recipients happen to match.
4. Validate URL syntax and accepted protocols. Do not require a filename
   extension: hosted image URLs may have query strings or extensionless paths.
   Show a preview failure as useful feedback without erasing entered data. The
   proposed completion rule uses URL validity, not success of a temporary image
   network request.
5. Populate recipient options from valid main and alternate character profiles.
   Populate payer options from valid main profiles. If the logged-in character
   cannot be resolved, require an explicit payer selection and use an empty
   default signature. Keep the buyer's edits intact when profile data arrives.
6. Show selected-image progress and explain missing required recipient fields.
   Enable checkout only when all configured slots have an image and valid
   recipient, the payer is valid, and configuration is valid. Revalidate at
   checkout even if the button appears enabled.
7. Review every gift with its recipient and text, plus the bundle price and
   payer. Charge the configured price exactly once. For the example configuration,
   four gifts cannot be purchased for a partial price, and the fifth does not
   cause five separate token charges.
8. Generate the forum order and insert it into `#main-reply`. Preserve a preexisting
   draft according to the agreed insertion rule, dispatch the bubbling `input`
   event, and focus the reply. If the reply field is missing, show a Russian error
   and retain the bundle. Clear the bundle only after successful insertion. The
   user still submits the forum reply themselves.

All inputs need visible labels, keyboard operation, focus styles, and useful
status text. Use a live status region for progress and errors. Preserve focus
while typing; do not rebuild the active textarea on every input event. If the
bundle editor uses a dialog, handle opening, closing, and focus return explicitly.
Use instance-specific IDs for inputs and popovers so gifts, the ordinary store,
and an open vault modal can coexist.

The checkout text has two audiences: the buyer reviewing what is being ordered
and staff applying the order to collections. It should contain:

- The number of gifts, bundle price, and payer; include the familiar
  `ждем подтверждения` qualifier when another main profile is paying.
- An itemized description associating each image with its exact recipient,
  message, and signature. Keep duplicates as separate entries.
- Collection-ready code grouped first by collection owner, then by exact
  recipient. Each recipient gets its own `[data-collection="gift"]` group or
  clearly labeled lines to append to an existing matching group.
- A total such as `[b]Итого списать:[/b] 1 [coin]` for the discussed bundle.

Do not put all gifts under the payer's collection. Two recipients sharing the
same main account belong on the same owner's collection page but in separate
recipient groups. Recipients with different main accounts require different
collection pages. No actual page edits occur during checkout. Preserve supported
forum wrapper conventions from the store post, and define how arbitrary text is
escaped in readable BBCode output as well as in serialized collection records.
Literal `[code]` and `[/code]` in a message must not break the generated order.

For `character-vault`, replace gift string splitting with the shared parser and
keep the current recipient grouping and filtering. New plain-text records and
legacy HTML records need distinct rendering paths. Use the validated image URL
and preserve optional signatures. The current popover IDs combine a normalized
profile name with an index that restarts for each collection group. When handling
multiple groups for the same recipient, generate IDs unique across the rendered
vault instance so new gifts do not point to another gift's popover. Keep that fix
limited to gift rendering. Existing icons, plashkas, coupons, balances, and
character selection behavior are outside this change.

Styling remains in `hehedges-backups`, following the store's existing asset
arrangement:

| Stylesheet                   | Responsibility                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `styles/style_cs.css`        | Existing theme variables, typography, buttons, form controls, and shared layout primitives.                       |
| `styles/store.css`           | Existing store catalog and cart.                                                                                  |
| New `styles/gifts.css`       | Gift catalog, bundle slots, selected/empty states, recipient fields, custom-image previews, review, and checkout. |
| `styles/character_vault.css` | Display of delivered gifts in collections.                                                                        |

Use a `.gift-shop` root and `.gift-shop__*` classes. The vault already has global
`.gift` rules, and the store uses `.store-*`; neither should style purchase slots
accidentally. Reuse theme colors, spacing, and base controls to match the forum.
Keep purchase rules scoped, including price and button spacing. The shared theme
currently contains some `.store`-specific adjacent-control margin resets, so a
new root may need its own scoped reset. Check dark and light theme appearance,
small-screen layout, long character names, empty slots, and long messages during
authorized visual review.

An identical profile-picker component can be extracted into `style_cs.css` only
after both consumers use an agreed shared markup contract. The first version can
keep its gift-specific layout in `gifts.css`; a new CSS framework or a generalized
commerce stylesheet is unnecessary. Follow the forum's stylesheet charset and
hosting conventions after confirming the actual file encoding. The source
`@charset "Windows-1251"` declaration alone does not establish its on-disk bytes.

Implement in the following milestones, after agreement on scope. Complete the
applicable validation and hand off each milestone for review before proceeding.

1. **Agree on contracts and implementation scope.** Review the default-decision
   table, package/file boundary, proposed catalog markup, record encoding, and
   order output. Confirm whether the next task includes both repositories.
   Record approval for the planned `@teh/utils` workspace dependencies: the gifts
   scaffold adds it automatically, and the store will need it to adopt the shared
   loader. No new external library is proposed. Obtain catalog content or agree
   on temporary example data. This milestone is preparatory and must not grow
   into the feature itself without implementation authorization.
2. **Extract shared data helpers and integrate the vault.** Implement the
   configurable character loader and gift record contract. Export and document
   both in `lib/utils`. Update the vault wrapper, shared character types, and gift
   rendering; replace only the store's duplicate character loader. Preserve
   existing gift records and ordinary store behavior. Run `make typecheck` and
   `make build` because this affects shared utilities and multiple packages. Run
   `make format` immediately before handoff, report the results, then wait for
   review.
3. **Build the gift catalog and bundle editor.** Run
   `make new-script NAME=gifts` after dependency approval. This command writes the
   scaffold and invokes `yarn install`; it is not a file-only operation. Implement
   the public API, source parsing, fixed slots, mixed image sources, recipients,
   payer, and completeness validation. Include a documented source example in
   the package README. The Makefile and typecheck configuration already discover
   script packages; do not add hardcoded package lists. Run `make typecheck` and
   `make gifts`, or `make build` if shared files changed. Run `make format` before
   handing off and wait for review.
4. **Complete checkout and staff output.** Implement review, bundle pricing,
   BBCode output, recipient/owner grouping, serialization, and reply insertion.
   Handle missing reply fields and incomplete orders without losing input.
   Document a mixed bundle example with recipients across different owners and
   show the collection markup it produces. Run `make typecheck` and `make gifts`,
   using `make build` instead if the record contract or other shared code changes.
   Run `make format` before handoff and wait for review.
5. **Add forum styling and post content.** Within the approved sibling-repository
   scope, create `styles/gifts.css` and the agreed post file. Add source catalog
   markup, instructions explaining complete mixed bundles, and the two asset
   references. Do not invent production asset URLs. Adjust shared CSS only for an
   explicitly adopted shared component. Update JavaScript markup if the styling
   requires it, with the corresponding typecheck/build commands. Update the root
   and package documentation for the final API, commands, configuration, and
   deployment order. Prepare the final review without publishing the topic or
   uploading assets automatically.

For the future implementation, these are the acceptance criteria for review.
They are not authorization to add or run extra checks during this planning task.

| Scenario                                         | Expected result                                                                                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Five catalog gifts                               | One complete bundle at the configured price.                                                                                                                |
| Five custom images                               | Same bundle rule and price.                                                                                                                                 |
| Three catalog gifts plus two custom images       | A valid five-gift bundle for one token under the example configuration.                                                                                     |
| Four selected images                             | Checkout remains unavailable with clear progress.                                                                                                           |
| Five images but one missing recipient            | Checkout remains unavailable and identifies the missing recipient.                                                                                          |
| Full bundle, another catalog click               | Requires an intentional slot replacement; nothing is silently overwritten.                                                                                  |
| Same image twice                                 | Two independent gifts retaining their own text and recipients.                                                                                              |
| Same recipient for several gifts                 | All entries preserved; no deduplication.                                                                                                                    |
| Alternate-profile recipient                      | Stored with that exact character key in the main account's collection.                                                                                      |
| Several recipient owners                         | Staff output separates destination owners and exact recipient groups.                                                                                       |
| Payer differs from the logged-in main profile    | Output requests confirmation; the interface does not represent payment as already approved.                                                                 |
| Invalid URL or unsupported protocol              | Slot cannot complete; the rest of the bundle remains intact.                                                                                                |
| Temporarily failed image preview                 | Visible feedback without deleting entered data; completion follows the agreed URL rule.                                                                     |
| Malformed catalog line or empty catalog          | Bad entries are skipped; custom gifts remain usable.                                                                                                        |
| Invalid bundle configuration                     | Clear error and no order generated.                                                                                                                         |
| Missing or failed character data                 | Useful status, settled request, preserved inputs, and a retry path.                                                                                         |
| Gifts and vault load character data concurrently | One coordinated load and usable data in both consumers.                                                                                                     |
| Loader tag already completed without data        | An explicit failure or retry path, never an unresolved wait for an old event.                                                                               |
| Reinitialization                                 | No duplicate UI, handlers, or checkout insertion.                                                                                                           |
| Missing reply field                              | Error and preserved bundle.                                                                                                                                 |
| Existing reply draft                             | Preserved according to the approved insertion rule.                                                                                                         |
| Successful checkout                              | One generated order, one total charge, bubbling input event, focused reply, and no automatic submission.                                                    |
| Special characters in text                       | Russian text, ampersands, quotes, angle brackets, pipe characters, percent signs, brackets, and newlines survive the full serialization/DOM/rendering path. |
| Legacy gift lines                                | Their existing image, HTML message/signature, and recipient behavior remain readable.                                                                       |
| Repeated recipient groups                        | Each gift popover targets its own gift, including when the vault is opened over the shop.                                                                   |
| Character filter and whole collection            | The same delivered gifts appear under the correct selections on direct pages and in the vault modal.                                                        |
| Store regression review                          | Main-profile choices, coupon payments, totals, and reply formatting retain their current behavior.                                                          |
| Theme and accessibility review                   | Small screens, both themes, keyboard focus, visible labels, and long content remain usable.                                                                 |

Apply each repository's `AGENTS.md` only within that repository and read any more
specific instructions before editing. Application source stays JavaScript with
ESM and strict JSDoc/checkJs. Generate markup through HTML template strings and
follow the repository's control-flow and formatting rules. Do not copy existing
element-by-element UI construction from the store merely because it is present.

For each milestone changing JavaScript, the required checks are `make typecheck`
and the appropriate build. Use `make build` for changes to shared utilities,
multiple packages, or build tooling; use `make gifts` for isolated gifts-package
changes. Do not rerun successful checks unless files affecting them changed.
Run no other checks unless the user explicitly requests them. The acceptance
table can guide an authorized browser review, but does not override that rule or
authorize a new testing dependency. Do not run `git diff --check`.

Documentation-only changes in `tehahtimeehScriptSet` require the final
`make format`, not a build or typecheck. The current formatting command covers
root Markdown plus JavaScript/JSON paths; nested package README files should
still be written in the established Markdown style. Run `make format` immediately
before each handoff; if files are edited afterward, run it again. Inspect its
effects and avoid including unrelated formatting changes or altering existing
user work. Changes limited to forum CSS/post content do not require the sibling
repository's Node CLI test suite. If its CLI is unexpectedly implicated, stop
expanding scope and review that change separately.

Build artifacts are regenerated in the script repository. Do not hand-edit
`dist/`, synchronize files between repositories without authorization, run a
backup, write to live collection pages, create a topic, upload forum assets,
commit, or push merely to complete this plan. When publication is later requested,
prepare the concrete artifacts first. If the marked gift format is adopted,
publish the compatible vault reader before enabling orders that generate the new
format. Coordinate cache-busting URLs through the existing vault asset loader
configuration when that deployment is in scope.

The next agent's milestone handoff should identify the files changed in each
repository, the resulting user behavior, required validation commands and
results, remaining decisions or unavailable deployment inputs, and the next
milestone awaiting review. Preserve the distinction between a reply prepared by
the browser, an order posted by the user, and gifts actually delivered by staff.

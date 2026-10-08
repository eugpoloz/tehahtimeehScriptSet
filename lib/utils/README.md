# @teh/utils

Shared browser utilities for the forum script workspace.

## Profile pickers

`getProfilePickerMarkup({ id, label, key?, value?, status?, disabled?, hideLabel? })`
renders the shared `.picker` fieldset, trigger, and popover. Use a unique `id`
prefix and wrap adjacent pickers in `.pickers` for the responsive grid.

`getProfilePickerOptionsMarkup(profiles, name, selected?)` renders radio choices
with a unique group `name`. Consumers populate `[data-profile-picker-options]`,
handle `[data-profile-picker-option]` changes, update `[data-profile-picker-value]`,
and close the popover. `[data-profile-picker]` exposes the consumer `key`.
The store and shared character form use these helpers; styles live in
`hehedges-backups/styles/style_cs.css`.

## Character config

`loadCharacters(url?)` returns `window.characters`, shares concurrent loads and
allows retry after failure. Core exposes it as `teh.loadCharacters()`; see
[forum setup](../../README.md#forum-setup) for the URL and encoding requirements.

## Image URLs

| Helper                                             | Result                                                     |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `getImageUrl(value)`                               | Trimmed absolute or protocol-relative HTTP(S) URL, or `""` |
| `getProxiedImageUrl(value, proxy = IMAGE_PROXY)`   | Validated proxy URL; skips already proxied URLs            |
| `getUnproxiedImageUrl(value, proxy = IMAGE_PROXY)` | Original URL from encoded or legacy proxy URLs             |

`IMAGE_PROXY` is the DuckDuckGo image proxy prefix. Escape URLs before inserting
them into HTML.

# @teh/utils

Shared browser utilities for the forum script workspace.

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

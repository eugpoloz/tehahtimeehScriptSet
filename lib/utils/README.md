# @teh/utils

Shared browser utilities for the forum script workspace.

## Character config

`loadCharacters()` loads the asset at `window.teh.charactersConfigUrl` and returns the same
object as `window.characters`. Pass the URL once when starting the load in the
forum header; later calls need no arguments. It reuses loaded data,
shares pending requests and permits retry after failure. JavaScript and JSON
assets use Windows-1251. Core exposes the loader through `teh`. The header stores
the returned promise as `teh.charactersPromise`; the loader records the supplied
URL as `teh.charactersConfigUrl`.

## Image URLs

`getImageUrl(value)` returns a trimmed absolute or protocol-relative HTTP(S) URL,
or `""`. Escape it before inserting into HTML.

`getProxiedImageUrl(value, proxy = IMAGE_PROXY)` validates and proxies a URL,
skipping URLs already using that prefix.

`getUnproxiedImageUrl(value, proxy = IMAGE_PROXY)` extracts the original URL from
encoded or legacy proxy URLs.

`IMAGE_PROXY` is the DuckDuckGo image proxy prefix.

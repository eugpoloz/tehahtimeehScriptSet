# @teh/utils

Shared browser utilities for the forum script workspace.

## Image URLs

`getImageUrl(value)` returns a trimmed absolute or protocol-relative HTTP(S) URL,
or `""`. Escape it before inserting into HTML.

`getProxiedImageUrl(value, proxy = IMAGE_PROXY)` validates and proxies a URL,
skipping URLs already using that prefix.

`getUnproxiedImageUrl(value, proxy = IMAGE_PROXY)` extracts the original URL from
encoded or legacy proxy URLs.

`IMAGE_PROXY` is the DuckDuckGo image proxy prefix.

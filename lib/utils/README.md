# @teh/utils

Shared browser utilities for the forum script workspace.

## Image URLs

`getProxiedImageUrl(value, proxy = IMAGE_PROXY)` accepts an absolute or
protocol-relative HTTP(S) image URL and returns it through `proxy`. It returns
an empty string for blank, relative, or unsupported URLs. URLs already routed
through the configured proxy are returned without a second proxy layer.

`getUnproxiedImageUrl(value, proxy = IMAGE_PROXY)` reverses that transformation
for editable values. It decodes current encoded proxy URLs, preserves legacy
raw proxy tails, and returns URLs outside the configured proxy unchanged.

`IMAGE_PROXY` is the default DuckDuckGo image proxy prefix. Pass an alternate
prefix as the optional second argument when a feature has its own proxy.

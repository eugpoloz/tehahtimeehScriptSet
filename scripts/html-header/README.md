# @teh/html-header

Header setup for Rusff features, the editor, and visual controls.

The bundle disables unused `RusffCore` features when loaded after
`RusffCore` becomes available.

## Site content

```js
const content = await teh.loadSiteContent("/path/to/content.json");
```

The URL must be a non-empty string. The JSON request is made with high
priority and resolves only for a non-null object (arrays are rejected). Requests
and successful results are memoized by URL, so repeated calls share the same
Promise. Rejected requests are removed from the cache and can be retried.

## Editor

Call after `FORUM.editor` is available:

```js
teh.configureEditor();
```

This installs the configured fonts and custom tags. Pass `{ fonts, tags }` to
replace either default for a call.

## Visuals

```js
teh.changeVisuals();
```

This inserts a settings button into `#pun-navlinks ul` and restores saved
settings. The button toggles a light-dismiss popover with font-size controls
and an animated light/dark toggle with a separate system-theme checkbox. The
preference is stored in `userTheme`. While the system preference is selected,
the light/dark toggle displays the resolved theme and is disabled. The
document root receives
`data-theme-preference` with that preference and `data-theme` with the resolved
`light` or `dark` theme. Changes to the system theme are followed while the
system preference is selected.

When the document is still loading, the saved theme and font-size CSS variable
are restored immediately while control insertion and event setup wait for
`DOMContentLoaded`.

Font sizing requires `#pun`.

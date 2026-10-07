# @teh/html-header

Header setup for Rusff features, the editor, and visual controls.

The bundle disables unused `RusffCore` features when loaded after
`RusffCore` becomes available.

## Site content

```js
const content = await teh.loadSiteContent("/path/to/content.json");
```

Returns a JSON object. Loads are cached by URL; failed requests can be retried.

## Editor

Call after `FORUM.editor` is available:

```js
teh.configureEditor();
```

Installs fonts and custom tags. Pass `{ fonts, tags }` to override the defaults.

## Visuals

```js
teh.changeVisuals();
```

Adds font-size and theme controls to `#pun-navlinks ul` and restores saved
settings. Font sizing requires `#pun`. Theme choices are light, dark, or system;
the document root's `data-theme` exposes the resolved `light` or `dark` theme.

Icon attribution: [LICENSE](../../LICENSE).

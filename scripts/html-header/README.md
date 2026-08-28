# @teh/html-header

Header setup for Rusff features, the editor, and visual controls.

The bundle disables unused `RusffCore` features when loaded after
`RusffCore` becomes available.

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
and a group reserved for light, dark, and system theme controls. When the
document is still loading, the saved font-size CSS variable is restored
immediately while control insertion and event setup wait for `DOMContentLoaded`.

Font sizing requires `#pun`.

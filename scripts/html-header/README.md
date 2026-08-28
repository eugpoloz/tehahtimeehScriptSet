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

This inserts the current visual controls beside the calling script (or at the
end of `body`) and restores saved settings. Theme controls can be added to this
module once their structure and behavior are defined.

Font sizing requires `#pun`.
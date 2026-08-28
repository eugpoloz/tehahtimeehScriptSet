# @teh/html-header

Load `@teh/core` before this package.

## Rusff core settings

Load the bundle in the HTML header after `RusffCore` becomes available. It
immediately disables the unused report button, smile pack, awards, attachments,
sharing, tags, and graffiti platform features.

## Editor settings

Call the editor initializer after `FORUM.editor` becomes available:

```js
teh.configureEditor();
```

It adds the custom font list and the subject, hidden-profile, and restore-post
editor tags from `src/config/editor.js`. Either part can be replaced for a
particular call:

```js
teh.configureEditor({
  fonts: ["Inter", "Oswald"],
  tags: {
    subject: {
      name: "Название темы",
      onclick() {
        insert("[subject]");
      }
    }
  }
});
```

## Visual controls

Call the initializer where the theme and font-size controls should be inserted:

```js
teh.changeVisuals();
```

The controls are inserted next to the calling script, or at the end of the
document body when called later. The initializer restores the saved theme and
font size and connects the controls. Theme preference is stored as `light`,
`dark`, or `system`; the document root receives `data-theme-preference` with
that value and `data-theme` with the resolved `light` or `dark` value for CSS.
System theme changes are followed while the `system` preference is active.

Font-size controls remain inactive when the current page does not provide
`#pun` and its dynamic size limits. The existing `teh.changeFontSize()` name is
retained as a compatibility alias for `teh.changeVisuals()`.

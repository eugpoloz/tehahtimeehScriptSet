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

## Style controls

Call the initializer where the font-size controls should be inserted:

```js
teh.changeFontSize();
```

The controls are inserted next to the calling script, or at the end of the
document body when called later. The initializer restores the saved size
immediately and connects the controls; post content is looked up only when a
control is used, so initialization is safe from the HTML header. The control
labels use accessible hint popovers instead of native `title` tooltips.

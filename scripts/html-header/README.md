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

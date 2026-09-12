# Admin actions

Build with `make admin-actions`. Load `dist/teh.core.iife.js` before
`dist/teh.admin-actions.iife.js`.

Initialize after the topic DOM is ready:

```js
teh.acceptNewFullCharacter({
  configUrl: "//forumstatic.ru/files/001c/ab/7e/10010.js",
  stylesUrl: "//forumstatic.ru/files/path/to/config-form.css",
  forumId: 10
});
```

The button is added to `#topic-modmenu` for users in group 1 on the configured
forum. The initializer does not run automatically. The config script and
stylesheet are loaded from the supplied URLs.

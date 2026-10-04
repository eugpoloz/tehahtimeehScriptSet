# Admin actions

Build with `make admin-actions`. Load `dist/teh.core.iife.js` before
`dist/teh.admin-actions.iife.js`.

Initialize after the topic DOM is ready:

```js
teh.acceptNewFullCharacter({
  stylesUrl: "//forumstatic.ru/files/path/to/config-form.css",
  forumId: 10
});
```

The button is added to `#topic-modmenu` for users in group 1 on the configured
forum after character loading succeeds. The initializer does not run
automatically. Core supplies character data through `teh.loadCharacters()`;
the forum header configures its URL. Only the stylesheet URL is passed here.

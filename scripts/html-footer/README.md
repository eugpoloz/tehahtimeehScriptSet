# @teh/html-footer

Load `@teh/core` before this package.

## Title popovers

`teh.addTitlePopovers()` replaces native `title` tooltips with accessible
popovers. It accepts a selector, a configuration object, or an array containing
either:

```js
teh.addTitlePopovers([
  ".post-content abbr[title]",
  {
    selector: ".post-content img[title]",
    insertPosition: "afterend"
  }
]);
```

Calling it without arguments processes every `[title]` element.

`insertPosition` accepts `beforebegin`, `afterbegin`, `beforeend`, or
`afterend`. By default, popovers are inserted inside their subjects with
`beforeend`; void elements such as `img` and `input` use `afterend`.

When selectors overlap, the first matching configuration wins. The feature
expects the shared `[interestfor]` tooltip styles to be present.

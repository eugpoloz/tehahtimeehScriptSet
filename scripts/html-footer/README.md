# @teh/html-footer

Load `@teh/core` before this package.

## Post HTML

`teh.renderPostHtml({ userIds, groupIds })` replaces marked code boxes in posts
by allowed authors with their interpreted HTML. Both allowlists are empty by
default, which disables the feature. IDs may be strings or numbers and are
matched against the post's `data-user-id` and `data-group-id` attributes.

```js
teh.renderPostHtml({ userIds: [3], groupIds: [1] });
```

The code block must begin with the exact marker:

```text
[code]<!-- HTML -->
<section>Rendered as HTML</section>
[/code]
```

Marked code blocks inside quotes are ignored. Scripts in authorized blocks
execute when the parsed fragment is inserted. Only grant access to fully
trusted users or groups because this permits arbitrary JavaScript on the forum
origin.

The same allowlists apply to AJAX previews. When the current `UserID` or
`GroupID` is allowed, marked code blocks under `#post-preview` are rendered
again after every `pun_preview` event.

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

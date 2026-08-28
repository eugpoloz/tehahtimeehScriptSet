# @teh/html-footer

Footer features for trusted post HTML and accessible title popovers.

## Post HTML

```js
teh.renderPostHtml({ userIds: [3], groupIds: [1] });
```

This renders marked code blocks from allowed authors, including AJAX previews:

```text
[code]<!-- HTML -->
<section>Rendered as HTML</section>
[/code]
```

Both allowlists default to empty. Quoted blocks are ignored. Rendered scripts
execute on the forum origin, so only allow fully trusted users and groups.

## Title popovers

```js
teh.addTitlePopovers([
  ".post-content abbr[title]",
  {
    selector: ".post-content img[title]",
    insertPosition: "afterend"
  }
]);
```

With no arguments, it handles every `[title]` element. `insertPosition` accepts
the standard `insertAdjacentHTML` positions and defaults to `beforeend`
(`afterend` for void elements). The first matching configuration wins.

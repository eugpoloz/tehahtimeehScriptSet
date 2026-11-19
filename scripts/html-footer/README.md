# @teh/html-footer

The footer can display HTML in posts, show tooltips, and retry images that fail to load.

## Post HTML

Choose which forum groups can use HTML in their posts:

```js
teh.renderPostHtml({ fullAccessGroupId: [1], scopedAccessGroupId: [5] });
```

Set `workerUrl` to the uploaded `teh.post-worker.js` file. It includes SES and loads only when a scoped post runs JavaScript.

- **Full** access lets scripts run directly on the forum page. Give it only to trusted groups.
- **Scoped** access lets authors use forum classes, style their post, and generate HTML with JavaScript. Their scripts run separately from the forum page.

If a group appears in both lists, full access wins. Previews use the post author's group, even when a moderator edits the post. Quoted blocks and posts from other groups stay as code.

Start a code block with `<!-- HTML -->`. For a layout with editable data, put the JSON first. Here, changing `105` changes which episode the link opens.

```text
[code]<!-- HTML -->
<script type="application/json">{ "topic": 105 }</script>
<script>
  {
    const { data, render } = teh.post();
    render(`<a href="/viewtopic.php?id=${Number(data.topic)}">Эпизод</a>`);
  }
</script>
[/code]
```

`data` reads the first JSON block. Use `dataBlocks` for all of them in order. `render(html)` inserts HTML where the script appears. If scoped rendering fails, readers see the original code and an error message.

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

## Image proxy fallback

Load `core`, then `html-footer`, and call:

```js
teh.proxyImages();
```

Retries failed HTML images through DuckDuckGo, once per URL per image.
An optional argument sets the proxy prefix: `teh.proxyImages("https://proxy.example/?url=")`.
Repeated calls keep the first configuration.

Loaded placeholders, CSS backgrounds, iframe contents, and shadow roots are excluded.

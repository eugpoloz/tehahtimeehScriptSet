# @teh/hehedges-specials

Forum-specific features for hehedges.rusff.me.

## Random quote

Add an empty target container to the page:

```html
<section class="hehe-quote" data-random-quote></section>
```

Initialize `teh.siteContentPromise` before loading the `hehedges-specials`
bundle, then render a random quote:

```js
teh.siteContentPromise = teh.loadSiteContent("/path/to/site-content.json");
teh.loadRandomQuote();
```

The rendered author links to the original post in a new tab.

The default target is `[data-random-quote]`, so its classes can change without
updating the script. A different selector can still be provided for a call:

```js
teh.loadRandomQuote({
  target: ".custom-quote"
});
```

The `@teh/html-header` bundle must load first because it provides
`teh.loadSiteContent()`.

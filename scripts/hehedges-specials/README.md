# @teh/hehedges-specials

Forum-specific features for hehedges.rusff.me.

## Post components

The bundle registers three light-DOM elements for profile assets and coupon
representations. They use the forum's existing global profile and coupon
styles, so do not use a Shadow DOM.

```html
<profile-icon src="https://example.com/icon.gif"></profile-icon>

<profile-icon>https://example.com/icon.gif</profile-icon>

<profile-plashka class="justify-end" src="https://example.com/plashka.png">
  <strong>Текст плашки</strong><br>
  <a href="/viewtopic.php?id=1">Подробнее</a>
</profile-plashka>

<coupon-card>
  Бесплатная плашка | 3 | reusable
</coupon-card>
```

`profile-icon` accepts a URL through `src` or text content. `profile-plashka`
uses `src` and preserves child markup. Both load absolute or protocol-relative
HTTP(S) URLs lazily. Use `justify-start` or `justify-end` to align plashka text;
the default is centered.

`coupon-card` preserves rich child markup and recognizes trailing plain-text
metadata: `| N`, `| reusable`, or `| N | reusable`. It only represents a coupon
in a post and does not modify a character's collection.

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

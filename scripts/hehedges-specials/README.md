# @teh/hehedges-specials

Forum-specific features for hehedges.rusff.me.

## Post components

The bundle registers profile and coupon elements using the forum's styles:

```html
<profile-icon src="https://example.com/icon.gif"></profile-icon>

<profile-plashka class="justify-end" src="https://example.com/plashka.png">
  <strong>Текст плашки</strong><br />
  <a href="/viewtopic.php?id=1">Подробнее</a>
</profile-plashka>

<coupon-card> Бесплатная плашка | 3 | reusable </coupon-card>
```

`profile-icon` accepts a URL through `src` or text content. `profile-plashka`
uses `src` and preserves child markup. Both accept absolute or protocol-relative
HTTP(S) URLs. Plashka text is centered; use `justify-start` or `justify-end` to align it.

`coupon-card` preserves rich markup and accepts trailing `| N`, `| reusable`, or
`| N | reusable`. It displays a coupon without changing the character's collection.

## Random quote

Load `html-header` first, then add a target:

```html
<section class="hehe-quote" data-random-quote></section>
```

Initialize site content before loading this bundle, then render a quote:

```js
teh.siteContentPromise = teh.loadSiteContent("/path/to/site-content.json");
teh.loadRandomQuote();
```

The author links to the original post. Override the target with
`teh.loadRandomQuote({ target: ".custom-quote" })`.

## Friend banners

Add `<section data-friends-target></section>`, initialize site content as above,
then call `teh.loadFriendsBanners()`. Banner entries use `href`, `src`, and required
`text` for the link name and tooltip. Override the target with
`{ target: ".custom-banners" }`.

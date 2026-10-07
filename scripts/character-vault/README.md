# @teh/character-vault

Renders character collections from `[data-collection]` elements.

```js
teh.characterVault(document.querySelector(".main.pages"));
```

The root defaults to the first `.main.pages`. Load core and configure
[character loading](../../README.md#forum-setup) first.
`teh.describeCharacter(character)` formats a species/status label.

On hehedges, load `hehedges-specials` first for its profile and coupon components,
then use its asset loader:

```js
teh.loadCharacterVault({
  scriptUrl: "//forumstatic.ru/files/001c/ab/7e/61137.js?v=2",
  stylesUrl: "//forumstatic.ru/files/001c/ab/7e/37167.css?v=2"
});
```

Mark direct vault pages with `[data-character-vault-page]`; the loader handles
assets and initialization.

Coupons use one nonempty line per item, with optional quantity and reusable status:

```text
<div data-collection="coupon">
  Купон на скидку
  Купон на скидку | 3
  Многоразовый купон | reusable
  Многоразовый купон | 3 | reusable
</div>
```

Quantity defaults to `1` and must be a positive integer. Unrecognized trailing
content remains part of the coupon text.

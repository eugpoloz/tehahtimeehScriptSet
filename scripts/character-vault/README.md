# @teh/character-vault

Renders character collections from `[data-collection]` elements.

```js
teh.characterVault(document.querySelector(".main.pages"));
```

The root is optional and defaults to the first `.main.pages`. Initialization is
explicit: direct pages and modal loaders call it after loading the script.

## API

- `teh.characterVault(root)`: initialize the vault
- `teh.loadCharacters()`: load and return `window.characters`
- `teh.describeCharacter(character)`: format a species/status label

On hehedges, load assets through `hehedges-specials`:

```js
teh.loadCharacterVault({
  scriptUrl: "//forumstatic.ru/files/001c/ab/7e/61137.js?v=2",
  stylesUrl: "//forumstatic.ru/files/001c/ab/7e/37167.css?v=2"
});
```

Mark direct vault pages with `[data-character-vault-page]`. Page markup should
not load the vault assets or call the initializer itself.

Coupons are defined as one nonempty line in a `[data-collection="coupon"]`
element. Existing single-field coupon lines remain valid. Optional trailing
metadata supports quantity and reusable status:

```html
<div data-collection="coupon">
  Купон на скидку
  Купон на скидку | 3
  Купон без расходования | reusable
  Купон без расходования | 3 | reusable
</div>
```

Quantity defaults to `1` and must be a positive integer. The `reusable` state
marks a coupon as reusable; unrecognized trailing content remains part of the
coupon text.

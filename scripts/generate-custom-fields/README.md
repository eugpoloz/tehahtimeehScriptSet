# @teh/generate-custom-fields

Editor for structured HTML stored in a profile field.

```js
teh.generateCustomFields();
```

## Options

- `fldId`: field that stores generated HTML
- `collectionFldId`: field containing a collection page URL or link
- `config`: editor sections and inputs
- `outputMode`: use `"multi"` for regular sections or `"single"` for one masked input without a section wrapper
- `valueAttribute`: attribute read from the masked element in `"single"` mode; defaults to `data-href`
- `proxy`: image URL prefix
- `userAccessGroups`: additional allowed group IDs
- `debug`: diagnostic logging

Inputs support `img`, `text`, and `className`. Set `collection: true` on an image
input to add choices from `[data-collection="<input name>"]` on the collection
page.

Sections may set `component` to `profile-icon`, `profile-plashka`, or
`coupon-card`. Their saved markup, option thumbnails, and live previews use
that element, so `hehedges-specials` must already be loaded. Component sections
ignore individual input `mask` functions. `profile-plashka` keeps alignment on
its `justify-start`/`justify-end` class and sanitizes text content to
text-oriented markup; images and executable markup are excluded. `coupon-card`
preserves rich text and parses any trailing quantity/reusable metadata itself.

```js
teh.generateCustomFields({
  fldId: "3",
  config: [
    {
      name: "plashka",
      component: "profile-plashka",
      userAccess: true,
      inputs: [
        {
          label: "Плашка",
          name: "plashka",
          type: "img",
          collection: true,
          options: [{ value: "" }, { value: "https://example.com/badge.png" }]
        },
        {
          label: "Текст плашки",
          name: "plashka-text",
          type: "text",
          maxlength: "100"
        },
        {
          label: "Расположение текста",
          name: "justify",
          type: "className",
          options: [
            {
              label: "Слева",
              value: "justify-start"
            },
            {
              label: "По центру",
              value: ""
            },
            {
              label: "Справа",
              value: "justify-end"
            }
          ],
          strict: true
        }
      ]
    }
  ]
});
```

For a single masked field, add this section to the config:

```js
{
  name: "vault",
  userAccess: true,
  inputs: [{
    label: "Коллекция",
    name: "vault",
    type: "text",
    mask: (value) =>
      `<button type="button" class="vault" data-href="${value}">Коллекция</button>`
  }]
}
```

Use it with `outputMode: "single"` and `fldId: "5"`. The default
`valueAttribute: "data-href"` restores the typed value automatically. The
stored value for `laurent_ambrose` is:

```html
<button type="button" class="vault" data-href="laurent_ambrose">Коллекция</button>
```

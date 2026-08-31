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

```js
teh.generateCustomFields({
  fldId: "3",
  config: [
    {
      name: "badge",
      userAccess: true,
      inputs: [
        {
          label: "Плашка",
          name: "badge",
          type: "img",
          collection: true,
          mask: (src) => `<img src="${src}" alt="Кастомная плашка" />`,
          options: [{ value: "" }, { value: "https://example.com/badge.png" }]
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

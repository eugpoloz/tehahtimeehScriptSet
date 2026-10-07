# @teh/generate-custom-fields

Editor for structured HTML stored in a profile field.

```js
teh.generateCustomFields();
```

Styles use `teh-flds*` classes in `hehedges-backups/styles/style_cs.css`.
Update the bundle and its editor styles together.

## Options

| Option             | Purpose                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| `fldId`            | Field storing generated HTML                                                      |
| `collectionFldId`  | Field containing a collection page URL or link                                    |
| `config`           | Sections and inputs                                                               |
| `outputMode`       | `"multi"` for sections; `"single"` for one masked input without a section wrapper |
| `valueAttribute`   | Attribute restoring the single input's value; defaults to `data-href`             |
| `proxy`            | Image URL prefix                                                                  |
| `userAccessGroups` | Additional allowed group IDs                                                      |
| `debug`            | Diagnostic logging                                                                |

Inputs support `img`, `text`, and `className`. Image inputs with `collection: true`
get choices from `[data-collection="<input name>"]` on the collection page.

Load `hehedges-specials` before using `profile-icon`, `profile-plashka`, or
`coupon-card` as a section's `component`. Components replace input `mask`
functions. Plashka text allows text formatting but excludes images and scripts.

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
        }
      ]
    }
  ]
});
```

For a single masked field:

```js
teh.generateCustomFields({
  fldId: "5",
  outputMode: "single",
  config: [
    {
      name: "vault",
      userAccess: true,
      inputs: [
        {
          label: "Коллекция",
          name: "vault",
          type: "text",
          mask: (value) =>
            `<button type="button" class="vault" data-href="${value}">Коллекция</button>`
        }
      ]
    }
  ]
});
```

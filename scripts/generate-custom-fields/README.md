# @teh/generate-custom-fields

Editor for structured HTML stored in a profile field.

```js
teh.generateCustomFields();
```

## Options

- `fldId`: field that stores generated HTML
- `collectionFldId`: field containing a collection page URL or link
- `config`: editor sections and inputs
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

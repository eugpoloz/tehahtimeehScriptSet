# @teh/generate-custom-fields

Builds an editor for structured HTML stored in a profile custom field. The editor supports image choices, free-text values, class-name choices, previews, per-section access control, and additional image options loaded from a personal page.

## Usage

Load `@teh/core` before `teh.generate-custom-fields.iife.js`, then call:

```js
teh.generateCustomFields();
```

The defaults edit `form[fld1]`, read the collection page reference from `form[fld5]`, and allow character groups `5` and `7` in addition to administrators and moderators.

Every option can be overridden:

```js
teh.generateCustomFields({
  fldId: "3",
  collectionFldId: "5",
  config: [/* custom field sections */]
});
```

## Configuration

- `fldId`: profile field that stores the generated HTML.
- `collectionFldId`: profile field containing a character collection page URL or an `<a href="…">` value.
- `config`: sections and inputs rendered by the editor.
- `proxy`: prefix applied to image URLs in previews and saved HTML.
- `userAccessGroups`: additional group IDs allowed to use the editor.
- `debug`: enables diagnostic logging.

Each section has a `name`, a `userAccess` flag, and an `inputs` array. Supported input types are `img`, `text`, and `className`. Set `collection: true` on an image input to merge options from a matching `[data-collection="<input name>"]` element on the personal page.

## Complete example

```js
teh.generateCustomFields({
  fldId: "1",
  collectionFldId: "5", // form[fld5] = URL or <a class="treasury" href="/pages/…">
  proxy: "https://external-content.duckduckgo.com/iu/?u=",
  userAccessGroups: [5, 7], // Персонажи, Персонажи в архиве
  debug: true,
  config: [
    {
      name: "icon",
      userAccess: true,
      inputs: [
        {
          label: "Иконка",
          name: "icon",
          type: "img",
          collection: true, // → [data-collection="icon"] on the personal page
          mask: (src) => `<i><img src="${src}" alt="Кастомная иконка" /></i>`,
          options: [
            {
              label: "<i class='material-symbols-sharp'>close</i>",
              value: ""
            },
            { value: "https://cdn.imgchest.com/files/7b7d928ec1eb.png" },
            { value: "https://cdn.imgchest.com/files/5bf991bab422.png" }
          ]
        }
      ]
    },
    {
      name: "plashka",
      userAccess: true,
      inputs: [
        {
          label: "Плашка",
          name: "plashka",
          type: "img",
          collection: true, // → [data-collection="plashka"]
          mask: (src) => `<img src="${src}" alt="Кастомная плашка" />`,
          options: [
            {
              label: "<i class='material-symbols-sharp'>close</i>",
              value: ""
            },
            { value: "https://cdn.imgchest.com/files/c37f246a483c.png" },
            { value: "https://cdn.imgchest.com/files/dd7a83b76718.png" }
          ]
        },
        {
          label: "Текст плашки",
          name: "plashka-txt",
          type: "text",
          maxlength: "50",
          mask: (text) => `<p>${text}</p>`
        },
        {
          label: "Расположение текста плашки",
          name: "justify",
          type: "className",
          strict: true,
          options: [
            { label: "Слева", value: "justify-start" },
            { label: "По центру", value: "" },
            { label: "Справа", value: "justify-end" }
          ]
        }
      ]
    },
    {
      name: "admin",
      userAccess: false,
      inputs: [
        {
          label: "Дополнительный статус АМС",
          name: "admin",
          type: "text",
          maxlength: "38",
          mask: (text) => `<p>${text}</p>`
        }
      ]
    }
  ]
});
```

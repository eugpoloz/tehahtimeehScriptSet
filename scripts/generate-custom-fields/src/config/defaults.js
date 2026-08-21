/**
 * @typedef {import("../types.js").CustomFieldSection} CustomFieldSection
 * @typedef {import("../types.js").GenerateCustomFieldsOptions} GenerateCustomFieldsOptions
 */

/** @type {CustomFieldSection[]} */
const fieldConfig = [
  {
    name: "icon", // [data-custom-fld="${name}"]
    inputs: [
      {
        label: "Иконка",
        name: "icon",
        type: "img",
        mask: (src) => `<i><img src="${src}" alt="Кастомная иконка" /></i>`,
        options: [
          {
            label: "<i class='material-symbols-sharp'>close</i>",
            value: ""
          },
          {
            value: "https://cdn.imgchest.com/files/7b7d928ec1eb.png"
          },
          {
            value: "https://cdn.imgchest.com/files/5bf991bab422.png"
          }
        ],
        collection: true
      }
    ],
    userAccess: true
  },
  {
    name: "plashka",
    inputs: [
      {
        label: "Плашка",
        name: "plashka",
        type: "img",
        mask: (src) => `<img src="${src}" alt="Кастомная плашка" />`,
        options: [
          {
            label: "<i class='material-symbols-sharp'>close</i>",
            value: ""
          },
          {
            value: "https://cdn.imgchest.com/files/c37f246a483c.png"
          },
          {
            value: "https://cdn.imgchest.com/files/dd7a83b76718.png"
          }
        ],
        collection: true
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
    ],
    userAccess: true
  },
  {
    name: "admin",
    inputs: [
      {
        label: "Дополнительный статус АМС",
        name: "admin",
        type: "text",
        maxlength: "38",
        mask: (text) => `<p>${text}</p>`
      }
    ],
    userAccess: false
  }
];

/** @type {GenerateCustomFieldsOptions} */
const defaultOptions = {
  fldId: "1",
  collectionFldId: "5",
  config: fieldConfig,
  proxy: "https://external-content.duckduckgo.com/iu/?u=",
  // Персонажи, Персонажи в архиве
  userAccessGroups: [5, 7],
  debug: true
};

export default defaultOptions;

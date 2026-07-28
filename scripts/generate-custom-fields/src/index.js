"use strict";

import generateCustomFieldsFeature from "./features/generateCustomFields";

/**
 * @typedef {import("./features/generateCustomFields.js").CustomFieldOption} CustomFieldOption
 * @typedef {import("./features/generateCustomFields.js").CustomFieldInput} CustomFieldInput
 * @typedef {import("./features/generateCustomFields.js").CustomFieldSection} CustomFieldSection
 * @typedef {import("./features/generateCustomFields.js").GenerateCustomFieldsOptions} GenerateCustomFieldsOptions
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

/**
 * @param {Partial<GenerateCustomFieldsOptions>} [options]
 * @returns {Promise<void>}
 */
const generateCustomFields = (options = {}) =>
  generateCustomFieldsFeature({
    ...defaultOptions,
    ...options
  });

export default generateCustomFields;

// possible config for reference:
//
// teh.generateCustomFields(); // defaults → form[fld1]
//
// teh.generateCustomFields({
//   fldId: "3",
//   collectionFldId: "5",
//   config: [/* another field’s sections */]
// });
//
// teh.generateCustomFields({
//   fldId: "1",
//   collectionFldId: "5", // form[fld5] = URL or <a class="treasury" href="/pages/…">
//   proxy: "https://external-content.duckduckgo.com/iu/?u=",
//   userAccessGroups: [5, 7], // Персонажи, Персонажи в архиве
//   debug: true,
//   config: [
//     {
//       name: "icon",
//       userAccess: true,
//       inputs: [
//         {
//           label: "Иконка",
//           name: "icon",
//           type: "img",
//           collection: true, // → [data-collection="icon"] on the personal page
//           mask: (src) => `<i><img src="${src}" alt="Кастомная иконка" /></i>`,
//           options: [
//             {
//               label: "<i class='material-symbols-sharp'>close</i>",
//               value: ""
//             },
//             { value: "https://cdn.imgchest.com/files/7b7d928ec1eb.png" },
//             { value: "https://cdn.imgchest.com/files/5bf991bab422.png" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "plashka",
//       userAccess: true,
//       inputs: [
//         {
//           label: "Плашка",
//           name: "plashka",
//           type: "img",
//           collection: true, // → [data-collection="plashka"]
//           mask: (src) => `<img src="${src}" alt="Кастомная плашка" />`,
//           options: [
//             {
//               label: "<i class='material-symbols-sharp'>close</i>",
//               value: ""
//             },
//             { value: "https://cdn.imgchest.com/files/c37f246a483c.png" },
//             { value: "https://cdn.imgchest.com/files/dd7a83b76718.png" }
//           ]
//         },
//         {
//           label: "Текст плашки",
//           name: "plashka-txt",
//           type: "text",
//           maxlength: "50",
//           mask: (text) => `<p>${text}</p>`
//         },
//         {
//           label: "Расположение текста плашки",
//           name: "justify",
//           type: "className",
//           strict: true,
//           options: [
//             { label: "Слева", value: "justify-start" },
//             { label: "По центру", value: "" },
//             { label: "Справа", value: "justify-end" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "admin",
//       userAccess: false,
//       inputs: [
//         {
//           label: "Дополнительный статус АМС",
//           name: "admin",
//           type: "text",
//           maxlength: "38",
//           mask: (text) => `<p>${text}</p>`
//         }
//       ]
//     }
//   ]
// });

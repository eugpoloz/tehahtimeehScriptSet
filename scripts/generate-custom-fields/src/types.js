/**
 * @typedef {object} CustomFieldOption
 * @property {string} [label] Visible label HTML (used when value is empty or for non-img types).
 * @property {string} [value] Stored value (image URL for `img`, class name for `className`, etc.).
 */

/**
 * @typedef {"img" | "text" | "className"} CustomFieldInputType
 */

/**
 * @typedef {object} CustomFieldInput
 * @property {string} label Field label shown in the editor UI.
 * @property {string} name Input name; also used as `data-collection` when `collection` is `true`.
 * @property {CustomFieldInputType} type How the value is read/written into the custom field HTML.
 * @property {(value: string) => string} [mask] Wraps the value for preview / saved HTML.
 * @property {CustomFieldOption[]} [options] Built-in radio options (defaults before collection merge).
 * @property {boolean | string} [collection] Load extra options from `[data-collection]` on the personal page. `true` uses `name`; a string sets the collection key explicitly.
 * @property {string} [maxlength] Max length for free-text inputs.
 * @property {boolean} [strict] When true, hide the free-text input even for AMS (options only).
 */

/**
 * @typedef {object} CustomFieldSection
 * @property {string} name Section key written as `[data-custom-fld="${name}"]`.
 * @property {CustomFieldInput[]} inputs Controls rendered for this section.
 * @property {boolean} userAccess Whether non-admin character groups may edit this section.
 */

/**
 * @typedef {object} GenerateCustomFieldsOptions
 * @property {string} fldId Profile field that stores the generated custom-field HTML.
 * @property {string} collectionFldId Profile field with the personal page URL or `<a href="…">`.
 * @property {CustomFieldSection[]} config Field sections to render.
 * @property {"multi" | "single"} [outputMode] Store multiple sections with wrappers or one masked field directly.
 * @property {string} [valueAttribute] Attribute read from the root masked element in single mode. Defaults to `data-href`.
 * @property {string} proxy Image proxy prefix applied to img URLs in preview/saved HTML.
 * @property {number[]} userAccessGroups Extra group IDs (beyond AMS) allowed to use the editor.
 * @property {boolean} [debug] Enable debug logging.
 */

export {};

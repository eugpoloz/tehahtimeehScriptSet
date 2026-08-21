"use strict";

import defaultOptions from "./config/defaults";
import generateCustomFieldsFeature from "./features/generateCustomFields";

/**
 * @typedef {import("./types.js").GenerateCustomFieldsOptions} GenerateCustomFieldsOptions
 */

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

// Usage: teh.generateCustomFields();

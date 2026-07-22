/**
 * @param {string} module
 * @returns {string}
 */
export const getLoggerModuleName = (module) =>
  `[tehahtimeehScriptSet] ${module} >>>`;

/**
 * @param {string} module
 * @param {{ message?: string } | unknown} [error]
 * @returns {void}
 */
export const handleError = (module, error) => {
  const MODULE_NAME = getLoggerModuleName(module);
  console.error(
    `${MODULE_NAME} ERROR!`,
    /** @type {{ message?: string } | undefined} */ (error)?.message ?? error
  );
};

/**
 * @typedef {object} LogConfig
 * @property {boolean} [debug]
 * @property {string} [module]
 * @property {string} [message]
 */

/**
 * @param {LogConfig} [config]
 * @param {...unknown} args
 * @returns {void}
 */
export const handleLogs = (config = {}, ...args) => {
  const { debug, module, message } = config;

  if (!debug) {
    return;
  }

  const MODULE_NAME = getLoggerModuleName(/** @type {string} */ (module));
  console.log(`${MODULE_NAME} ${message}`, ...args);
};

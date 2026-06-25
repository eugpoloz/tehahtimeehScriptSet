export const getLoggerModuleName = (module) =>
  `[tehahtimeehScriptSet] ${module} >>>`;

export const handleError = (module, error) => {
  const MODULE_NAME = getLoggerModuleName(module);
  console.error(`${MODULE_NAME} ERROR!`, error?.message ?? error);
};

export const handleLogs = (config = {}, ...args) => {
  const { debug, module, message } = config;

  if (!debug) {
    return;
  }

  const MODULE_NAME = getLoggerModuleName(module);
  console.log(`${MODULE_NAME} ${message}`, ...args);
};

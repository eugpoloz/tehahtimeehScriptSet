import { handleLogin } from "./login";
import { getLoggerModuleName, handleLogs, handleError } from "./logger";
import { decryptAndLoad, encryptAndSave } from "./crypto";
import { viewprofile, hasProfile, hasTopic, getLang } from "./DOM";

export {
  handleLogin,
  getLoggerModuleName,
  handleError,
  handleLogs,
  decryptAndLoad,
  encryptAndSave,
  viewprofile,
  hasProfile,
  hasTopic,
  getLang
};

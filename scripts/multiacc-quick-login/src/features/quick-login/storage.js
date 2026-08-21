import { decryptAndLoad, encryptAndSave } from "../../helpers/crypto";

const INDEXED_DB_KEY = "MultiaccQuickLoginEncryptionKey";
const LOCAL_STORAGE_KEY = "MultiaccQuickLogin";

/**
 * @typedef {object} StoredLogin
 * @property {string} login
 * @property {string} password
 */

/** @returns {Promise<StoredLogin[] | null>} */
export const getMultiaccEncryptedData = async () => {
  const decryptedDataString = await decryptAndLoad({
    encryptionKey: INDEXED_DB_KEY,
    localStorageKey: LOCAL_STORAGE_KEY
  });

  return decryptedDataString
    ? /** @type {StoredLogin[]} */ (JSON.parse(decryptedDataString))
    : null;
};

/**
 * @param {StoredLogin[]} logins
 * @returns {Promise<void>}
 */
export const saveMultiaccEncryptedData = (logins) =>
  encryptAndSave({
    encryptionKey: INDEXED_DB_KEY,
    localStorageKey: LOCAL_STORAGE_KEY,
    data: JSON.stringify(logins)
  });

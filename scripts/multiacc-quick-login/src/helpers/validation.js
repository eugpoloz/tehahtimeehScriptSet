import { ACCOUNT_FORMAT_VERSION } from "./constants";
import { QuickLoginError } from "./crypto";
import errorMessages from "./error-messages.json";

/**
 * @typedef {object} StoredLogin
 * @property {string} login
 * @property {string} password
 *
 * @typedef {object} EncryptedLogin
 * @property {string} login
 * @property {Uint8Array<ArrayBuffer>} iv
 * @property {ArrayBuffer} ciphertext
 *
 * @typedef {object} LoginState
 * @property {typeof ACCOUNT_FORMAT_VERSION} version
 * @property {CryptoKey} key
 * @property {EncryptedLogin[]} accounts
 *
 * @typedef {object} MigrationCandidate
 * @property {string} id
 * @property {string | null} legacyRaw
 * @property {LoginState} value
 */

/**
 * @param {unknown} value
 * @returns {StoredLogin}
 */
export const validateLogin = (value) => {
  const account = /** @type {StoredLogin | null | undefined} */ (value);
  if (
    typeof account?.login !== "string" ||
    typeof account?.password !== "string"
  ) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  return account;
};

/**
 * Preserves exact strings and order; unexpected duplicate usernames are errors.
 * @param {unknown} value
 * @returns {StoredLogin[]}
 */
export const validateStoredLogins = (value) => {
  if (!Array.isArray(value)) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  const names = new Set();
  for (const entry of value) {
    const account = validateLogin(entry);
    if (names.has(account.login)) {
      throw new QuickLoginError(errorMessages.accountsReadFailed);
    }

    names.add(account.login);
  }

  return value;
};

/**
 * @param {unknown} value
 * @returns {CryptoKey}
 */
export const validateEncryptionKey = (value) => {
  if (
    !(value instanceof CryptoKey) ||
    value.type !== "secret" ||
    value.extractable ||
    value.algorithm.name !== "AES-GCM" ||
    /** @type {AesKeyAlgorithm} */ (value.algorithm).length !== 256 ||
    value.usages.length !== 2 ||
    !value.usages.includes("encrypt") ||
    !value.usages.includes("decrypt")
  ) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  return value;
};

/**
 * Structural validation does not decrypt passwords or authenticate ciphertext.
 * @param {unknown} value
 * @returns {LoginState}
 */
export const validateLoginState = (value) => {
  const state = /** @type {LoginState | null | undefined} */ (value);
  if (
    state?.version !== ACCOUNT_FORMAT_VERSION ||
    !Array.isArray(state.accounts)
  ) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  validateEncryptionKey(state.key);
  const names = new Set();
  for (const account of state.accounts) {
    if (
      typeof account?.login !== "string" ||
      names.has(account.login) ||
      !(account.iv instanceof Uint8Array) ||
      account.iv.byteLength !== 12 ||
      !(account.ciphertext instanceof ArrayBuffer) ||
      account.ciphertext.byteLength < 16
    ) {
      throw new QuickLoginError(errorMessages.accountsReadFailed);
    }

    names.add(account.login);
  }

  return state;
};

/**
 * @param {unknown} value
 * @returns {MigrationCandidate}
 */
export const validateMigrationCandidate = (value) => {
  const candidate = /** @type {MigrationCandidate | null | undefined} */ (
    value
  );
  if (
    typeof candidate?.id !== "string" ||
    !/^[a-f0-9]{32}$/.test(candidate.id) ||
    (candidate.legacyRaw !== null && typeof candidate.legacyRaw !== "string")
  ) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  validateLoginState(candidate.value);
  return candidate;
};

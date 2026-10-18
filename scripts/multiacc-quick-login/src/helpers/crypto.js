import errorMessages from "./error-messages.json";

/** A safe, user-facing error; never include credential data. */
export class QuickLoginError extends Error {}

/** @returns {boolean} */
export const isQuickLoginCryptoAvailable = () =>
  window.location.protocol === "https:" &&
  !!window.crypto?.subtle &&
  typeof window.crypto?.getRandomValues === "function";

/** @returns {Promise<CryptoKey>} */
export const createEncryptionKey = () =>
  crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );

/**
 * @param {CryptoKey} key
 * @param {import("./validation").StoredLogin} account
 * @returns {Promise<import("./validation").EncryptedLogin>}
 */
export const encryptLogin = async (key, { login, password }) => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: encoder.encode(JSON.stringify(login)),
      tagLength: 128
    },
    key,
    encoder.encode(JSON.stringify(password))
  );

  return {
    login,
    iv,
    ciphertext
  };
};

/**
 * @param {CryptoKey} key
 * @param {import("./validation").EncryptedLogin} account
 * @returns {Promise<string>}
 */
export const decryptLogin = async (key, { login, iv, ciphertext }) => {
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: new TextEncoder().encode(JSON.stringify(login)),
      tagLength: 128
    },
    key,
    ciphertext
  );
  const password = JSON.parse(
    new TextDecoder("utf-8", {
      fatal: true
    }).decode(plaintext)
  );
  if (typeof password !== "string") {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  return password;
};

/**
 * Decodes the old bundle without creating or modifying its key or storage.
 * @param {CryptoKey} key
 * @param {string} raw
 * @returns {Promise<unknown>}
 */
export const decryptLegacyLogins = async (key, raw) => {
  const bundle = JSON.parse(raw);
  if (typeof bundle?.iv !== "string" || typeof bundle?.data !== "string") {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  const iv = Uint8Array.from(atob(bundle.iv), (char) => char.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(bundle.data), (char) =>
    char.charCodeAt(0)
  );
  if (iv.byteLength !== 12 || ciphertext.byteLength < 16) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    ciphertext
  );

  return JSON.parse(
    new TextDecoder("utf-8", {
      fatal: true
    }).decode(plaintext)
  );
};

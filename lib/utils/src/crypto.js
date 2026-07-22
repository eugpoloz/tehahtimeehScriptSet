import { openDB } from "idb";
import { handleError } from "./logger";

/**
 * @param {Uint8Array | ArrayBuffer} buffer
 * @returns {string}
 */
const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

/**
 * @param {string} base64
 * @returns {Uint8Array<ArrayBuffer>}
 */
const base64ToBuffer = (base64) =>
  Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

const DB_NAME = "tehahtimeehScriptSetDB";
const STORE_NAME = "keys";

/**
 * @param {string} keyName
 * @returns {Promise<CryptoKey | undefined>}
 */
export async function getOrCreateKey(keyName) {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      }
    });

    let key = await db.get(STORE_NAME, keyName);

    if (!key) {
      key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );

      await db.put(STORE_NAME, key, keyName);
    }

    return key;
  } catch (error) {
    handleError("utils/crypto/getOrCreateKey", error);
  }
}

/**
 * @typedef {object} EncryptAndSaveOptions
 * @property {string} encryptionKey
 * @property {string} localStorageKey
 * @property {string} data
 */

/**
 * @param {EncryptAndSaveOptions} options
 * @returns {Promise<void>}
 */
export async function encryptAndSave({ encryptionKey, localStorageKey, data }) {
  try {
    const key = /** @type {CryptoKey} */ (
      await getOrCreateKey(encryptionKey)
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    const bundle = {
      iv: bufferToBase64(iv),
      data: bufferToBase64(ciphertext)
    };
    localStorage.setItem(localStorageKey, JSON.stringify(bundle));
  } catch (error) {
    handleError("utils/crypto/encryptAndSave", error);
  }
}

/**
 * @typedef {object} DecryptAndLoadOptions
 * @property {string} encryptionKey
 * @property {string} localStorageKey
 */

/**
 * @param {DecryptAndLoadOptions} options
 * @returns {Promise<string | null | undefined>}
 */
export async function decryptAndLoad({ encryptionKey, localStorageKey }) {
  try {
    const bundle = JSON.parse(
      /** @type {string} */ (localStorage.getItem(localStorageKey))
    );

    if (!bundle) return null;

    const iv = base64ToBuffer(bundle.iv);
    const data = base64ToBuffer(bundle.data);

    const key = /** @type {CryptoKey} */ (
      await getOrCreateKey(encryptionKey)
    );
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    handleError("utils/crypto/decryptAndLoad", error);
  }
}

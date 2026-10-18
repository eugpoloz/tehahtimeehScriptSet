import { openDB } from "idb";
import { STORAGE } from "../../helpers/constants";
import {
  decryptLogin,
  encryptLogin,
  QuickLoginError
} from "../../helpers/crypto";
import errorMessages from "../../helpers/error-messages.json";
import { validateLogin, validateLoginState } from "../../helpers/validation";
import { getOrMigrateLoginState } from "./migration";

/** @returns {Promise<import("idb").IDBPDatabase>} */
const openLoginDatabase = () => {
  let blocked = false;
  return new Promise((resolve, reject) => {
    openDB(STORAGE.databaseName, STORAGE.databaseVersion, {
      upgrade(db) {
        db.createObjectStore(STORAGE.storeName);
      },
      blocked() {
        blocked = true;
        reject(new QuickLoginError(errorMessages.accountsReadFailed));
      },
      blocking(_currentVersion, _blockedVersion, event) {
        /** @type {IDBDatabase} */ (event.target).close();
      }
    }).then((db) => {
      if (blocked) {
        db.close();
        return;
      }

      resolve(db);
    }, reject);
  });
};

/** @returns {Promise<string[]>} */
export const listSavedLogins = async () => {
  const db = await openLoginDatabase();
  try {
    const state = await getOrMigrateLoginState(db);
    return state.accounts.map((account) => account.login);
  } finally {
    db.close();
  }
};

/**
 * Reads current storage, not the list that was displayed when the panel opened.
 * @param {string} login
 * @returns {Promise<string>}
 */
export const getSavedPassword = async (login) => {
  const db = await openLoginDatabase();
  try {
    const state = await getOrMigrateLoginState(db);
    const account = state.accounts.find((item) => item.login === login);
    if (!account) {
      throw new QuickLoginError(errorMessages.accountNotFound);
    }

    return await decryptLogin(state.key, account);
  } catch (error) {
    if (error instanceof QuickLoginError) {
      throw error;
    }

    throw new QuickLoginError(errorMessages.accountsReadFailed);
  } finally {
    db.close();
  }
};

/**
 * Encrypts before starting a transaction, then updates only this username in
 * the latest state. No cached account list is accepted from the UI.
 * @param {import("../../helpers/validation").StoredLogin} account
 * @returns {Promise<void>}
 */
export const saveLogin = async (account) => {
  validateLogin(account);
  const db = await openLoginDatabase();
  try {
    const state = await getOrMigrateLoginState(db);
    const encrypted = await encryptLogin(state.key, account);
    const transaction = db.transaction(STORAGE.storeName, "readwrite");
    void transaction.done.catch(() => {});
    const current = validateLoginState(
      await transaction.store.get(STORAGE.activeKey)
    );
    const index = current.accounts.findIndex(
      (item) => item.login === account.login
    );
    if (index === -1) {
      current.accounts.unshift(encrypted);
    } else {
      current.accounts[index] = encrypted;
    }

    await transaction.store.put(current, STORAGE.activeKey);
    await transaction.done;
  } finally {
    db.close();
  }
};

/**
 * Commits removal by exact username; an already removed account is a no-op.
 * @param {string} login
 * @returns {Promise<void>}
 */
export const removeSavedLogin = async (login) => {
  const db = await openLoginDatabase();
  try {
    await getOrMigrateLoginState(db);
    const transaction = db.transaction(STORAGE.storeName, "readwrite");
    void transaction.done.catch(() => {});
    const current = validateLoginState(
      await transaction.store.get(STORAGE.activeKey)
    );
    const accounts = current.accounts.filter((item) => item.login !== login);
    if (accounts.length !== current.accounts.length) {
      current.accounts = accounts;
      await transaction.store.put(current, STORAGE.activeKey);
    }

    await transaction.done;
  } finally {
    db.close();
  }
};

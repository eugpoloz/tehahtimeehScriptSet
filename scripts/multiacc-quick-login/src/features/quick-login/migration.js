import { openDB } from "idb";
import {
  ACCOUNT_FORMAT_VERSION,
  LEGACY_STORAGE,
  STORAGE
} from "../../helpers/constants";
import {
  createEncryptionKey,
  decryptLegacyLogins,
  decryptLogin,
  encryptLogin,
  QuickLoginError
} from "../../helpers/crypto";
import errorMessages from "../../helpers/error-messages.json";
import {
  validateEncryptionKey,
  validateLoginState,
  validateMigrationCandidate,
  validateStoredLogins
} from "../../helpers/validation";

/**
 * Reads existing credentials or prepares an empty first-use source.
 * Never creates or replaces the legacy database, store, or key.
 * @param {string | null} raw
 */
const readMigrationSource = async (raw) => {
  if (raw === null) {
    return {
      key: await createEncryptionKey(),
      logins: []
    };
  }

  const db = await openDB(
    LEGACY_STORAGE.databaseName,
    LEGACY_STORAGE.databaseVersion,
    {
      upgrade(_db, _oldVersion, _newVersion, transaction) {
        transaction.abort();
      },
      blocking(_currentVersion, _blockedVersion, event) {
        /** @type {IDBDatabase} */ (event.target).close();
      }
    }
  );

  try {
    const key = validateEncryptionKey(
      await db.get(LEGACY_STORAGE.storeName, LEGACY_STORAGE.encryptionKeyName)
    );
    const logins = validateStoredLogins(await decryptLegacyLogins(key, raw));

    return {
      key,
      logins
    };
  } finally {
    db.close();
  }
};

/**
 * @param {import("../../helpers/validation").LoginState} value
 * @param {import("../../helpers/validation").StoredLogin[]} logins
 */
const verifyAccounts = async (value, logins) => {
  if (value.accounts.length !== logins.length) {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }

  for (let index = 0; index < logins.length; index++) {
    const account = value.accounts[index];
    const expected = logins[index];
    if (
      account.login !== expected.login ||
      (await decryptLogin(value.key, account)) !== expected.password
    ) {
      throw new QuickLoginError(errorMessages.accountsReadFailed);
    }
  }
};

const prepareMigration = async () => {
  const legacyRaw = localStorage.getItem(LEGACY_STORAGE.localStorageKey);
  const { key, logins } = await readMigrationSource(legacyRaw);

  /** @type {import("../../helpers/validation").LoginState} */
  const value = {
    version: ACCOUNT_FORMAT_VERSION,
    key,
    accounts: await Promise.all(
      logins.map((account) => encryptLogin(key, account))
    )
  };
  await verifyAccounts(value, logins);

  const candidate = {
    id: Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join(""),
    legacyRaw,
    value
  };

  return {
    candidate,
    logins
  };
};

/**
 * Resumes a verified two-stage migration; never falls back from damaged active data.
 * Crypto and legacy reads stay outside IndexedDB write transactions.
 * @param {import("idb").IDBPDatabase} db
 * @returns {Promise<import("../../helpers/validation").LoginState>}
 */
export const getOrMigrateLoginState = async (db) => {
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const active = await db.get(STORAGE.storeName, STORAGE.activeKey);
      if (active !== undefined) {
        return validateLoginState(active);
      }

      let prepared;
      if (
        (await db.get(STORAGE.storeName, STORAGE.candidateKey)) === undefined
      ) {
        prepared = await prepareMigration();
        const transaction = db.transaction(STORAGE.storeName, "readwrite");
        // Observe completion even if an earlier request or validation fails.
        void transaction.done.catch(() => {});
        const currentActive = await transaction.store.get(STORAGE.activeKey);
        if (currentActive !== undefined) {
          await transaction.done;
          return validateLoginState(currentActive);
        }

        if ((await transaction.store.get(STORAGE.candidateKey)) === undefined) {
          await transaction.store.put(prepared.candidate, STORAGE.candidateKey);
        }

        await transaction.done;
      }

      const stored = await db.get(STORAGE.storeName, STORAGE.candidateKey);
      if (stored === undefined) {
        continue;
      }

      const candidate = validateMigrationCandidate(stored);
      if (candidate.legacyRaw === null) {
        await verifyAccounts(candidate.value, []);
      } else if (
        prepared?.candidate.id === candidate.id &&
        prepared.candidate.legacyRaw === candidate.legacyRaw
      ) {
        await verifyAccounts(candidate.value, prepared.logins);
      } else {
        prepared = undefined;
        const legacy = await readMigrationSource(candidate.legacyRaw);
        await verifyAccounts(candidate.value, legacy.logins);
      }

      prepared = undefined;
      const transaction = db.transaction(STORAGE.storeName, "readwrite");
      void transaction.done.catch(() => {});
      const currentActive = await transaction.store.get(STORAGE.activeKey);
      if (currentActive !== undefined) {
        await transaction.done;
        return validateLoginState(currentActive);
      }

      const currentCandidate = await transaction.store.get(
        STORAGE.candidateKey
      );
      if (
        currentCandidate === undefined ||
        validateMigrationCandidate(currentCandidate).id !== candidate.id
      ) {
        await transaction.done;
        continue;
      }

      if (
        localStorage.getItem(LEGACY_STORAGE.localStorageKey) !==
        candidate.legacyRaw
      ) {
        await transaction.store.delete(STORAGE.candidateKey);
        await transaction.done;
        continue;
      }

      await transaction.store.put(candidate.value, STORAGE.activeKey);
      await transaction.store.delete(STORAGE.candidateKey);
      await transaction.done;

      const committed = validateLoginState(
        await db.get(STORAGE.storeName, STORAGE.activeKey)
      );
      try {
        if (
          localStorage.getItem(LEGACY_STORAGE.localStorageKey) ===
          candidate.legacyRaw
        ) {
          localStorage.removeItem(LEGACY_STORAGE.localStorageKey);
        }
      } catch {
        // Activation succeeded; leftover legacy data is ignored from now on.
      }

      return committed;
    }

    throw new Error("Migration retry limit exceeded");
  } catch {
    throw new QuickLoginError(errorMessages.accountsReadFailed);
  }
};

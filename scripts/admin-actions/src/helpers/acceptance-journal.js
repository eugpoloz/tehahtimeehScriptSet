/** @typedef {import('./character-data').AcceptanceSource} AcceptanceSource */
/** @typedef {import('./character-data').AcceptanceInput} AcceptanceInput */
/** @typedef {import('../features/update-character-collection').CollectionPage} CollectionPage */
/** @typedef {{state: 'pending', address: string, before?: CollectionPage, expected: CollectionPage} | {state: 'complete', address: string, before?: CollectionPage, expected: Pick<CollectionPage, 'title'>}} CollectionJournal */
/**
 * @typedef {object} AcceptanceJournal
 * @property {{state: 'pending' | 'complete', expected: string, authorId: number, lastPostId: number, postId?: number, url?: string, reviewRequired?: boolean, resendApproved?: boolean}} [letter]
 * @property {{state: 'pending' | 'complete', forumId: number}} [move]
 * @property {1} version
 * @property {AcceptanceInput} input
 * @property {'waiting' | 'pending' | 'complete'} configState
 * @property {string} [configFile] Administrative target recorded before submitting.
 * @property {string} [beforeSnapshot] Last fresh config while its write is pending.
 * @property {string} [expectedSnapshot] Intended whole-file result while its write is pending.
 * @property {CollectionJournal} [collection]
 * @property {{state: 'pending' | 'complete', before: string, expected: string}} [group]
 * @property {{state: 'pending' | 'complete', before: Record<string, string>, expected: Record<string, string>}} [profile]
 */

/** @param {AcceptanceSource} source */
const key = (source) =>
  `teh:character-acceptance:${location.origin}:${source.mode}:${source.topicId}:${source.postId}`;

/** No credentials or form tokens are stored. @param {AcceptanceSource} source @returns {AcceptanceJournal | null} */
export const readJournal = (source) => {
  const stored = localStorage.getItem(key(source));
  if (!stored) {
    return null;
  }

  let journal;
  try {
    journal = JSON.parse(stored);
  } catch {
    throw new Error(
      "Не удалось прочитать сохранённую операцию для этой анкеты."
    );
  }
  if (
    !journal ||
    typeof journal !== "object" ||
    Array.isArray(journal) ||
    journal.version !== 1 ||
    typeof journal.input?.name !== "string" ||
    !journal.input.character ||
    typeof journal.input.character !== "object" ||
    Array.isArray(journal.input.character) ||
    journal.input.source?.mode !== source.mode ||
    journal.input.source?.topicId !== source.topicId ||
    journal.input.source?.postId !== source.postId ||
    !["waiting", "pending", "complete"].includes(journal.configState) ||
    (journal.configState === "pending" &&
      (typeof journal.beforeSnapshot !== "string" ||
        typeof journal.expectedSnapshot !== "string"))
  ) {
    throw new Error(
      "Не удалось прочитать сохранённую операцию для этой анкеты."
    );
  }

  return journal;
};

/** Persist intent before a write, and completion only after verification. @param {AcceptanceJournal} journal */
export const saveJournal = (journal) => {
  // Completed recovery verifies the character and collection markers, not old snapshots.
  if (journal.configState === "complete") {
    delete journal.beforeSnapshot;
    delete journal.expectedSnapshot;
  }
  if (journal.collection?.state === "complete") {
    journal.collection = {
      state: "complete",
      address: journal.collection.address,
      expected: { title: journal.collection.expected.title }
    };
  }

  try {
    localStorage.setItem(key(journal.input.source), JSON.stringify(journal));
  } catch {
    throw new Error(
      "Не удалось сохранить состояние операции в браузере. Сохранение остановлено."
    );
  }
};

/** Find this browser's regular operation after the topic has moved. @param {number} topicId @returns {AcceptanceJournal | null} */
export const readTopicJournal = (topicId) => {
  const prefix = `teh:character-acceptance:${location.origin}:regular:${topicId}:`;
  for (let index = 0; index < localStorage.length; index++) {
    const storedKey = localStorage.key(index);
    if (storedKey?.startsWith(prefix)) {
      const postId = Number(storedKey.slice(prefix.length));
      return readJournal({ mode: "regular", topicId, postId });
    }
  }

  return null;
};

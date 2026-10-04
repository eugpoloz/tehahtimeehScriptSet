/** @typedef {import('../features/character-form').Character} Character */
/** @typedef {import('../features/character-form').CharacterFormValues} CharacterFormValues */
/** @typedef {Record<string, Character>} CharactersConfig */
/** @typedef {{mode: 'regular' | 'npc', topicId: number, postId: number}} AcceptanceSource */
/** @typedef {CharacterFormValues & {source: AcceptanceSource, age?: number, collectionAddress?: string}} AcceptanceInput */

/** Remove accents and derive a forum page address from the name. @param {string} name */
export const suggestCollectionAddress = (name) =>
  name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{Mark}/gu, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

/** @param {string} address */
export const validateCollectionAddress = (address) => {
  if (!/^[a-z0-9_-]{1,48}$/.test(address)) {
    throw new Error(
      "Адрес личной страницы: до 48 символов, латиница в нижнем регистре, цифры, дефис и подчёркивание."
    );
  }
};

/** @param {unknown} value @returns {number | null} */
export const parsePositiveId = (value) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const text = String(value).trim();
  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const number = Number(text);
  return Number.isSafeInteger(number) ? number : null;
};

/** @param {string} source @returns {CharactersConfig} */
export const parseCharacters = (source) => {
  /** @type {unknown} */
  const data = JSON.parse(source);
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.values(data).some(
      (character) =>
        !character || typeof character !== "object" || Array.isArray(character)
    )
  ) {
    throw new Error("Ожидается JSON-объект с данными персонажей.");
  }

  return /** @type {CharactersConfig} */ (data);
};

/** Compare JSON data without depending on object-property order. @param {unknown} data */
export const snapshot = (data) =>
  JSON.stringify(data, (_key, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.fromEntries(
        Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      );
    }

    return value;
  });

/** Preserve the editor's ordering and Unicode escaping for Windows-1251 forms. @param {CharactersConfig} data */
export const serializeCharacters = (data) => {
  const names = Object.keys(data).sort((a, b) => {
    if ((data[a].id == null) !== (data[b].id == null)) {
      return data[a].id == null ? 1 : -1;
    }

    return a.localeCompare(b);
  });
  const supported = new Set(
    new TextDecoder("windows-1251").decode(
      Uint8Array.from({ length: 128 }, (_, index) => index + 128)
    )
  );
  const json = JSON.stringify(
    Object.fromEntries(names.map((name) => [name, data[name]])),
    null,
    2
  ).replace(/[^\x00-\x7f]/g, (character) => {
    if (supported.has(character)) {
      return character;
    }

    return `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
  return `${json}\n`;
};

/** Match post references only to NPCs, and topic references only to regular characters. @param {CharactersConfig} data @param {AcceptanceSource} source */
export const findCharacterByApplication = (data, source) =>
  Object.entries(data).find(
    ([, character]) =>
      (character.id == null) === (source.mode === "npc") &&
      parsePositiveId(character.anketa) ===
        (source.mode === "npc" ? source.postId : source.topicId)
  );

/** Validate DOB and calculate the age required for later profile writes. @param {CharacterFormValues} values @param {AcceptanceSource} source @returns {AcceptanceInput} */
export const getAcceptanceInput = (values, source) => {
  const character = values.character;
  const npc = source.mode === "npc";
  if ((character.id == null) !== npc) {
    throw new Error(
      npc
        ? "Персонаж из этой темы должен быть NPC."
        : "Для принятия анкеты нужен ID профиля."
    );
  }

  const applicationId = npc ? source.postId : source.topicId;
  if (
    (!npc || character.anketa != null) &&
    character.anketa !== applicationId
  ) {
    throw new Error(
      `В поле «Анкета» должен быть ID выбранной анкеты: ${applicationId}.`
    );
  }

  const input = { ...values, source };
  const dateOfBirth = String(character.dob ?? "").trim();
  if (npc && !dateOfBirth) {
    return input;
  }

  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateOfBirth);
  if (!match) {
    throw new Error("Укажите дату рождения в формате ДД.ММ.ГГГГ.");
  }

  const [, day, month, year] = match.map(Number);
  const birth = new Date(0);
  birth.setUTCFullYear(year, month - 1, day);
  if (
    year < 1 ||
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day
  ) {
    throw new Error("Укажите существующую дату рождения.");
  }

  if (npc) {
    return input;
  }

  const gameDate = /** @type {Date} */ (window.GAME_LATEST_DATE);
  let age = gameDate.getFullYear() - year;
  if (
    gameDate.getMonth() < month - 1 ||
    (gameDate.getMonth() === month - 1 && gameDate.getDate() < day)
  ) {
    age--;
  }
  return { ...input, age };
};

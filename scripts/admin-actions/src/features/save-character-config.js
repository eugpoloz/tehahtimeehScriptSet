import {
  findCharacterByApplication,
  parseCharacters,
  parsePositiveId,
  serializeCharacters,
  snapshot
} from "../helpers/character-data";
import { saveJournal } from "../helpers/acceptance-journal";
/** @typedef {import('../helpers/character-data').CharactersConfig} CharactersConfig */
/** @typedef {import('../helpers/character-data').AcceptanceInput} AcceptanceInput */
/** @typedef {import('../helpers/acceptance-journal').AcceptanceJournal} AcceptanceJournal */
/** @typedef {{input: AcceptanceInput, journal: AcceptanceJournal, iframe: import('../helpers/iframe').AcceptanceIframe}} AcceptanceContext */

export class ConfigMismatchError extends Error {
  /** @param {AcceptanceInput} input @param {CharactersConfig} data */
  constructor(input, data) {
    super("Запись в конфиге отличается от данных формы. Сравните их ниже.");
    this.name = "ConfigMismatchError";
    this.expected = JSON.stringify({ [input.name]: input.character }, null, 2);
    this.actual = Object.prototype.hasOwnProperty.call(data, input.name)
      ? JSON.stringify({ [input.name]: data[input.name] }, null, 2)
      : "Персонаж не найден в конфиге.";
    this.actualCharacter = Object.prototype.hasOwnProperty.call(
      data,
      input.name
    )
      ? data[input.name]
      : undefined;
    this.acceptedSnapshot = snapshot([
      Object.prototype.hasOwnProperty.call(data, input.name),
      data[input.name]
    ]);
  }
}

const getConfigFile = () => {
  const configured = window.teh?.charactersConfigUrl;
  if (typeof configured !== "string" || !configured.trim()) {
    throw new Error("Не задан адрес конфига персонажей в HTML-верхе.");
  }

  const asset = new URL(configured, location.href);
  const filename = asset.pathname.split("/").pop();
  if (!/^https?:$/.test(asset.protocol) || !filename?.endsWith(".json")) {
    throw new Error("Конфиг персонажей должен быть файлом .json.");
  }

  const url = new URL(
    `/admin_files.php?edit&file=${encodeURIComponent(filename)}`,
    location.origin
  );
  return url;
};

/** @param {import('../helpers/iframe').AcceptanceIframe} iframe @param {URL} url */
const loadConfigForm = async (iframe, url) => {
  const freshUrl = new URL(url);
  freshUrl.searchParams.set("_teh", String(Date.now()));
  const doc = await iframe.load(freshUrl);
  const textarea = doc.querySelector('textarea[name="content"]');
  // These nodes belong to the iframe; do not use parent-window constructors.
  if (!textarea) {
    throw new Error(
      "Не найдена форма редактирования JSON. Проверьте вход в админку."
    );
  }

  const field = /** @type {HTMLTextAreaElement} */ (textarea);
  const form = field.closest("form");
  const submitter = form?.querySelector('input[type="submit"][name="save"]');
  if (!form || !submitter) {
    throw new Error("Не найдена кнопка сохранения файла: input[name=save].");
  }

  const action = new URL(form.action, doc.URL);
  if (
    form.method.toLowerCase() !== "post" ||
    action.origin !== location.origin ||
    action.pathname !== url.pathname ||
    action.searchParams.get("file") !== url.searchParams.get("file")
  ) {
    throw new Error("Форма редактирования открыта для другого файла.");
  }

  return {
    field,
    form,
    submitter: /** @type {HTMLInputElement} */ (submitter),
    data: parseCharacters(field.value)
  };
};

/** @param {CharactersConfig} data @param {AcceptanceInput} input */
const hasSavedCharacter = (data, input) =>
  Object.prototype.hasOwnProperty.call(data, input.name) &&
  snapshot(data[input.name]) === snapshot(input.character);

/** @param {CharactersConfig} data @param {AcceptanceInput} input */
const checkNewCharacter = (data, input) => {
  if (Object.prototype.hasOwnProperty.call(data, input.name)) {
    throw new Error("Такое имя уже есть в конфиге.");
  }
  if (findCharacterByApplication(data, input.source)) {
    throw new Error("Персонаж из этой анкеты уже внесён в конфиг.");
  }

  const main = input.character.main;
  if (
    typeof main === "string" &&
    (!Object.prototype.hasOwnProperty.call(data, main) ||
      parsePositiveId(data[main].id) === null ||
      (typeof data[main].main === "string" && data[main].main))
  ) {
    throw new Error(
      "Выберите основной профиль. Нельзя выбрать твинка или самого персонажа."
    );
  }
};

/** Add one reviewed character to the fresh JSON and verify the whole-file result. @param {AcceptanceContext} context */
export const saveCharacterConfig = async ({ input, journal, iframe }) => {
  const url = getConfigFile();
  const current = await loadConfigForm(iframe, url);
  const currentSnapshot = snapshot(current.data);
  const entrySnapshot = snapshot([
    Object.prototype.hasOwnProperty.call(current.data, input.name),
    current.data[input.name]
  ]);
  let verifiedData = current.data;
  if (
    journal.configAcceptedSnapshot !== undefined &&
    journal.configAcceptedSnapshot === entrySnapshot
  ) {
    // The administrator explicitly accepted this exact current entry.
  } else if (journal.configState === "complete") {
    if (!hasSavedCharacter(current.data, input)) {
      throw new ConfigMismatchError(input, current.data);
    }
  } else if (
    journal.configState === "waiting" &&
    hasSavedCharacter(current.data, input)
  ) {
    // Recover an exact match even when this browser has no previous journal.
  } else if (
    journal.configState === "waiting" &&
    Object.prototype.hasOwnProperty.call(current.data, input.name)
  ) {
    throw new ConfigMismatchError(input, current.data);
  } else if (
    journal.configState === "pending" &&
    currentSnapshot === journal.expectedSnapshot
  ) {
    // The previous write succeeded even if the iframe timed out afterward.
  } else {
    if (
      journal.configState === "pending" &&
      currentSnapshot !== journal.beforeSnapshot
    ) {
      throw new Error(
        "Не удалось проверить предыдущее сохранение, а конфиг с тех пор изменился. Проверьте файл вручную перед повторной попыткой."
      );
    }

    checkNewCharacter(current.data, input);
    const next = { ...current.data, [input.name]: input.character };
    journal.configState = "pending";
    journal.beforeSnapshot = currentSnapshot;
    journal.expectedSnapshot = snapshot(next);
    saveJournal(journal);
    current.field.value = serializeCharacters(next);
    await iframe.submit(current.form, current.submitter);
    const verification = await loadConfigForm(iframe, url);
    if (snapshot(verification.data) !== journal.expectedSnapshot) {
      throw new Error(
        "Не удалось проверить, сохранился ли конфиг. Нажмите «Проверить сохранение»."
      );
    }

    verifiedData = verification.data;
  }

  journal.configState = "complete";
  saveJournal(journal);
  window.characters = verifiedData;
  if (window.teh) {
    window.teh.charactersPromise = Promise.resolve(verifiedData);
  }
};

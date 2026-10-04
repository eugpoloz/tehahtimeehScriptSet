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
  return { url, filename };
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
      "Выберите существующий основной профиль, а не твин или самого персонажа."
    );
  }
};

/** Add one reviewed character to the fresh JSON and verify the whole-file result. @param {AcceptanceContext} context */
export const saveCharacterConfig = async ({ input, journal, iframe }) => {
  const { url, filename } = getConfigFile();
  if (journal.configFile && journal.configFile !== filename) {
    throw new Error(
      "Адрес конфига изменился после начала операции. Проверьте сохранение в исходном файле."
    );
  }

  const current = await loadConfigForm(iframe, url);
  const currentSnapshot = snapshot(current.data);
  let verifiedData = current.data;
  if (journal.configState === "complete") {
    if (!hasSavedCharacter(current.data, input)) {
      throw new Error(
        "Ранее сохранённый персонаж изменён или удалён. Проверьте конфиг."
      );
    }
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
        "Результат предыдущего сохранения не подтверждён, а конфиг изменился. Проверьте файл вручную; повторная отправка остановлена."
      );
    }

    checkNewCharacter(current.data, input);
    const next = { ...current.data, [input.name]: input.character };
    journal.configState = "pending";
    journal.configFile = filename;
    journal.beforeSnapshot = currentSnapshot;
    journal.expectedSnapshot = snapshot(next);
    saveJournal(journal);
    current.field.value = serializeCharacters(next);
    await iframe.submit(current.form, current.submitter);
    const verification = await loadConfigForm(iframe, url);
    if (snapshot(verification.data) !== journal.expectedSnapshot) {
      throw new Error(
        "Админка не подтвердила сохранение конфига. Нажмите «Проверить сохранение»."
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

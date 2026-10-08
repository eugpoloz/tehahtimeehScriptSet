import { getProfilePickerOptionsMarkup } from "@teh/utils";
import { parsePositiveId } from "../helpers/character-data";

/** @typedef {Record<string, unknown>} Character */
/** @typedef {{ name: string, character: Character }} CharacterFormValues */
/**
 * @typedef {object} CharacterFormOptions
 * @property {(values: CharacterFormValues) => void | Promise<void>} [onSubmit] Called after field validation.
 * @property {() => void} [onChange] Called after edits, filling or resetting.
 */
/**
 * @typedef {object} CharacterFormDraft
 * @property {Record<string, string>} values
 * @property {string} description
 * @property {boolean} npc
 * @property {boolean} isMain
 * @property {boolean} genderFemale
 * @property {boolean} cursed
 * @property {string[]} who
 * @property {string[]} affiliations
 */
/**
 * @typedef {object} CharacterFormController
 * @property {(name?: string, character?: Character) => void} fill Set values and the reset baseline.
 * @property {() => void} reset Restore the supplied baseline.
 * @property {() => boolean} isDirty Compare every field and checkbox with the baseline.
 * @property {() => CharacterFormValues} read Validate and return values, preserving unknown properties.
 * @property {() => void} refreshMainProfiles Refresh suggestions from window.characters.
 * @property {() => void} focus Focus the name field.
 * @property {() => CharacterFormDraft} getDraft Capture edits, including invalid/empty fields.
 * @property {(draft: CharacterFormDraft) => void} restoreDraft Restore edits without replacing the reset baseline.
 */

/** @param {unknown} value @returns {unknown[]} */
const arrayValues = (value) => (Array.isArray(value) ? value : []);

/**
 * Initialize a form containing getCharacterFormMarkup(). Does not save config.
 * @param {HTMLFormElement} form
 * @param {CharacterFormOptions} [options]
 * @returns {CharacterFormController}
 */
export const initCharacterForm = (form, options = {}) => {
  /** @param {string} id @returns {HTMLInputElement} */
  const input = (id) => {
    const element = form.querySelector(`#${id}`);
    if (!(element instanceof HTMLInputElement)) {
      throw new Error(`Character form input is missing: ${id}`);
    }

    return element;
  };
  /** @param {string} id @returns {HTMLElement} */
  const element = (id) => {
    const result = form.querySelector(`#${id}`);
    if (!(result instanceof HTMLElement)) {
      throw new Error(`Character form element is missing: ${id}`);
    }

    return result;
  };
  const fieldset = element("char-form-fields");
  const fields = {
    name: input("char-form-name"),
    ru: input("char-form-ru"),
    fc: input("char-form-fc"),
    dob: input("char-form-dob"),
    id: input("char-form-id"),
    anketa: input("char-form-anketa"),
    main: input("char-form-main")
  };
  const description = form.querySelector("#char-form-desc");
  if (!(description instanceof HTMLTextAreaElement)) {
    throw new Error("Character form description is missing.");
  }

  const npc = input("char-form-npc");
  const isMain = input("char-form-main-is-main");
  const genderFemale = input("char-form-gender-f");
  const cursed = input("char-form-cursed");
  const nature = element("char-form-who-nature");
  const magic = element("char-form-who-magic");
  const affiliations = element("char-form-aff");
  const mainOptional = element("char-form-main-optional");
  const mainBody = element("char-form-main-body");
  const mainPicker = /** @type {HTMLFieldSetElement} */ (
    mainBody.querySelector("[data-profile-picker]")
  );
  const mainTrigger = /** @type {HTMLButtonElement} */ (
    mainPicker.querySelector("[data-profile-picker-trigger]")
  );
  const mainValue = /** @type {HTMLElement} */ (
    mainPicker.querySelector("[data-profile-picker-value]")
  );
  const mainOptions = /** @type {HTMLElement} */ (
    mainPicker.querySelector("[data-profile-picker-options]")
  );
  const mainStatus = /** @type {HTMLElement} */ (
    mainPicker.querySelector("[data-profile-picker-status]")
  );
  const mainMenu = element("char-form-main-picker-popover");
  const idField = element("char-form-id-field");
  const anketaHint = element("char-form-anketa-hint");
  const magicianLabel = element("char-form-magician-label");
  const cursedLabel = element("char-form-cursed-label");
  const idLink = form.querySelector("#char-form-id-link");
  const anketaLink = form.querySelector("#char-form-anketa-link");
  if (
    !(idLink instanceof HTMLAnchorElement) ||
    !(anketaLink instanceof HTMLAnchorElement)
  ) {
    throw new Error("Character form links are missing.");
  }

  const status = form.querySelector('[role="status"]');
  const resetButton = form.elements.namedItem("char-form-reset");
  let originalName = "";
  /** @type {Character} */
  let originalCharacter = {};
  let initialFormState = "";
  let submitting = false;

  /** @param {HTMLElement} container @returns {HTMLInputElement[]} */
  const choices = (container) => [...container.querySelectorAll("input")];
  /** @param {HTMLElement} container @returns {string[]} */
  const checkedValues = (container) =>
    choices(container)
      .filter((item) => item.checked)
      .map((item) => item.value);
  /** @param {HTMLElement} container @param {unknown[]} values */
  const setCheckedValues = (container, values) => {
    for (const checkbox of choices(container)) {
      checkbox.checked = values.includes(checkbox.value);
    }
  };
  const getDraft = () => ({
    values: Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [key, field.value])
    ),
    description: description.value,
    npc: npc.checked,
    isMain: isMain.checked,
    genderFemale: genderFemale.checked,
    cursed: cursed.checked,
    who: [...checkedValues(nature), ...checkedValues(magic)],
    affiliations: checkedValues(affiliations)
  });
  const getFormState = () => JSON.stringify(getDraft());
  const isDirty = () => getFormState() !== initialFormState;
  const notifyChange = () => {
    if (resetButton instanceof HTMLButtonElement) {
      resetButton.disabled = !isDirty();
    }

    options.onChange?.();
  };
  /** @param {string} message */
  const showStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };
  const clearErrors = () => {
    for (const field of Object.values(fields)) {
      field.removeAttribute("aria-invalid");
      field.closest(".char-form__field")?.classList.remove("invalid");
    }
    mainTrigger.removeAttribute("aria-invalid");

    showStatus("");
  };
  /** @param {HTMLInputElement} field @param {string} message @returns {never} */
  const fieldError = (field, message) => {
    field.setAttribute("aria-invalid", "true");
    field.closest(".char-form__field")?.classList.add("invalid");
    if (field === fields.main) {
      mainTrigger.setAttribute("aria-invalid", "true");
      mainTrigger.focus();
    } else {
      field.focus();
    }
    showStatus(message);
    throw new Error(message);
  };

  const refreshMainProfiles = () => {
    const names = Object.entries(window.characters || {})
      .filter(
        ([name, character]) =>
          name !== originalName &&
          name !== fields.name.value.trim() &&
          typeof character.id === "number" &&
          (character.main === true || !character.main)
      )
      .map(([name]) => name)
      .sort((a, b) => a.localeCompare(b));
    mainOptions.innerHTML = getProfilePickerOptionsMarkup(
      names,
      "char-form-main-profile",
      fields.main.value
    );
    mainValue.textContent = fields.main.value || "Выберите профиль";
    mainStatus.textContent = "Главные профили не найдены";
    mainStatus.hidden = names.length > 0;
  };
  const updateMain = () => {
    const expanded = !npc.checked && !isMain.checked;
    mainOptional.classList.toggle("open", expanded);
    mainBody.hidden = !expanded;
    isMain.setAttribute("aria-expanded", String(expanded));
    fields.main.disabled = !expanded;
    mainPicker.disabled = !expanded;
    if (!expanded) {
      fields.main.value = "";
      if (mainMenu.matches(":popover-open")) {
        mainMenu.hidePopover();
      }
    }
  };
  const updateLinks = () => {
    const profileId = parsePositiveId(fields.id.value);
    idLink.hidden = npc.checked || profileId === null;
    idLink.removeAttribute("href");
    if (!idLink.hidden && profileId !== null) {
      idLink.href = `/profile.php?id=${profileId}`;
    }

    const anketaId = parsePositiveId(fields.anketa.value);
    anketaHint.textContent = npc.checked ? "ID поста" : "ID темы";
    anketaLink.hidden = anketaId === null;
    anketaLink.removeAttribute("href");
    if (anketaId !== null) {
      if (npc.checked) {
        anketaLink.href = `/viewtopic.php?pid=${anketaId}#p${anketaId}`;
      } else {
        anketaLink.href = `/viewtopic.php?id=${anketaId}`;
      }
    }
  };
  const updateNpc = () => {
    form.classList.toggle("npc-mode", npc.checked);
    fields.id.required = !npc.checked;
    fields.id.disabled = npc.checked;
    fields.anketa.required = !npc.checked;
    isMain.disabled = npc.checked;
    idField.hidden = npc.checked;
    mainOptional.hidden = npc.checked;
    if (npc.checked) {
      fields.id.value = "";
      isMain.checked = true;
    }

    updateMain();
    updateLinks();
  };
  const updateGender = () => {
    if (genderFemale.checked) {
      magicianLabel.textContent = "волшебница";
      cursedLabel.textContent = "Проклята";
    } else {
      magicianLabel.textContent = "волшебник";
      cursedLabel.textContent = "Проклят";
    }
  };

  const restoreBaseline = () => {
    const character = originalCharacter;
    fields.name.value = originalName;
    for (const key of ["ru", "fc", "dob", "id", "anketa", "main"]) {
      fields[/** @type {keyof typeof fields} */ (key)].value = String(
        character[key] ?? ""
      );
    }
    if (typeof character.main !== "string") {
      fields.main.value = "";
    }

    description.value = String(character.desc ?? "");
    npc.checked = character.id == null;
    isMain.checked = !fields.main.value || npc.checked;
    genderFemale.checked = character.gender === "f";
    cursed.checked = Boolean(character.cursed);
    const who = arrayValues(character.who);
    const natureValue =
      choices(nature).find((choice) => who.includes(choice.value))?.value ||
      (Array.isArray(character.who) ? "" : "human");
    const magicValue = choices(magic).find((choice) =>
      who.includes(choice.value)
    )?.value;
    setCheckedValues(nature, [natureValue]);
    setCheckedValues(magic, magicValue ? [magicValue] : []);
    setCheckedValues(affiliations, arrayValues(character.affiliations));
    updateNpc();
    updateGender();
    refreshMainProfiles();
    clearErrors();
    initialFormState = getFormState();
    notifyChange();
  };
  /** @param {string} [name] @param {Character} [character] */
  const fill = (
    name = "",
    character = { id: "", who: ["human"], affiliations: [] }
  ) => {
    originalName = name;
    originalCharacter = JSON.parse(JSON.stringify(character));
    restoreBaseline();
  };
  /** @param {CharacterFormDraft} draft */
  const restoreDraft = (draft) => {
    for (const [key, field] of Object.entries(fields)) {
      field.value = draft.values[key] || "";
    }

    description.value = draft.description;
    npc.checked = draft.npc;
    isMain.checked = draft.isMain;
    genderFemale.checked = draft.genderFemale;
    cursed.checked = draft.cursed;
    setCheckedValues(nature, draft.who);
    setCheckedValues(magic, draft.who);
    setCheckedValues(affiliations, draft.affiliations);
    updateNpc();
    updateGender();
    refreshMainProfiles();
    clearErrors();
    notifyChange();
  };
  /** @returns {CharacterFormValues} */
  const read = () => {
    clearErrors();
    for (const [
      field,
      message
    ] of /** @type {[HTMLInputElement, string][]} */ ([
      [fields.name, "Укажите имя"],
      [fields.ru, "Укажите имя кириллицей"],
      [fields.fc, "Укажите FC"]
    ])) {
      if (!field.value.trim()) {
        fieldError(field, message);
      }
    }

    const name = fields.name.value.trim();
    if (
      name !== originalName &&
      Object.prototype.hasOwnProperty.call(window.characters || {}, name)
    ) {
      fieldError(fields.name, "Такое имя уже есть");
    }

    const character = { ...originalCharacter };
    character.ru = fields.ru.value.trim();
    character.fc = fields.fc.value.trim();
    character.desc = description.value.trim();
    const knownWho = [...choices(nature), ...choices(magic)].map(
      (choice) => choice.value
    );
    character.who = [
      ...checkedValues(nature),
      ...checkedValues(magic),
      ...arrayValues(originalCharacter.who).filter(
        (value) => !knownWho.includes(/** @type {string} */ (value))
      )
    ];
    const knownAffiliations = choices(affiliations).map(
      (choice) => choice.value
    );
    character.affiliations = [
      ...checkedValues(affiliations),
      ...arrayValues(originalCharacter.affiliations).filter(
        (value) => !knownAffiliations.includes(/** @type {string} */ (value))
      )
    ];
    character.cursed = cursed.checked;
    if (npc.checked && !fields.anketa.value.trim()) {
      delete character.anketa;
    } else {
      const anketaId = parsePositiveId(fields.anketa.value);
      if (anketaId === null) {
        fieldError(fields.anketa, "Укажите положительный целый ID анкеты");
      }

      character.anketa = anketaId;
    }

    if (npc.checked) {
      delete character.id;
    } else {
      const profileId = parsePositiveId(fields.id.value);
      if (profileId === null) {
        fieldError(fields.id, "Укажите положительный целый ID профиля");
      }

      character.id = profileId;
    }

    if (fields.dob.value.trim()) {
      character.dob = fields.dob.value.trim();
    } else {
      delete character.dob;
    }

    if (!npc.checked && !isMain.checked) {
      if (!fields.main.value.trim()) {
        fieldError(fields.main, "Укажите имя основного профиля");
      }

      character.main = fields.main.value.trim();
    } else {
      delete character.main;
    }

    if (genderFemale.checked) {
      character.gender = "f";
    } else {
      delete character.gender;
    }

    return { name, character };
  };

  isMain.addEventListener("change", () => {
    updateMain();
    if (!fields.main.disabled) {
      refreshMainProfiles();
      mainTrigger.focus();
    }
  });
  npc.addEventListener("change", updateNpc);
  genderFemale.addEventListener("change", updateGender);
  mainTrigger.addEventListener("click", refreshMainProfiles);
  mainOptions.addEventListener("change", (event) => {
    const choice = event.target;
    if (!(choice instanceof HTMLInputElement) || !choice.checked) {
      return;
    }

    fields.main.value = choice.value;
    mainValue.textContent = choice.value;
    mainMenu.hidePopover();
  });
  fields.name.addEventListener("input", refreshMainProfiles);
  magic.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.checked) {
      return;
    }

    for (const checkbox of choices(magic)) {
      if (checkbox !== target) {
        checkbox.checked = false;
      }
    }
  });
  const onActivity = () => {
    clearErrors();
    updateLinks();
    notifyChange();
  };
  fieldset.addEventListener("input", onActivity);
  fieldset.addEventListener("change", onActivity);
  for (const field of [fields.id, fields.anketa]) {
    field.addEventListener("blur", updateLinks);
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        updateLinks();
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || fieldset.matches(":disabled")) {
      return;
    }

    try {
      const values = read();
      submitting = true;
      if (options.onSubmit) {
        await options.onSubmit(values);
      } else {
        showStatus("Форма заполнена верно");
      }
    } catch (error) {
      showStatus(
        error instanceof Error ? error.message : "Проверьте поля формы."
      );
    } finally {
      submitting = false;
    }
  });
  form.addEventListener("reset", (event) => {
    event.preventDefault();
    restoreBaseline();
  });

  fill();
  return {
    fill,
    reset: restoreBaseline,
    isDirty,
    read,
    refreshMainProfiles,
    getDraft,
    restoreDraft,
    focus: () => fields.name.focus()
  };
};

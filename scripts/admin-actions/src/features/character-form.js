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
 * @property {boolean} dobAltEnabled
 * @property {boolean} cursed
 * @property {boolean} alien
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

/** @param {unknown} value @returns {string} */
const toDateInput = (value) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value ?? ""));
  if (!match) {
    return "";
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
};

/** @param {string} value @returns {string} */
const fromDateInput = (value) => {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

/** @param {HTMLInputElement} input @returns {number | null} */
const ageFromInput = (input) => {
  const gameDate = window.GAME_LATEST_DATE;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.value);
  if (
    !match ||
    !input.validity.valid ||
    !(gameDate instanceof Date) ||
    Number.isNaN(gameDate.getTime())
  ) {
    return null;
  }

  const [, year, month, day] = match.map(Number);
  let age = gameDate.getFullYear() - year;
  if (
    gameDate.getMonth() < month - 1 ||
    (gameDate.getMonth() === month - 1 && gameDate.getDate() < day)
  ) {
    age--;
  }

  if (age < 0) {
    return null;
  }

  return age;
};

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
    dobAlt: input("char-form-dob-alt"),
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
  const dobAltEnabled = input("char-form-dob-alt-enabled");
  const dobAltBody = element("char-form-dob-alt-body");
  const agePreview = element("char-form-age-preview");
  const swapDates = element("char-form-swap-dates");
  if (!(swapDates instanceof HTMLButtonElement)) {
    throw new Error("Character form date swap button is missing.");
  }

  const cursed = input("char-form-cursed");
  const alien = input("char-form-alien");
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
    dobAltEnabled: dobAltEnabled.checked,
    cursed: cursed.checked,
    alien: alien.checked,
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
  /** @param {string} message @param {boolean} [isError] */
  const showStatus = (message, isError = false) => {
    if (status) {
      status.classList.toggle("text-error", isError);
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
    showStatus(message, true);
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
    idLink.removeAttribute("href");
    if (!npc.checked && profileId !== null) {
      idLink.href = `/profile.php?id=${profileId}`;
    }

    const anketaId = parsePositiveId(fields.anketa.value);
    anketaHint.textContent = npc.checked ? "ID поста" : "ID темы";
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
  const updateDobAlt = () => {
    dobAltBody.hidden = !dobAltEnabled.checked;
    fields.dobAlt.disabled = !dobAltEnabled.checked;
    dobAltEnabled.setAttribute("aria-expanded", String(dobAltEnabled.checked));
  };
  const updateAgePreview = () => {
    const primaryAge = ageFromInput(fields.dob);
    if (primaryAge === null) {
      agePreview.textContent = "—";
      return;
    }

    agePreview.textContent = String(primaryAge);
    if (dobAltEnabled.checked) {
      const alternativeAge = ageFromInput(fields.dobAlt);
      if (alternativeAge !== null) {
        agePreview.textContent += ` (${alternativeAge})`;
      }
    }
  };

  const restoreBaseline = () => {
    const character = originalCharacter;
    fields.name.value = originalName;
    for (const key of ["ru", "fc", "id", "anketa", "main"]) {
      fields[/** @type {keyof typeof fields} */ (key)].value = String(
        character[key] ?? ""
      );
    }
    fields.dob.value = toDateInput(character.dob);
    fields.dobAlt.value = toDateInput(character.dobAlt);
    if (typeof character.main !== "string") {
      fields.main.value = "";
    }

    description.value = String(character.desc ?? "");
    npc.checked = character.id == null;
    isMain.checked = !fields.main.value || npc.checked;
    genderFemale.checked = character.gender === "f";
    dobAltEnabled.checked = Boolean(fields.dobAlt.value.trim());
    cursed.checked = Boolean(character.cursed);
    alien.checked = character.alien === true;
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
    updateDobAlt();
    updateAgePreview();
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
    dobAltEnabled.checked = draft.dobAltEnabled;
    cursed.checked = draft.cursed;
    alien.checked = draft.alien;
    setCheckedValues(nature, draft.who);
    setCheckedValues(magic, draft.who);
    setCheckedValues(affiliations, draft.affiliations);
    updateNpc();
    updateGender();
    updateDobAlt();
    updateAgePreview();
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
    if (alien.checked) {
      character.alien = true;
    } else {
      delete character.alien;
    }
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

    if (
      fields.dob.validity.badInput ||
      fields.dob.validity.rangeOverflow ||
      fields.dob.validity.rangeUnderflow
    ) {
      fieldError(fields.dob, "Укажите существующую дату рождения.");
    }

    if (fields.dob.value) {
      character.dob = fromDateInput(fields.dob.value);
    } else {
      delete character.dob;
    }

    if (
      dobAltEnabled.checked &&
      (fields.dobAlt.validity.badInput ||
        fields.dobAlt.validity.rangeOverflow ||
        fields.dobAlt.validity.rangeUnderflow)
    ) {
      fieldError(
        fields.dobAlt,
        "Укажите существующую дополнительную дату рождения."
      );
    }

    const dobAlt = dobAltEnabled.checked ? fields.dobAlt.value : "";
    if (dobAlt) {
      character.dobAlt = fromDateInput(dobAlt);
    } else {
      delete character.dobAlt;
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
  dobAltEnabled.addEventListener("change", updateDobAlt);
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
    updateAgePreview();
    notifyChange();
  };
  fieldset.addEventListener("input", onActivity);
  fieldset.addEventListener("change", onActivity);
  swapDates.addEventListener("click", () => {
    if (!dobAltEnabled.checked || fieldset.matches(":disabled")) {
      return;
    }

    if (fields.dob.validity.badInput || fields.dobAlt.validity.badInput) {
      showStatus("Завершите ввод дат перед обменом.", true);
      return;
    }

    const previousDob = fields.dob.value;
    fields.dob.value = fields.dobAlt.value;
    fields.dobAlt.value = previousDob;
    onActivity();
  });
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
        error instanceof Error ? error.message : "Проверьте поля формы.",
        true
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

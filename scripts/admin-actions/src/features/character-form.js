import { getMainProfileOptionsMarkup } from "../helpers/markup";

/** @typedef {{ id?: unknown, main?: unknown }} ExistingCharacter */

const getCharacters = () => {
  const { characters } =
    /** @type {Window & { characters?: Record<string, ExistingCharacter> }} */ (
      window
    );
  if (
    !characters ||
    typeof characters !== "object" ||
    Array.isArray(characters)
  ) {
    return {};
  }

  return characters;
};

/** @param {string} value @returns {number | null} */
const parseNumericId = (value) => {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const id = Number(trimmed);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

/** Wires the character form controls. @param {HTMLDialogElement} dialog */
export const initCharacterForm = (dialog) => {
  const form = dialog.querySelector("form");
  if (!form) {
    return;
  }

  const name = form.querySelector("#ce-name");
  const ru = form.querySelector("#ce-ru");
  const fc = form.querySelector("#ce-fc");
  const id = form.querySelector("#ce-id");
  const anketa = form.querySelector("#ce-anketa");
  const main = form.querySelector("#ce-main");
  const npc = form.querySelector("#ce-npc");
  const isMain = form.querySelector("#ce-main-is-main");
  const genderFemale = form.querySelector("#ce-gender-f");
  const magic = form.querySelector("#ce-who-magic");
  const status = form.querySelector("#ce-form-status");
  const resetButton = form.querySelector("#ce-reset");
  const idLink = form.querySelector("#ce-id-link");
  const anketaLink = form.querySelector("#ce-anketa-link");
  const mainOptionalElement = form.querySelector("#ce-main-optional");
  const mainBodyElement = form.querySelector("#ce-main-body");
  const mainListElement = form.querySelector("#ce-main-list");
  const idFieldElement = form.querySelector("#ce-id-field");
  const anketaHintElement = form.querySelector("#ce-anketa-hint");
  const magicianLabelElement = form.querySelector("#ce-magician-label");
  const cursedLabelElement = form.querySelector("#ce-cursed-label");
  if (
    !(name instanceof HTMLInputElement) ||
    !(ru instanceof HTMLInputElement) ||
    !(fc instanceof HTMLInputElement) ||
    !(id instanceof HTMLInputElement) ||
    !(anketa instanceof HTMLInputElement) ||
    !(main instanceof HTMLInputElement) ||
    !(npc instanceof HTMLInputElement) ||
    !(isMain instanceof HTMLInputElement) ||
    !(genderFemale instanceof HTMLInputElement) ||
    !(magic instanceof HTMLElement) ||
    !(status instanceof HTMLElement) ||
    !(resetButton instanceof HTMLButtonElement) ||
    !(idLink instanceof HTMLAnchorElement) ||
    !(anketaLink instanceof HTMLAnchorElement) ||
    !(mainOptionalElement instanceof HTMLElement) ||
    !(mainBodyElement instanceof HTMLElement) ||
    !(mainListElement instanceof HTMLElement) ||
    !(idFieldElement instanceof HTMLElement) ||
    !(anketaHintElement instanceof HTMLElement) ||
    !(magicianLabelElement instanceof HTMLElement) ||
    !(cursedLabelElement instanceof HTMLElement)
  ) {
    return;
  }
  const fields = {
    name,
    ru,
    fc,
    id,
    anketa,
    main
  };

  const renderMainProfiles = () => {
    const names = Object.entries(getCharacters())
      .filter(([name, character]) => {
        if (
          name === fields.name.value.trim() ||
          typeof character?.id !== "number"
        ) {
          return false;
        }

        return character.main === true || !character.main;
      })
      .map(([name]) => name)
      .sort((a, b) => a.localeCompare(b));
    mainListElement.innerHTML = getMainProfileOptionsMarkup(names);
  };

  const updateMainProfile = () => {
    const expanded = !npc.checked && !isMain.checked;
    mainOptionalElement.classList.toggle("open", expanded);
    mainBodyElement.hidden = !expanded;
    isMain.setAttribute("aria-expanded", String(expanded));
    fields.main.disabled = !expanded;
    if (!expanded) {
      fields.main.value = "";
    }
  };

  const updateLinks = () => {
    const profileId = parseNumericId(fields.id.value);
    idLink.hidden = npc.checked || profileId === null;
    idLink.removeAttribute("href");
    if (!idLink.hidden && profileId !== null) {
      idLink.href = `/profile.php?id=${profileId}`;
    }

    const anketaId = parseNumericId(fields.anketa.value);
    anketaHintElement.textContent = npc.checked ? "ID поста" : "ID темы";

    anketaLink.hidden = anketaId === null;
    anketaLink.removeAttribute("href");
    if (anketaId === null) {
      return;
    }

    anketaLink.href = npc.checked
      ? `/viewtopic.php?pid=${anketaId}#p${anketaId}`
      : `/viewtopic.php?id=${anketaId}`;
  };

  const updateNpc = () => {
    form.classList.toggle("npc-mode", npc.checked);
    fields.id.required = !npc.checked;
    fields.id.disabled = npc.checked;
    isMain.disabled = npc.checked;

    idFieldElement.hidden = npc.checked;
    mainOptionalElement.hidden = npc.checked;

    if (npc.checked) {
      fields.id.value = "";
      isMain.checked = true;
    }

    updateMainProfile();
    updateLinks();
  };

  const updateGenderLabels = () => {
    let magicianLabel = "волшебник";
    let cursedLabel = "Проклят";
    if (genderFemale.checked) {
      magicianLabel = "волшебница";
      cursedLabel = "Проклята";
    }

    magicianLabelElement.textContent = magicianLabel;
    cursedLabelElement.textContent = cursedLabel;
  };

  const getFormState = () => JSON.stringify([...new FormData(form).entries()]);
  let hasValidated = false;
  updateNpc();
  updateGenderLabels();
  renderMainProfiles();
  const initialState = getFormState();

  const updateResetButton = () => {
    resetButton.disabled = getFormState() === initialState && !hasValidated;
  };

  /** @param {string} message @param {boolean} [isError] */
  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("err", isError);
  };

  /** @param {HTMLInputElement} field @param {string} message */
  const setFieldError = (field, message) => {
    field.setCustomValidity(message);
    field
      .closest("[data-config-field]")
      ?.toggleAttribute("data-invalid", Boolean(message));
    if (message) {
      field.setAttribute("aria-invalid", "true");
      return;
    }

    field.removeAttribute("aria-invalid");
  };

  const requiredMessages = {
    name: "Укажите имя",
    ru: "Укажите имя кириллицей",
    fc: "Укажите FC",
    id: "Укажите ID профиля",
    anketa: "Укажите ID анкеты",
    main: ""
  };

  /** @param {boolean} [showSuccess] */
  const validate = (showSuccess = false) => {
    /** @type {HTMLInputElement | null} */
    let firstInvalid = null;
    for (const key of /** @type {(keyof typeof fields)[]} */ (
      Object.keys(fields)
    )) {
      const field = fields[key];
      const value = field.value.trim();
      let message = "";
      if (!field.disabled) {
        if (field.required && !value) {
          message = requiredMessages[key];
        } else if (
          (key === "id" || key === "anketa") &&
          parseNumericId(value) === null
        ) {
          message = `${requiredMessages[key]}: целое положительное число`;
        } else if (
          key === "name" &&
          Object.prototype.hasOwnProperty.call(getCharacters(), value)
        ) {
          message = "Такое имя уже есть";
        }
      }

      setFieldError(field, message);
      if (message && !firstInvalid) {
        firstInvalid = field;
      }
    }

    if (firstInvalid) {
      showStatus(firstInvalid.validationMessage, true);
      return firstInvalid;
    }

    let message = "";
    if (showSuccess) {
      message = "Форма заполнена верно";
    }

    showStatus(message);
    return null;
  };

  isMain.addEventListener("change", () => {
    updateMainProfile();
    if (!fields.main.disabled) {
      renderMainProfiles();
      fields.main.focus();
    }
  });
  npc.addEventListener("change", () => {
    updateNpc();
    if (!npc.checked) {
      fields.id.focus();
    }
  });
  genderFemale.addEventListener("change", updateGenderLabels);
  fields.main.addEventListener("focus", renderMainProfiles);
  fields.name.addEventListener("input", renderMainProfiles);
  magic.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.checked) {
      return;
    }

    for (const checkbox of magic.querySelectorAll("input")) {
      if (checkbox !== target) {
        checkbox.checked = false;
      }
    }
  });

  const onFormActivity = () => {
    updateLinks();
    showStatus("");
    if (hasValidated) {
      validate();
    }

    updateResetButton();
  };
  form.addEventListener("input", onFormActivity);
  form.addEventListener("change", onFormActivity);
  for (const field of [fields.id, fields.anketa]) {
    field.addEventListener("blur", updateLinks);
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        updateLinks();
      }
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hasValidated = true;
    validate(true)?.focus();
    updateResetButton();
  });
  form.addEventListener("reset", () => {
    queueMicrotask(() => {
      updateNpc();
      updateGenderLabels();
      renderMainProfiles();
      hasValidated = false;
      for (const field of Object.values(fields)) {
        setFieldError(field, "");
      }

      showStatus("Изменения сброшены");
      updateResetButton();
      fields.name.focus();
    });
  });
};

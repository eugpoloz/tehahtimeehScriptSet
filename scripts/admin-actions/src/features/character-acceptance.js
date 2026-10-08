import { getConfigFormMarkup } from "../helpers/markup";
import loadAssets from "../helpers/load-assets";
import { createIframe } from "../helpers/iframe";
import {
  findOpeningPost,
  parseCharacterApplication
} from "../helpers/parse-character-application";
import {
  getAcceptanceInput,
  suggestCollectionAddress,
  validateCollectionAddress
} from "../helpers/character-data";
import { readJournal, saveJournal } from "../helpers/acceptance-journal";
import { initCharacterForm } from "./character-form";
import { escapeHtml } from "@teh/utils";
/** @typedef {import('../helpers/character-data').AcceptanceSource} AcceptanceSource */
/** @typedef {import('../helpers/character-data').AcceptanceInput} AcceptanceInput */
/** @typedef {import('../helpers/acceptance-journal').AcceptanceJournal} AcceptanceJournal */
/** @typedef {import('./character-form').CharacterFormValues} CharacterFormValues */
/** @typedef {import('./character-form').CharacterFormDraft} CharacterFormDraft */
/** @typedef {{id: string, title: string, run: (context: import('./save-character-config').AcceptanceContext) => Promise<void>}} AcceptanceStep */
/**
 * @typedef {object} ApplicationState
 * @property {AcceptanceSource} source
 * @property {CharacterFormValues} initialValues
 * @property {string[]} notes
 * @property {string[]} errors
 * @property {AcceptanceStep[]} steps
 * @property {AcceptanceJournal | null} journal
 * @property {CharacterFormDraft} [draft]
 * @property {string} [addressDraft]
 * @property {() => void} [onVerified]
 * @property {Record<string, 'waiting' | 'running' | 'complete' | 'failed'>} progress
 */
/**
 * @typedef {object} CharacterAcceptance
 * @property {(topicId: number) => Promise<Element>} openingPost
 * @property {(post: Element, source: AcceptanceSource, steps: AcceptanceStep[], onVerified?: () => void) => void} open
 */

/** @param {{stylesUrl?: string}} config @returns {Promise<CharacterAcceptance>} */
const createCharacterAcceptance = async (config) => {
  await loadAssets(config);
  const container = document.querySelector(".punbb") || document.body;
  container.insertAdjacentHTML("beforeend", getConfigFormMarkup());
  const dialog = /** @type {HTMLDialogElement} */ (
    container.querySelector("#accept-new-full-character-dialog")
  );
  const progressDialog = /** @type {HTMLDialogElement} */ (
    container.querySelector("#anfc-progress-dialog")
  );
  const form = /** @type {HTMLFormElement} */ (dialog.querySelector("form"));
  const heading = /** @type {HTMLElement} */ (
    dialog.querySelector("#anfc-dialog-title")
  );
  const notes = /** @type {HTMLElement} */ (
    dialog.querySelector("#anfc-notes")
  );
  const progress = /** @type {HTMLOListElement} */ (
    progressDialog.querySelector("#anfc-progress")
  );
  const status = /** @type {HTMLElement} */ (
    progressDialog.querySelector("#anfc-progress-status")
  );
  const errors = /** @type {HTMLElement} */ (
    dialog.querySelector("#anfc-errors")
  );
  const save = /** @type {HTMLButtonElement} */ (
    form.querySelector('button[type="submit"]')
  );
  const letterReview = /** @type {HTMLElement} */ (
    progressDialog.querySelector("#anfc-letter-review")
  );
  const letterResend = /** @type {HTMLInputElement} */ (
    progressDialog.querySelector("#anfc-letter-resend")
  );
  const retry = /** @type {HTMLButtonElement} */ (
    progressDialog.querySelector("#anfc-retry")
  );
  const fields = /** @type {HTMLFieldSetElement} */ (
    form.querySelector("fieldset")
  );
  const reset = /** @type {HTMLButtonElement} */ (
    form.querySelector("#char-form-reset")
  );
  const collectionField = /** @type {HTMLElement} */ (
    form.querySelector("#anfc-collection")
  );
  const addressInput = /** @type {HTMLInputElement} */ (
    form.querySelector("#anfc-address")
  );
  const buttons = [
    ...dialog.querySelectorAll("button"),
    ...progressDialog.querySelectorAll("button")
  ];

  const iframe = createIframe();
  /** @type {Map<string, ApplicationState>} */
  const applications = new Map();
  /** @type {ApplicationState | null} */
  let active = null;
  let busy = false;
  /** @type {ReturnType<typeof initCharacterForm>} */
  let characterForm;
  const updateControls = () => {
    const frozen =
      busy ||
      active?.journal?.configState === "pending" ||
      active?.journal?.configState === "complete";
    fields.disabled = frozen;
    form.setAttribute("aria-busy", String(busy));
    progressDialog.setAttribute("aria-busy", String(busy));
    for (const button of buttons) {
      button.disabled = busy;
    }
    save.disabled = frozen;
    const addressChanged =
      active?.addressDraft !== undefined &&
      active.addressDraft !==
        suggestCollectionAddress(active.initialValues.name);
    reset.disabled = frozen || (!characterForm?.isDirty() && !addressChanged);
    addressInput.disabled =
      busy || (frozen && Boolean(active?.journal?.input.collectionAddress));
    letterReview.hidden = busy || !active?.journal?.letter?.reviewRequired;
    letterResend.disabled = busy;
    retry.hidden =
      busy || !active?.journal || active.journal.configState === "waiting";
  };
  const updateCollectionAddress = () => {
    if (!characterForm || !active) {
      return;
    }

    const draft = characterForm.getDraft();
    collectionField.hidden = draft.npc;
    if (active.addressDraft === undefined) {
      addressInput.value =
        active.journal?.input.collectionAddress ??
        suggestCollectionAddress(draft.values.name);
    }
    const collectionStep = active.steps.find(
      (step) => step.id === "collection"
    );
    if (collectionStep) {
      if (draft.isMain) {
        collectionStep.title = "Создание личной страницы";
      } else {
        collectionStep.title = "Обновление личной страницы";
      }
    }
  };
  /** @param {AcceptanceInput} input @returns {AcceptanceInput} */
  const reviewAddress = (input) => {
    if (
      input.source.mode === "npc" ||
      typeof input.character.main === "string"
    ) {
      return input;
    }

    const collectionAddress =
      input.collectionAddress ?? addressInput.value.trim();
    try {
      validateCollectionAddress(collectionAddress);
    } catch (error) {
      addressInput.focus();
      throw error;
    }

    return { ...input, collectionAddress };
  };
  const renderProgress = () => {
    if (!active) {
      return;
    }

    const labels = {
      waiting: "Ожидает",
      running: "Выполняется…",
      complete: "Подтверждено",
      failed: "Ошибка"
    };
    progress.innerHTML = active.steps
      .map((step) => {
        const state = active?.progress[step.id] || "waiting";
        return `<li class="char-accept__step char-accept__step--${state}">${escapeHtml(step.title)}: <strong>${labels[state]}</strong></li>`;
      })
      .join("");
  };
  /** @param {AcceptanceInput} input */
  const execute = async (input) => {
    if (busy || !active) {
      return;
    }

    const application = active;
    renderProgress();
    if (!progressDialog.open) {
      progressDialog.showModal();
    }
    busy = true;
    status.classList.remove("char-accept__status--error");
    status.textContent = "Добавление персонажа в конфиг…";
    updateControls();
    try {
      if (
        !application.journal ||
        application.journal.configState === "waiting"
      ) {
        application.journal = { version: 1, input, configState: "waiting" };
        saveJournal(application.journal);
      }
      // Milestone-2 journals have no collection address yet; review it before continuing.
      application.journal.input = input;
      saveJournal(application.journal);
      for (const step of application.steps) {
        status.textContent = `${step.title}…`;
        application.progress[step.id] = "running";
        renderProgress();
        try {
          await step.run({ input, journal: application.journal, iframe });
          application.progress[step.id] = "complete";
          renderProgress();
        } catch (error) {
          application.progress[step.id] = "failed";
          renderProgress();
          const message =
            error instanceof Error
              ? error.message
              : "Не удалось выполнить действие.";
          throw new Error(`${step.title}: ${message}`);
        }
      }
      application.onVerified?.();
      characterForm.refreshMainProfiles();
      status.textContent =
        application.source.mode === "npc"
          ? "NPC внесён в конфиг. Сохранение подтверждено."
          : "Персонаж принят. Конфиг, личная страница, профиль и письмо проверены; анкета перенесена в принятые.";
    } catch (error) {
      status.classList.add("char-accept__status--error");
      status.textContent =
        error instanceof Error
          ? error.message
          : "Не удалось сохранить персонажа.";
    } finally {
      busy = false;
      updateControls();
    }
  };
  characterForm = initCharacterForm(form, {
    onChange: () => {
      if (active && characterForm && !busy) {
        active.draft = characterForm.getDraft();
      }
      updateCollectionAddress();
      updateControls();
    },
    onSubmit: async (values) => {
      if (!active) {
        return;
      }

      await execute(reviewAddress(getAcceptanceInput(values, active.source)));
    }
  });
  retry.addEventListener("click", () => {
    if (active?.journal) {
      try {
        if (active.journal.letter?.reviewRequired) {
          active.journal.letter.resendApproved = letterResend.checked;
          saveJournal(active.journal);
          letterResend.checked = false;
        }
        void execute(reviewAddress(active.journal.input));
      } catch (error) {
        status.classList.add("char-accept__status--error");
        status.textContent =
          error instanceof Error
            ? error.message
            : "Проверьте адрес личной страницы.";
      }
    }
  });
  addressInput.addEventListener("input", () => {
    if (active) {
      active.addressDraft = addressInput.value;
    }
    updateControls();
  });
  form.addEventListener("reset", () => {
    if (active) {
      active.addressDraft = undefined;
      updateCollectionAddress();
      updateControls();
    }
  });
  const close = () => {
    if (!busy) {
      progressDialog.close();
      dialog.close();
    }
  };
  for (const button of buttons) {
    if (button.hasAttribute("data-close-acceptance")) {
      button.addEventListener("click", close);
    }
  }
  for (const modal of [dialog, progressDialog]) {
    modal.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    modal.addEventListener("click", (event) => {
      const bounds = modal.getBoundingClientRect();
      if (
        event.target === modal &&
        (event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom)
      ) {
        close();
      }
    });
  }

  /** @param {Element} post @param {AcceptanceSource} source @param {AcceptanceStep[]} steps @param {() => void} [onVerified] */
  const open = (post, source, steps, onVerified) => {
    if (busy) {
      return;
    }

    const key = `${source.mode}:${source.topicId}:${source.postId}`;
    let application = applications.get(key);
    if (!application) {
      const extracted = parseCharacterApplication(post, source);
      const journal = readJournal(source);
      application = {
        source,
        initialValues: extracted.values,
        notes: extracted.notes,
        errors: extracted.errors,
        steps,
        onVerified,
        journal,
        progress: {}
      };
      if (journal) {
        application.initialValues = journal.input;
        application.notes.push(
          "Восстановлена операция из этого браузера. Сохранённые шаги будут проверены перед продолжением."
        );
      }
      applications.set(key, application);
    }
    active = application;
    letterResend.checked = false;
    progressDialog
      .querySelector("#anfc-letter-link")
      ?.setAttribute("href", `/viewtopic.php?id=${source.topicId}`);
    const draft = application.draft;
    characterForm.fill(
      application.initialValues.name,
      application.initialValues.character
    );
    if (draft) {
      characterForm.restoreDraft(draft);
    }
    addressInput.value =
      application.journal?.input.collectionAddress ??
      application.addressDraft ??
      suggestCollectionAddress(characterForm.getDraft().values.name);
    updateCollectionAddress();

    if (source.mode === "npc") {
      heading.textContent = "Добавление NPC";
      save.textContent = "Добавить в конфиг";
      retry.textContent = "Проверить сохранение";
    } else {
      heading.textContent = "Принятие персонажа";
      save.textContent = "Принять";
      retry.textContent = "Продолжить принятие";
    }
    const progressHeading = progressDialog.querySelector(
      "#anfc-progress-title"
    );
    if (progressHeading) {
      progressHeading.textContent = heading.textContent;
    }
    errors.textContent = application.errors.join(" ");
    errors.hidden = application.errors.length === 0;
    notes.textContent = application.notes.join(" ");
    status.textContent = "";
    status.classList.remove("char-accept__status--error");
    if (source.mode === "regular") {
      notes.textContent +=
        " Конфиг, личная страница, профиль, письмо и перенос анкеты выполняются по порядку.";
    }
    if (application.journal?.configState === "pending") {
      status.textContent =
        "Предыдущее сохранение не подтверждено. Проверьте его перед повторной отправкой.";
    } else if (application.journal?.configState === "complete") {
      status.textContent =
        "Конфиг ранее сохранён. Кнопка ниже проверит выполненные шаги и продолжит оставшиеся.";
    }
    renderProgress();
    dialog.showModal();
    updateControls();
    characterForm.focus();
    if (
      application.journal?.configState === "pending" ||
      application.journal?.configState === "complete"
    ) {
      progressDialog.showModal();
    }
  };
  /** @param {number} topicId */
  const openingPost = async (topicId) => {
    if (busy) {
      throw new Error("Дождитесь завершения сохранения персонажа.");
    }

    let post = findOpeningPost(document);
    if (!post) {
      const doc = await iframe.load(`/viewtopic.php?id=${topicId}`);
      post = findOpeningPost(doc);
    }
    if (!post) {
      throw new Error(
        "Не найден первый пост темы. Откройте первую страницу и повторите попытку."
      );
    }

    return post;
  };
  return { open, openingPost };
};

/** @type {Promise<CharacterAcceptance> | null} */
let pendingController = null;
/** @param {{stylesUrl?: string}} config */
export const getCharacterAcceptance = (config) => {
  if (!pendingController) {
    pendingController = createCharacterAcceptance(config).catch((error) => {
      pendingController = null;
      throw error;
    });
  }

  return pendingController;
};
